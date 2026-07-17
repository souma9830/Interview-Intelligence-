const { body } = require('express-validator');

const startInterviewValidator = [
  body('role').trim().isLength({ min: 2, max: 200 }).withMessage('Role is required (2-200 chars)'),
  body('experience').trim().isLength({ min: 2, max: 100 }).withMessage('Experience level is required'),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('jobDescription').optional().trim().isLength({ max: 5000 }),
  body('resumeText').optional().trim().isLength({ max: 50000 }),
  body('resumeSkills').optional().isArray(),
  body('resumeEducation').optional().isArray(),
  body('resumeProjects').optional().isArray(),
  body('resumeExperience').optional().isArray(),
];

const submitAnswerValidator = [
  body('questionIndex').isInt({ min: 0 }).withMessage('Valid questionIndex is required'),
  body('answer').trim().isLength({ min: 1, max: 10000 }).withMessage('Answer is required (max 10000 chars)'),
  body('category').optional().isIn(['technical', 'hr', 'coding', 'behavioral']),
];

const evaluateCodeValidator = [
  body('code').trim().isLength({ min: 1, max: 30000 }).withMessage('Code is required (max 30000 chars)'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp']).withMessage('Language must be javascript, python, java, or cpp'),
  body('role').optional().trim().isLength({ max: 200 }),
];

const analyzeResumeValidator = [
  body('jobDescription').optional().trim().isLength({ max: 5000 }),
];

const followUpValidator = [
  body('questionIndex').isInt({ min: 0 }).withMessage('Valid questionIndex is required'),
  body('answer').trim().isLength({ min: 1, max: 10000 }).withMessage('Answer is required'),
];

module.exports = {
  startInterviewValidator,
  submitAnswerValidator,
  evaluateCodeValidator,
  analyzeResumeValidator,
  followUpValidator,
};