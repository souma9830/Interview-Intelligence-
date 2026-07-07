/**
 * Security Audit Logger
 * Logs access to sensitive endpoints for security monitoring.
 */

const securityAuditLog = (action) => {
  return (req, res, next) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId: req.user ? req.user._id || req.user.uid : 'anonymous',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      method: req.method,
      path: req.originalUrl,
    };

    console.log('[Security Audit]', JSON.stringify(logEntry));

    const originalEnd = res.end;
    res.end = function (...args) {
      logEntry.statusCode = res.statusCode;
      logEntry.responseTime = Date.now() - req._startTime;
      if (res.statusCode >= 400) {
        console.warn('[Security Audit] Failed request:', JSON.stringify(logEntry));
      }
      originalEnd.apply(res, args);
    };

    req._startTime = Date.now();
    next();
  };
};

module.exports = { securityAuditLog };
