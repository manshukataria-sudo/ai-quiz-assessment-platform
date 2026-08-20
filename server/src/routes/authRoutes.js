const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', register);
router.post('/login', login);

// Protected endpoints
router.get('/me', protect, getMe);

module.exports = router;
