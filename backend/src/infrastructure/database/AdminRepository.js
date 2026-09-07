const db = require('../../config/db');

class AdminRepository {
    async getDashboardStats() {
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

        const solutionsStatsQuery = await db.query(`
            SELECT COUNT(*)::int AS total_solutions FROM solutions
        `);

        const categoriesQuery = await db.query(`
            SELECT category, COUNT(*)::int AS count 
            FROM problems 
            WHERE is_draft = FALSE 
            GROUP BY category 
            ORDER BY count DESC
        `);

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

        return {
            users: usersStatsQuery.rows[0],
            problems: problemsStatsQuery.rows[0],
            solutions: solutionsStatsQuery.rows[0],
            categories: categoriesQuery.rows,
            pendingProblems: pendingProblemsQuery.rows
        };
    }

    async listUsers({ q, role, status, limit, offset }) {
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

        return { users: usersQuery.rows, total };
    }

    async updateUserRole(id, role, jobTitle) {
        const updateFields = ['role = $1'];
        const params = [role];

        if (jobTitle !== undefined) {
            params.push(jobTitle);
            updateFields.push(`job_title = $${params.length}`);
        }

        params.push(id);
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${params.length} RETURNING id, name, email, role, job_title, is_verified, is_blocked`;

        const result = await db.query(query, params);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async updateUserStatus(id, isBlocked, isVerified) {
        const updateFields = [];
        const params = [];

        if (isBlocked !== undefined) {
            params.push(Boolean(isBlocked));
            updateFields.push(`is_blocked = $${params.length}`);
        }

        if (isVerified !== undefined) {
            params.push(Boolean(isVerified));
            updateFields.push(`is_verified = $${params.length}`);
        }

        if (updateFields.length === 0) {
            return null;
        }

        params.push(id);
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${params.length} RETURNING id, name, email, role, job_title, is_verified, is_blocked`;

        const result = await db.query(query, params);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async findUserById(id) {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async updateVerificationToken(id, token, expiresAt) {
        await db.query(
            'UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3',
            [token, expiresAt, id]
        );
    }

    async listProblemsAdmin({ q, category, status, hasSolution, limit, offset }) {
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

        if (hasSolution === 'true') {
            conditions.push(`p.accepted_solution_id IS NOT NULL`);
        } else if (hasSolution === 'false') {
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

        return { problems: problemsQuery.rows, total };
    }

    async moderateProblem(id, { title, category, status, action }) {
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
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async deleteProblem(id) {
        const result = await db.query('DELETE FROM problems WHERE id = $1 RETURNING id, title', [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }
}

module.exports = new AdminRepository();
