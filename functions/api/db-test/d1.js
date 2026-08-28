/**
 * Cloudflare Pages Function: /api/db-test/d1
 * Cloudflare D1 Diagnostics and CRUD for "db-d1-test" collection / table
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

// Ensure table exists helper
async function ensureD1TestTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS "db-d1-test" (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now', 'localtime')),
      updatedAt TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `).run();
}

// GET: Fetch status and all items from db-d1-test
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

    await ensureD1TestTable(env.DB);

    // Ping check
    await env.DB.prepare("SELECT 1").first();
    const pingTimeMs = Date.now() - start;

    // Fetch all items
    const { results } = await env.DB.prepare(
      'SELECT id, text, createdAt, updatedAt FROM "db-d1-test" ORDER BY datetime(createdAt) DESC'
    ).all();

    const formattedItems = (results || []).map((row, index) => ({
      id: row.id,
      text: row.text,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      index: index + 1
    }));

    return jsonResponse({
      success: true,
      connected: true,
      status: 'Connected',
      database: 'topmcqbd-db (Cloudflare D1)',
      databaseName: 'topmcqbd-db',
      collection: 'db-d1-test',
      collectionName: 'db-d1-test',
      totalCount: formattedItems.length,
      itemCount: formattedItems.length,
      pingTimeMs,
      items: formattedItems,
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

// POST: Add new item to db-d1-test
export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return jsonResponse({ success: false, error: 'Text content is required' }, 400);
    }

    if (!env || !env.DB) {
      throw new Error('Cloudflare D1 binding (DB) is missing.');
    }

    await ensureD1TestTable(env.DB);

    const id = `d1_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowStr = new Date().toLocaleString('en-GB');

    await env.DB.prepare(`
      INSERT INTO "db-d1-test" (id, text, createdAt, updatedAt)
      VALUES (?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `).bind(id, text.trim()).run();

    return jsonResponse({
      success: true,
      message: 'Item added to db-d1-test successfully!',
      item: { id, text: text.trim(), createdAt: nowStr }
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

// PUT: Update an item in db-d1-test
export async function onRequestPut(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const { id, text } = body;

    if (!id || !text || !text.trim()) {
      return jsonResponse({ success: false, error: 'ID and Text are required' }, 400);
    }

    if (!env || !env.DB) {
      throw new Error('Cloudflare D1 binding (DB) is missing.');
    }

    await ensureD1TestTable(env.DB);

    await env.DB.prepare(`
      UPDATE "db-d1-test" 
      SET text = ?, updatedAt = datetime('now', 'localtime')
      WHERE id = ?
    `).bind(text.trim(), id).run();

    return jsonResponse({
      success: true,
      message: 'Item updated in db-d1-test successfully!',
      item: { id, text: text.trim() }
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

// DELETE: Delete an item from db-d1-test
export async function onRequestDelete(context) {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ success: false, error: 'ID is required' }, 400);
    }

    if (!env || !env.DB) {
      throw new Error('Cloudflare D1 binding (DB) is missing.');
    }

    await ensureD1TestTable(env.DB);

    await env.DB.prepare('DELETE FROM "db-d1-test" WHERE id = ?').bind(id).run();

    return jsonResponse({
      success: true,
      message: 'Item deleted from db-d1-test successfully!'
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}
