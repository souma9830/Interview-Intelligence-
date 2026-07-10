const { body } = require('express-validator');

const uploadResumeValidator = [
  body('jobDescription').optional().trim().isLength({ max: 5000 }),
];

const analyzeJDValidator = [
  body('jobDescription').trim().isLength({ min: 10, max: 5000 }).withMessage('Job description is required (10-5000 chars)'),
];

module.exports = {
  uploadResumeValidator,
  analyzeJDValidator,
};