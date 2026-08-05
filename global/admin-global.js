window.MENU_API_URL = window.MENU_API_URL || 'https://mosabber-quiz-app.onrender.com/api/sidebar-config';

// Function to Render Global Admin LEFT SIDEBAR Navigation
async function renderAdminNavbar() {
    const navbarWrapper = document.getElementById('admin-navbar-container');
    if (!navbarWrapper) return;

    // লোকাল স্টোরেজ থেকে ইউজার নাম নেওয়া
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
        { href: 'dashboard.html', icon: 'fa-gauge-high', label: 'ড্যাশবোর্ড' },
        { href: 'header-dashboard.html', icon: 'fa-window-restore', label: 'হেডার কন্ট্রোল' },
        { href: 'footer-dashboard.html', icon: 'fa-table-columns', label: 'ফুটার কন্ট্রোল' },
        { href: 'home-dashboard.html', icon: 'fa-sliders', label: 'হোম পেজ কন্ট্রোল' },
        { href: 'about-dashboard.html', icon: 'fa-address-card', label: 'আমাদের সম্পর্কে' },
        { href: 'quiz-dashboard.html', icon: 'fa-file-circle-question', label: 'প্রশ্ন ব্যাংক ও কুইজ' },
        { href: 'packages-dashboard.html', icon: 'fa-box-open', label: 'প্যাকেজসমূহ পেজ' },
        { href: 'users.html', icon: 'fa-users-gear', label: 'ইউজার ও সাবস্ক্রিপশন' },
        { href: 'admin-menu-dashboard.html', icon: 'fa-list-check', label: 'সাইডবার মেনু কন্ট্রোল' },
        { href: 'policy-dashboard.html', icon: 'fa-file-invoice-dollar', label: 'রিফান্ড ও পলিসি' },
    ];

    let menuItems = defaultMenuItems;

    // ব্যাকএন্ড API থেকে ডায়নামিক সাইডবার মেনু লোড করার চেষ্টা করা
    try {
        const res = await fetch(window.MENU_API_URL);
        if (res.ok) {
            const data = await res.json();
            if (data.menus && data.menus.length > 0) {
                menuItems = data.menus.map(item => ({
                    href: item.url,
                    icon: item.icon ? item.icon.replace('fa-solid ', '') : 'fa-circle',
                    label: item.title
                }));
            }
        }
    } catch (err) {
        console.warn("Sidebar Dynamic Menu Load Failed, using default list.", err);
    }

    const menuHTML = menuItems.map(item => {
        const isActive = currentPage === item.href ? 'active' : '';
        const iconClass = item.icon.includes('fa-') ? item.icon : `fa-solid ${item.icon}`;
        return `
            <a href="${item.href}" class="sidebar-link ${isActive}" title="${item.label}">
                <i class="${iconClass}"></i>
                <span>${item.label}</span>
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
                    <i class="fa-solid fa-globe"></i>
                    <span>মূল ওয়েবসাইট</span>
                </a>
                <a href="admin-profile.html" class="sidebar-link ${currentPage === 'admin-profile.html' ? 'active' : ''}" title="${userName}">
                    <i class="fa-solid fa-user-shield"></i>
                    <span>${userName}</span>
                </a>
                <a href="#" class="sidebar-link logout-link" onclick="logout(); return false;" title="লগআউট">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>লগআউট</span>
                </a>
            </div>
        </aside>
    `;
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
        window.location.replace('../login.html');
    }
}

// DOM লোড হওয়া মাত্রই সাইডবার বসিয়ে দিবে
document.addEventListener('DOMContentLoaded', renderAdminNavbar);