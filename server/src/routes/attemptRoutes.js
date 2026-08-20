const express = require('express');
const router = express.Router();
const {
  submitAttempt,
  getMyAttempts,
  getAttemptById,
  getUserAnalytics
} = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

// All attempt routes require authentication
router.use(protect);

router.post('/submit', submitAttempt);
router.get('/my-attempts', getMyAttempts);
router.get('/analytics', getUserAnalytics);
router.get('/:id', getAttemptById);

module.exports = router;
