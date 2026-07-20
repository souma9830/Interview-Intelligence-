const express = require('express');
const { getReport } = require('../controllers/reportController');
const { getSchedule } = require('../controllers/scheduleController');
const multer = require('multer');
const router = express.Router();

const interviewController = require('../controllers/interviewController');
const questionController = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');
const { guardScheduleAccess } = require('../middleware/scheduleGuard');
const { guardInterviewAccess } = require('../middleware/interviewGuard');
const sandboxMiddleware = require('../middleware/sandboxMiddleware');
const { validate } = require('../middleware/validators/validateMiddleware');
const {
  startInterviewValidator,
  submitAnswerValidator,
  evaluateCodeValidator,
  analyzeResumeValidator,
  followUpValidator,
} = require('../middleware/validators/interviewValidators');

// Code evaluation and execution routing with sandbox validation middleware
// Set up memory storage parser for multer uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/start', protect, startInterviewValidator, validate, interviewController.startInterview);
router.post('/answer', protect, submitAnswerValidator, validate, interviewController.submitAnswer);
router.post('/follow-up', protect, followUpValidator, validate, interviewController.submitAnswerAndGenerateFollowUp);
// Secure all interview routing vectors using JWT protect middleware.
// Cache headers are dynamically managed at the controller or CDN level.
router.post('/start', protect, guardInterviewAccess, interviewController.startInterview);
router.post('/answer', protect, interviewController.submitAnswer);
router.post('/follow-up', protect, interviewController.submitAnswerAndGenerateFollowUp);
router.post('/questions', protect, questionController.generateQuestion);
router.post('/coding/eval', protect, sandboxMiddleware.validateCodePayload, evaluateCodeValidator, validate, interviewController.evaluateCode);
router.post('/evaluate-answer', protect, interviewController.evaluateAnswerRealtime);
router.post('/telemetry', protect, interviewController.logTelemetry);
router.post('/analyze-resume', protect, upload.single('resume'), analyzeResumeValidator, validate, interviewController.analyzeResumeAndMatchSkills);

const { routeCacheMiddleware } = require('../middleware/cacheMiddleware');

router.get('/report/:id', routeCacheMiddleware(120), getReport);
router.get('/schedule/:id', routeCacheMiddleware(60), getSchedule);

module.exports = router;