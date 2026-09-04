const express = require('express');
const router = express.Router();
const problemsController = require('../controllers/problemsController');
const authMiddleware = require('../middlewares/authMiddleware');

// 1. Leituras (Públicas / Autenticadas)
router.get('/', problemsController.listProblems);
router.get('/:id', problemsController.getProblem);

// 2. Criação de Perguntas e Soluções (Requer Autenticação)
router.post('/', authMiddleware, problemsController.createProblem);
router.post('/:id/solutions', authMiddleware, problemsController.addSolution);

// 3. ABAC: Aceitar e Editar Soluções (Requer Autenticação e Validação de Propriedade)
router.put('/:id/solutions/:solutionId/accept', authMiddleware, problemsController.acceptSolution);
router.put('/:id/solutions/:solutionId', authMiddleware, problemsController.editSolution);

// 4. RBAC: Encerramento Administrativo (Requer Autenticação de Técnico/Admin)
router.post('/:id/close-admin', authMiddleware, problemsController.closeProblemAdmin);

module.exports = router;
