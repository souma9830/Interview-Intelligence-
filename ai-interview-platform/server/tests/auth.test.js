const request = require('supertest');
const express = require('express');
const app = express();
const authRoutes = require('../routes/authRoutes');
const { sanitizeAndParseJson } = require('../utils/sanitizers/jsonSanitizer');

// Mock auth middleware to bypass Firebase token checks
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '664e4ea4a93a40498eb79e2a', name: 'Demo Candidate', email: 'candidate@camsense.ai' };
    next();
  }
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Endpoints', () => {
  it('should return currently logged-in user profile details', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('candidate@camsense.ai');
    expect(res.body.data.name).toBe('Demo Candidate');
  });

  it('should successfully logout the user', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Logged out successfully');
  });

  describe('JSON Sanitizer Utility', () => {
    it('should successfully sanitize and parse markdown-wrapped JSON text', () => {
      const markdownJson = '```json\n{\n  "score": 8,\n  "verdict": "Good"\n}\n```';
      const parsed = sanitizeAndParseJson(markdownJson);
      expect(parsed.score).toBe(8);
      expect(parsed.verdict).toBe('Good');
    });

    it('should recover from trailing commas', () => {
      const badJson = '{\n  "skills": ["JS", "React",],\n}';
      const parsed = sanitizeAndParseJson(badJson);
      expect(parsed.skills).toContain('JS');
    });
  });
});
