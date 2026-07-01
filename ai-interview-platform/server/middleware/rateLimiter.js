// In-memory rate limiting implementation for stateless lightweight tracking
const limitStore = new Map();

const rateLimiter = (maxRequests = 60, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!limitStore.has(ip)) {
      limitStore.set(ip, []);
    }

    const timestamps = limitStore.get(ip);
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    validTimestamps.push(now);
    limitStore.set(ip, validTimestamps);

    if (validTimestamps.length > maxRequests) {
      const isOtpRoute = req.originalUrl && (req.originalUrl.includes('otp') || req.originalUrl.includes('forgot-password'));
      const message = isOtpRoute 
        ? 'Too many OTP requests. Please try again after 15 minutes.'
        : 'Too many requests. Please try again later.';
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
};

module.exports = rateLimiter;
