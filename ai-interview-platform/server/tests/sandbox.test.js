const { validateCodePayload } = require('../middleware/sandboxMiddleware');

describe('Sandbox Middleware tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  it('should pass on safe code inputs', () => {
    req.body = { code: 'console.log("hello")', language: 'javascript' };
    validateCodePayload(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should block dangerous system invocations', () => {
    req.body = { code: 'require("child_process").exec("rm -rf /")', language: 'javascript' };
    validateCodePayload(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
