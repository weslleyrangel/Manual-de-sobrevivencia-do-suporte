const db = require('../config/db');

// Listar todas as empresas com contador de casos e categorias
exports.listCompanies = async (req, res, next) => {
    try {
        const query = `
            SELECT c.id, c.name, c.created_at,
                   COUNT(DISTINCT p.id)::int AS problems_count,
                   COUNT(DISTINCT cat.id)::int AS categories_count,
                   COUNT(DISTINCT s.id)::int AS sectors_count
            FROM companies c
            LEFT JOIN problems p ON p.company_id = c.id
            LEFT JOIN categories cat ON cat.company_id = c.id
            LEFT JOIN sectors s ON s.company_id = c.id
            GROUP BY c.id, c.name, c.created_at
            ORDER BY c.name ASC
        `;
        const result = await db.query(query);
        return res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Criar nova empresa (Somente ADMIN)
exports.createCompany = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'O nome da empresa é obrigatório.' });
        }

        const trimmed = name.trim();
        const check = await db.query('SELECT id FROM companies WHERE LOWER(name) = LOWER($1)', [trimmed]);
        if (check.rows && check.rows.length > 0) {
            return res.status(400).json({ error: 'Já existe uma empresa cadastrada com este nome.' });
        }

        const result = await db.query(
            'INSERT INTO companies (name) VALUES ($1) RETURNING *',
            [trimmed]
        );
        const newCompany = result.rows[0];

        // Cria setores e categorias padrão para a nova empresa
        await db.query(
            `INSERT INTO sectors (company_id, name) VALUES 
             ($1, 'Geral'), ($1, 'Suporte N1'), ($1, 'Suporte N2')
             ON CONFLICT DO NOTHING`,
            [newCompany.id]
        );

        await db.query(
            `INSERT INTO categories (company_id, name) VALUES 
             ($1, 'Geral'), ($1, 'Atendimento'), ($1, 'Ferramentas')
             ON CONFLICT DO NOTHING`,
            [newCompany.id]
        );

        return res.status(201).json(newCompany);
    } catch (error) {
        next(error);
    }
};

// Obter detalhes de uma empresa (inclui seus setores e suas categorias)
exports.getCompanyDetails = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const compRes = await db.query('SELECT * FROM companies WHERE id = $1', [companyId]);
        if (!compRes.rows || compRes.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }

        const company = compRes.rows[0];

        const [sectorsRes, categoriesRes, countsRes] = await Promise.all([
            db.query('SELECT id, name, created_at FROM sectors WHERE company_id = $1 ORDER BY name ASC', [companyId]),
            db.query('SELECT id, name, created_at FROM categories WHERE company_id = $1 ORDER BY name ASC', [companyId]),
            db.query(`
                SELECT p.category, p.sector_id, COUNT(p.id)::int AS count
                FROM problems p
                WHERE p.company_id = $1
                GROUP BY p.category, p.sector_id
            `, [companyId])
        ]);

        return res.status(200).json({
            company,
            sectors: sectorsRes.rows,
            categories: categoriesRes.rows,
            counts: countsRes.rows
        });
    } catch (error) {
        next(error);
    }
};

// Criar categoria em uma empresa (Somente ADMIN)
exports.createCategory = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
        }

        const trimmed = name.trim();
        const check = await db.query(
            'SELECT id FROM categories WHERE company_id = $1 AND LOWER(name) = LOWER($2)',
            [companyId, trimmed]
        );
        if (check.rows && check.rows.length > 0) {
            return res.status(400).json({ error: 'Esta categoria já existe nesta empresa.' });
        }

        const result = await db.query(
            'INSERT INTO categories (company_id, name) VALUES ($1, $2) RETURNING *',
            [companyId, trimmed]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Criar setor em uma empresa (Somente ADMIN)
exports.createSector = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'O nome do setor é obrigatório.' });
        }

        const trimmed = name.trim();
        const check = await db.query(
            'SELECT id FROM sectors WHERE company_id = $1 AND LOWER(name) = LOWER($2)',
            [companyId, trimmed]
        );
        if (check.rows && check.rows.length > 0) {
            return res.status(400).json({ error: 'Este setor já existe nesta empresa.' });
        }

        const result = await db.query(
            'INSERT INTO sectors (company_id, name) VALUES ($1, $2) RETURNING *',
            [companyId, trimmed]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Listar casos de uma empresa com suporte a filtros por categoria e setor
exports.getCompanyProblems = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const { category, sector_id, q } = req.query;

        let sql = `
            SELECT p.id, p.title, p.category, p.description, p.status, p.views_count, p.likes_count,
                   p.company_id, p.sector_id, p.created_at,
                   u.id AS author_id, u.name AS author_name, u.role AS author_role,
                   s.name AS sector_name,
                   (SELECT COUNT(*) FROM solutions sol WHERE sol.problem_id = p.id)::int AS solutions_count
            FROM problems p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN sectors s ON p.sector_id = s.id
            WHERE p.company_id = $1
        `;
        const params = [companyId];

        if (category && category.trim() !== '') {
            params.push(category.trim());
            sql += ` AND p.category = $${params.length}`;
        }

        if (sector_id && sector_id !== 'all' && !isNaN(parseInt(sector_id))) {
            params.push(parseInt(sector_id));
            sql += ` AND p.sector_id = $${params.length}`;
        }

        if (q && q.trim() !== '') {
            params.push(`%${q.trim()}%`);
            sql += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
        }

        sql += ' ORDER BY p.created_at DESC';

        const result = await db.query(sql, params);
        return res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

