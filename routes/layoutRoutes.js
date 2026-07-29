const express = require('express');
const router = express.Router();
const LayoutConfig = require('../models/LayoutConfig');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware'); // সিকিউরিটি মিডলওয়্যার ইমপোর্ট করা হলো

// GET Layout Data (Public API - যে কেউ দেখতে পারবে)
router.get('/layout-config', async (req, res) => {
    try {
        let config = await LayoutConfig.findOne();
        if (!config) {
            config = {};
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST/SAVE Layout Data (Admin Dashboard - শুধুমাত্র অ্যাডমিন/ওনার সেভ করতে পারবে)
router.post('/layout-config', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { announcement, header, footer, copyright } = req.body;

        let config = await LayoutConfig.findOne();

        if (config) {
            config.announcement = announcement;
            config.header = header;
            config.footer = footer;
            config.copyright = copyright;
            await config.save();
        } else {
            config = new LayoutConfig({ announcement, header, footer, copyright });
            await config.save();
        }

        res.json({ message: 'Layout configuration saved successfully!', config });
    } catch (err) {
        res.status(500).json({ message: 'Save failed', error: err.message });
    }
});

module.exports = router;