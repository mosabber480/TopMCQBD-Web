/**
 * Cloudflare Pages Function: /api/packages-data
 * Powered by Cloudflare D1 SQL Database with Cloudflare CDN Edge Caching
 */

const DEFAULT_PACKAGES_DATA = [
  {
    id: "1_month",
    name: "১ মাস প্রিমিয়াম অ্যাক্সেস",
    price: "৯৯ টাকা",
    duration: "৩০ দিন মোদ",
    popular: false,
    features: [
      "সকল বিষয় ও অধ্যায়ের আনলিমিটেড কুইজ",
      "সম্পূর্ণ ব্যাখ্যামূলক সমাধান",
      "লাইভ মডেল টেস্ট",
      "আগে পড়ুন (Read Mode) অপশন"
    ]
  },
  {
    id: "3_months",
    name: "৩ মাস প্রিমিয়াম অ্যাক্সেস",
    price: "২৪৯ টাকা",
    duration: "৯০ দিন মোদ",
    popular: true,
    features: [
      "সকল বিষয় ও অধ্যায়ের আনলিমিটেড কুইজ",
      "সম্পূর্ণ ব্যাখ্যামূলক সমাধান",
      "লাইভ মডেল টেস্ট",
      "আগে পড়ুন (Read Mode) অপশন",
      "বিশেষ ডিসকাউন্ট অফার"
    ]
  },
  {
    id: "6_months",
    name: "৬ মাস প্রিমিয়াম অ্যাক্সেস",
    price: "৪৪৯ টাকা",
    duration: "১৮০ দিন মোদ",
    popular: false,
    features: [
      "সকল বিষয় ও অধ্যায়ের আনলিমিটেড কুইজ",
      "সম্পূর্ণ ব্যাখ্যামূলক সমাধান",
      "লাইভ মডেল টেস্ট",
      "আগে পড়ুন (Read Mode) অপশন",
      "অগ্রাধিকারভিত্তিতে সহায়তা"
    ]
  },
  {
    id: "lifetime",
    name: "লাইফটাইম অ্যাক্সেস",
    price: "৯৯৯ টাকা",
    duration: "আজীবন মেয়াদ",
    popular: false,
    features: [
      "আজীবনের জন্য সকল কুইজে অ্যাক্সেস",
      "ভবিষ্যতের সকল নতুন ফিচার বিনামূল্যে",
      "লাইভ এক্সাম ও সেরা ব্যাখ্যামূলক সমাধান",
      "২৪/৭ প্রিমিয়াম সাপোর্ট"
    ]
  }
];

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
        "SELECT data FROM app_configs WHERE key = 'packages-data' LIMIT 1"
      ).first();

      if (row && row.data) {
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return jsonResponse(parsed, 200, 'cdn');
      }
    }
  } catch (err) {
    console.error('D1 packages-data GET error:', err);
  }

  return jsonResponse(DEFAULT_PACKAGES_DATA, 200, 'cdn');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    if (env && env.DB) {
      await env.DB.prepare(`
        INSERT INTO app_configs (key, data, updated_at) 
        VALUES ('packages-data', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(JSON.stringify(body)).run();
    }

    return jsonResponse({
      success: true,
      message: 'Packages data saved successfully to Cloudflare D1!',
      data: body
    }, 200, 'none');
  } catch (err) {
    console.error('D1 packages-data POST error:', err);
    return jsonResponse({ success: false, message: 'Failed to save packages data: ' + err.message }, 500, 'none');
  }
}
