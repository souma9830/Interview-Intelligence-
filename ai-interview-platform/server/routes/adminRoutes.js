const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const adminCheck = require('../middleware/adminCheck');

router.post('/backup', protect, adminCheck, adminController.triggerBackup);

module.exports = router;
