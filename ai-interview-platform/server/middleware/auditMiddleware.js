const AuditLog = require('../models/AuditLog');

exports.logAuditTrail = (action) => {
  return async (req, res, next) => {
    try {
      const originalSend = res.send;
      
      res.send = function (body) {
        res.send = originalSend;
        
        // Log asynchronously after response is sent
        const userId = req.user ? req.user._id || req.user.uid || 'anonymous' : 'anonymous';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        AuditLog.create({
          userId,
          action,
          ipAddress,
          userAgent: req.headers['user-agent'],
          details: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode
          }
        }).catch(err => console.error('[Audit Log Middleware] Failed to create log:', err.message));

        return originalSend.apply(this, arguments);
      };

      next();
    } catch (error) {
      console.error('[Audit Log Middleware] Setup error:', error.message);
      next();
    }
  };
};
