// Function to Render Global Admin Navigation Bar
function renderAdminNavbar() {
    const navbarWrapper = document.getElementById('admin-navbar-container');
    if (!navbarWrapper) return;

    navbarWrapper.className = 'navbar-wrapper';
    navbarWrapper.innerHTML = `
        <div class="navbar">
            <div class="navbar-brand">
                <i class="fa-solid fa-gauge-high"></i> অ্যাডমিন ড্যাশবোর্ড
            </div>
            <div class="nav-actions">
                <a href="dashboard.html" class="btn-nav btn-main-dash">
                    <i class="fa-solid fa-house"></i> Main Dashboard
                </a>
                <a href="quiz-dashboard.html" class="btn-nav btn-mcq-dash">
                    <i class="fa-solid fa-pen-to-square"></i> MCQ Dashboard
                </a>
                <a href="users.html" class="btn-nav btn-payment-users">
                    <i class="fa-solid fa-credit-card"></i> Payment & Users
                </a>
                <a href="../index.html" class="btn-nav btn-outline" target="_blank">
                    <i class="fa-solid fa-globe"></i> মূল ওয়েবসাইট
                </a>
                <button class="btn-nav btn-danger-nav" onclick="logout()">
                    <i class="fa-solid fa-right-from-bracket"></i> লগআউট
                </button>
            </div>
        </div>
    `;
}

// DOM লোড হওয়া মাত্রই নেভবার বসিয়ে দিবে
document.addEventListener('DOMContentLoaded', renderAdminNavbar);