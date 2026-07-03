const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const scheduleController = require('../controllers/scheduleController');

router.get('/', protect, scheduleController.listSchedules);
router.post('/', protect, scheduleController.createSchedule);
router.get('/:id', protect, scheduleController.getSchedule);

module.exports = router;
