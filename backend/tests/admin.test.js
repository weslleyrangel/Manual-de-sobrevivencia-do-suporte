const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

// Mock db
jest.mock('../src/config/db', () => ({
    query: jest.fn()
}));
const db = require('../src/config/db');

// Mock emailService
jest.mock('../src/services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));
const emailService = require('../src/services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';
const adminToken = jwt.sign({ userId: 1, email: 'admin@suporte.com', role: 'ROLE_ADMIN', isVerified: true }, JWT_SECRET);
const regularUserToken = jwt.sign({ userId: 2, email: 'user@suporte.com', role: 'ROLE_USUARIO', isVerified: true }, JWT_SECRET);

describe('Admin API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Admin Authorization Middleware', () => {
        it('should return 401 if unauthenticated', async () => {
            const res = await request(app).get('/api/v1/admin/stats');
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Acesso negado, token ausente');
        });

        it('should return 403 if authenticated user is not an admin', async () => {
            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Cookie', [`jwt=${regularUserToken}`]);
            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error', 'Acesso negado. Requer privilégios de Administrador.');
        });
    });

    describe('GET /api/v1/admin/stats', () => {
        it('should return dashboard metrics for admin', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ total_users: 10, verified_users: 8, pending_users: 2, blocked_users: 0, admin_users: 1, tech_users: 2, member_users: 7 }] })
                .mockResolvedValueOnce({ rows: [{ total_problems: 33, solved_problems: 25, open_problems: 8, closed_admin_problems: 0, draft_problems: 0, problems_with_accepted_solution: 25 }] })
                .mockResolvedValueOnce({ rows: [{ total_solutions: 50 }] })
                .mockResolvedValueOnce({ rows: [{ category: 'Redes', count: 12 }] })
                .mockResolvedValueOnce({ rows: [{ id: 1, title: 'Chamado pendente', category: 'Redes', status: 'ABERTA' }] });

            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Cookie', [`jwt=${adminToken}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('users');
            expect(res.body).toHaveProperty('problems');
            expect(res.body).toHaveProperty('solutions');
            expect(res.body).toHaveProperty('categories');
            expect(res.body.users.total_users).toBe(10);
        });
    });

    describe('GET /api/v1/admin/users', () => {
        it('should list paginated users with filters', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ total: 2 }] })
                .mockResolvedValueOnce({
                    rows: [
                        { id: 1, name: 'Admin', email: 'admin@suporte.com', role: 'ADMIN', is_verified: true, is_blocked: false },
                        { id: 2, name: 'User', email: 'user@suporte.com', role: 'MEMBER', is_verified: true, is_blocked: false }
                    ]
                });

            const res = await request(app)
                .get('/api/v1/admin/users?page=1&limit=10')
                .set('Cookie', [`jwt=${adminToken}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body.users.length).toBe(2);
            expect(res.body.total).toBe(2);
            expect(res.body.totalPages).toBe(1);
        });
    });

    describe('PUT /api/v1/admin/users/:id/role', () => {
        it('should update user role and job title', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 2, name: 'User', role: 'ROLE_TECNICO', job_title: 'Analista N2', is_verified: true, is_blocked: false }]
            });

            const res = await request(app)
                .put('/api/v1/admin/users/2/role')
                .set('Cookie', [`jwt=${adminToken}`])
                .send({ role: 'ROLE_TECNICO', job_title: 'Analista N2' });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.role).toBe('ROLE_TECNICO');
            expect(res.body.user.job_title).toBe('Analista N2');
        });

        it('should reject invalid role', async () => {
            const res = await request(app)
                .put('/api/v1/admin/users/2/role')
                .set('Cookie', [`jwt=${adminToken}`])
                .send({ role: 'INVALID_ROLE' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Papel de usuário inválido.');
        });
    });

    describe('PUT /api/v1/admin/users/:id/status', () => {
        it('should block or unblock user', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 2, name: 'User', role: 'MEMBER', is_verified: true, is_blocked: true }]
            });

            const res = await request(app)
                .put('/api/v1/admin/users/2/status')
                .set('Cookie', [`jwt=${adminToken}`])
                .send({ is_blocked: true });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.is_blocked).toBe(true);
        });
    });

    describe('POST /api/v1/admin/users/:id/resend-verification', () => {
        it('should resend verification email for user', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 2, name: 'User', email: 'user@suporte.com' }] })
                .mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .post('/api/v1/admin/users/2/resend-verification')
                .set('Cookie', [`jwt=${adminToken}`]);

            expect(res.statusCode).toBe(200);
            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith('user@suporte.com', expect.any(String), 'User');
        });
    });

    describe('GET /api/v1/admin/problems', () => {
        it('should list problems with moderation details', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ total: 1 }] })
                .mockResolvedValueOnce({
                    rows: [{ id: 1, title: 'VPN Fail', status: 'ABERTA', solutions_count: 3, author_name: 'Rafael' }]
                });

            const res = await request(app)
                .get('/api/v1/admin/problems?category=Redes')
                .set('Cookie', [`jwt=${adminToken}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body.problems.length).toBe(1);
            expect(res.body.problems[0].title).toBe('VPN Fail');
        });
    });

    describe('PUT /api/v1/admin/problems/:id/moderation', () => {
        it('should reopen a closed problem', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, title: 'VPN Fail', status: 'ABERTA', closing_reason: null }]
            });

            const res = await request(app)
                .put('/api/v1/admin/problems/1/moderation')
                .set('Cookie', [`jwt=${adminToken}`])
                .send({ action: 'reopen' });

            expect(res.statusCode).toBe(200);
            expect(res.body.problem.status).toBe('ABERTA');
        });
    });

    describe('DELETE /api/v1/admin/problems/:id', () => {
        it('should delete a problem', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, title: 'Deleted Post' }]
            });

            const res = await request(app)
                .delete('/api/v1/admin/problems/1')
                .set('Cookie', [`jwt=${adminToken}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body.deletedId).toBe(1);
        });
    });
});
