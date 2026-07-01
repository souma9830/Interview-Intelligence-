
exports.validateSandboxPayload = (req, res, next) => {
  const { code } = req.body;
  if (!code || code.length > 50000) {
    return res.status(400).json({ success: false, message: 'Invalid code size' });
  }
  next();
};
      