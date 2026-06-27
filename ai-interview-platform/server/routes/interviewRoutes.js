const express = require('express');
const multer = require('multer');
const router = express.Router();

const interviewController = require('../controllers/interviewController');
const questionController = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

// Set up memory storage parser for multer uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // limit size to 5MB max to prevent large upload buffer exploitation
  }
});

// Secure all interview routing vectors using JWT protect middleware
router.post('/start', protect, interviewController.startInterview);
router.post('/answer', protect, interviewController.submitAnswer);
router.post('/follow-up', protect, interviewController.submitAnswerAndGenerateFollowUp);
router.post('/questions', protect, questionController.generateQuestion);
router.post('/coding/eval', protect, interviewController.evaluateCode);
router.post('/evaluate-answer', protect, interviewController.evaluateAnswerRealtime);
router.post('/telemetry', protect, interviewController.logTelemetry);

// New Resume Analysis route matching PDF file buffers and Job Descriptions
router.post('/analyze-resume', protect, upload.single('resume'), interviewController.analyzeResumeAndMatchSkills);

module.exports = router;