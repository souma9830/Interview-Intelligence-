const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Perform intelligent ATS skill matching and keyword extraction using the Gemini API.
 * Falls back to local NLP heuristic extraction if API Key is missing or service calls fail.
 * 
 * @param {string} resumeText - Extracted text content from the resume.
 * @param {string} jobDescription - Pasted Job Description.
 * @returns {Promise<Object>} Formatted correlation alignment metrics.
 */
const analyzeSkillsWithGemini = async (resumeText, jobDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini Service] GEMINI_API_KEY not found in environment, triggering high fidelity local NLP matching fallback.');
    return localMatchingFallback(resumeText, jobDescription);
  }

  try {
    console.log('[Gemini Service] Dispatching payload to Gemini API for high-fidelity matching analysis...');
    
    // Initialize the official SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the extremely fast, highly optimized Gemini 1.5 Flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert AI Resume Analyst and ATS Optimizer. 
Analyze the candidate's Resume Text and match it against the provided target Job Description.

Resume Text:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""

Execute the following requirements:
1. Extract all target technical/professional skills required in the Job Description.
2. Cross-reference the Candidate's Resume to find direct overlays (matching skills) and synonyms (e.g. "ReactJS" overlays "React").
3. Isolate the required technical skills that are missing or weak in the Candidate's Resume.
4. Calculate an authentic overall match percentage (0 to 100) representing skill overlap compatibility.
5. Generate a professional 2-3 sentence strategic recommendation advising the candidate on how to optimize their toolkit.

You MUST respond strictly with a valid raw JSON object. Do not wrap it in markdown code blocks or backticks. The structure of the JSON object must match this schema:
{
  "matchPercentage": <number between 15 and 100>,
  "matchingSkills": [<array of string skill names found in both>],
  "missingSkills": [<array of string skill names requested in JD but missing or weak in resume>],
  "jdSkills": [<array of all core technical skills extracted from the JD>],
  "recommendation": "<strategic recommendation string>"
}
`;

    // Request structured JSON directly from Gemini
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const responseText = result.response.text();
    console.log('[Gemini Service] Response received successfully.');
    
    try {
      const parsedData = JSON.parse(responseText);
      
      // Enforce default boundaries for UI consistency
      if (parsedData.matchPercentage !== undefined) {
        parsedData.matchPercentage = Math.min(Math.max(Number(parsedData.matchPercentage), 15), 100);
      }
      
      return {
        success: true,
        source: 'gemini-api',
        ...parsedData
      };
    } catch (parseErr) {
      console.error('[Gemini Service] Failsafe parsing response text: ', responseText);
      throw parseErr;
    }

  } catch (error) {
    console.error('[Gemini Service] API Exception encountered:', error.message);
    console.warn('[Gemini Service] Triggering high fidelity local NLP matching fallback...');
    return {
      success: true,
      source: 'local-nlp-fallback',
      ...localMatchingFallback(resumeText, jobDescription)
    };
  }
};

/**
 * Dynamic fallback method in case Gemini is offline or not configured.
 */
const localMatchingFallback = (resumeText, jobDescription) => {
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

  const resumeSkills = [];
  const jdSkills = [];
  
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  SKILL_DATABASE.forEach(skill => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let regex;
    if (skill.length <= 3) {
      regex = new RegExp(`\\b${escaped}\\b`, 'i');
    } else {
      regex = new RegExp(escaped, 'i');
    }
    
    if (regex.test(resumeLower)) {
      resumeSkills.push(skill);
    }
    if (regex.test(jdLower)) {
      jdSkills.push(skill);
    }
  });

  const matchingSkills = resumeSkills.filter(skill => 
    jdSkills.some(jdSkill => jdSkill.toLowerCase() === skill.toLowerCase())
  );

  const missingSkills = jdSkills.filter(jdSkill => 
    !resumeSkills.some(skill => skill.toLowerCase() === jdSkill.toLowerCase())
  );

  let matchPercentage = 0;
  if (jdSkills.length > 0) {
    matchPercentage = Math.round((matchingSkills.length / jdSkills.length) * 100);
  } else {
    matchPercentage = matchingSkills.length > 0 ? 80 : 35;
  }
  matchPercentage = Math.min(Math.max(matchPercentage, 15), 100);

  let recommendation = '';
  if (matchPercentage >= 80) {
    recommendation = 'Strong local match. Your credentials highly align with the targets identified.';
  } else if (matchPercentage >= 50) {
    recommendation = 'Moderate overlay compatibility. Adding key technologies will optimize your candidacy.';
  } else {
    recommendation = 'Significant technology overlay gaps. Expand your active tech arrays with missing tools before applying.';
  }

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    jdSkills,
    recommendation
  };
};

module.exports = {
  analyzeSkillsWithGemini
};
