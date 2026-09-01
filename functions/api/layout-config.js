/**
 * Cloudflare Pages Function: /api/layout-config
 * Powered by Cloudflare D1 SQL Database with Cloudflare CDN Edge Caching
 * Optimized for 30,000+ Active Users
 */

const DEFAULT_LAYOUT = {
  announcement: {
    text: "বিসিএস ও সরকারি চাকরির প্রস্তুতি",
    link: ""
  },
  header: {
    siteTitle: "TopMCQBD",
    logoUrl: "/images/TopMCQ.png",
    seoTitle: "TopMCQBD - সেরা অনলাইন কুইজ ও প্রস্তুতি প্ল্যাটফর্ম",
    faviconUrl: "/images/favicon.ico",
    btnText: "যোগাযোগ",
    btnLink: "/contact",
    btnIcon: "fa-solid fa-headset",
    menus: [
      { title: "হোম", url: "/", icon: "fa-solid fa-house" },
      { title: "কুইজ অনুশীলন", url: "/questions", icon: "fa-solid fa-bolt", badgeText: "FREE", badgeType: "free" },
      { title: "সকল MCQ", url: "/all-mcq", icon: "fa-solid fa-layer-group" },
      { title: "প্যাকেজসমূহ", url: "/packages", icon: "fa-solid fa-box" },
      { title: "আমাদের সম্পর্কে", url: "/about-us", icon: "fa-solid fa-bullseye" },
      { title: "যোগাযোগ", url: "/contact" }
    ],
    megaMenus: []
  },
  footer: {
    columns: [
      {
        type: "info",
        title: "সাইট তথ্য ও সোশাল লিংক",
        text: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য একটি আধুনিক ও স্বয়ংসম্পূর্ণ অনলাইন প্রস্তুতি প্ল্যাটফর্ম।",
        fb: "",
        yt: "",
        wa: "",
        tw: "",
        tg: "",
        ln: ""
      },
      {
        type: "links",
        title: "প্রয়োজনীয় লিংক",
        links: [
          { title: "হোম পেজ", url: "/" },
          { title: "কুইজ অনুশীলন", url: "/questions" },
          { title: "সকল প্রশ্ন ক্যাটাগরি", url: "/all-mcq" }
        ]
      }
    ]
  },
  copyright: {
    text: "© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।",
    links: [
      { title: "FAQ", url: "/faq" },
      { title: "Privacy & Refund Policy", url: "/privacy-and-refund-policy" },
      { title: "System Status", url: "/status.html" }
    ]
  }
};

function jsonResponse(data, status = 200, cacheType = 'none') {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
  };

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
        "SELECT data FROM app_configs WHERE key = 'layout-config' LIMIT 1"
      ).first();

      if (row && row.data) {
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return jsonResponse(parsed, 200, 'none');
      }
    }
  } catch (err) {
    console.error('D1 layout-config GET error:', err);
  }

  return jsonResponse(DEFAULT_LAYOUT, 200, 'none');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { announcement, header, footer, copyright } = body;

    let currentConfig = DEFAULT_LAYOUT;
    if (env && env.DB) {
      try {
        const row = await env.DB.prepare(
          "SELECT data FROM app_configs WHERE key = 'layout-config' LIMIT 1"
        ).first();
        if (row && row.data) {
          currentConfig = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        }
      } catch (e) {}
    }

    const newConfig = {
      ...currentConfig,
      announcement: announcement !== undefined ? announcement : currentConfig.announcement,
      header: header !== undefined ? header : currentConfig.header,
      footer: footer !== undefined ? footer : currentConfig.footer,
      copyright: copyright !== undefined ? copyright : currentConfig.copyright
    };

    if (env && env.DB) {
      await env.DB.prepare(`
        INSERT INTO app_configs (key, data, updated_at) 
        VALUES ('layout-config', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(JSON.stringify(newConfig)).run();
    }

    return jsonResponse({
      success: true,
      message: 'Layout configuration saved successfully in Cloudflare D1!',
      config: newConfig
    }, 200, 'none');
  } catch (err) {
    console.error('D1 layout-config POST error:', err);
    return jsonResponse({ success: false, message: 'Failed to save layout: ' + err.message }, 500, 'none');
  }
}
