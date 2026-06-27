const request = require('supertest');
const express = require('express');
const app = express();
const resumeRoutes = require('../routes/resumeRoutes');
const { parseResumeText } = require('../utils/parsers/resumeParser');

// Mock auth middleware
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '664e4ea4a93a40498eb79e2a', name: 'Demo Candidate', email: 'candidate@camsense.ai' };
    next();
  }
}));

// Mock geminiService
jest.mock('../services/geminiService', () => ({
  analyzeSkillsWithGemini: jest.fn().mockResolvedValue({
    success: true,
    source: 'gemini-2.5-flash',
    matchPercentage: 80,
    jdSkills: ['React', 'Node'],
    matchingSkills: ['React'],
    missingSkills: ['Node'],
    recommendation: 'Strategic recommendation'
  }),
  extractResumeData: jest.fn().mockResolvedValue({
    skills: ['React', 'CSS'],
    education: ['XYZ Uni'],
    experience: ['Dev at ABC Corp'],
    projects: ['Chatbot'],
    summary: 'A skilled React developer.'
  })
}));

app.use(express.json());
app.use('/api/resume', resumeRoutes);

describe('Resume Endpoints', () => {
  it('should return 400 when uploading resume without file', async () => {
    const res = await request(app)
      .post('/api/resume/upload');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should analyze job descriptions against resume', async () => {
    const res = await request(app)
      .post('/api/resume/analyze-jd')
      .send({
        jobDescription: 'Looking for a Senior React and Node Engineer with experience in cloud platforms.',
        resumeContent: 'React developer with 3 years experience'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.matchPercentage).toBe(80);
  });

  describe('Local Resume Parser Utility', () => {
    it('should parse skills and sections correctly', () => {
      const text = 'Education:\nB.Tech in CS from ABC College\nExperience:\nReact Developer for 2 years\nSkills: JavaScript, React, Node.js';
      const result = parseResumeText(text);
      expect(result.skills).toContain('React');
      expect(result.skills).toContain('JavaScript');
      expect(result.education.length).toBeGreaterThan(0);
      expect(result.experience.length).toBeGreaterThan(0);
    });
  });
});
