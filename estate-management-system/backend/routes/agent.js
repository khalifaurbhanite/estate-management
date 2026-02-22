const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/permissions');
const pool = require('../db');

router.use(checkRole('AGENT'));

// Get dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const agentId = req.user.agentId;

        const statsResult = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM estates WHERE agent_id = $1) as estate_count,
                (SELECT COUNT(*) FROM courts WHERE agent_id = $1) as court_count,
                (SELECT COUNT(*) FROM blocks WHERE agent_id = $1) as block_count,
                (SELECT COUNT(*) FROM houses WHERE agent_id = $1) as house_count,
                (SELECT COUNT(*) FROM houses WHERE agent_id = $1 AND status = 'OCCUPIED') as occupied_count,
                (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE agent_id = $1 AND status IN ('OVERDUE', 'PARTIAL')) as outstanding_amount`,
            [agentId]
        );

        const stats = statsResult.rows[0];

        const propertiesResult = await pool.query(
            `SELECT name, location, 
                    (SELECT COUNT(*) FROM houses WHERE estate_id = estates.id) as house_count
             FROM estates WHERE agent_id = $1 LIMIT 5`,
            [agentId]
        );

        const billsResult = await pool.query(
            `SELECT h.house_number, b.bill_type, b.amount, b.due_date
             FROM bills b
             JOIN houses h ON b.house_id = h.id
             WHERE h.agent_id = $1 AND b.status IN ('OVERDUE', 'PARTIAL')
             ORDER BY b.due_date ASC LIMIT 5`,
            [agentId]
        );

        res.json({
            success: true,
            stats: {
                estateCount: parseInt(stats.estate_count),
                courtCount: parseInt(stats.court_count),
                blockCount: parseInt(stats.block_count),
                houseCount: parseInt(stats.house_count),
                occupiedCount: parseInt(stats.occupied_count),
                outstandingAmount: parseFloat(stats.outstanding_amount)
            },
            properties: propertiesResult.rows,
            outstandingBills: billsResult.rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create estate
router.post('/estates', async (req, res) => {
    try {
        const agentId = req.user.agentId;
        const { name, location, city, postalCode } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Estate name required' });
        }

        const result = await pool.query(
            `INSERT INTO estates (agent_id, name, location, city, postal_code)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, location`,
            [agentId, name, location, city, postalCode]
        );

        res.json({ success: true, estate: result.rows[0] });
    } catch (error) {
        if (error.message.includes('unique')) {
            return res.status(400).json({ message: 'Estate name already exists' });
        }
        res.status(500).json({ message: error.message });
    }
});

// Get all estates
router.get('/estates', async (req, res) => {
    try {
        const agentId = req.user.agentId;

        const result = await pool.query(
            `SELECT id, name, location, city,
                    (SELECT COUNT(*) FROM courts WHERE estate_id = estates.id) as court_count,
                    (SELECT COUNT(*) FROM houses WHERE estate_id = estates.id) as house_count
             FROM estates WHERE agent_id = $1 ORDER BY created_at DESC`,
            [agentId]
        );

        res.json({ success: true, estates: result.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create court
router.post('/courts', async (req, res) => {
    try {
        const agentId = req.user.agentId;
        const { estateId, name } = req.body;

        if (!estateId || !name) {
            return res.status(400).json({ message: 'Estate and court name required' });
        }

        const result = await pool.query(
            `INSERT INTO courts (estate_id, agent_id, name)
             VALUES ($1, $2, $3)
             RETURNING id, name`,
            [estateId, agentId, name]
        );

        res.json({ success: true, court: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all courts
router.get('/courts', async (req, res) => {
    try {
        const agentId = req.user.agentId;

        const result = await pool.query(
            `SELECT c.id, c.name, c.estate_id,
                    (SELECT name FROM estates WHERE id = c.estate_id) as estate_name,
                    (SELECT COUNT(*) FROM blocks WHERE court_id = c.id) as block_count
             FROM courts c WHERE c.agent_id = $1 ORDER BY c.created_at DESC`,
            [agentId]
        );

        res.json({ success: true, courts: result.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create block
router.post('/blocks', async (req, res) => {
    try {
        const agentId = req.user.agentId;
        const { courtId, estateId, name } = req.body;

        if (!courtId || !name) {
            return res.status(400).json({ message: 'Court and block name required' });
        }

        const result = await pool.query(
            `INSERT INTO blocks (court_id, estate_id, agent_id, name)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name`,
            [courtId, estateId, agentId, name]
        );

        res.json({ success: true, block: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all blocks
router.get('/blocks', async (req, res) => {
    try {
        const agentId = req.user.agentId;

        const result = await pool.query(
            `SELECT b.id, b.name, b.court_id,
                    (SELECT name FROM courts WHERE id = b.court_id) as court_name,
                    (SELECT COUNT(*) FROM houses WHERE block_id = b.id) as house_count
             FROM blocks b WHERE b.agent_id = $1 ORDER BY b.created_at DESC`,
            [agentId]
        );

        res.json({ success: true, blocks: result.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create house
router.post('/houses', async (req, res) => {
    try {
        const agentId = req.user.agentId;
        const { blockId, courtId, estateId, houseNumber, bedrooms, bathrooms, monthlyRent } = req.body;

        if (!blockId || !houseNumber) {
            return res.status(400).json({ message: 'Block and house number required' });
        }

        const result = await pool.query(
            `INSERT INTO houses (block_id, court_id, estate_id, agent_id, house_number, bedrooms, bathrooms, monthly_rent, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, house_number`,
            [blockId, courtId, estateId, agentId, houseNumber, bedrooms, bathrooms, monthlyRent, 'VACANT']
        );

        res.json({ success: true, house: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all houses
router.get('/houses', async (req, res) => {
    try {
        const agentId = req.user.agentId;

        const result = await pool.query(
            `SELECT h.id, h.house_number, h.bedrooms, h.status, h.monthly_rent,
                    b.name as block_name, c.name as court_name, e.name as estate_name,
                    t.name as tenant_name, t.phone as tenant_phone
             FROM houses h
             LEFT JOIN blocks b ON h.block_id = b.id
             LEFT JOIN courts c ON h.court_id = c.id
             LEFT JOIN estates e ON h.estate_id = e.id
             LEFT JOIN tenants t ON h.id = t.house_id AND t.status = 'ACTIVE'
             WHERE h.agent_id = $1
             ORDER BY e.name, c.name, b.name, h.house_number`,
            [agentId]
        );

        res.json({ success: true, houses: result.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
