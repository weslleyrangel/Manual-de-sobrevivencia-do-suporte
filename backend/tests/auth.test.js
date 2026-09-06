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
    sign: jest.fn().mockReturnValue('fake_jwt_token'),
    verify: jest.fn().mockReturnValue({ email: 'tecnico@suporte.com', type: 'EMAIL_VERIFY' })
}));

// Mock emailService
jest.mock('../src/services/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue({ messageId: 'mock-mailtrap-message-id' }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ messageId: 'mock-mailtrap-reset-id' })
}));

describe('Auth API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should create a new user with enforced role MEMBER', async () => {
            db.query
              .mockResolvedValueOnce({ rows: [] }) // check if exists
              .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Técnico', email: 'tecnico@suporte.com', role: 'MEMBER', is_verified: false }] });
            
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Técnico',
                    email: 'tecnico@suporte.com',
                    password: 'senha-segura',
                    role: 'ADMIN' // Trying to escalate privileges
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Cadastro realizado! Enviamos um link de confirmação para o seu e-mail.');
            expect(res.body).toHaveProperty('email', 'tecnico@suporte.com');

            // Verify that the query received 'MEMBER' as the role parameter ($4)
            const insertCallArgs = db.query.mock.calls[1][1];
            expect(insertCallArgs[3]).toBe('MEMBER');
        });

        it('should return 400 if password has less than 6 characters', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Técnico',
                    email: 'tecnico@suporte.com',
                    password: '123'
                });
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'A senha deve conter no mínimo 6 caracteres.');
        });

        it('should return 400 if email is invalid', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Técnico',
                    email: 'invalid-email-format',
                    password: 'senha-segura'
                });
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Por favor, informe um endereço de e-mail válido.');
        });

        it('should return 400 if email already exists', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'tecnico@suporte.com' }] });
            
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Técnico',
                    email: 'tecnico@suporte.com',
                    password: 'senha-segura'
                });
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Este e-mail já está cadastrado em nosso sistema.');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login verified user and return a token cookie', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, email: 'tecnico@suporte.com', password_hash: 'hashed_password', is_verified: true, role: 'MEMBER' }]
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
            expect(res.body).toHaveProperty('unverified', true);
            expect(res.body.error).toContain('Conta não verificada');
        });

        it('should return 401 for incorrect password', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, email: 'tecnico@suporte.com', password_hash: 'hashed_password', is_verified: true }]
            });
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
    });

    describe('POST /api/v1/auth/resend-verification', () => {
        it('should resend verification email for unverified user', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1, email: 'tecnico@suporte.com', is_verified: false, name: 'Técnico' }] })
                .mockResolvedValueOnce({ rowCount: 1 }); // update token

            const res = await request(app)
                .post('/api/v1/auth/resend-verification')
                .send({ email: 'tecnico@suporte.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('novo link de ativação foi enviado');
        });
    });

    describe('POST /api/v1/auth/forgot-password & /reset-password', () => {
        it('should accept forgot password request', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1, email: 'tecnico@suporte.com', name: 'Técnico' }] })
                .mockResolvedValueOnce({ rowCount: 1 });

            const res = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({ email: 'tecnico@suporte.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('instruções para redefinição de senha');
        });

        it('should reset password with valid token and password >= 6 chars', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1, email: 'tecnico@suporte.com' }] }) // token exists
                .mockResolvedValueOnce({ rowCount: 1 }); // password update

            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: 'valid_reset_token',
                    password: 'nova-senha-segura'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('Senha redefinida com sucesso');
        });

        it('should reject reset password with short password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: 'valid_reset_token',
                    password: '123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toContain('mínimo 6 caracteres');
        });
    });
});
