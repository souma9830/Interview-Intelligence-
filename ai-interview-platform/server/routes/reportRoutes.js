const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

const { routeCacheMiddleware } = require('../middleware/cacheMiddleware');

router.get('/', protect, routeCacheMiddleware(120), reportController.listReports);
router.post('/synthesize', protect, reportController.synthesizeReport);
router.get('/:id', protect, routeCacheMiddleware(120), reportController.getReport);

module.exports = router;
