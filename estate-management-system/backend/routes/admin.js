const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/permissions');
const pool = require('../db');

router.use(checkRole('SUPER_ADMIN'));

// Get dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const agentsResult = await pool.query(
            `SELECT a.id, a.company_name, a.email, a.phone, a.suspended_at,
                    (SELECT COUNT(*) FROM estates WHERE agent_id = a.id) as estate_count,
                    (SELECT COUNT(*) FROM houses WHERE agent_id = a.id) as house_count
             FROM agents a ORDER BY a.created_at DESC LIMIT 10`
        );

        const statsResult = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM agents) as total_agents,
                (SELECT COUNT(*) FROM agents WHERE suspended_at IS NULL) as active_agents,
                (SELECT COUNT(*) FROM agents WHERE suspended_at IS NOT NULL) as suspended_agents,
                (SELECT COUNT(*) FROM estates) as total_estates,
                (SELECT COUNT(*) FROM houses) as total_houses,
                (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE status IN ('OVERDUE', 'PARTIAL')) as outstanding_amount`
        );

        const stats = statsResult.rows[0];

        res.json({
            success: true,
            agents: agentsResult.rows,
            stats: {
                totalAgents: parseInt(stats.total_agents),
                activeAgents: parseInt(stats.active_agents),
                suspendedAgents: parseInt(stats.suspended_agents),
                totalEstates: parseInt(stats.total_estates),
                totalHouses: parseInt(stats.total_houses),
                outstandingAmount: parseFloat(stats.outstanding_amount)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all agents
router.get('/agents', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.id, a.company_name, a.email, a.phone, a.suspended_at, a.created_at,
                    (SELECT COUNT(*) FROM estates WHERE agent_id = a.id) as estate_count,
                    (SELECT COUNT(*) FROM houses WHERE agent_id = a.id) as house_count
             FROM agents a ORDER BY a.created_at DESC`
        );

        res.json({ success: true, agents: result.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Suspend agent
router.post('/agents/:agentId/suspend', async (req, res) => {
    try {
        const { agentId } = req.params;
        const { reason } = req.body;

        await pool.query(
            'UPDATE agents SET suspended_at = CURRENT_TIMESTAMP, suspension_reason = $1 WHERE id = $2',
            [reason || 'Suspended by admin', agentId]
        );

        const agentUser = await pool.query('SELECT user_id FROM agents WHERE id = $1', [agentId]);
        if (agentUser.rows[0]) {
            await pool.query('UPDATE users SET suspended_at = CURRENT_TIMESTAMP WHERE id = $1', [agentUser.rows[0].user_id]);
        }

        res.json({ success: true, message: 'Agent suspended' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Activate agent
router.post('/agents/:agentId/activate', async (req, res) => {
    try {
        const { agentId } = req.params;

        await pool.query('UPDATE agents SET suspended_at = NULL WHERE id = $1', [agentId]);

        const agentUser = await pool.query('SELECT user_id FROM agents WHERE id = $1', [agentId]);
        if (agentUser.rows[0]) {
            await pool.query('UPDATE users SET suspended_at = NULL WHERE id = $1', [agentUser.rows[0].user_id]);
        }

        res.json({ success: true, message: 'Agent activated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reports
router.get('/reports', async (req, res) => {
    try {
        const reports = {
            totalEstates: await pool.query('SELECT COUNT(*) as count FROM estates'),
            totalHouses: await pool.query('SELECT COUNT(*) as count FROM houses'),
            occupiedHouses: await pool.query("SELECT COUNT(*) as count FROM houses WHERE status = 'OCCUPIED'"),
            totalRevenue: await pool.query('SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments'),
            outstandingAmount: await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE status IN ('OVERDUE', 'PARTIAL')")
        };

        res.json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
