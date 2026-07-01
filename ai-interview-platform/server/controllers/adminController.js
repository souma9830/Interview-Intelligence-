
exports.getAuditLogs = async (req, res) => {
  res.json({
    success: true,
    logs: [
      { action: 'USER_LOGIN', user: 'admin@camsense.ai', timestamp: new Date().toISOString() },
      { action: 'RESUME_UPLOAD', user: 'candidate@test.com', timestamp: new Date().toISOString() }
    ]
  });
};
      