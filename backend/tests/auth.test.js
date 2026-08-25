const request = require('supertest');
const app = require('../src/app');

// Mocking the database to avoid needing a live Postgres instance for unit tests
jest.mock('../src/config/db', () => ({
    query: jest.fn()
}));
const db = require('../src/config/db');

// Mock bcryptjs to avoid slow hashing in tests
jest.mock('bcryptjs', () => ({
    genSalt: jest.fn().mockResolvedValue('fake_salt'),
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('fake_jwt_token')
}));

// Mock emailService
jest.mock('../src/services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue('http://ethereal.url/fake')
}));

describe('Auth API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should create a new user and return a token', async () => {
            // Mock: first query checks if user exists (returns empty), second inserts user (returns id)
            db.query
              .mockResolvedValueOnce({ rows: [] })
              .mockResolvedValueOnce({ rows: [{ id: 1, email: 'tecnico@suporte.com' }] });
            
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'tecnico@suporte.com',
                    password: 'senha-segura'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Usuário criado. Verifique seu e-mail para ativar a conta.');
            expect(res.body).toHaveProperty('user_id', 1);
            // expect(res.headers['set-cookie'][0]).toMatch(/jwt=fake_jwt_token/); - removido, pois agora não envia cookie no registro
        });

        it('should return 400 if email or password are missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ email: 'tecnico@suporte.com' }); // Missing password
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login user and return a token', async () => {
            // Mock: query returns the existing verified user
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, email: 'tecnico@suporte.com', password_hash: 'hashed_password', is_verified: true }]
            });

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'tecnico@suporte.com',
                    password: 'senha-segura'
                });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Login realizado com sucesso');
            expect(res.headers['set-cookie'][0]).toMatch(/jwt=fake_jwt_token/);
        });
        it('should return 401 if user is not verified', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, email: 'tecnico@suporte.com', password_hash: 'hashed_password', is_verified: false }]
            });

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'tecnico@suporte.com',
                    password: 'senha-segura'
                });
            
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Conta não verificada. Por favor, verifique seu e-mail.');
        });

        it('should return 401 for incorrect password', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, email: 'tecnico@suporte.com', password_hash: 'hashed_password', is_verified: true }]
            });
            // Override mock for compare to return false for this specific test
            const bcrypt = require('bcryptjs');
            bcrypt.compare.mockResolvedValueOnce(false);

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'tecnico@suporte.com',
                    password: 'wrong_password'
                });
            
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Credenciais inválidas');
        });

        it('should return 401 for non-existent email', async () => {
            db.query.mockResolvedValueOnce({ rows: [] }); // User not found

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'ghost@suporte.com',
                    password: 'password'
                });
            
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Credenciais inválidas');
        });

        it('should return 400 if email or password are missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'tecnico@suporte.com' }); // Missing password
            
            expect(res.statusCode).toBe(400);
        });
    });
});
