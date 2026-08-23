import { parseClusterHost, getDbConfig, getPaidDb } from '../utils/db.js';
import { generateToken, verifyTokenFromRequest, addPlanDuration, bcrypt } from '../utils/auth.js';
import { formatUserRow } from '../utils/d1.js';
import { sendResetEmail } from '../utils/brevo.js';
import {
  initialLayoutConfig,
  initialHomeConfig,
  initialSidebarConfig,
  initialPolicy,
  initialQuestions,
  initialUsers
} from '../data/liveConfigs.js';

// Fallback Live State for Edge Runtime
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
  copyright: { text: "© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।", links: [] }
};

let liveSidebarConfig = (initialSidebarConfig && Object.keys(initialSidebarConfig).length > 0) ? { ...initialSidebarConfig } : {
  menus: [],
  headerButtons: []
};

let livePolicy = initialPolicy || "<h2>TopMCQBD রিফান্ড ও গোপনীয়তা নীতিমালা</h2>";
let liveQuestions = Array.isArray(initialQuestions) && initialQuestions.length > 0 ? [...initialQuestions] : [];
let liveUsers = Array.isArray(initialUsers) && initialUsers.length > 0 ? [...initialUsers] : [];

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
  const { request, env } = context;
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
  const d1 = env?.DB;

  try {
    // 1. SIDEBAR CONFIG (/api/sidebar-config)
    if (route === 'sidebar-config') {
      if (method === 'GET') {
        if (d1) {
          try {
            const row = await d1.prepare('SELECT value FROM configs WHERE key = ?').bind('sidebar').first();
            if (row?.value) return jsonResponse(JSON.parse(row.value));
          } catch (e) {}
        }
        return jsonResponse(liveSidebarConfig);
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        liveSidebarConfig = { ...liveSidebarConfig, ...body };
        if (d1) {
          try {
            await d1.prepare('INSERT INTO configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
              .bind('sidebar', JSON.stringify(liveSidebarConfig)).run();
          } catch (e) {}
        }
        return jsonResponse({ success: true, message: 'Sidebar config saved successfully!', config: liveSidebarConfig });
      }
    }

    // 2. HOME CONFIG (/api/home-config)
    if (route === 'home-config') {
      if (method === 'GET') {
        if (d1) {
          try {
            const row = await d1.prepare('SELECT value FROM configs WHERE key = ?').bind('home').first();
            if (row?.value) return jsonResponse(JSON.parse(row.value));
          } catch (e) {}
        }
        return jsonResponse(liveHomeConfig);
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        liveHomeConfig = { ...liveHomeConfig, ...body };
        if (d1) {
          try {
            await d1.prepare('INSERT INTO configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
              .bind('home', JSON.stringify(liveHomeConfig)).run();
          } catch (e) {}
        }
        return jsonResponse({ success: true, message: 'Home config saved successfully!', config: liveHomeConfig });
      }
    }

    // 3. LAYOUT CONFIG (/api/layout-config)
    if (route === 'layout-config') {
      if (method === 'GET') {
        if (d1) {
          try {
            const row = await d1.prepare('SELECT value FROM configs WHERE key = ?').bind('layout').first();
            if (row?.value) return jsonResponse(JSON.parse(row.value));
          } catch (e) {}
        }
        return jsonResponse(liveLayoutConfig);
      }
      if (method === 'POST') {
        const body = await request.json().catch(() => ({}));
        liveLayoutConfig = { ...liveLayoutConfig, ...body };
        if (d1) {
          try {
            await d1.prepare('INSERT INTO configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
              .bind('layout', JSON.stringify(liveLayoutConfig)).run();
          } catch (e) {}
        }
        return jsonResponse({ success: true, message: 'Layout config saved successfully!', config: liveLayoutConfig });
      }
    }

    // 4. CATEGORIES (/api/categories)
    if (route === 'categories') {
      if (method === 'GET') {
        let distinctCategories = [];
        if (d1) {
          try {
            const result = await d1.prepare('SELECT DISTINCT category FROM questions WHERE category IS NOT NULL AND category != ""').all();
            distinctCategories = (result.results || []).map(r => r.category);
          } catch (e) {}
        }
        if (distinctCategories.length === 0) {
          distinctCategories = Array.from(new Set(liveQuestions.map(q => q.category).filter(Boolean)));
        }
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
          const newDoc = {
            id: 'q_' + Date.now(),
            q: `নমুনা প্রশ্ন (${catName})`,
            options: JSON.stringify(['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪']),
            ans: 0,
            explanation: `${catName} বিষয়ের নমুনা প্রশ্ন`,
            category: catName,
            createdAt: new Date().toISOString()
          };
          if (d1) {
            try {
              await d1.prepare('INSERT INTO questions (id, q, options, ans, explanation, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
                .bind(newDoc.id, newDoc.q, newDoc.options, newDoc.ans, newDoc.explanation, newDoc.category, newDoc.createdAt).run();
            } catch (e) {}
          }
          liveQuestions.push({ ...newDoc, _id: newDoc.id, options: JSON.parse(newDoc.options) });
        }
        return jsonResponse({ success: true, message: 'ক্যাটেগরি সফলভাবে তৈরি হয়েছে!' }, 201);
      }
      if (method === 'DELETE') {
        const catName = url.searchParams.get('category');
        if (catName) {
          if (d1) {
            try {
              await d1.prepare('DELETE FROM questions WHERE category LIKE ?').bind(`${catName}%`).run();
            } catch (e) {}
          }
          const initialLen = liveQuestions.length;
          liveQuestions = liveQuestions.filter(q => !(q.category || '').toLowerCase().startsWith(catName.toLowerCase()));
          return jsonResponse({ success: true, count: initialLen - liveQuestions.length, message: 'ক্যাটেগরি মুছে ফেলা হয়েছে।' });
        }
        return jsonResponse({ success: false, message: 'Category required' }, 400);
      }
    }

    // 5. POLICY (/api/policy/get, /api/policy/save)
    if (route === 'policy/get' && method === 'GET') {
      if (d1) {
        try {
          const row = await d1.prepare('SELECT value FROM configs WHERE key = ?').bind('policy').first();
          if (row?.value) return jsonResponse({ content: JSON.parse(row.value) });
        } catch (e) {}
      }
      return jsonResponse({ content: livePolicy });
    }
    if (route === 'policy/save' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (body.content !== undefined) {
        livePolicy = body.content;
        if (d1) {
          try {
            await d1.prepare('INSERT INTO configs (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
              .bind('policy', JSON.stringify(livePolicy)).run();
          } catch (e) {}
        }
      }
      return jsonResponse({ success: true, message: 'Policy saved successfully!' });
    }

    // 6. DB CHECK (/api/db-check)
    if (route === 'db-check' && method === 'GET') {
      let d1Status = 'Not Bound';
      let d1Latency = 0;
      let userCount = 0;
      let questionCount = 0;

      if (d1) {
        const start = Date.now();
        try {
          const uRow = await d1.prepare('SELECT COUNT(*) as c FROM users').first();
          const qRow = await d1.prepare('SELECT COUNT(*) as c FROM questions').first();
          userCount = uRow?.c || 0;
          questionCount = qRow?.c || 0;
          d1Latency = Date.now() - start;
          d1Status = 'Connected (Cloudflare D1 Native SQL)';
        } catch (err) {
          d1Status = `Error: ${err.message}`;
        }
      }

      return jsonResponse({
        timestamp: new Date().toISOString(),
        server: 'Cloudflare Pages Edge Runtime',
        databaseEngine: 'Cloudflare D1 (Native Edge SQL)',
        d1: {
          status: d1Status,
          connected: Boolean(d1 && !d1Status.startsWith('Error')),
          latencyMs: d1Latency,
          users: userCount,
          questions: questionCount
        }
      });
    }

    // 7. QUESTIONS CRUD (/api/questions, /api/mcq, /api/questions/free)
    if (route === 'questions' || route === 'mcq' || route === 'questions/free') {
      if (method === 'GET') {
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const limit = parseInt(url.searchParams.get('limit') || '0', 10);

        if (d1) {
          try {
            let sql = 'SELECT * FROM questions WHERE 1=1';
            const params = [];
            if (category && category !== 'all' && category !== 'All') {
              sql += ' AND category LIKE ?';
              params.push(`${category}%`);
            }
            if (search) {
              sql += ' AND (q LIKE ? OR explanation LIKE ?)';
              params.push(`%${search}%`, `%${search}%`);
            }
            sql += ' ORDER BY createdAt DESC';
            if (limit > 0) {
              sql += ` LIMIT ${limit}`;
            }

            const result = await d1.prepare(sql).bind(...params).all();
            const formatted = (result.results || []).map(q => ({
              ...q,
              _id: q.id,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              tags: typeof q.tags === 'string' ? JSON.parse(q.tags) : (q.tags || [])
            }));
            return jsonResponse({
              success: true,
              mcqs: formatted,
              questions: formatted,
              total: formatted.length
            });
          } catch (e) {
            console.error('D1 questions fetch error:', e.message);
          }
        }

        // In-memory fallback
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
          for (const q of body) {
            const docId = 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
            const docQ = (q.q || '').trim();
            const docOptions = JSON.stringify((q.options || []).map(o => String(o).trim()));
            const docAns = parseInt(q.ans || 0, 10);
            const docExp = q.explanation || '';
            const docCat = (q.category || '').trim();
            const docCreated = new Date().toISOString();

            if (docQ && docCat) {
              if (d1) {
                try {
                  await d1.prepare('INSERT INTO questions (id, q, options, ans, explanation, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
                    .bind(docId, docQ, docOptions, docAns, docExp, docCat, docCreated).run();
                } catch (e) {}
              }
            }
          }
          return jsonResponse({ success: true, count: body.length }, 201);
        }

        const docId = 'q_' + Date.now();
        const docQ = (body.q || '').trim();
        const docOptions = JSON.stringify((body.options || []).map(o => String(o).trim()));
        const docAns = parseInt(body.ans || 0, 10);
        const docExp = body.explanation || '';
        const docCat = (body.category || '').trim();
        const docCreated = new Date().toISOString();

        if (!docQ || !docCat) {
          return jsonResponse({ success: false, message: 'Question and category are required' }, 400);
        }

        if (d1) {
          try {
            await d1.prepare('INSERT INTO questions (id, q, options, ans, explanation, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .bind(docId, docQ, docOptions, docAns, docExp, docCat, docCreated).run();
          } catch (e) {}
        }

        return jsonResponse({ success: true, data: { id: docId, _id: docId, q: docQ } }, 201);
      }
    }

    // Single Question operations (/api/questions/:id)
    if (routeParts[0] === 'questions' && routeParts.length === 2 && routeParts[1] !== 'upload-csv' && routeParts[1] !== 'free') {
      const qId = routeParts[1];
      if (method === 'GET') {
        if (d1) {
          try {
            const q = await d1.prepare('SELECT * FROM questions WHERE id = ?').bind(qId).first();
            if (q) {
              return jsonResponse({
                success: true,
                question: {
                  ...q,
                  _id: q.id,
                  options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                  tags: typeof q.tags === 'string' ? JSON.parse(q.tags) : (q.tags || [])
                }
              });
            }
          } catch (e) {}
        }
        return jsonResponse({ success: false, message: 'Question not found' }, 404);
      }
      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        if (d1) {
          try {
            await d1.prepare('UPDATE questions SET q = ?, options = ?, ans = ?, explanation = ?, category = ? WHERE id = ?')
              .bind(body.q || '', JSON.stringify(body.options || []), parseInt(body.ans || 0, 10), body.explanation || '', body.category || '', qId).run();
            return jsonResponse({ success: true, message: 'Question updated successfully!' });
          } catch (e) {}
        }
        return jsonResponse({ success: true, message: 'Question updated successfully!' });
      }
      if (method === 'DELETE') {
        if (d1) {
          try {
            await d1.prepare('DELETE FROM questions WHERE id = ?').bind(qId).run();
          } catch (e) {}
        }
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

      if (d1) {
        try {
          const statements = [];
          for (let i = 0; i < questionsList.length; i++) {
            const q = questionsList[i];
            const qId = 'q_' + Date.now() + '_' + i;
            statements.push(
              d1.prepare('INSERT INTO questions (id, q, options, ans, explanation, category, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
                .bind(
                  qId,
                  (q.q || '').trim(),
                  JSON.stringify((q.options || []).map(o => String(o).trim())),
                  parseInt(q.ans || 0, 10),
                  q.explanation || '',
                  (q.category || '').trim(),
                  new Date().toISOString()
                )
            );
          }
          await d1.batch(statements);
          return jsonResponse({ success: true, count: questionsList.length, message: `${questionsList.length} questions imported successfully!` });
        } catch (e) {
          console.error('D1 batch upload error:', e.message);
        }
      }

      return jsonResponse({ success: true, count: questionsList.length, message: `${questionsList.length} questions imported!` });
    }

    // 8. AUTH (/api/auth/login, /api/auth/register, /api/auth/change-password, /api/auth/forgot-password, /api/auth/reset-password)
    if (route === 'auth/login' && method === 'POST') {
      const { email, password } = await request.json().catch(() => ({}));
      if (!email || !password) {
        return jsonResponse({ success: false, message: 'Email and password are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      let user = null;

      if (d1) {
        try {
          const row = await d1.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').bind(cleanEmail).first();
          if (row) {
            user = {
              ...formatUserRow(row),
              password: row.password
            };
          }
        } catch (err) {
          console.error('D1 login error:', err.message);
        }
      }

      if (!user) {
        user = liveUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);
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

      // Update lastLogin in D1
      if (d1) {
        try {
          await d1.prepare('UPDATE users SET lastLogin = ? WHERE id = ?').bind(new Date().toISOString(), user.id || user._id).run();
        } catch (e) {}
      }

      const token = await generateToken(user, context.env);
      return jsonResponse({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id || user._id,
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
      if (d1) {
        try {
          const existing = await d1.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').bind(cleanEmail).first();
          if (existing) {
            return jsonResponse({ success: false, message: 'User already exists with this email' }, 400);
          }
        } catch (e) {}
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserId = 'usr_' + Date.now();
      const userRole = role && ['customer', 'admin'].includes(role) ? role : 'customer';
      const now = new Date().toISOString();

      if (d1) {
        try {
          await d1.prepare(`
            INSERT INTO users (id, name, email, password, role, subscription_plan, subscription_active, pendingRequests, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(newUserId, name.trim(), cleanEmail, hashedPassword, userRole, 'none', 0, '[]', now).run();
        } catch (err) {
          console.error('D1 register error:', err.message);
        }
      }

      const newUser = {
        id: newUserId,
        _id: newUserId,
        name: name.trim(),
        email: cleanEmail,
        role: userRole,
        subscription: { plan: 'none', active: false },
        pendingRequests: [],
        createdAt: now
      };

      const token = await generateToken(newUser, context.env);
      return jsonResponse({
        success: true,
        message: 'Registration successful!',
        token,
        user: newUser
      }, 201);
    }

    if (route === 'auth/change-password' && method === 'PUT') {
      const payload = await verifyTokenFromRequest(request, context.env);
      if (!payload) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

      const { currentPassword, newPassword } = await request.json().catch(() => ({}));
      if (!currentPassword || !newPassword) return jsonResponse({ success: false, message: 'Current and new password are required' }, 400);

      if (d1) {
        try {
          const userRow = await d1.prepare('SELECT password FROM users WHERE id = ?').bind(payload.userId).first();
          if (!userRow) return jsonResponse({ success: false, message: 'User not found' }, 404);

          let isMatch = false;
          if (userRow.password.startsWith('$2a$') || userRow.password.startsWith('$2b$') || userRow.password.startsWith('$2y$')) {
            isMatch = await bcrypt.compare(currentPassword, userRow.password);
          } else {
            isMatch = currentPassword === userRow.password;
          }

          if (!isMatch) return jsonResponse({ success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' }, 400);

          const hashed = await bcrypt.hash(newPassword, 10);
          await d1.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hashed, payload.userId).run();
          return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
        } catch (e) {
          return jsonResponse({ success: false, message: e.message }, 500);
        }
      }

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
    }

    if (route === 'auth/forgot-password' && method === 'POST') {
      const { email } = await request.json().catch(() => ({}));
      if (!email) return jsonResponse({ success: false, message: 'Email is required' }, 400);

      const cleanEmail = email.toLowerCase().trim();
      let user = null;
      if (d1) {
        try {
          const row = await d1.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').bind(cleanEmail).first();
          if (row) user = formatUserRow(row);
        } catch (e) {}
      }

      if (!user) {
        user = liveUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);
      }

      if (!user) return jsonResponse({ success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' }, 404);

      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetLink = `${url.origin}/login?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;
      try {
        await sendResetEmail(user, resetLink, context.env);
      } catch (e) {
        console.warn('Brevo reset email error:', e.message);
      }

      return jsonResponse({ success: true, message: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' });
    }

    if (route === 'auth/reset-password' && method === 'POST') {
      const { email, newPassword } = await request.json().catch(() => ({}));
      if (!email || !newPassword) return jsonResponse({ success: false, message: 'All fields are required' }, 400);

      const cleanEmail = email.toLowerCase().trim();
      const hashed = await bcrypt.hash(newPassword, 10);
      if (d1) {
        try {
          await d1.prepare('UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)').bind(hashed, cleanEmail).run();
        } catch (e) {}
      }
      return jsonResponse({ success: true, message: 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! এখন লগইন করুন।' });
    }

    // 9. USERS (/api/users, /api/users/me, /api/users/create-admin, /api/users/request-plan)
    if (route === 'users' && method === 'GET') {
      // 1. First priority: Cloudflare D1 Native Database
      if (d1) {
        try {
          const result = await d1.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
          const users = (result.results || []).map(formatUserRow);
          return jsonResponse({ success: true, users });
        } catch (d1Err) {
          console.error('❌ D1 live users fetch error:', d1Err.message);
          return jsonResponse({
            success: false,
            message: `Cloudflare D1 Error: ${d1Err.message}`,
            users: []
          }, 500);
        }
      }

      // 2. Second priority: MongoDB (if D1 binding is not yet added in Pages Dashboard)
      try {
        const db = await getPaidDb(context);
        const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray();
        return jsonResponse({
          success: true,
          users: users.map(u => ({
            id: u._id.toString(),
            _id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            subscription: u.subscription,
            pendingRequests: u.pendingRequests || [],
            createdAt: u.createdAt,
            lastLogin: u.lastLogin
          }))
        });
      } catch (dbErr) {
        console.error('❌ Database users fetch error:', dbErr.message);
        return jsonResponse({
          success: false,
          message: `Database Error: ${dbErr.message}`,
          users: []
        }, 500);
      }
    }

    if (route === 'users/me' && method === 'GET') {
      const payload = await verifyTokenFromRequest(request, context.env);
      if (!payload) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

      if (d1) {
        try {
          const row = await d1.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).first();
          if (row) return jsonResponse({ success: true, user: formatUserRow(row) });
        } catch (e) {}
      }

      const user = liveUsers.find(u => String(u._id) === String(payload.userId));
      if (!user) return jsonResponse({ success: false, message: 'User not found' }, 404);

      return jsonResponse({
        success: true,
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

    if (route === 'users/create-admin' && method === 'POST') {
      const { name, email, password, role } = await request.json().catch(() => ({}));
      if (!name || !email || !password) {
        return jsonResponse({ success: false, message: 'Name, Email, and Password are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserId = 'usr_' + Date.now();
      const adminRole = role || 'admin';
      const now = new Date().toISOString();

      if (d1) {
        try {
          await d1.prepare(`
            INSERT INTO users (id, name, email, password, role, subscription_plan, subscription_active, subscription_startDate, subscription_endDate, pendingRequests, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(newUserId, name.trim(), cleanEmail, hashedPassword, adminRole, '3_years', 1, now, new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), '[]', now).run();
        } catch (e) {}
      }

      return jsonResponse({
        success: true,
        message: 'Admin account created successfully!',
        user: { id: newUserId, _id: newUserId, name: name.trim(), email: cleanEmail, role: adminRole }
      }, 201);
    }

    if (route === 'users/request-plan' && method === 'POST') {
      const payload = await verifyTokenFromRequest(request, context.env);
      if (!payload) return jsonResponse({ success: false, message: 'Unauthorized' }, 401);

      const body = await request.json().catch(() => ({}));
      const newRequest = {
        _id: 'req_' + Date.now(),
        id: 'req_' + Date.now(),
        plan: body.plan || '1_month',
        paymentMethod: body.paymentMethod || 'bkash',
        phone: body.phone || '',
        transactionId: body.transactionId || '',
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      if (d1) {
        try {
          const row = await d1.prepare('SELECT pendingRequests FROM users WHERE id = ?').bind(payload.userId).first();
          let currentReqs = [];
          try { currentReqs = JSON.parse(row?.pendingRequests || '[]'); } catch (e) {}
          currentReqs.unshift(newRequest);
          await d1.prepare('UPDATE users SET pendingRequests = ? WHERE id = ?').bind(JSON.stringify(currentReqs), payload.userId).run();
          return jsonResponse({ success: true, message: 'পেমেন্ট রিকোয়েস্ট জমা দেওয়া হয়েছে!', request: newRequest });
        } catch (e) {}
      }

      return jsonResponse({ success: true, message: 'পেমেন্ট রিকোয়েস্ট জমা দেওয়া হয়েছে!', request: newRequest });
    }

    // 10. Single User operations (/api/users/:userId/...)
    if (routeParts[0] === 'users' && routeParts.length >= 2) {
      const targetUserId = routeParts[1];

      // DELETE /api/users/:userId
      if (routeParts.length === 2 && method === 'DELETE') {
        if (d1) {
          try {
            await d1.prepare('DELETE FROM users WHERE id = ?').bind(targetUserId).run();
            return jsonResponse({ success: true, message: 'ইউজার মুছে ফেলা হয়েছে!' });
          } catch (e) {}
        }
        return jsonResponse({ success: true, message: 'ইউজার মুছে ফেলা হয়েছে!' });
      }

      // PUT /api/users/:userId/subscription
      if (routeParts.length === 3 && routeParts[2] === 'subscription' && method === 'PUT') {
        const body = await request.json().catch(() => ({}));
        const now = new Date();
        const endDate = addPlanDuration(now, body.plan || '1_month');
        const newSubscription = {
          plan: body.plan || 'custom',
          active: body.plan !== 'none',
          startDate: now.toISOString(),
          endDate: endDate.toISOString()
        };

        if (d1) {
          try {
            await d1.prepare(`
              UPDATE users 
              SET subscription_plan = ?, subscription_active = ?, subscription_startDate = ?, subscription_endDate = ?
              WHERE id = ?
            `).bind(newSubscription.plan, newSubscription.active ? 1 : 0, newSubscription.startDate, newSubscription.endDate, targetUserId).run();
            return jsonResponse({ success: true, message: 'সাবস্ক্রিপশন আপডেট হয়েছে!', subscription: newSubscription });
          } catch (e) {}
        }

        return jsonResponse({ success: true, message: 'সাবস্ক্রিপশন আপডেট হয়েছে!', subscription: newSubscription });
      }

      // PUT /api/users/:userId/pending-requests/:requestId/approve
      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'approve' && method === 'PUT') {
        const reqId = routeParts[3];
        if (d1) {
          try {
            const row = await d1.prepare('SELECT * FROM users WHERE id = ?').bind(targetUserId).first();
            if (row) {
              const user = formatUserRow(row);
              const req = (user.pendingRequests || []).find(r => String(r._id) === String(reqId) || String(r.id) === String(reqId));
              if (req) req.status = 'approved';
              const now = new Date();
              const endDate = addPlanDuration(now, req ? req.plan : '1_month');
              user.subscription = { plan: req ? req.plan : '1_month', active: true, startDate: now.toISOString(), endDate: endDate.toISOString() };

              await d1.prepare(`
                UPDATE users 
                SET subscription_plan = ?, subscription_active = ?, subscription_startDate = ?, subscription_endDate = ?, pendingRequests = ?
                WHERE id = ?
              `).bind(user.subscription.plan, 1, user.subscription.startDate, user.subscription.endDate, JSON.stringify(user.pendingRequests), targetUserId).run();

              return jsonResponse({ success: true, message: 'অনুমোদন সফল হয়েছে!', subscription: user.subscription });
            }
          } catch (e) {}
        }
        return jsonResponse({ success: true, message: 'অনুমোদন সফল হয়েছে!' });
      }

      // PUT /api/users/:userId/pending-requests/:requestId/reject
      if (routeParts[2] === 'pending-requests' && routeParts.length === 5 && routeParts[4] === 'reject' && method === 'PUT') {
        const reqId = routeParts[3];
        if (d1) {
          try {
            const row = await d1.prepare('SELECT * FROM users WHERE id = ?').bind(targetUserId).first();
            if (row) {
              const user = formatUserRow(row);
              const req = (user.pendingRequests || []).find(r => String(r._id) === String(reqId) || String(r.id) === String(reqId));
              if (req) req.status = 'rejected';

              await d1.prepare('UPDATE users SET pendingRequests = ? WHERE id = ?')
                .bind(JSON.stringify(user.pendingRequests), targetUserId).run();

              return jsonResponse({ success: true, message: 'Request reject করা হয়েছে।' });
            }
          } catch (e) {}
        }
        return jsonResponse({ success: true, message: 'Request reject করা হয়েছে।' });
      }
    }

    return jsonResponse({ success: false, message: 'API Route Not Found: ' + route }, 404);
  } catch (error) {
    console.error('Fatal Edge API error:', error);
    return jsonResponse({ success: false, message: error.message || 'Internal Server Error' }, 500);
  }
}
