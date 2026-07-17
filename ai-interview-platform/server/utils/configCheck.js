const REQUIRED_KEYS = [
  'MONGODB_URI',
  'GEMINI_API_KEY',
  'JWT_SECRET'
];

const SMTP_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS'
];

const check = () => {
  const missing = [];
  const smtpMissing = [];

  for (const key of REQUIRED_KEYS) {
    if (!process.env[key] || process.env[key] === `your_${key.toLowerCase()}_here`) {
      missing.push(key);
    }
  }

  const allSmtpProvided = SMTP_KEYS.every(k => process.env[k]);
  if (!allSmtpProvided) {
    SMTP_KEYS.forEach(k => {
      if (!process.env[k]) smtpMissing.push(k);
    });
  }

  return {
    valid: missing.length === 0,
    missing,
    smtpConfigured: allSmtpProvided,
    smtpMissing
  };
};

module.exports = { check };
