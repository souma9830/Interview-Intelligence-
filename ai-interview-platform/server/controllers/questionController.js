const SandboxRunner = require('../utils/sandboxRunner');
const { generateCategorizedQuestions } = require('../services/ollamaService');
const { ApiError } = require('../middleware/error/errorHandler');
const { sendSuccess, sendError, handleControllerError } = require('../utils/apiResponse');

exports.generateQuestion = async (req, res, next) => {
  try {
    const { role, difficulty, experience, jobDescription, resumeSkills } = req.body;

    if (!role || !experience) {
      return sendError(res, 'Please specify target role and experience', 400);
    }

    console.log(`[AI Question Generator] Generating dynamic questions for ${role}`);
    const categorizedQuestions = await generateCategorizedQuestions({
      role,
      experience,
      skills: resumeSkills || [],
      jobDescription: jobDescription || '',
    });

    sendSuccess(res, {
      role,
      difficulty: difficulty || 'Medium',
      experience,
      ...categorizedQuestions
    });
  } catch (error) {
    handleControllerError(res, error, 'Failed to generate questions');
  }
};