const { isDatabaseConnected } = require('../utils/database');
const { sendSuccess, handleControllerError } = require('../utils/apiResponse');
const logger = require('../services/logger');

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
    logger.info('Health check requested', { databaseConnected: isDatabaseConnected() });
    sendSuccess(res, health, 200, 'Service is healthy');
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    handleControllerError(res, error, 'Failed to get health status');
  }
};