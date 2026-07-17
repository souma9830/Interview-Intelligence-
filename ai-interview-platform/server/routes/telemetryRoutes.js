const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/telemetry/metrics', protect, adminOnly, (req, res) => {
  try {
    const metrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date().toISOString(),
    };
    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('[Telemetry] Failed to collect metrics:', error.message);
    res.status(500).json({ success: false, message: 'Failed to collect metrics' });
  }
});

module.exports = router;
