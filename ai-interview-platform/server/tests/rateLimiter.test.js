const request = require('supertest');
const express = require('express');
const app = express();
const rateLimiter = require('../middleware/rateLimiter');

const testLimiter = rateLimiter(2, 60000); // 2 requests per minute max

app.use(express.json());
app.get('/test', testLimiter, (req, res) => {
  res.status(200).json({ success: true });
});

describe('Rate Limiter Middleware Tests', () => {
  it('should block requests exceeding the rate limit', async () => {
    const res1 = await request(app).get('/test');
    const res2 = await request(app).get('/test');
    const res3 = await request(app).get('/test');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(429);
  });
});
