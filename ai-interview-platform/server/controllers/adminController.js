const { sendSuccess } = require('../utils/apiResponse');

exports.getAuditLogs = async (req, res) => {
  sendSuccess(res, [
    { action: 'USER_LOGIN', user: 'admin@camsense.ai', timestamp: new Date().toISOString() },
    { action: 'RESUME_UPLOAD', user: 'candidate@test.com', timestamp: new Date().toISOString() }
  ]);
};
