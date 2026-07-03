/**
 * Retry wrapper for HTTP requests with exponential backoff.
 * Uses the global `fetch` API available in Node.js 18+.
 *
 * @module server/utils/compilerRetry
 */

/**
 * Execute an HTTP request with automatic retry on failure.
 *
 * @param {string} url - The request URL.
 * @param {object} options - Fetch options object (method, headers, body, etc.).
 * @param {number} [retries=3] - Maximum number of retry attempts.
 * @param {number} [delay=1000] - Base delay in milliseconds between retries.
 * @returns {Promise<Response>} The fetch Response object.
 * @throws {Error} If all retry attempts fail.
 */
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (i === retries - 1) {
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      if (i === retries - 1) throw err;
      const backoff = delay * Math.pow(2, i);
      console.warn(`[Retry] Attempt ${i + 1}/${retries} failed. Retrying in ${backoff}ms...`);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
};

module.exports = { fetchWithRetry };
