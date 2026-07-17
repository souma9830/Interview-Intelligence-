const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{6}$/.test(v);
      },
      message: 'OTP must be exactly 6 numeric digits',
    },
  },
  // Track what the OTP is for (password-reset or email-verification)
  purpose: {
    type: String,
    enum: ['password-reset', 'email-verification'],
    default: 'password-reset',
  },
  // Track failed verification attempts to prevent brute-force
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Too many failed OTP attempts'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // auto-delete after 5 minutes
  },
});

OTPSchema.index({ email: 1, createdAt: -1 });

// Static helper: invalidate all existing OTPs for an email+purpose
OTPSchema.statics.invalidateAll = function (email, purpose = 'password-reset') {
  return this.deleteMany({ email: email.toLowerCase().trim(), purpose });
};

// Instance method: increment failed attempt counter
OTPSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.save();
};

module.exports = mongoose.model('OTP', OTPSchema);

