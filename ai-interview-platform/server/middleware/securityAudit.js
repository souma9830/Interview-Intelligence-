const logger = require('../services/logger');

const securityAuditLog = (action) => {
  return (req, res, next) => {
    const logEntry = {
      action,
      userId: req.user ? req.user._id || req.user.uid : 'anonymous',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      method: req.method,
      path: req.originalUrl,
      requestId: req.requestId,
    };

    logger.info(`Security audit: ${action}`, logEntry);

    const originalEnd = res.end;
    res.end = function (...args) {
      logEntry.statusCode = res.statusCode;
      logEntry.responseTime = Date.now() - req._startTime;
      if (res.statusCode >= 400) {
        logger.warn(`Security audit failure: ${action}`, logEntry);
      }
      originalEnd.apply(res, args);
    };

    req._startTime = Date.now();
    next();
  };
};

module.exports = { securityAuditLog };