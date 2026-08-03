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

// GLOBAL TOP ALERT FUNCTION
function showTopAlert(msg, type = 'info', isConfirm = false) {
    return new Promise((resolve) => {
        let banner = document.getElementById('topAlertBanner');
        
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

function formatURL(url) {
    if (!url || url === '#') return '#';
    let trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return trimmed;
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.endsWith('.html')) return trimmed;
    if (trimmed.startsWith('images/') || trimmed.startsWith('assets/') || trimmed.startsWith('../') || trimmed.startsWith('./')) return trimmed;
    if (!trimmed.includes('.')) return trimmed;
    return 'https://' + trimmed;
}

function getAuthRedirectLink() {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');
    if (!token) return 'login.html'; 
    try {
        const user = JSON.parse(userStr || '{}');
        if (user && (user.role === 'owner' || user.role === 'admin')) return 'admin/dashboard.html';
    } catch(e){}
    return 'profile.html';
}

async function renderGlobalLayout() {
    let cachedData = localStorage.getItem('layout_config_data');
    let config = cachedData ? JSON.parse(cachedData) : null;

    if (!config) config = { announcement: DEFAULT_ANNOUNCEMENT };
    else if (!config.announcement || !config.announcement.text) config.announcement = DEFAULT_ANNOUNCEMENT;

    applyLayoutToDOM(config);

    try {
        const response = await fetch(LAYOUT_API_URL);
        if (response.ok) {
            const freshData = await response.json();
            if (!freshData.announcement || !freshData.announcement.text) freshData.announcement = DEFAULT_ANNOUNCEMENT;
            if (JSON.stringify(config) !== JSON.stringify(freshData)) {
                localStorage.setItem('layout_config_data', JSON.stringify(freshData));
                applyLayoutToDOM(freshData);
            }
        }
    } catch (error) {
        console.warn('Network offline or Server busy. Serving layout with default announcement.');
    }
}

function applyLayoutToDOM(data) {
    if (!data) return;
    const homePath = 'index.html';

    // A. Favicon
    if (data.header && data.header.faviconUrl) {
        let faviconUrlFormatted = formatURL(data.header.faviconUrl);
        if (window.location.pathname.includes('/admin/')) {
            if (faviconUrlFormatted.startsWith('images/')) faviconUrlFormatted = '../' + faviconUrlFormatted;
        }
        let favicon = document.querySelector("link[rel*='icon']");
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'shortcut icon';
            document.getElementsByTagName('head')[0].appendChild(favicon);
        }
        favicon.href = faviconUrlFormatted;
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

    // C. Header
    const headerContainer = document.getElementById('global-header');
    if (headerContainer && data.header) {
        const h = data.header;
        let logoUrlFormatted = h.logoUrl ? formatURL(h.logoUrl) : '';
        if (window.location.pathname.includes('/admin/') && logoUrlFormatted.startsWith('images/')) {
            logoUrlFormatted = '../' + logoUrlFormatted;
        }

        let logoHTML = logoUrlFormatted 
            ? `<img src="${logoUrlFormatted}" alt="${h.siteTitle || 'TopMCQ'}">` 
            : `<i class="fa-solid fa-book-open" style="color:var(--primary);"></i> ${h.siteTitle || 'TopMCQ'}`;

        let navItemsHTML = '';
        if (h.menus && h.menus.length > 0) {
            navItemsHTML = h.menus.map(item => {
                const isMega = item.isMegaMenu === true; 
                const hasRegularSub = !isMega && item.subMenus && item.subMenus.length > 0;
                let subMenuHTML = '';

                if (isMega && item.megaMenuId) {
                    const targetMega = (h.megaMenus || []).find(m => m.id === item.megaMenuId);
                    if (targetMega && targetMega.columns && targetMega.columns.length > 0) {
                        const colsHtml = targetMega.columns.map(col => {
                            if (col.type === 'info') {
                                return `
                                    <div class="mega-col mega-info-col">
                                        <h4 class="mega-col-title">${col.title || 'তথ্য'}</h4>
                                        <p style="font-size:14px; color:#555; margin-bottom:15px; line-height:1.6;">${col.text || ''}</p>
                                        <div class="mega-social">
                                            ${col.fb ? `<a href="${formatURL(col.fb)}" target="_blank" class="fb"><i class="fa-brands fa-facebook-f"></i></a>` : ''}
                                            ${col.yt ? `<a href="${formatURL(col.yt)}" target="_blank" class="yt"><i class="fa-brands fa-youtube"></i></a>` : ''}
                                            ${col.wa ? `<a href="${formatURL(col.wa)}" target="_blank" class="wa"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
                                            ${col.tw ? `<a href="${formatURL(col.tw)}" target="_blank" class="tw"><i class="fa-brands fa-x-twitter"></i></a>` : ''}
                                            ${col.tg ? `<a href="${formatURL(col.tg)}" target="_blank" class="tg"><i class="fa-brands fa-telegram"></i></a>` : ''}
                                            ${col.ln ? `<a href="${formatURL(col.ln)}" target="_blank" class="ln"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
                                        </div>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="mega-col mega-links-col">
                                        <h4 class="mega-col-title">${col.title || 'লিংক'}</h4>
                                        <div class="mega-col-links">
                                            ${(col.links || []).map(lk => `<a href="${formatURL(lk.url)}"><i class="fa-solid fa-angle-right" style="font-size:10px; margin-right:5px; color:var(--primary);"></i> ${lk.title}</a>`).join('')}
                                        </div>
                                    </div>
                                `;
                            }
                        }).join('');
                        subMenuHTML = `<div class="mega-menu"><div class="mega-grid-container">${colsHtml}</div></div>`;
                    }
                } else if (hasRegularSub) {
                    subMenuHTML = `
                        <ul class="dropdown-menu">
                            ${item.subMenus.map(sub => `<li><a href="${formatURL(sub.url)}">${sub.title}</a></li>`).join('')}
                        </ul>
                    `;
                }
                
                return `
                    <li class="nav-item ${(hasRegularSub || isMega) ? 'has-dropdown' : ''} ${isMega ? 'has-mega-menu' : ''}">
                        <a href="${formatURL(item.url)}" class="dropdown-toggle-link">${item.title} ${(hasRegularSub || isMega) ? '<i class="fa-solid fa-chevron-down" style="font-size:11px; margin-left:3px;"></i>' : ''}</a>
                        ${subMenuHTML}
                    </li>
                `;
            }).join('');
        }

        const authLink = getAuthRedirectLink();
        const isLoggedIn = !authLink.includes('login.html');
        const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');
        let userName = 'লগইন';
        if (isLoggedIn) {
            try {
                const user = JSON.parse(userStr || '{}');
                if (user.name) userName = user.name.split(' ')[0];
                else userName = 'ড্যাশবোর্ড';
            } catch(e) { userName = 'ড্যাশবোর্ড'; }
        }

        let customBtnHTML = '';
        if (h.btnText && h.btnText.trim()) {
            let customBtnText = h.btnText.trim();
            let rawLink = (h.btnLink || '').trim();
            let customBtnLink = (rawLink && !rawLink.includes('login.html')) ? formatURL(rawLink) : homePath + '#mission';
            
            customBtnHTML = `
                <a href="${customBtnLink}" class="btn-primary-head">
                    <i class="fa-solid fa-headset"></i> ${customBtnText}
                </a>
            `;
        }

        let headerBtnHTML = `
            <div class="header-btn-group">
                ${customBtnHTML}
                <a href="${authLink}" class="btn-auth-head" style="background-color: #1d283a !important; color: white !important; border: 1px solid #1d283a !important;">
                    <i class="fa-solid fa-circle-user"></i> ${userName}
                </a>
            </div>
        `;

        headerContainer.innerHTML = `
            <div class="header-wrapper">
                <div class="site-logo">
                    <a href="${window.location.pathname.includes('/admin/') ? '../' + homePath : homePath}">${logoHTML}</a>
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

        let columnsData = f.columns;
        if (!columnsData || !Array.isArray(columnsData)) {
            columnsData = [
                { type: 'info', title: 'আমাদের সম্পর্কে', text: f.col1Text || '', fb: f.col1Fb, yt: f.col1Yt, wa: f.col1Wa, tw: f.col1Tw, tg: f.col1Tg, ln: f.col1Ln },
                { type: 'links', title: f.col2Title || 'প্রয়োজনীয় লিংক', links: f.col2Links || [] },
                { type: 'links', title: f.col3Title || 'ক্যাটাগরি', links: f.col3Links || [] },
                { type: 'links', title: f.col4Title || 'যোগাযোগ', links: f.col4Links || [] }
            ];
        }

        const columnsHTML = columnsData.map(col => {
            if (col.type === 'info') {
                return `
                    <div class="footer-col info-col">
                        <h4>${col.title || 'আমাদের সম্পর্কে'}</h4>
                        <p>${col.text || ''}</p>
                        <div class="footer-social">
                            ${col.fb ? `<a href="${formatURL(col.fb)}" target="_blank" title="Facebook" class="social-btn fb"><i class="fa-brands fa-facebook-f"></i></a>` : ''}
                            ${col.yt ? `<a href="${formatURL(col.yt)}" target="_blank" title="YouTube" class="social-btn yt"><i class="fa-brands fa-youtube"></i></a>` : ''}
                            ${col.wa ? `<a href="${formatURL(col.wa)}" target="_blank" title="WhatsApp" class="social-btn wa"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
                            ${col.tw ? `<a href="${formatURL(col.tw)}" target="_blank" title="Twitter / X" class="social-btn tw"><i class="fa-brands fa-x-twitter"></i></a>` : ''}
                            ${col.tg ? `<a href="${formatURL(col.tg)}" target="_blank" title="Telegram" class="social-btn tg"><i class="fa-brands fa-telegram"></i></a>` : ''}
                            ${col.ln ? `<a href="${formatURL(col.ln)}" target="_blank" title="LinkedIn" class="social-btn ln"><i class="fa-brands fa-linkedin-in"></i></a>` : ''}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="footer-col">
                        <h4>${col.title || 'প্রয়োজনীয় লিংক'}</h4>
                        ${generateLinksHtml(col.links)}
                    </div>
                `;
            }
        }).join('');

        let hasLinks = c.links && c.links.length > 0;
        let copyTextValue = c.text !== undefined ? c.text : '© ' + new Date().getFullYear() + ' TopMCQ. All rights reserved.';
        let textAlignmentClass = hasLinks ? 'text-left' : 'text-center';
        let copyTextHtml = copyTextValue ? `<div class="footer-copy-text ${textAlignmentClass}">${copyTextValue}</div>` : '';

        let copyLinksHtml = '';
        if (hasLinks) {
            const linksA = c.links.map(l => `<a href="${formatURL(l.url)}">${l.title}</a>`).join('<span class="sep"> | </span>');
            copyLinksHtml = `<div class="footer-copy-links">${linksA}</div>`;
        }

        footerContainer.innerHTML = `
            <div class="footer-container">
                <div class="footer-grid">
                    ${columnsHTML}
                </div>
                <div class="footer-bottom">
                    ${copyTextHtml}
                    ${copyLinksHtml}
                </div>
            </div>
        `;
    }
}

// Function: Mobile Navigation Toggles (💡 JS DYNAMIC PADDING CALCULATION)
function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const siteNav = document.getElementById('site-nav');
    const header = document.getElementById('global-header');

    // 💡 ফাংশন: স্ক্রল হলে ডায়নামিক প্যাডিং অ্যাড করা
    function updateNavState() {
        if (siteNav && siteNav.classList.contains('active')) {
            const headerHeight = header ? header.offsetHeight : 65;
            const availableHeight = window.innerHeight - headerHeight;
            siteNav.style.maxHeight = availableHeight + 'px';
            
            // 💡 কন্টেন্ট কতটুকু জায়গা নিচ্ছে তা চেক করার জন্য আগে প্যাডিং রিসেট করা হচ্ছে
            siteNav.style.paddingBottom = '20px';
            
            // যদি কন্টেন্টের হাইট এভেইলেবল হাইটের চেয়ে বেশি হয়, তার মানে স্ক্রল হচ্ছে
            if (siteNav.scrollHeight > availableHeight) {
                siteNav.style.paddingBottom = '120px'; // স্ক্রল হলে নিচের বারের জন্য এক্সট্রা প্যাডিং
            }
        }
    }

    if (toggleBtn && siteNav) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            siteNav.classList.toggle('active');
            const icon = toggleBtn.querySelector('i');
            
            if (siteNav.classList.contains('active')) {
                if(icon) icon.className = 'fa-solid fa-xmark';
                document.body.style.overflow = 'hidden'; // Lock Body Scroll
                updateNavState(); // 💡 ডায়নামিক হাইট ও প্যাডিং আপডেট
            } else {
                if(icon) icon.className = 'fa-solid fa-bars';
                document.body.style.overflow = '';
                siteNav.style.maxHeight = ''; // Reset
                siteNav.style.paddingBottom = ''; // Reset
            }
        };

        window.addEventListener('resize', updateNavState);

        document.onclick = (e) => {
            if (!siteNav.contains(e.target) && !toggleBtn.contains(e.target)) {
                siteNav.classList.remove('active');
                const icon = toggleBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
                document.body.style.overflow = '';
                siteNav.style.maxHeight = ''; // Reset
                siteNav.style.paddingBottom = ''; // Reset
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
                        
                        // 💡 সাব-মেনু ওপেন/ক্লোজ হলে হাইট পরিবর্তন হয়, তাই একটু ডিলিট করে পুনরায় আপডেট কল করা হলো
                        setTimeout(updateNavState, 50); 
                    }
                }
            };
        });
    }
}

// Execute on DOM Ready
document.addEventListener('DOMContentLoaded', renderGlobalLayout);