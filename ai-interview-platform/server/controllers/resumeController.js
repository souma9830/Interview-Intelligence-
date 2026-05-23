const Resume = require('../models/Resume');
const { parseResume } = require('../utils/resumeParser');
const { analyzeSkillsWithGemini } = require('../services/geminiService');
const path = require('path');
const fs = require('fs');

/**
 * Handle candidate resume file upload and heuristic parsing.
 * POST /api/resume/upload
 * Secured by protect middleware
 */
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a PDF or DOCX resume file to upload'
      });
    }

    const { originalname, buffer, mimetype } = req.file;

    // Perform text parsing from buffer
    console.log(`Analyzing file: ${originalname} (${mimetype})`);
    const parsedData = await parseResume(buffer, mimetype);

    // Secure local path storage simulation 
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Save file locally to store it temporarily/persistently
    const tempFileName = `${Date.now()}_${originalname.replace(/\s+/g, '_')}`;
    const tempFilePath = path.join(uploadDir, tempFileName);
    fs.writeFileSync(tempFilePath, buffer);

    // Save parsed details in MongoDB
    // Check if user already has an uploaded resume, if so update it, otherwise create new
    let resume = await Resume.findOne({ user: req.user._id });
    
    if (resume) {
      // Remove old file if it exists
      if (fs.existsSync(resume.filePath)) {
        try { fs.unlinkSync(resume.filePath); } catch (e) {}
      }

      resume.fileName = originalname;
      resume.filePath = tempFilePath;
      resume.extractedText = parsedData.extractedText;
      resume.skills = parsedData.skills;
      resume.education = parsedData.education;
      resume.experience = parsedData.experience;
      resume.projects = parsedData.projects;
      await resume.save();
    } else {
      resume = await Resume.create({
        user: req.user._id,
        fileName: originalname,
        filePath: tempFilePath,
        extractedText: parsedData.extractedText,
        skills: parsedData.skills,
        education: parsedData.education,
        experience: parsedData.experience,
        projects: parsedData.projects
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume parsed and stored in database successfully',
      data: {
        id: resume._id,
        fileName: resume.fileName,
        skills: resume.skills,
        education: resume.education,
        experience: resume.experience,
        projects: resume.projects
      }
    });

  } catch (error) {
    console.error('Resume parsing controller failure:', error);
    res.status(500).json({
      success: false,
      message: 'Parsing failure: ' + error.message
    });
  }
};

/**
 * Fetch candidate's active parsed resume profile
 * GET /api/resume/me
 * Secured by protect middleware
 */
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume profile found for current user'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: resume._id,
        fileName: resume.fileName,
        skills: resume.skills,
        education: resume.education,
        experience: resume.experience,
        projects: resume.projects
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume: ' + error.message
    });
  }
};

/**
 * Correlate and analyze pasted Job Description against stored resume skills.
 * POST /api/resume/analyze-jd
 * Secured by protect middleware
 */
exports.analyzeJobDescription = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a target Job Description to initiate matching correlation'
      });
    }

    // Fetch candidate's active parsed resume profile
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Please upload a resume file before running job description analysis'
      });
    }

    // Run high-fidelity Gemini AI analysis comparing parsed resume text against JD
    const analysisResult = await analyzeSkillsWithGemini(
      resume.extractedText || resume.skills.join(', '), 
      jobDescription
    );

    res.status(200).json({
      success: true,
      message: 'Job description analyzed successfully against resume credentials using Gemini AI',
      data: analysisResult
    });

  } catch (error) {
    console.error('Job description analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Analysis failed: ' + error.message
    });
  }
};
