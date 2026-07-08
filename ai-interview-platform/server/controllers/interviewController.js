const { generateQuestionsFromResume, evaluateAnswer, synthesizeInterviewReport, evaluateCodingSolution } = require('../services/geminiService');
const { parseScoreSafe } = require('../utils/geminiParser');
const { getStorageAdapter } = require('../repositories/storageAdapter');
const CustomQuestionSet = require('../models/CustomQuestionSet');
const cacheManager = require('../services/cache/cacheManager');
const { sendSuccess, sendCreated, sendError, handleControllerError } = require('../utils/apiResponse');

// @desc    Initialize a new mock interview session with Gemini-generated resume-based questions
// @route   POST /api/interview/start
// @access  Private
exports.startInterview = async (req, res) => {
  try {
    const { role, experience, difficulty, jobDescription, resumeSkills, resumeEducation, resumeProjects, resumeExperience, resumeSummary, resumeText } = req.body;
    const userId = req.user ? req.user._id : '664e4ea4a93a40498eb79e2a';

    if (!role || !experience) {
      return sendError(res, 'Please specify target role and experience', 400);
    }
    if (!resumeText && (!Array.isArray(resumeSkills) || resumeSkills.length === 0) && !resumeSummary) {
      return sendError(res, 'Please upload and parse a resume before starting an interview session', 400);
    }

    console.log(`[Interview Start] Generating Gemini-powered resume-based questions for role: ${role}`);

    const aiQuestions = await generateQuestionsFromResume({
      role,
      experience,
      skills: resumeSkills || [],
      education: resumeEducation || [],
      projects: resumeProjects || [],
      experience: resumeExperience || [],
      summary: resumeSummary || '',
      jobDescription: jobDescription || ''
    });

    const questionsList = [];

    (aiQuestions.technical || []).forEach(q => {
      questionsList.push({ questionText: q, category: 'technical', candidateAnswer: '' });
    });
    (aiQuestions.hr || []).forEach(q => {
      questionsList.push({ questionText: q, category: 'hr', candidateAnswer: '' });
    });
    (aiQuestions.coding || []).forEach(q => {
      questionsList.push({ questionText: q, category: 'coding', candidateAnswer: '' });
    });

    if (questionsList.length === 0) {
      questionsList.push(
        { questionText: 'Explain major architectural constraints of your primary tech stack.', category: 'technical', candidateAnswer: '' },
        { questionText: 'How do you handle difficult team synchronization challenges?', category: 'hr', candidateAnswer: '' },
        { questionText: 'Write a function to reverse a linked list in-place.', category: 'coding', candidateAnswer: '' }
      );
    }

    const interviewData = {
      _id: 'stateless_' + Date.now(),
      user: userId,
      role,
      experience,
      difficulty: difficulty || 'Medium',
      jobDescription: jobDescription || '',
      resumeSummary: resumeSummary || '',
      resumeSkills: resumeSkills || [],
      questions: questionsList,
      status: 'speaking_active',
    };

    const persisted = await getStorageAdapter().saveInterview(interviewData);

    sendCreated(res, persisted, 'Interview session initialized and persisted successfully');
  } catch (error) {
    handleControllerError(res, error, 'Failed to start interview');
  }
};

// @desc    Submit candidate answer and update database
// @route   POST /api/interview/answer
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answerText } = req.body;

    if (!interviewId || questionIndex === undefined || !answerText) {
      return sendError(res, 'Please specify interviewId, questionIndex, and answerText', 400);
    }

    const storage = getStorageAdapter();
    const interview = await storage.getInterview(interviewId);
    if (interview) {
      if (interview.questions && interview.questions[questionIndex]) {
        interview.questions[questionIndex].candidateAnswer = answerText;
        await storage.saveInterview(interview);
      }
    }

    sendSuccess(res, { _id: interviewId }, 200, `Answer for question index ${questionIndex} saved successfully`);
  } catch (error) {
    handleControllerError(res, error, 'Failed to submit answer');
  }
};

// @desc    Evaluate candidate's answer in real-time using Gemini AI
// @route   POST /api/interview/evaluate-answer
// @access  Private
exports.evaluateAnswerRealtime = async (req, res) => {
  try {
    const { interviewId, questionIndex, candidateAnswer, question, category, role } = req.body;

    if (!candidateAnswer || !question) {
      return sendError(res, 'Please provide candidateAnswer and question', 400);
    }

    console.log(`[Evaluate] Running Gemini evaluation for Q${questionIndex + 1} - ${category}`);

    const evaluation = await evaluateAnswer({
      question,
      candidateAnswer,
      role: role || 'Software Engineer',
      category: category || 'technical'
    });

    sendSuccess(res, evaluation);
  } catch (error) {
    handleControllerError(res, error, 'Failed to evaluate answer');
  }
};

// @desc    Submit candidate algorithm code sandbox submission
// @route   POST /api/interview/coding/eval
// @access  Private
exports.evaluateCode = async (req, res) => {
  try {
    const { role, code, language, voiceExplanation, questionText } = req.body;

    if (!role || !code || !language) {
      return sendError(res, 'Please specify role, code submission, and language', 400);
    }

    const allowedRoles = ['Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'AI / ML Engineer'];
    const allowedLanguages = ['javascript', 'cpp', 'java', 'python'];
    if (!allowedRoles.includes(role)) {
      return sendError(res, 'Invalid or unsupported role track', 400);
    }
    if (!allowedLanguages.includes(language.toLowerCase())) {
      return sendError(res, 'Invalid or unsupported coding language', 400);
    }
    if (code.length > 30000) {
      return sendError(res, 'Code size limit exceeded (maximum 30KB)', 400);
    }

    console.log(`[Code Evaluator] Executing ${language} code for exact output...`);
    
    let compilerOutput = '';
    let compilerError = '';

    if (process.env.JDOODLE_CLIENT_ID && process.env.JDOODLE_CLIENT_SECRET) {
      console.log('[Code Evaluator] JDoodle API credentials found. Executing strictly...');
      const jdoodleLangMap = {
        javascript: { language: 'nodejs', versionIndex: '4' },
        python: { language: 'python3', versionIndex: '4' },
        java: { language: 'java', versionIndex: '4' },
        cpp: { language: 'cpp17', versionIndex: '0' }
      };
      
      const jdoodleConfig = jdoodleLangMap[language] || jdoodleLangMap['javascript'];
      
      try {
        const jdoodleRes = await fetch('https://api.jdoodle.com/v1/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: process.env.JDOODLE_CLIENT_ID,
            clientSecret: process.env.JDOODLE_CLIENT_SECRET,
            script: code,
            language: jdoodleConfig.language,
            versionIndex: jdoodleConfig.versionIndex
          })
        });
        const jdoodleData = await jdoodleRes.json();
        
        if (jdoodleData.error) {
          compilerError = jdoodleData.error;
        } else {
          compilerOutput = jdoodleData.output;
          if (compilerOutput.toLowerCase().includes('error') || compilerOutput.toLowerCase().includes('exception')) {
            compilerError = compilerOutput;
          }
        }
      } catch (e) {
        console.error('[JDoodle] Execution failed:', e.message);
        compilerError = "Execution engine timeout or failure.";
      }
    } else {
      console.warn('[Code Evaluator] JDOODLE_CLIENT_ID missing in .env. Falling back to Gemini LLM execution simulation...');
      compilerOutput = 'No precise compilation possible. Relying on AI simulation fallback.';
    }

    console.log(`[Code Evaluator] Execution phase complete. Passing to Gemini for interview grading...`);

    const evaluation = await evaluateCodingSolution(code, language, role, voiceExplanation, compilerOutput, compilerError, questionText);

    sendSuccess(res, {
      role,
      language,
      overallScore: evaluation.overallScore,
      metrics: evaluation.metrics,
      testCases: evaluation.testCases,
      recommendation: evaluation.overallScore > 80
        ? 'Exceptional architecture. Your code utilizes optimal standard vectors.'
        : 'Enrich code declarations to conform to standard compiler boundaries.',
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to evaluate code');
  }
};

// @desc    Submit candidate verbal answer and dynamically generate AI follow-up question using Gemini
// @route   POST /api/interview/follow-up
// @access  Private
exports.submitAnswerAndGenerateFollowUp = async (req, res) => {
  try {
    const { interviewId, questionIndex, candidateAnswer } = req.body;

    if (questionIndex === undefined || !candidateAnswer) {
      return sendError(res, 'Please specify questionIndex and candidateAnswer', 400);
    }

    const originalQuestionText = req.body.originalQuestionText || 'General technical capability';

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    let followUpQuestionText = '';

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are a senior technical interviewer. A candidate answered the following question.
Question: "${originalQuestionText}"
Candidate Answer: "${candidateAnswer}"
Role: ${req.body.role || 'Software Engineer'}, Experience: ${req.body.experience || 'Mid-Level'}

Generate ONE focused follow-up question that drills deeper into a specific point they mentioned or an important gap in their answer. Return ONLY the question text, nothing else.`;

      const result = await model.generateContent(prompt);
      followUpQuestionText = result.response.text().trim();
    } catch (geminiErr) {
      console.warn('[Gemini] Follow-up generation failed:', geminiErr.message);
    }

    if (!followUpQuestionText) {
      const followUpBackups = [
        `Can you elaborate on how you would handle edge cases and error boundaries in that approach?`,
        `How would you scale that solution if the data volume increased by 100x?`,
        `What trade-offs would you consider when implementing that in a production environment?`
      ];
      followUpQuestionText = followUpBackups[questionIndex % followUpBackups.length];
    }

    sendSuccess(res, {
      followUpQuestion: `[Follow-Up] ${followUpQuestionText}`
    }, 200, 'Gemini follow-up question generated (stateless)');
  } catch (error) {
    handleControllerError(res, error, 'Failed to generate follow-up');
  }
};

// @desc    Upload PDF resume, extract text, correlate skills using Gemini
// @route   POST /api/interview/analyze-resume
// @access  Private
exports.analyzeResumeAndMatchSkills = async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription || '';
    
    let resumeText = '';
    
    if (req.file) {
      const { extractTextFromPDF } = require('../utils/pdfParser');
      resumeText = await extractTextFromPDF(req.file.buffer);
    } else {
      resumeText = req.body.resumeText || '';
    }

    if (!resumeText) {
      return sendError(res, 'Please provide either a PDF resume upload or raw resume text', 400);
    }

    const { extractResumeData, analyzeSkillsWithGemini } = require('../services/geminiService');
    const { parseResumeText } = require('../utils/resumeParser');

    let resumeData;
    try {
      resumeData = await extractResumeData(resumeText);
    } catch (geminiErr) {
      console.warn(`[Analyze Resume] Gemini extraction failed (${geminiErr.message}). Using local parser...`);
      const localData = parseResumeText(resumeText);
      resumeData = { skills: localData.skills || [], education: localData.education || [], experience: localData.experience || [], projects: localData.projects || [], summary: '' };
    }

    let jdAnalysis;
    try {
      jdAnalysis = await analyzeSkillsWithGemini(resumeText, jobDescription);
    } catch (geminiErr) {
      console.warn(`[Analyze Resume] Gemini JD analysis failed (${geminiErr.message}). Using local matching...`);
      const jdLower = (jobDescription || '').toLowerCase();
      const matching = (resumeData.skills || []).filter(s => jdLower.includes(s.toLowerCase()));
      jdAnalysis = {
        matchPercentage: resumeData.skills.length > 0 ? Math.max(Math.round((matching.length / resumeData.skills.length) * 100), 10) : 30,
        matchingSkills: matching,
        missingSkills: (resumeData.skills || []).filter(s => !jdLower.includes(s.toLowerCase())),
        recommendation: 'AI analysis temporarily unavailable. Basic skill matching applied.',
      };
    }

    sendSuccess(res, {
      matchPercentage: jdAnalysis.matchPercentage,
      matchingSkills: jdAnalysis.matchingSkills,
      missingSkills: jdAnalysis.missingSkills,
      resumeSkills: resumeData.skills,
      extractedSnippet: resumeText.substring(0, 200) + '...',
      recommendation: jdAnalysis.recommendation,
      parsedProfile: resumeData
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to analyze resume');
  }
};

// @desc    Log proctored session telemetry event
// @route   POST /api/interview/telemetry
// @access  Private
exports.logTelemetry = async (req, res) => {
  try {
    const { interviewId, timestamp, eventType, description } = req.body;
    const { logEvent } = require('../utils/telemetryLogger');
    logEvent(interviewId, eventType, description, eventType.includes('Violation') ? 'high' : 'info');
    sendSuccess(res, null, 200, 'Telemetry log received statelessly');
  } catch (error) {
    handleControllerError(res, error, 'Failed to log telemetry');
  }
};


