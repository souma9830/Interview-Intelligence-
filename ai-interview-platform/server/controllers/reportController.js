const { getStorageAdapter } = require('../repositories/storageAdapter');
const { sendSuccess, sendCreated, sendError, handleControllerError } = require('../utils/apiResponse');

exports.getReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const storage = getStorageAdapter();
    const report = await storage.getReport(reportId);
    if (!report) {
      return sendError(res, 'Report not found', 404);
    }
    sendSuccess(res, report);
  } catch (error) {
    handleControllerError(res, error, 'Failed to retrieve report');
  }
};

exports.listReports = async (req, res) => {
  try {
    const userId = req.user ? req.user._id || req.user.uid : null;
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }
    const storage = getStorageAdapter();
    const reports = await storage.listReports(userId);
    sendSuccess(res, reports);
  } catch (error) {
    handleControllerError(res, error, 'Failed to list reports');
  }
};

exports.synthesizeReport = async (req, res) => {
  try {
    const { interviewId, role, experience, questions, answers, questionScores } = req.body;
    if (!interviewId && (!role || !experience)) {
      return sendError(res, 'Please provide interviewId or role and experience', 400);
    }
    const { synthesizeInterviewReport } = require('../services/geminiService');
    const qaList = (questions || []).map((q, i) => ({
      questionText: q.questionText || q,
      category: q.category || 'technical',
      candidateAnswer: (answers && answers[i]) || '',
    }));
    const scores = (questionScores && questionScores.length === qaList.length) ? questionScores : [];
    let reportData;
    try {
      reportData = await synthesizeInterviewReport({ role, experience, qaList, questionScores: scores });
    } catch (geminiErr) {
      console.warn('[Report] Gemini synthesis failed:', geminiErr.message);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : qaList.length > 0
          ? Math.round(qaList.filter(q => q.candidateAnswer).length / qaList.length * 80 + 20)
          : 75;
      reportData = {
        overallScore: avgScore,
        technicalScore: avgScore,
        communicationScore: Math.max(avgScore - 5, 10),
        hrScore: Math.max(avgScore - 10, 10),
        strengths: ['Demonstrated problem-solving ability', 'Clear communication style'],
        weaknesses: ['Could provide more detailed examples', 'Consider exploring edge cases further'],
        breakdown: {
          technicalDepth: avgScore,
          problemSolvingApproach: Math.min(avgScore + 5, 100),
          communicationClarity: Math.max(avgScore - 5, 10),
          domainKnowledge: avgScore,
        },
        hiringRecommendation: avgScore >= 75 ? 'Hire' : avgScore >= 50 ? 'Maybe' : 'No Hire',
        feedbackReport: 'AI evaluation was temporarily unavailable. Scores are estimated based on response completeness.',
      };
    }
    const storage = getStorageAdapter();
    const saved = await storage.saveReport({
      interviewId,
      user: req.user ? req.user._id || req.user.uid : null,
      role,
      experience,
      ...reportData,
    });
    sendCreated(res, saved, 'Report synthesized successfully');
  } catch (error) {
    handleControllerError(res, error, 'Failed to synthesize report');
  }
};
