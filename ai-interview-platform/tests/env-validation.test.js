const { execSync } = require('child_process');
describe('Environment Validation Script', () => {
  it('should be executable', () => {
    const out = execSync('node server/bin/validate-env.js', {
      env: {
        ...process.env,
        MONGODB_URI: 'mongodb://localhost:27017/test',
        GEMINI_API_KEY: 'test_key',
        JWT_SECRET: 'test_secret'
      }
    });
    expect(out.toString()).toContain('Diagnostics');
  });
});
