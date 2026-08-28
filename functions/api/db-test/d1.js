/**
 * Cloudflare Pages Function: /api/db-test/d1
 * Cloudflare D1 Row CRUD for key = "db-d1-test" and Auto-Seeder for all App Configs
 */

function jsonResponse(data, status = 200) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
  };

  return new Response(JSON.stringify(data), { status, headers });
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}

// Default initial payloads for all 8 JSON config rows + 1 test row
const DEFAULT_CONFIG_SEEDS = {
  'db-d1-test': [
    {
      id: 'd1_demo_1',
      text: 'TopMCQBD D1 Cloudflare Edge Database Test Record',
      createdAt: 'Today, 01:00:00 AM',
      updatedAt: 'Today, 01:00:00 AM'
    },
    {
      id: 'd1_demo_2',
      text: 'Serverless Edge SQL CRUD Operations Active',
      createdAt: 'Today, 01:05:00 AM',
      updatedAt: 'Today, 01:05:00 AM'
    }
  ],
  'about-data': {
    title: 'আমাদের সম্পর্কে (About Us)',
    subtitle: 'TopMCQBD - আপনার অনলাইন প্রস্তুতিকে সহজ ও নিখুঁত করতে আমরা সবসময় পাশে আছি',
    whatIsTitle: 'TopMCQBD কী?',
    whatIsDesc: 'TopMCQBD একটি আধুনিক, সহজ এবং বিষয়ভিত্তিক অনলাইন কুইজ ও প্রস্তুতিমূলক প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ, বিশ্ববিদ্যালয় ভর্তি পরীক্ষাসহ যেকোনো প্রতিযোগিতামূলক পরীক্ষার জন্য নিজেকে সঠিকভাবে প্রস্তুত করতে TopMCQBD সাহায্য করে।',
    whyBestTitle: 'কেন TopMCQBD সেরা?',
    features: [
      'টপিকভিত্তিক মডেল টেস্ট এবং লাইভ টাইমার রিয়েল এক্সাম এক্সপেরিয়েন্স দেয়।',
      'প্রতিটি প্রশ্নের সাথে রয়েছে নির্ভুল ও বিস্তৃত ব্যাখ্যামূলক সমাধান।',
      'তাত্ক্ষণিক রেজাল্ট এবং নিজের অবস্থান যাচাই করার সুবিধা।',
      'নতুন নতুন কুইজ ও প্রশ্ন নিয়মিত আপডেট করা হয়।'
    ]
  },
  'faq-data': [
    {
      q: 'TopMCQBD কী এবং কীভাবে কাজ করে?',
      a: 'TopMCQBD একটি স্বয়ংসম্পূর্ণ অনলাইন এমসিকিউ ও মডেল টেস্ট প্ল্যাটফর্ম। এখানে বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য অধ্যায়ভিত্তিক ও বিষয়ভিত্তিক নির্ভুল প্রশ্ন ও ব্যাখ্যা অনুশীলন করা যায়।'
    },
    {
      q: 'আমি কীভাবে প্রিমিয়াম প্যাকেজ সাবস্ক্রাইব করব?',
      a: 'প্যাকেজেস পেজে গিয়ে আপনার পছন্দের প্যাকেজের নিচে "এই প্যাকেজটি নিন" বাটনে ক্লিক করুন। এরপর বিকাশ বা নগদ নম্বরে সেন্ড মানি করে ট্রানজেকশন আইডি ও নম্বরটি দিয়ে ফর্ম জমা দিন। অ্যাডমিন যাচাই করে প্যাকেজ চালু করে দেবেন।'
    },
    {
      q: 'কুইজে কি নেগেটিভ মার্কিং আছে?',
      a: 'হ্যাঁ, প্রতিটি ভুল উত্তরের জন্য ০.৫ নম্বর কাটা যাবে। তবে আপনি "আগে পড়ুন" (Read Mode) অপশন চালু করে পরীক্ষা দেওয়ার আগে সব প্রশ্নের সঠিক উত্তর ও ব্যাখ্যা এক নজরে পড়ে নিতে পারবেন।'
    },
    {
      q: 'পাসওয়ার্ড ভুলে গেলে কী করব?',
      a: 'লগইন পেজে "পাসওয়ার্ড ভুলে গেছেন?" লিংকে ক্লিক করে আপনার নিবন্ধিত ইমেইল দিন। আপনার ইমেইলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হবে যার মাধ্যমে নতুন পাসওয়ার্ড সেট করতে পারবেন।'
    },
    {
      q: 'সাবস্ক্রিপশনের মেয়াদ কি একাধিকবার যোগ করা যায়?',
      a: 'হ্যাঁ! আপনার একটি সক্রিয় প্যাকেজ চলাকালীন নতুন কোনো প্যাকেজ রিকোয়েস্ট অনুমোদন পেলে আগের মেয়াদের সাথে নতুন মেয়াদ স্বয়ংক্রিয়ভাবে যুক্ত হয়ে যাবে।'
    }
  ],
  'packages-data': [
    {
      id: '1_month',
      name: '১ মাস প্রিমিয়াম অ্যাক্সেস',
      price: '৯৯ টাকা',
      duration: '৩০ দিন মোদ',
      popular: false,
      features: [
        'সকল বিষয় ও অধ্যায়ের আনলিমিটেড কুইজ',
        'সম্পূর্ণ ব্যাখ্যামূলক সমাধান',
        'লাইভ মডেল টেস্ট',
        'আগে পড়ুন (Read Mode) অপশন'
      ]
    },
    {
      id: '3_months',
      name: '৩ মাস প্রিমিয়াম অ্যাক্সেস',
      price: '২৪৯ টাকা',
      duration: '৯০ দিন মোদ',
      popular: true,
      features: [
        'সকল বিষয় ও অধ্যায়ের আনলিমিটেড কুইজ',
        'সম্পূর্ণ ব্যাখ্যামূলক সমাধান',
        'লাইভ মডেল টেস্ট',
        'আগে পড়ুন (Read Mode) অপশন',
        'বিশেষ ডিসকাউন্ট অফার'
      ]
    },
    {
      id: '6_months',
      name: '৬ মাস প্রিমিয়াম অ্যাক্সেস',
      price: '৪৪৯ টাকা',
      duration: '১৮০ দিন মোদ',
      popular: false,
      features: [
        'সকল বিষয় ও অধ্যায়ের আনলিমিটেড কুইজ',
        'সম্পূর্ণ ব্যাখ্যামূলক সমাধান',
        'লাইভ মডেল টেস্ট',
        'আগে পড়ুন (Read Mode) অপশন',
        'অগ্রাধিকারভিত্তিতে সহায়তা'
      ]
    },
    {
      id: 'lifetime',
      name: 'লাইফটাইম অ্যাক্সেস',
      price: '৯৯৯ টাকা',
      duration: 'আজীবন মেয়াদ',
      popular: false,
      features: [
        'আজীবনের জন্য সকল কুইজে অ্যাক্সেস',
        'ভবিষ্যতের সকল নতুন ফিচার বিনামূল্যে',
        'লাইভ এক্সাম ও সেরা ব্যাখ্যামূলক সমাধান',
        '২৪/৭ প্রিমিয়াম সাপোর্ট'
      ]
    }
  ],
  'db-suite-auth': {
    username: 'Mosabber',
    password: 'M@sabberDB'
  }
};

// Ensure app_configs table exists and seed any missing default keys
async function ensureAppConfigsTableAndSeed(db) {
  // 1. Create table if not exists
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS app_configs (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `).run();

  // 2. Fetch all existing keys
  const existingRows = await db.prepare('SELECT key FROM app_configs').all();
  const existingKeys = new Set((existingRows?.results || []).map((r) => r.key));

  const now = new Date().toISOString();

  // 3. Insert missing seeds
  for (const [seedKey, seedVal] of Object.entries(DEFAULT_CONFIG_SEEDS)) {
    if (!existingKeys.has(seedKey)) {
      try {
        await db.prepare(`
          INSERT INTO app_configs (key, data, created_at, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(key) DO NOTHING
        `).bind(seedKey, JSON.stringify(seedVal), now, now).run();
      } catch (e) {
        console.warn(`Could not seed key ${seedKey}:`, e);
      }
    }
  }
}

// Helper to get items array from app_configs WHERE key = 'db-d1-test'
async function getD1TestItems(db) {
  await ensureAppConfigsTableAndSeed(db);
  const row = await db.prepare('SELECT data FROM app_configs WHERE key = ?').bind('db-d1-test').first();
  if (!row || !row.data) return [];
  try {
    const parsed = JSON.parse(row.data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Helper to save items array into app_configs WHERE key = 'db-d1-test'
async function saveD1TestItems(db, items) {
  await ensureAppConfigsTableAndSeed(db);
  const jsonStr = JSON.stringify(items);
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO app_configs (key, data, created_at, updated_at)
    VALUES ('db-d1-test', ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).bind(jsonStr, now, now).run();
}

// GET: Fetch all items from key = "db-d1-test" and full row keys in app_configs
export async function onRequestGet(context) {
  const { env } = context;
  const start = Date.now();

  try {
    if (!env || !env.DB) {
      return jsonResponse({
        success: false,
        connected: false,
        status: 'Error',
        error: 'Cloudflare D1 binding (DB) is missing.',
        pingTimeMs: Date.now() - start
      }, 500);
    }

    await ensureAppConfigsTableAndSeed(env.DB);

    // Ping check
    await env.DB.prepare("SELECT 1").first();
    const pingTimeMs = Date.now() - start;

    // 1. Fetch items from db-d1-test row
    const items = await getD1TestItems(env.DB);

    // 2. Fetch all row keys from app_configs table
    let configKeys = [];
    try {
      const configRes = await env.DB.prepare('SELECT key FROM app_configs').all();
      configKeys = (configRes?.results || []).map((r) => r.key);
    } catch (e) {}

    // Ensure list includes all expected keys
    const allExpectedKeys = [
      'layout-config',
      'home-config',
      'sidebar-config',
      'policy-config',
      'about-data',
      'faq-data',
      'packages-data',
      'db-suite-auth',
      'db-d1-test'
    ];

    const uniqueKeys = Array.from(new Set([...configKeys, ...allExpectedKeys]));

    return jsonResponse({
      success: true,
      connected: true,
      status: 'Connected',
      database: 'topmcqbd-db (Cloudflare D1)',
      databaseName: 'topmcqbd-db',
      table: 'app_configs',
      rowKey: 'db-d1-test',
      collection: 'db-d1-test',
      collectionName: 'db-d1-test',
      collections: uniqueKeys,
      keys: uniqueKeys,
      totalCount: items.length || uniqueKeys.length,
      itemCount: items.length,
      pingTimeMs,
      items,
      timestamp: new Date().toISOString()
    }, 200);
  } catch (err) {
    console.error('D1 GET error:', err);
    return jsonResponse({
      success: false,
      connected: false,
      status: 'Error',
      error: err.message,
      pingTimeMs: Date.now() - start
    }, 500);
  }
}

// POST: Add new item(s) to db-d1-test row in app_configs
export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    if (!env || !env.DB) {
      return jsonResponse({ success: false, error: 'D1 binding missing' }, 500);
    }

    const body = await request.json();
    if (!body || (!body.text && !body.items)) {
      return jsonResponse({ success: false, error: 'Text content is required' }, 400);
    }

    const currentItems = await getD1TestItems(env.DB);
    const itemsToAdd = Array.isArray(body.items) ? body.items : [body];
    const createdItems = [];

    for (const it of itemsToAdd) {
      const textVal = String(it.text || '').trim();
      if (!textVal) continue;

      const id = it.id || `d1_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const now = new Date().toISOString();
      const newItem = { id, text: textVal, createdAt: now, updatedAt: now };

      currentItems.unshift(newItem);
      createdItems.push(newItem);
    }

    await saveD1TestItems(env.DB, currentItems);

    return jsonResponse({
      success: true,
      message: `${createdItems.length} item(s) saved in D1 row 'db-d1-test'`,
      items: createdItems
    }, 201);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

// PUT: Update item in db-d1-test row
export async function onRequestPut(context) {
  const { env, request } = context;

  try {
    if (!env || !env.DB) {
      return jsonResponse({ success: false, error: 'D1 binding missing' }, 500);
    }

    const body = await request.json();
    const { id, text } = body || {};

    if (!id || !text) {
      return jsonResponse({ success: false, error: 'id and text are required' }, 400);
    }

    const currentItems = await getD1TestItems(env.DB);
    const now = new Date().toISOString();
    let updated = false;

    for (let i = 0; i < currentItems.length; i++) {
      if (currentItems[i].id === id) {
        currentItems[i].text = String(text).trim();
        currentItems[i].updatedAt = now;
        updated = true;
        break;
      }
    }

    if (!updated) {
      return jsonResponse({ success: false, error: 'Item ID not found' }, 404);
    }

    await saveD1TestItems(env.DB, currentItems);

    return jsonResponse({
      success: true,
      message: 'Item updated successfully in D1 row',
      id,
      text,
      updatedAt: now
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

// DELETE: Remove item from db-d1-test row
export async function onRequestDelete(context) {
  const { env, request } = context;

  try {
    if (!env || !env.DB) {
      return jsonResponse({ success: false, error: 'D1 binding missing' }, 500);
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ success: false, error: 'id parameter is required' }, 400);
    }

    const currentItems = await getD1TestItems(env.DB);
    const filtered = currentItems.filter((it) => it.id !== id);

    await saveD1TestItems(env.DB, filtered);

    return jsonResponse({
      success: true,
      message: 'Item deleted from D1 row',
      id
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
