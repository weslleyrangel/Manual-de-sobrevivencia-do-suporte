const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

module.exports = (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) {
        return res.status(401).json({ error: 'Acesso negado, token ausente' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Maintains backwards compatibility with controllers

        // Injeta o securityContext para os Use Cases do DDD
        const Roles = require('../domain/constants/Roles');
        const role = decoded.role || Roles.MEMBER;
        // Padronizamos sem o prefixo 'ROLE_' para manter simetria com banco de dados
        const normalizedRole = role.replace(/^ROLE_/, '');

        req.securityContext = {
            userId: String(decoded.userId || decoded.id),
            roles: [normalizedRole],
            isVerified: Boolean(decoded.isVerified ?? decoded.is_verified)
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
