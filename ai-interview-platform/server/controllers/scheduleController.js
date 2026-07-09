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
    const now = new Date();
    const enriched = (schedules || []).map(s => ({
      ...s,
      status: new Date(s.scheduledAt) > now ? 'upcoming' : 'past',
      canStart: new Date(s.scheduledAt) <= now && new Date(s.scheduledAt) > new Date(now - (s.durationMinutes || 45) * 60000)
    }));
    sendSuccess(res, enriched);
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
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date()) {
      return sendError(res, 'Scheduled time must be in the future', 400);
    }
    const userId = req.user ? req.user._id || req.user.uid : 'anonymous';
    const storage = getStorageAdapter();
    const saved = await storage.saveSchedule({
      user: userId,
      role,
      scheduledAt: scheduledDate,
      durationMinutes: durationMinutes || 45,
      notes: notes || '',
      status: 'scheduled',
    });
    sendCreated(res, saved, 'Interview scheduled successfully');
  } catch (error) {
    handleControllerError(res, error, 'Failed to create schedule');
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    if (!scheduleId) {
      return sendError(res, 'Schedule ID is required', 400);
    }
    const storage = getStorageAdapter();
    if (storage && typeof storage.deleteSchedule === 'function') {
      await storage.deleteSchedule(scheduleId);
    }
    sendSuccess(res, null, 200, 'Schedule deleted successfully');
  } catch (error) {
    handleControllerError(res, error, 'Failed to delete schedule');
  }
};
