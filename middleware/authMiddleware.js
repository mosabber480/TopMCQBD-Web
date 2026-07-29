const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 👈 ডাটাবেজ চেক করার জন্য User মডেল ইমপোর্ট করা হলো
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_quizapp';

// 1. Verify Token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid or Expired Token' });
    }
};

// 2. Authorize Roles (Owner / Admin Check)
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access Forbidden: Insufficient Permissions' });
        }
        next();
    };
};

// 3. Check Active Subscription (Real-time DB Check)
const checkSubscription = async (req, res, next) => {
    try {
        if (req.user.role === 'owner' || req.user.role === 'admin') {
            return next();
        }

        // 👈 JWT টোকেন থেকে সাবস্ক্রিপশন না নিয়ে ডাটাবেজ থেকে রিয়েল-টাইম ডাটা নেওয়া হচ্ছে
        const userId = req.user.id || req.user._id || req.user.userId;
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const sub = currentUser.subscription;
        
        // সাবস্ক্রিপশন স্ট্যাটাস এবং মেয়াদ যাচাই
        if (sub && sub.active && new Date(sub.endDate) > new Date()) {
            next();
        } else {
            res.status(403).json({ 
                success: false, 
                message: 'Your subscription has expired or is inactive. Please renew your plan.' 
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error in Subscription Check', error: err.message });
    }
};

module.exports = { verifyToken, authorizeRoles, checkSubscription };