'use strict';

const rateLimit = require('express-rate-limit');

// For multiple instances behind a load balancer, configure a `rate-limit-redis`
// store here instead of the default in-memory store. The in-memory counters are
// separate on each instance, so a client distributed across instances can exceed
// the intended limit.
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const resetTime = req.rateLimit && req.rateLimit.resetTime;
    const retryAfter = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : 1;

    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
});
