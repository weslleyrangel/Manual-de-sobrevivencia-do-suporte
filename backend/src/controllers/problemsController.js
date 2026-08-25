const db = require('../config/db');

exports.listProblems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const result = await db.query(
            'SELECT * FROM problems ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.createProblem = async (req, res) => {
    try {
        const { title, description } = req.body;
        const author_id = req.user.userId;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const result = await db.query(
            'INSERT INTO problems (title, description, author_id) VALUES ($1, $2, $3) RETURNING id',
            [title, description, author_id]
        );

        return res.status(201).json({
            id: result.rows[0].id,
            message: 'Problema registrado'
        });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.getProblem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const problemResult = await db.query('SELECT * FROM problems WHERE id = $1', [id]);
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problema não encontrado' });
        }

        const problem = problemResult.rows[0];

        const solutionsResult = await db.query('SELECT * FROM solutions WHERE problem_id = $1 ORDER BY created_at ASC', [id]);
        problem.solutions = solutionsResult.rows;

        return res.status(200).json(problem);
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.addSolution = async (req, res) => {
    try {
        const { id: problem_id } = req.params;
        const { content, media_urls } = req.body;
        const author_id = req.user.userId;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const result = await db.query(
            'INSERT INTO solutions (problem_id, author_id, content, media_urls) VALUES ($1, $2, $3, $4) RETURNING id',
            [problem_id, author_id, content, media_urls || []]
        );

        return res.status(201).json({
            solution_id: result.rows[0].id,
            message: 'Solução alternativa adicionada'
        });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};
