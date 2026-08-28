/**
 * Cloudflare Pages Function: /api/about-data
 * Powered by Cloudflare D1 SQL Database with Cloudflare CDN Edge Caching
 */

const DEFAULT_ABOUT_DATA = {
  title: "আমাদের সম্পর্কে (About Us)",
  subtitle: "TopMCQBD - আপনার অনলাইন প্রস্তুতিকে সহজ ও নিখুঁত করতে আমরা সবসময় পাশে আছি",
  whatIsTitle: "TopMCQBD কী?",
  whatIsDesc: "TopMCQBD একটি আধুনিক, সহজ এবং বিষয়ভিত্তিক অনলাইন কুইজ ও প্রস্তুতিমূলক প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ, বিশ্ববিদ্যালয় ভর্তি পরীক্ষাসহ যেকোনো প্রতিযোগিতামূলক পরীক্ষার জন্য নিজেকে সঠিকভাবে প্রস্তুত করতে TopMCQBD সাহায্য করে।",
  whyBestTitle: "কেন TopMCQBD সেরা?",
  features: [
    "টপিকভিত্তিক মডেল টেস্ট এবং লাইভ টাইমার রিয়েল এক্সাম এক্সপেরিয়েন্স দেয়।",
    "প্রতিটি প্রশ্নের সাথে রয়েছে নির্ভুল ও বিস্তৃত ব্যাখ্যামূলক সমাধান।",
    "তাত্ক্ষণিক রেজাল্ট এবং নিজের অবস্থান যাচাই করার সুবিধা।",
    "নতুন নতুন কুইজ ও প্রশ্ন নিয়মিত আপডেট করা হয়।"
  ]
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
        "SELECT data FROM app_configs WHERE key = 'about-data' LIMIT 1"
      ).first();

      if (row && row.data) {
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return jsonResponse(parsed, 200, 'cdn');
      }
    }
  } catch (err) {
    console.error('D1 about-data GET error:', err);
  }

  return jsonResponse(DEFAULT_ABOUT_DATA, 200, 'cdn');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    if (env && env.DB) {
      await env.DB.prepare(`
        INSERT INTO app_configs (key, data, updated_at) 
        VALUES ('about-data', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(JSON.stringify(body)).run();
    }

    return jsonResponse({
      success: true,
      message: 'About Us data saved successfully to Cloudflare D1!',
      data: body
    }, 200, 'none');
  } catch (err) {
    console.error('D1 about-data POST error:', err);
    return jsonResponse({ success: false, message: 'Failed to save about data: ' + err.message }, 500, 'none');
  }
}
