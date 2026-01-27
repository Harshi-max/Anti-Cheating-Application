const mongoose = require('mongoose');

// Stores code submissions for CODING questions, including language and evaluation results.
const submissionSchema = new mongoose.Schema(
  {
    examAttempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamAttempt',
      required: true
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    questionIndex: {
      type: Number,
      required: true
    },
    language: {
      type: String,
      enum: ['cpp', 'java', 'python', 'javascript'],
      required: true
    },
    sourceCode: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'error'],
      default: 'queued'
    },
    score: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 0
    },
    testResults: [
      {
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        executionTimeMs: Number,
        error: String
      }
    ],
    logs: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

submissionSchema.index({ examAttempt: 1, questionIndex: 1, language: 1 });

module.exports = mongoose.model('Submission', submissionSchema);


