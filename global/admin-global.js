window.MENU_API_URL = window.MENU_API_URL || 'https://mosabber-quiz-app.onrender.com/api/sidebar-config';

// Function to Render Global Admin LEFT SIDEBAR Navigation
async function renderAdminNavbar() {
    const navbarWrapper = document.getElementById('admin-navbar-container');
    if (!navbarWrapper) return;

    // ১. লোকাল স্টোরেজ থেকে ইউজার নাম নেওয়া
    const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}');
    const userName = user.name || 'Profile';

    // বর্তমান পেজের ফাইলনেম বের করা (active menu হাইলাইট করার জন্য)
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    // সাইডবার আগে থেকেই কল্যাপসড ছিল কি না তা চেক করা
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
    }

    // ব্যাকআপ/ডিফল্ট সাইডবার মেনু আইটেম লিস্ট
    const defaultMenuItems = [
        { href: 'dashboard.html', icon: 'fa-solid fa-gauge-high', label: 'ড্যাশবোর্ড', subMenus: [] },
        { href: 'header-dashboard.html', icon: 'fa-solid fa-window-restore', label: 'হেডার কন্ট্রোল', subMenus: [] },
        { href: 'footer-dashboard.html', icon: 'fa-solid fa-table-columns', label: 'ফুটার কন্ট্রোল', subMenus: [] },
        { href: 'home-dashboard.html', icon: 'fa-solid fa-sliders', label: 'হোম পেজ কন্ট্রোল', subMenus: [] },
        { href: 'about-dashboard.html', icon: 'fa-solid fa-address-card', label: 'আমাদের সম্পর্কে', subMenus: [] },
        { href: 'quiz-dashboard.html', icon: 'fa-solid fa-file-circle-question', label: 'প্রশ্ন ব্যাংক ও কুইজ', subMenus: [] },
        { href: 'packages-dashboard.html', icon: 'fa-solid fa-box-open', label: 'প্যাকেজসমূহ পেজ', subMenus: [] },
        { href: 'users.html', icon: 'fa-solid fa-users-gear', label: 'ইউজার ও সাবস্ক্রিপশন', subMenus: [] },
        { href: 'admin-menu-dashboard.html', icon: 'fa-solid fa-list-check', label: 'সাইডবার মেনু কন্ট্রোল', subMenus: [] },
        { href: 'policy-dashboard.html', icon: 'fa-solid fa-file-invoice-dollar', label: 'রিফান্ড ও পলিসি', subMenus: [] },
    ];

    // ২. ব্রাউজারের LocalStorage থেকে জমানো/ক্যাশড মেনু ডাটা পড়া
    const cachedMenus = localStorage.getItem('cached_sidebar_menus');
    let menuItems = cachedMenus ? JSON.parse(cachedMenus) : defaultMenuItems;

    // ৩. প্রথমবার ইনস্ট্যান্ট ক্যাশড ডাটা দিয়ে সাইডবার রেন্ডার করে দেওয়া (যাতে কোনো ডিলে না হয়)
    buildAndInjectSidebarHTML(navbarWrapper, menuItems, currentPage, userName, isCollapsed);

    // ৪. ব্যাকগ্রাউন্ডে API থেকে ফ্রেশ ডাটা আনা এবং কোনো পরিবর্তন থাকলে ক্যাশ ও UI আপডেট করা
    try {
        const res = await fetch(window.MENU_API_URL);
        if (res.ok) {
            const data = await res.json();
            if (data.menus && data.menus.length > 0) {
                const fetchedMenuItems = data.menus.map(item => ({
                    href: item.url,
                    icon: item.icon || 'fa-solid fa-circle',
                    label: item.title,
                    subMenus: item.subMenus || []
                }));

                const fetchedStr = JSON.stringify(fetchedMenuItems);
                
                // ক্যাশের ডাটার সাথে সার্ভারের ডাটা মিলিয়ে দেখা
                if (cachedMenus !== fetchedStr) {
                    localStorage.setItem('cached_sidebar_menus', fetchedStr);
                    buildAndInjectSidebarHTML(navbarWrapper, fetchedMenuItems, currentPage, userName, isCollapsed);
                }
            }
        }
    } catch (err) {
        console.warn("Sidebar Dynamic Menu Load Failed, using cached/default list.", err);
    }
}

// সাইডবার HTML জেনারেট ও ডোমে বসানোর কেন্দ্রীয় ফাংশন
function buildAndInjectSidebarHTML(navbarWrapper, menuItems, currentPage, userName, isCollapsed) {
    const menuHTML = menuItems.map((item, index) => {
        const hasSubMenu = item.subMenus && item.subMenus.length > 0;
        const isSubActive = hasSubMenu && item.subMenus.some(sub => sub.url === currentPage);
        const isActive = currentPage === item.href || isSubActive ? 'active' : '';

        // fa-solid / fa-brands / fa-regular আগে থেকে না থাকলে fa-solid অটো বসিয়ে দেওয়ার লজিক
        let rawIcon = (item.icon || '').trim();
        const hasPrefix = rawIcon.startsWith('fa-solid') || rawIcon.startsWith('fa-brands') || rawIcon.startsWith('fa-regular');
        const iconClass = hasPrefix ? rawIcon : `fa-solid ${rawIcon}`;

        if (hasSubMenu) {
            const subItemsHTML = item.subMenus.map(sub => {
                let subRawIcon = (sub.icon || 'fa-solid fa-circle').trim();
                const subHasPrefix = subRawIcon.startsWith('fa-solid') || subRawIcon.startsWith('fa-brands') || subRawIcon.startsWith('fa-regular');
                const subIconClass = subHasPrefix ? subRawIcon : `fa-solid ${subRawIcon}`;
                const subActive = currentPage === sub.url ? 'active' : '';

                return `
                    <a href="${sub.url}" class="sidebar-sublink ${subActive}" title="${sub.title}">
                        <i class="${subIconClass}"></i>
                        <span>${sub.title}</span>
                    </a>
                `;
            }).join('');

            return `
                <div class="sidebar-item-group ${isSubActive ? 'open' : ''}">
                    <a href="#" class="sidebar-link ${isActive}" onclick="toggleSidebarSubMenu(event, 'submenu-${index}')" title="${item.label}">
                        <div class="link-content">
                            <i class="${iconClass}"></i>
                            <span>${item.label}</span>
                        </div>
                        <i class="fa-solid fa-chevron-down submenu-arrow"></i>
                    </a>
                    <div class="sidebar-submenu" id="submenu-${index}" style="display: ${isSubActive ? 'block' : 'none'};">
                        ${subItemsHTML}
                    </div>
                </div>
            `;
        }

        return `
            <a href="${item.href}" class="sidebar-link ${isActive}" title="${item.label}">
                <div class="link-content">
                    <i class="${iconClass}"></i>
                    <span>${item.label}</span>
                </div>
            </a>`;
    }).join('');

    navbarWrapper.className = 'sidebar-wrapper';
    navbarWrapper.innerHTML = `
        <!-- মোবাইল টগল বাটন -->
        <button class="mobile-sidebar-toggle" id="mobileSidebarToggle" onclick="toggleSidebar()">
            <i class="fa-solid fa-bars"></i>
        </button>

        <!-- মোবাইলে সাইডবার খোলা থাকলে পিছনে অন্ধকার ওভারলে -->
        <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

        <aside class="sidebar" id="adminSidebar">
            <div class="sidebar-header">
                <a href="dashboard.html" class="sidebar-brand" style="${isCollapsed ? 'display:none;' : ''}">
                    <i class="fa-solid fa-unlock-keyhole"></i>
                    <span>অ্যাডমিন প্যানেল</span>
                </a>
                <!-- ডেস্কটপ কোল্যাপ্স / এক্সপান্ড আইকন বাটন -->
                <button class="desktop-sidebar-collapse-btn" onclick="toggleDesktopSidebar()" title="Toggle Sidebar">
                    <i class="fa-solid ${isCollapsed ? 'fa-outdent' : 'fa-indent'}"></i>
                </button>
                <button class="sidebar-close-btn" onclick="toggleSidebar()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <nav class="sidebar-menu">
                ${menuHTML}
            </nav>

            <div class="sidebar-footer">
                <a href="../index.html" class="sidebar-link" target="_blank" title="মূল ওয়েবসাইট">
                    <div class="link-content">
                        <i class="fa-solid fa-globe"></i>
                        <span>মূল ওয়েবসাইট</span>
                    </div>
                </a>
                <a href="admin-profile.html" class="sidebar-link ${currentPage === 'admin-profile.html' ? 'active' : ''}" title="${userName}">
                    <div class="link-content">
                        <i class="fa-solid fa-user-shield"></i>
                        <span>${userName}</span>
                    </div>
                </a>
                <a href="#" class="sidebar-link logout-link" onclick="logout(); return false;" title="লগআউট">
                    <div class="link-content">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>লগআউট</span>
                    </div>
                </a>
            </div>
        </aside>
    `;
}

// সাব-মেনু ড্রপডাউন টগল করার ফাংশন
function toggleSidebarSubMenu(event, submenuId) {
    event.preventDefault();
    const submenu = document.getElementById(submenuId);
    if (!submenu) return;

    const parentGroup = submenu.closest('.sidebar-item-group');
    const isVisible = submenu.style.display === 'block';

    if (isVisible) {
        submenu.style.display = 'none';
        if (parentGroup) parentGroup.classList.remove('open');
    } else {
        submenu.style.display = 'block';
        if (parentGroup) parentGroup.classList.add('open');
    }
}

// ডেস্কটপে সাইডবার ছোট/বড় করার ফাংশন
function toggleDesktopSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
    
    // লোকাল স্টোরেজে স্টেট সেভ করা
    localStorage.setItem('sidebar_collapsed', isCollapsed);

    // আইকন পরিবর্তন করা
    const iconBtn = document.querySelector('.desktop-sidebar-collapse-btn i');
    if (iconBtn) {
        iconBtn.className = isCollapsed ? 'fa-solid fa-outdent' : 'fa-solid fa-indent';
    }

    // ব্র্যান্ড টেক্সট হাইড বা শো করার জন্য
    const brandSpan = document.querySelector('.sidebar-brand');
    if (brandSpan) {
        brandSpan.style.display = isCollapsed ? 'none' : 'flex';
    }
}

// মোবাইল/ট্যাবলেট এ সাইডবার খোলা-বন্ধ করার ফাংশন
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// সেন্ট্রালাইজড লগআউট ফাংশন
async function logout() {
    const confirmed = (typeof showTopAlert === 'function')
        ? await showTopAlert('আপনি কি নিশ্চিত যে লগআউট করতে চান?', 'warning', true)
        : confirm('আপনি কি নিশ্চিত যে লগআউট করতে চান?');

    if (confirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('quiz_token');
        localStorage.removeItem('quiz_user');
        localStorage.removeItem('cached_sidebar_menus'); // ক্যাশ মেনু ডিলিট করা
        window.location.replace('../login.html');
    }
}

// DOM লোড হওয়া মাত্রই সাইডবার বসিয়ে দিবে
document.addEventListener('DOMContentLoaded', renderAdminNavbar);