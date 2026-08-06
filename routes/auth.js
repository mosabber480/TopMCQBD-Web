const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // টোকেন তৈরির জন্য ক্রিপ্টো মডিউল
const nodemailer = require('nodemailer'); // ইমেইল পাঠানোর জন্য
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_quizapp';

// Nodemailer Transporter সেটআপ
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. REGISTER API
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
        console.error('Register Error:', err); // 👈 Render Logs এ error দেখার জন্য যোগ করা হয়েছে
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. LOGIN API
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Email or Password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Email or Password' });
        }

        if (user.subscription && user.subscription.active && user.subscription.endDate) {
            if (new Date() > new Date(user.subscription.endDate)) {
                user.subscription.active = false;
            }
        }

        user.lastLogin = new Date();
        await user.save();

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
                pendingRequests: user.pendingRequests
            }
        });
    } catch (err) {
        console.error('Login Error:', err); // 👈 Render Logs এ error দেখার জন্য যোগ করা হয়েছে
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. FORGOT PASSWORD API (ইমেইলে রিসেট লিংক পাঠানো)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User with this email does not exist' });
        }

        // র‍্যান্ডম টোকেন তৈরি করা এবং মেয়াদ ১৫ মিনিট সেট করা
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // ১৫ মিনিট
        await user.save();

        // 💡 এখানে লিংক আপডেট করা হয়েছে (reset-password.html এর বদলে login.html)
        const resetUrl = `${req.protocol}://${req.get('host')}/login.html?token=${resetToken}&email=${user.email}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request - TopMCQ',
            html: `<p>You requested a password reset.</p>
                   <p>Click this <a href="${resetUrl}">link</a> to reset your password. This link is valid for 15 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (err) {
        console.error('Forgot Password Error:', err); // 👈 Render Logs এ error দেখার জন্য যোগ করা হয়েছে
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. RESET PASSWORD API (নতুন পাসওয়ার্ড সেভ করা)
router.post('/reset-password', async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // টোকেনের মেয়াদ আছে কিনা চেক
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
        }

        // নতুন পাসওয়ার্ড হ্যাশ করে সেভ করা
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // টোকেন ক্লিয়ার করে দেওয়া যাতে পুনরায় ব্যবহার করা না যায়
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully!' });
    } catch (err) {
        console.error('Reset Password Error:', err); // 👈 Render Logs এ error দেখার জন্য যোগ করা হয়েছে
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;