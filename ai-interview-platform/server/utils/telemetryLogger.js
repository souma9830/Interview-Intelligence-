
const fs = require('fs');
const path = require('path');

exports.logEvent = (interviewId, eventType, description, severity = 'info') => {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logEntry = {
    timestamp: new Date().toISOString(),
    interviewId,
    eventType,
    description,
    severity
  };
  fs.appendFileSync(
    path.join(logDir, 'telemetry.log'),
    JSON.stringify(logEntry) + '\n',
    'utf8'
  );
};
      