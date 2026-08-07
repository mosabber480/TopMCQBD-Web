const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_quizapp';

// =======================
// EMAIL CONFIG
// =======================

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

// Updated Transporter config for Render ENETUNREACH issue
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
});

// Verify Gmail Connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ EMAIL VERIFY ERROR");
        console.error(error);
    } else {
        console.log("✅ Gmail Server Ready");
    }
});


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
            `${req.protocol}://${req.get('host')}/login.html?token=${token}&email=${user.email}`;

        console.log("Reset Link:");
        console.log(resetLink);

        await transporter.sendMail({

            from: `"TopMCQ" <${process.env.EMAIL_USER}>`,
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

        console.log("✅ Email Sent Successfully");

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