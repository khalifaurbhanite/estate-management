const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Auth Middleware
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/employee', require('./routes/employee'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Estate Management System is running' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Estate Management System running on port ${PORT}`);
    console.log(`📍 Frontend: http://localhost:${PORT}/login.html`);
});
