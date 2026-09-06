const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Todas as rotas administrativas requerem autenticação e ROLE_ADMIN
router.use(authMiddleware);
router.use(adminMiddleware);

// Métricas do Dashboard
router.get('/stats', adminController.getDashboardStats);

// Gestão de Usuários
router.get('/users', adminController.listUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.post('/users/:id/resend-verification', adminController.resendUserVerification);

// Gestão de Publicações & Moderação
router.get('/problems', adminController.listProblemsAdmin);
router.put('/problems/:id/moderation', adminController.moderateProblem);
router.delete('/problems/:id', adminController.deleteProblem);

module.exports = router;
