const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev';

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert user
        const result = await db.query(
            'INSERT INTO users (email, password_hash, is_verified, verification_token, token_expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, passwordHash, false, verificationToken, tokenExpiresAt]
        );
        const userId = result.rows[0].id;

        // Send Email
        await emailService.sendVerificationEmail(email, verificationToken);

        return res.status(201).json({
            message: 'Usuário criado. Verifique seu e-mail para ativar a conta.',
            user_id: userId
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const user = result.rows[0];

        if (!user.is_verified) {
            return res.status(401).json({ error: 'Conta não verificada. Por favor, verifique seu e-mail.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({ message: 'Login realizado com sucesso' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.me = async (req, res) => {
    return res.status(200).json({ user: req.user });
};

exports.logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'lax'
    });
    return res.status(200).json({ message: 'Logout realizado' });
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ error: 'Token não fornecido' });
        }

        const result = await db.query('SELECT * FROM users WHERE verification_token = $1', [token]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido' });
        }

        const user = result.rows[0];

        if (new Date() > user.token_expires_at) {
            return res.status(400).json({ error: 'Token expirado' });
        }

        await db.query(
            'UPDATE users SET is_verified = true, verification_token = NULL, token_expires_at = NULL WHERE id = $1',
            [user.id]
        );

        return res.status(200).json({ message: 'Conta verificada com sucesso. Você já pode fazer login.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};
