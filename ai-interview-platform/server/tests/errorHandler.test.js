const { globalErrorHandler, notFoundHandler, ApiError } = require('../middleware/error/errorHandler');

jest.mock('../services/errorTracker', () => ({
  capture: jest.fn(),
}));

jest.mock('../services/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
}));

function mockReq(overrides = {}) {
  return {
    method: 'GET',
    url: '/api/test',
    originalUrl: '/api/test',
    ip: '127.0.0.1',
    requestId: 'test-req-id',
    get: jest.fn().mockReturnValue('test-agent'),
    user: null,
    ...overrides,
  };
}

function mockRes() {
  const state = { statusCode: 200, body: null, headersSent: false };
  const res = {
    statusCode: 200,
    headersSent: false,
    status(code) {
      state.statusCode = code;
      res.statusCode = code;
      return res;
    },
    json(body) {
      state.body = body;
      res.body = body;
      return res;
    },
    _getData() {
      return state.body ? JSON.stringify(state.body) : '';
    },
  };
  return res;
}

describe('ApiError', () => {
  it('creates an operational error with correct properties', () => {
    const err = new ApiError(400, 'Bad request', { field: 'email' });
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
    expect(err.details).toEqual({ field: 'email' });
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  it('marks 5xx errors as "error" status', () => {
    const err = new ApiError(500, 'Server error');
    expect(err.status).toBe('error');
  });
});

describe('notFoundHandler', () => {
  it('returns 404 with route information', () => {
    const req = mockReq({ method: 'GET', originalUrl: '/nonexistent' });
    const res = mockRes();
    notFoundHandler(req, res);
    expect(res.statusCode).toBe(404);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.message).toContain('Route not found');
    expect(data.message).toContain('GET');
    expect(data.message).toContain('/nonexistent');
  });
});

describe('globalErrorHandler', () => {
  it('handles MulterError with 400', () => {
    const err = new Error('File too large');
    err.name = 'MulterError';
    const req = mockReq();
    const res = mockRes();
    globalErrorHandler(err, req, res, jest.fn());
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain('Upload error');
  });

  it('handles Mongoose ValidationError with field details', () => {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = {
      email: { message: 'Invalid email format' },
      password: { message: 'Too short' },
    };
    const req = mockReq();
    const res = mockRes();
    globalErrorHandler(err, req, res, jest.fn());
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe('Validation failed');
    expect(data.errors).toHaveLength(2);
    expect(data.errors[0].field).toBe('email');
  });

  it('handles CastError with 400', () => {
    const err = new Error('Invalid ObjectId');
    err.name = 'CastError';
    err.path = '_id';
    err.value = 'invalid123';
    const req = mockReq();
    const res = mockRes();
    globalErrorHandler(err, req, res, jest.fn());
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain('Invalid _id');
  });

  it('handles duplicate key error (11000) with 409', () => {
    const err = new Error('Duplicate key');
    err.code = 11000;
    err.keyValue = { email: 'test@test.com' };
    const req = mockReq();
    const res = mockRes();
    globalErrorHandler(err, req, res, jest.fn());
    expect(res.statusCode).toBe(409);
    const data = JSON.parse(res._getData());
    expect(data.message).toContain('Duplicate value');
  });

  it('returns 500 for server errors with generic message', () => {
    const req = mockReq();
    const res = mockRes();
    const err = new Error('Something broke');
    err.statusCode = 500;
    globalErrorHandler(err, req, res, jest.fn());
    expect(res.statusCode).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe('Internal Server Error');
  });

  it('defaults untyped errors to 500', () => {
    const req = mockReq();
    const res = mockRes();
    const err = new Error('Random failure');
    globalErrorHandler(err, req, res, jest.fn());
    expect(res.statusCode).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.message).toBe('Internal Server Error');
  });

  it('does not send response if headers already sent', () => {
    const req = mockReq();
    const res = mockRes();
    res.headersSent = true;
    const jsonSpy = jest.spyOn(res, 'json');
    const err = new Error('Late error');
    globalErrorHandler(err, req, res, jest.fn());
    expect(jsonSpy).not.toHaveBeenCalled();
    jsonSpy.mockRestore();
  });

  it('includes error details when provided', () => {
    const req = mockReq();
    const res = mockRes();
    const err = new ApiError(422, 'Validation failed', { field: 'name' });
    globalErrorHandler(err, req, res, jest.fn());
    const data = JSON.parse(res._getData());
    expect(data.errors).toEqual({ field: 'name' });
  });

  it('logs server errors at error level', () => {
    const logger = require('../services/logger');
    const req = mockReq();
    const res = mockRes();
    const err = new Error('Database connection failed');
    err.statusCode = 500;
    globalErrorHandler(err, req, res, jest.fn());
    expect(logger.error).toHaveBeenCalled();
  });
});
