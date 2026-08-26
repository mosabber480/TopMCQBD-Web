'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminLogoutModal from './AdminLogoutModal';
import { getPaidApiUrl } from '@/lib/config';

const DEFAULT_ADMIN_HEADER_BUTTONS = [
  { text: 'ওয়েবসাইট ভিজিট', url: '/', icon: 'fa-solid fa-globe', color: 'success', targetBlank: true },
  { text: 'হোম পেজ এডিটর', url: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', color: 'primary' },
  { text: 'প্রশ্ন ব্যাংক কন্ট্রোল', url: '/admin/questions-dashboard', icon: 'fa-solid fa-file-circle-question', color: 'info' },
  { text: 'ইউজার লিস্ট', url: '/admin/users', icon: 'fa-solid fa-users', color: 'warning' }
];

export default function AdminHeaderBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [headerButtons, setHeaderButtons] = useState(DEFAULT_ADMIN_HEADER_BUTTONS);
  const [user, setUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}');
      setUser(u);

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

    // Close profile dropdown when clicking outside
    const handleClickOutside = (e) => {
      const container = document.getElementById('profile-dropdown-container');
      if (container && !container.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    fetch(getPaidApiUrl('/api/sidebar-config'))
      .then(res => res.json())
      .then(data => {
        if (data && data.headerButtons && data.headerButtons.length > 0) {
          setHeaderButtons(data.headerButtons);
        } else {
          setHeaderButtons(DEFAULT_ADMIN_HEADER_BUTTONS);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('sidebar-toggle', handleSync);
      document.removeEventListener('click', handleClickOutside);
    };
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
      window.dispatchEvent(new Event('sidebar-toggle'));
    } catch (e) {}
  };

  const handleButtonClick = (btn) => {
    if (btn.action === 'logout' || btn.url === '#logout') {
      setIsProfileOpen(false);
      setTimeout(() => {
        setShowLogoutConfirm(true);
      }, 50);
      return;
    }

    if (btn.targetBlank) {
      window.open(btn.url, '_blank');
    } else {
      router.push(btn.url || '#');
    }
  };

  const getButtonBg = (color) => {
    switch (color) {
      case 'primary': return '#0284c7';
      case 'success': return '#16a34a';
      case 'danger': return '#dc2626';
      case 'warning': return '#d97706';
      case 'info': return '#0891b2';
      case 'dark': return '#334155';
      default: return '#0284c7';
    }
  };

  return (
    <header className="admin-black-header">
      <style jsx>{`
        .admin-black-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 56px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          z-index: 1200;
          box-sizing: border-box;
        }

        /* Top Left Admin Panel Brand Section */
        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .admin-mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 18px;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
        }

        .admin-panel-brand,
        .admin-panel-brand:link,
        .admin-panel-brand:visited,
        .admin-panel-brand:hover,
        .admin-panel-brand:active {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff !important;
          text-decoration: none !important;
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
          transition: opacity 0.2s ease;
        }
        .admin-panel-brand:hover {
          opacity: 0.9;
        }
        .admin-panel-brand i {
          font-size: 18px;
          color: #ffffff !important;
        }
        .admin-panel-brand .brand-text {
          color: #ffffff !important;
          font-size: 16px;
          font-weight: 700;
        }

        .desktop-collapse-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          font-size: 15px;
          cursor: pointer;
          padding: 6px 9px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .desktop-collapse-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
        }

        /* Top Right Actions & Profile Container */
        .admin-header-right-container {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: visible;
        }

        .admin-header-actions-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .admin-header-actions-wrapper::-webkit-scrollbar {
          display: none;
        }

        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
        }

        .admin-action-button {
          border: none;
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          outline: none;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .admin-action-button:hover {
          filter: brightness(1.15);
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          padding-left: 10px;
          border-left: 1px solid #334155;
          position: relative;
        }

        /* Clickable Profile Pill Button */
        .admin-user-pill-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        .admin-user-pill-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border-color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
        }

        @media (max-width: 900px) {
          .admin-mobile-toggle {
            display: flex;
          }
          .desktop-collapse-btn {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .admin-black-header {
            padding: 0 10px;
          }
          .brand-text {
            display: none;
          }
          .admin-action-button {
            padding: 5px 10px;
            font-size: 12px;
          }
        }
      `}</style>

      {/* 1. TOP LEFT: [ Collapse Toggle on LEFT ] + [ Brand: Unlock Icon + অ্যাডমিন প্যানেল ] */}
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={() => {
            const sidebar = document.getElementById('adminSidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            if (sidebar) sidebar.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
          }}
          aria-label="Toggle Sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <button
          type="button"
          className="desktop-collapse-btn"
          onClick={toggleDesktopSidebar}
          title={isCollapsed ? 'সাইডবার প্রসারিত করুন' : 'সাইডবার সংকুচিত করুন'}
        >
          <i className={`fa-solid ${isCollapsed ? 'fa-bars-staggered' : 'fa-bars'}`}></i>
        </button>

        {!isCollapsed && (
          <Link
            href="/admin/dashboard"
            className="admin-panel-brand"
            title="অ্যাডমিন ড্যাশবোর্ড"
            style={{ color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <i className="fa-solid fa-unlock-keyhole" style={{ color: '#ffffff', fontSize: '18px' }}></i>
            <span className="brand-text" style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>অ্যাডমিন প্যানেল</span>
          </Link>
        )}
      </div>

      {/* 2. TOP RIGHT: Dynamic Action Buttons + Clickable User Profile Dropdown */}
      <div className="admin-header-right-container">
        <div className="admin-header-actions-wrapper">
          <div className="admin-header-actions">
            {headerButtons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                className="admin-action-button"
                style={{ backgroundColor: getButtonBg(btn.color) }}
                onClick={() => handleButtonClick(btn)}
              >
                {btn.icon && <i className={btn.icon}></i>}
                <span>{btn.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-header-right" id="profile-dropdown-container">
          <button
            type="button"
            className="admin-user-pill-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileOpen(!isProfileOpen);
            }}
            title="প্রোফাইল মেনু খুলুন"
          >
            <i className="fa-solid fa-circle-user" style={{ color: '#38bdf8' }}></i>
            <span>{user?.name ? user.name.split(' ')[0] : 'Admin'}</span>
            <i className={`fa-solid fa-chevron-${isProfileOpen ? 'up' : 'down'}`} style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '2px' }}></i>
          </button>

          {/* Profile Dropdown Popup Menu */}
          {isProfileOpen && (
            <div
              className="profile-popup-menu"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: '60px',
                right: '20px',
                width: '270px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.75)',
                padding: '18px',
                zIndex: 999999,
                color: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
                  }}
                >
                  <i className="fa-solid fa-user-gear"></i>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'Mosabber'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                    {user?.email || 'mosabber480@gmail.com'}
                  </div>
                  <span style={{ display: 'inline-block', marginTop: '6px', background: '#0369a1', color: '#e0f2fe', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.5px' }}>
                    {user?.role ? user.role.toUpperCase() : 'OWNER'}
                  </span>
                </div>
              </div>

              <div style={{ height: '1px', background: '#334155', margin: '14px 0' }}></div>

              <button
                type="button"
                className="btn-popup-logout"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsProfileOpen(false);
                  setTimeout(() => {
                    setShowLogoutConfirm(true);
                  }, 50);
                }}
                style={{
                  width: '100%',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>লগআউট করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Logout Confirmation Modal */}
      <AdminLogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
}
