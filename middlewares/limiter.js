const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 10 * 15 * 1000, // 15 minutes
  max: 100,
});

module.exports = limiter;
