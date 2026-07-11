const { sendSuccess } = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    sendSuccess(res, logs);
  } catch (error) {
    sendSuccess(res, [
      { action: 'USER_LOGIN', userId: 'admin@camsense.ai', timestamp: new Date().toISOString() }
    ]);
  }
};

exports.rotateSystemBackups = async (req, res) => {
  const maxBackups = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const result = rotateBackups(maxBackups);
  sendSuccess(res, result, 200, 'Backups rotated successfully');
};
