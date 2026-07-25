// Global API Endpoint for Layout Configuration
const LAYOUT_API_URL = 'https://mosabber-quiz-app.onrender.com/api/layout-config';

// 1. Fetch & Cache Strategy (LocalStorage with Auto Sync)
async function loadLayoutConfig() {
    let cachedData = localStorage.getItem('layout_config_data');
    let config = cachedData ? JSON.parse(cachedData) : null;

    // Background call to check for updates from DB
    try {
        const res = await fetch(LAYOUT_API_URL);
        if (res.ok) {
            const freshData = await res.json();
            
            // Check if updated or no cache exists
            if (!config || JSON.stringify(config) !== JSON.stringify(freshData)) {
                localStorage.setItem('layout_config_data', JSON.stringify(freshData));
                config = freshData;
                renderLayout(config); // Re-render if updated
            }
        }
    } catch (err) {
        console.warn("Offline or Server unreachable. Loading from LocalStorage Cache.");
    }

    // Render immediately using cache if available
    if (config) {
        renderLayout(config);
    }
}

// 2. Master Render Function for Announcement, Header, SEO & Footer
function renderLayout(data) {
    if (!data) return;

    // A. Dynamic SEO Title & Favicon Update
    if (data.header) {
        // Dynamic Browser Title (SEO Title)
        if (data.header.seoTitle) {
            document.title = data.header.seoTitle;
        }

        // Dynamic Favicon Update
        if (data.header.faviconUrl) {
            let favicon = document.querySelector("link[rel*='icon']");
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'shortcut icon';
                document.getElementsByTagName('head')[0].appendChild(favicon);
            }
            favicon.href = data.header.faviconUrl;
        }
    }

    // B. Render Announcement Bar
    if (data.announcement && data.announcement.text) {
        const announceContainer = document.getElementById('global-announce-bar');
        if (announceContainer) {
            announceContainer.style.display = 'block';
            announceContainer.innerHTML = `
                <div class="announce-content">
                    <span>${data.announcement.text}</span>
                    ${data.announcement.link ? `<a href="${data.announcement.link}" class="announce-link">বিস্তারিত দেখুন</a>` : ''}
                </div>
            `;
        }
    }

    // C. Render Header (Logo, Menu, Sub-menu & Button)
    if (data.header) {
        const headerContainer = document.getElementById('global-header');
        if (headerContainer) {
            const h = data.header;
            let menusHtml = '';

            if (h.menus && Array.isArray(h.menus)) {
                menusHtml = h.menus.map(m => {
                    let subHtml = '';
                    if (m.subMenus && m.subMenus.length > 0) {
                        subHtml = `
                            <ul class="dropdown-menu">
                                ${m.subMenus.map(sm => `<li><a href="${sm.url}">${sm.title}</a></li>`).join('')}
                            </ul>
                        `;
                    }
                    return `
                        <li class="nav-item ${m.subMenus && m.subMenus.length > 0 ? 'has-dropdown' : ''}">
                            <a href="${m.url || '#'}">${m.title}</a>
                            ${subHtml}
                        </li>
                    `;
                }).join('');
            }

            headerContainer.innerHTML = `
                <div class="header-wrapper">
                    <div class="site-logo">
                        <a href="index.html">
                            ${h.logoUrl ? `<img src="${h.logoUrl}" alt="${h.siteTitle || 'Logo'}">` : `<h2>${h.siteTitle || 'TopMCQ'}</h2>`}
                        </a>
                    </div>
                    <nav class="site-nav">
                        <ul>${menusHtml}</ul>
                    </nav>
                    ${h.btnText ? `<div class="header-btn"><a href="${h.btnLink || '#'}" class="btn-primary-head">${h.btnText}</a></div>` : ''}
                </div>
            `;
        }
    }

    // D. Render 4-Column Footer & Copyright
    if (data.footer) {
        const footerContainer = document.getElementById('global-footer');
        if (footerContainer) {
            const f = data.footer;
            const c = data.copyright || {};

            footerContainer.innerHTML = `
                <div class="footer-container">
                    <div class="footer-grid">
                        <!-- Col 1: About & Social -->
                        <div class="footer-col">
                            <h4>আমাদের সম্পর্কে</h4>
                            <p>${f.col1Text || ''}</p>
                            <div class="footer-social">
                                ${f.col1Fb ? `<a href="${f.col1Fb}" target="_blank"><i class="fa-brands fa-facebook"></i></a>` : ''}
                                ${f.col1Yt ? `<a href="${f.col1Yt}" target="_blank"><i class="fa-brands fa-youtube"></i></a>` : ''}
                            </div>
                        </div>

                        <!-- Col 2 -->
                        <div class="footer-col">
                            <h4>${f.col2Title || 'Quick Links'}</h4>
                            <div id="footer-col2-links"></div>
                        </div>

                        <!-- Col 3 -->
                        <div class="footer-col">
                            <h4>${f.col3Title || 'Categories'}</h4>
                            <div id="footer-col3-links"></div>
                        </div>

                        <!-- Col 4 -->
                        <div class="footer-col">
                            <h4>${f.col4Title || 'Contact'}</h4>
                            <div id="footer-col4-links"></div>
                        </div>
                    </div>

                    <!-- Bottom Copyright Bar -->
                    <div class="footer-bottom">
                        <p>${c.text || '© 2026 TopMCQ. All rights reserved.'}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Auto Run on DOM Load
document.addEventListener('DOMContentLoaded', loadLayoutConfig);