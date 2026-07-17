const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractResumeData, analyzeSkillsWithGemini } = require('../services/geminiService');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');
const { sendSuccess, sendError, handleControllerError } = require('../utils/apiResponse');

/**
 * Resume Upload Flow (from diagram):
 * File Upload → Extract Raw Text → Gemini AI Parsing → Skill Extraction → MongoDB Save
 * POST /api/resume/upload
 */
exports.uploadResume = async (req, res) => {
  try {
    const uploadedFile = req.file || req.files?.resume?.[0] || req.files?.file?.[0];

    if (!uploadedFile) {
      return sendError(res, 'Please provide a PDF or DOCX resume file.', 400);
    }

    const { originalname, buffer, mimetype } = uploadedFile;
    console.log(`[Resume Upload] Received: ${originalname} (${mimetype})`);

    let rawText = '';
    try {
      if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
        rawText = await extractTextFromPDF(buffer);
      } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        originalname.endsWith('.docx')
      ) {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value;
      } else {
        return sendError(res, 'Only PDF and DOCX files are supported.', 400);
      }
    } catch (parseError) {
      console.error(`[Resume Upload] Parsing failed for ${originalname}:`, parseError.message);
      return sendError(res, 'Could not extract text from this file. The document may be corrupted, encrypted, or password-protected. Please upload a valid, unencrypted PDF or DOCX.', 400);
    }

    if (!rawText || rawText.trim().length < 50) {
      return sendError(res, 'Could not extract readable text from this file. Please try another file.', 400);
    }

    console.log(`[Resume Upload] Extracted ${rawText.length} characters. Sending to Gemini...`);

    let geminiData;
    let parseSource = 'gemini';

    try {
      geminiData = await extractResumeData(rawText);
    } catch (geminiErr) {
      console.warn(`[Resume Upload] Gemini unavailable (${geminiErr.message}). Falling back to local parser...`);
      const { parseResumeText } = require('../utils/parsers/resumeParser');
      const localData = parseResumeText(rawText);
      geminiData = {
        skills: localData.skills || [],
        education: localData.education || [],
        experience: localData.experience || [],
        projects: localData.projects || [],
        summary: '',
      };
      parseSource = 'local';
    }

    const uploadDir = process.env.VERCEL
      ? '/tmp'
      : path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const tempFileName = `${Date.now()}_${originalname.replace(/\s+/g, '_')}`;
    const tempFilePath = path.join(uploadDir, tempFileName);
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`[Resume Upload] Processed via ${parseSource}. Skills extracted: ${geminiData.skills?.length || 0}`);

    sendSuccess(res, {
      id: `stateless_${Date.now()}`,
      fileName: originalname,
      skills: geminiData.skills || [],
      education: geminiData.education || [],
      experience: geminiData.experience || [],
      projects: geminiData.projects || [],
      summary: geminiData.summary || '',
      extractedText: rawText
    }, 200, parseSource === 'gemini'
      ? `Resume analyzed by Gemini AI. Extracted ${geminiData.skills?.length || 0} skills.`
      : `Resume analyzed locally (AI temporarily unavailable). Extracted ${geminiData.skills?.length || 0} skills. Your interview will still work normally.`);
  } catch (error) {
    handleControllerError(res, error, 'Failed to upload resume');
  }
};

/**
 * Fetch candidate's stored resume profile
 * GET /api/resume/me
 */
exports.getResume = async (req, res) => {
  try {
    sendError(res, 'Persistent resume profiles are disabled in stateless mode.', 404);
  } catch (error) {
    handleControllerError(res, error, 'Failed to get resume');
  }
};

/**
 * JD Matching Flow (from diagram):
 * Job Description Input → Gemini AI → Skill Extraction & Matching → Results
 * POST /api/resume/analyze-jd
 */
exports.analyzeJobDescription = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 20) {
      return sendError(res, 'Please paste a complete job description (at least 20 characters).', 400);
    }

    const { resumeContent } = req.body;
    
    if (!resumeContent) {
      return sendError(res, 'Missing resume content in stateless payload.', 400);
    }

    let analysisResult;
    try {
      analysisResult = await analyzeSkillsWithGemini(resumeContent, jobDescription);
    } catch (geminiErr) {
      console.warn(`[JD Analysis] Gemini unavailable (${geminiErr.message}). Using local skill matching...`);
      const { parseResumeText } = require('../utils/parsers/resumeParser');
      const resumeData = parseResumeText(resumeContent);
      const jdLower = jobDescription.toLowerCase();
      const matching = resumeData.skills.filter(s => jdLower.includes(s.toLowerCase()));
      const missing = resumeData.skills.length > 0
        ? resumeData.skills.filter(s => !jdLower.includes(s.toLowerCase()))
        : [];
      const matchPct = resumeData.skills.length > 0 ? Math.round((matching.length / Math.max(matching.length + missing.length, 1)) * 100) : 30;
      analysisResult = {
        success: true,
        source: 'local-fallback',
        matchPercentage: Math.max(matchPct, 10),
        jdSkills: [],
        matchingSkills: matching,
        missingSkills: missing,
        recommendation: 'AI analysis is temporarily unavailable. This is a basic skill-matching result.',
      };
    }

    sendSuccess(res, analysisResult, 200, analysisResult.source === 'local-fallback'
      ? 'Job description analyzed locally (AI temporarily unavailable)'
      : 'Job description analyzed with Gemini AI');
  } catch (error) {
    handleControllerError(res, error, 'Failed to analyze job description');
  }
};
