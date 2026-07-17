const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const scheduleController = require('../controllers/scheduleController');
const { validate } = require('../middleware/validators/validateMiddleware');
const { createScheduleValidator, scheduleIdValidator } = require('../middleware/validators/scheduleValidators');

router.get('/', protect, scheduleController.listSchedules);
router.post('/', protect, createScheduleValidator, validate, scheduleController.createSchedule);
router.get('/:id', protect, scheduleIdValidator, validate, scheduleController.getSchedule);
router.post('/', protect, scheduleController.createSchedule);
router.get('/:id', protect, scheduleController.getSchedule);
router.delete('/:id', protect, scheduleController.deleteSchedule);

module.exports = router;