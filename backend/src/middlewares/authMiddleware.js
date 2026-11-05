const jwt = require('jsonwebtoken');
const db = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

const buildSecurityContext = (decoded) => {
    const Roles = require('../domain/constants/Roles');
    const role = decoded.role || Roles.MEMBER;
    // Padronizamos sem o prefixo 'ROLE_' para manter simetria com banco de dados
    const normalizedRole = role.replace(/^ROLE_/, '');

    return {
        userId: String(decoded.userId || decoded.id),
        roles: [normalizedRole],
        isVerified: Boolean(decoded.isVerified ?? decoded.is_verified)
    };
};

/**
 * Modo de uso local (LOCAL_MODE=true): dispensa a tela de login.
 * Requisições sem token são atribuídas ao usuário definido em LOCAL_USER_EMAIL.
 * NÃO habilitar em ambientes expostos na rede.
 */
const resolveLocalUser = async () => {
    const email = (process.env.LOCAL_USER_EMAIL || 'admin@suporte.com').trim().toLowerCase();
    const result = await db.query(
        'SELECT id, name, email, role, is_verified FROM users WHERE email = $1',
        [email]
    );
    const user = result?.rows?.[0];
    if (!user) return null;

    return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified
    };
};

module.exports = async (req, res, next) => {
    const token = req.cookies?.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Maintains backwards compatibility with controllers
            // Injeta o securityContext para os Use Cases do DDD
            req.securityContext = buildSecurityContext(decoded);
            return next();
        } catch (err) {
            if (process.env.LOCAL_MODE !== 'true') {
                return res.status(401).json({ error: 'Token inválido' });
            }
            // Em modo local, um token inválido/expirado cai para o usuário local
        }
    }

    if (process.env.LOCAL_MODE === 'true') {
        try {
            const localUser = await resolveLocalUser();
            if (localUser) {
                req.user = localUser;
                req.securityContext = buildSecurityContext(localUser);
                return next();
            }
            console.warn('LOCAL_MODE ativo, mas o usuário de LOCAL_USER_EMAIL não existe no banco.');
        } catch (err) {
            return next(err);
        }
    }

    return res.status(401).json({ error: 'Acesso negado, token ausente' });
};
