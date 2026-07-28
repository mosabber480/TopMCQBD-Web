const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_quizapp';

// 1. REGISTER API
// ... (রেজিস্টার এপিআই আগের মতোই থাকবে) ...
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer'
        });
        await user.save();
        res.status(201).json({ success: true, message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. LOGIN API (💡 এখানে আপডেট করা হয়েছে)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // ইউজার ডাটাবেজে আছে কিনা চেক
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Email or Password' });
        }

        // পাসওয়ার্ড সিকিউরলি ম্যাচ করা
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Email or Password' });
        }

        // সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে কিনা চেক করা
        if (user.subscription && user.subscription.active && user.subscription.endDate) {
            if (new Date() > new Date(user.subscription.endDate)) {
                user.subscription.active = false;
            }
        }

        // 💡 আপডেট: সফল লগইনের পর lastLogin এ বর্তমান সময় সেভ করা
        user.lastLogin = new Date();
        await user.save();

        // JWT টোকেন জেনারেট করা
        const payload = {
            userId: user._id,
            role: user.role,
            subscription: user.subscription
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscription: user.subscription,
                requestedPlan: user.requestedPlan
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;