const crypto = require('crypto');
const PromptCache = require('../models/PromptCache');

const getHash = (prompt) => {
  return crypto.createHash('sha256').update(prompt).digest('hex');
};

const get = async (prompt) => {
  try {
    const hash = getHash(prompt);
    const cached = await PromptCache.findOne({ promptHash: hash });
    if (cached) {
      console.log('[Cache Service] Cache hit for prompt hash:', hash);
      return JSON.parse(cached.responseJson);
    }
  } catch (err) {
    console.warn('[Cache Service Warning] Get cache failed:', err.message);
  }
  return null;
};

const set = async (prompt, data) => {
  try {
    const hash = getHash(prompt);
    await PromptCache.create({
      promptHash: hash,
      responseJson: JSON.stringify(data)
    });
    console.log('[Cache Service] Successfully cached prompt hash:', hash);
  } catch (err) {
    console.warn('[Cache Service Warning] Set cache failed:', err.message);
  }
};

module.exports = { get, set };
