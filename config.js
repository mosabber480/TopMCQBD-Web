// Global API Endpoint for Layout Configuration
const LAYOUT_API_URL = 'https://mosabber-quiz-app.onrender.com/api/layout-config';

// 1. Fetch & Cache Strategy (LocalStorage with Auto Sync)
async function loadLayoutConfig() {
    let cachedData = localStorage.getItem('layout_config_data');
    let config = cachedData ? JSON.parse(cachedData) : null;

    try {
        const res = await fetch(LAYOUT_API_URL);
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

// 2. Master Render Function for Announcement, Header, SEO & Footer
function renderLayout(data) {
    if (!data) return;

    // A. Dynamic SEO Title & Favicon Update
    if (data.header) {
        if (data.header.seoTitle) {
            document.title = data.header.seoTitle;
        }

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
                                ${m.subMenus.map(sm => `<li><a href="${sm.url || '#'}">${sm.title}</a></li>`).join('')}
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
    if (data.footer || data.copyright) {
        const footerContainer = document.getElementById('global-footer');
        if (footerContainer) {
            const f = data.footer || {};
            const c = data.copyright || {};

            const generateLinksHtml = (links) => {
                if (!links || links.length === 0) return '';
                return `<ul>` + links.map(l => `<li><a href="${l.url || '#'}">${l.title}</a></li>`).join('') + `</ul>`;
            };

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
                            <h4>${f.col2Title || 'প্রয়োজনীয় লিংক'}</h4>
                            ${generateLinksHtml(f.col2Links)}
                        </div>

                        <!-- Col 3 -->
                        <div class="footer-col">
                            <h4>${f.col3Title || 'ক্যাটাগরি'}</h4>
                            ${generateLinksHtml(f.col3Links)}
                        </div>

                        <!-- Col 4 -->
                        <div class="footer-col">
                            <h4>${f.col4Title || 'যোগাযোগ'}</h4>
                            ${generateLinksHtml(f.col4Links)}
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