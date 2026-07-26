// High-Performance Cached Global Layout Renderer
const LAYOUT_API_URL = 'https://mosabber-quiz-app.onrender.com/api/layout-config';

// 1. DEFAULT ANNOUNCEMENT CONFIGURATION
const DEFAULT_ANNOUNCEMENT = {
    text: "বিশেষ বিজ্ঞপ্তি: সার্ভার থেকে প্রথমবার কুইজের তথ্য লোড হতে ৩০ সেকেন্ড পর্যন্ত সময় লাগতে পারে। অনুগ্রহ করে ধৈর্য ধরুন!",
    link: ""
};

// ================= GLOBAL TOP ALERT SYSTEM INJECTION =================
(function injectGlobalAlertHTML() {
    window.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('topAlertBanner')) {
            const alertDiv = document.createElement('div');
            alertDiv.id = 'topAlertBanner';
            alertDiv.innerHTML = `
                <div class="alert-container-inner">
                    <span id="alertMessage">Message here...</span>
                    <div class="alert-btns">
                        <button class="btn-alert btn-alert-ok" id="alertOkBtn">Yes</button>
                        <button class="btn-alert btn-alert-cancel" id="alertCancelBtn" style="display:none;">No</button>
                    </div>
                </div>
            `;
            document.body.insertBefore(alertDiv, document.body.firstChild);
        }
    });
})();

// GLOBAL TOP ALERT FUNCTION (CALLABLE ANYWHERE)
function showTopAlert(msg, type = 'info', isConfirm = false) {
    return new Promise((resolve) => {
        let banner = document.getElementById('topAlertBanner');
        
        // Fallback if banner element isn't ready in DOM
        if (!banner) {
            resolve(confirm(msg));
            return;
        }

        document.getElementById('alertMessage').innerHTML = msg;
        banner.className = type;
        banner.style.display = 'flex';

        const okBtn = document.getElementById('alertOkBtn');
        const cancelBtn = document.getElementById('alertCancelBtn');

        if (isConfirm) {
            okBtn.innerText = "Yes";
            cancelBtn.innerText = "No";
            cancelBtn.style.display = 'inline-block';
        } else {
            okBtn.innerText = "OK";
            cancelBtn.style.display = 'none';
        }

        okBtn.onclick = () => { banner.style.display = 'none'; resolve(true); };
        cancelBtn.onclick = () => { banner.style.display = 'none'; resolve(false); };

        if (!isConfirm) {
            setTimeout(() => { banner.style.display = 'none'; resolve(true); }, 4000);
        }
    });
}

// Helper Function: Correct URL Formatter (Local vs External)
function formatURL(url) {
    if (!url || url === '#') return '#';
    let trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
        return trimmed;
    }
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.endsWith('.html') || !trimmed.includes('.')) {
        return trimmed;
    }
    return 'https://' + trimmed;
}

// Helper Function: Smart Auth Redirect based on Role & Token
function getAuthRedirectLink() {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');
    
    if (!token) {
        return 'login.html';
    }
    
    try {
        const user = JSON.parse(userStr || '{}');
        if (user && (user.role === 'owner' || user.role === 'admin')) {
            return 'dashboard.html';
        }
    } catch(e){}
    
    return 'profile.html';
}

// Optimized Function: Load from Cache first, then Revalidate from Server (SWR)
async function renderGlobalLayout() {
    let cachedData = localStorage.getItem('layout_config_data');
    let config = cachedData ? JSON.parse(cachedData) : null;

    if (!config) {
        config = { announcement: DEFAULT_ANNOUNCEMENT };
    } else if (!config.announcement || !config.announcement.text) {
        config.announcement = DEFAULT_ANNOUNCEMENT;
    }

    applyLayoutToDOM(config);

    try {
        const response = await fetch(LAYOUT_API_URL);
        if (response.ok) {
            const freshData = await response.json();
            if (!freshData.announcement || !freshData.announcement.text) {
                freshData.announcement = DEFAULT_ANNOUNCEMENT;
            }

            if (JSON.stringify(config) !== JSON.stringify(freshData)) {
                localStorage.setItem('layout_config_data', JSON.stringify(freshData));
                applyLayoutToDOM(freshData);
            }
        }
    } catch (error) {
        console.warn('Network offline or Server busy. Serving layout with default announcement.');
    }
}

// Function: Pure DOM Builder
function applyLayoutToDOM(data) {
    if (!data) return;

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
    const announceBar = document.getElementById('global-announce-bar');
    const announceInfo = (data.announcement && data.announcement.text) ? data.announcement : DEFAULT_ANNOUNCEMENT;

    if (announceBar && announceInfo && announceInfo.text) {
        announceBar.style.display = 'block';
        announceBar.innerHTML = `
            <div class="announce-content">
                <span>${announceInfo.text}</span>
                ${announceInfo.link ? `<a href="${formatURL(announceInfo.link)}">বিস্তারিত দেখুন</a>` : ''}
            </div>
        `;
    }

    // C. Header & Navigation
    const headerContainer = document.getElementById('global-header');
    if (headerContainer && data.header) {
        const h = data.header;
        let logoHTML = h.logoUrl 
            ? `<img src="${h.logoUrl}" alt="${h.siteTitle || 'TopMCQ'}">` 
            : `<i class="fa-solid fa-book-open" style="color:var(--primary);"></i> ${h.siteTitle || 'TopMCQ'}`;

        let navItemsHTML = '';
        if (h.menus && h.menus.length > 0) {
            navItemsHTML = h.menus.map(item => {
                const hasSub = item.subMenus && item.subMenus.length > 0;
                let subMenuHTML = '';
                if (hasSub) {
                    subMenuHTML = `
                        <ul class="dropdown-menu">
                            ${item.subMenus.map(sub => `<li><a href="${formatURL(sub.url)}">${sub.title}</a></li>`).join('')}
                        </ul>
                    `;
                }
                return `
                    <li class="nav-item ${hasSub ? 'has-dropdown' : ''}">
                        <a href="${formatURL(item.url)}" class="dropdown-toggle-link">${item.title} ${hasSub ? '<i class="fa-solid fa-chevron-down" style="font-size:11px; margin-left:3px;"></i>' : ''}</a>
                        ${subMenuHTML}
                    </li>
                `;
            }).join('');
        }

        // Auth Status and Action Link
        const authLink = getAuthRedirectLink();
        const isLoggedIn = authLink !== 'login.html';
        const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');
        let userName = 'লগইন';
        if (isLoggedIn) {
            try {
                const user = JSON.parse(userStr || '{}');
                if (user.name) userName = user.name.split(' ')[0]; // First Name
                else userName = 'ড্যাশবোর্ড';
            } catch(e) { userName = 'ড্যাশবোর্ড'; }
        }

        // Header Action Buttons (Fully Controlled from Dashboard Settings)
        let customBtnText = (h.btnText && h.btnText.trim()) ? h.btnText.trim() : 'যোগাযোগ করুন';
        let rawLink = (h.btnLink || '').trim();
        let customBtnLink = (rawLink && rawLink !== 'login.html') ? formatURL(rawLink) : 'index.html#mission';

        let headerBtnHTML = `
            <div class="header-btn-group">
                <a href="${customBtnLink}" class="btn-primary-head">
                    <i class="fa-solid fa-headset"></i> ${customBtnText}
                </a>
                <a href="${authLink}" class="btn-auth-head">
                    <i class="fa-solid fa-circle-user"></i> ${userName}
                </a>
            </div>
        `;

        headerContainer.innerHTML = `
            <div class="header-wrapper">
                <div class="site-logo">
                    <a href="index.html">${logoHTML}</a>
                </div>
                
                <button class="mobile-toggle-btn" id="mobile-toggle-btn" aria-label="Toggle Navigation">
                    <i class="fa-solid fa-bars"></i>
                </button>

                <nav class="site-nav" id="site-nav">
                    <ul>${navItemsHTML}</ul>
                    ${headerBtnHTML}
                </nav>
            </div>
        `;

        initMobileNav();
    }

    // D. Footer & Copyright
    const footerContainer = document.getElementById('global-footer');
    if (footerContainer && (data.footer || data.copyright)) {
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
                    <p>${c.text || '© ' + new Date().getFullYear() + ' TopMCQ. All rights reserved.'}</p>
                </div>
            </div>
        `;
    }
}

// Function: Mobile Navigation Toggles
function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const siteNav = document.getElementById('site-nav');

    if (toggleBtn && siteNav) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            siteNav.classList.toggle('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = siteNav.classList.contains('active') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        };

        document.onclick = (e) => {
            if (!siteNav.contains(e.target) && !toggleBtn.contains(e.target)) {
                siteNav.classList.remove('active');
                const icon = toggleBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        };

        const dropdownToggles = siteNav.querySelectorAll('.dropdown-toggle-link');
        dropdownToggles.forEach(toggle => {
            toggle.onclick = (e) => {
                if (window.innerWidth <= 768) {
                    const navItem = toggle.closest('.nav-item');
                    if (navItem && navItem.classList.contains('has-dropdown')) {
                        e.preventDefault();
                        navItem.classList.toggle('show-mobile-dropdown');
                    }
                }
            };
        });
    }
}

// Execute on DOM Ready
document.addEventListener('DOMContentLoaded', renderGlobalLayout);