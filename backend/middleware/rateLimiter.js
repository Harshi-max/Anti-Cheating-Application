const rateLimit = require('express-rate-limit');

// General API rate limiter (more relaxed)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // was 100
  standardHeaders: true,   // return rate limit info in headers
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

// Auth rate limiter (still strict but slightly higher)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // was 5
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
  message: 'Too many login attempts, please try again later.'
});

// Exam submission rate limiter (higher throughput)
const examLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // was 10
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many exam requests, please slow down.'
});

module.exports = {
  apiLimiter,
  authLimiter,
  examLimiter
};


