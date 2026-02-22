const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/permissions');
const pool = require('../db');

router.use(checkRole('EMPLOYEE'));

// Get dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.userId;
        const agentId = req.user.agentId;

        const result = await pool.query(
            `SELECT assigned_houses FROM employees WHERE user_id = $1 AND agent_id = $2`,
            [userId, agentId]
        );

        const assignedHouses = result.rows[0]?.assigned_houses || [];

        res.json({
            success: true,
            assignedHouses,
            stats: {
                assignedCount: assignedHouses.length,
                pendingTasks: 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
