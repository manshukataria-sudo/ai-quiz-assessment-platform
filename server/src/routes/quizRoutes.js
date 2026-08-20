const express = require('express');
const router = express.Router();
const {
  generateAIQuiz,
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view quizzes
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);

// Protected routes to generate or manage quizzes
router.post('/generate-ai', protect, generateAIQuiz);
router.post('/', protect, createQuiz);
router.delete('/:id', protect, deleteQuiz);

module.exports = router;
