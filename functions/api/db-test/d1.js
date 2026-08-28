/**
 * Cloudflare Pages Function: /api/db-test/d1
 * Cloudflare D1 Row CRUD for key = "db-d1-test" in app_configs table
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

// Ensure app_configs table exists
async function ensureAppConfigsTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS app_configs (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `).run();
}

// Helper to get items array from app_configs WHERE key = 'db-d1-test'
async function getD1TestItems(db) {
  await ensureAppConfigsTable(db);
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
  await ensureAppConfigsTable(db);
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

// GET: Fetch all items from key = "db-d1-test" in app_configs
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

    await ensureAppConfigsTable(env.DB);

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

    if (!configKeys.includes('db-d1-test')) {
      configKeys.push('db-d1-test');
    }

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
      collections: configKeys,
      keys: configKeys,
      totalCount: items.length || configKeys.length,
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
