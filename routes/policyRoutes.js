const express = require('express');
const router = express.Router();
const PolicyConfig = require('../models/PolicyConfig');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public route to fetch the policy
router.get('/get', async (req, res) => {
    try {
        const policy = await PolicyConfig.findOne();
        res.json(policy || { content: '' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin route to save/update the policy (Protected)
router.post('/save', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        let policy = await PolicyConfig.findOne();
        if (policy) {
            policy.content = req.body.content;
            policy.updatedAt = Date.now();
            await policy.save();
        } else {
            policy = new PolicyConfig({ content: req.body.content });
            await policy.save();
        }
        res.json({ message: 'Policy saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;