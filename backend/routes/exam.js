const express = require('express');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const auth = require('../middleware/auth');
const { examLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Get all exams assigned to the user
router.get('/assigned', auth, examLimiter, async (req, res) => {
  try {
    const exams = await Exam.find({
      assignedUsers: req.user._id,
      isActive: true
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

    attempt.score = score;
    attempt.endTime = new Date();
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

module.exports = router;

