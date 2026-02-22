const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const result = await pool.query(
            'SELECT id, email, role, password_hash, agent_id, suspended_at FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        if (user.suspended_at) {
            return res.status(403).json({ message: 'Account suspended' });
        }

        const passwordValid = await bcryptjs.compare(password, user.password_hash);
        if (!passwordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, agentId: user.agent_id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRY || '24h' }
        );

        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, email: user.email, role: user.role, agentId: user.agent_id }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check terms acceptance
router.get('/check-terms/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'SELECT accepted_at FROM terms_acceptance WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        res.json({ accepted: result.rows.length > 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Accept terms
router.post('/accept-terms', async (req, res) => {
    try {
        const { userId, ipAddress, userAgent } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID required' });
        }

        await pool.query(
            `INSERT INTO terms_acceptance (user_id, terms_version, privacy_policy_version, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, 1, 1, ipAddress || 'UNKNOWN', userAgent || '']
        );

        res.json({ success: true, message: 'Terms accepted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        if (!userId || !newPassword) {
            return res.status(400).json({ message: 'User ID and new password required' });
        }

        const passwordHash = await bcryptjs.hash(newPassword, 10);

        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [passwordHash, userId]
        );

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
