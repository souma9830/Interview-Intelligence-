const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  education: {
    type: [String],
    default: [],
  },
  experience: {
    type: [String],
    default: [],
  },
  projects: {
    type: [String],
    default: [],
  },
  summary: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ResumeSchema.index({ user: 1 }, { unique: true });
ResumeSchema.index({ skills: 1 });
ResumeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);
