'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import DbNavBox from '@/components/common/DbNavBox';

const CACHE_KEY = 'topmcqbd_dbpaid_test_cache';

export default function DBPaidTestPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [dbInfo, setDbInfo] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeBackendUrl, setActiveBackendUrl] = useState('');

  const getApiUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '';
      }
    }
    return process.env.NEXT_PUBLIC_PAID_API_URL || 'https://topmcqbd-paid-api.onrender.com';
  }, []);

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
    // 1. Check LocalStorage Cache first if not forceRefresh
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
      } catch (e) {
        console.warn('LocalStorage Read Error:', e);
      }
    }

    // 2. Fetch fresh data from MongoDB
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/db-test/paid`, {
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
        } catch (e) {
          console.warn('LocalStorage Save Error:', e);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch items from Paid Database');
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  useEffect(() => {
    setActiveBackendUrl(getApiUrl() || 'Local Server (http://localhost:3000)');
    fetchData(false);
  }, [fetchData, getApiUrl]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="db-page-container">
      {/* Background Ambient Orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />

      <div className="db-content-card">
        {/* Header */}
        <div className="db-header">
          <div className="db-badge">Paid DB Live Viewer</div>
          <h1 className="db-title">Paid Database Live Data</h1>
          <p className="db-subtitle">
            Primary Cluster (<strong>TopMCQBD_DB</strong>) এর <code>db-paid-test</code> কালেকশনের রিয়েল-টাইম সংরক্ষিত ডাটা
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
                <span className="cache-pill" style={{ background: isFromCache ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: isFromCache ? '#60a5fa' : '#4ade80', border: `1px solid ${isFromCache ? 'rgba(59, 130, 246, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                  {isFromCache ? '⚡ LocalStorage Cache' : '🟢 Live MongoDB'}
                </span>
                {dbInfo?.latencyMs !== undefined && (
                  <span className="latency-pill">⚡ {dbInfo.latencyMs} ms</span>
                )}
                {dbInfo?.connected && (
                  <span className="live-indicator-badge">● Connected</span>
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
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f87171', marginRight: '6px' }} />
              <strong>এপিআই রিকোয়েস্ট সমস্যা:</strong>
            </div>
            <p className="alert-msg">{error}</p>
          </div>
        )}

        {/* Diagnostic Meta Cards Grid */}
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">ডাটাবেজ ক্লাস্টার</span>
            <strong className="summary-val" style={{ color: '#60a5fa' }}>TopMCQBD_DB</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">টার্গেট কালেকশন</span>
            <strong className="summary-val" style={{ color: '#38bdf8' }}>db-paid-test</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">মোট সংরক্ষিত ডাটা</span>
            <strong className="summary-val" style={{ color: '#4ade80' }}>{items.length} টি আইটেম</strong>
          </div>
        </div>

        {/* Collection Tags if available */}
        {dbInfo?.collections && dbInfo.collections.length > 0 && (
          <div className="collections-box" style={{ marginBottom: '24px' }}>
            <span className="box-title">ক্লাস্টারের অন্যান্য কালেকশনসমূহ:</span>
            <div className="tags-container">
              {dbInfo.collections.map((col, idx) => (
                <span key={idx} className="col-tag">{col}</span>
              ))}
            </div>
          </div>
        )}

        {/* Data Cards Grid */}
        <div className="data-cards-section">
          {loading && items.length === 0 ? (
            <div className="empty-box">
              <div className="btn-spinner" style={{ width: '28px', height: '28px', margin: '0 auto 12px auto' }} />
              <span>Paid Database থেকে ডাটা লোড হচ্ছে...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-box">
              <i className="fa-solid fa-inbox" style={{ fontSize: '36px', display: 'block', marginBottom: '8px', opacity: 0.6 }} />
              <h3 style={{ color: '#f8fafc', margin: '0 0 6px 0' }}>কোনো ডাটা পাওয়া যায়নি!</h3>
              <p style={{ margin: '0 0 16px 0' }}><code>db-paid-test</code> কালেকশনে এখনো কোনো ডাটা যোগ করা হয়নি।</p>
              <Link
                href="/dbpaid-admin"
                className="add-data-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '11px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
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
                    <i className="fa-regular fa-clock" style={{ marginRight: '5px' }} />
                    {formatDateTime(item.createdAt || item.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Navigation Box */}
        <DbNavBox activeRoute="/dbpaid-test" />

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
        .server-status-indicator {
          margin-top: 10px;
          font-size: 13px;
          color: #94a3b8;
        }
        .server-status-indicator code {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3px 10px;
          border-radius: 6px;
          color: #38bdf8;
          font-size: 12px;
        }
        .control-btn-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .admin-link-btn {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.35);
          padding: 9px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s;
        }
        .admin-link-btn:hover {
          background: rgba(59, 130, 246, 0.25);
        }
        .latency-pill {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
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
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: center;
        }
        .summary-label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .summary-val {
          font-size: 16px;
        }
        .search-bar-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .search-input-box {
          flex: 1;
          min-width: 220px;
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 8px 14px;
          gap: 8px;
        }
        .search-icon {
          font-size: 13px;
          opacity: 0.6;
        }
        .search-input {
          background: transparent;
          border: none;
          color: #f8fafc;
          font-size: 13px;
          width: 100%;
          outline: none;
        }
        .clear-search-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 12px;
        }
        .result-counter {
          font-size: 12px;
          color: #94a3b8;
        }
        .cards-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }
        .data-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 18px 22px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .data-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(15, 23, 42, 0.95);
        }
        .card-title-text {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.5;
          color: #f1f5f9;
          word-break: break-word;
        }
        .card-date-bottom {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
        }
        .empty-box {
          text-align: center;
          padding: 40px 20px;
          color: #94a3b8;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 16px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }
        .add-data-btn, .reset-filter-btn {
          background: #2563eb;
          color: #fff;
          padding: 10px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .add-data-btn:hover, .reset-filter-btn:hover {
          background: #1d4ed8;
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
          color: #94a3b8;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          padding: 9px 16px;
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
        }
        .bottom-nav-link:hover {
          color: #f8fafc;
          background: rgba(30, 41, 59, 0.95);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .orb-1 {
          background: #3b82f6;
          top: 10%;
          left: 15%;
        }
        .orb-2 {
          background: #6366f1;
          bottom: 10%;
          right: 15%;
        }
      `}</style>
    </main>
  );
}
