const request = require('supertest');
const app = require('../src/app');

// Mock db
jest.mock('../src/config/db', () => ({
    query: jest.fn()
}));
const db = require('../src/config/db');

// Mock AuthMiddleware so we can test the route protected by JWT
jest.mock('../src/middlewares/authMiddleware', () => (req, res, next) => {
    req.user = { userId: 1, email: 'admin@suporte.com' };
    next();
});

describe('Search API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/search', () => {
        it('should return 400 if query is missing', async () => {
            const res = await request(app).get('/api/v1/search');
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'O parâmetro de busca "q" é obrigatório');
        });

        it('should return matching problems via Full Text Search', async () => {
            db.query.mockResolvedValueOnce({
                rows: [
                    { id: 1, title: 'VPN cai toda hora', description: 'Problema na VPN', rank: 0.99 }
                ]
            });

            const res = await request(app).get('/api/v1/search?q=vpn');
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('title', 'VPN cai toda hora');
            
            // Verify query structure for postgres tsvector
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('to_tsvector'),
                ['vpn']
            );
        });
    });
});
