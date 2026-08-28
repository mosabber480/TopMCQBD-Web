'use client';

import React from 'react';
import Link from 'next/link';

export default function DbNavBox({ activeRoute }) {
  const buttons = [
    {
      text: 'ALL DB Test',
      url: '/db-connection',
      altUrl: '/db-connection-check',
      icon: 'fa-solid fa-server',
      bg: '#4f46e5',
    },
    {
      text: 'DB Paid Admin',
      url: '/db-connection/dbpaid-admin',
      altUrl: '/dbpaid-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#008fb0',
    },
    {
      text: 'DB Paid Test',
      url: '/db-connection/dbpaid-test',
      altUrl: '/dbpaid-test',
      icon: 'fa-solid fa-globe',
      bg: '#008fb0',
    },
    {
      text: 'DB Free Admin',
      url: '/db-connection/dbfree-admin',
      altUrl: '/dbfree-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#0080c3',
    },
    {
      text: 'DB Free Test',
      url: '/db-connection/dbfree-test',
      altUrl: '/dbfree-test',
      icon: 'fa-solid fa-globe',
      bg: '#0080c3',
    },
  ];

  const d1Buttons = [
    {
      text: 'DB D1 Admin',
      url: '/db-connection/dbd1-admin',
      altUrl: '/dbd1-admin',
      icon: 'fa-solid fa-bolt',
      bg: '#ea580c',
    },
    {
      text: 'DB D1 Test',
      url: '/db-connection/dbd1-test',
      altUrl: '/dbd1-test',
      icon: 'fa-solid fa-database',
      bg: '#ea580c',
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
          padding: '9px 12px',
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
        }}
      >
        <i
          className={btn.icon}
          style={{
            fontSize: '13px',
            width: '13px',
            height: '13px',
            lineHeight: '13px',
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
              width: '8px',
              height: '8px',
              marginLeft: '4px',
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
                width: '6px',
                height: '6px',
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

  return (
    <div className="db-nav-box-wrapper">
      <div className="nav-box-title">
        <div className="title-left">
          <span className="nav-badge">
            <i className="fa-solid fa-compass" style={{ marginRight: '6px', fontSize: '12px' }}></i>
            QUICK NAVIGATION
          </span>
          <span className="nav-heading">Database Testing & Admin Suite</span>
        </div>
        <div className="title-right" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <small className="nav-sub">৭টি ডাটাবেজ পেজ দ্রুত সুইচ করুন</small>
          <button
            onClick={handleLogout}
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#dc2626',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease',
            }}
            title="ডাটাবেজ পেজ লকিং ভেরিফিকেশন রিসেট করুন"
          >
            <i className="fa-solid fa-lock" style={{ fontSize: '11px' }} />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Row 1: Primary 5 Buttons */}
      <div className="admin-actions-row">
        {buttons.map(renderButton)}
      </div>

      {/* Row 2: 2 D1 Buttons underneath */}
      <div className="admin-actions-row-d1" style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
        {d1Buttons.map(renderButton)}
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
          margin-bottom: 14px;
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

        .admin-actions-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
          width: 100%;
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
          font-size: 13px !important;
          width: 13px !important;
          height: 13px !important;
          max-width: 13px !important;
          max-height: 13px !important;
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

        @media (max-width: 900px) {
          .admin-actions-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .admin-actions-row {
            grid-template-columns: 1fr;
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
