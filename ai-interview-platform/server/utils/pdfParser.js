const pdfParse = require('pdf-parse');
const { parserCache } = require('./cacheManager');
const crypto = require('crypto');

/**
 * Extracts plain text from a raw PDF buffer using pdf-parse.
 * Includes graceful fallbacks for password-encrypted or scan-only PDFs.
 * @param {Buffer} buffer - Binary file buffer of the PDF.
 * @returns {Promise<string>} Plain text contents extracted from the document.
 */
const extractTextFromPDF = async (buffer) => {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF buffer is empty or undefined');
    }

    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const cachedText = parserCache.get(hash);
    if (cachedText) {
      console.log('[Cache] Returning cached parsed PDF text.');
      return cachedText;
    }

    const data = await pdfParse(buffer);
    let textContent = data.text || '';

    // Clean up empty lines or double spacing
    textContent = textContent.replace(/\s+/g, ' ').trim();

    if (textContent.length === 0) {
      console.warn('[PDF Parser] Extracted content from PDF successfully, but length was zero (scan/image-only PDF likely)');
      return 'Image/Scan-only Resume Document';
    }

    parserCache.set(hash, textContent);
    return textContent;
  } catch (error) {
    console.error('PDF parsing error, attempting default regex extraction fallback:', error.message);
    
    // Graceful fallback: attempt a basic raw ASCII extraction of readable text boundaries
    try {
      const asciiText = buffer.toString('ascii').replace(/[^\x20-\x7E\s]/g, ' ');
      return asciiText || 'Unreadable Resume PDF Format';
    } catch (fallbackError) {
      return 'Fallback: Unreadable Encrypted PDF Stream';
    }
  }
};

module.exports = { extractTextFromPDF };
