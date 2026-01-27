const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const { validateLogin } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const { createSessionAndToken, invalidateSession } = require('../services/authService');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'Please provide userId and password' });
    }

    // Find user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create backend session bound to this device and issue JWT
    const { token } = await createSessionAndToken(user, req);

    res.json({
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register (simplified validation to reduce frontend failures)
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { userId, password, name, email, role } = req.body;

    if (!userId || !password || !name || !email) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role (no admin code required)
    const finalRole = role === 'admin' ? 'admin' : 'student';

    const user = new User({
      userId,
      password,
      name,
      email,
      role: finalRole
    });

    await user.save();

    const { token } = await createSessionAndToken(user, req);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Logout: invalidate current session so the JWT can no longer be used
router.post('/logout', authLimiter, auth, async (req, res) => {
  try {
    const sessionId = req.auth?.sessionId;
    if (sessionId) {
      await invalidateSession(sessionId);
    }

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password (returns token for now; in production you'd email it)
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak whether email exists
      return res.json({ message: 'If the email exists, a reset link has been generated.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // For your current setup (no email service), return token to display/copy in UI.
    res.json({
      message: 'Password reset token generated.',
      resetToken,
      expiresInMinutes: 15
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'resetToken and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword; // will be hashed by pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

