const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateSessionForRequest } = require('../services/authService');

/**
 * Auth middleware
 * - Verifies JWT signature
 * - Binds JWT to a server-side session (device/user-agent)
 * - Loads the user from DB and attaches to req.user
 *
 * NOTE: All role/authorization checks must use req.user from here,
 * never trusting anything coming from the frontend.
 */
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

    const { valid, reason } = await validateSessionForRequest(decoded, req);
    if (!valid) {
      return res.status(401).json({
        message: 'Session is not valid',
        reason
      });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.auth = {
      userId: decoded.id,
      sessionId: decoded.sessionId
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student role required.' });
  }
  next();
};

module.exports = { auth, isAdmin, isStudent };

