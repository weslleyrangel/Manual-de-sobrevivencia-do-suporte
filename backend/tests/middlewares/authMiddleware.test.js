jest.mock('../../src/config/db', () => ({
    query: jest.fn()
}));
const db = require('../../src/config/db');
const authMiddleware = require('../../src/middlewares/authMiddleware');

const buildRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('authMiddleware', () => {
    afterEach(() => {
        delete process.env.LOCAL_MODE;
        delete process.env.LOCAL_USER_EMAIL;
        jest.clearAllMocks();
    });

    it('retorna 401 sem token quando LOCAL_MODE não está ativo', async () => {
        const req = { cookies: {} };
        const res = buildRes();
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
        expect(db.query).not.toHaveBeenCalled();
    });

    it('em LOCAL_MODE, injeta o usuário local quando não há token', async () => {
        process.env.LOCAL_MODE = 'true';
        process.env.LOCAL_USER_EMAIL = 'Admin@Suporte.com';
        db.query.mockResolvedValue({
            rows: [{ id: 1, name: 'Weslley Rangel', email: 'admin@suporte.com', role: 'ADMIN', is_verified: true }]
        });

        const req = { cookies: {} };
        const res = buildRes();
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(db.query).toHaveBeenCalledWith(expect.any(String), ['admin@suporte.com']);
        expect(next).toHaveBeenCalledWith();
        expect(req.user.userId).toBe(1);
        expect(req.securityContext).toEqual({ userId: '1', roles: ['ADMIN'], isVerified: true });
    });

    it('em LOCAL_MODE, retorna 401 se o usuário local não existir', async () => {
        process.env.LOCAL_MODE = 'true';
        db.query.mockResolvedValue({ rows: [] });
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const req = { cookies: {} };
        const res = buildRes();
        const next = jest.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});

