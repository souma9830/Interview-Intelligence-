// Removed Resume model import as we are fully stateless
const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractResumeData, analyzeSkillsWithGemini } = require('../services/geminiService');
const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');

/**
 * Resume Upload Flow (from diagram):
 * File Upload → Extract Raw Text → Gemini AI Parsing → Skill Extraction → MongoDB Save
 * POST /api/resume/upload
 */
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide a PDF or DOCX resume file.' });
    }

    const { originalname, buffer, mimetype } = req.file;
    console.log(`[Resume Upload] Received: ${originalname} (${mimetype})`);

    // Step 1: Extract raw text from PDF or DOCX using the shared utility
    let rawText = '';
    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      rawText = await extractTextFromPDF(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else {
      return res.status(400).json({ success: false, message: 'Only PDF and DOCX files are supported.' });
    }

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract readable text from this file. Please try another file.' });
    }

    console.log(`[Resume Upload] Extracted ${rawText.length} characters. Sending to Gemini...`);

    // Step 2: Try Gemini AI first, fall back to local parser if Gemini is unavailable
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

    // Step 3: Save file to disk (use /tmp in serverless environments like Vercel)
    const uploadDir = process.env.VERCEL
      ? '/tmp'
      : path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const tempFileName = `${Date.now()}_${originalname.replace(/\s+/g, '_')}`;
    const tempFilePath = path.join(uploadDir, tempFileName);
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`[Resume Upload] Processed via ${parseSource}. Skills extracted: ${geminiData.skills?.length || 0}`);

    res.status(200).json({
      success: true,
      message: parseSource === 'gemini'
        ? `Resume analyzed by Gemini AI. Extracted ${geminiData.skills?.length || 0} skills.`
        : `Resume analyzed locally (AI temporarily unavailable). Extracted ${geminiData.skills?.length || 0} skills. Your interview will still work normally.`,
      data: {
        id: `stateless_${Date.now()}`,
        fileName: originalname,
        skills: geminiData.skills || [],
        education: geminiData.education || [],
        experience: geminiData.experience || [],
        projects: geminiData.projects || [],
        summary: geminiData.summary || '',
        extractedText: rawText
      }
    });

  } catch (error) {
    console.error('[Resume Upload] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch candidate's stored resume profile
 * GET /api/resume/me
 */
exports.getResume = async (req, res) => {
  try {
    res.status(404).json({ success: false, message: 'Persistent resume profiles are disabled in stateless mode.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      return res.status(400).json({ success: false, message: 'Please paste a complete job description (at least 20 characters).' });
    }

    // In stateless mode, the frontend must pass the resume content to this endpoint
    const { resumeContent } = req.body;
    
    if (!resumeContent) {
      return res.status(400).json({ success: false, message: 'Missing resume content in stateless payload.' });
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

    res.status(200).json({
      success: true,
      message: analysisResult.source === 'local-fallback'
        ? 'Job description analyzed locally (AI temporarily unavailable)'
        : 'Job description analyzed with Gemini AI',
      data: analysisResult
    });

  } catch (error) {
    console.error('[JD Analysis] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
