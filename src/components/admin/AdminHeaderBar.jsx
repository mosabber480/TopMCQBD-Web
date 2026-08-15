'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminHeaderBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [headerButtons, setHeaderButtons] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}');
      setUser(u);
    } catch (e) {}

    fetch('/api/sidebar-config')
      .then(res => res.json())
      .then(data => {
        if (data && data.headerButtons && data.headerButtons.length > 0) {
          setHeaderButtons(data.headerButtons);
        } else {
          // Defaults if empty
          setHeaderButtons([
            { text: 'ওয়েবসাইট ভিজিট', url: '/', icon: 'fa-solid fa-globe', color: 'success', targetBlank: true },
            { text: 'হোম ড্যাশবোর্ড', url: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', color: 'primary' },
            { text: 'কুইজ ম্যানেজমেন্ট', url: '/admin/quiz-dashboard', icon: 'fa-solid fa-file-circle-question', color: 'info' },
            { text: 'ইউজার লিস্ট', url: '/admin/users', icon: 'fa-solid fa-users', color: 'warning' }
          ]);
        }
      })
      .catch(() => {});
  }, [pathname]);

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
          width: 100vw;
          height: 56px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          padding: 0 24px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          z-index: 1200;
          box-sizing: border-box;
        }
        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }
        .admin-action-button {
          border: none;
          color: #ffffff;
          padding: 7px 15px;
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
        .admin-action-button:active {
          transform: translateY(0);
        }
        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          margin-left: 5px;
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
        @media (max-width: 768px) {
          .admin-black-header {
            padding: 0 10px 0 55px; /* space for mobile toggle button */
          }
          .admin-action-button {
            padding: 5px 10px;
            font-size: 12px;
          }
        }
      `}</style>

      {/* Dynamic Header Buttons (All Aligned to Right) */}
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

      {/* Right User & Quick Logout */}
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
    </header>
  );
}
