const { isDatabaseConnected } = require('../utils/database');

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
    res.status(200).json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
};
