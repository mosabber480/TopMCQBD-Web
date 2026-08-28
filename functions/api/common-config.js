/**
 * Cloudflare Pages Function: /api/common-config
 * Generic D1 Key-Value edge storage for about-data, faq-data, packages-data, etc.
 */

function jsonResponse(data, status = 200, cacheType = 'cdn') {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (cacheType === 'cdn') {
    headers['Cache-Control'] = 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400';
    headers['Cloudflare-CDN-Cache-Control'] = 'max-age=300';
  } else {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
  }

  return new Response(JSON.stringify(data), { status, headers });
}

export async function onRequestOptions() {
  return jsonResponse({}, 200, 'none');
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || 'all';

  try {
    if (env && env.DB) {
      if (key === 'all') {
        const { results } = await env.DB.prepare("SELECT key, data FROM app_configs").all();
        const allData = {};
        if (results && results.length) {
          for (const row of results) {
            try {
              allData[row.key] = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            } catch (e) {
              allData[row.key] = row.data;
            }
          }
        }
        return jsonResponse(allData, 200, 'cdn');
      } else {
        const row = await env.DB.prepare(
          "SELECT data FROM app_configs WHERE key = ? LIMIT 1"
        ).bind(key).first();

        if (row && row.data) {
          const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
          return jsonResponse(parsed, 200, 'cdn');
        }
      }
    }
  } catch (err) {
    console.error('D1 common-config GET error:', err);
  }

  return jsonResponse({ error: 'Data not found for key: ' + key }, 404, 'none');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { key, data } = body;

    if (!key || data === undefined) {
      return jsonResponse({ error: 'Missing key or data field' }, 400, 'none');
    }

    if (env && env.DB) {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      await env.DB.prepare(`
        INSERT INTO app_configs (key, data, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(key, dataStr).run();
    }

    return jsonResponse({
      success: true,
      message: `Config for '${key}' saved successfully to Cloudflare D1!`,
      data
    }, 200, 'none');
  } catch (err) {
    console.error('D1 common-config POST error:', err);
    return jsonResponse({ success: false, message: 'Failed to save common config: ' + err.message }, 500, 'none');
  }
}
