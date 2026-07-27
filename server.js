const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// External Models & Routes
const User = require('./models/User');
const HomeConfig = require('./models/HomeConfig'); 
const authRoutes = require('./routes/auth');
const homeConfigRoutes = require('./routes/homeConfigRoutes'); 
const { verifyToken, authorizeRoles } = require('./middleware/authMiddleware');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ------------------- STATIC FILES & ROUTING SETUP -------------------
// 1. Pages Directory (Mapped directly to ROOT '/' for clean SEO URLs)
app.use(express.static(path.join(__dirname, 'pages')));

// 2. Admin & Global Folders
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/global', express.static(path.join(__dirname, 'global')));

// 3. Root Directory Fallback
app.use(express.static(__dirname));

// Multer Setup for Memory Storage
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB Connection Setup
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:password@cluster0.mongodb.net/quizDB';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ------------------- MONGOOSE SCHEMAS & MODELS -------------------

// Question Schema & Model
const questionSchema = new mongoose.Schema({
    q: { type: String, required: true },
    options: { type: [String], required: true },
    ans: { type: Number, required: true },
    explanation: { type: String, default: '' },
    category: { type: String, required: true, index: true } // Fast Search Indexing
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

// Layout Config Schema & Model (Header, Footer, Announcement, Copyright & SEO)
const layoutConfigSchema = new mongoose.Schema({
    announcement: {
        text: String,
        link: String
    },
    header: {
        siteTitle: String,
        logoUrl: String,
        seoTitle: String,
        faviconUrl: String,
        btnText: String,
        btnLink: String,
        menus: [
            {
                title: String,
                url: String,
                subMenus: [
                    {
                        title: String,
                        url: String
                    }
                ]
            }
        ]
    },
    footer: {
        col1Text: String,
        col1Fb: String, // Facebook
        col1Yt: String, // YouTube
        col1Wa: String, // WhatsApp
        col1Tw: String, // Twitter / X
        col1Tg: String, // Telegram
        col1Ln: String, // LinkedIn
        col2Title: String,
        col2Links: [
            { title: String, url: String }
        ],
        col3Title: String,
        col3Links: [
            { title: String, url: String }
        ],
        col4Title: String,
        col4Links: [
            { title: String, url: String }
        ]
    },
    copyright: {
        text: String
    }
}, { timestamps: true });

const LayoutConfig = mongoose.model('LayoutConfig', layoutConfigSchema);

// ------------------- AUTHENTICATION ROUTES -------------------
app.use('/api/auth', authRoutes);

// ------------------- HOME CONFIG ROUTES -------------------
app.use('/api/home-config', homeConfigRoutes);

// ------------------- LAYOUT CONFIG ROUTES -------------------

// Get Layout Config (Public API)
app.get('/api/layout-config', async (req, res) => {
    try {
        let config = await LayoutConfig.findOne();
        if (!config) {
            config = {};
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Save/Update Layout Config (Owner and Admin only)
app.post('/api/layout-config', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
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

        res.json({
            success: true,
            message: 'Layout configuration saved successfully!',
            config
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Change Password API (Any Logged In User)
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: 'Password updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ------------------- USER & SUBSCRIPTION MANAGEMENT -------------------

// Get All Users (Owner and Admin only)
app.get('/api/users', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update Subscription Plan (Owner and Admin only)
app.put('/api/users/:userId/subscription', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { plan } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let startDate = new Date();
        let endDate = new Date();

        if (plan === '1_month') endDate.setMonth(endDate.getMonth() + 1);
        else if (plan === '3_months') endDate.setMonth(endDate.getMonth() + 3);
        else if (plan === '6_months') endDate.setMonth(endDate.getMonth() + 6);
        else if (plan === '1_year') endDate.setFullYear(endDate.getFullYear() + 1);
        else if (plan === '2_years') endDate.setFullYear(endDate.getFullYear() + 2);
        else if (plan === 'none') {
            startDate = null;
            endDate = null;
        }

        user.subscription = {
            plan: plan,
            startDate: startDate,
            endDate: endDate,
            active: plan !== 'none'
        };

        await user.save();

        res.json({
            success: true,
            message: `Subscription plan updated to ${plan}`,
            subscription: user.subscription
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create New Admin (Only Owner)
app.post('/api/users/create-admin', verifyToken, authorizeRoles('owner'), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();
        res.status(201).json({ success: true, message: 'Admin account created successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete User/Admin (Only Owner)
app.delete('/api/users/:userId', verifyToken, authorizeRoles('owner'), async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (targetUser.role === 'owner') {
            return res.status(403).json({ success: false, message: 'Owner account cannot be deleted!' });
        }

        await User.findByIdAndDelete(req.params.userId);
        res.json({ success: true, message: 'User deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ------------------- QUESTION API ENDPOINTS -------------------

// Helper Function for Questions Fetching
const fetchQuestionsHandler = async (req, res) => {
    try {
        const { category } = req.query;
        let filter = {};
        if (category) {
            filter.category = new RegExp(`^${category}(/|$)`, 'i');
        }
        const questions = await Question.find(filter);
        res.json({ success: true, mcqs: questions, questions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 1. Get Questions (/api/questions & /api/mcq support)
app.get('/api/questions', fetchQuestionsHandler);
app.get('/api/mcq', fetchQuestionsHandler);

// 2. Add New Single Question
app.post('/api/questions', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { q, options, ans, explanation, category } = req.body;
        const newQuestion = new Question({ q, options, ans, explanation, category });
        await newQuestion.save();
        res.status(201).json({ success: true, data: newQuestion });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 3. Update Question
app.put('/api/questions/:id', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: updatedQuestion });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 4. Delete Single Question
app.delete('/api/questions/:id', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 5. Bulk Delete Questions by Category
app.delete('/api/questions', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ success: false, error: 'Category query param is required' });
        }
        const result = await Question.deleteMany({ category: new RegExp(`^${category}(/|$)`, 'i') });
        res.json({ success: true, count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 6. Get Categories List (Updated for Frontend Compatibility)
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Question.distinct('category');
        res.json({
            success: true,
            categories: categories,
            data: categories
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 7. Bulk Upload CSV
app.post('/api/questions/upload-csv', verifyToken, authorizeRoles('owner', 'admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const categoryPath = req.body.category;
        if (!categoryPath) {
            return res.status(400).json({ success: false, error: 'Category path is required' });
        }

        const fileContent = req.file.buffer.toString('utf-8');
        const lines = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        if (lines.length < 2) {
            return res.status(400).json({ success: false, error: 'CSV file must have header and at least one data row.' });
        }

        const parseCSVLine = (text) => {
            const result = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const nextChar = text[i + 1];

                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        current += '"';
                        i++; 
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());

        let qIdx = headers.findIndex(h => h === 'question' || h === 'q');
        let opt0Idx = headers.findIndex(h => h === 'opt0' || h === 'option1');
        let opt1Idx = headers.findIndex(h => h === 'opt1' || h === 'option2');
        let opt2Idx = headers.findIndex(h => h === 'opt2' || h === 'option3');
        let opt3Idx = headers.findIndex(h => h === 'opt3' || h === 'option4');
        let ansIdx = headers.findIndex(h => h === 'ans' || h === 'answer');
        let expIdx = headers.findIndex(h => h === 'explanation');

        if (qIdx === -1) qIdx = 0;
        if (opt0Idx === -1) opt0Idx = 1;
        if (opt1Idx === -1) opt1Idx = 2;
        if (opt2Idx === -1) opt2Idx = 3;
        if (opt3Idx === -1) opt3Idx = 4;
        if (ansIdx === -1) ansIdx = 5;
        if (expIdx === -1) expIdx = 6;

        const results = [];

        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            
            const questionText = row[qIdx];
            const opt0 = row[opt0Idx];
            const opt1 = row[opt1Idx];
            const opt2 = row[opt2Idx];
            const opt3 = row[opt3Idx];

            if (questionText && opt0 && opt1 && opt2 && opt3) {
                results.push({
                    q: questionText,
                    options: [opt0, opt1, opt2, opt3],
                    ans: parseInt(row[ansIdx] || 0),
                    explanation: row[expIdx] || "",
                    category: categoryPath
                });
            }
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid rows found in CSV file.' });
        }

        await Question.insertMany(results);
        res.json({ success: true, count: results.length });

    } catch (err) {
        console.error('CSV Upload Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ------------------- FRONTEND FALLBACK ROUTE -------------------
// Safe Catch-all middleware for non-API GET requests (Serves index.html from /pages or root)
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(__dirname, 'pages', 'index.html'));
    }
    res.status(404).json({ success: false, message: 'API Route not found' });
});

// Server Start
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));