const { generateCategorizedQuestions } = require('../services/ollamaService');
const { ApiError } = require('../middleware/error/errorHandler');

// @desc    Generate dynamic technical, HR and coding questions using Ollama LLM
// @route   POST /api/interview/questions
// @access  Private
exports.generateQuestion = async (req, res, next) => {
  try {
    const { role, difficulty, experience, jobDescription, resumeSkills } = req.body;

    if (!role || !experience) {
      throw new ApiError(400, 'Please specify target role and experience');
    }

    console.log(`[AI Question Generator] Generating dynamic questions for ${role}`);
    const categorizedQuestions = await generateCategorizedQuestions({
      role,
      experience,
      skills: resumeSkills || [],
      jobDescription: jobDescription || '',
    });

    res.json({
      success: true,
      data: {
        role,
        difficulty: difficulty || 'Medium',
        experience,
        ...categorizedQuestions
      }
    });
  } catch (error) {
    console.error('AI Question Generation Route Error:', error.message);
    next(error);
  }
};