const db = require('../config/db');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

// 1. Métricas do Dashboard Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // Estatísticas de Usuários
        const usersStatsQuery = await db.query(`
            SELECT 
                COUNT(*)::int AS total_users,
                COUNT(CASE WHEN is_verified = TRUE THEN 1 END)::int AS verified_users,
                COUNT(CASE WHEN is_verified = FALSE THEN 1 END)::int AS pending_users,
                COUNT(CASE WHEN is_blocked = TRUE THEN 1 END)::int AS blocked_users,
                COUNT(CASE WHEN UPPER(role) LIKE '%ADMIN%' THEN 1 END)::int AS admin_users,
                COUNT(CASE WHEN UPPER(role) LIKE '%MODERATOR%' OR UPPER(role) LIKE '%TECNICO%' THEN 1 END)::int AS tech_users,
                COUNT(CASE WHEN UPPER(role) NOT LIKE '%ADMIN%' AND UPPER(role) NOT LIKE '%MODERATOR%' AND UPPER(role) NOT LIKE '%TECNICO%' THEN 1 END)::int AS member_users
            FROM users
        `);

        // Estatísticas de Problemas / Publicações
        const problemsStatsQuery = await db.query(`
            SELECT 
                COUNT(*)::int AS total_problems,
                COUNT(CASE WHEN status = 'RESOLVIDO' OR status = 'RESOLVIDA' THEN 1 END)::int AS solved_problems,
                COUNT(CASE WHEN status = 'ABERTA' OR status = 'ABERTO' THEN 1 END)::int AS open_problems,
                COUNT(CASE WHEN status LIKE 'FECHADA%' OR status LIKE 'ENCERRADO%' THEN 1 END)::int AS closed_admin_problems,
                COUNT(CASE WHEN is_draft = TRUE THEN 1 END)::int AS draft_problems,
                COUNT(CASE WHEN accepted_solution_id IS NOT NULL THEN 1 END)::int AS problems_with_accepted_solution
            FROM problems
        `);

        // Total de Soluções
        const solutionsStatsQuery = await db.query(`
            SELECT COUNT(*)::int AS total_solutions FROM solutions
        `);

        // Distribuição por Categoria
        const categoriesQuery = await db.query(`
            SELECT category, COUNT(*)::int AS count 
            FROM problems 
            WHERE is_draft = FALSE 
            GROUP BY category 
            ORDER BY count DESC
        `);

        // 5 Chamados recentes aguardando resposta
        const pendingProblemsQuery = await db.query(`
            SELECT p.id, p.title, p.category, p.status, p.created_at,
                   u.name AS author_name,
                   (SELECT COUNT(*) FROM solutions s WHERE s.problem_id = p.id)::int AS solutions_count
            FROM problems p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.status IN ('ABERTA', 'ABERTO') AND p.is_draft = FALSE
            ORDER BY p.created_at DESC
            LIMIT 5
        `);

        return res.status(200).json({
            users: usersStatsQuery.rows[0],
            problems: problemsStatsQuery.rows[0],
            solutions: solutionsStatsQuery.rows[0],
            categories: categoriesQuery.rows,
            pendingProblems: pendingProblemsQuery.rows
        });
    } catch (error) {
        console.error('Erro ao carregar estatísticas admin:', error);
        return res.status(500).json({ error: 'Erro ao obter métricas administrativas.' });
    }
};

// 2. Listagem de Usuários com Filtros e Paginação
exports.listUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { q, role, status } = req.query;

        const conditions = [];
        const params = [];

        if (q && q.trim()) {
            params.push(`%${q.trim()}%`);
            conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.job_title ILIKE $${params.length})`);
        }

        if (role && role !== 'ALL') {
            params.push(role);
            conditions.push(`u.role = $${params.length}`);
        }

        if (status === 'verified') {
            conditions.push(`u.is_verified = TRUE`);
        } else if (status === 'pending') {
            conditions.push(`u.is_verified = FALSE`);
        } else if (status === 'blocked') {
            conditions.push(`u.is_blocked = TRUE`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countQuery = await db.query(`SELECT COUNT(*)::int AS total FROM users u ${whereClause}`, params);
        const total = countQuery.rows[0]?.total || 0;

        params.push(limit);
        const limitParam = `$${params.length}`;
        params.push(offset);
        const offsetParam = `$${params.length}`;

        const usersQuery = await db.query(`
            SELECT 
                u.id, u.name, u.email, u.role, u.job_title, u.is_verified, 
                COALESCE(u.is_blocked, FALSE) AS is_blocked, u.created_at,
                (SELECT COUNT(*) FROM problems p WHERE p.author_id = u.id)::int AS publications_count,
                (SELECT COUNT(*) FROM solutions s WHERE s.author_id = u.id)::int AS solutions_count
            FROM users u
            ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ${limitParam} OFFSET ${offsetParam}
        `, params);

        return res.status(200).json({
            users: usersQuery.rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        return res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
};

// 3. Atualizar Cargo/Role de Usuário
exports.updateUserRole = async (req, res) => {
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

        const updateFields = ['role = $1'];
        const params = [normalizedRole];

        if (job_title !== undefined) {
            params.push(job_title);
            updateFields.push(`job_title = $${params.length}`);
        }

        params.push(id);
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${params.length} RETURNING id, name, email, role, job_title, is_verified, is_blocked`;

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        return res.status(200).json({
            message: 'Papel do usuário atualizado com sucesso.',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar papel do usuário:', error);
        return res.status(500).json({ error: 'Erro ao atualizar papel do usuário.' });
    }
};

// 4. Atualizar Status de Usuário (Bloqueio / Ativação)
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_blocked, is_verified } = req.body;

        const updateFields = [];
        const params = [];

        if (is_blocked !== undefined) {
            params.push(Boolean(is_blocked));
            updateFields.push(`is_blocked = $${params.length}`);
        }

        if (is_verified !== undefined) {
            params.push(Boolean(is_verified));
            updateFields.push(`is_verified = $${params.length}`);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Nenhum status fornecido para atualização.' });
        }

        params.push(id);
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${params.length} RETURNING id, name, email, role, job_title, is_verified, is_blocked`;

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        return res.status(200).json({
            message: 'Status do usuário atualizado com sucesso.',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar status do usuário:', error);
        return res.status(500).json({ error: 'Erro ao atualizar status do usuário.' });
    }
};

// 5. Reenviar Verificação de E-mail Manualmente
exports.resendUserVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const user = result.rows[0];
        const verificationToken = jwt.sign(
            { email: user.email, type: 'EMAIL_VERIFY' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.query(
            'UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3',
            [verificationToken, tokenExpiresAt, id]
        );

        await emailService.sendVerificationEmail(user.email, verificationToken, user.name);

        return res.status(200).json({ message: 'E-mail de verificação reenviado com sucesso.' });
    } catch (error) {
        console.error('Erro ao reenviar verificação:', error);
        return res.status(500).json({ error: 'Erro ao reenviar e-mail de verificação.' });
    }
};

// 6. Listar Publicações para Moderação Admin
exports.listProblemsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const offset = (page - 1) * limit;
        const { q, category, status, has_solution } = req.query;

        const conditions = [];
        const params = [];

        if (q && q.trim()) {
            params.push(`%${q.trim()}%`);
            conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
        }

        if (category && category !== 'ALL') {
            params.push(category);
            conditions.push(`p.category = $${params.length}`);
        }

        if (status && status !== 'ALL') {
            params.push(status);
            conditions.push(`p.status = $${params.length}`);
        }

        if (has_solution === 'true') {
            conditions.push(`p.accepted_solution_id IS NOT NULL`);
        } else if (has_solution === 'false') {
            conditions.push(`p.accepted_solution_id IS NULL`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countQuery = await db.query(`SELECT COUNT(*)::int AS total FROM problems p ${whereClause}`, params);
        const total = countQuery.rows[0]?.total || 0;

        params.push(limit);
        const limitParam = `$${params.length}`;
        params.push(offset);
        const offsetParam = `$${params.length}`;

        const problemsQuery = await db.query(`
            SELECT 
                p.id, p.title, p.category, p.description, p.status, p.views_count, p.likes_count,
                p.is_draft, p.accepted_solution_id, p.closing_reason, p.closed_at, p.created_at,
                u.id AS author_id, u.name AS author_name, u.email AS author_email, u.role AS author_role,
                (SELECT COUNT(*) FROM solutions s WHERE s.problem_id = p.id)::int AS solutions_count
            FROM problems p
            LEFT JOIN users u ON p.author_id = u.id
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT ${limitParam} OFFSET ${offsetParam}
        `, params);

        return res.status(200).json({
            problems: problemsQuery.rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1
        });
    } catch (error) {
        console.error('Erro ao listar problemas no admin:', error);
        return res.status(500).json({ error: 'Erro ao listar publicações.' });
    }
};

// 7. Moderação de Publicação (Alterar status, categoria, reabrir)
exports.moderateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, status, action } = req.body;

        const updateFields = ['updated_at = CURRENT_TIMESTAMP'];
        const params = [];

        if (title) {
            params.push(title);
            updateFields.push(`title = $${params.length}`);
        }

        if (category) {
            params.push(category);
            updateFields.push(`category = $${params.length}`);
        }

        if (action === 'reopen') {
            updateFields.push(`status = 'ABERTA'`);
            updateFields.push(`closing_reason = NULL`);
            updateFields.push(`closed_at = NULL`);
        } else if (status) {
            params.push(status);
            updateFields.push(`status = $${params.length}`);
        }

        params.push(id);
        const query = `UPDATE problems SET ${updateFields.join(', ')} WHERE id = $${params.length} RETURNING *`;

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        return res.status(200).json({
            message: 'Publicação moderada com sucesso.',
            problem: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao moderar publicação:', error);
        return res.status(500).json({ error: 'Erro ao moderar publicação.' });
    }
};

// 8. Exclusão de Publicação pelo Admin
exports.deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM problems WHERE id = $1 RETURNING id, title', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Publicação não encontrada.' });
        }

        return res.status(200).json({
            message: 'Publicação excluída com sucesso.',
            deletedId: result.rows[0].id
        });
    } catch (error) {
        console.error('Erro ao excluir publicação:', error);
        return res.status(500).json({ error: 'Erro ao excluir publicação.' });
    }
};
