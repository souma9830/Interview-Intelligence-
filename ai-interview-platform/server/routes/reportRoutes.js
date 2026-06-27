const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// Secure all analytical reporting vector ports using JWT protect middleware
router.post('/synthesize', protect, reportController.synthesizeReport);
router.get('/', protect, reportController.listReports);
router.get('/:interviewId', protect, reportController.getReport);

module.exports = router;