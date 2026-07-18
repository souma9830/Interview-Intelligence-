const logger = require('../services/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Reads the requestId from the response's underlying request object.
 * Safe to call even if requestLogger middleware hasn't run yet.
 * @param {import('express').Response} res
 * @returns {string|undefined}
 */
function getRequestId(res) {
  return res.req?.requestId;
}

/**
 * Sends a standardised successful JSON response.
 * Includes requestId in the body so distributed log tracing works without
 * header inspection on the client side.
 */
function sendSuccess(res, data = null, statusCode = 200, message = 'OK') {
  const body = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  const requestId = getRequestId(res);
  if (requestId) {
    body.requestId = requestId;
  }
  return res.status(statusCode).json(body);
}

function sendCreated(res, data = null, message = 'Resource created successfully') {
  return sendSuccess(res, data, 201, message);
}

/**
 * Sends a standardised error JSON response.
 * Always includes requestId if available so the client can quote it when
 * reporting the error to support or logging systems.
 */
function sendError(res, message = 'Internal server error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) {
    response.errors = errors;
  }
  const requestId = getRequestId(res);
  if (requestId) {
    response.requestId = requestId;
  }
  return res.status(statusCode).json(response);
}

function handleControllerError(res, error, defaultMessage = 'Internal server error') {
  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode);
  }
  logger.error(`Controller error: ${defaultMessage}`, {
    error: error.message,
    stack: error.stack,
    requestId: getRequestId(res),
  });
  return sendError(res, defaultMessage, 500);
}

function paginatedResponse(res, data, total, page, limit, message = 'OK') {
  const body = {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
    timestamp: new Date().toISOString(),
  };
  const requestId = getRequestId(res);
  if (requestId) {
    body.requestId = requestId;
  }
  return res.status(200).json(body);
}

module.exports = {
  AppError,
  sendSuccess,
  sendCreated,
  sendError,
  handleControllerError,
  paginatedResponse,
};
