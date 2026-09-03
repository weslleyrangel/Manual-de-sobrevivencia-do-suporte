const db = require('../config/db');

exports.search = async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'O parâmetro de busca "q" é obrigatório' });
        }

        // Full Text Search across problems (title, description, category) com fallback ILIKE
        const sql = `
            SELECT p.id, p.title, p.category, p.description as snippet, 
                   p.views_count, p.likes_count, p.created_at,
                   u.name as author_name, u.role as author_role,
                   ts_rank(
                       to_tsvector('portuguese', coalesce(p.title, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.category, '')), 
                       plainto_tsquery('portuguese', $1)
                   ) as rank
            FROM problems p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE to_tsvector('portuguese', coalesce(p.title, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce(p.category, '')) @@ plainto_tsquery('portuguese', $1)
               OR p.title ILIKE '%' || $1 || '%'
               OR p.description ILIKE '%' || $1 || '%'
               OR p.category ILIKE '%' || $1 || '%'
            ORDER BY rank DESC, p.views_count DESC
            LIMIT 30;
        `;

        const result = await db.query(sql, [query]);
        return res.status(200).json(result ? result.rows : []);
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ error: 'Server error during search' });
    }
};
