const express = require('express');
const { auth, isAdmin, isStudent } = require('../middleware/auth');
const ExamAttempt = require('../models/ExamAttempt');
const Violation = require('../models/Violation');
const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const completedAttempts = await ExamAttempt.countDocuments({
      user: req.user._id,
      $or: [
        { submittedAt: { $exists: true } },
        { status: { $in: ['completed', 'auto_submitted'] } }
      ]
    });

    const totalViolations = await Violation.countDocuments({
      user: req.user._id
    });

    res.json({
      completed: completedAttempts,
      violations: totalViolations
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

