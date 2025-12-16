const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: Number
    },
    isCorrect: {
      type: Boolean
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  violations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Violation'
  }],
  violationCount: {
    type: Number,
    default: 0
  },
  maxViolations: {
    type: Number,
    default: 3
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'flagged', 'auto_submitted'],
    default: 'in_progress'
  },
  submittedAt: {
    type: Date
  },
  isFullscreen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);

