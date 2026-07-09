const { getStorageAdapter } = require('../repositories/storageAdapter');

const guardScheduleAccess = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id || req.user.uid : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const storage = getStorageAdapter();
    const schedules = await storage.listSchedules(userId);
    const now = new Date();

    const validSchedule = (schedules || []).find(s => {
      const scheduledAt = new Date(s.scheduledAt);
      const durationMs = (s.durationMinutes || 45) * 60 * 1000;
      const windowStart = new Date(scheduledAt.getTime() - 5 * 60 * 1000);
      const windowEnd = new Date(scheduledAt.getTime() + durationMs);
      return now >= windowStart && now <= windowEnd;
    });

    if (validSchedule) {
      req.activeSchedule = validSchedule;
      return next();
    }

    const upcomingCount = (schedules || []).filter(s => new Date(s.scheduledAt) > now).length;

    return res.status(403).json({
      success: false,
      message: 'No active interview schedule found. Please schedule an interview session first.',
      hasUpcoming: upcomingCount > 0,
      upcomingCount
    });
  } catch (err) {
    console.error('[ScheduleGuard] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to verify schedule' });
  }
};

module.exports = { guardScheduleAccess };