const mongoose = require('mongoose');

const singleAnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [String],
  selectedOptionIndex: {
    type: Number,
    required: true
  },
  correctOptionIndex: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  explanation: {
    type: String,
    default: ''
  }
});

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true
    },
    quizTitle: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      required: true
    },
    answers: [singleAnswerSchema],
    score: {
      type: Number,
      required: true,
      default: 0
    },
    totalPossibleScore: {
      type: Number,
      required: true,
      default: 0
    },
    percentage: {
      type: Number,
      required: true,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    timeTakenSeconds: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Attempt', attemptSchema);
