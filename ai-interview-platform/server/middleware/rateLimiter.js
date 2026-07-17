const logger = require('../services/logger');

const stores = new Map();

const CLEANUP_INTERVAL_MS = 300000;

setInterval(() => {
  const now = Date.now();
  for (const [storeKey, entries] of stores.entries()) {
    const [key, windowMs] = storeKey.split('|');
    const valid = entries.filter(t => now - t < parseInt(windowMs, 10));
    if (valid.length === 0) {
      stores.delete(storeKey);
    } else {
      stores.set(storeKey, valid);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

const rateLimiter = (maxRequests = 60, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const storeKey = `${ip}|${windowMs}`;
    const now = Date.now();

    if (!stores.has(storeKey)) {
      stores.set(storeKey, []);
    }

    const timestamps = stores.get(storeKey);
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    validTimestamps.push(now);
    stores.set(storeKey, validTimestamps);

    if (validTimestamps.length > maxRequests) {
      const isOtpRoute = req.originalUrl && (req.originalUrl.includes('otp') || req.originalUrl.includes('forgot-password'));
      logger.warn('Rate limit exceeded', { ip, path: req.originalUrl });
      return res.status(429).json({
        success: false,
        message: isOtpRoute
          ? 'Too many OTP requests. Please try again after 15 minutes.'
          : 'Too many requests. Please try again later.',
      });
    }

    next();
  };
};

module.exports = rateLimiter;
