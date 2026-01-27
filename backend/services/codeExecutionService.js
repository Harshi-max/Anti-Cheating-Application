// Backend-oriented code execution service.
// This file is intentionally backend-authoritative: the frontend only sends
// raw source code + language. All compilation/execution and scoring logic
// runs here or in workers that consume the queue managed by this service.

const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');

// In a full implementation, this would push jobs to BullMQ / Redis and
// execute them inside Docker sandboxes with CPU/memory/time limits and
// no network access. Here we prepare the submission and leave a clear
// extension point for the worker implementation.

/**
 * Enqueue a coding submission for execution.
 * Supported languages: cpp, java, python, javascript.
 */
async function enqueueCodeSubmission({ examId, attemptId, userId, questionIndex, language, sourceCode }) {
  const attempt = await ExamAttempt.findOne({
    _id: attemptId,
    user: userId,
    exam: examId
  });

  if (!attempt) {
    const error = new Error('Exam attempt not found');
    error.status = 404;
    throw error;
  }

  const exam = await Exam.findById(examId);
  if (!exam) {
    const error = new Error('Exam not found');
    error.status = 404;
    throw error;
  }

  const question = exam.questions[questionIndex];
  if (!question || question.type !== 'CODING') {
    const error = new Error('Invalid coding question index');
    error.status = 400;
    throw error;
  }

  if (Array.isArray(question.languages) && question.languages.length > 0) {
    if (!question.languages.includes(language)) {
      const error = new Error('Language not allowed for this question');
      error.status = 400;
      throw error;
    }
  }

  const submission = await Submission.create({
    examAttempt: attempt._id,
    exam: exam._id,
    user: userId,
    questionIndex,
    language,
    sourceCode,
    maxScore: question.maxScore || 0,
    status: 'queued'
  });

  // TODO: push to BullMQ / Redis queue here so a worker can:
  // - run the code in a Docker sandbox for the given language
  // - evaluate against hidden testCases from the question
  // - store testResults, score, logs back on the Submission document

  return submission;
}

module.exports = {
  enqueueCodeSubmission
};


