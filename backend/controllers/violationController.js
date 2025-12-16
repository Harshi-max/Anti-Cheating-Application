const Violation = require('../models/Violation');
const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam');

const logViolation = async (req, res) => {
  try {
    const { attemptId, type, description, metadata } = req.body;
    const userId = req.user._id;

    // Find the exam attempt
    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    // Determine severity
    let severity = 'medium';
    if (type === 'TAB_SWITCH' || type === 'WINDOW_BLUR') {
      severity = 'high';
    } else if (type === 'FULLSCREEN_EXIT') {
      severity = 'high';
    } else if (type === 'COPY_PASTE') {
      severity = 'high';
    }

    // Create violation
    const violation = new Violation({
      examAttempt: attemptId,
      user: userId,
      exam: attempt.exam,
      type,
      severity,
      description: description || `Violation: ${type}`,
      metadata: metadata || {}
    });

    await violation.save();

    // Update attempt
    attempt.violations.push(violation._id);
    attempt.violationCount += 1;

    // Auto-submit if max violations reached
    if (attempt.violationCount >= attempt.maxViolations) {
      const now = new Date();
      attempt.status = 'auto_submitted';
      attempt.endTime = now;
      attempt.submittedAt = now;

      // Calculate score
      const exam = await Exam.findById(attempt.exam);
      let score = 0;
      attempt.answers.forEach(answer => {
        if (answer.isCorrect) {
          score++;
        }
      });
      attempt.score = score;

      await attempt.save();

      return res.json({
        violation: violation,
        violationCount: attempt.violationCount,
        autoSubmitted: true,
        message: 'Exam auto-submitted due to maximum violations'
      });
    }

    await attempt.save();

    res.json({
      violation: violation,
      violationCount: attempt.violationCount,
      autoSubmitted: false,
      warningsRemaining: attempt.maxViolations - attempt.violationCount
    });
  } catch (error) {
    console.error('Log violation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getViolations = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      user: userId
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Exam attempt not found' });
    }

    const violations = await Violation.find({ examAttempt: attemptId })
      .sort({ createdAt: -1 });

    res.json({
      violations,
      violationCount: attempt.violationCount,
      maxViolations: attempt.maxViolations
    });
  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  logViolation,
  getViolations
};

