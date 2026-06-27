const { ApiError } = require('../middleware/error/errorHandler');

// @desc    Get current user details statelessly
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'User context not found in stateless request session');
    }
    // Return the user mapped statelessly from the decoded Firebase token in authMiddleware
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get Me Error:', error.message);
    next(error);
  }
};

// @desc    Logout user (Stateless wrapper)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout Error:', error.message);
    next(error);
  }
};