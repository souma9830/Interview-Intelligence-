const { GoogleGenerativeAI } = require('@google/generative-ai');

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });
};

/**
 * PATH 1 — Resume Upload Flow
 * Uses Gemini to extract skills, education, experience and projects from raw resume text.
 */
const extractResumeData = async (resumeText) => {
  console.log('[Gemini] Extracting structured profile from resume text...');
  const model = getModel();

  const prompt = `
You are an expert Resume Parser AI. 
Analyze the following resume text and extract all relevant professional information.

Resume Text:
"""
${resumeText.slice(0, 8000)}
"""

Respond ONLY with a valid raw JSON object matching this schema exactly:
{
  "skills": ["array of all technical skills, programming languages, frameworks, tools found"],
  "education": ["array of education entries as readable strings, e.g. 'B.Tech Computer Science - XYZ University (2020-2024)'"],
  "experience": ["array of work experience entries as readable strings, e.g. 'Software Engineer at ABC Corp (2022-2024) - Built REST APIs'"],
  "projects": ["array of project descriptions as readable strings, e.g. 'AI Chatbot - Built with Python and OpenAI API'"],
  "summary": "2-3 sentence professional summary of the candidate"
}

Rules:
- Extract ALL technical skills mentioned (languages, frameworks, tools, cloud, databases)
- Be thorough - do not miss any skills
- Keep strings concise and readable
- Return empty arrays [] if a section is not found
`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  const data = JSON.parse(result.response.text());
  console.log(`[Gemini] Extracted ${data.skills?.length || 0} skills from resume.`);
  return data;
};

/**
 * PATH 2 — Job Description Matching Flow
 * Uses Gemini to compare resume skills against JD requirements.
 */
const analyzeSkillsWithGemini = async (resumeText, jobDescription) => {
  console.log('[Gemini] Analyzing JD match against resume...');
  const model = getModel();

  const prompt = `
You are an expert ATS (Applicant Tracking System) AI and Career Coach.
Compare the candidate's resume against the job description and produce a detailed skill match analysis.

Resume Text:
"""
${resumeText.slice(0, 6000)}
"""

Job Description:
"""
${jobDescription.slice(0, 3000)}
"""

Instructions:
1. Extract ALL technical and professional skills required in the Job Description.
2. Cross-reference with the resume - find matches including synonyms (ReactJS = React, Postgres = PostgreSQL, etc.).
3. List skills from the JD that are missing or weak in the resume.
4. Calculate a realistic match percentage (0-100) based on skill overlap.
5. Write a 2-3 sentence personalized recommendation for the candidate.

Respond ONLY with a valid raw JSON object:
{
  "matchPercentage": <integer 0-100>,
  "jdSkills": ["all skills extracted from the job description"],
  "matchingSkills": ["skills found in both resume and JD"],
  "missingSkills": ["skills in JD but absent/weak in resume"],
  "recommendation": "personalized strategic advice string"
}
`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  const data = JSON.parse(result.response.text());
  data.matchPercentage = Math.min(Math.max(Number(data.matchPercentage) || 20, 10), 100);

  console.log(`[Gemini] JD match: ${data.matchPercentage}%, ${data.matchingSkills?.length} matching, ${data.missingSkills?.length} missing.`);
  return { success: true, source: 'gemini-2.5-flash', ...data };
};

/**
 * PATH 3 — Interview Question Generation
 * Generates resume-personalised technical, HR, and coding questions using Gemini.
 * Called when starting an interview session.
 */
const generateQuestionsFromResume = async ({ role, experience, skills, education, projects, experience: workExp, summary, jobDescription }) => {
  console.log('[Gemini] Generating personalised interview questions from resume profile...');
  const model = getModel();

  const skillsStr = Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'general software skills';
  const educationStr = Array.isArray(education) && education.length > 0 ? education.join('; ') : 'Not specified';
  const projectsStr = Array.isArray(projects) && projects.length > 0 ? projects.slice(0, 3).join('; ') : 'No projects listed';
  const expStr = Array.isArray(workExp) && workExp.length > 0 ? workExp.slice(0, 3).join('; ') : 'No experience listed';

  const prompt = `
You are a senior technical interviewer at a top tech company.
Generate a personalised mock interview question set specifically tailored to THIS candidate's resume.

Candidate Profile:
- Target Role: ${role}
- Experience Level: ${experience}
- Technical Skills: ${skillsStr}
- Education: ${educationStr}
- Work Experience: ${expStr}
- Projects: ${projectsStr}
- Summary: ${summary || 'Not provided'}
- Job Description Context: ${jobDescription ? jobDescription.slice(0, 1500) : 'General role requirements'}

IMPORTANT INSTRUCTIONS:
1. Generate questions that DIRECTLY reference their actual skills, projects, and experience. Do NOT ask generic questions.
2. For example, if they have "Python" in skills, ask about Python specifically. If they have a project, ask about it.
3. Mix difficulty levels appropriate for their stated experience.
4. Generate EXACTLY 5 questions total across categories. For example: 3 technical, 1 HR, 1 coding. Do not exceed 5 questions.

Respond ONLY with a valid raw JSON object. Replace the bracketed text with your actual generated questions:
{
  "technical": [
    "<Insert actual technical question 1 here based on their resume>",
    "<Insert actual technical question 2 here based on their resume>",
    "<Insert actual technical question 3 here based on their resume>"
  ],
  "hr": [
    "<Insert actual HR behavioral question here based on their resume>"
  ],
  "coding": [
    "<Insert actual coding challenge question here based on their resume>"
  ]
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const data = JSON.parse(result.response.text());
    console.log(`[Gemini] Generated ${(data.technical?.length || 0) + (data.hr?.length || 0) + (data.coding?.length || 0)} personalised questions.`);
    return data;
  } catch (err) {
    console.error('[Gemini] Question generation failed:', err.message);
    // Fallback questions if Gemini fails
    return {
      technical: [
        `Explain how you would architect a scalable system using ${skillsStr.split(',')[0] || 'your primary stack'}.`,
        `What design patterns do you find most useful in your work, and why?`,
        `How do you approach debugging a performance issue in production?`,
        `Walk me through your development workflow when starting a new feature.`
      ],
      hr: [
        `Tell me about a challenging project from your background and how you overcame obstacles.`,
        `How do you stay updated with new technologies in your field?`,
        `Describe a situation where you had to collaborate closely with a team under a tight deadline.`
      ],
      coding: [
        `Write a function that finds all duplicate elements in an array and returns them with their occurrence count. Optimize for O(N) time complexity.`
      ]
    };
  }
};

/**
 * PATH 4 — Answer Evaluation Flow
 * Gemini evaluates the candidate's spoken answer for a specific question.
 * Returns a score, detailed feedback, and key points the candidate mentioned or missed.
 */
const evaluateAnswer = async ({ question, candidateAnswer, role, category }) => {
  console.log(`[Gemini] Evaluating candidate answer for category: ${category}...`);
  const model = getModel();

  const prompt = `
You are a senior technical interviewer evaluating a candidate's answer during a mock interview.

Role Being Interviewed For: ${role}
Question Category: ${category}
Interview Question: "${question}"
Candidate's Answer: "${candidateAnswer}"

Evaluate this answer thoroughly and fairly.

Respond ONLY with a valid raw JSON object:
{
  "score": <integer 0-10>,
  "verdict": "Excellent" | "Good" | "Average" | "Needs Improvement",
  "strengths": ["key strength 1 from the answer", "key strength 2"],
  "improvements": ["specific area to improve 1", "specific area to improve 2"],
  "missedPoints": ["important concept they forgot to mention 1", "concept 2"],
  "modelAnswer": "A 2-3 sentence ideal answer summary for this question",
  "feedback": "A personalized 2-3 sentence coaching feedback message addressing the candidate directly"
}

Scoring Guide (BE STRICT):
- 9-10: Exceptional - Flawless, deep technical understanding, perfectly explained.
- 7-8: Good - Solid answer, but missed one or two minor technical nuances.
- 5-6: Average - Basic textbook definition, lacking real-world depth or examples.
- 3-4: Below average - Confused, partial answer with major missing concepts.
- 0-2: Poor - Completely wrong or irrelevant answer.

CRITICAL: Do NOT just give a 5/10 by default. Actually evaluate the answer strictly. If they give a generic or vague answer, give them a 3 or 4. If they give an amazing answer, give them an 8 or 9.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const data = JSON.parse(result.response.text());
    data.score = Math.min(Math.max(Number(data.score) || 5, 0), 10);
    console.log(`[Gemini] Answer evaluated. Score: ${data.score}/10, Verdict: ${data.verdict}`);
    return { success: true, ...data };
  } catch (err) {
    console.error('[Gemini] Answer evaluation failed:', err.message);
    return {
      success: false,
      score: 5,
      verdict: 'Average',
      strengths: ['Answer recorded successfully.'],
      improvements: ['Could not auto-evaluate at this time.'],
      missedPoints: [],
      modelAnswer: 'Evaluation unavailable.',
      feedback: 'Your answer was recorded. Please review key concepts and try again.'
    };
  }
};

/**
 * PATH 5 — Final Report Synthesis
 * Gemini evaluates the full interview transcript and generates a comprehensive report.
 */
const synthesizeInterviewReport = async ({ role, experience, qaList }) => {
  console.log('[Gemini] Synthesizing final interview performance report...');
  const model = getModel();

  const transcript = qaList.map((qa, i) =>
    `Q${i + 1} [${qa.category}]: ${qa.questionText}\nAnswer: ${qa.candidateAnswer || '(No answer provided)'}`
  ).join('\n\n');

  const prompt = `
You are a senior hiring manager writing a comprehensive performance report for a candidate interview.

Role: ${role}
Experience Level: ${experience}

Full Interview Transcript:
"""
${transcript.slice(0, 7000)}
"""

Analyze the entire interview performance and generate a detailed report.

Respond ONLY with a valid raw JSON object:
{
  "overallScore": <integer 0-100>,
  "technicalScore": <integer 0-100>,
  "communicationScore": <integer 0-100>,
  "hrScore": <integer 0-100>,
  "strengths": ["strength observation 1", "strength observation 2", "strength observation 3"],
  "weaknesses": ["improvement area 1", "improvement area 2"],
  "breakdown": {
    "technicalDepth": <integer 0-100>,
    "problemSolvingApproach": <integer 0-100>,
    "communicationClarity": <integer 0-100>,
    "domainKnowledge": <integer 0-100>
  },
  "hiringRecommendation": "Strong Hire" | "Hire" | "Maybe" | "No Hire",
  "feedbackReport": "A comprehensive 4-6 sentence personalized feedback message for the candidate covering their performance, specific strengths shown, areas needing work, and next steps for improvement."
}
`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  const data = JSON.parse(result.response.text());
  // Clamp all scores
  data.overallScore = Math.min(Math.max(Number(data.overallScore) || 60, 10), 100);
  data.technicalScore = Math.min(Math.max(Number(data.technicalScore) || 60, 10), 100);
  data.communicationScore = Math.min(Math.max(Number(data.communicationScore) || 60, 10), 100);
  data.hrScore = Math.min(Math.max(Number(data.hrScore) || 60, 10), 100);

  console.log(`[Gemini] Report synthesized. Overall: ${data.overallScore}%, Recommendation: ${data.hiringRecommendation}`);
  return data;
};

/**
 * Simulate compiling and running a candidate's code submission using Gemini.
 * Generates realistic metrics, test cases, and compiler errors.
 */
const evaluateCodingSolution = async (code, language, role, explanation, pistonOutput, pistonError, questionText) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an enterprise-grade strict code compiler analysis engine for ${language}.
Your job is to analyze the user's code and the EXACT real compiler execution output provided.
Use the real execution output to determine the true compilation status and generate 3 realistic test cases.
The candidate was asked to solve the following problem: "${questionText || 'Generic algorithmic challenge for ' + role}".
If the REAL compiler output indicates an error, you MUST fail the compilation check test case using that exact error.
Verify that the submitted code ACTUALLY solves the requested problem. If it doesn't, fail the test cases.

Return ONLY a valid JSON object matching exactly this schema, with no markdown formatting or extra text:
{
  "containsSyntaxIssues": <boolean true if the code has syntax errors or would fail to compile>,
  "overallScore": <integer 0-100 representing overall quality>,
  "metrics": {
    "syntaxScore": <integer 0-100>,
    "optimizationScore": <integer 0-100>,
    "explanationScore": <integer 0-100, grade the provided explanation if any>,
    "executionTime": "<string e.g. '12ms' or '0ms' if failed>",
    "memoryConsumed": "<string e.g. '16MB' or '0MB' if failed>"
  },
  "testCases": [
    {
      "name": "Syntax & Compilation Check",
      "passed": <boolean>,
      "duration": "<string e.g. '4ms'>",
      "error": "<Optional string. If failed, provide realistic raw compiler stderr output here>"
    },
    {
      "name": "<Name of realistic test case 2 for the role>",
      "passed": <boolean>,
      "duration": "<string e.g. '15ms'>",
      "error": "<Optional string. If failed, provide runtime exception or assertion failure message>"
    },
    {
      "name": "<Name of realistic edge-case test case 3>",
      "passed": <boolean>,
      "duration": "<string>",
      "error": "<Optional string>"
    }
  ]
}`
  });

  const prompt = `Evaluate the following ${language} code submission for a ${role} position.
  
Problem Description / Task:
"${questionText || 'Generic algorithmic challenge'}"

Candidate's Code:
\`\`\`${language}
${code}
\`\`\`

Candidate's Audio Explanation Transcript:
"${explanation || 'No explanation provided.'}"

REAL Code Execution Output (STDOUT):
\`\`\`
${pistonOutput || 'No output.'}
\`\`\`

REAL Code Execution Error (STDERR):
\`\`\`
${pistonError || 'No errors.'}
\`\`\`
`;

  console.log(`[Gemini] Simulating ${language} execution for role: ${role}...`);
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    let rawText = result.response.text().trim();
    if (rawText.startsWith('\`\`\`json')) rawText = rawText.substring(7);
    if (rawText.startsWith('\`\`\`')) rawText = rawText.substring(3);
    if (rawText.endsWith('\`\`\`')) rawText = rawText.substring(0, rawText.length - 3);

    return JSON.parse(rawText.trim());
  } catch (error) {
    console.error('[Gemini] Code evaluation failed:', error);
    // Safe fallback if Gemini fails
    return {
      containsSyntaxIssues: false,
      overallScore: 50,
      metrics: {
        syntaxScore: 50,
        optimizationScore: 50,
        explanationScore: 50,
        executionTime: 'N/A',
        memoryConsumed: 'N/A'
      },
      testCases: [
        { name: "Fallback Compilation", passed: true, duration: "1ms" },
        { name: "Fallback Test Case", passed: false, duration: "0ms", error: "AI Evaluation Service Offline." }
      ]
    };
  }
};

module.exports = {
  extractResumeData,
  analyzeSkillsWithGemini,
  generateQuestionsFromResume,
  evaluateAnswer,
  synthesizeInterviewReport,
  evaluateCodingSolution
};
