/**
 * Cloudflare Pages Function: /api/sidebar-config
 * Powered by Cloudflare D1 SQL Database with Cloudflare CDN Edge Caching
 */

const DEFAULT_SIDEBAR_CONFIG = {
  menus: [
    { title: "ড্যাশবোর্ড", url: "/admin/dashboard", icon: "fa-solid fa-gauge-high", subMenus: [] },
    { title: "হেডার কন্ট্রোল", url: "/admin/header-dashboard", icon: "fa-solid fa-window-restore", subMenus: [] },
    { title: "ফুটার কন্ট্রোল", url: "/admin/footer-dashboard", icon: "fa-solid fa-table-columns", subMenus: [] },
    { title: "হোম পেজ কন্ট্রোল", url: "/admin/home-dashboard", icon: "fa-solid fa-sliders", subMenus: [] },
    { title: "আমাদের সম্পর্কে", url: "/admin/about-dashboard", icon: "fa-solid fa-address-card", subMenus: [] },
    { title: "প্রশ্ন ব্যাংক ও MCQ", url: "/admin/questions-dashboard", icon: "fa-solid fa-file-circle-question", subMenus: [] },
    { title: "প্যাকেজসমূহ পেজ", url: "/admin/packages-dashboard", icon: "fa-solid fa-box-open", subMenus: [] },
    { title: "ইউজার ও সাবস্ক্রিপশন", url: "/admin/users", icon: "fa-solid fa-users-gear", subMenus: [] },
    { title: "সাইডবার মেনু কন্ট্রোল", url: "/admin/admin-menu-dashboard", icon: "fa-solid fa-list-check", subMenus: [] },
    { title: "রিফান্ড ও পলিসি", url: "/admin/policy-dashboard", icon: "fa-solid fa-file-invoice-dollar", subMenus: [] },
    { title: "ফ্রি এমসিকিউ কন্ট্রোল", url: "/admin/free-mcqs-dashboard", icon: "fa-solid fa-gift", subMenus: [] }
  ],
  headerButtons: [
    { text: "ওয়েবসাইট ভিজিট", url: "/", icon: "fa-solid fa-globe", color: "success", targetBlank: true, action: "link" },
    { text: "হোম পেজ এডিটর", url: "/admin/home-dashboard", icon: "fa-solid fa-sliders", color: "primary", targetBlank: false, action: "link" },
    { text: "প্রশ্ন ব্যাংক", url: "/admin/questions-dashboard", icon: "fa-solid fa-file-circle-question", color: "info", targetBlank: false, action: "link" },
    { text: "ইউজার লিস্ট", url: "/admin/users", icon: "fa-solid fa-users", color: "warning", targetBlank: false, action: "link" },
    { text: "Database Connection", url: "/db-connection", icon: "fa-solid fa-arrow-up-right-from-square", color: "primary", targetBlank: true, action: "link" }
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
        "SELECT data FROM app_configs WHERE key = 'sidebar-config' LIMIT 1"
      ).first();

      if (row && row.data) {
        const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        return jsonResponse(parsed, 200, 'cdn');
      }
    }
  } catch (err) {
    console.error('D1 sidebar-config GET error:', err);
  }

  return jsonResponse(DEFAULT_SIDEBAR_CONFIG, 200, 'cdn');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    let currentConfig = DEFAULT_SIDEBAR_CONFIG;
    if (env && env.DB) {
      try {
        const row = await env.DB.prepare(
          "SELECT data FROM app_configs WHERE key = 'sidebar-config' LIMIT 1"
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
        VALUES ('sidebar-config', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `).bind(JSON.stringify(newConfig)).run();
    }

    return jsonResponse({
      success: true,
      message: 'Sidebar config saved successfully to Cloudflare D1!',
      config: newConfig
    }, 200, 'none');
  } catch (err) {
    console.error('D1 sidebar-config POST error:', err);
    return jsonResponse({ success: false, message: 'Failed to save sidebar config: ' + err.message }, 500, 'none');
  }
}
