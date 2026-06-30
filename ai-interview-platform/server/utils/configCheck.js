const REQUIRED_KEYS = [
  'MONGODB_URI',
  'GEMINI_API_KEY',
  'JWT_SECRET'
];

const check = () => {
  const missing = [];
  for (const key of REQUIRED_KEYS) {
    if (!process.env[key] || process.env[key] === `your_${key.toLowerCase()}_here`) {
      missing.push(key);
    }
  }
  return {
    valid: missing.length === 0,
    missing
  };
};

module.exports = { check };
