const Interview = require('../models/Interview');
const { generateQuestionsFromResume, evaluateAnswer, synthesizeInterviewReport, evaluateCodingSolution } = require('../services/geminiService');

// @desc    Initialize a new mock interview session with Gemini-generated resume-based questions
// @route   POST /api/interview/start
// @access  Private
exports.startInterview = async (req, res) => {
  try {
    const { role, experience, difficulty, jobDescription, resumeSkills, resumeEducation, resumeProjects, resumeExperience, resumeSummary, resumeText } = req.body;
    const userId = req.user ? req.user._id : '664e4ea4a93a40498eb79e2a';

    if (!role || !experience) {
      return res.status(400).json({ success: false, message: 'Please specify target role and experience' });
    }

    console.log(`[Interview Start] Generating Gemini-powered resume-based questions for role: ${role}`);

    // Generate personalised questions from Gemini using the candidate's actual resume profile
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

    // Structure categorized questions array
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

    // Safety fallback
    if (questionsList.length === 0) {
      questionsList.push(
        { questionText: 'Explain major architectural constraints of your primary tech stack.', category: 'technical', candidateAnswer: '' },
        { questionText: 'How do you handle difficult team synchronization challenges?', category: 'hr', candidateAnswer: '' },
        { questionText: 'Write a function to reverse a linked list in-place.', category: 'coding', candidateAnswer: '' }
      );
    }

    const interview = await Interview.create({
      user: userId,
      role,
      experience,
      difficulty: difficulty || 'Medium',
      jobDescription: jobDescription || '',
      questions: questionsList,
      status: 'speaking_active',
    });

    res.status(201).json({
      success: true,
      message: 'Interview session initialized with Gemini-personalized questions',
      data: interview,
    });
  } catch (error) {
    console.error('Start Interview Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit candidate answer and get Gemini real-time evaluation
// @route   POST /api/interview/answer
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answerText } = req.body;

    if (!interviewId || questionIndex === undefined || !answerText) {
      return res.status(400).json({ success: false, message: 'Please specify interviewId, questionIndex, and answerText' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (!interview.questions[questionIndex]) {
      interview.questions.push({ questionText: 'Follow-up query node', candidateAnswer: answerText });
    } else {
      interview.questions[questionIndex].candidateAnswer = answerText;
    }

    await interview.save();

    res.json({
      success: true,
      message: `Answer for question index ${questionIndex} recorded successfully`,
      data: interview,
    });
  } catch (error) {
    console.error('Submit Answer Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Evaluate candidate's answer in real-time using Gemini AI
// @route   POST /api/interview/evaluate-answer
// @access  Private
exports.evaluateAnswerRealtime = async (req, res) => {
  try {
    const { interviewId, questionIndex, candidateAnswer, question, category, role } = req.body;

    if (!candidateAnswer || !question) {
      return res.status(400).json({ success: false, message: 'Please provide candidateAnswer and question' });
    }

    console.log(`[Evaluate] Running Gemini evaluation for Q${questionIndex + 1} - ${category}`);

    // Save the answer to DB if interviewId provided
    if (interviewId && interviewId !== 'demo_session_active' && questionIndex !== undefined) {
      try {
        const interview = await Interview.findById(interviewId);
        if (interview && interview.questions[questionIndex]) {
          interview.questions[questionIndex].candidateAnswer = candidateAnswer;
          await interview.save();
        }
      } catch (dbErr) {
        console.warn('[Evaluate] DB save skipped:', dbErr.message);
      }
    }

    // Run Gemini evaluation
    const evaluation = await evaluateAnswer({
      question,
      candidateAnswer,
      role: role || 'Software Engineer',
      category: category || 'technical'
    });

    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('Real-time Evaluation Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit candidate algorithm code sandbox submission
// @route   POST /api/interview/coding/eval
// @access  Private
exports.evaluateCode = async (req, res) => {
  try {
    const { role, code, language, voiceExplanation, questionText } = req.body;

    if (!role || !code || !language) {
      return res.status(400).json({ success: false, message: 'Please specify role, code submission, and language' });
    }

    console.log(`[Code Evaluator] Executing ${language} code for exact output...`);
    
    let compilerOutput = '';
    let compilerError = '';

    // Check if JDoodle credentials exist for exact compilation
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
          // JDoodle combines stdout/stderr in output, but we can capture it
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

    res.json({
      success: true,
      data: {
        role,
        language,
        overallScore: evaluation.overallScore,
        metrics: evaluation.metrics,
        testCases: evaluation.testCases,
        recommendation: evaluation.overallScore > 80
          ? 'Exceptional architecture. Your code utilizes optimal standard vectors.'
          : 'Enrich code declarations to conform to standard compiler boundaries.',
      }
    });
  } catch (error) {
    console.error('Code Evaluation Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit candidate verbal answer and dynamically generate AI follow-up question using Gemini
// @route   POST /api/interview/follow-up
// @access  Private
exports.submitAnswerAndGenerateFollowUp = async (req, res) => {
  try {
    const { interviewId, questionIndex, candidateAnswer } = req.body;

    if (!interviewId || questionIndex === undefined || !candidateAnswer) {
      return res.status(400).json({ success: false, message: 'Please specify interviewId, questionIndex, and candidateAnswer' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.questions[questionIndex]) {
      interview.questions[questionIndex].candidateAnswer = candidateAnswer;
    }

    const originalQuestionText = interview.questions[questionIndex]
      ? interview.questions[questionIndex].questionText
      : 'General technical capability';

    // Use Gemini for follow-up generation
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    let followUpQuestionText = '';

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are a senior technical interviewer. A candidate answered the following question.
Question: "${originalQuestionText}"
Candidate Answer: "${candidateAnswer}"
Role: ${interview.role}, Experience: ${interview.experience}

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

    const followUpNode = {
      questionText: `[Follow-Up] ${followUpQuestionText}`,
      category: interview.questions[questionIndex] ? interview.questions[questionIndex].category : 'technical',
      candidateAnswer: ''
    };

    interview.questions.splice(questionIndex + 1, 0, followUpNode);
    await interview.save();

    res.json({
      success: true,
      message: 'Answer saved and Gemini follow-up question generated',
      data: {
        followUpQuestion: followUpNode.questionText,
        questions: interview.questions
      }
    });
  } catch (error) {
    console.error('Submit Answer & Follow-up Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
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
      return res.status(400).json({ success: false, message: 'Please provide either a PDF resume upload or raw resume text' });
    }

    const { extractResumeData, analyzeSkillsWithGemini } = require('../services/geminiService');
    
    // Parse resume with Gemini
    const resumeData = await extractResumeData(resumeText);
    
    // Analyze skills with Gemini
    const jdAnalysis = await analyzeSkillsWithGemini(resumeText, jobDescription);

    res.json({
      success: true,
      data: {
        matchPercentage: jdAnalysis.matchPercentage,
        matchingSkills: jdAnalysis.matchingSkills,
        missingSkills: jdAnalysis.missingSkills,
        resumeSkills: resumeData.skills,
        extractedSnippet: resumeText.substring(0, 200) + '...',
        recommendation: jdAnalysis.recommendation,
        parsedProfile: resumeData
      }
    });
  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

