const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');
const adminRepository = require('../infrastructure/database/AdminRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

// 1. Métricas do Dashboard Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const stats = await adminRepository.getDashboardStats();
        return res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
};

// 2. Listagem de Usuários com Filtros e Paginação
exports.listUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { q, role, status } = req.query;

        const { users, total } = await adminRepository.listUsers({ q, role, status, limit, offset });

        return res.status(200).json({
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1
        });
    } catch (error) {
        next(error);
    }
};

// 3. Atualizar Cargo/Role de Usuário
exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, job_title } = req.body;

        if (!role) {
            return res.status(400).json({ error: 'O papel (role) é obrigatório.' });
        }

        const normalizedRole = role.toUpperCase().trim();
        const validRoles = ['ADMIN', 'ROLE_ADMIN', 'MODERATOR', 'ROLE_TECNICO', 'MEMBER', 'ROLE_USUARIO'];
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({ error: 'Papel de usuário inválido.' });
        }

        const user = await adminRepository.updateUserRole(id, normalizedRole, job_title);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        return res.status(200).json({
            message: 'Papel do usuário atualizado com sucesso.',
            user
        });
    } catch (error) {
        next(error);
    }
};

// 4. Atualizar Status de Usuário (Bloqueio / Ativação)
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_blocked, is_verified } = req.body;

        if (is_blocked === undefined && is_verified === undefined) {
            return res.status(400).json({ error: 'Nenhum status fornecido para atualização.' });
        }

        const user = await adminRepository.updateUserStatus(id, is_blocked, is_verified);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        return res.status(200).json({
            message: 'Status do usuário atualizado com sucesso.',
            user
        });
    } catch (error) {
        next(error);
    }
};

// 5. Reenviar Verificação de E-mail Manualmente
exports.resendUserVerification = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await adminRepository.findUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const verificationToken = jwt.sign(
            { email: user.email, type: 'EMAIL_VERIFY' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await adminRepository.updateVerificationToken(id, verificationToken, tokenExpiresAt);

        await emailService.sendVerificationEmail(user.email, verificationToken, user.name);

        return res.status(200).json({ message: 'E-mail de verificação reenviado com sucesso.' });
    } catch (error) {
        next(error);
    }
};

// 6. Listar Publicações para Moderação Admin
exports.listProblemsAdmin = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const offset = (page - 1) * limit;
        const { q, category, status, has_solution } = req.query;

        const { problems, total } = await adminRepository.listProblemsAdmin({
            q, category, status, hasSolution: has_solution, limit, offset
        });

        return res.status(200).json({
            problems,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1
        });
    } catch (error) {
        next(error);
    }
};

// 7. Moderação de Publicação (Alterar status, categoria, reabrir)
exports.moderateProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, category, status, action } = req.body;

        const problem = await adminRepository.moderateProblem(id, { title, category, status, action });

        if (!problem) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        return res.status(200).json({
            message: 'Publicação moderada com sucesso.',
            problem
        });
    } catch (error) {
        next(error);
    }
};

// 8. Exclusão de Publicação pelo Admin
exports.deleteProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const deleted = await adminRepository.deleteProblem(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        return res.status(200).json({
            message: 'Publicação excluída com sucesso.',
            deletedId: deleted.id
        });
    } catch (error) {
        next(error);
    }
};
