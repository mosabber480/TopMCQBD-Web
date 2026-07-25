const express = require('express');
const router = express.Router();
const LayoutConfig = require('../models/LayoutConfig');
// authMiddleware প্রয়োজন হলে ইমপোর্ট করবেন

// GET Layout Data (Public API - config.js ও index.html এর জন্য)
router.get('/layout-config', async (req, res) => {
    try {
        let config = await LayoutConfig.findOne();
        if (!config) {
            config = {}; // প্রথমবার ডাটা না থাকলে খালি অবজেক্ট রিটার্ন করবে
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST/SAVE Layout Data (Admin Dashboard এর জন্য)
router.post('/layout-config', async (req, res) => {
    try {
        const { announcement, header, footer, copyright } = req.body;

        let config = await LayoutConfig.findOne();

        if (config) {
            // থাকলে আপডেট হবে
            config.announcement = announcement;
            config.header = header;
            config.footer = footer;
            config.copyright = copyright;
            await config.save();
        } else {
            // না থাকলে নতুন ডাটা তৈরি হবে
            config = new LayoutConfig({ announcement, header, footer, copyright });
            await config.save();
        }

        res.json({ message: 'Layout configuration saved successfully!', config });
    } catch (err) {
        res.status(500).json({ message: 'Save failed', error: err.message });
    }
});

module.exports = router;