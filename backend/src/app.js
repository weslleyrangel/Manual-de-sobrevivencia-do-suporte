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

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Setup routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemsRoutes);
app.use('/api/v1/search', searchRoutes);

module.exports = app;
