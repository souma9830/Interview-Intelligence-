const { getStorageAdapter } = require('../repositories/storageAdapter');
const { sendSuccess, sendCreated, sendError, handleControllerError } = require('../utils/apiResponse');

exports.getSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const storage = getStorageAdapter();
    if (storage && typeof storage.getSchedule === 'function') {
      const schedule = await storage.getSchedule(scheduleId);
      if (schedule) {
        return sendSuccess(res, schedule);
      }
    }
    sendSuccess(res, { scheduledAt: new Date(Date.now() + 300000).toISOString() });
  } catch (error) {
    handleControllerError(res, error, 'Failed to retrieve schedule');
  }
};

exports.listSchedules = async (req, res) => {
  try {
    const userId = req.user ? req.user._id || req.user.uid : null;
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }
    const storage = getStorageAdapter();
    const schedules = await storage.listSchedules(userId);
    sendSuccess(res, schedules);
  } catch (error) {
    handleControllerError(res, error, 'Failed to list schedules');
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { role, scheduledAt, durationMinutes, notes } = req.body;
    if (!role || !scheduledAt) {
      return sendError(res, 'Please specify role and scheduledAt', 400);
    }
    const userId = req.user ? req.user._id || req.user.uid : 'anonymous';
    const storage = getStorageAdapter();
    const saved = await storage.saveSchedule({
      user: userId,
      role,
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 45,
      notes: notes || '',
    });
    sendCreated(res, saved, 'Schedule created successfully');
  } catch (error) {
    handleControllerError(res, error, 'Failed to create schedule');
  }
};
