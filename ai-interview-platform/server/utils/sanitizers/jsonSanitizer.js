/**
 * Utility to extract, sanitize and parse JSON objects returned from LLM APIs.
 * Prevents server crashes due to markdown code block wrappers or conversational prefixes.
 */

/**
 * Sanitizes a string containing JSON, extracts the JSON object part, and parses it.
 * @param {string} rawText - Raw response text from the AI.
 * @param {Object} fallback - Fallback object in case parsing fails completely.
 * @returns {Object} Parsed JSON object or fallback.
 */
function sanitizeAndParseJson(rawText, fallback = {}) {
  if (!rawText || typeof rawText !== 'string') {
    return fallback;
  }

  let cleaned = rawText.trim();

  // Rule 1: Remove markdown code block wraps (```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/```json/gi, '');
  cleaned = cleaned.replace(/```/g, '');
  cleaned = cleaned.trim();

  // Rule 2: Find the first '{' and the last '}' to isolate the JSON object structure
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('[JSON Sanitizer] Standard JSON.parse failed. Attempting structural recovery...', error.message);
    
    // Attempt structural recovery for trailing commas or simple syntax flaws
    try {
      // Remove trailing commas before closing braces/brackets
      let recovered = cleaned
        .replace(/,\s*([\]}])/g, '$1')
        // Fix unescaped control chars
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      return JSON.parse(recovered);
    } catch (recoveryError) {
      console.error('[JSON Sanitizer] JSON parsing failed completely. Returning fallback schema.', recoveryError.message);
      return fallback;
    }
  }
}

module.exports = { sanitizeAndParseJson };
