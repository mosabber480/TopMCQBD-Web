const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend'); // Render-এ SMTP পোর্ট (587/465) ব্লক থাকায় Nodemailer/Gmail এর বদলে Resend এর HTTP API ব্যবহার করা হচ্ছে
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_quizapp';

// =======================
// EMAIL CONFIG (Resend)
// =======================

console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Loaded ✅" : "Missing ❌");

const resend = new Resend(process.env.RESEND_API_KEY);


// =====================================================
// REGISTER
// =====================================================

router.post('/register', async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
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

        res.status(201).json({
            success: true,
            message: 'User registered successfully!'
        });

    } catch (err) {

        console.error("REGISTER ERROR");
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
});


// =====================================================
// LOGIN
// =====================================================

router.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Email or Password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Email or Password'
            });
        }

        if (
            user.subscription &&
            user.subscription.active &&
            user.subscription.endDate &&
            new Date() > new Date(user.subscription.endDate)
        ) {
            user.subscription.active = false;
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({
            userId: user._id,
            role: user.role,
            subscription: user.subscription
        }, JWT_SECRET, {
            expiresIn: '7d'
        });

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

        console.error("LOGIN ERROR");
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post('/forgot-password', async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'Email address not found.'
            });

        }

        const token = crypto.randomBytes(32).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink =
            `${req.protocol}://${req.get('host')}/login.html?token=${token}&email=${encodeURIComponent(user.email)}`;

        console.log("Reset Link:");
        console.log(resetLink);

        // 💡 প্রথমে টেস্টের জন্য Resend-এর ডিফল্ট 'onboarding@resend.dev' ব্যবহার করা হচ্ছে।
        // নিজের ডোমেইন Resend-এ ভেরিফাই করা থাকলে সেটা দিয়ে বদলে নিন, যেমন: 'TopMCQ <noreply@yourdomain.com>'
        const { data, error } = await resend.emails.send({
            from: 'TopMCQ <onboarding@resend.dev>',
            to: user.email,
            subject: "Reset Your Password",
            html: `
                <h2>Password Reset</h2>

                <p>Hello ${user.name},</p>

                <p>Click below to reset your password.</p>

                <a href="${resetLink}">
                    Reset Password
                </a>

                <br><br>

                <small>This link expires in 15 minutes.</small>
            `
        });

        if (error) {
            console.error("==============================");
            console.error("RESEND EMAIL ERROR");
            console.error("==============================");
            console.error(error);
            console.error("==============================");

            return res.status(500).json({
                success: false,
                message: 'Failed to send reset email'
            });
        }

        console.log("✅ Email Sent Successfully:", data);

        res.json({
            success: true,
            message: "Password reset link has been sent."
        });

    } catch (err) {

        console.error("==============================");
        console.error("FORGOT PASSWORD ERROR");
        console.error("==============================");
        console.error(err);
        console.error("==============================");

        res.status(500).json({
            success: false,
            message: err.message,
            stack: err.stack
        });

    }

});


// =====================================================
// RESET PASSWORD
// =====================================================

router.post('/reset-password', async (req, res) => {

    try {

        const {
            email,
            token,
            newPassword
        } = req.body;

        const user = await User.findOne({

            email,

            resetPasswordToken: token,

            resetPasswordExpires: {
                $gt: Date.now()
            }

        });

        if (!user) {

            return res.status(400).json({

                success: false,

                message: "Invalid or expired reset token."

            });

        }

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(newPassword, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({

            success: true,

            message: "Password reset successful."

        });

    } catch (err) {

        console.error("RESET PASSWORD ERROR");
        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;