// Function to Render Global Admin LEFT SIDEBAR Navigation
function renderAdminNavbar() {
    const navbarWrapper = document.getElementById('admin-navbar-container');
    if (!navbarWrapper) return;

    // লোকাল স্টোরেজ থেকে ইউজার নাম নেওয়া
    const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}');
    const userName = user.name || 'Profile';

    // বর্তমান পেজের ফাইলনেম বের করা (active menu হাইলাইট করার জন্য)
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';

    // সাইডবার মেনু আইটেম লিস্ট (সহজে আপডেট করা যাবে)
    const menuItems = [
        { href: 'dashboard.html', icon: 'fa-gauge-high', label: 'ড্যাশবোর্ড' },
        { href: 'header-dashboard.html', icon: 'fa-window-restore', label: 'হেডার কন্ট্রোল' },
        { href: 'footer-dashboard.html', icon: 'fa-table-columns', label: 'ফুটার কন্ট্রোল' },
        { href: 'home-dashboard.html', icon: 'fa-sliders', label: 'হোম পেজ কন্ট্রোল' },
        { href: 'about-dashboard.html', icon: 'fa-address-card', label: 'আমাদের সম্পর্কে' },
        { href: 'quiz-dashboard.html', icon: 'fa-file-circle-question', label: 'প্রশ্ন ব্যাংক ও কুইজ' },
        { href: 'packages-dashboard.html', icon: 'fa-box-open', label: 'প্যাকেজসমূহ পেজ' },
        { href: 'users.html', icon: 'fa-users-gear', label: 'ইউজার ও সাবস্ক্রিপশন' },
        { href: 'policy-dashboard.html', icon: 'fa-file-invoice-dollar', label: 'রিফান্ড ও পলিসি' },
    ];

    const menuHTML = menuItems.map(item => {
        const isActive = currentPage === item.href ? 'active' : '';
        return `
            <a href="${item.href}" class="sidebar-link ${isActive}">
                <i class="fa-solid ${item.icon}"></i>
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
                <a href="dashboard.html" class="sidebar-brand">
                    <i class="fa-solid fa-unlock-keyhole"></i>
                    <span>অ্যাডমিন প্যানেল</span>
                </a>
                <button class="sidebar-close-btn" onclick="toggleSidebar()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <nav class="sidebar-menu">
                ${menuHTML}
            </nav>

            <div class="sidebar-footer">
                <a href="../index.html" class="sidebar-link" target="_blank">
                    <i class="fa-solid fa-globe"></i>
                    <span>মূল ওয়েবসাইট</span>
                </a>
                <a href="admin-profile.html" class="sidebar-link ${currentPage === 'admin-profile.html' ? 'active' : ''}">
                    <i class="fa-solid fa-user-shield"></i>
                    <span>${userName}</span>
                </a>
                <a href="#" class="sidebar-link logout-link" onclick="logout(); return false;">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>লগআউট</span>
                </a>
            </div>
        </aside>
    `;
}

// মোবাইল/ট্যাবলেট এ সাইডবার খোলা-বন্ধ করার ফাংশন
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// সেন্ট্রালাইজড লগআউট ফাংশন (প্রতিটা admin পেজের ইনলাইন স্ক্রিপ্টে আলাদা করে লেখা লাগবে না)
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