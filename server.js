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
const layoutRoutes = require('./routes/layoutRoutes');
const adminSidebarRoutes = require('./routes/adminSidebarRoutes');
const policyRoutes = require('./routes/policyRoutes');
const { verifyToken, authorizeRoles } = require('./middleware/authMiddleware');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic CORS Setup for Cloudflare Pages & Custom Domains
const allowedOrigins = [
  'https://topmcqbd.pages.dev',
  'https://topmcqbd.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.pages.dev')) {
      return callback(null, true);
    } else {
      return callback(null, true); // Fallback allow for dynamic origins if needed
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// ------------------- STATIC FILES & ROUTING SETUP -------------------
// 1. Project Root Directory (Serves HTML, CSS, JS directly from main folder)
app.use(express.static(__dirname));

// 2. Admin & Global Sub-folders
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/global', express.static(path.join(__dirname, 'global')));

// 3. External API Routes Setup (Fixed Mount Paths)
app.use('/api/auth', authRoutes);
app.use('/api/home-config', homeConfigRoutes);
app.use('/api', layoutRoutes); 
app.use('/api', adminSidebarRoutes);
app.use('/api/policy', policyRoutes);

// Multer Setup for Memory Storage
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB Connection Setup
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mosabber480_db_user:EScirLEzwgQVVNaB@ac-472re4l-shard-00-00.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-01.3ajdj0u.mongodb.net:27017,ac-472re4l-shard-00-02.3ajdj0u.mongodb.net:27017/TopMCQBD_DB?ssl=true&replicaSet=atlas-wzdf1e-shard-0&authSource=admin&appName=Mosabber';
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

// ------------------- SUBSCRIPTION HELPER -------------------

const VALID_PLANS = ['1_month', '3_months', '6_months', '1_year', '2_years', '3_years'];

// 💡 কোনো একটা তারিখের উপর plan-এর মেয়াদ যোগ করার হেল্পার ফাংশন
function addPlanDuration(baseDate, plan) {
    const d = new Date(baseDate);
    if (plan === '1_month') d.setMonth(d.getMonth() + 1);
    else if (plan === '3_months') d.setMonth(d.getMonth() + 3);
    else if (plan === '6_months') d.setMonth(d.getMonth() + 6);
    else if (plan === '1_year') d.setFullYear(d.getFullYear() + 1);
    else if (plan === '2_years') d.setFullYear(d.getFullYear() + 2);
    else if (plan === '3_years') d.setFullYear(d.getFullYear() + 3);
    return d;
}

// Change Password API (Any Logged In User)
app.put('/api/auth/change-password', verifyToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const userId = req.user.id || req.user._id || req.user.userId;
        const user = await User.findById(userId);
        
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

// Get Current Logged-in User Profile Data
app.get('/api/users/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id || req.user.userId;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Request a Subscription Plan
app.post('/api/users/request-plan', verifyToken, async (req, res) => {
    try {
        const { plan, action, requestId, phone, transactionId, paymentMethod } = req.body;

        if (!plan || !action || !phone || !transactionId || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'সব তথ্য (plan, action, phone, transactionId, paymentMethod) দেওয়া বাধ্যতামূলক।' });
        }
        if (!VALID_PLANS.includes(plan)) {
            return res.status(400).json({ success: false, message: 'সঠিক প্যাকেজ নির্বাচন করুন।' });
        }
        if (!['new', 'add', 'change', 'renew'].includes(action)) {
            return res.status(400).json({ success: false, message: 'সঠিক action দেওয়া হয়নি।' });
        }
        if (!['bkash', 'nagad'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: 'পেমেন্ট মাধ্যম বিকাশ অথবা নগদ হতে হবে।' });
        }

        const userId = req.user.id || req.user._id || req.user.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isSubActive = user.subscription && user.subscription.active &&
            user.subscription.endDate && new Date(user.subscription.endDate) > new Date();
        const pendingCount = user.pendingRequests.filter(r => r.status === 'pending').length;

        if (action === 'renew' && !isSubActive) {
            return res.status(400).json({ success: false, message: 'আপনার কোনো Active subscription নেই, তাই Renew request পাঠানো যাবে না।' });
        }
        if (action !== 'renew' && isSubActive) {
            return res.status(400).json({ success: false, message: 'আপনার Active subscription আছে। শুধু মেয়াদ বাড়ানোর (renew) রিকোয়েস্ট পাঠানো যাবে।' });
        }
        if (action === 'new' && pendingCount > 0) {
            return res.status(400).json({ success: false, message: 'আপনার আগে থেকে একটা Pending request আছে। এই প্যাকেজটা Add করুন অথবা আগেরটা Change করুন।' });
        }
        if ((action === 'add' || action === 'change') && pendingCount === 0) {
            return res.status(400).json({ success: false, message: 'আপনার কোনো Pending request নেই।' });
        }

        if (action === 'change') {
            if (!requestId) {
                return res.status(400).json({ success: false, message: 'কোন রিকোয়েস্টটা পরিবর্তন করতে চান তা উল্লেখ করা হয়নি।' });
            }
            const target = user.pendingRequests.id(requestId);
            if (!target || target.status !== 'pending') {
                return res.status(404).json({ success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' });
            }
            target.plan = plan;
            target.phone = phone;
            target.transactionId = transactionId;
            target.paymentMethod = paymentMethod;
            target.requestedAt = new Date();
        } else {
            user.pendingRequests.push({
                plan,
                type: action,
                phone,
                transactionId,
                paymentMethod,
                status: 'pending',
                requestedAt: new Date()
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'Plan request submitted successfully!',
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
        res.status(500).json({ success: false, error: err.message });
    }
});

// Edit/Update Payment History Record
app.put('/api/users/:userId/pending-requests/:requestId', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { plan, paymentMethod, phone, transactionId } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const request = user.pendingRequests.id(req.params.requestId);
        if (!request) return res.status(404).json({ success: false, message: 'Record not found' });

        if (plan) request.plan = plan;
        if (paymentMethod) request.paymentMethod = paymentMethod;
        if (phone) request.phone = phone;
        if (transactionId) request.transactionId = transactionId;

        await user.save();
        res.json({ success: true, message: 'Payment record updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete Payment History Record
app.delete('/api/users/:userId/pending-requests/:requestId', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.pendingRequests.pull(req.params.requestId);
        await user.save();
        res.json({ success: true, message: 'Payment record deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Approve a specific Pending Request (Owner and Admin only)
app.put('/api/users/:userId/pending-requests/:requestId/approve', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const request = user.pendingRequests.id(req.params.requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' });
        }

        const now = new Date();
        const hasFutureEndDate = user.subscription && user.subscription.active &&
            user.subscription.endDate && new Date(user.subscription.endDate) > now;

        const baseDate = hasFutureEndDate ? new Date(user.subscription.endDate) : now;
        const newEndDate = addPlanDuration(baseDate, request.plan);

        let newPlanName = request.plan;
        if (hasFutureEndDate && user.subscription.plan && user.subscription.plan !== 'none') {
            newPlanName = user.subscription.plan + ' + ' + request.plan;
        }

        user.subscription = {
            plan: newPlanName,
            startDate: (user.subscription && user.subscription.startDate && hasFutureEndDate) ? user.subscription.startDate : now,
            endDate: newEndDate,
            active: true
        };

        request.status = 'approved';

        await user.save();

        res.json({
            success: true,
            message: `${request.plan} প্ল্যান অনুমোদন করা হয়েছে। নতুন মেয়াদ শেষ হবে ${newEndDate.toLocaleDateString()} তারিখে।`,
            subscription: user.subscription,
            pendingRequests: user.pendingRequests
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Reject a specific Pending Request (Owner and Admin only)
app.put('/api/users/:userId/pending-requests/:requestId/reject', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const request = user.pendingRequests.id(req.params.requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' });
        }

        request.status = 'rejected';
        request.rejectionReason = reason || 'পেমেন্ট তথ্য সঠিক নয়।';

        await user.save();

        res.json({ success: true, message: 'Request reject করা হয়েছে।', pendingRequests: user.pendingRequests });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update Subscription Plan Directly (Manual Override with Custom Support)
app.put('/api/users/:userId/subscription', verifyToken, authorizeRoles('owner', 'admin'), async (req, res) => {
    try {
        const { plan, customName, years, months, days } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let startDate = new Date();
        let endDate = new Date();
        let finalPlanName = plan;

        if (plan === 'custom') {
            endDate.setFullYear(endDate.getFullYear() + (parseInt(years) || 0));
            endDate.setMonth(endDate.getMonth() + (parseInt(months) || 0));
            endDate.setDate(endDate.getDate() + (parseInt(days) || 0));
            finalPlanName = customName || 'Custom Package';
        } else if (plan === '1_month') endDate.setMonth(endDate.getMonth() + 1);
        else if (plan === '3_months') endDate.setMonth(endDate.getMonth() + 3);
        else if (plan === '6_months') endDate.setMonth(endDate.getMonth() + 6);
        else if (plan === '1_year') endDate.setFullYear(endDate.getFullYear() + 1);
        else if (plan === '2_years') endDate.setFullYear(endDate.getFullYear() + 2);
        else if (plan === '3_years') endDate.setFullYear(endDate.getFullYear() + 3);
        else if (plan === 'none') {
            startDate = null;
            endDate = null;
        }

        user.subscription = {
            plan: finalPlanName,
            startDate: startDate,
            endDate: endDate,
            active: plan !== 'none'
        };

        await user.save();

        res.json({
            success: true,
            message: `Subscription plan updated to ${finalPlanName}`,
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

// 6. Get Categories List
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

// Root Path Handler (Serves index.html from main project folder)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Safe Catch-all middleware for non-API GET requests
app.use((req, res) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        const requestedPath = path.join(__dirname, req.path);
        
        return res.sendFile(requestedPath, (err) => {
            if (err) {
                res.sendFile(path.join(__dirname, 'index.html'));
            }
        });
    }
    res.status(404).json({ success: false, message: 'API Route not found' });
});

// Server Start
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));