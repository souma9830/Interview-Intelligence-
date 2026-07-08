/**
 * Gemini Response JSON Parser
 * Extracts and parses JSON from Gemini API responses that may contain markdown code blocks.
 */

function parseGeminiJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Invalid response: empty or non-string input');
  }

  let cleaned = rawText.trim();

  // Remove markdown code block wrappers
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  cleaned = cleaned.trim();

  if (!cleaned) {
    throw new Error('Invalid response: empty after cleaning');
  }

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    // Try to find JSON object in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through to throw original error
      }
    }
    throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
  }
}

function clampScore(score, min = 0, max = 100, fallback = 50) {
  const numeric = Number(score);
  const safe = Number.isFinite(numeric) ? numeric : fallback;
  return Math.min(Math.max(Math.round(safe), min), max);
}

function parseScoreSafe(score, min = 0, max = 100, fallback = 50) {
  if (score === null || score === undefined || score === 'N/A') return fallback;
  const numeric = Number(score);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Math.round(numeric), min), max);
}

module.exports = { parseGeminiJson, clampScore, parseScoreSafe };
