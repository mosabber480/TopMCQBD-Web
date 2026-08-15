'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminLogoutModal from './AdminLogoutModal';
import { formatURL } from '@/lib/config';

const defaultMenuItems = [
  { href: '/admin/dashboard', icon: 'fa-solid fa-gauge-high', label: 'ড্যাশবোর্ড', subMenus: [] },
  { href: '/admin/header-dashboard', icon: 'fa-solid fa-window-restore', label: 'হেডার কন্ট্রোল', subMenus: [] },
  { href: '/admin/footer-dashboard', icon: 'fa-solid fa-table-columns', label: 'ফুটার কন্ট্রোল', subMenus: [] },
  { href: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', label: 'হোম পেজ কন্ট্রোল', subMenus: [] },
  { href: '/admin/about-dashboard', icon: 'fa-solid fa-address-card', label: 'আমাদের সম্পর্কে', subMenus: [] },
  { href: '/admin/quiz-dashboard', icon: 'fa-solid fa-file-circle-question', label: 'প্রশ্ন ব্যাংক ও কুইজ', subMenus: [] },
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

    // Fetch dynamic sidebar config
    fetch('/api/sidebar-config')
      .then(res => res.json())
      .then(data => {
        if (data && data.menus && data.menus.length > 0) {
          const items = data.menus.map(item => ({
            href: item.url,
            icon: item.icon || 'fa-solid fa-circle',
            label: item.title,
            subMenus: item.subMenus || []
          }));
          setMenuItems(items);
        }
      })
      .catch(() => {});
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleDesktopSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (nextState) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    try {
      localStorage.setItem('sidebar_collapsed', nextState.toString());
    } catch (e) {}
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleSubmenu = (index, e) => {
    e.preventDefault();
    setOpenSubmenuIndex(openSubmenuIndex === index ? null : index);
  };

  return (
    <>
      <div className="sidebar-wrapper">
        {/* Mobile Toggle Button */}
        <button
          className="mobile-sidebar-toggle"
          onClick={toggleMobileSidebar}
          aria-label="Toggle Sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* Mobile Overlay */}
        <div
          className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
          onClick={toggleMobileSidebar}
        ></div>

        <aside className={`sidebar ${mobileOpen ? 'active' : ''}`} id="adminSidebar">
          <div className="sidebar-header">
            <Link href="/admin/dashboard" className="sidebar-brand" style={{ display: isCollapsed ? 'none' : 'flex' }}>
              <i className="fa-solid fa-unlock-keyhole" style={{ color: '#38bdf8' }}></i>
              <span>অ্যাডমিন প্যানেল</span>
            </Link>

            <button
              className="desktop-sidebar-collapse-btn"
              onClick={toggleDesktopSidebar}
              title="Toggle Sidebar"
            >
              <i className={`fa-solid ${isCollapsed ? 'fa-outdent' : 'fa-indent'}`}></i>
            </button>

            <button
              className="sidebar-close-btn"
              onClick={toggleMobileSidebar}
              aria-label="Close Sidebar"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

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
                            href={formatURL(sub.url)}
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
                  href={formatURL(item.href)}
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

          <div className="sidebar-footer">
            <Link href="/" className="sidebar-link" target="_blank" title="মূল ওয়েবসাইট">
              <div className="link-content">
                <i className="fa-solid fa-globe"></i>
                <span>মূল ওয়েবসাইট</span>
              </div>
            </Link>

            <Link
              href="/admin/admin-profile"
              className={`sidebar-link ${pathname === '/admin/admin-profile' ? 'active' : ''}`}
              title={userName}
            >
              <div className="link-content">
                <i className="fa-solid fa-user-shield"></i>
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

      <AdminLogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </>
  );
}
