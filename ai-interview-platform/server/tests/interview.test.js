const request = require('supertest');
const express = require('express');
const app = express();
const interviewRoutes = require('../routes/interviewRoutes');

// Mock auth middleware to bypass Firebase token checks
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '664e4ea4a93a40498eb79e2a', name: 'Demo Candidate', email: 'candidate@camsense.ai' };
    next();
  }
}));

// Mock geminiService responses
jest.mock('../services/geminiService', () => ({
  generateQuestionsFromResume: jest.fn().mockResolvedValue({
    technical: ['Question 1', 'Question 2'],
    hr: ['Behavioral Q1'],
    coding: ['Coding Q1']
  }),
  evaluateAnswer: jest.fn().mockResolvedValue({
    score: 8,
    verdict: 'Good',
    strengths: ['Clear terminology'],
    improvements: ['Elaborate more'],
    missedPoints: ['None'],
    modelAnswer: 'Ideal answer text',
    feedback: 'Good job'
  }),
  evaluateCodingSolution: jest.fn().mockResolvedValue({
    containsSyntaxIssues: false,
    overallScore: 90,
    metrics: { syntaxScore: 90, optimizationScore: 90, explanationScore: 90, executionTime: '12ms', memoryConsumed: '16MB' },
    testCases: [{ name: 'Syntax Check', passed: true, duration: '4ms' }]
  }),
  analyzeSkillsWithGemini: jest.fn().mockResolvedValue({
    matchPercentage: 80,
    jdSkills: ['React', 'Node'],
    matchingSkills: ['React'],
    missingSkills: ['Node'],
    recommendation: 'Strategic recommendation'
  })
}));

app.use(express.json());
app.use('/api/interview', interviewRoutes);

describe('Interview Endpoints', () => {
  it('should initialize a new interview session', async () => {
    const res = await request(app)
      .post('/api/interview/start')
      .send({
        role: 'Frontend Engineer',
        experience: 'Mid-level',
        resumeSkills: ['React', 'Node.js'],
        resumeSummary: 'Frontend engineer with production React experience'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('Frontend Engineer');
    expect(res.body.data.questions.length).toBeGreaterThan(0);
  });

  it('should reject interview starts without parsed resume context', async () => {
    const res = await request(app)
      .post('/api/interview/start')
      .send({ role: 'Frontend Engineer', experience: 'Mid-level' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/upload and parse a resume/i);
  });

  it('should evaluate an answer in real-time', async () => {
    const res = await request(app)
      .post('/api/interview/evaluate-answer')
      .send({
        interviewId: 'stateless_123',
        questionIndex: 0,
        candidateAnswer: 'I design APIs with proper routing',
        question: 'How do you design APIs?',
        category: 'technical'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBe(8);
  });

  it('should evaluate coding solutions with guard rails', async () => {
    const res = await request(app)
      .post('/api/interview/coding/eval')
      .send({
        role: 'Frontend Engineer',
        code: 'const x = 5;',
        language: 'javascript'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overallScore).toBe(90);
  });

  it('should reject coding evaluation requests with missing required fields', async () => {
    const res = await request(app)
      .post('/api/interview/coding/eval')
      .send({
        role: 'Frontend Engineer',
        language: 'javascript'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/role, code submission, and language/i);
  });

  it('should reject unsupported coding roles', async () => {
    const res = await request(app)
      .post('/api/interview/coding/eval')
      .send({
        role: 'Security Researcher',
        code: 'const answer = 42;',
        language: 'javascript'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/unsupported role/i);
  });

  it('should reject unsupported coding languages', async () => {
    const res = await request(app)
      .post('/api/interview/coding/eval')
      .send({
        role: 'Frontend Engineer',
        code: 'SELECT 1;',
        language: 'sql'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/unsupported coding language/i);
  });

  it('should reject oversized coding submissions', async () => {
    const res = await request(app)
      .post('/api/interview/coding/eval')
      .send({
        role: 'Frontend Engineer',
        code: 'a'.repeat(30001),
        language: 'javascript'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/code size limit exceeded/i);
  });
});
