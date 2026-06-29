const request = require('supertest');
const express = require('express');

process.env.STORAGE_MODE = 'memory';

jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '664e4ea4a93a40498eb79e2a', name: 'Demo Candidate', email: 'candidate@camsense.ai' };
    next();
  }
}));

const scheduleRoutes = require('../routes/scheduleRoutes');
const app = express();
app.use(express.json());
app.use('/api/schedules', scheduleRoutes);

describe('Schedule Endpoints', () => {
  it('should create and list a future interview schedule', async () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const created = await request(app)
      .post('/api/schedules')
      .send({ role: 'Frontend Engineer', scheduledAt: future, durationMinutes: 45, notes: 'Focus on React systems' });

    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.role).toBe('Frontend Engineer');

    const listed = await request(app).get('/api/schedules');
    expect(listed.status).toBe(200);
    expect(listed.body.data.length).toBeGreaterThan(0);
  });

  it('should reject schedules in the past', async () => {
    const past = new Date(Date.now() - 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/schedules')
      .send({ role: 'Frontend Engineer', scheduledAt: past });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/future/i);
  });
});
