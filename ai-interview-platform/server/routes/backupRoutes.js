const express = require('express');
const router = express.Router();
const performBackup = require('../utils/dbBackup');
router.post('/backup', (req, res) => {
  performBackup();
  res.json({ message: 'Backup started' });
});
module.exports = router;
