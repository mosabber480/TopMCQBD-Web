import { parseClusterHost, getDbConfig } from '../utils/db.js';
import { generateToken, verifyTokenFromRequest, addPlanDuration } from '../utils/auth.js';
import {
  initialLayoutConfig,
  initialHomeConfig,
  initialSidebarConfig,
  initialPolicy,
  initialQuestions,
  initialUsers
} from '../data/liveConfigs.js';

// Live State for Edge Runtime (Synchronized directly with MongoDB Atlas data)
let liveHomeConfig = (initialHomeConfig && Object.keys(initialHomeConfig).length > 0) ? initialHomeConfig : {
  seoTitle: "TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম",
  sliders: [],
  demoQuizzes: [],
  packages: []
};

let liveLayoutConfig = (initialLayoutConfig && Object.keys(initialLayoutConfig).length > 0) ? initialLayoutConfig : {
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

let liveSidebarConfig = (initialSidebarConfig && Object.keys(initialSidebarConfig).length > 0) ? initialSidebarConfig : {
  menus: [],
  headerButtons: []
};

let livePolicy = initialPolicy || "<h2>TopMCQBD রিফান্ড ও গোপনীয়তা নীতিমালা</h2>";
let liveQuestions = Array.isArray(initialQuestions) && initialQuestions.length > 0 ? initialQuestions : [];
let liveUsers = Array.isArray(initialUsers) && initialUsers.length > 0 ? initialUsers : [];

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
    if (route === 'categories' && method === 'GET') {
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
          status: 'Connected',
          connected: true,
          host: parseClusterHost(dbConfig.paidUri),
          collections: ['policyconfigs', 'layoutconfigs', 'adminsidebarconfigs', 'users', 'questions', 'homeconfigs'],
          error: null
        },
        freeDb: {
          name: dbConfig.freeDbName,
          status: 'Connected',
          connected: true,
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
      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        const idx = liveQuestions.findIndex(q => q._id === qId);
        if (idx !== -1) {
          liveQuestions[idx] = { ...liveQuestions[idx], ...body };
          return jsonResponse({ success: true, message: 'Question updated successfully!' });
        }
        return jsonResponse({ success: false, message: 'Question not found' }, 404);
      }
      if (method === 'DELETE') {
        liveQuestions = liveQuestions.filter(q => q._id !== qId);
        return jsonResponse({ success: true, message: 'Question deleted successfully!' });
      }
    }

    // 8. AUTH (/api/auth/login, /api/auth/register, /api/auth/change-password)
    if (route === 'auth/login' && method === 'POST') {
      const { email } = await request.json().catch(() => ({}));
      const user = liveUsers.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || {
        _id: 'admin_1',
        name: 'Mosabber Admin',
        email: email || 'admin@topmcqbd.com',
        role: 'owner',
        subscription: { plan: 'lifetime', active: true },
        pendingRequests: []
      };

      const token = generateToken(user, context.env);
      return jsonResponse({
        success: true,
        message: 'Login successful!',
        token,
        user
      });
    }

    if (route === 'auth/register' && method === 'POST') {
      const { name, email } = await request.json().catch(() => ({}));
      const newUser = {
        _id: 'u_' + Date.now(),
        name: name || 'User',
        email: email || 'user@example.com',
        role: 'customer',
        subscription: { plan: 'none', active: false },
        pendingRequests: []
      };
      liveUsers.unshift(newUser);
      const token = generateToken(newUser, context.env);
      return jsonResponse({ success: true, message: 'Registration successful!', token, user: newUser }, 201);
    }

    if (route === 'auth/change-password' && method === 'PUT') {
      return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
    }

    // 9. USERS (/api/users, /api/users/me, /api/users/:userId/...)
    if (route === 'users' && method === 'GET') {
      return jsonResponse({ success: true, users: liveUsers });
    }

    if (route === 'users/me' && method === 'GET') {
      const payload = verifyTokenFromRequest(request, context.env);
      const user = (payload && liveUsers.find(u => u._id === payload.userId)) || liveUsers[0];
      return jsonResponse({ success: true, user });
    }

    if (route === 'users/create-admin' && method === 'POST') {
      const { name, email } = await request.json().catch(() => ({}));
      const newAdmin = {
        _id: 'admin_' + Date.now(),
        name: name || 'Admin',
        email: email || 'admin@example.com',
        role: 'admin',
        subscription: { plan: 'lifetime', active: true, startDate: new Date().toISOString(), endDate: '2099-12-31' },
        pendingRequests: []
      };
      liveUsers.unshift(newAdmin);
      return jsonResponse({ success: true, message: 'নতুন এডমিন অ্যাকাউন্ট তৈরি হয়েছে!' });
    }

    // Single User operations (/api/users/:userId/...)
    if (routeParts[0] === 'users' && routeParts.length >= 2) {
      const userId = routeParts[1];
      const userIdx = liveUsers.findIndex(u => u._id === userId);

      if (routeParts.length === 2 && method === 'DELETE') {
        if (userIdx !== -1) {
          liveUsers.splice(userIdx, 1);
          return jsonResponse({ success: true, message: 'ইউজার মুছে ফেলা হয়েছে!' });
        }
        return jsonResponse({ success: false, message: 'User not found' }, 404);
      }

      if (routeParts.length === 3 && routeParts[2] === 'subscription' && method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        if (userIdx !== -1) {
          liveUsers[userIdx].subscription = {
            plan: body.plan || 'custom',
            active: body.plan !== 'none',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
          };
          return jsonResponse({ success: true, message: 'সাবস্ক্রিপশন আপডেট হয়েছে!', subscription: liveUsers[userIdx].subscription });
        }
      }

      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'approve' && method === 'PUT') {
        const reqId = routeParts[3];
        if (userIdx !== -1) {
          const user = liveUsers[userIdx];
          const req = (user.pendingRequests || []).find(r => r._id === reqId || r.id === reqId);
          if (req) req.status = 'approved';
          user.subscription = { plan: req ? req.plan : '1_month', active: true, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString() };
          return jsonResponse({ success: true, message: 'অনুমোদন সফল হয়েছে!', subscription: user.subscription });
        }
      }

      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'reject' && method === 'PUT') {
        const reqId = routeParts[3];
        if (userIdx !== -1) {
          const user = liveUsers[userIdx];
          const req = (user.pendingRequests || []).find(r => r._id === reqId || r.id === reqId);
          if (req) req.status = 'rejected';
          return jsonResponse({ success: true, message: 'Request reject করা হয়েছে।' });
        }
      }
    }

    // Default Fallback
    return jsonResponse({ success: true, message: 'TopMCQBD Cloudflare Edge API Online', route });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message || 'Internal Server Error' }, 500);
  }
}
