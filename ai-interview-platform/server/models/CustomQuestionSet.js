const mongoose = require('mongoose');

const customQuestionSetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [{
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['technical', 'hr', 'coding', 'behavioral'],
      default: 'technical',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

customQuestionSetSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CustomQuestionSet', customQuestionSetSchema);
