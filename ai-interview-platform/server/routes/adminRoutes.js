
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAuditLogs } = require('../controllers/adminController');
const { securityAuditLog } = require('../middleware/securityAudit');
const { sensitiveRateLimiter } = require('../middleware/sensitiveRateLimiter');

const { logAuditTrail } = require('../middleware/auditMiddleware');

router.get('/admin/audit-logs', 
  protect, 
  adminOnly, 
  sensitiveRateLimiter(20, 60000),
  securityAuditLog('VIEW_AUDIT_LOGS'),
  logAuditTrail('VIEW_AUDIT_LOGS'),
  getAuditLogs
);

module.exports = router;
