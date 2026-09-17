/**
 * TopMCQBD Cloudflare Fullstack Worker & Backup API & Pages Advanced Mode Engine
 * 
 * Features:
 * 1. Serves the Complete TopMCQBD Website UI (HTML, CSS, JS, Images, Fonts) via Cloudflare Native Assets
 * 2. Direct MongoDB Atlas TCP Connectivity with Native SRV, IPv4, TLS, and Fallback Endpoints
 * 3. Dynamic Layout, Home, Sidebar, and App Configs with Native Cloudflare D1 Support
 * 4. Smart Route Fallback (auto-resolves Clean URLs like /questions to /questions.html)
 * 5. Multi-Cluster MongoDB Edge CRUD (/api/db-test/[cluster], /api/db-pages-api, /api/db-check)
 * 6. Cloudflare D1 Edge CRUD & Auto-Seeding (/api/db-test/d1)
 * 7. Active Connection & Keep-Alive Monitoring (/api/db-mongodb-active-connection)
 * 8. Rich Diagnostic Portal for Edge Health Checks
 * 9. Full CORS Support for seamless Frontend Integration
 */

import { MongoClient, ObjectId } from 'mongodb';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

// -------------------------------------------------------------
// MONGODB ATLAS CLUSTER CONFIGURATIONS (100% ENVIRONMENT-DRIVEN)
// -------------------------------------------------------------
const CLUSTERS = {
  paid: {
    db: 'TopMCQBD_DB',
    coll: 'db-paid-test',
    name: 'TopMCQBD_DB (Paid Core)',
    envUriKey: 'MONGODB_URI_PAID',
    envDbKey: 'MONGODB_DB_PAID',
  },
  free: {
    db: 'TopMCQBD_DB_Free',
    coll: 'db-free-test',
    name: 'TopMCQBD_DB_Free (Open Free)',
    envUriKey: 'MONGODB_URI_FREE',
    envDbKey: 'MONGODB_DB_FREE',
  },
  subjective: {
    db: 'TopMCQBD_DB_Subjective',
    coll: 'db-subjective-test',
    name: 'TopMCQBD_DB_Subjective',
    envUriKey: 'MONGODB_URI_SUBJECTIVE',
    envDbKey: 'MONGODB_DB_SUBJECTIVE',
  },
  live_exam: {
    db: 'TopMCQBD_DB_Live_Exam',
    coll: 'db-live-exam-test',
    name: 'TopMCQBD_DB_Live_Exam',
    envUriKey: 'MONGODB_URI_LIVE_EXAM',
    envDbKey: 'MONGODB_DB_LIVE_EXAM',
  },
  written: {
    db: 'TopMCQBD_DB_written',
    coll: 'db-written-test',
    name: 'TopMCQBD_DB_written',
    envUriKey: 'MONGODB_URI_WRITTEN',
    envDbKey: 'MONGODB_DB_WRITTEN',
  },
  question_bank: {
    db: 'TopMCQBD_DB_Question_Bank',
    coll: 'db-question-bank-test',
    name: 'TopMCQBD_DB_Question_Bank',
    envUriKey: 'MONGODB_URI_QUESTION_BANK',
    envDbKey: 'MONGODB_DB_QUESTION_BANK',
  },
};

function resolveCluster(clusterParam, env) {
  const norm = String(clusterParam || 'paid').toLowerCase().replace(/-/g, '_');
  const cfg = CLUSTERS[norm] || CLUSTERS.paid;
  const clusterKey = norm.toUpperCase();

  let envUri = (env && env[cfg.envUriKey]) || (typeof process !== 'undefined' && process.env && process.env[cfg.envUriKey]);
  if (!envUri) {
    const altKeys = [`MONGODB_DB_NAME_${clusterKey}`, `MONGODB_DB_${clusterKey}`, 'MONGODB_URI'];
    for (const k of altKeys) {
      const val = (env && env[k]) || (typeof process !== 'undefined' && process.env && process.env[k]);
      if (val && (val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'))) {
        envUri = val;
        break;
      }
    }
  }

  let dbName = (env && env[cfg.envDbKey]) || (typeof process !== 'undefined' && process.env && process.env[cfg.envDbKey]);
  if (!dbName || dbName.startsWith('mongodb')) {
    const altDbKey = `MONGODB_DB_NAME_${clusterKey}`;
    const altVal = (env && env[altDbKey]) || (typeof process !== 'undefined' && process.env && process.env[altDbKey]);
    if (altVal && !altVal.startsWith('mongodb')) {
      dbName = altVal;
    } else {
      dbName = cfg.db;
    }
  }

  return {
    cfg,
    envUriKey: cfg.envUriKey,
    uri: envUri,
    dbName,
    coll: cfg.coll,
    name: cfg.name,
  };
}

function createClientOptions(uri) {
  const isSrv = uri.startsWith('mongodb+srv://');
  const isMultiHost = uri.includes(',');
  const clientOptions = {
    tls: true,
    family: 4,               // Enforce IPv4 to avoid Edge IPv6 DNS latency
    maxPoolSize: 1,         // Single lightweight socket per Edge isolate
    minPoolSize: 0,         // Clean up idle sockets automatically
    connectTimeoutMS: 8000,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 12000,
  };

  if (!isSrv && !isMultiHost) {
    clientOptions.directConnection = true;
  }
  return clientOptions;
}

/**
 * Connect to MongoDB strictly using the Cloudflare environment variable.
 * If the environment variable is deleted or missing from Cloudflare,
 * it immediately throws an error and disconnects (zero hardcoded fallback).
 */
async function getClient(target) {
  const uri = typeof target === 'string' ? target : target?.uri;
  const envUriKey = target?.envUriKey || target?.cfg?.envUriKey || 'MONGODB_URI';

  if (!uri) {
    throw new Error(`Cloudflare environment variable "${envUriKey}" is missing. Connection disconnected.`);
  }

  const client = new MongoClient(uri, createClientOptions(uri));
  await client.connect();
  return client;
}

// -------------------------------------------------------------
// DEFAULT APPLICATION CONFIGURATIONS (FALLBACKS & SEEDS)
// -------------------------------------------------------------
const DEFAULT_LAYOUT = {
  announcement: {
    text: "বিসিএস ও সরকারি চাকরির প্রস্তুতি",
    link: ""
  },
  header: {
    siteTitle: "TopMCQBD",
    logoUrl: "/images/TopMCQ.png",
    seoTitle: "TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম",
    faviconUrl: "/images/favicon.ico",
    btnText: "যোগাযোগ",
    btnLink: "/contact",
    btnIcon: "fa-solid fa-headset",
    menus: [
      { title: "হোম", url: "/", icon: "fa-solid fa-house" },
      { title: "কুইজ অনুশীলন", url: "/questions", icon: "fa-solid fa-bolt", badgeText: "FREE", badgeType: "free" },
      { title: "সকল MCQ", url: "/all-mcq", icon: "fa-solid fa-layer-group" },
      { title: "প্যাকেজসমূহ", url: "/packages", icon: "fa-solid fa-box" },
      { title: "আমাদের সম্পর্কে", url: "/about-us", icon: "fa-solid fa-bullseye" },
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
        fb: "", yt: "", wa: "", tw: "", tg: "", ln: ""
      },
      {
        type: "links",
        title: "প্রয়োজনীয় লিংক",
        links: [
          { title: "হোম পেজ", url: "/" },
          { title: "কুইজ অনুশীলন", url: "/questions" },
          { title: "সকল প্রশ্ন ক্যাটাগরি", url: "/all-mcq" }
        ]
      }
    ]
  },
  copyright: {
    text: "© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।",
    links: [
      { title: "FAQ", url: "/faq" },
      { title: "Privacy & Refund Policy", url: "/privacy-and-refund-policy" },
      { title: "System Status", url: "/status.html" }
    ]
  }
};

const DEFAULT_HOME_CONFIG = {
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
      btn2Text: "▶ ফ্রি ডেমো দেখুন",
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
    sectionSubtitle: "শিক্ষার্থীদের সফলতা ও সঠিক প্রস্ততি সুগম করাই আমাদের উদ্দেশ্য",
    missionTitle: "আমাদের মিশন",
    missionDesc: "বাংলাদেশের যেকোনো প্রান্তের শিক্ষার্থীদের কাছে মানসম্মত ও তথ্যসমৃদ্ধ প্রস্তুতিমূলক কুইজ পৌঁছে দেওয়া।",
    goalTitle: "আমাদের লক্ষ্য",
    goalDesc: "একটি আধুনিক, সহজ ও কার্যকর লার্নিং প্ল্যাটফর্ম হিসেবে শতভাগ সাফল্য নিশ্চিত করা।"
  }
};

const DEFAULT_SIDEBAR_CONFIG = {
  menus: [
    { title: "ড্যাশবোর্ড", url: "/admin/dashboard", icon: "fa-solid fa-gauge-high", subMenus: [] },
    { title: "হেডার কন্ট্রোল", url: "/admin/header-dashboard", icon: "fa-solid fa-window-restore", subMenus: [] },
    { title: "ফুটার কন্ট্রোল", url: "/admin/footer-dashboard", icon: "fa-solid fa-table-columns", subMenus: [] },
    { title: "হোম পেজ কন্ট্রোল", url: "/admin/home-dashboard", icon: "fa-solid fa-sliders", subMenus: [] },
    { title: "আমাদের সম্পর্কে", url: "/admin/about-dashboard", icon: "fa-solid fa-address-card", subMenus: [] },
    { title: "প্রশ্ন ব্যাংক ও MCQ", url: "/admin/questions-dashboard", icon: "fa-solid fa-file-circle-question", subMenus: [] },
    { title: "প্যাকেজসমূহ পেজ", url: "/admin/packages-dashboard", icon: "fa-solid fa-box-open", subMenus: [] },
    { title: "ইউজার ও সাবস্ক্রিপশন", url: "/admin/users", icon: "fa-solid fa-users-gear", subMenus: [] },
    { title: "সাইডবার মেনু কন্ট্রোল", url: "/admin/admin-menu-dashboard", icon: "fa-solid fa-list-check", subMenus: [] },
    { title: "রিফান্ড ও পলিসি", url: "/admin/policy-dashboard", icon: "fa-solid fa-file-invoice-dollar", subMenus: [] },
    { title: "ফ্রি এমসিকিউ কন্ট্রোল", url: "/admin/free-mcqs-dashboard", icon: "fa-solid fa-gift", subMenus: [] }
  ],
  headerButtons: [
    { text: "ওয়েবসাইট ভিজিট", url: "/", icon: "fa-solid fa-globe", color: "success", targetBlank: true, action: "link" },
    { text: "Database Connection", url: "/db-connection-api", icon: "fa-solid fa-arrow-up-right-from-square", color: "primary", targetBlank: true, action: "link" }
  ]
};

const DEFAULT_POLICY = {
  content: "<h2>TopMCQBD রিফান্ড ও গোপনীয়তা নীতিমালা</h2><p>TopMCQBD তে আপনাকে স্বাগতম। আমাদের প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলি মেনে নিচ্ছেন।</p><h3>১. অ্যাকাউন্ট ও নিরাপত্তা</h3><p>আপনার অ্যাকাউন্ট আইডি ও পাসওয়ার্ডের নিরাপত্তা রক্ষা করা সম্পূর্ণ আপনার দায়িত্ব।</p><h3>২. সাবস্ক্রিপশন ও রিফান্ড নীতি</h3><p>যেকোনো প্রিমিয়াম প্যাকেজ ক্রয়ের পর পেমেন্ট ভেরিফিকেশনের মাধ্যমে অ্যাক্সেস চালু করা হয়।</p><h3>৩. গোপনীয়তা নীতি</h3><p>আপনার ব্যক্তিগত তথ্য তৃতীয় কোনো পক্ষের কাছে শেয়ার করা হয় না।</p>"
};

const DEFAULT_CONFIG_SEEDS = {
  'db-d1-test': [
    {
      id: 'd1_demo_1',
      text: 'TopMCQBD D1 Cloudflare Edge Database Test Record',
      createdAt: 'Today, 01:00:00 AM',
      updatedAt: 'Today, 01:00:00 AM'
    }
  ],
  'about-data': {
    title: 'আমাদের সম্পর্কে (About Us)',
    subtitle: 'TopMCQBD - আপনার অনলাইন প্রস্তুতিকে সহজ ও নিখুঁত করতে আমরা সবসময় পাশে আছি',
    whatIsTitle: 'TopMCQBD কী?',
    whatIsDesc: 'TopMCQBD একটি আধুনিক, সহজ এবং বিষয়ভিত্তিক অনলাইন কুইজ ও প্রস্তুতিমূলক প্ল্যাটফর্ম।',
    whyBestTitle: 'কেন TopMCQBD সেরা?',
    features: [
      'টপিকভিত্তিক মডেল টেস্ট এবং লাইভ টাইমার রিয়েল এক্সাম এক্সপেরিয়েন্স দেয়।',
      'প্রতিটি প্রশ্নের সাথে রয়েছে নির্ভুল ও বিস্তৃত ব্যাখ্যামূলক সমাধান।',
      'তাত্ক্ষণিক রেজাল্ট এবং নিজের অবস্থান যাচাই করার সুবিধা।'
    ]
  },
  'faq-data': [
    {
      q: 'TopMCQBD কী এবং কীভাবে কাজ করে?',
      a: 'TopMCQBD একটি স্বয়ংসম্পূর্ণ অনলাইন এমসিকিউ ও মডেল টেস্ট প্ল্যাটফর্ম।'
    }
  ],
  'packages-data': [
    {
      id: '1_month',
      name: '১ মাস প্রিমিয়াম অ্যাক্সেস',
      price: '৯৯ টাকা',
      duration: '৩০ দিন মেয়াদ',
      popular: false,
      features: ['সকল বিষয় ও অধ্যায়ের আনলিমিটেড কুইজ', 'সম্পূর্ণ ব্যাখ্যামূলক সমাধান']
    },
    {
      id: 'lifetime',
      name: 'লাইফটাইম অ্যাক্সেস',
      price: '৯৯৯ টাকা',
      duration: 'আজীবন মেয়াদ',
      popular: true,
      features: ['আজীবনের জন্য সকল কুইজে অ্যাক্সেস', '২৪/৭ প্রিমিয়াম সাপোর্ট']
    }
  ]
};

// -------------------------------------------------------------
// D1 DATABASE HELPER FUNCTIONS
// -------------------------------------------------------------
async function ensureD1Table(db) {
  if (!db) return;
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS app_configs (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `).run();
}

async function getD1Config(env, key, defaultVal) {
  if (env && env.DB) {
    try {
      await ensureD1Table(env.DB);
      const row = await env.DB.prepare('SELECT data FROM app_configs WHERE key = ? LIMIT 1').bind(key).first();
      if (row && row.data) {
        return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      }
    } catch (err) {
      console.warn(`[D1 Read Error for ${key}]:`, err);
    }
  }
  return defaultVal;
}

async function setD1Config(env, key, data) {
  if (env && env.DB) {
    try {
      await ensureD1Table(env.DB);
      const now = new Date().toISOString();
      await env.DB.prepare(`
        INSERT INTO app_configs (key, data, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
      `).bind(key, JSON.stringify(data), now, now).run();
      return true;
    } catch (err) {
      console.error(`[D1 Write Error for ${key}]:`, err);
    }
  }
  return false;
}

// -------------------------------------------------------------
// DIAGNOSTIC PORTAL HTML
// -------------------------------------------------------------
function renderPortalHtml(env, url) {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TopMCQBD — Cloudflare Edge Worker Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #059669;
      --primary-dark: #047857;
      --bg: #0f172a;
      --card-bg: rgba(30, 41, 59, 0.7);
      --border: rgba(255, 255, 255, 0.1);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Hind Siliguri', 'Outfit', sans-serif;
      background: radial-gradient(circle at 50% 0%, #1e293b, var(--bg));
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .container {
      max-width: 860px;
      width: 100%;
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header { text-align: center; margin-bottom: 32px; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(5, 150, 105, 0.2);
      color: #34d399;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid rgba(52, 211, 153, 0.3);
      margin-bottom: 16px;
    }
    .badge .dot {
      width: 8px;
      height: 8px;
      background: #34d399;
      border-radius: 50%;
      box-shadow: 0 0 10px #34d399;
    }
    h1 { font-size: 32px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
    p.subtitle { color: var(--text-muted); font-size: 16px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
    }
    .card-title { font-size: 14px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; }
    .card-value { font-size: 18px; font-weight: 600; color: #ffffff; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 24px; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--primary); color: #ffffff; }
    .btn-secondary { background: rgba(255, 255, 255, 0.08); color: var(--text); border: 1px solid var(--border); }
    .footer { text-align: center; margin-top: 32px; font-size: 13px; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">
        <span class="dot"></span> Cloudflare Pages / Worker Engine Live
      </div>
      <h1>TopMCQBD — Fullstack Edge Engine</h1>
      <p class="subtitle">Cloudflare V8 Edge Isolate + Native Assets + Direct MongoDB Atlas TCP + D1</p>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Runtime Platform</div>
        <div class="card-value">Cloudflare Edge (Advanced Mode)</div>
      </div>
      <div class="card">
        <div class="card-title">Edge Node.js Compat</div>
        <div class="card-value" style="color: #34d399;">Active (v2026-09-08)</div>
      </div>
      <div class="card">
        <div class="card-title">Database Engine</div>
        <div class="card-value" style="color: var(--accent);">Native Atlas SRV + D1</div>
      </div>
      <div class="card">
        <div class="card-title">Native Assets</div>
        <div class="card-value">${env.ASSETS ? '✅ Connected' : '⚡ Initializing'}</div>
      </div>
    </div>

    <div class="actions">
      <a href="/" class="btn btn-primary">
        🌐 Open Website
      </a>
      <a href="/api/db-check" class="btn btn-secondary">
        ⚡ Test MongoDB Latency
      </a>
      <a href="/api/db-test/d1" class="btn btn-secondary">
        🗄️ Test D1 SQL
      </a>
      <a href="/api/health" class="btn btn-secondary">
        🩺 Edge Health Check
      </a>
    </div>

    <div class="footer">
      © 2026 TopMCQBD. Dual-Cloud Architecture (Cloudflare Pages + Cloudflare Workers + Render).
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// MAIN WORKER FETCH HANDLER
// -------------------------------------------------------------
export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Direct Top-Level Redirects
    if (path === '/db' || path === '/DB') {
      return Response.redirect(`${url.origin}/db-connection-api`, 301);
    }
    if (path === '/admin') {
      return Response.redirect(`${url.origin}/admin/dashboard`, 301);
    }

    try {
      // -------------------------------------------------------------
      // 1. HEALTH & SYSTEM CHECK
      // -------------------------------------------------------------
      if (path === '/api/health') {
        return jsonResponse({
          status: 'ok',
          service: 'TopMCQBD Cloudflare Fullstack Worker & Pages Engine',
          runtime: 'Cloudflare V8 Edge Isolate (Native Assets + MongoDB TCP)',
          version: '2.0.0',
          assetsConfigured: Boolean(env.ASSETS),
          d1Configured: Boolean(env.DB),
          database: 'MongoDB Atlas SRV (IPv4 Gateway)',
          timestamp: new Date().toISOString(),
        });
      }

      // -------------------------------------------------------------
      // 2. KEEP-ALIVE & ALL-IN-ONE CONNECTION MONITOR
      // -------------------------------------------------------------
      if (path === '/api/db-mongodb-active-connection') {
        const startTime = Date.now();
        const clusterKeys = ['paid', 'free', 'subjective', 'live_exam', 'written', 'question_bank'];

        const pingPromises = clusterKeys.map(async (key) => {
          const cfg = resolveCluster(key, env);
          const t0 = Date.now();
          try {
            const client = await getClient(cfg);
            try {
              const db = client.db(cfg.dbName);
              const pingRes = await db.command({ ping: 1 });
              const latencyMs = Date.now() - t0;
              const cols = await db.listCollections().toArray();
              return {
                id: key,
                name: cfg.name,
                cluster: cfg.dbName,
                status: 'connected',
                connected: pingRes.ok === 1,
                latencyMs,
                collections: cols.map((c) => c.name),
                runtime: 'Cloudflare Edge (Direct TCP)'
              };
            } finally {
              await client.close().catch(() => {});
            }
          } catch (err) {
            return {
              id: key,
              name: cfg.name,
              cluster: cfg.dbName,
              status: 'error',
              connected: false,
              latencyMs: Date.now() - t0,
              error: err.message
            };
          }
        });

        // Add D1 ping
        const d1Promise = (async () => {
          const t0 = Date.now();
          if (!env.DB) {
            try {
              const res = await fetch('https://topmcqbd-web-test-api.mosabber480.workers.dev/api/db-test/d1');
              if (res.ok) {
                const wData = await res.json();
                return {
                  id: 'd1',
                  name: 'Cloudflare D1 SQL DB',
                  cluster: 'topmcqbd-db',
                  status: 'connected',
                  connected: true,
                  latencyMs: wData.latencyMs || (Date.now() - t0),
                  totalConfigs: wData.totalItems || 3
                };
              }
            } catch (err) {}
            return {
              id: 'd1',
              name: 'Cloudflare D1 SQL DB',
              cluster: 'topmcqbd-db',
              status: 'unbound',
              connected: false,
              latencyMs: 0,
              message: 'D1 binding (env.DB) is not attached'
            };
          }
          try {
            await ensureD1Table(env.DB);
            const row = await env.DB.prepare('SELECT count(*) as count FROM app_configs').first();
            return {
              id: 'd1',
              name: 'Cloudflare D1 SQL DB',
              cluster: 'topmcqbd-db',
              status: 'connected',
              connected: true,
              latencyMs: Date.now() - t0,
              totalConfigs: row?.count || 0
            };
          } catch (e) {
            return {
              id: 'd1',
              name: 'Cloudflare D1 SQL DB',
              cluster: 'topmcqbd-db',
              status: 'error',
              connected: false,
              latencyMs: Date.now() - t0,
              error: e.message
            };
          }
        })();

        const [results, d1Result] = await Promise.all([
          Promise.all(pingPromises),
          d1Promise
        ]);

        const allResults = [...results, d1Result];
        const activeCount = allResults.filter((r) => r.connected).length;

        return jsonResponse({
          success: true,
          title: 'TopMCQBD All-in-One Edge Active Connection & Keep-Alive',
          timestamp: new Date().toISOString(),
          totalDatabases: allResults.length,
          activeDatabases: activeCount,
          overallLatencyMs: Date.now() - startTime,
          allConnected: activeCount === allResults.length,
          databases: allResults
        });
      }

      // -------------------------------------------------------------
      // 3. CLOUDFLARE D1 SQL DATABASE TEST (/api/db-test/d1)
      // -------------------------------------------------------------
      if (path === '/api/db-test/d1') {
        if (!env.DB) {
          try {
            const workerUrl = 'https://topmcqbd-web-test-api.mosabber480.workers.dev/api/db-test/d1' + (url.search || '');
            const workerRes = await fetch(workerUrl, {
              method: request.method,
              headers: {
                'Content-Type': request.headers.get('Content-Type') || 'application/json',
                Accept: 'application/json',
              },
              body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
            });
            const data = await workerRes.json();
            return jsonResponse(data, workerRes.status);
          } catch (proxyErr) {
            return jsonResponse({
              success: false,
              connected: false,
              message: 'Cloudflare D1 binding (env.DB) is not attached to this isolate and worker fallback failed.',
              runtime: 'Cloudflare Edge',
              timestamp: new Date().toISOString()
            }, 200);
          }
        }

        await ensureD1Table(env.DB);

        // GET: Read d1 test records
        if (request.method === 'GET') {
          const t0 = Date.now();
          const row = await env.DB.prepare("SELECT data FROM app_configs WHERE key = 'db-d1-test' LIMIT 1").first();
          const latencyMs = Date.now() - t0;
          let items = [];
          if (row && row.data) {
            try { items = JSON.parse(row.data); } catch (e) {}
          }
          if (!Array.isArray(items) || items.length === 0) {
            items = DEFAULT_CONFIG_SEEDS['db-d1-test'];
          }

          return jsonResponse({
            success: true,
            cluster: 'topmcqbd-db (Cloudflare D1)',
            collection: 'app_configs (key: db-d1-test)',
            connected: true,
            latencyMs,
            totalItems: items.length,
            items,
            runtime: 'Cloudflare D1 SQL Edge',
            timestamp: new Date().toISOString()
          });
        }

        // POST: Add new d1 test record
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const text = (body.text || '').trim();
          if (!text) {
            return jsonResponse({ success: false, error: 'টেক্সট ফিল্ড খালি রাখা যাবে না।' }, 400);
          }

          const row = await env.DB.prepare("SELECT data FROM app_configs WHERE key = 'db-d1-test' LIMIT 1").first();
          let items = [];
          if (row && row.data) {
            try { items = JSON.parse(row.data); } catch (e) {}
          }
          if (!Array.isArray(items)) items = [];

          const newDoc = {
            id: 'd1_' + Date.now(),
            text,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          items.unshift(newDoc);

          await setD1Config(env, 'db-d1-test', items);
          return jsonResponse({
            success: true,
            message: 'ডাটা সফলভাবে D1 SQL ডাটাবেজে যুক্ত হয়েছে।',
            item: newDoc
          }, 201);
        }

        // PUT: Update d1 test record
        if (request.method === 'PUT') {
          const body = await request.json().catch(() => ({}));
          const id = body.id || body._id;
          const text = (body.text || '').trim();
          if (!id || !text) {
            return jsonResponse({ success: false, error: 'ID এবং টেক্সট উভয়েই আবশ্যক।' }, 400);
          }

          const row = await env.DB.prepare("SELECT data FROM app_configs WHERE key = 'db-d1-test' LIMIT 1").first();
          let items = [];
          if (row && row.data) {
            try { items = JSON.parse(row.data); } catch (e) {}
          }

          const idx = items.findIndex((it) => it.id === id);
          if (idx === -1) {
            return jsonResponse({ success: false, error: 'কোনো তথ্য পাওয়া যায়নি।' }, 404);
          }

          items[idx].text = text;
          items[idx].updatedAt = new Date().toISOString();
          await setD1Config(env, 'db-d1-test', items);

          return jsonResponse({ success: true, message: 'ডাটা সফলভাবে আপডেট করা হয়েছে।', updatedId: id });
        }

        // DELETE: Remove d1 test record
        if (request.method === 'DELETE') {
          let id = url.searchParams.get('id');
          if (!id) {
            const body = await request.json().catch(() => ({}));
            id = body?.id;
          }
          if (!id) {
            return jsonResponse({ success: false, error: 'মুছে ফেলার জন্য ID প্রদান করুন।' }, 400);
          }

          const row = await env.DB.prepare("SELECT data FROM app_configs WHERE key = 'db-d1-test' LIMIT 1").first();
          let items = [];
          if (row && row.data) {
            try { items = JSON.parse(row.data); } catch (e) {}
          }

          const filtered = items.filter((it) => it.id !== id);
          if (filtered.length === items.length) {
            return jsonResponse({ success: false, error: 'মুছে ফেলার জন্য ডাটা পাওয়া যায়নি।' }, 404);
          }

          await setD1Config(env, 'db-d1-test', filtered);
          return jsonResponse({ success: true, message: 'ডাটা সফলভাবে মুছে ফেলা হয়েছে।', deletedId: id });
        }
      }

      // -------------------------------------------------------------
      // 4. DYNAMIC APPLICATION CONFIG APIS (D1 / FALLBACK)
      // -------------------------------------------------------------
      if (path === '/api/layout-config') {
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          await setD1Config(env, 'layout-config', body);
          return jsonResponse({ success: true, message: 'Layout config updated' });
        }
        const data = await getD1Config(env, 'layout-config', DEFAULT_LAYOUT);
        return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
      }

      if (path === '/api/home-config') {
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          await setD1Config(env, 'home-config', body);
          return jsonResponse({ success: true, message: 'Home config updated' });
        }
        const data = await getD1Config(env, 'home-config', DEFAULT_HOME_CONFIG);
        return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
      }

      if (path === '/api/sidebar-config') {
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          await setD1Config(env, 'sidebar-config', body);
          return jsonResponse({ success: true, message: 'Sidebar config updated' });
        }
        const data = await getD1Config(env, 'sidebar-config', DEFAULT_SIDEBAR_CONFIG);
        return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
      }

      if (path === '/api/packages-data') {
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          await setD1Config(env, 'packages-data', body);
          return jsonResponse({ success: true, message: 'Packages updated' });
        }
        const data = await getD1Config(env, 'packages-data', DEFAULT_CONFIG_SEEDS['packages-data']);
        return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
      }

      if (path === '/api/faq-data') {
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          await setD1Config(env, 'faq-data', body);
          return jsonResponse({ success: true, message: 'FAQ updated' });
        }
        const data = await getD1Config(env, 'faq-data', DEFAULT_CONFIG_SEEDS['faq-data']);
        return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
      }

      if (path === '/api/about-data') {
        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          await setD1Config(env, 'about-data', body);
          return jsonResponse({ success: true, message: 'About data updated' });
        }
        const data = await getD1Config(env, 'about-data', DEFAULT_CONFIG_SEEDS['about-data']);
        return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
      }

      if (path === '/api/policy' || path === '/api/policy/get' || path === '/api/policy/save') {
        if (request.method === 'POST' || path === '/api/policy/save') {
          const body = await request.json().catch(() => ({}));
          await setD1Config(env, 'policy-config', body);
          return jsonResponse({ success: true, message: 'Policy saved' });
        }
        const data = await getD1Config(env, 'policy-config', DEFAULT_POLICY);
        return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
      }

      if (path === '/api/common-config') {
        const layout = await getD1Config(env, 'layout-config', DEFAULT_LAYOUT);
        return jsonResponse({ layout }, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
      }

      // -------------------------------------------------------------
      // 5. MONGODB MULTI-CLUSTER PING & CRUD HANDLER
      // (/api/db-check, /api/db-test/[cluster], /api/db-pages-api)
      // -------------------------------------------------------------
      if (path === '/api/db-check' || path.startsWith('/api/db-test/') || path === '/api/db-pages-api') {
        let clusterParam = path.replace(/^\/api\/db-test\/?/, '').trim();
        if (path === '/api/db-pages-api' || path === '/api/db-check' || !clusterParam) {
          clusterParam = url.searchParams.get('cluster') || 'paid';
        }

        const clusterInfo = resolveCluster(clusterParam, env);
        const client = await getClient(clusterInfo);

        try {
          const db = client.db(clusterInfo.dbName);
          const collection = db.collection(clusterInfo.coll);

          // GET: Ping + List collections + Fetch documents
          if (request.method === 'GET') {
            const t0 = Date.now();
            const pingResult = await db.command({ ping: 1 });
            const latencyMs = Date.now() - t0;
            const collections = await db.listCollections().toArray();
            const collectionNames = collections.map((c) => c.name);

            const items = await collection
              .find({})
              .sort({ _id: -1 })
              .limit(100)
              .toArray();

            const formattedItems = items.map((doc) => ({
              id: doc._id.toString(),
              title: doc.title || '',
              category: doc.category || 'Edge Worker',
              text: doc.text || '',
              createdAt: doc.createdAt || null,
              updatedAt: doc.updatedAt || null,
            }));

            return jsonResponse({
              success: pingResult.ok === 1,
              cluster: clusterInfo.dbName,
              collection: clusterInfo.coll,
              connected: true,
              latencyMs,
              collections: collectionNames,
              totalItems: formattedItems.length,
              items: formattedItems,
              runtime: 'Cloudflare Edge (Direct MongoDB TCP)',
              timestamp: new Date().toISOString(),
            });
          }

          // POST: Insert new test document
          if (request.method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const text = (body.text || '').trim();
            const title = (body.title || '').trim();
            const category = (body.category || 'Edge Worker').trim();

            if (!text) {
              return jsonResponse({ success: false, error: 'টেক্সট ফিল্ড খালি রাখা যাবে না।' }, 400);
            }

            const newDoc = {
              title: title || (text.length > 25 ? text.slice(0, 25) + '...' : text),
              category,
              text,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const insertRes = await collection.insertOne(newDoc);
            return jsonResponse({
              success: true,
              message: `ডাটা সফলভাবে ${clusterInfo.coll} কালেকশনে যুক্ত হয়েছে।`,
              item: { id: insertRes.insertedId.toString(), ...newDoc },
            }, 201);
          }

          // PUT: Edit existing test document
          if (request.method === 'PUT') {
            const body = await request.json().catch(() => ({}));
            const id = body.id || body._id;
            const text = (body.text || '').trim();
            const title = (body.title || '').trim();
            const category = (body.category || '').trim();

            if (!id || !text) {
              return jsonResponse({ success: false, error: 'ID এবং টেক্সট উভয়েই আবশ্যক।' }, 400);
            }

            const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
            const updateDoc = { text, updatedAt: new Date().toISOString() };
            if (title) updateDoc.title = title;
            if (category) updateDoc.category = category;

            const updateRes = await collection.updateOne(filter, { $set: updateDoc });
            if (updateRes.matchedCount === 0) {
              return jsonResponse({ success: false, error: 'কোনো তথ্য পাওয়া যায়নি।' }, 404);
            }

            return jsonResponse({
              success: true,
              message: 'ডাটা সফলভাবে আপডেট করা হয়েছে।',
              updatedId: id,
            });
          }

          // DELETE: Delete test document
          if (request.method === 'DELETE') {
            let id = url.searchParams.get('id');
            if (!id) {
              const body = await request.json().catch(() => ({}));
              id = body?.id || body?._id;
            }

            if (!id) {
              return jsonResponse({ success: false, error: 'মুছে ফেলার জন্য ID প্রদান করুন।' }, 400);
            }

            const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
            const delRes = await collection.deleteOne(filter);
            if (delRes.deletedCount === 0) {
              return jsonResponse({ success: false, error: 'মুছে ফেলার জন্য ডাটা পাওয়া যায়নি।' }, 404);
            }

            return jsonResponse({
              success: true,
              message: 'ডাটা সফলভাবে মুছে ফেলা হয়েছে।',
              deletedId: id,
            });
          }
        } finally {
          await client.close().catch(() => {});
        }
      }

      // -------------------------------------------------------------
      // 6. QUESTIONS & CATEGORIES APIS
      // -------------------------------------------------------------
      if (path === '/api/questions' || path === '/api/free-mcqs') {
        const cfg = resolveCluster('free', env);
        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const page = parseInt(url.searchParams.get('page') || '1', 10);

        const client = await getClient(cfg.uri);
        try {
          const db = client.db(cfg.dbName);
          const collection = db.collection('questions');

          const filter = category ? { category } : {};
          const total = await collection.countDocuments(filter);
          const questions = await collection
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

          return jsonResponse({
            success: true,
            total,
            page,
            count: questions.length,
            data: questions,
            source: 'Cloudflare Edge Worker API',
          }, 200, {
            'Cache-Control': 'public, max-age=60, s-maxage=300',
          });
        } finally {
          await client.close().catch(() => {});
        }
      }

      if (path === '/api/categories') {
        const cfg = resolveCluster('free', env);
        const client = await getClient(cfg.uri);
        try {
          const db = client.db(cfg.dbName);
          const categories = await db.collection('questions').distinct('category');

          return jsonResponse({
            success: true,
            categories,
            source: 'Cloudflare Edge Worker API',
          }, 200, {
            'Cache-Control': 'public, max-age=300, s-maxage=600',
          });
        } finally {
          await client.close().catch(() => {});
        }
      }

      // Unmatched /api/ routes
      if (path.startsWith('/api/')) {
        return jsonResponse({ error: 'Endpoint not found on Cloudflare Edge API' }, 404);
      }

      // -------------------------------------------------------------
      // 7. WEBSITE FRONTEND & STATIC ASSETS HANDLER
      // -------------------------------------------------------------
      if (env.ASSETS) {
        // 1. Try serving exact asset
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          return assetResponse;
        }

        // 2. Smart Clean URL Resolution (e.g. /questions -> /questions.html)
        if (!path.includes('.')) {
          const cleanPath = path.replace(/\/$/, '');
          
          // (A) Try /route.html
          const htmlUrl = new URL(request.url);
          htmlUrl.pathname = `${cleanPath}.html`;
          const htmlRes = await env.ASSETS.fetch(new Request(htmlUrl.toString(), request));
          if (htmlRes.status === 200) {
            return htmlRes;
          }

          // (B) Try /route/index.html
          htmlUrl.pathname = `${cleanPath}/index.html`;
          const subDirRes = await env.ASSETS.fetch(new Request(htmlUrl.toString(), request));
          if (subDirRes.status === 200) {
            return subDirRes;
          }
        }

        return assetResponse;
      }

      // If Native Assets not configured, render Diagnostic Portal
      return htmlResponse(renderPortalHtml(env, url));

    } catch (err) {
      console.error('[Worker Runtime Error]:', err);
      return jsonResponse({
        success: false,
        error: err.message || 'Internal Edge Runtime Error',
      }, 500);
    }
  },
};
