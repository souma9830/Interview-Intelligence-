const mongoose = require('mongoose');

const ErrorLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['error', 'warn', 'info'],
    default: 'error',
  },
  message: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
  },
  code: {
    type: Number,
  },
  path: {
    type: String,
  },
  method: {
    type: String,
  },
  userId: {
    type: String,
  },
  requestId: {
    type: String,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: String,
  },
}, {
  timestamps: true,
});

ErrorLogSchema.index({ level: 1, createdAt: -1 });
ErrorLogSchema.index({ resolved: 1, createdAt: -1 });
ErrorLogSchema.index({ path: 1 });

module.exports = mongoose.model('ErrorLog', ErrorLogSchema);