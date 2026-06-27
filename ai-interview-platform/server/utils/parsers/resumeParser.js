const mammoth = require('mammoth');
const { extractTextFromPDF } = require('../pdfParser');

// Curated list of popular modern industry skills
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

/**
 * Extracts raw text from a DOCX buffer using mammoth.
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
const extractTextFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('Error parsing DOCX file:', error.message);
    throw new Error('Could not parse DOCX resume format');
  }
};

/**
 * Heuristically extracts structured sections (skills, education, projects, experience) from plain text.
 * @param {string} text - The raw extracted text.
 * @returns {Object} Parsed resume details.
 */
const parseResumeText = (text) => {
  if (!text) {
    return { skills: [], education: [], experience: [], projects: [] };
  }

  // 1. Skill Extraction
  const foundSkills = [];
  const textLower = text.toLowerCase();
  
  SKILL_DATABASE.forEach(skill => {
    // Avoid substring false-positives (e.g., "Go" inside "Google") by using word boundaries where appropriate,
    // but handle composite skills (e.g. Node.js) gracefully
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regex;
    
    if (skill.length <= 3) {
      // Short acronyms like C, Go, Git need clear word boundaries
      regex = new RegExp(`\\b${ escaped }\\b`, 'i');
    } else {
      regex = new RegExp(escaped, 'i');
    }

    if (regex.test(text)) {
      foundSkills.push(skill);
    }
  });

  // 2. Section Extraction (Education, Experience, Projects)
  const lines = text.split(/[.\n\r]+/).map(line => line.trim()).filter(line => line.length > 0);
  
  const education = [];
  const experience = [];
  const projects = [];

  let currentSection = '';

  // Keywords that mark section transitions
  const eduKeywords = /\b(education|university|college|school|academic|degree|bachelor|master|b\.tech|m\.tech|b\.sc|m\.sc)\b/i;
  const expKeywords = /\b(experience|employment|work|history|job|career|internship|intern|developer|engineer|analyst|manager)\b/i;
  const projKeywords = /\b(project|projects|portfolio|personal work|applications|github link)\b/i;

  lines.forEach(line => {
    const lineLower = line.toLowerCase();

    // Check if this line triggers a section header change
    if (eduKeywords.test(lineLower) && line.length < 50) {
      currentSection = 'education';
      return;
    } else if (expKeywords.test(lineLower) && line.length < 50) {
      currentSection = 'experience';
      return;
    } else if (projKeywords.test(lineLower) && line.length < 50) {
      currentSection = 'projects';
      return;
    }

    // Assign text lines to currently detected sections
    if (currentSection === 'education' && education.length < 5) {
      if (line.length > 10 && line.length < 150) {
        education.push(line);
      }
    } else if (currentSection === 'experience' && experience.length < 8) {
      if (line.length > 15 && line.length < 250) {
        experience.push(line);
      }
    } else if (currentSection === 'projects' && projects.length < 6) {
      if (line.length > 15 && line.length < 250) {
        projects.push(line);
      }
    }
  });

  // Fallback section populated if sections were not cleanly parsed by transitions
  if (education.length === 0) {
    // Look for lines containing university/college/degree
    lines.forEach(line => {
      if (/(university|college|degree|bachelor|master)/i.test(line) && education.length < 4) {
        if (line.length > 15 && line.length < 120) education.push(line);
      }
    });
  }

  if (experience.length === 0) {
    lines.forEach(line => {
      if (/(engineer|developer|intern|manager|analyst|coordinator)/i.test(line) && experience.length < 5) {
        if (line.length > 20 && line.length < 180) experience.push(line);
      }
    });
  }

  return {
    skills: foundSkills,
    education: [...new Set(education)],
    experience: [...new Set(experience)],
    projects: [...new Set(projects)]
  };
};

/**
 * Main parser coordinator that handles files depending on their mimetype.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<Object>} Extracted and parsed resume data.
 */
const parseResume = async (buffer, mimetype) => {
  let extractedText = '';

  if (mimetype === 'application/pdf') {
    extractedText = await extractTextFromPDF(buffer);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    mimetype === 'application/msword'
  ) {
    extractedText = await extractTextFromDOCX(buffer);
  } else {
    // Plain text or standard text files
    extractedText = buffer.toString('utf-8');
  }

  const parsed = parseResumeText(extractedText);

  return {
    extractedText,
    ...parsed
  };
};

module.exports = {
  parseResume,
  parseResumeText
};
