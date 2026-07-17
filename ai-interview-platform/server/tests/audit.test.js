const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const { logAuditTrail } = require('../middleware/auditMiddleware');
const AuditLog = require('../models/AuditLog');

// Mock storage/DB checks for testing
describe('Audit Trail Middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.get('/api/test-audit', logAuditTrail('TEST_ACTION'), (req, res) => {
      res.json({ success: true });
    });
  });

  it('should trigger and format audit records correctly', async () => {
    // Mock AuditLog.create
    const spy = jest.spyOn(AuditLog, 'create').mockResolvedValue({});

    const res = await request(app).get('/api/test-audit');
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalled();

    const callArgs = spy.mock.calls[0][0];
    expect(callArgs.action).toBe('TEST_ACTION');
    expect(callArgs.userId).toBe('anonymous');

    spy.mockRestore();
  });
});
