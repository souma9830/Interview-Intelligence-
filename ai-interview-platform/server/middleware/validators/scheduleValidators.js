const { body, param } = require('express-validator');

const createScheduleValidator = [
  body('role').trim().isLength({ min: 2, max: 200 }).withMessage('Role is required'),
  body('scheduledAt').isISO8601().withMessage('Valid ISO 8601 date is required'),
  body('durationMinutes').optional().isInt({ min: 15, max: 180 }).withMessage('Duration must be 15-180 minutes'),
  body('notes').optional().trim().isLength({ max: 2000 }),
];

const scheduleIdValidator = [
  param('id').isString().trim().notEmpty().withMessage('Schedule ID is required'),
];

module.exports = {
  createScheduleValidator,
  scheduleIdValidator,
};