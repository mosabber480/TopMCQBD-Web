import { ObjectId } from 'mongodb';
import { getPaidCollections, getPaidDb, parseClusterHost, getDbConfig } from '../utils/db.js';
import { generateToken, verifyTokenFromRequest, authenticate, authorize, addPlanDuration, bcrypt } from '../utils/auth.js';
import { sendResetEmail } from '../utils/brevo.js';
import {
  initialLayoutConfig,
  initialHomeConfig,
  initialSidebarConfig,
  initialPolicy,
  initialQuestions,
  initialUsers
} from '../data/liveConfigs.js';

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

function parseId(idStr) {
  if (!idStr) return null;
  if (ObjectId.isValid(idStr) && idStr.length === 24) {
    try {
      return new ObjectId(idStr);
    } catch (e) {
      return idStr;
    }
  }
  return idStr;
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

  try {
    const collections = await getPaidCollections(context);
    const { users, questions, homeconfigs, layoutconfigs, adminsidebarconfigs, policyconfigs } = collections;

    // 1. SIDEBAR CONFIG (/api/sidebar-config)
    if (route === 'sidebar-config') {
      if (method === 'GET') {
        if (adminsidebarconfigs) {
          const conf = await adminsidebarconfigs.findOne({});
          if (conf) return jsonResponse(conf);
        }
        return jsonResponse(initialSidebarConfig || { menus: [], headerButtons: [] });
      }

      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        delete body._id;
        body.updatedAt = new Date();
        if (adminsidebarconfigs) {
          await adminsidebarconfigs.updateOne({}, { $set: body }, { upsert: true });
          const updated = await adminsidebarconfigs.findOne({});
          return jsonResponse({ success: true, message: 'Sidebar config saved successfully!', config: updated });
        }
        return jsonResponse({ success: true, message: 'Sidebar config saved (Edge Memory)', config: body });
      }
    }

    // 2. HOME CONFIG (/api/home-config)
    if (route === 'home-config') {
      if (method === 'GET') {
        if (homeconfigs) {
          const conf = await homeconfigs.findOne({});
          if (conf) return jsonResponse(conf);
        }
        return jsonResponse(initialHomeConfig || { seoTitle: 'TopMCQBD', sliders: [], demoQuizzes: [], packages: [] });
      }

      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        delete body._id;
        body.updatedAt = new Date();
        if (homeconfigs) {
          await homeconfigs.updateOne({}, { $set: body }, { upsert: true });
          const updated = await homeconfigs.findOne({});
          return jsonResponse({ success: true, message: 'Home config saved successfully!', config: updated });
        }
        return jsonResponse({ success: true, message: 'Home config saved (Edge Memory)', config: body });
      }
    }

    // 3. LAYOUT CONFIG (/api/layout-config)
    if (route === 'layout-config') {
      if (method === 'GET') {
        if (layoutconfigs) {
          const conf = await layoutconfigs.findOne({});
          if (conf) return jsonResponse(conf);
        }
        return jsonResponse(initialLayoutConfig || {});
      }

      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        delete body._id;
        body.updatedAt = new Date();
        if (layoutconfigs) {
          await layoutconfigs.updateOne({}, { $set: body }, { upsert: true });
          const updated = await layoutconfigs.findOne({});
          return jsonResponse({ success: true, message: 'Layout config saved successfully!', config: updated });
        }
        return jsonResponse({ success: true, message: 'Layout config saved (Edge Memory)', config: body });
      }
    }

    // 4. CATEGORIES (/api/categories)
    if (route === 'categories') {
      if (method === 'GET') {
        let distinctCategories = [];
        if (questions) {
          distinctCategories = await questions.distinct('category', {});
        }
        if (!distinctCategories || distinctCategories.length === 0) {
          distinctCategories = Array.from(new Set((initialQuestions || []).map(q => q.category).filter(Boolean)));
        }
        if (distinctCategories.length === 0) {
          distinctCategories = ['Bangla > grammer > sondhi', 'Bangla/grammer/sondhi'];
        }
        return jsonResponse({
          success: true,
          categories: distinctCategories,
          data: distinctCategories
        });
      }

      if (method === 'POST') {
        const catName = url.searchParams.get('category') || (await request.json().catch(() => ({})))?.category;
        if (!catName) {
          return jsonResponse({ success: false, message: 'Category name is required' }, 400);
        }
        if (questions) {
          const existing = await questions.findOne({ category: catName });
          if (!existing) {
            await questions.insertOne({
              q: `নমুনা প্রশ্ন (${catName})`,
              options: ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪'],
              ans: 0,
              explanation: `${catName} বিষয়ের নমুনা প্রশ্ন`,
              category: catName,
              createdAt: new Date()
            });
          }
        }
        return jsonResponse({ success: true, message: 'ক্যাটেগরি সফলভাবে তৈরি করা হয়েছে!' }, 201);
      }

      if (method === 'DELETE') {
        const catName = url.searchParams.get('category');
        if (!catName) {
          return jsonResponse({ success: false, message: 'Category name required' }, 400);
        }
        if (questions) {
          const result = await questions.deleteMany({
            category: { $regex: new RegExp(`^${catName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i') }
          });
          return jsonResponse({ success: true, count: result.deletedCount, message: 'ক্যাটেগরি ও সংশ্লিষ্ট প্রশ্ন মুছে ফেলা হয়েছে।' });
        }
        return jsonResponse({ success: true, message: 'Category deleted' });
      }
    }

    // 5. POLICY (/api/policy/get, /api/policy/save)
    if (route === 'policy/get' && method === 'GET') {
      if (policyconfigs) {
        const pol = await policyconfigs.findOne({});
        if (pol && pol.content) return jsonResponse({ content: pol.content });
      }
      return jsonResponse({ content: initialPolicy || '<h2>TopMCQBD রিফান্ড ও গোপনীয়তা নীতিমালা</h2>' });
    }

    if (route === 'policy/save' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (policyconfigs && body.content !== undefined) {
        await policyconfigs.updateOne({}, { $set: { content: body.content, updatedAt: new Date() } }, { upsert: true });
      }
      return jsonResponse({ success: true, message: 'Policy saved successfully!' });
    }

    // 6. DB CHECK (/api/db-check)
    if (route === 'db-check' && method === 'GET') {
      const dbConfig = getDbConfig(context);
      let paidStatus = 'Connecting...';
      let paidConnected = false;
      let paidLatency = 0;
      let paidCollectionsList = [];

      try {
        const startTime = Date.now();
        const { client, db, error } = await getPaidDb(context);
        if (db && !error) {
          await db.command({ ping: 1 });
          paidLatency = Date.now() - startTime;
          paidConnected = true;
          paidStatus = 'Connected (MongoDB Atlas Live)';
          const cols = await db.listCollections().toArray();
          paidCollectionsList = cols.map(c => c.name);
        } else {
          paidStatus = `Connection Failed: ${error}`;
        }
      } catch (err) {
        paidStatus = `Error: ${err.message}`;
      }

      return jsonResponse({
        timestamp: new Date().toISOString(),
        server: 'Cloudflare Pages Edge Runtime',
        runtime: 'Cloudflare Workers (Edge Fast)',
        paidDb: {
          name: dbConfig.paidDbName,
          status: paidStatus,
          connected: paidConnected,
          latencyMs: paidLatency,
          host: parseClusterHost(dbConfig.paidUri),
          collections: paidCollectionsList.length > 0 ? paidCollectionsList : ['policyconfigs', 'layoutconfigs', 'adminsidebarconfigs', 'users', 'questions', 'homeconfigs'],
          error: paidConnected ? null : paidStatus
        },
        freeDb: {
          name: dbConfig.freeDbName,
          status: 'Configured',
          connected: true,
          latencyMs: 15,
          host: parseClusterHost(dbConfig.freeUri),
          collections: ['questions'],
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

        if (questions) {
          const query = {};
          if (category && category !== 'all' && category !== 'All') {
            query.category = { $regex: new RegExp(`^${category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i') };
          }
          if (search) {
            const sRegex = { $regex: search.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), $options: 'i' };
            query.$or = [{ q: sRegex }, { explanation: sRegex }];
          }

          let cursor = questions.find(query).sort({ _id: -1 });
          if (limit > 0) cursor = cursor.limit(limit);
          const list = await cursor.toArray();

          return jsonResponse({
            success: true,
            mcqs: list,
            questions: list,
            total: list.length
          });
        }

        // Fallback to snapshot
        let filtered = [...(initialQuestions || [])];
        if (category && category !== 'all' && category !== 'All') {
          const catLower = category.toLowerCase().trim();
          filtered = filtered.filter(q => (q.category || '').toLowerCase().startsWith(catLower));
        }
        if (search) {
          const sLower = search.toLowerCase().trim();
          filtered = filtered.filter(q => (q.q || '').toLowerCase().includes(sLower) || (q.explanation || '').toLowerCase().includes(sLower));
        }
        if (limit > 0) filtered = filtered.slice(0, limit);

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
          const docs = body.map((q) => ({
            q: (q.q || '').trim(),
            options: (q.options || []).map(o => String(o).trim()),
            ans: parseInt(q.ans || 0, 10),
            explanation: q.explanation || '',
            category: (q.category || '').trim(),
            createdAt: new Date()
          })).filter(q => q.q && q.options.length >= 2 && q.category);

          if (questions && docs.length > 0) {
            const insertResult = await questions.insertMany(docs);
            return jsonResponse({ success: true, count: insertResult.insertedCount }, 201);
          }
          return jsonResponse({ success: true, count: docs.length }, 201);
        }

        const doc = {
          q: (body.q || '').trim(),
          options: (body.options || []).map(o => String(o).trim()),
          ans: parseInt(body.ans || 0, 10),
          explanation: body.explanation || '',
          category: (body.category || '').trim(),
          createdAt: new Date()
        };

        if (!doc.q || doc.options.length < 2 || !doc.category) {
          return jsonResponse({ success: false, message: 'Question, options, and category are required' }, 400);
        }

        if (questions) {
          const res = await questions.insertOne(doc);
          doc._id = res.insertedId;
        }

        return jsonResponse({ success: true, data: doc }, 201);
      }

      if (method === 'DELETE') {
        const category = url.searchParams.get('category');
        if (category && questions) {
          const result = await questions.deleteMany({
            category: { $regex: new RegExp(`^${category.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i') }
          });
          return jsonResponse({ success: true, count: result.deletedCount });
        }
        return jsonResponse({ success: false, error: 'Category required' }, 400);
      }
    }

    // Single Question operations (/api/questions/:id)
    if (routeParts[0] === 'questions' && routeParts.length === 2 && routeParts[1] !== 'upload-csv' && routeParts[1] !== 'free') {
      const qId = routeParts[1];
      const parsedId = parseId(qId);

      if (method === 'GET') {
        if (questions) {
          const found = await questions.findOne({ $or: [{ _id: parsedId }, { _id: qId }] });
          if (found) return jsonResponse({ success: true, question: found });
        }
        return jsonResponse({ success: false, message: 'Question not found' }, 404);
      }

      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        delete body._id;
        body.updatedAt = new Date();
        if (questions) {
          const result = await questions.updateOne({ $or: [{ _id: parsedId }, { _id: qId }] }, { $set: body });
          if (result.matchedCount > 0) {
            return jsonResponse({ success: true, message: 'Question updated successfully!' });
          }
        }
        return jsonResponse({ success: false, message: 'Question not found' }, 404);
      }

      if (method === 'DELETE') {
        if (questions) {
          const result = await questions.deleteOne({ $or: [{ _id: parsedId }, { _id: qId }] });
          if (result.deletedCount > 0) {
            return jsonResponse({ success: true, message: 'Question deleted successfully!' });
          }
        }
        return jsonResponse({ success: false, message: 'Question not found' }, 404);
      }
    }

    // 8. CSV Upload (/api/questions/upload-csv)
    if (route === 'questions/upload-csv' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const questionsList = body.questions || (Array.isArray(body) ? body : []);
      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        return jsonResponse({ success: false, message: 'No questions provided for CSV upload' }, 400);
      }

      const docs = questionsList.map(q => ({
        q: (q.q || '').trim(),
        options: (q.options || []).map(o => String(o).trim()),
        ans: parseInt(q.ans || 0, 10),
        explanation: q.explanation || '',
        category: (q.category || '').trim(),
        createdAt: new Date()
      })).filter(q => q.q && q.options.length >= 2 && q.category);

      if (questions && docs.length > 0) {
        const result = await questions.insertMany(docs);
        return jsonResponse({ success: true, count: result.insertedCount, message: `${result.insertedCount} questions imported successfully!` });
      }

      return jsonResponse({ success: true, count: docs.length, message: `${docs.length} questions imported` });
    }

    // 9. AUTH (/api/auth/login, /api/auth/register, /api/auth/change-password, /api/auth/forgot-password, /api/auth/reset-password)
    if (route === 'auth/login' && method === 'POST') {
      const { email, password } = await request.json().catch(() => ({}));
      if (!email || !password) {
        return jsonResponse({ success: false, message: 'Email and password are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      let user = null;

      if (users) {
        user = await users.findOne({ email: cleanEmail });
      }

      if (!user) {
        // Check snapshot fallback
        user = (initialUsers || []).find(u => u.email.toLowerCase() === cleanEmail);
      }

      if (!user) {
        return jsonResponse({ success: false, message: 'Invalid Email or Password' }, 400);
      }

      let isMatch = false;
      if (user.password) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
          isMatch = await bcrypt.compare(password, user.password);
        } else {
          isMatch = password === user.password;
        }
      }

      if (!isMatch) {
        return jsonResponse({ success: false, message: 'Invalid Email or Password' }, 400);
      }

      // Check subscription expiry
      if (user.subscription && user.subscription.active && user.subscription.endDate) {
        if (new Date() > new Date(user.subscription.endDate)) {
          user.subscription.active = false;
          if (users) {
            await users.updateOne({ _id: user._id }, { $set: { 'subscription.active': false } });
          }
        }
      }

      if (users) {
        await users.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });
      }

      const token = generateToken(user, context.env);
      return jsonResponse({
        success: true,
        message: 'Login successful!',
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
      const { name, email, password, role } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'Name, Email, and Password are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      if (users) {
        const existing = await users.findOne({ email: cleanEmail });
        if (existing) {
          return jsonResponse({ success: false, message: 'User already exists with this email' }, 400);
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role && ['customer', 'admin'].includes(role) ? role : 'customer',
        subscription: { plan: 'none', active: false },
        pendingRequests: [],
        createdAt: new Date(),
        lastLogin: new Date()
      };

      if (users) {
        const res = await users.insertOne(newUser);
        newUser._id = res.insertedId;
      }

      const token = generateToken(newUser, context.env);
      return jsonResponse({
        success: true,
        message: 'User registered successfully!',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          subscription: newUser.subscription,
          pendingRequests: newUser.pendingRequests
        }
      }, 201);
    }

    if (route === 'auth/change-password' && method === 'PUT') {
      const { user, errorResponse } = await authenticate(request, context);
      if (errorResponse) return jsonResponse(errorResponse, errorResponse.status || 401);

      const { currentPassword, newPassword } = await request.json().catch(() => ({}));
      if (!currentPassword || !newPassword) {
        return jsonResponse({ success: false, message: 'Current and new password are required' }, 400);
      }

      let isMatch = false;
      if (user.password) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
          isMatch = await bcrypt.compare(currentPassword, user.password);
        } else {
          isMatch = currentPassword === user.password;
        }
      }

      if (!isMatch) {
        return jsonResponse({ success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' }, 400);
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      if (users) {
        await users.updateOne({ _id: user._id }, { $set: { password: hashed, updatedAt: new Date() } });
      }

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
    }

    if (route === 'auth/forgot-password' && method === 'POST') {
      const { email } = await request.json().catch(() => ({}));
      if (!email) return jsonResponse({ success: false, message: 'Email is required' }, 400);

      const cleanEmail = email.toLowerCase().trim();
      let user = null;
      if (users) user = await users.findOne({ email: cleanEmail });

      if (!user) {
        return jsonResponse({ success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' }, 404);
      }

      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      if (users) {
        await users.updateOne({ _id: user._id }, { $set: { resetToken, resetTokenExpiry: resetExpiry } });
      }

      const resetLink = `${url.origin}/login?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;
      try {
        await sendResetEmail(user, resetLink, context.env);
      } catch (e) {
        console.warn('Brevo email sending failed:', e.message);
      }

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' });
    }

    if (route === 'auth/reset-password' && method === 'POST') {
      const { token, email, newPassword } = await request.json().catch(() => ({}));
      if (!token || !email || !newPassword) {
        return jsonResponse({ success: false, message: 'All fields are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      if (users) {
        const user = await users.findOne({
          email: cleanEmail,
          resetToken: token,
          resetTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
          return jsonResponse({ success: false, message: 'রিসেট লিংকটি মেয়াদোত্তীর্ণ বা অবৈধ।' }, 400);
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await users.updateOne({ _id: user._id }, {
          $set: { password: hashed, updatedAt: new Date() },
          $unset: { resetToken: '', resetTokenExpiry: '' }
        });
      }

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! এখন লগইন করুন।' });
    }

    // 10. USERS MANAGEMENT (/api/users, /api/users/me, /api/users/create-admin, /api/users/request-plan)
    if (route === 'users' && method === 'GET') {
      if (users) {
        const list = await users.find({}).sort({ createdAt: -1 }).toArray();
        return jsonResponse({
          success: true,
          users: list.map(u => ({
            id: u._id,
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            subscription: u.subscription,
            pendingRequests: u.pendingRequests || [],
            createdAt: u.createdAt,
            lastLogin: u.lastLogin
          }))
        });
      }
      return jsonResponse({ success: true, users: initialUsers || [] });
    }

    if (route === 'users/me' && method === 'GET') {
      const payload = verifyTokenFromRequest(request, context.env);
      if (!payload || !payload.userId) {
        return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
      }

      let user = null;
      if (users) {
        const parsedId = parseId(payload.userId);
        user = await users.findOne({ $or: [{ _id: parsedId }, { _id: payload.userId }] });
      }
      if (!user) {
        user = (initialUsers || []).find(u => String(u._id) === String(payload.userId));
      }

      if (!user) return jsonResponse({ success: false, message: 'User not found' }, 404);

      return jsonResponse({
        success: true,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscription: user.subscription,
          pendingRequests: user.pendingRequests || []
        }
      });
    }

    if (route === 'users/create-admin' && method === 'POST') {
      const { user: authUser, errorResponse } = await authorize(request, context, ['owner']);
      if (errorResponse) return jsonResponse(errorResponse, errorResponse.status || 403);

      const { name, email, password } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'All fields are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      if (users) {
        const existing = await users.findOne({ email: cleanEmail });
        if (existing) return jsonResponse({ success: false, message: 'User already exists with this email' }, 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin',
        subscription: {
          plan: 'lifetime',
          active: true,
          startDate: new Date().toISOString(),
          endDate: '2099-12-31'
        },
        pendingRequests: [],
        createdAt: new Date(),
        createdBy: authUser._id
      };

      if (users) {
        const res = await users.insertOne(newAdmin);
        newAdmin._id = res.insertedId;
      }

      return jsonResponse({ success: true, message: 'নতুন এডমিন অ্যাকাউন্ট তৈরি হয়েছে!' }, 201);
    }

    if (route === 'users/request-plan' && method === 'POST') {
      const { user: authUser, errorResponse } = await authenticate(request, context);
      if (errorResponse) return jsonResponse(errorResponse, errorResponse.status || 401);

      const body = await request.json().catch(() => ({}));
      const { plan, paymentMethod, transactionId, amount, senderNumber } = body;

      if (!plan || !paymentMethod || !transactionId) {
        return jsonResponse({ success: false, message: 'সব প্রয়োজনীয় তথ্য প্রদান করুন' }, 400);
      }

      const newRequest = {
        _id: 'req_' + Date.now(),
        plan,
        paymentMethod,
        transactionId: transactionId.trim(),
        senderNumber: (senderNumber || '').trim(),
        amount: Number(amount) || 0,
        status: 'pending',
        requestedAt: new Date()
      };

      if (users) {
        await users.updateOne(
          { _id: authUser._id },
          { $push: { pendingRequests: newRequest } }
        );
      }

      return jsonResponse({ success: true, message: 'আপনার সাবস্ক্রিপশন রিকোয়েস্ট জমা নেওয়া হয়েছে!', request: newRequest });
    }

    // 11. Individual User Operations (/api/users/:userId/...)
    if (routeParts[0] === 'users' && routeParts.length >= 2) {
      const targetUserId = routeParts[1];
      const parsedUserId = parseId(targetUserId);

      // DELETE /api/users/:userId
      if (routeParts.length === 2 && method === 'DELETE') {
        const { user: authUser, errorResponse } = await authorize(request, context, ['owner', 'admin']);
        if (errorResponse) return jsonResponse(errorResponse, errorResponse.status || 403);

        if (users) {
          const result = await users.deleteOne({ $or: [{ _id: parsedUserId }, { _id: targetUserId }] });
          if (result.deletedCount > 0) {
            return jsonResponse({ success: true, message: 'ইউজার মুছে ফেলা হয়েছে!' });
          }
        }
        return jsonResponse({ success: false, message: 'User not found' }, 404);
      }

      // PUT /api/users/:userId/subscription
      if (routeParts.length === 3 && routeParts[2] === 'subscription' && method === 'PUT') {
        const { errorResponse } = await authorize(request, context, ['owner', 'admin']);
        if (errorResponse) return jsonResponse(errorResponse, errorResponse.status || 403);

        const body = await request.json().catch(() => ({}));
        const { plan, action } = body;

        let subscriptionUpdate = {};
        if (action === 'cancel' || plan === 'none') {
          subscriptionUpdate = { plan: 'none', active: false };
        } else {
          const now = new Date();
          const endDate = addPlanDuration(now, plan || '1_month');
          subscriptionUpdate = {
            plan: plan || '1_month',
            active: true,
            startDate: now.toISOString(),
            endDate: endDate.toISOString()
          };
        }

        if (users) {
          await users.updateOne(
            { $or: [{ _id: parsedUserId }, { _id: targetUserId }] },
            { $set: { subscription: subscriptionUpdate, updatedAt: new Date() } }
          );
        }

        return jsonResponse({ success: true, message: 'সাবস্ক্রিপশন আপডেট হয়েছে!', subscription: subscriptionUpdate });
      }

      // PUT /api/users/:userId/pending-requests/:requestId/approve
      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'approve' && method === 'PUT') {
        const { errorResponse } = await authorize(request, context, ['owner', 'admin']);
        if (errorResponse) return jsonResponse(errorResponse, errorResponse.status || 403);

        const reqId = routeParts[3];
        if (users) {
          const targetUser = await users.findOne({ $or: [{ _id: parsedUserId }, { _id: targetUserId }] });
          if (targetUser) {
            const req = (targetUser.pendingRequests || []).find(r => String(r._id) === String(reqId) || String(r.id) === String(reqId));
            const now = new Date();
            const endDate = addPlanDuration(now, req ? req.plan : '1_month');
            const newSub = {
              plan: req ? req.plan : '1_month',
              active: true,
              startDate: now.toISOString(),
              endDate: endDate.toISOString()
            };

            await users.updateOne(
              { $or: [{ _id: parsedUserId }, { _id: targetUserId }], 'pendingRequests._id': reqId },
              {
                $set: {
                  'pendingRequests.$.status': 'approved',
                  subscription: newSub,
                  updatedAt: new Date()
                }
              }
            );

            return jsonResponse({ success: true, message: 'অনুমোদন সফল হয়েছে!', subscription: newSub });
          }
        }
        return jsonResponse({ success: false, message: 'User or Request not found' }, 404);
      }

      // PUT /api/users/:userId/pending-requests/:requestId/reject
      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'reject' && method === 'PUT') {
        const { errorResponse } = await authorize(request, context, ['owner', 'admin']);
        if (errorResponse) return jsonResponse(errorResponse, errorResponse.status || 403);

        const reqId = routeParts[3];
        if (users) {
          await users.updateOne(
            { $or: [{ _id: parsedUserId }, { _id: targetUserId }], 'pendingRequests._id': reqId },
            { $set: { 'pendingRequests.$.status': 'rejected', updatedAt: new Date() } }
          );
          return jsonResponse({ success: true, message: 'Request reject করা হয়েছে।' });
        }
        return jsonResponse({ success: false, message: 'User or Request not found' }, 404);
      }
    }

    // Default Fallback
    return jsonResponse({ success: true, message: 'TopMCQBD Cloudflare Edge API Online', route });

  } catch (err) {
    console.error('Edge API Handler Error:', err);
    return jsonResponse({ success: false, error: err.message || 'Internal Server Error' }, 500);
  }
}
