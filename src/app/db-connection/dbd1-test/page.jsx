'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import DbNavBox from '@/components/common/DbNavBox';
import DbAuthGuard from '@/components/common/DbAuthGuard';

const CACHE_KEY = 'topmcqbd_dbd1_test_cache';

export default function DBD1TestPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [dbInfo, setDbInfo] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeBackendUrl, setActiveBackendUrl] = useState('');

  const formatDateTime = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const dateStr = isToday
      ? 'Today'
      : d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

    const timeStr = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return `${dateStr}, ${timeStr}`;
  };

  const fetchData = useCallback(async (forceRefresh = false) => {
    // 1. Check LocalStorage Cache first
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            setItems(parsed.items);
            setDbInfo(parsed);
            setIsFromCache(true);
            setLastRefreshed(parsed.cachedAt || formatDateTime(new Date()));
            return;
          }
        }
      } catch (e) {}
    }

    // 2. Fetch fresh data from D1
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/db-test/d1', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const freshItems = json.items || [];
      const timestamp = formatDateTime(new Date());

      setItems(freshItems);
      setDbInfo(json);
      setIsFromCache(false);
      setLastRefreshed(timestamp);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              ...json,
              items: freshItems,
              cachedAt: timestamp,
            })
          );
        } catch (e) {}
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch items from Cloudflare D1 Database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setActiveBackendUrl(process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev');
    fetchData(false);
  }, [fetchData]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const otherCollections = dbInfo?.collections || [
    'layout-config',
    'home-config',
    'sidebar-config',
    'policy-config',
    'about-data',
    'faq-data',
    'packages-data',
    'db-suite-auth',
    'db-d1-test',
  ];

  return (
    <DbAuthGuard activeRoute="/db-connection/dbd1-test">
      <main className="db-page-container">
        {/* Background Ambient Orbs */}
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />

        <div className="db-content-card">
          {/* Header */}
          <div className="db-header">
            <div className="db-badge">
              D1 DB Live Viewer
            </div>
            <h1 className="db-title">Cloudflare D1 Database Live Data</h1>
            <p className="db-subtitle">
              Serverless Edge SQL (<strong>topmcqbd-db</strong>) এর <code>db-d1-test</code> রো-এর রিয়েল-টাইম সংরক্ষিত ডাটা
            </p>
            <div className="server-status-indicator">
              <span>কানেক্টেড এন্ডপয়েন্ট:</span> <code>{activeBackendUrl}</code>
            </div>
          </div>

          {/* Action Controls */}
          <div className="db-control-bar">
            <div className="status-info-text">
              {lastRefreshed ? (
                <div className="status-badge-row">
                  <span>সর্বশেষ রিফ্রেশ: <strong>{lastRefreshed}</strong></span>
                  {isFromCache ? (
                    <span className="cache-pill">
                      <span>⚡</span> LocalStorage Cache
                    </span>
                  ) : (
                    <span className="live-pill">
                      <span className="live-bullet-wrapper">
                        <span className="live-bullet-ring" />
                        <span className="live-bullet-core" />
                      </span>
                      <span>Live D1 Edge</span>
                    </span>
                  )}
                  {dbInfo?.pingTimeMs !== undefined && (
                    <span className="latency-pill">⚡ {dbInfo.pingTimeMs} ms</span>
                  )}
                  {dbInfo?.connected && (
                    <span className="live-indicator-badge">
                      <span className="live-bullet-wrapper">
                        <span className="live-bullet-ring" />
                        <span className="live-bullet-core" />
                      </span>
                      <span>Connected</span>
                    </span>
                  )}
                </div>
              ) : (
                <span>ডাটা লোড হচ্ছে...</span>
              )}
            </div>

            <div className="control-btn-group">
              <button onClick={() => fetchData(true)} disabled={loading} className="recheck-btn">
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    রিফ্রেশ হচ্ছে...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-rotate" style={{ marginRight: '6px' }} />
                    রিফ্রেশ করুন
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="alert-card alert-error">
              <div className="alert-header">
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#dc2626', marginRight: '6px' }} />
                <strong>এপিআই রিকোয়েস্ট সমস্যা:</strong>
              </div>
              <p className="alert-msg">{error}</p>
            </div>
          )}

          {/* Diagnostic Meta Cards Grid */}
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">ডাটাবেজ ক্লাস্টার</span>
              <strong className="summary-val" style={{ color: '#60a5fa' }}>topmcqbd-db (D1)</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">টার্গেট রো</span>
              <strong className="summary-val" style={{ color: '#38bdf8' }}>db-d1-test</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">মোট সংরক্ষিত ডাটা</span>
              <strong className="summary-val" style={{ color: '#4ade80' }}>{items.length} টি আইটেম</strong>
            </div>
          </div>

          {/* Other Collections / Row Keys Box (Matching Screenshot 100%) */}
          {otherCollections && otherCollections.length > 0 && (
            <div className="collections-box" style={{ marginBottom: '24px' }}>
              <span className="box-title">ক্লাস্টারের অন্যান্য রোসমূহ:</span>
              <div className="tags-container">
                {otherCollections.map((col, idx) => (
                  <span key={idx} className="col-tag">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Data Cards Section (Matching Screenshot 100%) */}
          <div className="data-cards-section">
            {loading && items.length === 0 ? (
              <div className="empty-box">
                <div className="btn-spinner" style={{ width: '28px', height: '28px', margin: '0 auto 12px auto' }} />
                <span>D1 Database থেকে ডাটা লোড হচ্ছে...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-box">
                <i className="fa-solid fa-inbox" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', opacity: 0.6 }} />
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0' }}>কোনো ডাটা পাওয়া যায়নি!</h3>
                <p style={{ margin: '0 0 16px 0' }}><code>db-d1-test</code> রো-তে এখনো কোনো ডাটা যোগ করা হয়নি।</p>
                <Link
                  href="/db-connection/dbd1-admin"
                  className="add-data-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '11px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ fontSize: '13px', color: '#ffffff' }} />
                  <span style={{ color: '#ffffff', textDecoration: 'none' }}>এডমিন প্যানেল থেকে ডাটা যোগ করুন</span>
                </Link>
              </div>
            ) : (
              <div className="cards-grid">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="data-card">
                    <div className="card-title-text">{item.text}</div>
                    <div className="card-date-bottom">
                      <i className="fa-regular fa-clock" />
                      <span>{formatDateTime(item.createdAt || item.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Database Navigation Box */}
          <DbNavBox activeRoute="/db-connection/dbd1-test" />

          {/* Bottom Navigation Links Bar */}
          <div className="bottom-nav-bar">
            <Link href="/" className="bottom-nav-link left-link">
              <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }} />
              ওয়েবসাইট ভিজিট
            </Link>
            <Link href="/admin/dashboard" className="bottom-nav-link right-link">
              অ্যাডমিন প্যানেল
              <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }} />
            </Link>
          </div>
        </div>

        <style jsx>{`
          .db-page-container {
            min-height: 100vh;
            background-color: #f8fafc;
            color: #0f172a;
            padding: 40px 20px 80px;
            font-family: inherit;
            display: flex;
            justify-content: center;
          }

          .db-content-card {
            width: 100%;
            max-width: 900px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 36px;
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
            position: relative;
          }

          .db-header {
            text-align: center;
            margin-bottom: 28px;
          }

          .db-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 5px 14px;
            border-radius: 20px;
            margin-bottom: 12px;
          }

          .db-title {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px;
            letter-spacing: -0.5px;
          }

          .db-subtitle {
            font-size: 13.5px;
            color: #64748b;
            margin: 0;
          }

          .server-status-indicator {
            margin-top: 10px;
            font-size: 13px;
            color: #64748b;
          }

          .server-status-indicator code {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 3px 10px;
            border-radius: 6px;
            color: #0080c3;
            font-size: 12px;
            font-weight: 600;
          }

          .db-control-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px 18px;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .status-badge-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: #334155;
            flex-wrap: wrap;
          }

          .cache-pill {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
          }

          .live-pill {
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #86efac;
          }

          .latency-pill {
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #86efac;
          }

          .live-indicator-badge {
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #86efac;
          }

          .live-pill,
          .cache-pill,
          .latency-pill,
          .live-indicator-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            height: 28px;
            padding: 0 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            line-height: 1;
            box-sizing: border-box;
            white-space: nowrap;
          }

          .live-bullet-wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 8px;
            height: 8px;
            flex-shrink: 0;
            margin-top: -1px;
          }

          .live-bullet-core {
            width: 6px;
            height: 6px;
            background-color: #16a34a;
            border-radius: 50%;
            position: relative;
            z-index: 2;
          }

          .live-bullet-ring {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #22c55e;
            opacity: 0.9;
            animation: liveRadarPing 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            z-index: 1;
          }

          @keyframes liveRadarPing {
            0% {
              transform: scale(0.8);
              opacity: 0.9;
            }
            70% {
              transform: scale(2.8);
              opacity: 0;
            }
            100% {
              transform: scale(2.8);
              opacity: 0;
            }
          }

          .control-btn-group {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .recheck-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.2s ease;
          }

          .recheck-btn:hover:not(:disabled) {
            filter: brightness(1.1);
            transform: translateY(-1px);
          }

          .btn-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .alert-card {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }

          .alert-header {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #dc2626;
            margin-bottom: 6px;
          }

          .alert-msg {
            color: #b91c1c;
            font-size: 13px;
            margin: 0;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin-bottom: 20px;
          }

          @media (max-width: 650px) {
            .summary-grid { grid-template-columns: 1fr; }
          }

          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 16px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            text-align: center;
          }

          .summary-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
          }

          .summary-val {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
          }

          .collections-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 18px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          }

          .box-title {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 10px;
          }

          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .col-tag {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #2563eb;
            font-size: 12px;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 6px;
            font-family: monospace;
          }

          .data-cards-section {
            margin-bottom: 28px;
          }

          .cards-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 28px;
          }

          .data-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px 22px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          }

          .card-title-text {
            font-size: 16px;
            font-weight: 600;
            line-height: 1.5;
            color: #1e293b;
            word-break: break-word;
          }

          .card-date-bottom {
            font-size: 12px;
            color: #64748b;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            line-height: 1;
          }

          .card-date-bottom i {
            font-size: 12px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transform: translateY(0.5px);
          }

          .card-date-bottom span {
            font-size: 12px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            transform: translateY(1.5px);
          }

          .empty-box {
            text-align: center;
            padding: 40px 20px;
            color: #64748b;
            background: #f8fafc;
            border-radius: 14px;
            border: 1px dashed #cbd5e1;
          }

          .bottom-nav-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 24px;
            padding: 8px 4px 0 4px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .bottom-nav-link {
            color: #0080c3;
            font-size: 13.5px;
            font-weight: 700;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            padding: 9px 16px;
            border-radius: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease;
          }

          .bottom-nav-link:hover {
            color: #006093;
            background: #f0f9ff;
            border-color: #bae6fd;
            transform: translateY(-1px);
          }

          .orb-1, .orb-2 {
            display: none !important;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    </DbAuthGuard>
  );
}
