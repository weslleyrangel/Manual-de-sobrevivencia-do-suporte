const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

// Mock db
jest.mock('../src/config/db', () => ({
    query: jest.fn()
}));
const db = require('../src/config/db');

// Token válido para testar rotas protegidas
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';
const validToken = jwt.sign({ userId: 1, email: 'tecnico@suporte.com', role: 'N1' }, JWT_SECRET);

describe('Problems API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/problems', () => {
        it('should return a list of problems', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, title: 'Impressora', description: 'Nao funciona' }]
            });

            const res = await request(app).get('/api/v1/problems');
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
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
            db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });

            const res = await request(app)
                .post('/api/v1/problems')
                .set('Cookie', [`jwt=${validToken}`])
                .send({
                    title: 'VPN caindo',
                    description: 'Desconecta a cada 5 min'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id', 2);
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO problems (title, description, author_id) VALUES ($1, $2, $3) RETURNING id',
                ['VPN caindo', 'Desconecta a cada 5 min', 1]
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
            db.query.mockResolvedValueOnce({ rows: [{ id: 11 }] });

            const res = await request(app)
                .post('/api/v1/problems/1/solutions')
                .set('Cookie', [`jwt=${validToken}`])
                .send({
                    content: 'Resetar rede',
                    media_urls: ['/video.mp4']
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('solution_id', 11);
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO solutions (problem_id, author_id, content, media_urls) VALUES ($1, $2, $3, $4) RETURNING id',
                ["1", 1, 'Resetar rede', ['/video.mp4']]
            );
        });
    });
});
