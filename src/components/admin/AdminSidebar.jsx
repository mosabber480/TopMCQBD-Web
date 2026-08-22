'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminLogoutModal from './AdminLogoutModal';
import { formatURL } from '@/lib/config';

import sidebarConfigData from '@/data/sidebar-config.json';

const defaultMenuItems = (sidebarConfigData?.menus && sidebarConfigData.menus.length > 0)
  ? sidebarConfigData.menus.map(item => ({
      href: item.url,
      icon: item.icon || 'fa-solid fa-circle',
      label: item.title,
      subMenus: item.subMenus || []
    }))
  : [
      { href: '/admin/dashboard', icon: 'fa-solid fa-gauge-high', label: 'ড্যাশবোর্ড', subMenus: [] },
      { href: '/admin/header-dashboard', icon: 'fa-solid fa-window-restore', label: 'হেডার কন্ট্রোল', subMenus: [] },
      { href: '/admin/footer-dashboard', icon: 'fa-solid fa-table-columns', label: 'ফুটার কন্ট্রোল', subMenus: [] },
      { href: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', label: 'হোম পেজ কন্ট্রোল', subMenus: [] },
      { href: '/admin/about-dashboard', icon: 'fa-solid fa-address-card', label: 'আমাদের সম্পর্কে', subMenus: [] },
      { href: '/admin/questions-dashboard', icon: 'fa-solid fa-file-circle-question', label: 'প্রশ্ন ব্যাংক ও কুইজ', subMenus: [] },
      { href: '/admin/packages-dashboard', icon: 'fa-solid fa-box-open', label: 'প্যাকেজসমূহ পেজ', subMenus: [] },
      { href: '/admin/users', icon: 'fa-solid fa-users-gear', label: 'ইউজার ও সাবস্ক্রিপশন', subMenus: [] },
      { href: '/admin/admin-menu-dashboard', icon: 'fa-solid fa-list-check', label: 'সাইডবার মেনু কন্ট্রোল', subMenus: [] },
      { href: '/admin/policy-dashboard', icon: 'fa-solid fa-file-invoice-dollar', label: 'রিফান্ড ও পলিসি', subMenus: [] },
      { href: '/admin/free-mcqs-dashboard', icon: 'fa-solid fa-gift', label: 'ফ্রি এমসিকিউ কন্ট্রোল', subMenus: [] }
    ];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuItems, setMenuItems] = useState(defaultMenuItems);
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('অ্যাডমিন');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.name) setUserName(u.name);
      }

      const collapsedState = localStorage.getItem('sidebar_collapsed') === 'true';
      setIsCollapsed(collapsedState);
      if (collapsedState) {
        document.body.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sidebar-collapsed');
      }
    } catch (e) {}

    const handleSync = () => {
      try {
        const state = localStorage.getItem('sidebar_collapsed') === 'true';
        setIsCollapsed(state);
      } catch (e) {}
    };

    window.addEventListener('sidebar-toggle', handleSync);

    return () => window.removeEventListener('sidebar-toggle', handleSync);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }, [pathname]);

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
  };

  const toggleSubmenu = (index, e) => {
    e.preventDefault();
    setOpenSubmenuIndex(openSubmenuIndex === index ? null : index);
  };

  return (
    <>
      <div className="sidebar-wrapper">
        {/* Mobile Overlay */}
        <div
          className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
          onClick={toggleMobileSidebar}
        ></div>

        <aside className={`sidebar ${mobileOpen ? 'active' : ''}`} id="adminSidebar">
          {/* Mobile Only Header Row with Close button */}
          <div className="sidebar-mobile-header">
            <span className="mobile-brand-title">
              <i className="fa-solid fa-unlock-keyhole" style={{ color: '#38bdf8', marginRight: '8px' }}></i>
              মেনু অপশন
            </span>
            <button
              className="sidebar-close-btn"
              onClick={toggleMobileSidebar}
              aria-label="Close Sidebar"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Main Sidebar Navigation Menu */}
          <nav className="sidebar-menu">
            {menuItems.map((item, index) => {
              const hasSub = item.subMenus && item.subMenus.length > 0;
              const isSubActive = hasSub && item.subMenus.some(sub => pathname === sub.url);
              const isActive = pathname === item.href || isSubActive;
              const isSubOpen = openSubmenuIndex === index || isSubActive;

              let rawIcon = (item.icon || '').trim();
              const hasPrefix = rawIcon.startsWith('fa-solid') || rawIcon.startsWith('fa-brands') || rawIcon.startsWith('fa-regular');
              const iconClass = hasPrefix ? rawIcon : `fa-solid ${rawIcon}`;

              if (hasSub) {
                return (
                  <div key={index} className={`sidebar-item-group ${isSubOpen ? 'open' : ''}`}>
                    <a
                      href="#"
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => toggleSubmenu(index, e)}
                      title={item.label}
                    >
                      <div className="link-content">
                        <i className={iconClass}></i>
                        <span>{item.label}</span>
                      </div>
                      <i className="fa-solid fa-chevron-down submenu-arrow"></i>
                    </a>
                    <div className="sidebar-submenu" style={{ display: isSubOpen ? 'block' : 'none' }}>
                      {item.subMenus.map((sub, sIdx) => {
                        let subRawIcon = (sub.icon || 'fa-solid fa-circle').trim();
                        const subHasPrefix = subRawIcon.startsWith('fa-solid') || subRawIcon.startsWith('fa-brands') || subRawIcon.startsWith('fa-regular');
                        const subIconClass = subHasPrefix ? subRawIcon : `fa-solid ${subRawIcon}`;
                        const subActive = pathname === sub.url;

                        return (
                          <Link
                            key={sIdx}
                            href={formatURL(sub.url || '#')}
                            className={`sidebar-sublink ${subActive ? 'active' : ''}`}
                            title={sub.title}
                          >
                            <i className={subIconClass}></i>
                            <span>{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={index}
                  href={formatURL(item.href || '#')}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  title={item.label}
                >
                  <div className="link-content">
                    <i className={iconClass}></i>
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Sidebar Footer */}
          <div className="sidebar-footer">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="sidebar-link" title="মূল ওয়েবসাইট">
              <div className="link-content">
                <i className="fa-solid fa-globe" style={{ color: '#38bdf8' }}></i>
                <span>মূল ওয়েবসাইট</span>
              </div>
            </Link>

            <Link href="/admin/admin-profile" className="sidebar-link" title="প্রোফাইল সেটিংস">
              <div className="link-content">
                <i className="fa-solid fa-user-gear" style={{ color: '#4ade80' }}></i>
                <span>{userName}</span>
              </div>
            </Link>

            <a
              href="#"
              className="sidebar-link logout-link"
              onClick={(e) => {
                e.preventDefault();
                setLogoutModalOpen(true);
              }}
              title="লগআউট"
            >
              <div className="link-content">
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>লগআউট</span>
              </div>
            </a>
          </div>
        </aside>
      </div>

      {/* Admin Logout Confirmation Modal */}
      <AdminLogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('quiz_token');
          localStorage.removeItem('user');
          localStorage.removeItem('quiz_user');
          router.push('/login');
        }}
      />
    </>
  );
}
