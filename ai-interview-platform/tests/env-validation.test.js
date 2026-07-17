const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Environment Validation Script', () => {
  it('should be executable', () => {
    const tempEnvPath = path.join(__dirname, '../.env');
    fs.writeFileSync(tempEnvPath, 'MONGO_URI=mongodb://localhost:27017/test\nGEMINI_API_KEY=test_key\nJWT_SECRET=test_secret');
    
    try {
      const out = execSync('node scripts/validate-env.js', {
        env: {
          ...process.env,
          MONGO_URI: 'mongodb://localhost:27017/test',
          GEMINI_API_KEY: 'test_key',
          JWT_SECRET: 'test_secret'
        }
      });
      expect(out.toString()).toContain('passed');
    } finally {
      if (fs.existsSync(tempEnvPath)) {
        fs.unlinkSync(tempEnvPath);
      }
    }
  });
});
