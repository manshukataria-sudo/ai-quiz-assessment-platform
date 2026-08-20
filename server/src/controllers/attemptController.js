const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

/**
 * @desc    Submit a quiz attempt and calculate score
 * @route   POST /api/attempts/submit
 * @access  Private
 */
const submitAttempt = async (req, res) => {
  try {
    const { quizId, answers, timeTakenSeconds } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission data: quizId and answers array are required.'
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    let earnedScore = 0;
    let totalPossibleScore = 0;
    const evaluatedAnswers = [];

    // Evaluate each submitted answer against the Quiz questions
    quiz.questions.forEach((question, index) => {
      const qPoints = question.points || 1;
      totalPossibleScore += qPoints;

      // Find user's answer for this question
      const submittedAns = answers.find(
        (a) => a.questionIndex === index || a.questionId === question._id.toString()
      );

      const selectedOptionIndex = submittedAns !== undefined ? submittedAns.selectedOptionIndex : -1;
      const isCorrect = selectedOptionIndex === question.correctOptionIndex;
      const pointsAwarded = isCorrect ? qPoints : 0;

      if (isCorrect) {
        earnedScore += qPoints;
      }

      evaluatedAnswers.push({
        questionIndex: index,
        questionText: question.questionText,
        options: question.options,
        selectedOptionIndex,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect,
        pointsAwarded,
        explanation: question.explanation || ''
      });
    });

    const percentage = totalPossibleScore > 0 ? Math.round((earnedScore / totalPossibleScore) * 100) : 0;
    const passed = percentage >= 60;

    // Create persistent attempt record
    const attempt = await Attempt.create({
      user: req.user._id,
      quiz: quiz._id,
      quizTitle: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      answers: evaluatedAnswers,
      score: earnedScore,
      totalPossibleScore,
      percentage,
      passed,
      timeTakenSeconds: timeTakenSeconds || 0
    });

    res.status(201).json({
      success: true,
      message: 'Quiz attempt evaluated and recorded successfully',
      data: attempt
    });
  } catch (error) {
    console.error('[Attempt Submission Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all attempts for logged in user
 * @route   GET /api/attempts/my-attempts
 * @access  Private
 */
const getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('quiz', 'title topic difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single attempt details
 * @route   GET /api/attempts/:id
 * @access  Private
 */
const getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('user', 'name email')
      .populate('quiz', 'title topic difficulty questions');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt record not found'
      });
    }

    // Ensure user is authorized to view this attempt
    if (attempt.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attempt'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get user performance statistics for dashboard analytics
 * @route   GET /api/attempts/analytics
 * @access  Private
 */
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await Attempt.find({ user: userId }).sort({ createdAt: -1 });

    if (attempts.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalQuizzes: 0,
          averageScore: 0,
          passRate: 0,
          passedCount: 0,
          failedCount: 0,
          recentAttempts: [],
          difficultyDistribution: { easy: 0, medium: 0, hard: 0 }
        }
      });
    }

    const totalQuizzes = attempts.length;
    const totalPercentageSum = attempts.reduce((sum, a) => sum + a.percentage, 0);
    const averageScore = Math.round(totalPercentageSum / totalQuizzes);
    const passedCount = attempts.filter((a) => a.passed).length;
    const failedCount = totalQuizzes - passedCount;
    const passRate = Math.round((passedCount / totalQuizzes) * 100);

    const difficultyDistribution = {
      easy: attempts.filter((a) => a.difficulty === 'easy').length,
      medium: attempts.filter((a) => a.difficulty === 'medium').length,
      hard: attempts.filter((a) => a.difficulty === 'hard').length
    };

    // Calculate score trends across last 7 attempts
    const scoreTrends = attempts.slice(0, 7).reverse().map((a) => ({
      date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      quizTitle: a.quizTitle,
      percentage: a.percentage,
      topic: a.topic
    }));

    res.status(200).json({
      success: true,
      data: {
        totalQuizzes,
        averageScore,
        passRate,
        passedCount,
        failedCount,
        difficultyDistribution,
        scoreTrends,
        recentAttempts: attempts.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  submitAttempt,
  getMyAttempts,
  getAttemptById,
  getUserAnalytics
};
