
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAuditLogs } = require('../controllers/adminController');

router.get('/admin/audit-logs', protect, adminOnly, getAuditLogs);

module.exports = router;
      