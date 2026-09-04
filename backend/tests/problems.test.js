const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

// Mock db
jest.mock('../src/config/db', () => ({
    query: jest.fn()
}));
const db = require('../src/config/db');

// Tokens válidos para testar rotas protegidas
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';
const validTokenUser = jwt.sign({ userId: 1, email: 'usuario@suporte.com', role: 'ROLE_USUARIO', isVerified: true }, JWT_SECRET);
const validTokenTecnico = jwt.sign({ userId: 9, email: 'tecnico@suporte.com', role: 'ROLE_TECNICO', isVerified: true }, JWT_SECRET);

describe('Problems API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/problems', () => {
        it('should return a list of problems with authors', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, title: 'Impressora', description: 'Nao funciona', author_name: 'Ana' }]
            });

            const res = await request(app).get('/api/v1/problems');
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toHaveProperty('author_name', 'Ana');
        });
    });

    describe('POST /api/v1/problems', () => {
        it('should return 401 if no token provided', async () => {
            const res = await request(app).post('/api/v1/problems').send({ title: 'Test' });
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Acesso negado, token ausente');
        });

        it('should return 401 if token is invalid or modified', async () => {
            const res = await request(app)
                .post('/api/v1/problems')
                .set('Cookie', ['jwt=invalid_jwt_token_here'])
                .send({ title: 'Test' });
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Token inválido');
        });

        it('should create a problem when authenticated', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ id: 2, created_at: new Date() }] });

            const res = await request(app)
                .post('/api/v1/problems')
                .set('Cookie', [`jwt=${validTokenUser}`])
                .send({
                    title: 'VPN caindo constantemente', // length >= 10
                    description: 'Desconecta a cada 5 min',
                    category: 'Atendimento'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id', 2);
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO problems (title, description, author_id, status, category) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at',
                ['VPN caindo constantemente', 'Desconecta a cada 5 min', '1', 'ABERTA', 'Atendimento']
            );
        });
    });

    describe('GET /api/v1/problems/:id', () => {
        it('should return problem details with solutions', async () => {
            // Mock problem query
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, title: 'Impressora', description: 'Nao funciona' }]
            });
            // Mock solutions query
            db.query.mockResolvedValueOnce({
                rows: [{ id: 10, content: 'Reinicie', media_urls: ['/img.png'] }]
            });

            const res = await request(app).get('/api/v1/problems/1');
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('title', 'Impressora');
            expect(res.body).toHaveProperty('solutions');
            expect(res.body.solutions.length).toBe(1);
        });
    });

    describe('POST /api/v1/problems/:id/solutions', () => {
        it('should add a solution to a problem', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ id: 1, status: 'ABERTA' }] }); // mock for findById
            db.query.mockResolvedValueOnce({ rows: [{ id: 11, created_at: new Date() }] }); // mock for insert

            const res = await request(app)
                .post('/api/v1/problems/1/solutions')
                .set('Cookie', [`jwt=${validTokenUser}`])
                .send({
                    content: 'Resetar rede detalhadamente passo a passo', // ensure length >= 20
                    media_urls: ['/video.mp4']
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('solution_id', 11);
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO solutions (problem_id, author_id, content, media_urls) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
                ["1", "1", 'Resetar rede detalhadamente passo a passo', ['/video.mp4']]
            );
        });
    });

    describe('PUT /api/v1/problems/:id/solutions/:solutionId/accept (ABAC)', () => {
        it('should accept a solution when caller is question author', async () => {
            // 1. findById problem (author_id = 1)
            db.query.mockResolvedValueOnce({ rows: [{ id: 1, author_id: 1, status: 'ABERTA' }] });
            // 2. findById solution (problem_id = 1)
            db.query.mockResolvedValueOnce({ rows: [{ id: 11, problem_id: 1 }] });
            // 3. update problem
            db.query.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .put('/api/v1/problems/1/solutions/11/accept')
                .set('Cookie', [`jwt=${validTokenUser}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'RESOLVIDA');
            expect(res.body).toHaveProperty('acceptedSolutionId', '11');
        });
    });

    describe('POST /api/v1/problems/:id/close-admin (RBAC)', () => {
        it('should close problem administratively when caller is technician', async () => {
            // 1. findById problem
            db.query.mockResolvedValueOnce({ rows: [{ id: 1, author_id: 1, status: 'ABERTA' }] });
            // 2. update problem
            db.query.mockResolvedValueOnce({ rows: [] });

            const res = await request(app)
                .post('/api/v1/problems/1/close-admin')
                .set('Cookie', [`jwt=${validTokenTecnico}`])
                .send({
                    reason: 'Encerramento administrativo por inatividade prolongada do autor.'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'FECHADA_ADMINISTRATIVAMENTE');
        });
    });
});
