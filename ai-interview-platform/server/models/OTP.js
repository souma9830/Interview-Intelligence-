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
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

OTPSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('OTP', OTPSchema);
