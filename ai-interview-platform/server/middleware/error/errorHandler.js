const { sendError } = require('../../utils/apiResponse');
const ErrorTracker = require('../../services/errorTracker');
const logger = require('../../services/logger');

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const notFoundHandler = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

const globalErrorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || err.status || 500;

  if (err.name === 'MulterError') {
    return sendError(res, `Upload error: ${err.message}`, 400);
  }

  if (err.name === 'ValidationError' && err.errors) {
    const fields = Object.keys(err.errors).map(f => ({
      field: f,
      message: err.errors[f].message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: fields,
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'CastError') {
    return sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `Duplicate value for ${field}`, 409);
  }

  const isServerError = statusCode >= 500;
  const message = isServerError ? 'Internal Server Error' : (err.message || 'An error occurred');

  const logMeta = {
    requestId: req.requestId,
    userId: req.user ? req.user._id || req.user.uid : null,
    clientIp: req.ip,
    method: req.method,
    url: req.originalUrl,
  };

  if (isServerError) {
    ErrorTracker.capture(err, {
      level: 'error',
      path: req.originalUrl,
      method: req.method,
      userId: req.user?._id || req.user?.uid,
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    logger.error(err.message, { ...logMeta, stack: err.stack });
  } else {
    logger.warn(err.message, logMeta);
  }

  if (res.headersSent) {
    return;
  }

  return sendError(res, message, statusCode, err.details);
};

module.exports = { ApiError, notFoundHandler, globalErrorHandler };
