const { getStorageAdapter } = require('../repositories/storageAdapter');

const ALLOWED_ROLES = ['Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'AI / ML Engineer'];

exports.listSchedules = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : '664e4ea4a93a40498eb79e2a';
    const schedules = await getStorageAdapter().listSchedules(userId);
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('List Schedules Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { role, scheduledAt, durationMinutes, notes } = req.body;
    const userId = req.user ? req.user._id : '664e4ea4a93a40498eb79e2a';

    if (!role || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'Please specify role and scheduledAt' });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid or unsupported role track' });
    }

    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ success: false, message: 'scheduledAt must be a valid date-time value' });
    }
    if (date.getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: 'Interview schedule must be in the future' });
    }

    const safeDuration = Number(durationMinutes) || 45;
    if (safeDuration < 15 || safeDuration > 180) {
      return res.status(400).json({ success: false, message: 'durationMinutes must be between 15 and 180' });
    }

    const schedule = await getStorageAdapter().saveSchedule({
      _id: `schedule_${Date.now()}`,
      user: userId,
      role,
      scheduledAt: date.toISOString(),
      durationMinutes: safeDuration,
      notes: notes ? String(notes).slice(0, 500) : '',
      status: 'scheduled',
    });

    res.status(201).json({ success: true, message: 'Interview scheduled successfully', data: schedule });
  } catch (error) {
    console.error('Create Schedule Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
