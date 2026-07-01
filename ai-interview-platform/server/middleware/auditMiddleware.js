const AuditLog = require('../models/AuditLog');
const auditLogger = (action) => async (req, res, next) => {
  try {
    await AuditLog.create({
      action,
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      details: `${req.method} ${req.originalUrl}`
    });
  } catch (err) {
    console.error("Audit log failed", err);
  }
  next();
};
module.exports = auditLogger;
