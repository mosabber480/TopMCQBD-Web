// Centralized API Configuration
const CONFIG = {
  // MongoDB Database 1 (TopMCQBD_DB - Paid) Services
  ADMIN_API: "https://mosabber-quiz-app.onrender.com/api",
  MAIN_PAID_API: "https://topmcqbd.onrender.com/api",
  PAGES_API: "https://topmcqbdpages.onrender.com/api",
  WRITTEN_API: "https://topmcqbd-model-written.onrender.com/api",

  // MongoDB Database 2 (Free Database) Service
  FREE_MCQS_API: "https://topmcqbd-free-mcqs.onrender.com/api"
};

// Global API Endpoint for Layout Configuration (Attached safely to window object)
window.LAYOUT_API_URL = window.LAYOUT_API_URL || `${CONFIG.MAIN_PAID_API}/layout-config`;

// Smart URL Helper Function (Fixes internal vs external links issue)
function formatURL(url) {
    if (!url || url === '#') return '#';
    url = url.trim();

    // Internal routes / local files (e.g. index.html, /about, #section) should be returned directly
    if (url.startsWith('/') || url.startsWith('#') || url.endsWith('.html') || !url.includes('.')) {
        return url;
    }

    // External URLs with protocol
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
        return url;
    }

    // Standard external domains like facebook.com or google.com
    return 'https://' + url;
}

// Fetch & Render Layout Config
async function loadLayoutConfig() {
    let cachedData = localStorage.getItem('layout_config_data');
    let config = cachedData ? JSON.parse(cachedData) : null;

    try {
        const res = await fetch(window.LAYOUT_API_URL);
        if (res.ok) {
            const freshData = await res.json();
            if (!config || JSON.stringify(config) !== JSON.stringify(freshData)) {
                localStorage.setItem('layout_config_data', JSON.stringify(freshData));
                config = freshData;
                renderLayout(config);
            }
        }
    } catch (err) {
        console.warn("Offline or Server unreachable. Loading from LocalStorage Cache.");
    }

    if (config) {
        renderLayout(config);
    }
}

function renderLayout(data) {
    if (!data) return;

    // 🌟 Check if current page is inside /pages/ or /admin/ subfolder
    const isSubFolder = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/');
    const homePath = isSubFolder ? '../index.html' : 'index.html';

    // A. Dynamic SEO Title & Favicon
    if (data.header) {
        if (data.header.seoTitle) document.title = data.header.seoTitle;
        if (data.header.faviconUrl) {
            let favicon = document.querySelector("link[rel*='icon']");
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'shortcut icon';
                document.getElementsByTagName('head')[0].appendChild(favicon);
            }
            favicon.href = formatURL(data.header.faviconUrl);
        }
    }

    // B. Announcement Bar
    if (data.announcement && data.announcement.text) {
        const announceContainer = document.getElementById('global-announce-bar');
        if (announceContainer) {
            announceContainer.style.display = 'block';
            announceContainer.innerHTML = `
                <div class="announce-content">
                    <span>${data.announcement.text}</span>
                    ${data.announcement.link ? `<a href="${formatURL(data.announcement.link)}" class="announce-link">বিস্তারিত দেখুন</a>` : ''}
                </div>
            `;
        }
    }

    // C. Header with Mobile Menu Support
    if (data.header) {
        const headerContainer = document.getElementById('global-header');
        if (headerContainer) {
            const h = data.header;
            let menusHtml = '';

            if (h.menus && Array.isArray(h.menus)) {
                menusHtml = h.menus.map(m => {
                    let subHtml = '';
                    const hasSub = m.subMenus && m.subMenus.length > 0;
                    if (hasSub) {
                        subHtml = `
                            <ul class="dropdown-menu">
                                ${m.subMenus.map(sm => `<li><a href="${formatURL(sm.url)}">${sm.title}</a></li>`).join('')}
                            </ul>
                        `;
                    }
                    return `
                        <li class="nav-item ${hasSub ? 'has-dropdown' : ''}">
                            <a href="${formatURL(m.url)}" class="nav-link-main">${m.title} ${hasSub ? '<i class="fa-solid fa-angle-down drop-icon" style="font-size:12px; margin-left:3px;"></i>' : ''}</a>
                            ${subHtml}
                        </li>
                    `;
                }).join('');
            }

            // 💡 টাইটেল ফাঁকা থাকলে বাধ্যতামূলক 'TopMCQBD' ব্যবহার করা হবে
            let siteTitleText = (h.siteTitle && h.siteTitle.trim()) ? h.siteTitle.trim() : 'TopMCQBD';

            headerContainer.innerHTML = `
                <div class="header-wrapper">
                    <div class="site-logo">
                        <a href="${homePath}">
                            ${h.logoUrl ? `<img src="${h.logoUrl}" alt="${siteTitleText}">` : `<h2>${siteTitleText}</h2>`}
                        </a>
                    </div>

                    <nav class="site-nav">
                        <ul>${menusHtml}</ul>
                        ${h.btnText ? `<div class="header-btn"><a href="${formatURL(h.btnLink)}" class="btn-primary-head">${h.btnText}</a></div>` : ''}
                    </nav>

                    <!-- Mobile Hamburger Button -->
                    <button class="mobile-toggle-btn" id="mobile-toggle-btn" aria-label="Toggle Navigation">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            `;

            // Auto Attached Mobile Toggle Event Right After Header Generation
            initMobileEvents();
        }
    }

    // D. Footer
    if (data.footer || data.copyright) {
        const footerContainer = document.getElementById('global-footer');
        if (footerContainer) {
            const f = data.footer || {};
            const c = data.copyright || {};

            const generateLinksHtml = (links) => {
                if (!links || links.length === 0) return '';
                return `<ul>` + links.map(l => `<li><a href="${formatURL(l.url)}"><i class="fa-solid fa-angle-right"></i> ${l.title}</a></li>`).join('') + `</ul>`;
            };

            footerContainer.innerHTML = `
                <div class="footer-container">
                    <div class="footer-grid">
                        <div class="footer-col">
                            <h4>আমাদের সম্পর্কে</h4>
                            <p>${f.col1Text || ''}</p>
                            <div class="footer-social">
                                ${f.col1Fb ? `<a href="${formatURL(f.col1Fb)}" target="_blank" title="Facebook" class="social-btn fb"><i class="fa-brands fa-facebook-f"></i></a>` : ''}
                                ${f.col1Yt ? `<a href="${formatURL(f.col1Yt)}" target="_blank" title="YouTube" class="social-btn yt"><i class="fa-brands fa-youtube"></i></a>` : ''}
                                ${f.col1Wa ? `<a href="${formatURL(f.col1Wa)}" target="_blank" title="WhatsApp" class="social-btn wa"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
                                ${f.col1Tw ? `<a href="${formatURL(f.col1Tw)}" target="_blank" title="Twitter / X" class="social-btn tw"><i class="fa-brands fa-x-twitter"></i></a>` : ''}
                                ${f.col1Tg ? `<a href="${formatURL(f.col1Tg)}" target="_blank" title="Telegram" class="social-btn tg"><i class="fa-brands fa-telegram"></i></a>` : ''}
                                ${f.col1Ln ? `<a href="${formatURL(f.col1Ln)}" target="_blank" title="LinkedIn" class="social-btn ln"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
                            </div>
                        </div>
                        <div class="footer-col">
                            <h4>${f.col2Title || 'প্রয়োজনীয় লিংক'}</h4>
                            ${generateLinksHtml(f.col2Links)}
                        </div>
                        <div class="footer-col">
                            <h4>${f.col3Title || 'ক্যাটাগরি'}</h4>
                            ${generateLinksHtml(f.col3Links)}
                        </div>
                        <div class="footer-col">
                            <h4>${f.col4Title || 'যোগাযোগ'}</h4>
                            ${generateLinksHtml(f.col4Links)}
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>${c.text || '© 2026 TopMCQBD. All rights reserved.'}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Global Mobile Menu Event Attachment
function initMobileEvents() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const siteNav = document.querySelector('.site-nav');

    if (toggleBtn && siteNav) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            siteNav.classList.toggle('active');
            const icon = toggleBtn.querySelector('i');
            if (siteNav.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        };

        document.onclick = (e) => {
            if (!siteNav.contains(e.target) && !toggleBtn.contains(e.target)) {
                siteNav.classList.remove('active');
                const icon = toggleBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        };
    }

    // Sub-menu Click Toggle on Mobile
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link-main');
        if (link) {
            link.onclick = (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    item.classList.toggle('show-mobile-dropdown');
                }
            };
        }
    });
}

document.addEventListener('DOMContentLoaded', loadLayoutConfig);