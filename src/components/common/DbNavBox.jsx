'use client';

import React from 'react';
import Link from 'next/link';

export default function DbNavBox({ activeRoute }) {
  const buttons = [
    {
      text: 'ALL DB Test',
      url: '/db-connection-check',
      icon: 'fa-solid fa-server',
      bg: '#4f46e5',
    },
    {
      text: 'DB Paid Admin',
      url: '/dbpaid-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#008fb0',
    },
    {
      text: 'DB Paid Test',
      url: '/dbpaid-test',
      icon: 'fa-solid fa-globe',
      bg: '#008fb0',
    },
    {
      text: 'DB Free Admin',
      url: '/dbfree-admin',
      icon: 'fa-solid fa-sliders',
      bg: '#0080c3',
    },
    {
      text: 'DB Free Test',
      url: '/dbfree-test',
      icon: 'fa-solid fa-globe',
      bg: '#0080c3',
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
          <small className="nav-sub">৫টি ডাটাবেজ পেজ দ্রুত সুইচ করুন</small>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              padding: '4px 10px',
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

      <div className="admin-actions-row">
        {buttons.map((btn) => {
          const isActive = activeRoute === btn.url;
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
                padding: '9px 10px',
                borderRadius: '7px',
                fontSize: '12.5px',
                fontWeight: '700',
                boxShadow: isActive
                  ? '0 4px 14px rgba(0,0,0,0.45)'
                  : '0 2px 6px rgba(0,0,0,0.25)',
                filter: isActive ? 'brightness(1.1)' : 'none',
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
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    color: '#ffffff',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    letterSpacing: '0.5px',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    marginLeft: '2px',
                    lineHeight: '1',
                    display: 'inline-block',
                    transform: 'translateY(0.5px)',
                  }}
                >
                  ACTIVE
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .db-nav-box-wrapper {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 18px 22px;
          margin-top: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
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
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 3px 10px;
          border-radius: 20px;
        }

        .nav-heading {
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
        }

        .nav-sub {
          font-size: 12px;
          color: #94a3b8;
        }

        .admin-actions-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
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
          vertical-align: baseline !important;
        }

        :global(.db-nav-btn span) {
          color: #ffffff !important;
          text-decoration: none !important;
          line-height: 1 !important;
          display: inline-flex !important;
          align-items: center !important;
        }

        @media (max-width: 960px) {
          .admin-actions-row {
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          }
        }

        @media (max-width: 600px) {
          .admin-actions-row {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
        }

        @media (max-width: 380px) {
          .admin-actions-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
