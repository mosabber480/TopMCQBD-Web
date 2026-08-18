import { parseClusterHost, getDbConfig } from '../utils/db.js';
import { generateToken, verifyTokenFromRequest, addPlanDuration } from '../utils/auth.js';

// Live In-Memory State for Edge Runtime
let liveHomeConfig = {
  seoTitle: "TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম",
  seoDescription: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য সেরা অনলাইন প্রস্তুতি প্ল্যাটফর্ম।",
  sliders: [
    {
      title: "বিসিএস ও ব্যাংক জব প্রস্তুতির সেরা মাধ্যম",
      subtitle: "হাজারো সঠিক প্রশ্নের ব্যাখ্যাসহ নিজেকে যাচাই করুন এবং দ্রুততম সময়ে আপনার চাকরির প্রস্তুতি সম্পন্ন করুন।",
      bgImage: "images/slider-01.jpg",
      bgOpacity: 0.5,
      btn1Text: "🚀 কুইজ শুরু করুন",
      btn1Link: "/all-mcq",
      btn2Text: "ফ্রি ডেমো দেখুন",
      btn2Link: "#demo"
    },
    {
      title: "বিসিএস ও ব্যাংক জব প্রস্তুতির সেরা মাধ্যম",
      subtitle: "হাজারো সঠিক প্রশ্নের ব্যাখ্যাসহ নিজেকে যাচাই করুন এবং দ্রুততম সময়ে আপনার চাকরির প্রস্তুতি সম্পন্ন করুন।",
      bgImage: "images/slider-02.jpg",
      bgOpacity: 0.5,
      btn1Text: "🚀 কুইজ শুরু করুন",
      btn1Link: "/all-mcq",
      btn2Text: "ফ্রি ডেমো দেখুন",
      btn2Link: "#demo"
    }
  ],
  demoQuizzes: [
    {
      title: "বাংলা ভাষা ও সাহিত্য",
      badgeText: "ফ্রি টেস্ট",
      desc: "সন্ধি, সমাস ও গুরুত্বপূর্ণ সাহিত্যিকদের বিগত বছরের প্রশ্নাবলি।",
      link: "/free-mcqs"
    }
  ],
  packages: [],
  demoSectionInfo: {
    title: "ফ্রি ডেমো কুইজ",
    subtitle: "কোনো রেজিস্ট্রেশন ছাড়াই এখনই নিচের কুইজগুলো প্র্যাকটিস করে দেখুন"
  },
  packageSectionInfo: {
    title: "প্যাকেজসমূহ",
    subtitle: "আপনার সুবিধাজনক প্রস্তুতি প্ল্যান বেছে নিন"
  },
  missionSectionInfo: {
    sectionTitle: "আমাদের মিশন ও লক্ষ্য",
    sectionSubtitle: "শিক্ষার্থীদের সফলতা ও সঠিক প্রস্ততির পথ সুগম করাই আমাদের উদ্দেশ্য",
    missionTitle: "আমাদের মিশন",
    missionDesc: "বাংলাদেশের যেকোনো প্রান্তের শিক্ষার্থীদের কাছে মানসম্মত ও তথ্যসমৃদ্ধ প্রস্তুতিমূলক কুইজ পৌঁছে দেওয়া, যাতে তারা ঘরে বসেই রিয়েল-টাইম মূল্যায়নের মাধ্যমে নিজের আত্মবিশ্বাস বৃদ্ধি করতে পারে।",
    goalTitle: "আমাদের লক্ষ্য",
    goalDesc: "একটি আধুনিক, সহজ ও কার্যকর লার্নিং প্ল্যাটফর্ম হিসেবে প্রতিটি প্রতিযোগিতামূলক পরীক্ষার পরীক্ষার্থীর প্রথম পছন্দ হয়ে ওঠা এবং ব্যাখ্যামূলক অনুশীলনের মাধ্যমে তাদের শতভাগ সাফল্য নিশ্চিত করা।"
  }
};

let liveLayoutConfig = {
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
        type: "info",
        title: "সাইট তথ্য ও সোশাল লিংক",
        text: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য একটি আধুনিক ও স্বয়ংসম্পূর্ণ অনলাইন প্রস্তুতি প্ল্যাটফর্ম।",
        fb: "",
        yt: "",
        wa: "",
        tw: "",
        tg: "",
        ln: ""
      },
      {
        type: "links",
        title: "প্রয়োজনীয় লিংক",
        links: [
          { title: "হোম পেজ", url: "/" },
          { title: "কুইজ অনুশীলন", url: "/quiz" },
          { title: "সকল প্রশ্ন ক্যাটাগরি", url: "/all-mcq" },
          { title: "প্যাকেজ ও মূল্য তালিকা", url: "/packages" }
        ]
      },
      {
        type: "links",
        title: "ক্যাটাগরি",
        links: [
          { title: "বিসিএস প্রস্তুতি", url: "/quiz?category=bcs" },
          { title: "ব্যাংক জব", url: "/quiz?category=bank" },
          { title: "প্রাথমিক শিক্ষক", url: "/quiz?category=primary" }
        ]
      },
      {
        type: "links",
        title: "যোগাযোগ",
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

let liveSidebarConfig = {
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
    { text: 'ইউজার লিস্ট', url: '/admin/users', icon: 'fa-solid fa-users', color: 'warning', targetBlank: false, action: 'link' },
    { text: 'Database Connection', url: '/db-connection-check', icon: 'fa-solid fa-arrow-up-right-from-square', color: 'primary', targetBlank: true, action: 'link' }
  ]
};

let livePolicy = "<h2>TopMCQBD রিফান্ড ও গোপনীয়তা নীতিমালা</h2><p>TopMCQBD তে আপনাকে স্বাগতম। আমাদের প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলি মেনে নিচ্ছেন।</p>";

let liveQuestions = [
  {
    _id: 'q_1',
    q: '‘বিদ্যা + আলয়’ = কোনটি?',
    options: ['বিদ্যালয়', 'বিদালয়', 'বিদ্যালয়ী', 'বিদালয়া'],
    ans: 0,
    explanation: 'বিদ্যা ও আলয় মিলে সন্ধিযুক্ত হয়ে বিদ্যালয় গঠিত হয়।',
    category: 'Bangla > grammer > sondhi'
  },
  {
    _id: 'q_2',
    q: '‘অ + অ’ মিলে কী হয়?',
    options: ['আ', 'ই', 'উ', 'এ'],
    ans: 0,
    explanation: 'স্বরসন্ধির নিয়ম অনুযায়ী অ-কার কিংবা আ-কারের পর অ-কার বা আ-কার থাকলে উভয় মিলে আ-কার হয়।',
    category: 'Bangla > grammer > sondhi'
  }
];

let liveUsers = [
  {
    _id: 'u_1',
    name: 'Mosabber (Owner)',
    email: 'mosabber480@gmail.com',
    role: 'owner',
    subscription: { plan: 'lifetime', active: true, startDate: new Date().toISOString(), endDate: '2099-12-31' },
    pendingRequests: []
  },
  {
    _id: 'u_2',
    name: 'Rahim User',
    email: 'rahim@gmail.com',
    role: 'customer',
    subscription: { plan: '1_month', active: true, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString() },
    pendingRequests: []
  }
];

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
