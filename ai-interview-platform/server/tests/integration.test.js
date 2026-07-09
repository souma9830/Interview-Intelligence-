
const request = require('supertest');
const app = require('../app');

describe('API Integration Smoke Tests', () => {
  it('should query health details correctly', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });
});
