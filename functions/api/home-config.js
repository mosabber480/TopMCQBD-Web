/**
 * Cloudflare Pages Function: /api/home-config
 * Powered by Cloudflare D1 SQL Database with Cloudflare CDN Edge Caching
 */

const DEFAULT_HOME_CONFIG = {
  seoTitle: "TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম",
  seoDescription: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য সেরা অনলাইন প্রস্তুতি প্ল্যাটফর্ম।",
  sliders: [
    {
      title: "বিসিএস ও ব্যাংক জব প্রস্তুতির সেরা মাধ্যম",
      subtitle: "হাজারো সঠিক প্রশ্নের ব্যাখ্যাসহ নিজেকে যাচাই করুন এবং দ্রুততম সময়ে আপনার চাকরির প্রস্তুতি সম্পন্ন করুন।",
      bgImage: "images/slider-01.jpg",
      bgOpacity: 0.5,
      btn1Text: "🚀 কুইজ শুরু করুন",
      btn1Link: "/all-mcq",
      btn2Text: "▶ ফ্রি ডেমো দেখুন",
      btn2Link: "#demo"
    },
    {
      title: "বিসিএস ও ব্যাংক জব প্রস্তুতির সেরা মাধ্যম",
      subtitle: "হাজারো সঠিক প্রশ্নের ব্যাখ্যাসহ নিজেকে যাচাই করুন এবং দ্রুততম সময়ে আপনার চাকরির প্রস্তুতি সম্পন্ন করুন।",
      bgImage: "images/slider-02.jpg",
      bgOpacity: 0.5,
      btn1Text: "🚀 কুইজ শুরু করুন",
      btn1Link: "/all-mcq",
      btn2Text: "▶ ফ্রি ডেমো দেখুন",
      btn2Link: "#demo"
    }
  ],
  demoQuizzes: [
    {
      title: "বাংলা ভাষা ও সাহিত্য",
      badgeText: "ফ্রি টেস্ট",
      desc: "সন্ধি, সমাস ও গুরুত্বপূর্ণ সাহিত্যিকদের বিগত বছরের প্রশ্নাবলি।",
      link: "/free-mcqs"
    }
  ],
  packages: [],
  demoSectionInfo: {
    title: "ফ্রি ডেমো কুইজ",
    subtitle: "কোনো রেজিস্ট্রেশন ছাড়াই এখনই নিচের কুইজগুলো প্র্যাকটিস করে দেখুন"
  },
  packageSectionInfo: {
    title: "প্যাকেজসমূহ",
    subtitle: "আপনার সুবিধাজনক প্রস্তুতি প্ল্যান বেছে নিন"
  },
  missionSectionInfo: {
    sectionTitle: "আমাদের মিশন ও লক্ষ্য",
    sectionSubtitle: "শিক্ষার্থীদের সফলতা ও সঠিক প্রস্ততি সুগম করাই আমাদের উদ্দেশ্য",
    missionTitle: "আমাদের মিশন",
    missionDesc: "বাংলাদেশের যেকোনো প্রান্তের শিক্ষার্থীদের কাছে মানসম্মত ও তথ্যসমৃদ্ধ প্রস্তুতিমূলক কুইজ পৌঁছে দেওয়া, যাতে তারা ঘরে বসেই রিয়েল-টাইম মূল্যায়নের মাধ্যমে নিজের আত্মবিশ্বাস বৃদ্ধি করতে পারে।",
    goalTitle: "আমাদের লক্ষ্য",
    goalDesc: "একটি আধুনিক, সহজ ও কার্যকর লার্নিং প্ল্যাটফর্ম হিসেবে প্রতিটি প্রতিযোগিতামূলক পরীক্ষার পরীক্ষার্থীর প্রথম পছন্দ হয়ে ওঠা এবং ব্যাখ্যামূলক অনুশীলনের মাধ্যমে তাদের শতভাগ সাফল্য নিশ্চিত করা।"
  }
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
        "SELECT data FROM app_configs WHERE key = 'home-config' LIMIT 1"
      ).first();

      if (row && row.data) {
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return jsonResponse(parsed, 200, 'cdn');
      }
    }
  } catch (err) {
    console.error('D1 home-config GET error:', err);
  }

  return jsonResponse(DEFAULT_HOME_CONFIG, 200, 'cdn');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    let currentConfig = DEFAULT_HOME_CONFIG;
    if (env && env.DB) {
      try {
        const row = await env.DB.prepare(
          "SELECT data FROM app_configs WHERE key = 'home-config' LIMIT 1"
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
        VALUES ('home-config', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(JSON.stringify(newConfig)).run();
    }

    return jsonResponse({
      success: true,
      message: 'Home config saved successfully to Cloudflare D1!',
      config: newConfig
    }, 200, 'none');
  } catch (err) {
    console.error('D1 home-config POST error:', err);
    return jsonResponse({ success: false, message: 'Failed to save home config: ' + err.message }, 500, 'none');
  }
}
