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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.text && item.text.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  return (
    <DbAuthGuard activeRoute="/dbd1-test">
      <main className="db-page-container">
        {/* Background Ambient Orbs */}
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />

        <div className="db-content-card">
          {/* Header */}
          <div className="db-header">
            <div className="db-badge" style={{ borderColor: 'rgba(234, 88, 12, 0.4)', color: '#fb923c', background: 'rgba(234, 88, 12, 0.1)' }}>
              D1 DB Live Viewer
            </div>
            <h1 className="db-title">Cloudflare D1 Database Live Data</h1>
            <p className="db-subtitle">
              Serverless Edge SQL (<strong>topmcqbd-db</strong>) এর <code>db-d1-test</code> কালেকশনের রিয়েল-টাইম সংরক্ষিত ডাটা
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
                    <span className="live-pill" style={{ borderColor: 'rgba(234, 88, 12, 0.3)', background: 'rgba(234, 88, 12, 0.15)', color: '#fb923c' }}>
                      <span className="live-bullet-wrapper">
                        <span className="live-bullet-ring" style={{ borderColor: '#fb923c' }} />
                        <span className="live-bullet-core" style={{ background: '#ea580c' }} />
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
              <button onClick={() => fetchData(true)} disabled={loading} className="recheck-btn" style={{ background: '#ea580c' }}>
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
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f87171', marginRight: '6px' }} />
                <strong>এপিআই রিকোয়েস্ট সমস্যা:</strong>
              </div>
              <p className="alert-msg">{error}</p>
            </div>
          )}

          {/* Diagnostic Meta Cards Grid */}
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">ডাটাবেজ ইঞ্জিন</span>
              <strong className="summary-val" style={{ color: '#fb923c' }}>topmcqbd-db (D1)</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">টার্গেট কালেকশন</span>
              <strong className="summary-val" style={{ color: '#fdba74' }}>db-d1-test</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">মোট সংরক্ষিত ডাটা</span>
              <strong className="summary-val" style={{ color: '#4ade80' }}>{items.length} টি আইটেম</strong>
            </div>
          </div>

          {/* Data Cards Grid */}
          <div className="data-cards-section">
            <div className="section-header-row">
              <h3>
                <i className="fa-solid fa-layer-group" style={{ marginRight: '8px', color: '#fb923c' }} />
                লাইভ ডাটা রেকর্ডস ({filteredItems.length})
              </h3>
              <div className="search-box-wrapper">
                <i className="fa-solid fa-magnifying-glass search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ডাটা বা আইডি সার্চ..."
                  className="search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-folder-open" style={{ fontSize: '36px', color: '#64748b', marginBottom: '12px' }} />
                <p>
                  {searchQuery
                    ? 'সার্চের সাথে মিল রেখে কোনো ডাটা পাওয়া যায়নি।'
                    : '"db-d1-test" কালেকশনে এখনো কোনো ডাটা নেই। অ্যাডমিন প্যানেল থেকে ডাটা যোগ করুন।'}
                </p>
                <Link href="/dbd1-admin" className="goto-admin-btn" style={{ background: '#ea580c' }}>
                  <i className="fa-solid fa-sliders" style={{ marginRight: '6px' }} />
                  D1 অ্যাডমিন প্যানেলে যান
                </Link>
              </div>
            ) : (
              <div className="cards-grid">
                {filteredItems.map((item, idx) => (
                  <div key={item.id || idx} className="data-item-card">
                    <div className="card-top">
                      <span className="card-counter">#{idx + 1}</span>
                      <div className="id-tag">
                        <code>{item.id}</code>
                        <button
                          onClick={() => copyToClipboard(item.id, item.id)}
                          className="copy-btn"
                          title="Copy ID"
                        >
                          <i className={`fa-solid ${copiedId === item.id ? 'fa-check' : 'fa-copy'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="card-body-text">
                      <p>{item.text}</p>
                    </div>

                    <div className="card-footer">
                      <span className="date-tag">
                        <i className="fa-regular fa-clock" style={{ marginRight: '5px' }} />
                        {formatDateTime(item.createdAt || item.updatedAt)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.text, `text_${item.id}`)}
                        className="copy-text-btn"
                        title="Copy text"
                      >
                        <i className={`fa-solid ${copiedId === `text_${item.id}` ? 'fa-check' : 'fa-copy'}`} style={{ marginRight: '4px' }} />
                        {copiedId === `text_${item.id}` ? 'কপি হয়েছে' : 'টেক্সট কপি'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7-Button Database Navigation Box */}
          <DbNavBox activeRoute="/dbd1-test" />

          {/* Bottom Navigation Links Bar */}
          <div
            className="bottom-nav-bar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              marginTop: '24px',
              padding: '8px 4px 0 4px',
              flexWrap: 'wrap',
              gap: '12px',
              boxSizing: 'border-box',
            }}
          >
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
            background-color: #0b0f19;
            color: #f8fafc;
            padding: 40px 20px 80px;
            position: relative;
            overflow-x: hidden;
            font-family: inherit;
            display: flex;
            justify-content: center;
          }

          .glow-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            z-index: 0;
            pointer-events: none;
          }

          .orb-1 {
            width: 400px;
            height: 400px;
            background: rgba(234, 88, 12, 0.12);
            top: -50px;
            left: -50px;
          }

          .orb-2 {
            width: 350px;
            height: 350px;
            background: rgba(249, 115, 22, 0.08);
            bottom: 50px;
            right: -50px;
          }

          .db-content-card {
            width: 100%;
            max-width: 1050px;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 36px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            position: relative;
            z-index: 1;
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
            color: #ffffff;
            margin: 0 0 8px;
            letter-spacing: -0.5px;
          }

          .db-subtitle {
            font-size: 13.5px;
            color: #94a3b8;
            margin: 0;
          }

          .server-status-indicator {
            margin-top: 10px;
            font-size: 12px;
            color: #64748b;
          }

          .server-status-indicator code {
            color: #fdba74;
            background: rgba(234, 88, 12, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
          }

          .db-control-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.07);
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
            color: #cbd5e1;
            flex-wrap: wrap;
          }

          .cache-pill {
            background: rgba(234, 179, 8, 0.15);
            color: #facc15;
            border: 1px solid rgba(234, 179, 8, 0.3);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
          }

          .live-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
            border: 1px solid;
          }

          .latency-pill {
            background: rgba(96, 165, 250, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(96, 165, 250, 0.3);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
          }

          .live-indicator-badge {
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.3);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .live-bullet-wrapper {
            position: relative;
            width: 7px;
            height: 7px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .live-bullet-core {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #22c55e;
          }

          .live-bullet-ring {
            position: absolute;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            border: 1px solid #22c55e;
            animation: pulse 1.5s infinite;
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
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
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
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }

          .alert-header {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #f87171;
            margin-bottom: 6px;
          }

          .alert-msg {
            color: #fca5a5;
            font-size: 13px;
            margin: 0;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }

          .summary-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .summary-label {
            font-size: 11px;
            color: #94a3b8;
          }

          .summary-val {
            font-size: 15px;
          }

          .data-cards-section {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 22px;
            margin-bottom: 24px;
          }

          .section-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .section-header-row h3 {
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            margin: 0;
          }

          .search-box-wrapper {
            position: relative;
            width: 240px;
          }

          .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            font-size: 12px;
          }

          .search-input {
            width: 100%;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 6px 12px 6px 32px;
            border-radius: 7px;
            font-size: 12.5px;
            outline: none;
          }

          .search-input:focus {
            border-color: #ea580c;
          }

          .clear-search-btn {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
            font-size: 13.5px;
          }

          .goto-admin-btn {
            display: inline-flex;
            align-items: center;
            margin-top: 14px;
            color: #ffffff;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 12.5px;
            font-weight: 700;
          }

          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 14px;
          }

          .data-item-card {
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 10px;
          }

          .card-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .card-counter {
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
          }

          .id-tag {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(30, 41, 59, 0.8);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            color: #fdba74;
            font-family: monospace;
          }

          .copy-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 0;
            font-size: 10px;
          }

          .card-body-text {
            color: #e2e8f0;
            font-size: 13.5px;
            line-height: 1.5;
            word-break: break-word;
          }

          .card-body-text p {
            margin: 0;
          }

          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 8px;
          }

          .date-tag {
            font-size: 11px;
            color: #64748b;
          }

          .copy-text-btn {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #cbd5e1;
            padding: 3px 8px;
            border-radius: 5px;
            font-size: 11px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
          }

          .copy-text-btn:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
          }

          .bottom-nav-link {
            font-size: 13px;
            color: #94a3b8;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            transition: color 0.2s;
          }

          .bottom-nav-link:hover {
            color: #ffffff;
          }

          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .db-content-card {
              padding: 20px;
            }
            .summary-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
    </DbAuthGuard>
  );
}
