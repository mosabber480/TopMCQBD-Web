/**
 * Cloudflare Pages Function: /api/layout-config
 * Powered by Cloudflare D1 SQL Database with Cloudflare CDN Edge Caching
 * Optimized for 30,000+ Active Users
 */

const DEFAULT_LAYOUT = {
  announcement: {
    text: "বিসিএস ও সরকারি চাকরির পরীক্ষায় সফলতার জন্য পূর্ণাঙ্গ প্রস্তুতি",
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
      {
        title: "হোম",
        url: "/",
        icon: "fa-solid fa-house"
      },
      {
        title: "পেইড MCQ",
        url: "/all-mcq",
        icon: "fa-solid fa-layer-group",
        subMenus: [
          {
            title: "Subjective Model Test",
            url: "/subjective-model-test"
          },
          {
            title: "Full Model Test",
            url: "/full-model-test"
          },
          {
            title: "Question Bank",
            url: "/question-bank"
          },
          {
            title: "Live Exam",
            url: "/live-exam-model-test"
          },
          {
            title: "সম্পূর্ণ সাবজেক্টিভ অনুশীলন",
            url: "/subjective-all-mcqs-Practice-success"
          }
        ]
      },
      {
        title: "প্যাকেজসমূহ",
        url: "/packages",
        icon: "fa-solid fa-box"
      },
      {
        title: "Free Plan",
        url: "#",
        icon: "fa-solid fa-hockey-puck",
        badgeText: "Free",
        badgeType: "free",
        subMenus: [
          {
            title: "Recent Job Solution",
            url: "/free-recent-job-solution",
            icon: "fa-solid fa-bolt",
            badgeText: "Free",
            badgeType: "free"
          },
          {
            title: "Free Model Test",
            url: "/free-model-test",
            icon: "fa-solid fa-bolt",
            badgeText: "Free",
            badgeType: "free"
          }
        ],
        isMegaMenu: false,
        megaMenuId: null
      },
      {
        title: "আমাদের সম্পর্কে",
        url: "/about-us",
        icon: "fa-solid fa-bullseye"
      }
    ],
    megaMenus: [
      {
        id: "mega_1787215391182",
        title: "মেগা মেনু 1",
        columns: [
          {
            type: "icon",
            title: "আইকন সার্ভিস কলাম",
            items: [
              {
                iconType: "fontawesome",
                iconValue: "fa-solid fa-building-columns",
                title: "Banking",
                desc: "Store, manage and move your funds safely.",
                url: "/all-mcq"
              },
              {
                iconType: "flaticon",
                iconValue: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                title: "Online Quiz",
                desc: "Test your knowledge with daily quizzes.",
                url: "/all-mcq"
              }
            ]
          },
          {
            type: "icon",
            title: "নতুন আইকন কলাম",
            items: [
              {
                iconType: "fontawesome",
                iconValue: "fa-solid fa-building-columns",
                title: "Banking",
                desc: "Store, manage and move your funds safely.",
                url: "#"
              }
            ]
          },
          {
            type: "info",
            title: "নতুন তথ্য কলাম",
            text: "সাইট সম্পর্কে কিছু লিখুন...",
            iconHtml: "<i class=\"fa-solid fa-circle-info\"></i>"
          },
          {
            type: "links",
            title: "নতুন লিংক কলাম",
            links: []
          }
        ]
      },
      {
        id: "mega_1787314295206",
        title: "নতুন মেগা মেনু 2",
        columns: [
          {
            type: "info",
            title: "নতুন তথ্য কলাম",
            text: "সাইট সম্পর্কে কিছু লিখুন...",
            iconHtml: "<i class=\"fa-solid fa-circle-info\"></i>"
          },
          {
            type: "links",
            title: "নতুন লিংক কলাম",
            links: []
          }
        ]
      }
    ]
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
          {
            title: "হোম পেজ",
            url: "/"
          },
          {
            title: "কুইজ অনুশীলন",
            url: "/quiz"
          },
          {
            title: "সকল প্রশ্ন ক্যাটাগরি",
            url: "/all-mcq"
          }
        ]
      },
      {
        type: "links",
        title: "নতুন লিংক কলাম",
        links: [
          {
            title: "Test",
            url: "#"
          },
          {
            title: "Test",
            url: "#"
          },
          {
            title: "Test",
            url: "#"
          },
          {
            title: "Test",
            url: "#"
          }
        ]
      },
      {
        type: "links",
        title: "নতুন কলাম 660",
        links: [
          {
            title: "Test",
            url: "#"
          },
          {
            title: "Test",
            url: "#"
          },
          {
            title: "Test56",
            url: "#"
          }
        ]
      },
      {
        type: "icon_links",
        title: "যোগাযোগ ও সাপোর্ট",
        links: [
          {
            icon: "fa-solid fa-phone",
            title: "ফোন: ০১৭০০-০০০০০০",
            url: "tel:01700000000"
          },
          {
            icon: "fa-solid fa-envelope",
            title: "ইমেইল: support@topmcqbd.com",
            url: "mailto:support@topmcqbd.com"
          },
          {
            icon: "fa-brands fa-whatsapp",
            title: "হোয়াটসঅ্যাপ হেল্পলাইন",
            url: "https://wa.me/8801700000000"
          },
          {
            icon: "fa-solid fa-location-dot",
            title: "ঢাকা, বাংলাদেশ",
            url: "#"
          }
        ]
      }
    ]
  },
  copyright: {
    text: "© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।",
    links: [
      {
        title: "FAQ",
        url: "/faq"
      },
      {
        title: "Privacy & Refund Policy",
        url: "/privacy-and-refund-policy"
      }
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
