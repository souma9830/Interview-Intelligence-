const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  communicationScore: {
    type: Number,
    default: 80,
  },
  technicalScore: {
    type: Number,
    default: 85,
  },
  breakdown: {
    syntaxAccuracy: { type: Number, default: 0 },
    systemScalability: { type: Number, default: 0 },
    verbalCommunication: { type: Number, default: 0 },
    complexityOptimization: { type: Number, default: 0 },
  },
  strengths: [
    { type: String }
  ],
  weaknesses: [
    { type: String }
  ],
  feedbackReport: {
    type: String,
    default: '',
  },
  feedbackLogs: [
    { type: String }
  ],
  createdTime: {
    type: String,
    default: () => new Date().toLocaleString(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ReportSchema.index({ interview: 1 }, { unique: true });
ReportSchema.index({ user: 1, createdAt: -1 });
ReportSchema.index({ overallScore: -1 });

module.exports = mongoose.model('Report', ReportSchema);