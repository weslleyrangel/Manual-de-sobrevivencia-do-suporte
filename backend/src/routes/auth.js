const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authRateLimiter, emailActionRateLimiter } = require('../middlewares/rateLimiter');

// Autenticação básica com rate limiting
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authController.logout);

// Ativação e verificação de e-mail
router.get('/verify/:token', authController.verifyEmail);
router.post('/resend-verification', emailActionRateLimiter, authController.resendVerification);

// Recuperação de senha
router.post('/forgot-password', emailActionRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);

// Sessão atual
router.get('/me', authMiddleware, authController.me);

module.exports = router;
