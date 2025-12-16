const express = require('express');
const router = express.Router();
const { auth, isAdmin, isStudent } = require('../middleware/auth');
const { logViolation, getViolations } = require('../controllers/violationController');
const { validateViolation } = require('../middleware/validator');
const { examLimiter } = require('../middleware/rateLimiter');

// Log violation
router.post('/log', auth, examLimiter, validateViolation, logViolation);

// Get violations for an attempt
router.get('/attempt/:attemptId', auth, getViolations);

module.exports = router;

