'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminHeaderBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [headerButtons, setHeaderButtons] = useState([]);
  const [user, setUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

    fetch('/api/sidebar-config')
      .then(res => res.json())
      .then(data => {
        if (data && data.headerButtons && data.headerButtons.length > 0) {
          setHeaderButtons(data.headerButtons);
        } else {
          setHeaderButtons([
            { text: 'ওয়েবসাইট ভিজিট', url: '/', icon: 'fa-solid fa-globe', color: 'success', targetBlank: true },
            { text: 'হোম পেজ এডিটর', url: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', color: 'primary' },
            { text: 'কুইজ ম্যানেজমেন্ট', url: '/admin/quiz-dashboard', icon: 'fa-solid fa-file-circle-question', color: 'info' },
            { text: 'ইউজার লিস্ট', url: '/admin/users', icon: 'fa-solid fa-users', color: 'warning' }
          ]);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('sidebar-toggle', handleSync);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('quiz_token');
    localStorage.removeItem('user');
    localStorage.removeItem('quiz_user');
    router.push('/login');
  };

  const handleButtonClick = (btn) => {
    if (btn.action === 'logout' || btn.url === '#logout') {
      handleLogout();
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

        /* Top Right Actions & Profile */
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
        }

        .admin-user-pill {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .admin-user-pill i {
          color: #38bdf8;
        }

        .admin-logout-button {
          background: #dc2626;
          color: #ffffff;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .admin-logout-button:hover {
          background: #b91c1c;
          transform: translateY(-1px);
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

      {/* 1. TOP LEFT: [ Collapse Toggle on LEFT ] + [ Brand: Unlock Icon + অ্য়াডমিন প্যানেল (Shows when NOT collapsed) ] */}
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

      {/* 2. TOP RIGHT: Dynamic Action Buttons + User Profile + Logout */}
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

        <div className="admin-header-right">
          <span className="admin-user-pill">
            <i className="fa-solid fa-circle-user"></i>
            {user?.name ? user.name.split(' ')[0] : 'Admin'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-logout-button"
            title="লগআউট করুন"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>লগআউট</span>
          </button>
        </div>
      </div>
    </header>
  );
}
