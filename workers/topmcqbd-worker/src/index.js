/**
 * TopMCQBD Cloudflare Fullstack Worker & Backup API
 * 
 * Features:
 * 1. Serves the Complete TopMCQBD Website UI (HTML, CSS, JS, Images, Fonts) via Cloudflare Native Assets
 * 2. High-Performance Direct MongoDB Atlas Connectivity (TCP Socket, Edge-Optimized, Connection Pooling)
 * 3. Dynamic Layout and Configs Proxied Directly from Cloudflare Pages D1
 * 4. Smart Route Fallback (auto-resolves Clean URLs like /questions to /questions.html)
 * 5. Rich Diagnostic Portal for Edge Health Checks
 * 6. Full CORS Support for seamless Frontend Integration
 */

import { MongoClient, ObjectId } from 'mongodb';

// Worker global client cache across isolate lifetime
const mongoClients = {};

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

/**
 * Get connected MongoClient instance with Serverless Edge optimizations
 */
async function getClient(uri) {
  if (!uri) throw new Error('MongoDB URI is not configured');

  const isSrv = uri.startsWith('mongodb+srv://');
  const clientOptions = {
    tls: true,
    family: 4,               // Enforce IPv4 to avoid Edge IPv6 DNS latency
    maxPoolSize: 1,         // Single lightweight socket per Edge isolate
    minPoolSize: 0,         // Clean up idle sockets automatically
    connectTimeoutMS: 8000,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 12000,
  };

  if (!isSrv) {
    clientOptions.directConnection = true;
  }

  const client = new MongoClient(uri, clientOptions);
  await client.connect();
  return client;
}

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

/**
 * Fallback Portal UI when static assets are initializing
 */
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
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
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
    h1 {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    p.subtitle {
      color: var(--text-muted);
      font-size: 16px;
    }
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
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: rgba(56, 189, 248, 0.4);
    }
    .card-title {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-value {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      margin-top: 24px;
    }
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
    .btn-primary {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.4);
    }
    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 13px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">
        <span class="dot"></span> Cloudflare Edge Worker Live
      </div>
      <h1>TopMCQBD — Fullstack Worker Engine</h1>
      <p class="subtitle">Cloudflare V8 Edge Isolate + Native Assets + Direct MongoDB Atlas TCP</p>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Runtime Platform</div>
        <div class="card-value">Cloudflare Workers</div>
      </div>
      <div class="card">
        <div class="card-title">Edge Node.js Compat</div>
        <div class="card-value" style="color: #34d399;">Active (v2026-09-08)</div>
      </div>
      <div class="card">
        <div class="card-title">Database Engine</div>
        <div class="card-value" style="color: var(--accent);">Direct Shard TCP</div>
      </div>
      <div class="card">
        <div class="card-title">Native Assets</div>
        <div class="card-value">${env.ASSETS ? '✅ Connected (1,344 files)' : '⚡ Initializing'}</div>
      </div>
    </div>

    <div class="actions">
      <a href="https://topmcqbd.pages.dev" class="btn btn-primary" target="_blank">
        🌐 Open Main Website (Pages)
      </a>
      <a href="/api/db-check" class="btn btn-secondary">
        ⚡ Test MongoDB Latency
      </a>
      <a href="/api/questions" class="btn btn-secondary">
        📚 Fetch Questions API
      </a>
      <a href="/api/health" class="btn btn-secondary">
        🩺 API Health Check
      </a>
    </div>

    <div class="footer">
      © 2026 TopMCQBD. Dual-Cloud Architecture (Cloudflare Pages + Cloudflare Workers + Render).
    </div>
  </div>
</body>
</html>`;
}

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
      // API ROUTES (Backend Handlers)
      // -------------------------------------------------------------

      // (A) Health Check API
      if (path === '/api/health') {
        return jsonResponse({
          status: 'ok',
          service: 'TopMCQBD Cloudflare Fullstack Worker & Backup API',
          runtime: 'Cloudflare Workers (Edge V8 Isolate with Native Assets)',
          version: '2.0.0',
          assetsConfigured: Boolean(env.ASSETS),
          database: 'MongoDB Atlas Shards (TCP Gateway)',
          timestamp: new Date().toISOString(),
        });
      }

      // (B) Layout Config API (Proxied from Cloudflare Pages D1)
      if (path === '/api/layout-config') {
        try {
          const res = await fetch('https://topmcqbd.pages.dev/api/layout-config', {
            headers: { 'User-Agent': 'TopMCQBD-Worker-Proxy' },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
          }
        } catch (e) {}
        return jsonResponse(DEFAULT_LAYOUT, 200);
      }

      // (C) Common Config API (Proxied from Cloudflare Pages D1)
      if (path === '/api/common-config') {
        try {
          const res = await fetch(`https://topmcqbd.pages.dev/api/common-config${url.search}`, {
            headers: { 'User-Agent': 'TopMCQBD-Worker-Proxy' },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
          }
        } catch (e) {}
        return jsonResponse({}, 200);
      }

      // (D) Home Config API (Proxied from Cloudflare Pages D1)
      if (path === '/api/home-config') {
        try {
          const res = await fetch('https://topmcqbd.pages.dev/api/home-config', {
            headers: { 'User-Agent': 'TopMCQBD-Worker-Proxy' },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
          }
        } catch (e) {}
        return jsonResponse({}, 200);
      }

      // (E) Sidebar Config API (Proxied from Cloudflare Pages D1)
      if (path === '/api/sidebar-config') {
        try {
          const res = await fetch('https://topmcqbd.pages.dev/api/sidebar-config', {
            headers: { 'User-Agent': 'TopMCQBD-Worker-Proxy' },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
          }
        } catch (e) {}
        return jsonResponse({}, 200);
      }

      // (F) Packages Data API (Proxied from Cloudflare Pages D1)
      if (path === '/api/packages-data') {
        try {
          const res = await fetch('https://topmcqbd.pages.dev/api/packages-data', {
            headers: { 'User-Agent': 'TopMCQBD-Worker-Proxy' },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
          }
        } catch (e) {}
        return jsonResponse([], 200);
      }

      // (G) FAQ Data API (Proxied from Cloudflare Pages D1)
      if (path === '/api/faq-data') {
        try {
          const res = await fetch('https://topmcqbd.pages.dev/api/faq-data', {
            headers: { 'User-Agent': 'TopMCQBD-Worker-Proxy' },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
          }
        } catch (e) {}
        return jsonResponse([], 200);
      }

      // (H) About Data API (Proxied from Cloudflare Pages D1)
      if (path === '/api/about-data') {
        try {
          const res = await fetch('https://topmcqbd.pages.dev/api/about-data', {
            headers: { 'User-Agent': 'TopMCQBD-Worker-Proxy' },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
          }
        } catch (e) {}
        return jsonResponse({}, 200);
      }

      // (I) Policy API (Proxied from Cloudflare Pages D1)
      if (path === '/api/policy' || path === '/api/policy/get') {
        try {
          const res = await fetch('https://topmcqbd.pages.dev/api/policy', {
            headers: { 'User-Agent': 'TopMCQBD-Worker-Proxy' },
          });
          if (res.ok) {
            const data = await res.json();
            return jsonResponse(data, 200, { 'Cache-Control': 'public, max-age=60, s-maxage=300' });
          }
        } catch (e) {}
        return jsonResponse({}, 200);
      }

      // (J) Cloudflare D1 Status Check (Worker D1 is disabled; Pages D1 is primary)
      if (path === '/api/db-test/d1') {
        return jsonResponse({
          success: true,
          message: 'D1 is managed exclusively in Cloudflare Pages (https://topmcqbd.pages.dev). Cloudflare Worker D1 is disabled.',
          pagesUrl: 'https://topmcqbd.pages.dev/api/db-test/d1',
          runtime: 'Cloudflare Worker',
          timestamp: new Date().toISOString(),
        });
      }

      // (K) MongoDB Multi-Cluster Ping & CRUD Handler
      if (path === '/api/db-check' || path.startsWith('/api/db-test/') || path === '/api/db-pages-api') {
        let clusterMatch = path.replace(/^\/api\/db-test\/?/, '').trim();
        if (path === '/api/db-pages-api' || path === '/api/db-check') {
          clusterMatch = url.searchParams.get('cluster') || 'paid';
        }
        const clusterKey = (clusterMatch || url.searchParams.get('cluster') || 'paid').toLowerCase();

        let targetUri = env.MONGODB_URI_PAID;
        let targetDb = env.MONGODB_DB_PAID || 'TopMCQBD_DB';
        let targetColl = 'db-paid-test';

        if (clusterKey === 'free') {
          targetUri = env.MONGODB_URI_FREE || targetUri;
          targetDb = env.MONGODB_DB_FREE || 'TopMCQBD_DB_Free';
          targetColl = 'db-free-test';
        } else if (clusterKey === 'subjective') {
          targetUri = env.MONGODB_URI_SUBJECTIVE || targetUri;
          targetDb = env.MONGODB_DB_SUBJECTIVE || 'TopMCQBD_DB_Subjective';
          targetColl = 'db-subjective-test';
        } else if (clusterKey === 'live-exam' || clusterKey === 'live_exam') {
          targetUri = env.MONGODB_URI_LIVE_EXAM || targetUri;
          targetDb = env.MONGODB_DB_LIVE_EXAM || 'TopMCQBD_DB_Live_Exam';
          targetColl = 'db-live-exam-test';
        } else if (clusterKey === 'written') {
          targetUri = env.MONGODB_URI_WRITTEN || targetUri;
          targetDb = env.MONGODB_DB_WRITTEN || 'TopMCQBD_DB_written';
          targetColl = 'db-written-test';
        } else if (clusterKey === 'question-bank' || clusterKey === 'question_bank') {
          targetUri = env.MONGODB_URI_QUESTION_BANK || targetUri;
          targetDb = env.MONGODB_DB_QUESTION_BANK || 'TopMCQBD_DB_Question_Bank';
          targetColl = 'db-question-bank-test';
        } else if (clusterKey === 'paid') {
          targetUri = env.MONGODB_URI_PAID || targetUri;
          targetDb = env.MONGODB_DB_PAID || 'TopMCQBD_DB';
          targetColl = 'db-paid-test';
        }

        if (!targetUri) {
          return jsonResponse({
            success: false,
            message: `MONGODB_URI for ${clusterKey} is not configured in Worker variables`,
          }, 500);
        }

        const client = await getClient(targetUri);
        try {
          const db = client.db(targetDb);
          const collection = db.collection(targetColl);

          // GET: Ping + List collections + Fetch documents
          if (request.method === 'GET') {
            const t0 = Date.now();
            const pingResult = await db.command({ ping: 1 });
            const latencyMs = Date.now() - t0;
            const collections = await db.listCollections().toArray();
            const collectionNames = collections.map((c) => c.name);

            const items = await collection
              .find({})
              .sort({ createdAt: -1 })
              .limit(100)
              .toArray();

            const formattedItems = items.map((doc) => ({
              id: doc._id.toString(),
              title: doc.title || '',
              category: doc.category || 'Worker Edge',
              text: doc.text || '',
              createdAt: doc.createdAt || null,
              updatedAt: doc.updatedAt || null,
            }));

            return jsonResponse({
              success: pingResult.ok === 1,
              cluster: targetDb,
              collection: targetColl,
              connected: true,
              latencyMs,
              collections: collectionNames,
              totalItems: formattedItems.length,
              items: formattedItems,
              runtime: 'Cloudflare Worker (V8 Isolate)',
              timestamp: new Date().toISOString(),
            });
          }

          // POST: Insert new test document
          if (request.method === 'POST') {
            const body = await request.json().catch(() => ({}));
            const text = (body.text || '').trim();
            const title = (body.title || '').trim();
            const category = (body.category || 'Worker Edge').trim();

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
              message: `ডাটা সফলভাবে ${targetColl} কালেকশনে যুক্ত হয়েছে।`,
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

      // (L) Questions API (Direct MongoDB Querying)
      if (path === '/api/questions' || path === '/api/free-mcqs') {
        const uri = env.MONGODB_URI_FREE || env.MONGODB_URI_PAID;
        const dbName = env.MONGODB_DB_FREE || 'TopMCQBD_DB_Free';

        if (!uri) {
          return jsonResponse({ success: false, message: 'Database URI missing' }, 500);
        }

        const category = url.searchParams.get('category');
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const page = parseInt(url.searchParams.get('page') || '1', 10);

        const client = await getClient(uri);
        try {
          const db = client.db(dbName);
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
            source: 'Cloudflare Worker Backup API',
          }, 200, {
            'Cache-Control': 'public, max-age=60, s-maxage=300',
          });
        } finally {
          await client.close().catch(() => {});
        }
      }

      // (M) Categories API
      if (path === '/api/categories') {
        const uri = env.MONGODB_URI_FREE || env.MONGODB_URI_PAID;
        const dbName = env.MONGODB_DB_FREE || 'TopMCQBD_DB_Free';

        const client = await getClient(uri);
        try {
          const db = client.db(dbName);
          const categories = await db.collection('questions').distinct('category');

          return jsonResponse({
            success: true,
            categories,
            source: 'Cloudflare Worker Backup API',
          }, 200, {
            'Cache-Control': 'public, max-age=300, s-maxage=600',
          });
        } finally {
          await client.close().catch(() => {});
        }
      }

      // If an API route is unmatched
      if (path.startsWith('/api/')) {
        return jsonResponse({ error: 'Endpoint not found on Backup Worker API' }, 404);
      }

      // -------------------------------------------------------------
      // WEBSITE FRONTEND & STATIC ASSETS HANDLER
      // -------------------------------------------------------------

      // Serve Full Website UI from Native Static Assets
      if (env.ASSETS) {
        // Handle root / explicitly
        if (path === '/' || path === '') {
          const indexUrl = new URL('/index.html', request.url);
          const indexRes = await env.ASSETS.fetch(new Request(indexUrl.toString(), request));
          if (indexRes.status !== 404) return indexRes;
        }

        // 1. Try serving the exact asset requested
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          return assetResponse;
        }

        // 2. Smart Clean URL Resolution (e.g. /about-us -> /about-us.html)
        if (!path.includes('.')) {
          const cleanPath = path.replace(/\/$/, '');
          
          // (A) Try /route.html
          const htmlUrl = new URL(request.url);
          htmlUrl.pathname = `${cleanPath}.html`;
          const htmlRes = await env.ASSETS.fetch(new Request(htmlUrl.toString(), request));
          if (htmlRes.status !== 404) {
            return htmlRes;
          }

          // (B) Try /route/index.html
          htmlUrl.pathname = `${cleanPath}/index.html`;
          const subDirRes = await env.ASSETS.fetch(new Request(htmlUrl.toString(), request));
          if (subDirRes.status !== 404) {
            return subDirRes;
          }

          // (C) Fallback to /index.html (Single-Page Application Fallback)
          htmlUrl.pathname = '/index.html';
          const rootRes = await env.ASSETS.fetch(new Request(htmlUrl.toString(), request));
          if (rootRes.status !== 404) {
            return rootRes;
          }
        }

        return assetResponse;
      }

      // If Native Assets are not yet connected, render the beautiful Edge Portal UI
      return htmlResponse(renderPortalHtml(env, url));

    } catch (err) {
      console.error('[Worker Runtime Error]:', err);
      return jsonResponse({
        success: false,
        error: err.message || 'Internal Worker Runtime Error',
      }, 500);
    }
  },
};
