const rateLimit = require('express-rate-limit');

const strictLimiter = rateLimit({
    windowMs: 2 * 1000,      // 2 seconds window
    limit: 1,                 // Only 1 request allowed per 2 seconds
    message: "Please wait before trying again.",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = strictLimiter;
