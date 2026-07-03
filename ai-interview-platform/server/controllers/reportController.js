const { getStorageAdapter } = require('../repositories/storageAdapter');

exports.getReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const storage = getStorageAdapter();
    const report = await storage.getReport(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Get Report Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listReports = async (req, res) => {
  try {
    const userId = req.user ? req.user._id || req.user.uid : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const storage = getStorageAdapter();
    const reports = await storage.listReports(userId);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('List Reports Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.synthesizeReport = async (req, res) => {
  try {
    const { interviewId, role, experience, questions, answers } = req.body;
    if (!interviewId && (!role || !experience)) {
      return res.status(400).json({ success: false, message: 'Please provide interviewId or role and experience' });
    }
    const { synthesizeInterviewReport } = require('../services/geminiService');
    const qaList = (questions || []).map((q, i) => ({
      questionText: q.questionText || q,
      category: q.category || 'technical',
      candidateAnswer: (answers && answers[i]) || '',
    }));
    let reportData;
    try {
      reportData = await synthesizeInterviewReport({ role, experience, qaList });
    } catch (geminiErr) {
      console.warn('[Report] Gemini synthesis failed:', geminiErr.message);
      const avgScore = qaList.length > 0
        ? Math.round(qaList.filter(q => q.candidateAnswer).length / qaList.length * 80 + 20)
        : 75;
      reportData = {
        overallScore: avgScore,
        technicalScore: avgScore,
        communicationScore: avgScore - 5,
        hrScore: avgScore - 10,
        strengths: ['Demonstrated problem-solving ability', 'Clear communication style'],
        weaknesses: ['Could provide more detailed examples', 'Consider exploring edge cases further'],
        breakdown: {
          technicalDepth: avgScore,
          problemSolvingApproach: avgScore + 5,
          communicationClarity: avgScore - 5,
          domainKnowledge: avgScore,
        },
        hiringRecommendation: avgScore >= 75 ? 'Hire' : 'Maybe',
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
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error('Synthesize Report Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
