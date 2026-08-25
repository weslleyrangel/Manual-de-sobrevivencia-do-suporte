const express = require('express');
const router = express.Router();
const problemsController = require('../controllers/problemsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', problemsController.listProblems);
router.post('/', authMiddleware, problemsController.createProblem);
router.get('/:id', problemsController.getProblem);
router.post('/:id/solutions', authMiddleware, problemsController.addSolution);

module.exports = router;
