const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companiesController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Rotas públicas ou para usuários autenticados (incluindo Convidado)
router.get('/', authMiddleware, companiesController.listCompanies);
router.get('/:companyId', authMiddleware, companiesController.getCompanyDetails);
router.get('/:companyId/problems', authMiddleware, companiesController.getCompanyProblems);

// Rotas exclusivas para ADMIN
router.post('/', authMiddleware, adminMiddleware, companiesController.createCompany);
router.post('/:companyId/categories', authMiddleware, adminMiddleware, companiesController.createCategory);
router.post('/:companyId/sectors', authMiddleware, adminMiddleware, companiesController.createSector);

module.exports = router;

