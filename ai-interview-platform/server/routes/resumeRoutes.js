const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume, getResume, analyzeJobDescription } = require('../controllers/resumeController');
const { validate } = require('../middleware/validators/validateMiddleware');
const { analyzeJDValidator } = require('../middleware/validators/resumeValidators');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx/;
    const mimetype = file.mimetype;
    const extname = file.originalname.split('.').pop().toLowerCase();

    if (
      mimetype === 'application/pdf' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extname === 'pdf' ||
      extname === 'docx'
    ) {
      return cb(null, true);
    }
    cb(new Error('Only high-fidelity PDF and DOCX resume formats are supported'));
  }
});

const resumeUploadFields = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

router.post('/upload', protect, resumeUploadFields, uploadResume);
router.get('/me', protect, getResume);
router.post('/analyze-jd', protect, analyzeJDValidator, validate, analyzeJobDescription);
router.post('/analyze-jd', protect, analyzeJobDescription);
router.get('/status', protect, async (req, res) => {
  try {
    const userId = req.user ? req.user._id || req.user.uid : null;
    const { getStorageAdapter } = require('../repositories/storageAdapter');
    const storage = getStorageAdapter();
    let resumeData = null;
    if (storage && typeof storage.getResume === 'function') {
      resumeData = await storage.getResume(userId);
    }
    if (!resumeData) {
      const Resume = require('../models/Resume');
      resumeData = await Resume.findOne({ user: userId }).lean();
    }
    res.json({ success: true, data: { hasResume: !!resumeData, resume: resumeData } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;