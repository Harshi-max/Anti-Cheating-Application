const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateLogin, validateRegister } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
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

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userId: user.userId },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

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

// Register
router.post('/register', authLimiter, validateRegister, async (req, res) => {
  try {
    const { userId, password, name, email } = req.body;

    if (!userId || !password || !name || !email) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      userId,
      password,
      name,
      email
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, userId: user.userId },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

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
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

