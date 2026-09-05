'use client';

import React from 'react';
import Link from 'next/link';

export default function DbNavBox({ activeRoute }) {
  // 12 DB Specific Buttons (3 rows x 4 columns) - Pair colors (No red)
  const dbButtons = [
    {
      text: 'Cloudflare D1 Admin',
      url: '/db-connection/dbd1-admin',
      altUrl: '/dbd1-admin',
      icon: 'fa-solid fa-bolt',
      bg: '#0284c7', // Sky Blue
    },
    {
      text: 'Cloudflare D1 Test',
      url: '/db-connection/dbd1-test',
      altUrl: '/dbd1-test',
      icon: 'fa-solid fa-database',
      bg: '#0284c7', // Sky Blue
    },
    {
      text: 'Paid Core Admin',
      url: '/db-connection/dbpaid-admin',
      altUrl: '/dbpaid-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#4f46e5', // Indigo
    },
    {
      text: 'Paid Core Test',
      url: '/db-connection/dbpaid-test',
      altUrl: '/dbpaid-test',
      icon: 'fa-solid fa-globe',
      bg: '#4f46e5', // Indigo
    },
    {
      text: 'Subj MCQs Admin',
      url: '/db-connection/dbsubjective-admin',
      altUrl: '/dbsubjective-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#9333ea', // Purple
    },
    {
      text: 'Subj MCQs Test',
      url: '/db-connection/dbsubjective-test',
      altUrl: '/dbsubjective-test',
      icon: 'fa-solid fa-globe',
      bg: '#9333ea', // Purple
    },
    {
      text: 'Live Exam Admin',
      url: '/db-connection/dbliveexam-admin',
      altUrl: '/dbliveexam-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#059669', // Emerald Green
    },
    {
      text: 'Live Exam Test',
      url: '/db-connection/dbliveexam-test',
      altUrl: '/dbliveexam-test',
      icon: 'fa-solid fa-globe',
      bg: '#059669', // Emerald Green
    },
    {
      text: 'Written Admin',
      url: '/db-connection/dbwritten-admin',
      altUrl: '/dbwritten-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#d97706', // Amber Golden
    },
    {
      text: 'Written Test',
      url: '/db-connection/dbwritten-test',
      altUrl: '/dbwritten-test',
      icon: 'fa-solid fa-globe',
      bg: '#d97706', // Amber Golden
    },
    {
      text: 'Q-Bank Admin',
      url: '/db-connection/dbquestionbank-admin',
      altUrl: '/dbquestionbank-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#ea580c', // Coral Orange
    },
    {
      text: 'Q-Bank Test',
      url: '/db-connection/dbquestionbank-test',
      altUrl: '/dbquestionbank-test',
      icon: 'fa-solid fa-globe',
      bg: '#ea580c', // Coral Orange
    },
    {
      text: 'Free MCQ Admin',
      url: '/db-connection/dbfree-admin',
      altUrl: '/dbfree-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#0d9488', // Teal
    },
    {
      text: 'Free MCQ Test',
      url: '/db-connection/dbfree-test',
      altUrl: '/dbfree-test',
      icon: 'fa-solid fa-globe',
      bg: '#0d9488', // Teal
    },
  ];

  const handleLogout = () => {
    try {
      localStorage.removeItem('topmcqbd_db_suite_authenticated_v1');
      localStorage.removeItem('topmcqbd_db_suite_user_name');
      sessionStorage.removeItem('topmcqbd_db_suite_authenticated_v1');
      window.location.reload();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isAllDbActive =
    activeRoute === '/db-connection' || activeRoute === '/db-connection-check' || activeRoute === '/DB';

  const renderButton = (btn) => {
    const isActive = activeRoute === btn.url || activeRoute === btn.altUrl;
    return (
      <Link
        key={btn.url}
        href={btn.url}
        className={`db-nav-btn ${isActive ? 'active-db-btn' : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          backgroundColor: btn.bg,
          color: '#ffffff',
          textDecoration: 'none',
          padding: '0 12px',
          height: '38px',
          minHeight: '38px',
          maxHeight: '38px',
          borderRadius: '7px',
          fontSize: '12.5px',
          fontWeight: '700',
          boxShadow: isActive
            ? '0 4px 14px rgba(0,0,0,0.25)'
            : '0 2px 6px rgba(0,0,0,0.12)',
          filter: isActive ? 'brightness(1.05)' : 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          lineHeight: 'normal',
          border: 'none',
          outline: 'none',
          transition: 'all 0.2s ease',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <i
          className={btn.icon}
          style={{
            fontSize: '12px',
            width: '12px',
            height: '12px',
            lineHeight: '12px',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            flexShrink: 0,
            transform: 'translateY(-0.5px)',
          }}
        />
        <span
          style={{
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '12.5px',
            fontWeight: '700',
            lineHeight: '1',
            display: 'inline-block',
            transform: 'translateY(1.5px)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {btn.text}
        </span>
        {isActive && (
          <span
            className="active-live-bullet"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '7px',
              height: '7px',
              marginLeft: '3px',
              flexShrink: 0,
              transform: 'translateY(0.5px)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                opacity: 0.75,
                animation: 'navPulse 1.4s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
            <span
              style={{
                position: 'relative',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 6px #ffffff',
              }}
            />
          </span>
        )}
      </Link>
    );
  };

  const leftGroup = [
    dbButtons[0],
    dbButtons[1],
    dbButtons[4],
    dbButtons[5],
    dbButtons[8],
    dbButtons[9],
    dbButtons[12],
    dbButtons[13],
  ];
  const rightGroup = [
    dbButtons[2],
    dbButtons[3],
    dbButtons[6],
    dbButtons[7],
    dbButtons[10],
    dbButtons[11],
  ];

  return (
    <div className="db-nav-box-wrapper">
      {/* Top Header */}
      <div className="nav-box-title">
        <div className="title-left">
          <span className="nav-heading">Database Testing & Admin Suite</span>
        </div>
        <div className="title-right">
          <small className="nav-sub">১৪টি স্পেসিফিক ডাটাবেজ পেজ দ্রুত সুইচ করুন</small>
        </div>
      </div>

      {/* 14 Buttons Grid with Center Subtle Line on Desktop */}
      <div className="admin-actions-split-wrapper">
        <div className="admin-sub-grid">
          {leftGroup.map(renderButton)}
        </div>
        <div className="nav-vertical-divider" />
        <div className="admin-sub-grid">
          {rightGroup.map(renderButton)}
        </div>
      </div>

      {/* Bottom Dedicated Bar: ALL DB Hub (Left) & Logout (Right) */}
      <div className="bottom-hub-logout-bar">
        {/* Left: ALL DB Hub Button */}
        <Link
          href="/db-connection"
          className="all-db-hub-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#008fb0',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '9px 18px',
            borderRadius: '7px',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: isAllDbActive ? '0 4px 14px rgba(0, 143, 176, 0.45)' : '0 2px 8px rgba(0, 143, 176, 0.25)',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            lineHeight: 'normal',
          }}
        >
          <i
            className="fa-solid fa-server"
            style={{
              fontSize: '13px',
              width: '13px',
              height: '13px',
              lineHeight: '13px',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateY(-0.5px)',
            }}
          />
          <span
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '700',
              lineHeight: '1',
              display: 'inline-block',
              transform: 'translateY(1px)',
            }}
          >
            ALL DB Hub
          </span>
          {isAllDbActive && (
            <span
              className="active-live-bullet"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '7px',
                height: '7px',
                marginLeft: '4px',
                transform: 'translateY(0.5px)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  opacity: 0.75,
                  animation: 'navPulse 1.4s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 6px #ffffff',
                }}
              />
            </span>
          )}
        </Link>

        {/* Right: Logout Button */}
        <button
          onClick={handleLogout}
          className="bottom-logout-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            padding: '8px 18px',
            borderRadius: '7px',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            lineHeight: 'normal',
          }}
          title="ডাটাবেজ পেজ লকিং ভেরিফিকেশন রিসেট ও লগআউট করুন"
        >
          <i
            className="fa-solid fa-lock"
            style={{
              fontSize: '12px',
              width: '12px',
              height: '12px',
              lineHeight: '12px',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateY(-0.5px)',
            }}
          />
          <span
            style={{
              color: '#dc2626',
              fontSize: '12.5px',
              fontWeight: '700',
              lineHeight: '1',
              display: 'inline-block',
              transform: 'translateY(1px)',
            }}
          >
            লগআউট
          </span>
        </button>
      </div>

      <style jsx>{`
        .db-nav-box-wrapper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 22px;
          margin-top: 30px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          text-align: left;
        }

        .nav-box-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .title-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .nav-badge {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #2563eb;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .nav-heading {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
        }

        .nav-sub {
          font-size: 12px;
          color: #64748b;
        }

        .admin-actions-split-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
        }

        .admin-sub-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          flex: 1;
        }

        .nav-vertical-divider {
          width: 1px;
          background: linear-gradient(to bottom, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%);
          margin: 0;
          flex-shrink: 0;
        }

        .bottom-hub-logout-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          margin-top: 14px;
          flex-wrap: wrap;
          gap: 10px;
        }

        :global(.all-db-hub-btn),
        :global(.all-db-hub-btn:link),
        :global(.all-db-hub-btn:visited),
        :global(.all-db-hub-btn:hover),
        :global(.all-db-hub-btn:active) {
          text-decoration: none !important;
          color: #ffffff !important;
          background-color: #008fb0 !important;
          line-height: 1 !important;
        }

        :global(.all-db-hub-btn:hover) {
          filter: brightness(1.12) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0, 143, 176, 0.45) !important;
        }

        :global(.all-db-hub-btn i),
        :global(.all-db-hub-btn svg) {
          color: #ffffff !important;
        }

        :global(.all-db-hub-btn span) {
          color: #ffffff !important;
          text-decoration: none !important;
        }

        .bottom-logout-btn:hover {
          background: #fecaca !important;
          border-color: #f87171 !important;
          transform: translateY(-1px);
        }

        :global(.db-nav-btn),
        :global(.db-nav-btn:link),
        :global(.db-nav-btn:visited),
        :global(.db-nav-btn:hover),
        :global(.db-nav-btn:active) {
          text-decoration: none !important;
          color: #ffffff !important;
          line-height: 1 !important;
        }

        :global(.db-nav-btn:hover) {
          filter: brightness(1.15) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35) !important;
        }

        :global(.db-nav-btn i),
        :global(.db-nav-btn svg) {
          font-size: 12px !important;
          width: 12px !important;
          height: 12px !important;
          max-width: 12px !important;
          max-height: 12px !important;
          color: #ffffff !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          line-height: 1 !important;
        }

        :global(.db-nav-btn span) {
          color: #ffffff !important;
          text-decoration: none !important;
          line-height: 1 !important;
          display: inline-flex !important;
          align-items: center !important;
        }

        @media (max-width: 992px) {
          .admin-actions-split-wrapper {
            flex-direction: column;
            gap: 10px;
          }
          .nav-vertical-divider {
            width: 100%;
            height: 1px;
            margin: 2px 0;
          }
        }

        @media (max-width: 480px) {
          .admin-sub-grid {
            grid-template-columns: 1fr;
          }
          .nav-vertical-divider {
            display: none;
          }
          .bottom-hub-logout-bar {
            flex-direction: column;
            align-items: stretch;
          }
          :global(.all-db-hub-btn),
          .bottom-logout-btn {
            justify-content: center;
          }
        }

        @keyframes navPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.9;
          }
          70% {
            transform: scale(2.2);
            opacity: 0;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
