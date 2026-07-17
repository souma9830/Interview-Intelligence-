const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: [true, 'Please specify the target interview role'],
  },
  experience: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  jobDescription: {
    type: String,
    default: '',
  },
  questions: [
    {
      questionText: { type: String, required: true },
      category: {
        type: String,
        enum: ['technical', 'hr', 'coding'],
        default: 'technical',
      },
      candidateAnswer: { type: String, default: '' },
    }
  ],
  status: {
    type: String,
    enum: ['initialized', 'speaking_active', 'coding_active', 'completed'],
    default: 'initialized',
  },
  finalCode: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

InterviewSchema.index({ user: 1, status: 1, createdAt: -1 });
InterviewSchema.index({ difficulty: 1, status: 1 });
InterviewSchema.index({ 'questions.category': 1 });

module.exports = mongoose.model('Interview', InterviewSchema);