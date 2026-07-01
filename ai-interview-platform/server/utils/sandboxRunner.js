const { exec } = require('child_process');
class SandboxRunner {
  static runCode(code, language = 'javascript', timeout = 5000) {
    return new Promise((resolve) => {
      if (language !== 'javascript') {
        return resolve({ error: 'Language not supported' });
      }
      const child = exec('node', { timeout }, (err, stdout, stderr) => {
        if (err && err.killed) {
          resolve({ error: 'Execution Timeout' });
        } else if (err) {
          resolve({ error: stderr || err.message });
        } else {
          resolve({ output: stdout });
        }
      });
      if (child.stdin) {
        child.stdin.write(code);
        child.stdin.end();
      }
    });
  }
}
module.exports = SandboxRunner;
