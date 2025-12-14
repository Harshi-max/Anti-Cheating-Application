const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateLogin = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateRegister = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .isLength({ min: 3 })
    .withMessage('User ID must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  handleValidationErrors
];

const validateViolation = [
  body('attemptId')
    .notEmpty()
    .withMessage('Attempt ID is required'),
  body('type')
    .notEmpty()
    .withMessage('Violation type is required')
    .isIn(['TAB_SWITCH', 'WINDOW_BLUR', 'FULLSCREEN_EXIT', 'COPY_PASTE', 'FACE_MOVED', 'FACE_NOT_DETECTED', 'MULTIPLE_FACES'])
    .withMessage('Invalid violation type'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateViolation,
  handleValidationErrors
};

