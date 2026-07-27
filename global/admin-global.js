// Function to Render Global Admin Navigation Bar
function renderAdminNavbar() {
    const navbarWrapper = document.getElementById('admin-navbar-container');
    if (!navbarWrapper) return;

    // লোকাল স্টোরেজ থেকে ইউজার নাম নেওয়া
    const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}');
    const userName = user.name || 'Profile';

    navbarWrapper.className = 'navbar-wrapper';
    navbarWrapper.innerHTML = `
        <div class="navbar">
            <!-- অ্যাডমিন ড্যাশবোর্ড -->
            <a href="dashboard.html" class="navbar-brand" style="text-decoration:none; color:white;">
                <i class="fa-solid fa-unlock-keyhole"></i> অ্যাডমিন ড্যাশবোর্ড
            </a>
            
            <div class="nav-actions">
                <!-- ১. মূল ওয়েবসাইট -->
                <a href="../index.html" class="btn-nav btn-outline" target="_blank">
                    <i class="fa-solid fa-globe"></i> মূল ওয়েবসাইট
                </a>
                
                <!-- ২. Header & Footer (Purple) -->
                <a href="header-footer-dashboard.html" class="btn-nav" style="background-color: var(--purple-btn); color: white;">
                    <i class="fa-solid fa-window-restore"></i> Header & Footer
                </a>

                <!-- ৩. MCQ Dashboard (Primary) -->
                <a href="quiz-dashboard.html" class="btn-nav" style="background-color: var(--primary); color: white;">
                    <i class="fa-solid fa-pen-to-square"></i> MCQ Dashboard
                </a>

                <!-- ৪. Payment & Users (Secondary) -->
                <a href="users.html" class="btn-nav" style="background-color: var(--secondary); color: white;">
                    <i class="fa-solid fa-credit-card"></i> Payment & Users
                </a>
                
                <!-- প্রোফাইল বাটন -->
                <a href="admin-profile.html" class="btn-nav" style="background-color: #106781; color: white; border-radius: 6px; border: 1px solid #2ba1a7;">
                    <i class="fa-solid fa-user-shield"></i> ${userName}
                </a>
            </div>
        </div>
    `;
}

// DOM লোড হওয়া মাত্রই নেভবার বসিয়ে দিবে
document.addEventListener('DOMContentLoaded', renderAdminNavbar);