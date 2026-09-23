const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nama lengkap wajib diisi'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    validate
  ],
  AuthController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
    validate
  ],
  AuthController.login
);

// Get current user profile
router.get('/me', authenticate, AuthController.getMe);

// Update profile
router.put('/profile', authenticate, AuthController.updateProfile);

// Change password
router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Password saat ini wajib diisi'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter'),
    validate
  ],
  AuthController.changePassword
);

module.exports = router;
