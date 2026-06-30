const request = require('supertest');
const express = require('express');
const app = express();
const healthRoutes = require('../routes/healthRoutes');

app.use('/api/health', healthRoutes);

describe('Platform Health Endpoint Tests', () => {
  it('should successfully return status payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });
});
