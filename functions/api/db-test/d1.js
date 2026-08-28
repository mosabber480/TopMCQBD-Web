/**
 * Cloudflare Pages Function: /api/db-test/d1
 * Cloudflare D1 Diagnostics and CRUD endpoint
 */

function jsonResponse(data, status = 200, cacheType = 'none') {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (cacheType === 'cdn') {
    headers['Cache-Control'] = 'public, max-age=10, s-maxage=30, stale-while-revalidate=60';
  } else {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
  }

  return new Response(JSON.stringify(data), { status, headers });
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}

// GET: Diagnostic and List all items from app_configs
export async function onRequestGet(context) {
  const { env, request } = context;
  const start = Date.now();

  try {
    if (!env || !env.DB) {
      return jsonResponse({
        success: false,
        connected: false,
        message: 'D1 binding (DB) is not configured in Cloudflare environment.',
        error: 'No DB binding found',
        pingTimeMs: Date.now() - start
      }, 500);
    }

    // Ping check
    await env.DB.prepare("SELECT 1").first();
    const pingTimeMs = Date.now() - start;

    // Fetch all rows from app_configs
    const { results } = await env.DB.prepare(
      "SELECT key, data, created_at, updated_at FROM app_configs ORDER BY updated_at DESC"
    ).all();

    const formattedItems = (results || []).map((row, index) => {
      let previewText = '';
      try {
        const parsed = JSON.parse(row.data);
        if (parsed.siteTitle || parsed.title) {
          previewText = parsed.siteTitle || parsed.title;
        } else if (parsed.announcement && parsed.announcement.text) {
          previewText = parsed.announcement.text;
        } else if (Array.isArray(parsed)) {
          previewText = `${parsed.length} items list`;
        } else {
          previewText = JSON.stringify(parsed).substring(0, 80) + '...';
        }
      } catch (e) {
        previewText = String(row.data).substring(0, 80);
      }

      return {
        id: row.key,
        key: row.key,
        text: previewText,
        rawData: row.data,
        createdAt: row.created_at || row.updated_at,
        updatedAt: row.updated_at,
        index: index + 1
      };
    });

    return jsonResponse({
      success: true,
      connected: true,
      database: 'topmcqbd-db',
      table: 'app_configs',
      type: 'Cloudflare D1 (Serverless SQLite on Cloudflare Edge)',
      totalCount: formattedItems.length,
      pingTimeMs,
      items: formattedItems,
      checkedAt: new Date().toISOString()
    }, 200);
  } catch (err) {
    console.error('D1 Diagnostic Error:', err);
    return jsonResponse({
      success: false,
      connected: false,
      message: 'Failed to connect to Cloudflare D1: ' + err.message,
      error: err.message,
      pingTimeMs: Date.now() - start
    }, 500);
  }
}

// POST: Add new row or test key in D1
export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const { key, data, text } = body;

    const targetKey = key || `test_${Date.now()}`;
    const targetData = data !== undefined ? (typeof data === 'string' ? data : JSON.stringify(data)) : JSON.stringify({ text: text || 'Test D1 entry' });

    if (!env || !env.DB) {
      throw new Error('D1 binding (DB) is missing');
    }

    await env.DB.prepare(`
      INSERT INTO app_configs (key, data, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
    `).bind(targetKey, targetData).run();

    return jsonResponse({
      success: true,
      message: `Key '${targetKey}' added/updated in Cloudflare D1 successfully!`,
      item: { id: targetKey, key: targetKey, data: targetData }
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, message: err.message }, 500);
  }
}

// PUT: Update an existing row
export async function onRequestPut(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const { key, data, text } = body;

    if (!key) throw new Error('Missing key for update');

    const targetData = data !== undefined ? (typeof data === 'string' ? data : JSON.stringify(data)) : JSON.stringify({ text: text || '' });

    if (!env || !env.DB) throw new Error('D1 binding (DB) is missing');

    await env.DB.prepare(`
      UPDATE app_configs SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?
    `).bind(targetData, key).run();

    return jsonResponse({
      success: true,
      message: `Key '${key}' updated in Cloudflare D1!`,
      item: { id: key, key, data: targetData }
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, message: err.message }, 500);
  }
}

// DELETE: Delete a row
export async function onRequestDelete(context) {
  const { env, request } = context;

  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key') || url.searchParams.get('id');

    if (!key) throw new Error('Missing key parameter to delete');

    if (!env || !env.DB) throw new Error('D1 binding (DB) is missing');

    await env.DB.prepare("DELETE FROM app_configs WHERE key = ?").bind(key).run();

    return jsonResponse({
      success: true,
      message: `Key '${key}' deleted from Cloudflare D1!`
    }, 200);
  } catch (err) {
    return jsonResponse({ success: false, message: err.message }, 500);
  }
}
