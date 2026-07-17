const express = require('express');
const router = express.Router();
const performBackup = require('../utils/dbBackup');
const { rotateBackups } = require('../services/backupRotation');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/backup', protect, adminOnly, (req, res) => {
  try {
    performBackup();
    const rotationResult = rotateBackups(5);
    res.json({
      success: true,
      message: 'Backup completed successfully',
      rotation: rotationResult
    });
  } catch (error) {
    console.error('[Backup] Failed to start backup:', error.message);
    res.status(500).json({ success: false, message: 'Failed to start backup' });
  }
});

module.exports = router;
