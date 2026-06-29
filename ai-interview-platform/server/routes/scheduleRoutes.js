const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, scheduleController.listSchedules);
router.post('/', protect, scheduleController.createSchedule);

module.exports = router;
