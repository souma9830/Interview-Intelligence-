const request = require('supertest');
const express = require('express');
const { apiVersioning } = require('../middleware/apiVersion');

const app = express();
app.use(apiVersioning);
app.get('/test', (req, res) => {
  res.json({ version: req.apiVersion });
});

describe('API Versioning', () => {
  it('should default to v1.0', async () => {
    const res = await request(app).get('/test');
    expect(res.body.version).toBe('1.0');
  });
  it('should respect Accept-Version header', async () => {
    const res = await request(app).get('/test').set('Accept-Version', '2.0');
    expect(res.body.version).toBe('2.0');
  });
});
