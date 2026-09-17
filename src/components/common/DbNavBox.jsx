'use client';

import React from 'react';
import Link from 'next/link';

export default function DbNavBox({ activeRoute }) {
  // 7 Unified DB Specific Buttons
  const dbButtons = [
    {
      text: 'Cloudflare D1',
      url: '/db-connection-api/dbd1-api',
      altUrl: '/dbd1-api',
      icon: 'fa-solid fa-bolt',
      bg: '#0284c7', // Sky Blue
    },
    {
      text: 'Paid Core DB',
      url: '/db-connection-api/dbpaid-api',
      altUrl: '/dbpaid-api',
      icon: 'fa-solid fa-database',
      bg: '#4f46e5', // Indigo
    },
    {
      text: 'Subj MCQs DB',
      url: '/db-connection-api/dbsubjective-api',
      altUrl: '/dbsubjective-api',
      icon: 'fa-solid fa-sliders',
      bg: '#9333ea', // Purple
    },
    {
      text: 'Live Exam DB',
      url: '/db-connection-api/dbliveexam-api',
      altUrl: '/dbliveexam-api',
      icon: 'fa-solid fa-bolt-lightning',
      bg: '#059669', // Emerald Green
    },
    {
      text: 'Written DB',
      url: '/db-connection-api/dbwritten-api',
      altUrl: '/dbwritten-api',
      icon: 'fa-solid fa-pen-nib',
      bg: '#d97706', // Amber Golden
    },
    {
      text: 'Q-Bank DB',
      url: '/db-connection-api/dbquestionbank-api',
      altUrl: '/dbquestionbank-api',
      icon: 'fa-solid fa-layer-group',
      bg: '#ea580c', // Coral Orange
    },
    {
      text: 'Free MCQ DB',
      url: '/db-connection-api/dbfree-api',
      altUrl: '/dbfree-api',
      icon: 'fa-solid fa-hard-drive',
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
    activeRoute === '/db-connection' || activeRoute === '/db-connection-api' || activeRoute === '/db-connection-check' || activeRoute === '/DB';
  const isMongoActive =
    activeRoute === '/db-connection-api/db-mongodb-active-connection';
  const isPagesApiActive =
    activeRoute === '/db-connection-api/db-pages-api';
  const isWorkersApiActive =
    activeRoute === '/db-connection-api/db-workers-api';

  const renderButton = (btn, idx) => {
    const baseSlug = btn.url.replace('/db-connection-api/', '').replace('-api', '');
    const isActive =
      activeRoute === btn.url ||
      activeRoute === btn.altUrl ||
      activeRoute === `/db-connection-api/${baseSlug}` ||
      activeRoute === `/${baseSlug}` ||
      activeRoute === `/db-connection-api/${baseSlug}-admin` ||
      activeRoute === `/db-connection-api/${baseSlug}-test`;
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

  return (
    <div className="db-nav-box-wrapper">
      {/* Top Header */}
      <div className="nav-box-title">
        <div className="title-left">
          <span className="nav-heading">Database Testing & Admin Suite</span>
        </div>
        <div className="title-right">
          <small className="nav-sub">৭টি স্পেসিফিক ডাটাবেজ ও ক্লাউড পেজ দ্রুত সুইচ করুন</small>
        </div>
      </div>

      {/* 7 Buttons Grid: Balanced on Desktop & 100% on Mobile */}
      <div className="admin-actions-grid">
        {dbButtons.map((btn, idx) => renderButton(btn, idx))}
      </div>

      {/* Bottom Dedicated Bar: ALL DB Hub & MongoDB Active Hub (Left) & Logout (Right) */}
      <div className="bottom-hub-logout-bar">
        {/* Left: Hub Buttons Group */}
        <div className="bottom-hub-left-group">
          {/* ALL DB Hub Button */}
          <Link
            href="/db-connection-api"
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

          {/* MongoDB Active Connection Button */}
          <Link
            href="/db-connection-api/db-mongodb-active-connection"
            className="mongo-active-btn"
            title="MongoDB 24/7 Active Connection & Keep-Alive Hub"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#047857',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '9px 18px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: isMongoActive ? '0 4px 14px rgba(4, 120, 87, 0.45)' : '0 2px 8px rgba(4, 120, 87, 0.25)',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              lineHeight: 'normal',
            }}
          >
            <i
              className="fa-solid fa-bolt"
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
              MongoDB Active Hub
            </span>
            {isMongoActive && (
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

          {/* Cloudflare Pages API Button */}
          <Link
            href="/db-connection-api/db-pages-api"
            className="pages-api-nav-btn"
            title="Cloudflare Pages API Database Testing & Admin Suite"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '9px 18px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: isPagesApiActive ? '0 4px 14px rgba(234, 88, 12, 0.45)' : '0 2px 8px rgba(234, 88, 12, 0.25)',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              lineHeight: 'normal',
            }}
          >
            <i
              className="fa-solid fa-cloud"
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
              CF Pages API
            </span>
            {isPagesApiActive && (
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

          {/* Cloudflare Worker Backup API Button */}
          <Link
            href="/db-connection-api/db-workers-api"
            className="workers-api-nav-btn"
            title="Cloudflare Worker Backup API Database Testing & Admin Suite"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '9px 18px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: isWorkersApiActive ? '0 4px 14px rgba(79, 70, 229, 0.45)' : '0 2px 8px rgba(79, 70, 229, 0.25)',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              lineHeight: 'normal',
            }}
          >
            <i
              className="fa-solid fa-bolt"
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
              Worker Backup API
            </span>
            {isWorkersApiActive && (
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
        </div>

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

        .admin-actions-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          width: 100%;
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

        .bottom-hub-left-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
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

        :global(.mongo-active-btn),
        :global(.mongo-active-btn:link),
        :global(.mongo-active-btn:visited),
        :global(.mongo-active-btn:hover),
        :global(.mongo-active-btn:active) {
          text-decoration: none !important;
          color: #ffffff !important;
          background-color: #047857 !important;
          line-height: 1 !important;
        }

        :global(.mongo-active-btn:hover) {
          filter: brightness(1.12) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(4, 120, 87, 0.45) !important;
        }

        :global(.mongo-active-btn i),
        :global(.mongo-active-btn svg) {
          color: #ffffff !important;
        }

        :global(.mongo-active-btn span) {
          color: #ffffff !important;
          text-decoration: none !important;
        }

        :global(.pages-api-nav-btn),
        :global(.pages-api-nav-btn:link),
        :global(.pages-api-nav-btn:visited),
        :global(.pages-api-nav-btn:hover),
        :global(.pages-api-nav-btn:active) {
          text-decoration: none !important;
          color: #ffffff !important;
          background-color: #ea580c !important;
          line-height: 1 !important;
        }

        :global(.pages-api-nav-btn:hover) {
          filter: brightness(1.12) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.45) !important;
        }

        :global(.pages-api-nav-btn i),
        :global(.pages-api-nav-btn svg) {
          color: #ffffff !important;
        }

        :global(.pages-api-nav-btn span) {
          color: #ffffff !important;
          text-decoration: none !important;
        }

        :global(.workers-api-nav-btn),
        :global(.workers-api-nav-btn:link),
        :global(.workers-api-nav-btn:visited),
        :global(.workers-api-nav-btn:hover),
        :global(.workers-api-nav-btn:active) {
          text-decoration: none !important;
          color: #ffffff !important;
          background-color: #4f46e5 !important;
          line-height: 1 !important;
        }

        :global(.workers-api-nav-btn:hover) {
          filter: brightness(1.12) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45) !important;
        }

        :global(.workers-api-nav-btn i),
        :global(.workers-api-nav-btn svg) {
          color: #ffffff !important;
        }

        :global(.workers-api-nav-btn span) {
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

        @media (max-width: 1100px) and (min-width: 769px) {
          .admin-actions-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
        }

        @media (max-width: 768px) {
          .admin-actions-grid {
            grid-template-columns: 1fr;
            gap: 8px;
            width: 100%;
          }
          :global(.db-nav-btn) {
            width: 100% !important;
            justify-content: center !important;
          }
          .bottom-hub-logout-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            width: 100%;
          }
          .bottom-hub-left-group {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            gap: 8px;
          }
          :global(.all-db-hub-btn),
          :global(.mongo-active-btn),
          :global(.pages-api-nav-btn),
          :global(.workers-api-nav-btn),
          .bottom-logout-btn {
            width: 100% !important;
            justify-content: center !important;
            box-sizing: border-box !important;
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
