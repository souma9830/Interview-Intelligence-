const { isDatabaseConnected } = require('../utils/database');
const { sendSuccess, handleControllerError } = require('../utils/apiResponse');

exports.getHealthStatus = async (req, res, next) => {
  try {
    const health = {
      status: 'healthy',
      uptime: `${process.uptime().toFixed(2)}s`,
      memory: process.memoryUsage(),
      database: {
        connected: isDatabaseConnected(),
        type: isDatabaseConnected() ? 'mongodb' : 'file-storage',
      },
      timestamp: new Date().toISOString()
    };
    res.status(200).json({ success: true, status: 'UP', data: health });
  } catch (error) {
    handleControllerError(res, error, 'Failed to get health status');
  }
};
