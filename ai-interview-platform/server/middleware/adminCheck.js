const adminCheck = (req, res, next) => {
  // Enforce administrative checks statelessly based on email or roles
  const userEmail = req.user?.email || '';
  if (userEmail.endsWith('@camsense.ai') || userEmail === 'admin@interview-intelligence.com') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrator privileges required.'
  });
};

module.exports = adminCheck;
