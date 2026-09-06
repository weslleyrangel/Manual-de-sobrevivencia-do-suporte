require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const problemsRoutes = require('./routes/problems');
const searchRoutes = require('./routes/search');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const rateLimit = require('express-rate-limit');

// Limiter global: máximo de 100 requisições por 15 minutos
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Muitas requisições originadas deste IP, por favor tente novamente após 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const errorHandler = require('./middlewares/errorHandler');

// Setup routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemsRoutes);
app.use('/api/v1/search', searchRoutes);

// Tratamento centralizado de erros
app.use(errorHandler);

module.exports = app;
