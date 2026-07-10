const crypto = require('crypto');
const logger = require('../../services/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, `${method} ${originalUrl}`, {
      requestId,
      method,
      path: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      contentLength: res.getHeader('content-length') || 0,
    });
  });

  next();
};

module.exports = requestLogger;