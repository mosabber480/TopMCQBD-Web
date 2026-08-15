import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { getDb } from '../utils/db.js';
import { generateToken, authenticate, authorize, addPlanDuration, VALID_PLANS } from '../utils/auth.js';
import { sendResetEmail } from '../utils/brevo.js';

// Default Fallbacks
const DEFAULT_HOME_CONFIG = {
  seoTitle: '',
  seoDescription: '',
  sliders: [
    {
      title: 'TopMCQBD এ আপনাকে স্বাগতম!',
      subtitle: 'সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্মে নিজেকে প্রস্তুত করুন।',
      bgImage: 'images/slider-01.jpg',
      bgOpacity: 0.5,
      btn1Text: 'কুইজ শুরু করুন',
      btn1Link: '/quiz',
      btn2Text: 'সকল প্যাকেজ',
      btn2Link: '/packages'
    },
    {
      title: 'সহজ ও নির্ভুল প্রস্তুতি',
      subtitle: 'টপিকভিত্তিক প্রশ্নব্যাংক ও রিয়েল-টাইম টাইমার টেস্ট।',
      bgImage: 'images/slider-02.jpg',
      bgOpacity: 0.5,
      btn1Text: 'সকল ক্যাটাগরি',
      btn1Link: '/all-mcq',
      btn2Text: 'যোগাযোগ করুন',
      btn2Link: '/contact'
    }
  ],
  demoQuizzes: [],
  packages: [],
  demoSectionInfo: { title: 'ফ্রি ডেমো কুইজ (Free Demo Quiz)', subtitle: 'কোনো রেজিস্ট্রেশন ছাড়াই এখনই নিচের কুইজগুলো প্র্যাকটিস করে দেখুন' },
  packageSectionInfo: { title: 'আমাদের প্রিপারেশন প্যাকেজসমূহ', subtitle: 'আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিন' },
  missionSectionInfo: {
    sectionTitle: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
    sectionSubtitle: 'শিক্ষার্থীদের প্রস্তুতিকে নির্ভুল ও প্রযুক্তিবান্ধব করা',
    missionTitle: 'আমাদের মিশন',
    missionDesc: 'একটি মানসম্মত ও বিষয়ভিত্তিক প্ল্যাটফর্ম তৈরি করা যাতে যে কেউ যেকোনো স্থান থেকে আত্মবিশ্বাসের সাথে প্রতিযোগিতামূলক পরীক্ষার প্রস্তুতি নিতে পারে।',
    goalTitle: 'আমাদের ভিশন',
    goalDesc: 'বাংলাদেশের অন্যতম বিশ্বস্ত এবং সমৃদ্ধ ই-লার্নিং ও অনলাইন কুইজ প্ল্যাটফর্ম হিসেবে গড়ে তোলা।'
  }
};

const DEFAULT_LAYOUT_CONFIG = {
  announcement: {
    text: "বিশেষ বিজ্ঞপ্তি: সার্ভার থেকে প্রথমবার কুইজের তথ্য লোড হতে ৩০ সেকেন্ড পর্যন্ত সময় লাগতে পারে। অনুগ্রহ করে ধৈর্য ধরুন!",
    link: ""
  },
  header: {
    siteTitle: "TopMCQBD",
    logoUrl: "/images/TopMCQ.png",
    seoTitle: "TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম",
    faviconUrl: "/images/favicon.ico",
    btnText: "সহায়তা",
    btnLink: "/contact",
    menus: [
      { title: "হোম", url: "/" },
      { title: "কুইজ অনুশীলন", url: "/quiz" },
      { title: "সকল MCQ", url: "/all-mcq" },
      { title: "প্যাকেজসমূহ", url: "/packages" },
      { title: "আমাদের সম্পর্কে", url: "/about-us" },
      { title: "যোগাযোগ", url: "/contact" }
    ],
    megaMenus: []
  },
  footer: {
    columns: [
      {
        type: "text",
        title: "TopMCQBD",
        content: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য একটি আধুনিক ও স্বয়ংসম্পূর্ণ অনলাইন প্রস্তুতি প্ল্যাটফর্ম।"
      },
      {
        type: "links",
        title: "গুরুত্বপূর্ণ লিংক",
        links: [
          { title: "হোম পেজ", url: "/" },
          { title: "কুইজ অনুশীলন", url: "/quiz" },
          { title: "সকল প্রশ্ন ক্যাটাগরি", url: "/all-mcq" },
          { title: "প্যাকেজ ও মূল্য তালিকা", url: "/packages" }
        ]
      },
      {
        type: "links",
        title: "সহায়তা ও তথ্য",
        links: [
          { title: "আমাদের সম্পর্কে", url: "/about-us" },
          { title: "যোগাযোগ করুন", url: "/contact" },
          { title: "সচরাচর জিজ্ঞাসা (FAQ)", url: "/faq" },
          { title: "রিফান্ড ও পেমেন্ট পলিসি", url: "/privacy-and-refund-policy" }
        ]
      }
    ]
  },
  copyright: {
    text: "© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।",
    links: [
      { title: "FAQ", url: "/faq" },
      { title: "Privacy & Refund Policy", url: "/privacy-and-refund-policy" },
      { title: "System Status", url: "/status" }
    ]
  }
};

const DEFAULT_SIDEBAR_CONFIG = {
  menus: [
    { title: 'ড্যাশবোর্ড', url: '/admin/dashboard', icon: 'fa-solid fa-gauge-high', subMenus: [] },
    { title: 'হেডার কন্ট্রোল', url: '/admin/header-dashboard', icon: 'fa-solid fa-window-restore', subMenus: [] },
    { title: 'ফুটার কন্ট্রোল', url: '/admin/footer-dashboard', icon: 'fa-solid fa-table-columns', subMenus: [] },
    { title: 'হোম পেজ কন্ট্রোল', url: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', subMenus: [] },
    { title: 'আমাদের সম্পর্কে', url: '/admin/about-dashboard', icon: 'fa-solid fa-address-card', subMenus: [] },
    { title: 'প্রশ্ন ব্যাংক ও কুইজ', url: '/admin/quiz-dashboard', icon: 'fa-solid fa-file-circle-question', subMenus: [] },
    { title: 'প্যাকেজসমূহ পেজ', url: '/admin/packages-dashboard', icon: 'fa-solid fa-box-open', subMenus: [] },
    { title: 'ইউজার ও সাবস্ক্রিপশন', url: '/admin/users', icon: 'fa-solid fa-users-gear', subMenus: [] },
    { title: 'সাইডবার মেনু কন্ট্রোল', url: '/admin/admin-menu-dashboard', icon: 'fa-solid fa-list-check', subMenus: [] },
    { title: 'রিফান্ড ও পলিসি', url: '/admin/policy-dashboard', icon: 'fa-solid fa-file-invoice-dollar', subMenus: [] },
    { title: 'ফ্রি এমসিকিউ কন্ট্রোল', url: '/admin/free-mcqs-dashboard', icon: 'fa-solid fa-gift', subMenus: [] }
  ],
  headerButtons: [
    { text: 'ওয়েবসাইট ভিজিট', url: '/', icon: 'fa-solid fa-globe', color: 'success', targetBlank: true, action: 'link' },
    { text: 'হোম পেজ এডিটর', url: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', color: 'primary', targetBlank: false, action: 'link' },
    { text: 'কুইজ ম্যানেজমেন্ট', url: '/admin/quiz-dashboard', icon: 'fa-solid fa-file-circle-question', color: 'info', targetBlank: false, action: 'link' },
    { text: 'ইউজার লিস্ট', url: '/admin/users', icon: 'fa-solid fa-users', color: 'warning', targetBlank: false, action: 'link' }
  ]
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
    }
  });
}

function parseCSVLine(text) {
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
}

export async function onRequest(context) {
  const { request } = context;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
      }
    });
  }

  const url = new URL(request.url);
  const rawRoute = context.params?.route;
  const routeParts = Array.isArray(rawRoute) ? rawRoute : (rawRoute ? [rawRoute] : url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean));
  const route = routeParts.join('/');

  try {
    const db = await getDb(context);

    // -------------------------------------------------------------
    // 1. HOME CONFIG (/api/home-config)
    // -------------------------------------------------------------
    if (route === 'home-config') {
      if (method === 'GET') {
        const config = await db.collection('homeconfigs').findOne();
        return jsonResponse(config || DEFAULT_HOME_CONFIG);
      }
      if (method === 'POST') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;
        const body = await request.json();
        delete body._id;
        body.updatedAt = new Date();
        const result = await db.collection('homeconfigs').findOneAndUpdate(
          {},
          { $set: body },
          { upsert: true, returnDocument: 'after' }
        );
        return jsonResponse({
          success: true,
          message: 'Home config saved successfully!',
          config: result?.value || body
        });
      }
    }

    // -------------------------------------------------------------
    // 2. LAYOUT CONFIG (/api/layout-config)
    // -------------------------------------------------------------
    if (route === 'layout-config') {
      if (method === 'GET') {
        const config = await db.collection('layoutconfigs').findOne();
        return jsonResponse(config || DEFAULT_LAYOUT_CONFIG);
      }
      if (method === 'POST') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;
        const body = await request.json();
        delete body._id;
        body.updatedAt = new Date();
        const result = await db.collection('layoutconfigs').findOneAndUpdate(
          {},
          { $set: body },
          { upsert: true, returnDocument: 'after' }
        );
        return jsonResponse({
          message: 'Layout configuration saved successfully!',
          config: result?.value || body
        });
      }
    }

    // -------------------------------------------------------------
    // 3. SIDEBAR CONFIG (/api/sidebar-config)
    // -------------------------------------------------------------
    if (route === 'sidebar-config') {
      if (method === 'GET') {
        const config = await db.collection('adminsidebarconfigs').findOne();
        if (!config) {
          return jsonResponse(DEFAULT_SIDEBAR_CONFIG);
        }
        return jsonResponse({
          menus: (config.menus && config.menus.length > 0) ? config.menus : DEFAULT_SIDEBAR_CONFIG.menus,
          headerButtons: (config.headerButtons && config.headerButtons.length > 0) ? config.headerButtons : DEFAULT_SIDEBAR_CONFIG.headerButtons
        });
      }
      if (method === 'POST') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;
        const body = await request.json();
        delete body._id;
        body.updatedAt = new Date();
        const result = await db.collection('adminsidebarconfigs').findOneAndUpdate(
          {},
          { $set: body },
          { upsert: true, returnDocument: 'after' }
        );
        return jsonResponse({
          message: 'সাইডবার ও হেডার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!',
          config: result?.value || body
        });
      }
    }

    // -------------------------------------------------------------
    // 4. CATEGORIES (/api/categories)
    // -------------------------------------------------------------
    if (route === 'categories' && method === 'GET') {
      const categories = await db.collection('questions').distinct('category');
      return jsonResponse({
        success: true,
        categories: categories || [],
        data: categories || []
      });
    }

    // -------------------------------------------------------------
    // 5. POLICY (/api/policy/get, /api/policy/save)
    // -------------------------------------------------------------
    if (route === 'policy/get' && method === 'GET') {
      const policy = await db.collection('policyconfigs').findOne();
      return jsonResponse(policy || { content: '' });
    }
    if (route === 'policy/save' && method === 'POST') {
      const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
      const { content } = await request.json();
      await db.collection('policyconfigs').updateOne(
        {},
        { $set: { content: content || '', updatedAt: new Date() } },
        { upsert: true }
      );
      return jsonResponse({ message: 'Policy saved successfully!' });
    }

    // -------------------------------------------------------------
    // 6. QUESTIONS (/api/questions, /api/mcq, /api/questions/:id, /api/questions/upload-csv)
    // -------------------------------------------------------------
    if (route === 'questions' || route === 'mcq') {
      if (method === 'GET') {
        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '0', 10);

        let filter = {};
        if (category && category !== 'all' && category !== 'All') {
          const trimmed = category.trim();
          const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          filter.category = { $regex: `^${escaped}((\\s*>\\s*)|(/|$))`, $options: 'i' };
        }

        let cursor = db.collection('questions').find(filter).sort({ createdAt: -1, _id: -1 });
        if (limit > 0) cursor = cursor.limit(limit);
        const questions = await cursor.toArray();

        return jsonResponse({
          success: true,
          mcqs: questions,
          questions,
          total: questions.length
        });
      }

      if (method === 'POST') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;
        const { q, options, ans, explanation, category } = await request.json();

        if (!q || !options || options.length < 2 || ans === undefined || !category) {
          return jsonResponse({ success: false, message: 'All question fields (q, options, ans, category) are required' }, 400);
        }

        const newQuestion = {
          q: q.trim(),
          options: options.map(o => (o !== undefined ? String(o).trim() : '')),
          ans: parseInt(ans, 10),
          explanation: explanation || '',
          category: category.trim(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection('questions').insertOne(newQuestion);
        newQuestion._id = result.insertedId;
        return jsonResponse({ success: true, data: newQuestion }, 201);
      }

      if (method === 'DELETE') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;
        const category = url.searchParams.get('category');
        if (!category) return jsonResponse({ success: false, error: 'Category query param is required' }, 400);

        const trimmed = category.trim();
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const result = await db.collection('questions').deleteMany({
          category: { $regex: `^${escaped}((\\s*>\\s*)|(/|$))`, $options: 'i' }
        });
        return jsonResponse({ success: true, count: result.deletedCount });
      }
    }

    if (route === 'questions/upload-csv' && method === 'POST') {
      const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
      if (errorResponse) return errorResponse;

      const formData = await request.formData();
      const file = formData.get('file');
      const categoryPath = formData.get('category');

      if (!file) return jsonResponse({ success: false, error: 'No file uploaded' }, 400);
      if (!categoryPath) return jsonResponse({ success: false, error: 'Category path is required' }, 400);

      const fileContent = await file.text();
      const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length < 2) {
        return jsonResponse({ success: false, error: 'CSV file must have header and at least one data row.' }, 400);
      }

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
      const now = new Date();

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
            explanation: row[expIdx] || '',
            category: categoryPath.toString().trim(),
            createdAt: now,
            updatedAt: now
          });
        }
      }

      if (results.length === 0) {
        return jsonResponse({ success: false, error: 'No valid rows found in CSV file.' }, 400);
      }

      const insertRes = await db.collection('questions').insertMany(results);
      return jsonResponse({ success: true, count: insertRes.insertedCount });
    }

    if (routeParts[0] === 'questions' && routeParts.length === 2) {
      const qId = routeParts[1];
      let oId;
      try { oId = new ObjectId(qId); } catch { oId = qId; }

      if (method === 'PUT') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;
        const body = await request.json();
        delete body._id;
        body.updatedAt = new Date();
        const updated = await db.collection('questions').findOneAndUpdate(
          { _id: oId },
          { $set: body },
          { returnDocument: 'after' }
        );
        return jsonResponse({ success: true, data: updated?.value || body });
      }

      if (method === 'DELETE') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;
        await db.collection('questions').deleteOne({ _id: oId });
        return jsonResponse({ success: true, message: 'Question deleted successfully' });
      }
    }

    // -------------------------------------------------------------
    // 7. AUTH ROUTES (/api/auth/...)
    // -------------------------------------------------------------
    if (route === 'auth/login' && method === 'POST') {
      const { email, password } = await request.json();
      if (!email || !password) {
        return jsonResponse({ success: false, message: 'Email and password are required' }, 400);
      }

      const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return jsonResponse({ success: false, message: 'Invalid Email or Password' }, 400);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return jsonResponse({ success: false, message: 'Invalid Email or Password' }, 400);
      }

      let subUpdate = {};
      if (user.subscription?.active && user.subscription?.endDate && new Date() > new Date(user.subscription.endDate)) {
        subUpdate['subscription.active'] = false;
      }

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date(), ...subUpdate } }
      );

      const token = generateToken(user, context.env);

      return jsonResponse({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          pendingRequests: user.pendingRequests || []
        }
      });
    }

    if (route === 'auth/register' && method === 'POST') {
      const { name, email, password, role } = await request.json();
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'All fields (Name, Email, Password) are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      const existingUser = await db.collection('users').findOne({ email: cleanEmail });
      if (existingUser) {
        return jsonResponse({ success: false, message: 'User already exists with this email' }, 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role && ['customer', 'admin'].includes(role) ? role : 'customer',
        pendingRequests: [],
        subscription: { plan: 'none', startDate: null, endDate: null, active: false },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('users').insertOne(newUser);
      return jsonResponse({ success: true, message: 'User registered successfully!' }, 201);
    }

    if (route === 'auth/forgot-password' && method === 'POST') {
      const { email } = await request.json();
      if (!email) return jsonResponse({ success: false, message: 'Email address is required' }, 400);

      const cleanEmail = email.toLowerCase().trim();
      const user = await db.collection('users').findOne({ email: cleanEmail });
      if (!user) {
        return jsonResponse({ success: false, message: 'Email address not found.' }, 404);
      }

      const token = crypto.randomUUID().replace(/-/g, '');
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { resetPasswordToken: token, resetPasswordExpires: resetExpires } }
      );

      const origin = request.headers.get('origin') || url.origin || 'https://topmcqbd.pages.dev';
      const resetLink = `${origin}/login?token=${token}&email=${encodeURIComponent(user.email)}`;

      try {
        await sendResetEmail(user, resetLink, context.env);
      } catch (e) {
        console.error('Email send error:', e);
      }

      return jsonResponse({
        success: true,
        message: 'Password reset link has been sent to your email.'
      });
    }

    if (route === 'auth/reset-password' && method === 'POST') {
      const { email, token, newPassword } = await request.json();
      if (!email || !token || !newPassword) {
        return jsonResponse({ success: false, message: 'All fields are required.' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      const user = await db.collection('users').findOne({
        email: cleanEmail,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        return jsonResponse({ success: false, message: 'Password reset token is invalid or has expired.' }, 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword },
          $unset: { resetPasswordToken: '', resetPasswordExpires: '' }
        }
      );

      return jsonResponse({ success: true, message: 'Password has been successfully updated!' });
    }

    if (route === 'auth/change-password' && method === 'PUT') {
      const { user, errorResponse } = await authenticate(context);
      if (errorResponse) return errorResponse;

      const { oldPassword, newPassword } = await request.json();
      if (!oldPassword || !newPassword) {
        return jsonResponse({ success: false, message: 'Both current password and new password are required' }, 400);
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return jsonResponse({ success: false, message: 'Current password is incorrect' }, 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

      return jsonResponse({ success: true, message: 'Password updated successfully!' });
    }

    // -------------------------------------------------------------
    // 8. USERS ROUTES (/api/users/...)
    // -------------------------------------------------------------
    if (route === 'users') {
      if (method === 'GET') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;

        const users = await db.collection('users')
          .find({}, { projection: { password: 0 } })
          .sort({ createdAt: -1 })
          .toArray();

        return jsonResponse({ success: true, users });
      }
    }

    if (route === 'users/me' && method === 'GET') {
      const { user, errorResponse } = await authenticate(context);
      if (errorResponse) return errorResponse;

      return jsonResponse({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          pendingRequests: user.pendingRequests || [],
          createdAt: user.createdAt
        }
      });
    }

    if (route === 'users/request-plan' && method === 'POST') {
      const { user, errorResponse } = await authenticate(context);
      if (errorResponse) return errorResponse;

      const { plan, action, requestId, phone, transactionId, paymentMethod } = await request.json();

      if (!plan || !action || !phone || !transactionId || !paymentMethod) {
        return jsonResponse({ success: false, message: 'সব তথ্য (plan, action, phone, transactionId, paymentMethod) দেওয়া বাধ্যতামূলক।' }, 400);
      }

      if (!VALID_PLANS.includes(plan) && !plan.startsWith('custom')) {
        return jsonResponse({ success: false, message: 'সঠিক প্যাকেজ নির্বাচন করুন।' }, 400);
      }

      if (!['new', 'add', 'change', 'renew'].includes(action)) {
        return jsonResponse({ success: false, message: 'সঠিক action দেওয়া হয়নি।' }, 400);
      }

      if (!['bkash', 'nagad'].includes(paymentMethod)) {
        return jsonResponse({ success: false, message: 'পেমেন্ট মাধ্যম বিকাশ অথবা নগদ হতে হবে।' }, 400);
      }

      const pendingRequests = user.pendingRequests || [];
      const newReq = {
        _id: new ObjectId(),
        plan,
        type: action,
        phone: phone.trim(),
        transactionId: transactionId.trim(),
        paymentMethod,
        status: 'pending',
        requestedAt: new Date()
      };

      if (action === 'change') {
        const idx = pendingRequests.findIndex(r => r._id?.toString() === requestId || r.id === requestId);
        if (idx === -1) return jsonResponse({ success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' }, 404);
        pendingRequests[idx] = { ...pendingRequests[idx], ...newReq, _id: pendingRequests[idx]._id };
      } else {
        pendingRequests.push(newReq);
      }

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { pendingRequests, updatedAt: new Date() } }
      );

      return jsonResponse({
        success: true,
        message: 'Plan request submitted successfully!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          pendingRequests
        }
      });
    }

    if (route === 'users/create-admin' && method === 'POST') {
      const { user, errorResponse } = await authorize(context, ['owner']);
      if (errorResponse) return errorResponse;

      const { name, email, password } = await request.json();
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'Name, email, and password are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = await db.collection('users').findOne({ email: cleanEmail });
      if (existing) {
        return jsonResponse({ success: false, message: 'User with this email already exists' }, 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await db.collection('users').insertOne({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin',
        pendingRequests: [],
        subscription: { plan: 'none', startDate: null, endDate: null, active: false },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return jsonResponse({ success: true, message: 'Admin account created successfully!' }, 201);
    }

    // Dynamic user sub-routes: /api/users/:userId...
    if (routeParts[0] === 'users' && routeParts.length >= 2) {
      const targetUserId = routeParts[1];
      let oUserId;
      try { oUserId = new ObjectId(targetUserId); } catch { oUserId = targetUserId; }

      // DELETE /api/users/:userId
      if (routeParts.length === 2 && method === 'DELETE') {
        const { user, errorResponse } = await authorize(context, ['owner']);
        if (errorResponse) return errorResponse;

        const target = await db.collection('users').findOne({ _id: oUserId });
        if (!target) return jsonResponse({ success: false, message: 'User not found' }, 404);
        if (target.role === 'owner') return jsonResponse({ success: false, message: 'Owner account cannot be deleted!' }, 403);

        await db.collection('users').deleteOne({ _id: oUserId });
        return jsonResponse({ success: true, message: 'User deleted successfully!' });
      }

      // PUT /api/users/:userId/subscription
      if (routeParts.length === 3 && routeParts[2] === 'subscription' && method === 'PUT') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;

        const { plan, customName, years, months, days } = await request.json();
        const target = await db.collection('users').findOne({ _id: oUserId });
        if (!target) return jsonResponse({ success: false, message: 'User not found' }, 404);

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

        const subscription = {
          plan: finalPlanName,
          startDate: plan !== 'none' ? startDate : null,
          endDate: plan !== 'none' ? endDate : null,
          active: plan !== 'none'
        };

        await db.collection('users').updateOne(
          { _id: oUserId },
          { $set: { subscription, updatedAt: new Date() } }
        );

        return jsonResponse({
          success: true,
          message: `Subscription plan updated to ${finalPlanName}`,
          subscription
        });
      }

      // PUT /api/users/:userId/pending-requests/:requestId/approve
      if (routeParts.length === 5 && routeParts[2] === 'pending-requests' && routeParts[4] === 'approve' && method === 'PUT') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;

        const requestId = routeParts[3];
        const target = await db.collection('users').findOne({ _id: oUserId });
        if (!target) return jsonResponse({ success: false, message: 'User not found' }, 404);

        const pendingRequests = target.pendingRequests || [];
        const reqItem = pendingRequests.find(r => r._id?.toString() === requestId || r.id === requestId);
        if (!reqItem || reqItem.status !== 'pending') {
          return jsonResponse({ success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' }, 404);
        }

        const now = new Date();
        const hasFutureEndDate = target.subscription?.active && target.subscription?.endDate && new Date(target.subscription.endDate) > now;
        const baseDate = hasFutureEndDate ? new Date(target.subscription.endDate) : now;
        const newEndDate = addPlanDuration(baseDate, reqItem.plan);

        let newPlanName = reqItem.plan;
        if (hasFutureEndDate && target.subscription?.plan && target.subscription?.plan !== 'none') {
          newPlanName = target.subscription.plan + ' + ' + reqItem.plan;
        }

        const subscription = {
          plan: newPlanName,
          startDate: (target.subscription?.startDate && hasFutureEndDate) ? target.subscription.startDate : now,
          endDate: newEndDate,
          active: true
        };

        reqItem.status = 'approved';

        await db.collection('users').updateOne(
          { _id: oUserId },
          { $set: { subscription, pendingRequests, updatedAt: new Date() } }
        );

        return jsonResponse({
          success: true,
          message: `${reqItem.plan} প্ল্যান অনুমোদন করা হয়েছে।`,
          subscription,
          pendingRequests
        });
      }

      // PUT /api/users/:userId/pending-requests/:requestId/reject
      if (routeParts.length === 5 && routeParts[2] === 'pending-requests' && routeParts[4] === 'reject' && method === 'PUT') {
        const { user, errorResponse } = await authorize(context, ['owner', 'admin']);
        if (errorResponse) return errorResponse;

        const requestId = routeParts[3];
        const { reason } = await request.json();
        const target = await db.collection('users').findOne({ _id: oUserId });
        if (!target) return jsonResponse({ success: false, message: 'User not found' }, 404);

        const pendingRequests = target.pendingRequests || [];
        const reqItem = pendingRequests.find(r => r._id?.toString() === requestId || r.id === requestId);
        if (!reqItem || reqItem.status !== 'pending') {
          return jsonResponse({ success: false, message: 'Pending request খুঁজে পাওয়া যায়নি।' }, 404);
        }

        reqItem.status = 'rejected';
        reqItem.rejectionReason = reason || 'পেমেন্ট তথ্য সঠিক নয়।';

        await db.collection('users').updateOne(
          { _id: oUserId },
          { $set: { pendingRequests, updatedAt: new Date() } }
        );

        return jsonResponse({
          success: true,
          message: 'Request reject করা হয়েছে।',
          pendingRequests
        });
      }
    }

    // Default fallback 404 for unknown /api/* endpoints
    return jsonResponse({ error: 'Endpoint not found', route }, 404);

  } catch (err) {
    console.error('CLOUDFLARE FUNCTION API ERROR:', err);
    return jsonResponse({ success: false, error: err.message || 'Internal Server Error' }, 500);
  }
}
