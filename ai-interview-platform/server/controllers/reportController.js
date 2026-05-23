const Report = require('../models/Report');
const Interview = require('../models/Interview');
const { synthesizeInterviewReport } = require('../services/geminiService');

// @desc    Synthesize and retrieve detailed performance report using Gemini AI
// @route   POST /api/report/synthesize
// @access  Private
exports.synthesizeReport = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const userId = req.user ? req.user._id : '664e4ea4a93a40498eb79e2a';

    if (!interviewId) {
      return res.status(400).json({ success: false, message: 'Please specify interviewId' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    console.log(`[Report Synthesizer] Calling Gemini to evaluate full transcript for session: ${interviewId}`);

    // Build Q&A list for Gemini - only include answered questions
    const qaList = (interview.questions || []).filter(q => q.candidateAnswer && q.candidateAnswer.trim()).map(q => ({
      questionText: q.questionText,
      candidateAnswer: q.candidateAnswer,
      category: q.category || 'technical'
    }));

    // If no answers recorded, use all questions with empty answers
    const transcript = qaList.length > 0 ? qaList : (interview.questions || []).map(q => ({
      questionText: q.questionText,
      candidateAnswer: q.candidateAnswer || '(No answer provided)',
      category: q.category || 'technical'
    }));

    // Get Gemini-powered evaluation
    const aiReport = await synthesizeInterviewReport({
      role: interview.role,
      experience: interview.experience,
      qaList: transcript
    });

    const breakdown = {
      syntaxAccuracy: aiReport.breakdown?.technicalDepth || aiReport.technicalScore,
      systemScalability: aiReport.breakdown?.problemSolvingApproach || Math.round(aiReport.technicalScore * 0.9),
      verbalCommunication: aiReport.breakdown?.communicationClarity || aiReport.communicationScore,
      complexityOptimization: aiReport.breakdown?.domainKnowledge || Math.round(aiReport.technicalScore * 0.95),
    };

    const feedbackLogs = [
      `Gemini AI completed comprehensive interview evaluation for role: ${interview.role}.`,
      `Overall score: ${aiReport.overallScore}% | Technical: ${aiReport.technicalScore}% | Communication: ${aiReport.communicationScore}%`,
      `Hiring Recommendation: ${aiReport.hiringRecommendation || 'See full report'}`,
    ];

    // Check if report already exists
    let report = await Report.findOne({ interview: interviewId });
    if (!report) {
      report = await Report.create({
        user: userId,
        interview: interviewId,
        overallScore: aiReport.overallScore,
        communicationScore: aiReport.communicationScore,
        technicalScore: aiReport.technicalScore,
        breakdown,
        strengths: aiReport.strengths || [],
        weaknesses: aiReport.weaknesses || [],
        feedbackReport: aiReport.feedbackReport || 'No detailed feedback available.',
        feedbackLogs,
      });
    } else {
      report.overallScore = aiReport.overallScore;
      report.communicationScore = aiReport.communicationScore;
      report.technicalScore = aiReport.technicalScore;
      report.breakdown = breakdown;
      report.strengths = aiReport.strengths || [];
      report.weaknesses = aiReport.weaknesses || [];
      report.feedbackReport = aiReport.feedbackReport || 'No detailed feedback available.';
      report.feedbackLogs = feedbackLogs;
      await report.save();
    }

    interview.status = 'completed';
    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Gemini AI report synthesized successfully',
      data: {
        ...report.toObject(),
        hiringRecommendation: aiReport.hiringRecommendation || 'Hire',
        hrScore: aiReport.hrScore || aiReport.communicationScore,
      },
    });
  } catch (error) {
    console.error('Report Synthesis Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retrieve report details
// @route   GET /api/report/:interviewId
// @access  Private
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findOne({ interview: req.params.interviewId }).populate('interview');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Performance report not found for this session' });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Get Report Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};