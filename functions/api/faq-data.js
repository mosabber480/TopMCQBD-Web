/**
 * Cloudflare Pages Function: /api/faq-data
 * Powered by Cloudflare D1 SQL Database with Cloudflare CDN Edge Caching
 */

const DEFAULT_FAQ_DATA = [
  {
    q: "TopMCQBD কী এবং কীভাবে কাজ করে?",
    a: "TopMCQBD একটি স্বয়ংসম্পূর্ণ অনলাইন এমসিকিউ ও মডেল টেস্ট প্ল্যাটফর্ম। এখানে বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য অধ্যায়ভিত্তিক ও বিষয়ভিত্তিক নির্ভুল প্রশ্ন ও ব্যাখ্যা অনুশীলন করা যায়।"
  },
  {
    q: "আমি কীভাবে প্রিমিয়াম প্যাকেজ সাবস্ক্রাইব করব?",
    a: "প্যাকেজেস পেজে গিয়ে আপনার পছন্দের প্যাকেজের নিচে \"এই প্যাকেজটি নিন\" বাটনে ক্লিক করুন। এরপর বিকাশ বা নগদ নম্বরে সেন্ড মানি করে ট্রানজেকশন আইডি ও নম্বরটি দিয়ে ফর্ম জমা দিন। অ্যাডমিন যাচাই করে প্যাকেজ চালু করে দেবেন।"
  },
  {
    q: "কুইজে কি নেগেটিভ মার্কিং আছে?",
    a: "হ্যাঁ, প্রতিটি ভুল উত্তরের জন্য ০.৫ নম্বর কাটা যাবে। তবে আপনি \"আগে পড়ুন\" (Read Mode) অপশন চালু করে পরীক্ষা দেওয়ার আগে সব প্রশ্নের সঠিক উত্তর ও ব্যাখ্যা এক নজরে পড়ে নিতে পারবেন।"
  },
  {
    q: "পাসওয়ার্ড ভুলে গেলে কী করব?",
    a: "লগইন পেজে \"পাসওয়ার্ড ভুলে গেছেন?\" লিংকে ক্লিক করে আপনার নিবন্ধিত ইমেইল দিন। আপনার ইমেইলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হবে যার মাধ্যমে নতুন পাসওয়ার্ড সেট করতে পারবেন।"
  },
  {
    q: "সাবস্ক্রিপশনের মেয়াদ কি একাধিকবার যোগ করা যায়?",
    a: "হ্যাঁ! আপনার একটি সক্রিয় প্যাকেজ চলাকালীন নতুন কোনো প্যাকেজ রিকোয়েস্ট অনুমোদন পেলে আগের মেয়াদের সাথে নতুন মেয়াদ স্বয়ংক্রিয়ভাবে যুক্ত হয়ে যাবে।"
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
        "SELECT data FROM app_configs WHERE key = 'faq-data' LIMIT 1"
      ).first();

      if (row && row.data) {
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return jsonResponse(parsed, 200, 'cdn');
      }
    }
  } catch (err) {
    console.error('D1 faq-data GET error:', err);
  }

  return jsonResponse(DEFAULT_FAQ_DATA, 200, 'cdn');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    if (env && env.DB) {
      await env.DB.prepare(`
        INSERT INTO app_configs (key, data, updated_at) 
        VALUES ('faq-data', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(JSON.stringify(body)).run();
    }

    return jsonResponse({
      success: true,
      message: 'FAQ data saved successfully to Cloudflare D1!',
      data: body
    }, 200, 'none');
  } catch (err) {
    console.error('D1 faq-data POST error:', err);
    return jsonResponse({ success: false, message: 'Failed to save FAQ data: ' + err.message }, 500, 'none');
  }
}
