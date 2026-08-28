/**
 * Cloudflare Pages Function: /api/policy
 * Powered by Cloudflare D1 SQL Database with Cloudflare CDN Edge Caching
 */

const DEFAULT_POLICY = {
  content: "<h2>TopMCQBD রিফান্ড ও গোপনীয়তা নীতিমালা</h2><p>TopMCQBD তে আপনাকে স্বাগতম। আমাদের প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলি মেনে নিচ্ছেন।</p><h3>১. অ্যাকাউন্ট ও নিরাপত্তা</h3><p>আপনার অ্যাকাউন্ট আইডি ও পাসওয়ার্ডের নিরাপত্তা রক্ষা করা সম্পূর্ণ আপনার দায়িত্ব। সঠিক তথ্য দিয়ে অ্যাকাউন্ট খোলার জন্য অনুরোধ করা হচ্ছে।</p><h3>২. সাবস্ক্রিপশন ও রিফান্ড নীতি</h3><p>যেকোনো প্রিমিয়াম প্যাকেজ ক্রয়ের পর পেমেন্ট ভেরিফিকেশনের মাধ্যমে অ্যাক্সেস চালু করা হয়। কোনো প্রকার ভুল বা অসদুপায় অবলম্বন করলে অ্যাকাউন্ট সাময়িকভাবে স্থগিত হতে পারে।</p><h3>৩. গোপনীয়তা নীতি</h3><p>আপনার ব্যক্তিগত তথ্য (নাম, ইমেইল, ফোন নম্বর) তৃতীয় কোনো পক্ষের কাছে শেয়ার করা হয় না। সকল তথ্য নিরাপদ ডাটাবেজে সংরক্ষিত থাকে।</p>"
};

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
  const { env } = context;

  try {
    if (env && env.DB) {
      const row = await env.DB.prepare(
        "SELECT data FROM app_configs WHERE key = 'policy-config' LIMIT 1"
      ).first();

      if (row && row.data) {
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return jsonResponse(parsed, 200, 'cdn');
      }
    }
  } catch (err) {
    console.error('D1 policy-config GET error:', err);
  }

  return jsonResponse(DEFAULT_POLICY, 200, 'cdn');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    let currentConfig = DEFAULT_POLICY;
    if (env && env.DB) {
      try {
        const row = await env.DB.prepare(
          "SELECT data FROM app_configs WHERE key = 'policy-config' LIMIT 1"
        ).first();
        if (row && row.data) {
          currentConfig = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        }
      } catch (e) {}
    }

    const newConfig = {
      ...currentConfig,
      ...body
    };

    if (env && env.DB) {
      await env.DB.prepare(`
        INSERT INTO app_configs (key, data, updated_at) 
        VALUES ('policy-config', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(JSON.stringify(newConfig)).run();
    }

    return jsonResponse({
      success: true,
      message: 'Policy configuration saved successfully to Cloudflare D1!',
      config: newConfig
    }, 200, 'none');
  } catch (err) {
    console.error('D1 policy POST error:', err);
    return jsonResponse({ success: false, message: 'Failed to save policy: ' + err.message }, 500, 'none');
  }
}
