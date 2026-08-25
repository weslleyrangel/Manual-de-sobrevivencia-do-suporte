const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

module.exports = (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) {
        return res.status(401).json({ error: 'Acesso negado, token ausente' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // injeta os dados do usuário (ex: userId) na requisição
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
