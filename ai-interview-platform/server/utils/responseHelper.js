/**
 * Unified API Response Helper
 *
 * This module re-exports from apiResponse.js for backward compatibility.
 * New code should import directly from apiResponse.js.
 */

const {
  sendSuccess,
  sendCreated,
  sendError,
  handleControllerError,
  paginatedResponse,
} = require('./apiResponse');

// Legacy aliases for backward compatibility
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return sendSuccess(res, data, statusCode, message);
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  return sendError(res, message, statusCode, errors);
};

module.exports = {
  // Primary API (preferred)
  sendSuccess,
  sendCreated,
  sendError,
  handleControllerError,
  paginatedResponse,
  // Legacy aliases
  successResponse,
  errorResponse,
};
