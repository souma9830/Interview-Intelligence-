const { GoogleGenerativeAI } = require('@google/generative-ai');
const { llmCache } = require('./cache/cacheManager');
const { parseGeminiJson, clampScore, parseScoreSafe } = require('../utils/geminiParser');

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

const callGeminiWithRetry = async (model, promptContent, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(promptContent);
      return result;
    } catch (err) {
      const isRetryable = err.message && (err.message.includes('503') || err.message.includes('429') || err.message.includes('high demand') || err.message.includes('overloaded') || err.message.includes('UNAVAILABLE'));
      if (isRetryable && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 8000);
        console.warn(`[Gemini] Attempt ${attempt}/${maxRetries} failed (${err.message}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
};

/**
 * PATH 1 — Resume Upload Flow
 * Uses Gemini to extract skills, education, experience and projects from raw resume text.
 */
const extractResumeData = async (resumeText) => {
  const crypto = require('crypto');
  const cacheKey = `resume_${crypto.createHash('md5').update(resumeText).digest('hex')}`;
  const cached = llmCache.get(cacheKey);
  if (cached) {
    console.log('[Cache] Returning db-cached structured resume profile.');
    return cached;
  }

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

  const result = await callGeminiWithRetry(model, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  let rawText = result.response.text().trim();
  const data = parseGeminiJson(rawText);
  console.log(`[Gemini] Extracted ${data.skills?.length || 0} skills from resume.`);
  llmCache.set(cacheKey, data);
  return data;
};

/**
 * PATH 2 — Job Description Matching Flow
 * Uses Gemini to compare resume skills against JD requirements.
 */
const analyzeSkillsWithGemini = async (resumeText, jobDescription) => {
  const crypto = require('crypto');
  const hashVal = `${resumeText}_${jobDescription}`;
  const cacheKey = `jd_${crypto.createHash('md5').update(hashVal).digest('hex')}`;
  const cached = llmCache.get(cacheKey);
  if (cached) {
    console.log('[Cache] Returning cached JD skill matching report.');
    return cached;
  }

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

  const result = await callGeminiWithRetry(model, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  let rawText = result.response.text().trim();
  const data = parseGeminiJson(rawText);
  data.matchPercentage = clampScore(data.matchPercentage, 10, 100, 20);

  console.log(`[Gemini] JD match: ${data.matchPercentage}%, ${data.matchingSkills?.length} matching, ${data.missingSkills?.length} missing.`);
  const outputData = { success: true, source: 'gemini-2.5-flash', ...data };
  llmCache.set(cacheKey, outputData);
  return outputData;
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

  const focusAreas = [
    'system design and architecture', 'debugging and troubleshooting', 'performance optimization',
    'security best practices', 'testing strategies', 'CI/CD and DevOps', 'code review practices',
    'API design', 'database design and queries', 'scalability challenges', 'microservices patterns',
    'real-time systems', 'data structures deep dive', 'concurrency and parallelism',
    'cloud infrastructure', 'monitoring and observability', 'design patterns', 'refactoring legacy code',
    'edge cases and error handling', 'trade-off analysis'
  ];
  const shuffled = focusAreas.sort(() => Math.random() - 0.5);
  const selectedFocus = shuffled.slice(0, 3).join(', ');

  const difficultyAngles = [
    'Ask one question that starts simple but has deep follow-up layers.',
    'Include a question that requires comparing two approaches and justifying a choice.',
    'Ask one question that involves a real-world scenario with constraints.',
    'Include a question where the candidate must identify a flaw in a given approach.',
    'Ask a question that requires the candidate to estimate or do back-of-envelope math.',
    'Include a question about handling failure modes or edge cases in production.',
  ];
  const selectedAngle = difficultyAngles[Math.floor(Math.random() * difficultyAngles.length)];

  const sessionSeed = Math.random().toString(36).substring(2, 10);

  const prompt = `
You are a senior technical interviewer at a top tech company.
Generate a COMPLETELY NEW and UNIQUE set of personalised mock interview questions specifically tailored to THIS candidate's resume.

Session ID: ${sessionSeed} (use this to ensure uniqueness — every session must produce entirely different questions)

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
5. CRITICAL: You MUST generate DIFFERENT questions every single time. Never repeat the same questions across sessions.
6. For this session, focus your technical questions around: ${selectedFocus}.
7. ${selectedAngle}
8. Vary question styles: mix open-ended, scenario-based, "how would you", "walk me through", and "compare X vs Y" formats.

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
    const result = await callGeminiWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    let rawText = result.response.text().trim();
    const data = parseGeminiJson(rawText);
    console.log(`[Gemini] Generated ${(data.technical?.length || 0) + (data.hr?.length || 0) + (data.coding?.length || 0)} personalised questions.`);
    return data;
  } catch (err) {
    console.error('[Gemini] Question generation failed:', err.message);
    const primarySkill = skillsStr.split(',')[0]?.trim() || 'your primary stack';
    const technicalPool = [
      `Explain how you would architect a scalable system using ${primarySkill}.`,
      `What design patterns do you find most useful in your work, and why?`,
      `How do you approach debugging a performance issue in production?`,
      `Walk me through your development workflow when starting a new feature.`,
      `How would you design an API rate limiter using ${primarySkill}?`,
      `Describe how you handle database migrations in a production environment.`,
      `What is your approach to writing testable code with ${primarySkill}?`,
      `How would you implement caching to reduce latency in a high-traffic application?`,
      `Explain the trade-offs between SQL and NoSQL databases for your use case.`,
      `Walk me through how you would set up monitoring and alerting for a microservice.`,
      `How do you handle authentication and authorization in your applications?`,
      `Describe a time you had to optimize a slow database query. What was your approach?`,
      `How would you design a message queue system for asynchronous task processing?`,
      `Explain how you would implement CI/CD pipelines for a ${primarySkill} project.`,
      `What strategies do you use for handling errors and retries in distributed systems?`,
    ];
    const hrPool = [
      `Tell me about a challenging project from your background and how you overcame obstacles.`,
      `How do you stay updated with new technologies in your field?`,
      `Describe a situation where you had to collaborate closely with a team under a tight deadline.`,
      `Tell me about a time you disagreed with a technical decision. How did you handle it?`,
      `How do you prioritize tasks when you have multiple urgent deadlines?`,
      `Describe a situation where you had to learn a new technology quickly for a project.`,
      `How do you give and receive constructive feedback during code reviews?`,
      `Tell me about a project that failed. What did you learn from it?`,
      `How do you handle ambiguous requirements from stakeholders?`,
      `Describe your approach to mentoring junior developers.`,
    ];
    const codingPool = [
      `Write a function that finds all duplicate elements in an array and returns them with their occurrence count. Optimize for O(N) time complexity.`,
      `Implement a function that validates whether a string of brackets is balanced. Support (), [], and {}.`,
      `Write a function to find the longest substring without repeating characters.`,
      `Implement a debounce function that delays invoking a callback until after a specified wait time.`,
      `Write a function that flattens a deeply nested object into dot-notation keys.`,
      `Implement a basic LRU cache with get and put operations in O(1) time.`,
      `Write a function that merges two sorted arrays into one sorted array without using built-in sort.`,
      `Implement a function to find the first non-repeating character in a string.`,
    ];
    const pick = (pool, count) => {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    };
    return {
      technical: pick(technicalPool, 3),
      hr: pick(hrPool, 1),
      coding: pick(codingPool, 1),
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
You are an extremely strict senior technical interviewer evaluating a candidate's answer during a mock interview.

Role Being Interviewed For: ${role}
Question Category: ${category}
Interview Question: "${question}"
Candidate's Answer: "${candidateAnswer}"

Evaluate this answer with ZERO leniency.

Respond ONLY with a valid raw JSON object:
{
  "score": <integer 0-10>,
  "verdict": "Excellent" | "Good" | "Average" | "Needs Improvement" | "Poor",
  "strengths": ["key strength 1 from the answer", "key strength 2"],
  "improvements": ["specific area to improve 1", "specific area to improve 2"],
  "missedPoints": ["important concept they forgot to mention 1", "concept 2"],
  "modelAnswer": "A 2-3 sentence ideal answer summary for this question",
  "feedback": "A personalized 2-3 sentence coaching feedback message addressing the candidate directly"
}

STRICT SCORING RULES — YOU MUST FOLLOW THESE EXACTLY:

SCORE 0 — MANDATORY for ANY of these cases:
- The answer is gibberish, greetings, or filler (e.g. "hi", "hello", "hey", "ok", "yes", "no", "I don't know", "pass", "nothing", "good question", random words)
- The answer has NO technical or relevant content whatsoever
- The answer is completely off-topic and does not address the question AT ALL
- The answer is just repeating the question back
- The answer is under 15 words and contains zero relevant technical terms

SCORE 1-2 — The answer mentions the topic vaguely but is mostly wrong, confused, or irrelevant.
SCORE 3-4 — The answer shows some awareness but has major gaps, misconceptions, or is mostly surface-level.
SCORE 5-6 — The answer covers basics correctly but lacks depth, examples, or real-world understanding.
SCORE 7-8 — Solid answer with good depth, but missed one or two nuances.
SCORE 9-10 — Exceptional, thorough, with real-world examples and deep understanding. Very rare.

CRITICAL RULES:
- If the answer does not demonstrate knowledge related to the question, the score MUST be 0-2. No exceptions.
- Do NOT be generous. A real interviewer would reject "hi hello" as a non-answer.
- Short, vague, or lazy answers should NEVER score above 3.
- The default score is NOT 5. Start from 0 and add points only for demonstrated knowledge.
- ABSOLUTELY CRITICAL: score MUST be a pure integer between 0 and 10. Never return decimal numbers. Never return a score outside 0-10 range.
`;

  try {
    const result = await callGeminiWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    let rawText = result.response.text().trim();
    const data = parseGeminiJson(rawText);
    data.score = parseScoreSafe(data.score, 0, 10);
    console.log(`[Gemini] Answer evaluated. Score: ${data.score}/10, Verdict: ${data.verdict}`);
    return { success: true, ...data };
  } catch (err) {
    console.error('[Gemini] Answer evaluation failed:', err.message);
    const wordCount = (candidateAnswer || '').split(/\s+/).length;
    const hasContent = wordCount > 5;
    return {
      success: true,
      score: hasContent ? 5 : 0,
      verdict: hasContent ? 'Average' : 'Poor',
      strengths: hasContent ? ['Answer was recorded for review'] : [],
      improvements: ['AI evaluation encountered an error. Answer recorded for manual review.'],
      missedPoints: [],
      modelAnswer: 'Evaluation unavailable.',
      feedback: hasContent
        ? 'Your answer has been recorded. The AI evaluator encountered a temporary issue.'
        : 'No evaluable content detected in your response.'
    };
  }
};

/**
 * PATH 5 — Final Report Synthesis
 * Gemini evaluates the full interview transcript and generates a comprehensive report.
 */
const synthesizeInterviewReport = async ({ role, experience, qaList, questionScores }) => {
  console.log('[Gemini] Synthesizing final interview performance report...');
  const model = getModel();

  const transcript = qaList.map((qa, i) => {
    const score = (questionScores && questionScores[i] !== undefined) ? questionScores[i] : 'N/A';
    return `Q${i + 1} [${qa.category}] (Score: ${score}/100): ${qa.questionText}\nAnswer: ${qa.candidateAnswer || '(No answer provided)'}`;
  }).join('\n\n');

  const avgScore = (questionScores && questionScores.length > 0)
    ? Math.round(questionScores.reduce((a, b) => a + b, 0) / questionScores.length)
    : 'N/A';

  const prompt = `
You are a senior hiring manager writing a comprehensive performance report for a candidate interview.

Role: ${role}
Experience Level: ${experience}
Average Question Score (pre-computed): ${avgScore}/100

Full Interview Transcript:
"""
${transcript.slice(0, 7000)}
"""

Analyze the entire interview performance and generate a detailed report.
IMPORTANT: The final overallScore should align with the pre-computed average score above. If they diverge significantly, prefer the pre-computed average.

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

  const result = await callGeminiWithRetry(model, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  let rawText = result.response.text().trim();
  const data = parseGeminiJson(rawText);
  const actualAvg = (questionScores && questionScores.length > 0)
    ? Math.round(questionScores.reduce((a, b) => a + b, 0) / questionScores.length)
    : null;
  data.overallScore = actualAvg !== null ? actualAvg : parseScoreSafe(data.overallScore, 10, 100);
  data.technicalScore = parseScoreSafe(data.technicalScore, 10, 100);
  data.communicationScore = parseScoreSafe(data.communicationScore, 10, 100);
  data.hrScore = parseScoreSafe(data.hrScore, 10, 100);
  if (data.breakdown) {
    Object.keys(data.breakdown).forEach(k => {
      data.breakdown[k] = parseScoreSafe(data.breakdown[k], 10, 100);
    });
  }

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
    const result = await callGeminiWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    let rawText = result.response.text().trim();
    return parseGeminiJson(rawText);
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
