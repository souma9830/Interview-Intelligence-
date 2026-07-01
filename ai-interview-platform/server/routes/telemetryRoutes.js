const express = require('express');
const router = express.Router();
router.get('/telemetry/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  });
});
module.exports = router;
