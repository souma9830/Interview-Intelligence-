
const express = require('express');
const router = express.Router();
const { logEvent } = require('../utils/telemetryLogger');

router.get('/telemetry/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    recentLogs: [
      { timestamp: new Date().toISOString(), severity: 'high', description: 'Tab switched (Violation)' },
      { timestamp: new Date().toISOString(), severity: 'info', description: 'WebRTC video connected successfully' }
    ]
  });
});

module.exports = router;
      