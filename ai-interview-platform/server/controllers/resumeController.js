const Resume = require('../models/Resume');
const { parseResume } = require('../utils/resumeParser');
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

    const resumeSkills = resume.skills || [];

    // Core skills database lists
    const SKILL_DATABASE = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
      'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 'C++', 'C#',
      'Ruby', 'Rails', 'PHP', 'Laravel', 'Go', 'Rust', 'SQL', 'PostgreSQL',
      'MongoDB', 'MySQL', 'Redis', 'Elasticsearch', 'HTML', 'CSS', 'TailwindCSS',
      'Sass', 'Git', 'GitHub', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'Firebase', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science',
      'Data Analytics', 'CI/CD', 'Jenkins', 'GraphQL', 'REST API', 'Figma',
      'UI/UX', 'System Design', 'Agile', 'Scrum', 'Jira', 'Linux'
    ];

    const jdSkills = [];
    const textLower = jobDescription.toLowerCase();

    SKILL_DATABASE.forEach(skill => {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      let regex;
      
      if (skill.length <= 3) {
        regex = new RegExp(`\\b${escaped}\\b`, 'i');
      } else {
        regex = new RegExp(escaped, 'i');
      }

      if (regex.test(jobDescription)) {
        jdSkills.push(skill);
      }
    });

    // Generate matched and missing arrays
    const matchingSkills = resumeSkills.filter(skill => 
      jdSkills.some(jdSkill => jdSkill.toLowerCase() === skill.toLowerCase())
    );

    const missingSkills = jdSkills.filter(jdSkill => 
      !resumeSkills.some(skill => skill.toLowerCase() === jdSkill.toLowerCase())
    );

    // Percentage logic
    let matchPercentage = 0;
    if (jdSkills.length > 0) {
      matchPercentage = Math.round((matchingSkills.length / jdSkills.length) * 100);
    } else {
      matchPercentage = matchingSkills.length > 0 ? 80 : 35;
    }
    matchPercentage = Math.min(Math.max(matchPercentage, 15), 100);

    let recommendation = '';
    if (matchPercentage >= 80) {
      recommendation = 'Exceptional fit alignment! Your resume credentials highly overlay standard targets.';
    } else if (matchPercentage >= 50) {
      recommendation = 'Strong skill correlation. Consider addressing some key missing stacks to stand out.';
    } else {
      recommendation = 'Significant technical overlay gaps. Enhance your active skill arrays with missing tools before applying.';
    }

    res.status(200).json({
      success: true,
      message: 'Job description analyzed successfully against resume credentials',
      data: {
        matchPercentage,
        matchingSkills,
        missingSkills,
        jdSkills,
        recommendation
      }
    });

  } catch (error) {
    console.error('Job description analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Analysis failed: ' + error.message
    });
  }
};
