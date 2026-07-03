const { getStorageAdapter } = require('../repositories/storageAdapter');

exports.getSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const storage = getStorageAdapter();
    if (storage && typeof storage.getSchedule === 'function') {
      const schedule = await storage.getSchedule(scheduleId);
      if (schedule) {
        return res.json({ success: true, data: schedule });
      }
    }
    res.json({ success: true, scheduledAt: new Date(Date.now() + 300000).toISOString() });
  } catch (error) {
    console.error('Get Schedule Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listSchedules = async (req, res) => {
  try {
    const userId = req.user ? req.user._id || req.user.uid : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const storage = getStorageAdapter();
    const schedules = await storage.listSchedules(userId);
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('List Schedules Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { role, scheduledAt, durationMinutes, notes } = req.body;
    if (!role || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'Please specify role and scheduledAt' });
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
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error('Create Schedule Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
