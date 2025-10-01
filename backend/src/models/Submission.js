const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  language: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending', 
      'judging', 
      'accepted', 
      'wrong_answer', 
      'time_limit', 
      'memory_limit', 
      'runtime_error', 
      'compile_error'
    ],
    default: 'pending'
  },
  executionTime: {
    type: Number // ms
  },
  memory: {
    type: Number // KB
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number
  },
  errorMessage: {
    type: String
  },
  // ⭐ THÊM CÁC FIELD MỚI CHO AI JUDGE
  aiAnalysis: {
    type: String,
    default: null
  },
  suggestions: [{
    type: String
  }],
  judgeMethod: {
    type: String,
    enum: ['traditional', 'ai', 'hybrid'],
    default: 'traditional'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);