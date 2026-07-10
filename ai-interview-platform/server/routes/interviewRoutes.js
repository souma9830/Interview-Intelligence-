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

// Set up memory storage parser for multer uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // limit size to 5MB max to prevent large upload buffer exploitation
  }
});

// Secure all interview routing vectors using JWT protect middleware.
// Cache headers are dynamically managed at the controller or CDN level.
router.post('/start', protect, guardScheduleAccess, interviewController.startInterview);
router.post('/start', protect, guardInterviewAccess, interviewController.startInterview);
router.post('/answer', protect, interviewController.submitAnswer);
router.post('/follow-up', protect, interviewController.submitAnswerAndGenerateFollowUp);
router.post('/questions', protect, questionController.generateQuestion);
// Code evaluation endpoints pass through the sandbox security layer
// before reaching the controller. This prevents execution of code
// containing filesystem access, process spawning, or network calls.
router.post('/coding/eval', protect, sandboxMiddleware.validateSandboxPayload, interviewController.evaluateCode);
router.post('/evaluate-answer', protect, interviewController.evaluateAnswerRealtime);
router.post('/telemetry', protect, interviewController.logTelemetry);

// New Resume Analysis route matching PDF file buffers and Job Descriptions
router.post('/analyze-resume', protect, upload.single('resume'), interviewController.analyzeResumeAndMatchSkills);

// Enhanced code execution evaluation middlewares applied

const { routeCacheMiddleware } = require('../middleware/cacheMiddleware');

router.get('/report/:id', routeCacheMiddleware(120), getReport);
router.get('/schedule/:id', routeCacheMiddleware(60), getSchedule);

module.exports = router;
