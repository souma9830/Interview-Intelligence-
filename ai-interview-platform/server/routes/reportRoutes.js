const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

router.get('/', protect, reportController.listReports);
router.post('/synthesize', protect, reportController.synthesizeReport);
router.get('/:id', protect, reportController.getReport);

module.exports = router;
