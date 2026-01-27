const mongoose = require('mongoose');

// Question schema now supports both MCQ and CODING types.
// Existing MCQ questions continue to work unchanged.
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['MCQ', 'CODING'],
    default: 'MCQ'
  },
  // Common prompt text
  question: {
    type: String,
    required: true
  },
  // MCQ-specific fields
  options: [
    {
      type: String,
      required: function () {
        return this.type === 'MCQ';
      }
    }
  ],
  correctAnswer: {
    type: Number,
    required: function () {
      return this.type === 'MCQ';
    },
    min: 0
  },
  // CODING-specific fields
  languages: [
    {
      type: String,
      enum: ['cpp', 'java', 'python', 'javascript']
    }
  ],
  starterCode: {
    type: Map,
    of: String, // key = language ('cpp','java','python','javascript')
    default: {}
  },
  // Hidden test cases are evaluated on the backend only.
  testCases: [
    {
      input: {
        type: String,
        required: true
      },
      expectedOutput: {
        type: String,
        required: true
      },
      weight: {
        type: Number,
        default: 1
      },
      isSample: {
        type: Boolean,
        default: false
      }
    }
  ],
  maxScore: {
    type: Number,
    default: 0 // 0 means use exam-level default if desired
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  questions: [questionSchema],
  duration: {
    type: Number,
    required: true, // in minutes
    default: 60
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);

