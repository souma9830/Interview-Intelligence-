const { sendError } = require('../../utils/apiResponse');

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

/**
 * Handles requests that do not match any registered route.
 */
const notFoundHandler = (req, res, _next) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

const globalErrorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;

  const logPayload = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    message: err.message || 'Internal Server Error',
    ...(req.requestId && { requestId: req.requestId }),
    ...(req.user && { userId: req.user._id }),
    ...(req.ip && { clientIp: req.ip }),
  };

  if (isServerError) {
    console.error('[ErrorHandler] Unhandled server error:', logPayload);
    if (err.stack) {
      console.error(err.stack);
    }
  } else {
    console.warn('[ErrorHandler] Client error:', logPayload);
  }

  if (res.headersSent) {
    return;
  }

  const message = isServerError ? 'Internal Server Error' : (err.message || 'An error occurred');
  return sendError(res, message, statusCode, err.details);
};

module.exports = { ApiError, notFoundHandler, globalErrorHandler };

// Global error formatting logic updated
