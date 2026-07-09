const ErrorTracker = require('../services/errorTracker');
const { sendSuccess, sendError, handleControllerError } = require('../utils/apiResponse');

exports.listErrors = async (req, res) => {
  try {
    const result = await ErrorTracker.list(req.query);
    return sendSuccess(res, result);
  } catch (error) {
    handleControllerError(res, error, 'Failed to list errors');
  }
};

exports.getErrorStats = async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const stats = await ErrorTracker.getStats(hours);
    return sendSuccess(res, stats);
  } catch (error) {
    handleControllerError(res, error, 'Failed to get error stats');
  }
};

exports.resolveError = async (req, res) => {
  try {
    const { id } = req.params;
    const resolved = await ErrorTracker.resolve(id, req.user?.uid || req.user?._id);
    if (!resolved) {
      return sendError(res, 'Error not found', 404);
    }
    return sendSuccess(res, resolved, 200, 'Error marked as resolved');
  } catch (error) {
    handleControllerError(res, error, 'Failed to resolve error');
  }
};

exports.getErrorDetail = async (req, res) => {
  try {
    const ErrorLog = require('../models/ErrorLog');
    const error = await ErrorLog.findById(req.params.id).lean();
    if (!error) {
      return sendError(res, 'Error not found', 404);
    }
    return sendSuccess(res, error);
  } catch (error) {
    handleControllerError(res, error, 'Failed to get error detail');
  }
};