const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/db', () => ({
    query: jest.fn()
}));
const db = require('../src/config/db');

describe('Companies API Endpoints', () => {
    const adminToken = jwt.sign(
        { userId: 1, role: 'ADMIN', isVerified: true },
        process.env.JWT_SECRET || 'secret-key-for-dev'
    );
    const guestToken = jwt.sign(
        { userId: 999, role: 'GUEST', isVerified: true },
        process.env.JWT_SECRET || 'secret-key-for-dev'
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/companies', () => {
        it('deve listar empresas para qualquer usuário autenticado (incluindo convidado)', async () => {
            db.query.mockResolvedValueOnce({
                rows: [
                    { id: 1, name: 'MEJC', problems_count: 33, categories_count: 8, sectors_count: 4 }
                ]
            });

            const res = await request(app)
                .get('/api/v1/companies')
                .set('Cookie', [`jwt=${guestToken}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('MEJC');
        });
    });

    describe('POST /api/v1/companies', () => {
        it('deve barrar criação de empresa por convidado com 403', async () => {
            const res = await request(app)
                .post('/api/v1/companies')
                .set('Cookie', [`jwt=${guestToken}`])
                .send({ name: 'Nova Empresa' });

            expect(res.statusCode).toBe(403);
        });

        it('deve permitir que o ADMIN crie uma nova empresa', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [] }) // check duplicate
                .mockResolvedValueOnce({ rows: [{ id: 2, name: 'Nova Empresa' }] }) // insert company
                .mockResolvedValueOnce({ rows: [] }) // default sectors
                .mockResolvedValueOnce({ rows: [] }); // default categories

            const res = await request(app)
                .post('/api/v1/companies')
                .set('Cookie', [`jwt=${adminToken}`])
                .send({ name: 'Nova Empresa' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('name', 'Nova Empresa');
        });
    });

    describe('DELETE /api/v1/problems/:id', () => {
        it('deve permitir que o ADMIN apague um caso', async () => {
            db.query
                .mockResolvedValueOnce({
                    rows: [{ id: 5, title: 'Problema', author_id: 2, category: 'Geral' }]
                })
                .mockResolvedValueOnce({
                    rows: [{ id: 5, title: 'Problema' }]
                });

            const res = await request(app)
                .delete('/api/v1/problems/5')
                .set('Cookie', [`jwt=${adminToken}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Caso excluído com sucesso.');
        });
    });
});

