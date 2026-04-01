const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// Existing routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Forgot & Reset password routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;