const { sendSuccess } = require('../utils/apiResponse');
const { rotateBackups } = require('../services/backupRotation');

exports.getAuditLogs = async (req, res) => {
  sendSuccess(res, [
    { action: 'USER_LOGIN', user: 'admin@camsense.ai', timestamp: new Date().toISOString() },
    { action: 'RESUME_UPLOAD', user: 'candidate@test.com', timestamp: new Date().toISOString() }
  ]);
};

exports.rotateSystemBackups = async (req, res) => {
  const maxBackups = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const result = rotateBackups(maxBackups);
  sendSuccess(res, result, 200, 'Backups rotated successfully');
};
