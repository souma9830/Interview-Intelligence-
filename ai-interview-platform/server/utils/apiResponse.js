class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function sendSuccess(res, data = null, statusCode = 200, message = 'OK') {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

function sendCreated(res, data = null, message = 'Resource created successfully') {
  return sendSuccess(res, data, 201, message);
}

function sendError(res, message = 'Internal server error', statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    timestamp: new Date().toISOString()
  });
}

function handleControllerError(res, error, defaultMessage = 'Internal server error') {
  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode);
  }
  console.error(`[API Error] ${defaultMessage}:`, error.message || error);
  return sendError(res, defaultMessage, 500);
}

function paginatedResponse(res, data, total, page, limit, message = 'OK') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = { sendSuccess, sendCreated, sendError, handleControllerError, paginatedResponse };
