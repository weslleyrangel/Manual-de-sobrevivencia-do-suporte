module.exports = (req, res, next) => {
    const roles = req.securityContext?.roles || (req.user?.role ? [req.user.role] : []);
    const isAdmin = roles.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN');

    if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado. Requer privilégios de Administrador.' });
    }

    next();
};
