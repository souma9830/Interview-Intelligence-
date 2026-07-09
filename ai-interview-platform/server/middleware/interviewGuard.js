const Resume = require('../models/Resume');
const { getStorageAdapter } = require('../repositories/storageAdapter');

const guardInterviewAccess = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id || req.user.uid : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const storage = getStorageAdapter();
    let resumeData = null;

    if (storage && typeof storage.getResume === 'function') {
      resumeData = await storage.getResume(userId);
    }

    if (!resumeData) {
      try {
        resumeData = await Resume.findOne({ user: userId }).lean();
      } catch (e) {
        console.warn('[InterviewGuard] MongoDB resume lookup failed:', e.message);
      }
    }

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'Please upload and parse a resume before starting the interview session'
      });
    }

    req.resumeData = resumeData;
    next();
  } catch (err) {
    console.error('[InterviewGuard] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to verify interview prerequisites' });
  }
};

module.exports = { guardInterviewAccess };