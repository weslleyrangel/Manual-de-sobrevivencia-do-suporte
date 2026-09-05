const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, level, area, job_title } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        // Check if user exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows && userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado em nosso sistema.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate verification token (signed JWT, expires in 24h)
        const verificationToken = jwt.sign(
            { email: email.trim().toLowerCase(), type: 'EMAIL_VERIFY' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Compute role and title
        const computedJobTitle = job_title || (role && level ? `${role} · ${level}` : role || 'Analista de Suporte · Nível 1');
        const computedRole = (role && (role.toUpperCase().includes('ADMIN') ? 'ADMIN' : (role.toUpperCase().includes('MODERATOR') ? 'MODERATOR' : 'MEMBER'))) || 'MEMBER';
        const computedName = (name && name.trim()) || 'Analista de Suporte';

        // Insert user
        const result = await db.query(
            'INSERT INTO users (name, email, password_hash, role, job_title, is_verified, verification_token, token_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role, job_title, is_verified',
            [computedName, email.trim().toLowerCase(), passwordHash, computedRole, computedJobTitle, false, verificationToken, tokenExpiresAt]
        );
        const user = result.rows[0];

        // Send email
        try {
            await emailService.sendVerificationEmail(user.email, verificationToken, user.name);
        } catch (e) {
            console.warn('Falha no envio de email:', e.message);
        }

        return res.status(201).json({
            message: 'Cadastro realizado! Enviamos um link de confirmação para o seu e-mail.',
            email: user.email
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Este e-mail já está cadastrado em nosso sistema.' });
        }
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!result.rows || result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const user = result.rows[0];

        // Check verification
        if (!user.is_verified) {
            return res.status(401).json({ error: 'Conta não verificada. Por favor, verifique seu e-mail.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Generate token
        const token = jwt.sign(
            { 
                userId: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                isVerified: user.is_verified 
            }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        // 1. Tenta decodificar como JWT assinado
        let userEmail = null;
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded.email && decoded.type === 'EMAIL_VERIFY') {
                userEmail = decoded.email;
            }
        } catch (jwtErr) {
            // Se expirou ou não é JWT válido, tenta checagem direta no banco como fallback
        }

        let user = null;
        if (userEmail) {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);
            if (result.rows && result.rows.length > 0) {
                user = result.rows[0];
            }
        } else {
            // Fallback para tokens legados em formato hexadecimal
            const result = await db.query(
                'SELECT * FROM users WHERE verification_token = $1',
                [token]
            );
            if (result.rows && result.rows.length > 0) {
                user = result.rows[0];
                if (user.token_expires_at && new Date(user.token_expires_at) < new Date()) {
                    return res.status(400).json({ error: 'Token de verificação expirado' });
                }
            }
        }

        if (!user) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        // Se ainda não estiver verificado, atualiza no banco
        if (!user.is_verified) {
            await db.query(
                'UPDATE users SET is_verified = true, verification_token = NULL, token_expires_at = NULL WHERE id = $1',
                [user.id]
            );
        }

        return res.status(200).json({ 
            message: 'E-mail verificado com sucesso!',
            email: user.email 
        });
    } catch (error) {
        console.error('Verify error:', error);
        return res.status(500).json({ error: 'Erro ao verificar e-mail' });
    }
};

exports.me = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const result = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.userId]);
        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        return res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'lax'
    });
    return res.status(200).json({ message: 'Logout realizado com sucesso' });
};
