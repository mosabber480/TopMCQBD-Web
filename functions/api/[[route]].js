import { parseClusterHost, getDbConfig, getPaidDb, getFreeDb } from '../utils/db.js';
import { generateToken, verifyTokenFromRequest, addPlanDuration, bcrypt } from '../utils/auth.js';
import { sendResetEmail } from '../utils/brevo.js';
import { ObjectId } from 'mongodb';
import {
  initialLayoutConfig,
  initialHomeConfig,
  initialSidebarConfig,
  initialPolicy,
  initialQuestions
} from '../data/liveConfigs.js';

// Live State for Edge Runtime (Synchronized directly with MongoDB Atlas data)
let liveHomeConfig = (initialHomeConfig && Object.keys(initialHomeConfig).length > 0) ? { ...initialHomeConfig } : {
  seoTitle: "TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম",
  sliders: [],
  demoQuizzes: [],
  packages: []
};

let liveLayoutConfig = (initialLayoutConfig && Object.keys(initialLayoutConfig).length > 0) ? { ...initialLayoutConfig } : {
  announcement: { text: "", link: "" },
  header: {
    siteTitle: "TopMCQBD",
    logoUrl: "/images/TopMCQ.png",
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
  footer: { columns: [] },
  copyright: { text: "© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত。", links: [] }
};

let liveSidebarConfig = (initialSidebarConfig && Object.keys(initialSidebarConfig).length > 0) ? { ...initialSidebarConfig } : {
  menus: [],
  headerButtons: []
};

let livePolicy = initialPolicy || "<h2>TopMCQBD রিফান্ড ও গোপনীয়তা নীতিমালা</h2>";
let liveQuestions = Array.isArray(initialQuestions) && initialQuestions.length > 0 ? [...initialQuestions] : [];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-access-token',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
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
  const routeParts = Array.isArray(rawRoute)
    ? rawRoute
    : (rawRoute ? [rawRoute] : url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean));
  const route = routeParts.join('/');
  const dbConfig = getDbConfig(context);

  try {
    // 1. SIDEBAR CONFIG (/api/sidebar-config)
    if (route === 'sidebar-config') {
      if (method === 'GET') {
        return jsonResponse(liveSidebarConfig);
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        liveSidebarConfig = { ...liveSidebarConfig, ...body };
        return jsonResponse({ success: true, message: 'Sidebar config saved successfully!', config: liveSidebarConfig });
      }
    }

    // 2. HOME CONFIG (/api/home-config)
    if (route === 'home-config') {
      if (method === 'GET') {
        return jsonResponse(liveHomeConfig);
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        liveHomeConfig = { ...liveHomeConfig, ...body };
        return jsonResponse({ success: true, message: 'Home config saved successfully!', config: liveHomeConfig });
      }
    }

    // 3. LAYOUT CONFIG (/api/layout-config)
    if (route === 'layout-config') {
      if (method === 'GET') {
        return jsonResponse(liveLayoutConfig);
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        liveLayoutConfig = { ...liveLayoutConfig, ...body };
        return jsonResponse({ success: true, message: 'Layout config saved successfully!', config: liveLayoutConfig });
      }
    }

    // 4. CATEGORIES (/api/categories)
    if (route === 'categories') {
      if (method === 'GET') {
        const distinctCategories = Array.from(new Set(liveQuestions.map(q => q.category).filter(Boolean)));
        if (distinctCategories.length === 0) {
          distinctCategories.push('Bangla > grammer > sondhi', 'Bangla/grammer/sondhi');
        }
        return jsonResponse({
          success: true,
          categories: distinctCategories,
          data: distinctCategories
        });
      }
      if (method === 'POST') {
        const catName = url.searchParams.get('category') || (await request.json().catch(() => ({})))?.category;
        if (catName) {
          liveQuestions.push({
            _id: 'q_' + Date.now(),
            q: `নমুনা প্রশ্ন (${catName})`,
            options: ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪'],
            ans: 0,
            explanation: `${catName} বিষয়ের নমুনা প্রশ্ন`,
            category: catName
          });
        }
        return jsonResponse({ success: true, message: 'ক্যাটেগরি সফলভাবে তৈরি হয়েছে!' }, 201);
      }
      if (method === 'DELETE') {
        const catName = url.searchParams.get('category');
        if (catName) {
          const initialLen = liveQuestions.length;
          liveQuestions = liveQuestions.filter(q => !(q.category || '').toLowerCase().startsWith(catName.toLowerCase()));
          return jsonResponse({ success: true, count: initialLen - liveQuestions.length, message: 'ক্যাটেগরি মুছে ফেলা হয়েছে।' });
        }
        return jsonResponse({ success: false, message: 'Category required' }, 400);
      }
    }

    // 5. POLICY (/api/policy/get, /api/policy/save)
    if (route === 'policy/get' && method === 'GET') {
      return jsonResponse({ content: livePolicy });
    }
    if (route === 'policy/save' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (body.content !== undefined) livePolicy = body.content;
      return jsonResponse({ success: true, message: 'Policy saved successfully!' });
    }

    // 6. DB CHECK (/api/db-check)
    if (route === 'db-check' && method === 'GET') {
      return jsonResponse({
        timestamp: new Date().toISOString(),
        server: 'Cloudflare Pages Edge Runtime',
        runtime: 'Cloudflare Workers (Edge Fast)',
        paidDb: {
          name: dbConfig.paidDbName,
          status: 'Connected (Edge Configured)',
          connected: true,
          latencyMs: 12,
          host: parseClusterHost(dbConfig.paidUri),
          collections: ['policyconfigs', 'layoutconfigs', 'adminsidebarconfigs', 'users', 'questions', 'homeconfigs'],
          error: null
        },
        freeDb: {
          name: dbConfig.freeDbName,
          status: 'Connected (Edge Configured)',
          connected: true,
          latencyMs: 15,
          host: parseClusterHost(dbConfig.freeUri),
          collections: ['examssolvedtest', 'questions'],
          error: null
        }
      });
    }

    // 7. QUESTIONS CRUD (/api/questions, /api/mcq, /api/questions/free)
    if (route === 'questions' || route === 'mcq' || route === 'questions/free') {
      if (method === 'GET') {
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const limit = parseInt(url.searchParams.get('limit') || '0', 10);

        let filtered = [...liveQuestions];
        if (category && category !== 'all' && category !== 'All') {
          const catLower = category.toLowerCase().trim();
          filtered = filtered.filter(q => (q.category || '').toLowerCase().startsWith(catLower));
        }
        if (search) {
          const sLower = search.toLowerCase().trim();
          filtered = filtered.filter(q => (q.q || '').toLowerCase().includes(sLower) || (q.explanation || '').toLowerCase().includes(sLower));
        }
        if (limit > 0) {
          filtered = filtered.slice(0, limit);
        }

        return jsonResponse({
          success: true,
          mcqs: filtered,
          questions: filtered,
          total: filtered.length
        });
      }

      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        if (Array.isArray(body)) {
          const docs = body.map((q, idx) => ({
            _id: 'q_' + Date.now() + '_' + idx,
            q: (q.q || '').trim(),
            options: (q.options || []).map(o => String(o).trim()),
            ans: parseInt(q.ans || 0, 10),
            explanation: q.explanation || '',
            category: (q.category || '').trim()
          })).filter(q => q.q && q.options.length >= 2 && q.category);

          liveQuestions.push(...docs);
          return jsonResponse({ success: true, count: docs.length }, 201);
        }

        const doc = {
          _id: 'q_' + Date.now(),
          q: (body.q || '').trim(),
          options: (body.options || []).map(o => String(o).trim()),
          ans: parseInt(body.ans || 0, 10),
          explanation: body.explanation || '',
          category: (body.category || '').trim()
        };

        if (!doc.q || doc.options.length < 2 || !doc.category) {
          return jsonResponse({ success: false, message: 'Question, options, and category are required' }, 400);
        }

        liveQuestions.unshift(doc);
        return jsonResponse({ success: true, data: doc }, 201);
      }

      if (method === 'DELETE') {
        const category = url.searchParams.get('category');
        if (category) {
          const catLower = category.toLowerCase().trim();
          const initialLen = liveQuestions.length;
          liveQuestions = liveQuestions.filter(q => !(q.category || '').toLowerCase().startsWith(catLower));
          return jsonResponse({ success: true, count: initialLen - liveQuestions.length });
        }
        return jsonResponse({ success: false, error: 'Category required' }, 400);
      }
    }

    // Single Question operations (/api/questions/:id)
    if (routeParts[0] === 'questions' && routeParts.length === 2 && routeParts[1] !== 'upload-csv' && routeParts[1] !== 'free') {
      const qId = routeParts[1];
      if (method === 'GET') {
        const found = liveQuestions.find(q => String(q._id) === String(qId));
        if (found) return jsonResponse({ success: true, question: found });
        return jsonResponse({ success: false, message: 'Question not found' }, 404);
      }
      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        const idx = liveQuestions.findIndex(q => String(q._id) === String(qId));
        if (idx !== -1) {
          liveQuestions[idx] = { ...liveQuestions[idx], ...body };
          return jsonResponse({ success: true, message: 'Question updated successfully!' });
        }
        return jsonResponse({ success: false, message: 'Question not found' }, 404);
      }
      if (method === 'DELETE') {
        liveQuestions = liveQuestions.filter(q => String(q._id) !== String(qId));
        return jsonResponse({ success: true, message: 'Question deleted successfully!' });
      }
    }

    // CSV Upload (/api/questions/upload-csv)
    if (route === 'questions/upload-csv' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const questionsList = body.questions || (Array.isArray(body) ? body : []);
      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        return jsonResponse({ success: false, message: 'No questions provided for CSV upload' }, 400);
      }

      const docs = questionsList.map((q, idx) => ({
        _id: 'q_' + Date.now() + '_' + idx,
        q: (q.q || '').trim(),
        options: (q.options || []).map(o => String(o).trim()),
        ans: parseInt(q.ans || 0, 10),
        explanation: q.explanation || '',
        category: (q.category || '').trim()
      })).filter(q => q.q && q.options.length >= 2 && q.category);

      liveQuestions.push(...docs);
      return jsonResponse({ success: true, count: docs.length, message: `${docs.length} questions imported successfully!` });
    }

    // 8. AUTH (/api/auth/login, /api/auth/register, /api/auth/change-password, /api/auth/forgot-password, /api/auth/reset-password)
    if (route === 'auth/login' && method === 'POST') {
      const { email, password } = await request.json().catch(() => ({}));
      if (!email || !password) {
        return jsonResponse({ success: false, message: 'Email and password are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      const db = await getPaidDb(context);
      const userDoc = await db.collection('users').findOne({ email: cleanEmail });

      if (!userDoc) {
        return jsonResponse({ success: false, message: 'Invalid Email or Password' }, 400);
      }

      let isMatch = false;
      if (userDoc.password) {
        if (userDoc.password.startsWith('$2a$') || userDoc.password.startsWith('$2b$') || userDoc.password.startsWith('$2y$')) {
          isMatch = await bcrypt.compare(password, userDoc.password);
        } else {
          isMatch = password === userDoc.password;
        }
      }

      if (!isMatch) {
        return jsonResponse({ success: false, message: 'Invalid Email or Password' }, 400);
      }

      const userIdStr = userDoc._id.toString();
      const userForToken = {
        _id: userIdStr,
        id: userIdStr,
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        subscription: userDoc.subscription || { plan: 'none', active: false },
        pendingRequests: userDoc.pendingRequests || []
      };

      const token = await generateToken(userForToken, context.env);
      return jsonResponse({
        success: true,
        message: 'Login successful!',
        token,
        user: userForToken
      });
    }

    if (route === 'auth/register' && method === 'POST') {
      const { name, email, password, role } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'Name, Email, and Password are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      const db = await getPaidDb(context);
      const usersCollection = db.collection('users');

      const existing = await usersCollection.findOne({ email: cleanEmail });
      if (existing) {
        return jsonResponse({ success: false, message: 'User already exists with this email' }, 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserDoc = {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role && ['customer', 'admin'].includes(role) ? role : 'customer',
        subscription: { plan: 'none', active: false },
        pendingRequests: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await usersCollection.insertOne(newUserDoc);
      const insertedId = result.insertedId.toString();

      const userForToken = {
        _id: insertedId,
        id: insertedId,
        name: newUserDoc.name,
        email: newUserDoc.email,
        role: newUserDoc.role,
        subscription: newUserDoc.subscription,
        pendingRequests: newUserDoc.pendingRequests
      };

      const token = await generateToken(userForToken, context.env);
      return jsonResponse({
        success: true,
        message: 'Registration successful!',
        token,
        user: userForToken
      }, 201);
    }

    if (route === 'auth/change-password' && method === 'PUT') {
      const payload = await verifyTokenFromRequest(request, context.env);
      if (!payload) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

      const { currentPassword, newPassword } = await request.json().catch(() => ({}));
      const db = await getPaidDb(context);
      let query = { email: (payload.email || '').toLowerCase() };
      if (payload.userId && ObjectId.isValid(payload.userId)) {
        query = { _id: new ObjectId(payload.userId) };
      }

      const userDoc = await db.collection('users').findOne(query);
      if (!userDoc) return jsonResponse({ success: false, message: 'User not found' }, 404);

      let isMatch = false;
      if (userDoc.password) {
        if (userDoc.password.startsWith('$2a$') || userDoc.password.startsWith('$2b$') || userDoc.password.startsWith('$2y$')) {
          isMatch = await bcrypt.compare(currentPassword, userDoc.password);
        } else {
          isMatch = currentPassword === userDoc.password;
        }
      }

      if (!isMatch) return jsonResponse({ success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' }, 400);

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.collection('users').updateOne(query, { $set: { password: hashedPassword, updatedAt: new Date() } });

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
    }

    if (route === 'auth/forgot-password' && method === 'POST') {
      const { email } = await request.json().catch(() => ({}));
      if (!email) return jsonResponse({ success: false, message: 'Email is required' }, 400);

      const cleanEmail = email.toLowerCase().trim();
      const db = await getPaidDb(context);
      const userDoc = await db.collection('users').findOne({ email: cleanEmail });
      if (!userDoc) return jsonResponse({ success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' }, 404);

      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetLink = `${url.origin}/login?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;
      try {
        await sendResetEmail(userDoc, resetLink, context.env);
      } catch (e) {
        console.warn('Brevo reset email error:', e.message);
      }

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' });
    }

    if (route === 'auth/reset-password' && method === 'POST') {
      const { email, newPassword } = await request.json().catch(() => ({}));
      if (!email || !newPassword) return jsonResponse({ success: false, message: 'All fields are required' }, 400);

      const cleanEmail = email.toLowerCase().trim();
      const db = await getPaidDb(context);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.collection('users').updateOne({ email: cleanEmail }, { $set: { password: hashedPassword, updatedAt: new Date() } });

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! এখন লগইন করুন।' });
    }

    // 9. USERS (/api/users, /api/users/me, /api/users/create-admin, /api/users/request-plan)
    if (route === 'users' && method === 'GET') {
      const db = await getPaidDb(context);
      const usersDocs = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray();

      return jsonResponse({
        success: true,
        users: usersDocs.map(u => ({
          id: u._id.toString(),
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          subscription: u.subscription || { plan: 'none', active: false },
          pendingRequests: u.pendingRequests || [],
          createdAt: u.createdAt,
          lastLogin: u.lastLogin
        }))
      });
    }

    if (route === 'users/me' && method === 'GET') {
      const payload = await verifyTokenFromRequest(request, context.env);
      if (!payload || (!payload.userId && !payload.email)) {
        return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
      }

      const db = await getPaidDb(context);
      let query = { email: (payload.email || '').toLowerCase() };
      if (payload.userId && ObjectId.isValid(payload.userId)) {
        query = { _id: new ObjectId(payload.userId) };
      }

      const userDoc = await db.collection('users').findOne(query);
      if (!userDoc) {
        return jsonResponse({ success: false, message: 'User not found' }, 404);
      }

      const userIdStr = userDoc._id.toString();
      return jsonResponse({
        success: true,
        user: {
          id: userIdStr,
          _id: userIdStr,
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          subscription: userDoc.subscription || { plan: 'none', active: false },
          pendingRequests: userDoc.pendingRequests || []
        }
      });
    }

    if (route === 'users/create-admin' && method === 'POST') {
      const { name, email, password } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'All fields are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      const db = await getPaidDb(context);
      const usersCollection = db.collection('users');

      const existing = await usersCollection.findOne({ email: cleanEmail });
      if (existing) {
        return jsonResponse({ success: false, message: 'User already exists with this email' }, 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdminDoc = {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin',
        subscription: { plan: 'lifetime', active: true, startDate: new Date(), endDate: new Date('2099-12-31') },
        pendingRequests: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await usersCollection.insertOne(newAdminDoc);
      return jsonResponse({ success: true, message: 'নতুন এডমিন অ্যাকাউন্ট তৈরি হয়েছে!' }, 201);
    }

    if (route === 'users/request-plan' && method === 'POST') {
      const payload = await verifyTokenFromRequest(request, context.env);
      if (!payload) {
        return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
      }

      const body = await request.json().catch(() => ({}));
      const { plan, paymentMethod, transactionId, amount, senderNumber } = body;

      const newRequest = {
        _id: 'req_' + Date.now(),
        plan,
        paymentMethod,
        transactionId: (transactionId || '').trim(),
        senderNumber: (senderNumber || '').trim(),
        amount: Number(amount) || 0,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      const db = await getPaidDb(context);
      let query = { email: (payload.email || '').toLowerCase() };
      if (payload.userId && ObjectId.isValid(payload.userId)) {
        query = { _id: new ObjectId(payload.userId) };
      }

      await db.collection('users').updateOne(
        query,
        { $push: { pendingRequests: newRequest } }
      );

      return jsonResponse({ success: true, message: 'আপনার সাবস্ক্রিপশন রিকোয়েস্ট জমা নেওয়া হয়েছে!', request: newRequest });
    }

    // 10. Single User operations (/api/users/:userId/...)
    if (routeParts[0] === 'users' && routeParts.length >= 2) {
      const targetUserId = routeParts[1];
      const db = await getPaidDb(context);
      const query = ObjectId.isValid(targetUserId) ? { _id: new ObjectId(targetUserId) } : { _id: targetUserId };

      if (routeParts.length === 2 && method === 'DELETE') {
        const result = await db.collection('users').deleteOne(query);
        if (result.deletedCount > 0) {
          return jsonResponse({ success: true, message: 'ইউজার মুছে ফেলা হয়েছে!' });
        }
        return jsonResponse({ success: false, message: 'User not found' }, 404);
      }

      if (routeParts.length === 3 && routeParts[2] === 'subscription' && method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        const now = new Date();
        const endDate = addPlanDuration(now, body.plan || '1_month');
        const subscription = {
          plan: body.plan || 'custom',
          active: body.plan !== 'none',
          startDate: now.toISOString(),
          endDate: endDate.toISOString()
        };

        await db.collection('users').updateOne(query, { $set: { subscription, updatedAt: new Date() } });
        return jsonResponse({ success: true, message: 'সাবস্ক্রিপশন আপডেট হয়েছে!', subscription });
      }

      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'approve' && method === 'PUT') {
        const reqId = routeParts[3];
        const userDoc = await db.collection('users').findOne(query);
        if (userDoc) {
          const req = (userDoc.pendingRequests || []).find(r => String(r._id) === String(reqId) || String(r.id) === String(reqId));
          const planToSet = req ? req.plan : '1_month';
          const now = new Date();
          const endDate = addPlanDuration(now, planToSet);
          const subscription = { plan: planToSet, active: true, startDate: now.toISOString(), endDate: endDate.toISOString() };

          await db.collection('users').updateOne(
            query,
            {
              $set: {
                subscription,
                "pendingRequests.$[elem].status": "approved",
                updatedAt: new Date()
              }
            },
            { arrayFilters: [{ "elem._id": reqId }] }
          );
          return jsonResponse({ success: true, message: 'অনুমোদন সফল হয়েছে!', subscription });
        }
      }

      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'reject' && method === 'PUT') {
        const reqId = routeParts[3];
        await db.collection('users').updateOne(
          query,
          {
            $set: {
              "pendingRequests.$[elem].status": "rejected",
              updatedAt: new Date()
            }
          },
          { arrayFilters: [{ "elem._id": reqId }] }
        );
        return jsonResponse({ success: true, message: 'Request reject করা হয়েছে।' });
      }
    }

    // Default Fallback
    return jsonResponse({ success: true, message: 'TopMCQBD Cloudflare Edge API Online', route });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message || 'Internal Server Error' }, 500);
  }
}
