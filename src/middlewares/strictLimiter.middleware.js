const rateLimit = require('express-rate-limit');

const strictLimiter = rateLimit({
  windowMs: 2 * 1000,
  limit: 1,
  message: 'Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests, please try again after 10 minutes',
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after 10 minutes',
  },
});

module.exports = {
  strictLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};
