const express = require('express');
const router = express.Router();
const performBackup = require('../utils/dbBackup');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/backup', protect, adminOnly, (req, res) => {
  try {
    performBackup();
    res.json({ success: true, message: 'Backup started successfully' });
  } catch (error) {
    console.error('[Backup] Failed to start backup:', error.message);
    res.status(500).json({ success: false, message: 'Failed to start backup' });
  }
});

module.exports = router;
