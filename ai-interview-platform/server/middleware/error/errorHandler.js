const { sendError } = require('../../utils/apiResponse');
const ErrorTracker = require('../../services/errorTracker');

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

const notFoundHandler = (req, res, _next) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

const globalErrorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;

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
  }

  if (res.headersSent) {
    return;
  }

  const message = isServerError ? 'Internal Server Error' : (err.message || 'An error occurred');
  return sendError(res, message, statusCode, err.details);
};

module.exports = { ApiError, notFoundHandler, globalErrorHandler };