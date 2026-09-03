const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows && userExists.rows.length > 0) {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert user
        const result = await db.query(
            'INSERT INTO users (email, password_hash, verification_token, token_expires_at) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, passwordHash, verificationToken, tokenExpiresAt]
        );
        const user = result.rows[0];

        // Send email
        try {
            await emailService.sendVerificationEmail(email, verificationToken);
        } catch (e) {
            console.warn('Falha no envio de email:', e.message);
        }

        return res.status(201).json({
            message: 'Usuário criado. Verifique seu e-mail para ativar a conta.',
            user_id: user.id
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
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
        const token = jwt.sign({ userId: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ 
            message: 'Login realizado com sucesso',
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const result = await db.query(
            'SELECT * FROM users WHERE verification_token = $1 AND token_expires_at > NOW()',
            [token]
        );

        if (!result.rows || result.rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        await db.query(
            'UPDATE users SET is_verified = true, verification_token = NULL, token_expires_at = NULL WHERE id = $1',
            [result.rows[0].id]
        );

        return res.status(200).json({ message: 'E-mail verificado com sucesso!' });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
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
