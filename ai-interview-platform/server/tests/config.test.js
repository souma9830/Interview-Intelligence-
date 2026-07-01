const configCheck = require('../utils/configCheck');

describe('Configuration Validator Tests', () => {
  it('should detect missing environment variables', () => {
    const oldVal = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    
    const result = configCheck.check();
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('JWT_SECRET');
    
    process.env.JWT_SECRET = oldVal;
  });
});
