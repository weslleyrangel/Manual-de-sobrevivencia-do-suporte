const db = require('../config/db');

exports.search = async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query) {
            return res.status(400).json({ error: 'O parâmetro de busca "q" é obrigatório' });
        }

        // Full Text Search across problems (title and description)
        // In a real app we could also JOIN solutions, but let's start with problems.
        const sql = `
            SELECT id, title, description,
                   ts_rank(
                       to_tsvector('portuguese', title || ' ' || description), 
                       plainto_tsquery('portuguese', $1)
                   ) as rank
            FROM problems
            WHERE to_tsvector('portuguese', title || ' ' || description) @@ plainto_tsquery('portuguese', $1)
            ORDER BY rank DESC
            LIMIT 20;
        `;

        const result = await db.query(sql, [query]);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error during search' });
    }
};
