const express = require('express');
const router = express.Router();
const AdminSidebarConfig = require('../models/AdminSidebarConfig');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// GET: Fetch Sidebar Configuration
router.get('/sidebar-config', async (req, res) => {
    try {
        let config = await AdminSidebarConfig.findOne();
        if (!config) {
            return res.json({ menus: [] });
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// POST: Save/Update Sidebar Configuration (Protected Route - Owner & Admin only)
router.post('/sidebar-config', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { menus } = req.body;
        let config = await AdminSidebarConfig.findOne();

        if (config) {
            config.menus = menus;
            await config.save();
        } else {
            config = new AdminSidebarConfig({ menus });
            await config.save();
        }

        res.json({ message: 'Sidebar config saved successfully!', config });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;