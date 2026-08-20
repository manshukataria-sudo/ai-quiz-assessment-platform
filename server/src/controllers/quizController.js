const Quiz = require('../models/Quiz');
const geminiService = require('../services/geminiService');

/**
 * @desc    Generate a new quiz dynamically using Google Gemini AI
 * @route   POST /api/quizzes/generate-ai
 * @access  Private
 */
const generateAIQuiz = async (req, res) => {
  try {
    const { topic, difficulty, numQuestions, customInstructions } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a topic for the quiz.'
      });
    }

    // Call Gemini Generative AI Service
    const aiQuizData = await geminiService.generateQuiz({
      topic,
      difficulty: difficulty || 'medium',
      numQuestions: numQuestions || 5,
      customInstructions
    });

    // Save generated quiz to MongoDB
    const newQuiz = await Quiz.create({
      title: aiQuizData.title || `${topic} AI Assessment`,
      description: aiQuizData.description || `Assessment on ${topic}`,
      topic: aiQuizData.topic || topic,
      difficulty: aiQuizData.difficulty || difficulty || 'medium',
      creator: req.user._id,
      isAIGenerated: true,
      timeLimitMinutes: Math.max((aiQuizData.questions.length || 5) * 2, 5),
      questions: aiQuizData.questions
    });

    res.status(201).json({
      success: true,
      message: 'AI Quiz generated and saved successfully',
      data: newQuiz
    });
  } catch (error) {
    console.error('[Quiz Controller AI Generation Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI quiz: ' + error.message
    });
  }
};

/**
 * @desc    Create a quiz manually
 * @route   POST /api/quizzes
 * @access  Private
 */
const createQuiz = async (req, res) => {
  try {
    const { title, description, topic, difficulty, questions, timeLimitMinutes } = req.body;

    if (!title || !topic || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, topic, and at least one question.'
      });
    }

    const quiz = await Quiz.create({
      title,
      description,
      topic,
      difficulty: difficulty || 'medium',
      creator: req.user._id,
      isAIGenerated: false,
      timeLimitMinutes: timeLimitMinutes || 10,
      questions
    });

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all available quizzes (with optional topic/difficulty filters)
 * @route   GET /api/quizzes
 * @access  Public / Private
 */
const getAllQuizzes = async (req, res) => {
  try {
    const { topic, difficulty, search } = req.query;
    const filter = {};

    if (topic) filter.topic = { $regex: topic, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const quizzes = await Quiz.find(filter)
      .populate('creator', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get a single quiz by ID
 * @route   GET /api/quizzes/:id
 * @access  Public / Private
 */
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('creator', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete a quiz
 * @route   DELETE /api/quizzes/:id
 * @access  Private
 */
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check ownership or admin
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  generateAIQuiz,
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz
};
