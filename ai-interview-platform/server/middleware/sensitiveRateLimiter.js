/**
 * Sensitive Endpoint Rate Limiter
 * Stricter rate limiting for admin and security-sensitive operations.
 */

const sensitiveOperations = new Map();

function sensitiveRateLimiter(maxRequests = 10, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.user ? req.user._id || req.user.uid : req.ip;
    const now = Date.now();
    
    if (!sensitiveOperations.has(key)) {
      sensitiveOperations.set(key, { count: 1, windowStart: now });
      return next();
    }

    const record = sensitiveOperations.get(key);
    
    if (now - record.windowStart > windowMs) {
      record.count = 1;
      record.windowStart = now;
      return next();
    }

    record.count++;
    
    if (record.count > maxRequests) {
      console.warn(`[Rate Limit] Sensitive endpoint rate limit exceeded for user: ${key}`);
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - record.windowStart)) / 1000),
      });
    }

    next();
  };
}

module.exports = { sensitiveRateLimiter };
