const rateLimit = require('express-rate-limit');

const strictLimiter = rateLimit({
  windowMs: 2 * 1000, // 2 seconds window
  limit: 1, // Only 1 request allowed per 2 seconds
  message: 'Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
});

exports.forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests, please try again after 10 minutes',
  },
});

exports.resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after 10 minutes',
  },
});


module.exports = strictLimiter;
