const express = require('express');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Violation = require('../models/Violation');
const User = require('../models/User');
const { auth, isAdmin, isStudent } = require('../middleware/auth');
const { examLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Get admin stats
router.get('/admin/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalExams = await Exam.countDocuments();
    const activeExams = await Exam.countDocuments({ isActive: true });
    const publishedExams = await Exam.countDocuments({ isPublished: true });
    const totalAttempts = await ExamAttempt.countDocuments();
    const completedAttempts = await ExamAttempt.countDocuments({ submittedAt: { $exists: true } });
    const totalViolations = await Violation.countDocuments();

    res.json({
      totalExams,
      activeExams,
      publishedExams,
      totalAttempts,
      completedAttempts,
      totalViolations
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all exams (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const exams = await Exam.find().populate('assignedUsers', 'name userId');
    res.json(exams);
  } catch (error) {
    console.error('Get all exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create exam (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      questions,
      duration,
      startTime,
      endTime,
      isActive,
      isPublished
    } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }

    const durationMinutes = duration || 60;
    const start = startTime ? new Date(startTime) : new Date();

    // IMPORTANT:
    // duration = time limit for the attempt (minutes)
    // startTime/endTime = availability window for the exam
    // If admin doesn't provide an endTime, default to 30 days from startTime so exams stay available longer.
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

    const exam = new Exam({
      title,
      description,
      questions,
      duration: durationMinutes,
      startTime: start,
      endTime: end,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      isPublished: typeof isPublished === 'boolean' ? isPublished : false
    });

    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update exam (admin only)
router.put('/:examId', auth, isAdmin, async (req, res) => {
  try {
    const { examId } = req.params;
    const updates = req.body;

    // Prevent changing assignedUsers via this route
    delete updates.assignedUsers;

    const exam = await Exam.findByIdAndUpdate(
      examId,
      updates,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update exam status (enable/disable, publish/unpublish)
router.patch('/:examId/status', auth, isAdmin, async (req, res) => {
  try {
    const { examId } = req.params;
    const { isActive, isPublished } = req.body;

    const update = {};
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (typeof isPublished === 'boolean') update.isPublished = isPublished;

    const exam = await Exam.findByIdAndUpdate(
      examId,
      update,
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Update exam status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete exam (admin only)
router.delete('/:examId', auth, isAdmin, async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findByIdAndDelete(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Clean up related attempts and violations
    await ExamAttempt.deleteMany({ exam: examId });
    await Violation.deleteMany({ exam: examId });

    res.json({ message: 'Exam and related data deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all assigned and published exams for students
router.get('/assigned', auth, isStudent, examLimiter, async (req, res) => {
  try {
    const exams = await Exam.find({
      isPublished: true,
      isActive: true,
      assignedUsers: req.user._id
    }).select('-questions.correctAnswer');

    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exam details (without correct answers)
router.get('/:examId', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId)
      .select('-questions.correctAnswer');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is assigned to this exam
    if (!exam.assignedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not assigned to this exam' });
    }

    // Check if exam is in valid timeslot
    const now = new Date();
    if (now < exam.startTime) {
      return res.status(400).json({ 
        message: 'Exam has not started yet',
        startTime: exam.startTime
      });
    }
    if (now > exam.endTime) {
      return res.status(400).json({ 
        message: 'Exam has ended',
        endTime: exam.endTime
      });
    }

    res.json(exam);
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start exam attempt
router.post('/:examId/start', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is assigned
    if (!exam.assignedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not assigned to this exam' });
    }

    // Check timeslot
    const now = new Date();
    if (now < exam.startTime || now > exam.endTime) {
      return res.status(400).json({ message: 'Exam is not available at this time' });
    }

    // Check if attempt already exists
    const existingAttempt = await ExamAttempt.findOne({
      user: req.user._id,
      exam: exam._id,
      status: 'in_progress'
    });

    if (existingAttempt) {
      return res.json({ attemptId: existingAttempt._id, exam });
    }

    // Create new attempt
    const attempt = new ExamAttempt({
      user: req.user._id,
      exam: exam._id,
      totalQuestions: exam.questions.length,
      startTime: now,
      answers: exam.questions.map((_, index) => ({
        questionIndex: index,
        selectedAnswer: null
      }))
    });

    await attempt.save();

    // Return exam without correct answers
    const examData = exam.toObject();
    examData.questions = examData.questions.map(q => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    res.json({ attemptId: attempt._id, exam: examData });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit answer
router.post('/:examId/answer', auth, async (req, res) => {
  try {
    const { attemptId, questionIndex, selectedAnswer } = req.body;

    if (questionIndex === undefined || selectedAnswer === undefined) {
      return res.status(400).json({ message: 'Please provide questionIndex and selectedAnswer' });
    }

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
      exam: req.params.examId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    // Get exam to check correct answer
    const exam = await Exam.findById(req.params.examId);
    const question = exam.questions[questionIndex];
    
    if (!question) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    // Update answer
    const answerIndex = attempt.answers.findIndex(a => a.questionIndex === questionIndex);
    if (answerIndex !== -1) {
      attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
      attempt.answers[answerIndex].isCorrect = selectedAnswer === question.correctAnswer;
    }

    await attempt.save();

    res.json({ message: 'Answer submitted successfully' });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Submit exam
router.post('/:examId/submit', auth, async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      user: req.user._id,
      exam: req.params.examId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    // Calculate score
    const exam = await Exam.findById(req.params.examId);
    let score = 0;
    attempt.answers.forEach(answer => {
      if (answer.isCorrect) {
        score++;
      }
    });

    const now = new Date();
    attempt.score = score;
    attempt.endTime = now;
    attempt.submittedAt = now;
    attempt.status = 'completed';

    await attempt.save();

    res.json({ 
      message: 'Exam submitted successfully',
      score: attempt.score,
      totalQuestions: attempt.totalQuestions
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attempt progress
router.get('/:examId/attempt/:attemptId', auth, async (req, res) => {
  try {
    const attempt = await ExamAttempt.findOne({
      _id: req.params.attemptId,
      user: req.user._id,
      exam: req.params.examId
    }).populate('exam', 'title duration');

    if (!attempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest attempt for results
router.get('/:examId/attempt', auth, async (req, res) => {
  try {
    const attempt = await ExamAttempt.findOne({
      user: req.user._id,
      exam: req.params.examId
    })
      .populate('exam', 'title duration')
      .sort({ createdAt: -1 })
      .limit(1);

    if (!attempt) {
      return res.status(404).json({ message: 'No attempt found' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get completed exams for student
router.get('/student/completed-exams', auth, isStudent, async (req, res) => {
  try {
    const completedAttempts = await ExamAttempt.find({
      user: req.user._id,
      submittedAt: { $exists: true }
    })
    .populate('exam', 'title description')
    .sort({ submittedAt: -1 });

    res.json(completedAttempts);
  } catch (error) {
    console.error('Get student completed exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all completed exams for admin
router.get('/admin/completed-exams', auth, isAdmin, async (req, res) => {
  try {
    const completedAttempts = await ExamAttempt.find({
      submittedAt: { $exists: true }
    })
    .populate('user', 'name userId')
    .populate('exam', 'title description')
    .sort({ submittedAt: -1 });

    res.json(completedAttempts);
  } catch (error) {
    console.error('Get admin completed exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Log violation during exam
router.post('/:examId/violation', auth, isStudent, async (req, res) => {
  try {
    const { type, description } = req.body;
    
    // Find the active exam attempt for this user and exam
    const examAttempt = await ExamAttempt.findOne({
      user: req.user._id,
      exam: req.params.examId,
      submittedAt: { $exists: false }
    });

    if (!examAttempt) {
      return res.status(404).json({ message: 'Active exam attempt not found' });
    }

    // Create violation record
    const violation = new Violation({
      examAttempt: examAttempt._id,
      user: req.user._id,
      exam: req.params.examId,
      type,
      description: description || type
    });

    await violation.save();

    // Update exam attempt violation count
    examAttempt.violations.push(violation._id);
    examAttempt.violationCount += 1;
    await examAttempt.save();

    res.status(201).json({ message: 'Violation logged successfully' });
  } catch (error) {
    console.error('Log violation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get violations for student
router.get('/student/violations', auth, isStudent, async (req, res) => {
  try {
    const violations = await Violation.find({ user: req.user._id })
      .populate('exam', 'title')
      .sort({ timestamp: -1 });

    res.json(violations);
  } catch (error) {
    console.error('Get student violations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all violations for admin
router.get('/admin/violations', auth, isAdmin, async (req, res) => {
  try {
    const violations = await Violation.find()
      .populate('user', 'name userId')
      .populate('exam', 'title')
      .sort({ timestamp: -1 });

    res.json(violations);
  } catch (error) {
    console.error('Get admin violations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get violations for specific exam (admin)
router.get('/admin/violations/exam/:examId', auth, isAdmin, async (req, res) => {
  try {
    const violations = await Violation.find({ exam: req.params.examId })
      .populate('user', 'name userId')
      .populate('exam', 'title')
      .sort({ timestamp: -1 });

    res.json(violations);
  } catch (error) {
    console.error('Get exam violations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get violations for specific student (admin)
router.get('/admin/violations/student/:studentId', auth, isAdmin, async (req, res) => {
  try {
    const violations = await Violation.find({ user: req.params.studentId })
      .populate('user', 'name userId')
      .populate('exam', 'title')
      .sort({ timestamp: -1 });

    res.json(violations);
  } catch (error) {
    console.error('Get student violations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed exam monitoring data (admin)
router.get('/admin/monitoring/:examId', auth, isAdmin, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const totalAttempts = await ExamAttempt.countDocuments({ exam: req.params.examId });
    const completedAttempts = await ExamAttempt.countDocuments({ 
      exam: req.params.examId, 
      submittedAt: { $exists: true } 
    });
    const totalViolations = await Violation.countDocuments({ exam: req.params.examId });

    const studentsAttempted = await ExamAttempt.find({ exam: req.params.examId })
      .populate('user', 'name userId')
      .select('user submittedAt score violationCount');

    res.json({
      exam: {
        id: exam._id,
        title: exam.title,
        description: exam.description
      },
      stats: {
        totalAttempts,
        completedAttempts,
        totalViolations
      },
      studentsAttempted
    });
  } catch (error) {
    console.error('Get exam monitoring error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign exam to users (admin only)
router.post('/:examId/assign', auth, isAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    const exam = await Exam.findById(req.params.examId);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Add users to assignedUsers array if not already present (ObjectId-safe comparison)
    (userIds || []).forEach((userId) => {
      const alreadyAssigned = exam.assignedUsers.some((id) => id.toString() === userId.toString());
      if (!alreadyAssigned) {
        exam.assignedUsers.push(userId);
      }
    });

    await exam.save();
    await exam.populate('assignedUsers', 'name userId email');

    res.json({ 
      message: 'Users assigned successfully',
      exam: exam
    });
  } catch (error) {
    console.error('Assign users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unassign exam from users (admin only)
router.post('/:examId/unassign', auth, isAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    const exam = await Exam.findById(req.params.examId);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Remove users from assignedUsers array
    exam.assignedUsers = exam.assignedUsers.filter(userId => 
      !userIds.includes(userId.toString())
    );

    await exam.save();
    await exam.populate('assignedUsers', 'name userId email');

    res.json({ 
      message: 'Users unassigned successfully',
      exam: exam
    });
  } catch (error) {
    console.error('Unassign users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/admin/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('name userId email');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

