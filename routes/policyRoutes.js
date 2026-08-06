const express = require('express');
const router = express.Router();
const PolicyConfig = require('../models/PolicyConfig');
// const authMiddleware = require('../middleware/authMiddleware'); // যদি অ্যাডমিন ভেরিফিকেশন লাগে

// Public route to fetch the policy
router.get('/get', async (req, res) => {
    try {
        const policy = await PolicyConfig.findOne();
        res.json(policy || { content: '<p>No policy found.</p>' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin route to save/update the policy
router.post('/save', async (req, res) => { // You can add authMiddleware here
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