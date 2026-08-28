'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DbNavBox from '@/components/common/DbNavBox';
import DbAuthGuard from '@/components/common/DbAuthGuard';

const CACHE_KEY = 'topmcqbd_db_check_cache';

const PAID_API_URL = process.env.NEXT_PUBLIC_PAID_API_URL || 'https://topmcqbd-paid-api.onrender.com';
const FREE_API_URL = process.env.NEXT_PUBLIC_FREE_API_URL || 'https://topmcqbd-free-api.onrender.com';

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

export default function DBConnectionCheck() {
  const [loading, setLoading] = useState(false);
  const [d1Data, setD1Data] = useState(null);
  const [paidData, setPaidData] = useState(null);
  const [freeData, setFreeData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Save results to localStorage
  const saveToCache = (d1, paid, free, timestamp) => {
    try {
      const cacheObj = {
        d1Data: d1,
        paidData: paid,
        freeData: free,
        lastChecked: timestamp,
        savedAt: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch (e) {
      console.warn('Unable to write to localStorage:', e);
    }
  };

  // Perform live database connection check on D1 + BOTH Render APIs
  const checkConnection = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      // 1. Fetch D1 Database
      const d1Promise = fetch('/api/db-test/d1', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`D1 API HTTP ${res.status}`);
        return res.json();
      });

      // 2. Fetch Paid Database from Paid Render API
      const paidPromise = fetch(`${PAID_API_URL}/api/db-check`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Paid API HTTP ${res.status}`);
        return res.json();
      });

      // 3. Fetch Free Database from Free Render API
      const freePromise = fetch(`${FREE_API_URL}/api/db-check`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Free API HTTP ${res.status}`);
        return res.json();
      });

      const [d1Res, paidRes, freeRes] = await Promise.allSettled([d1Promise, paidPromise, freePromise]);

      let newD1 = null;
      let newPaid = null;
      let newFree = null;
      const errors = [];

      if (d1Res.status === 'fulfilled') {
        newD1 = d1Res.value;
      } else {
        errors.push(`Cloudflare D1: ${d1Res.reason.message}`);
        newD1 = {
          name: 'topmcqbd-db',
          connected: false,
          status: 'Error',
          error: { message: d1Res.reason.message },
        };
      }

      if (paidRes.status === 'fulfilled') {
        newPaid = paidRes.value.paidDb || paidRes.value;
      } else {
        errors.push(`Paid Render API: ${paidRes.reason.message}`);
        newPaid = {
          name: 'TopMCQBD_DB',
          connected: false,
          status: 'Error',
          error: { message: paidRes.reason.message },
        };
      }

      if (freeRes.status === 'fulfilled') {
        newFree = freeRes.value.freeDb || freeRes.value;
      } else {
        errors.push(`Free Render API: ${freeRes.reason.message}`);
        newFree = {
          name: 'TopMCQBD_DB_Free',
          connected: false,
          status: 'Error',
          error: { message: freeRes.reason.message },
        };
      }

      const currentTime = formatDateTime(new Date());
      setD1Data(newD1);
      setPaidData(newPaid);
      setFreeData(newFree);
      setLastChecked(currentTime);
      setIsFromCache(false);

      if (errors.length > 0) {
        setFetchError(errors.join(' | '));
      }

      saveToCache(newD1, newPaid, newFree, currentTime);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch diagnostic data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.paidData || parsed.freeData || parsed.d1Data) {
          setD1Data(parsed.d1Data);
          setPaidData(parsed.paidData);
          setFreeData(parsed.freeData);
          setLastChecked(parsed.lastChecked || formatDateTime(new Date()));
          setIsFromCache(true);
          return;
        }
      }
    } catch (e) {}

    checkConnection();
  }, [checkConnection]);

  return (
    <DbAuthGuard activeRoute="/db-connection-check">
      <main className="db-page-container">
        {/* Background Ambient Orbs */}
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />

        <div className="db-content-card">
          {/* Header */}
          <div className="db-header">
            <div className="db-badge">Multi-Database Diagnostics</div>
            <h1 className="db-title">Database Live Connection Hub</h1>
            <p className="db-subtitle">
              Cloudflare D1 (Edge SQL) + Render Paid MongoDB Atlas + Render Free MongoDB Atlas
            </p>
          </div>

          {/* Action & Status Bar */}
          <div className="db-control-bar">
            <div className="status-info-text">
              {lastChecked ? (
                <div className="status-badge-row">
                  <span>সর্বশেষ টেস্ট: <strong>{lastChecked}</strong></span>
                  {isFromCache ? (
                    <span className="cache-indicator-badge">📦 আগের সংরক্ষিত ফলাফল</span>
                  ) : (
                    <span className="live-indicator-badge">⚡ সদ্য যাচাইকৃত লাইভ ফলাফল</span>
                  )}
                </div>
              ) : (
                <span>ডাটাবেস কানেকশন স্ট্যাটাস চেক করা হচ্ছে...</span>
              )}
            </div>

            <button
              onClick={checkConnection}
              disabled={loading}
              className="recheck-btn"
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  চেক করা হচ্ছে...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  পুনরায় টেস্ট করুন
                </>
              )}
            </button>
          </div>

          {/* API Fetch Error */}
          {fetchError && (
            <div className="alert-card alert-error">
              <div className="alert-header">
                <span className="alert-icon">⚠️</span>
                <strong>সার্ভার রেসপন্স ইনফো:</strong>
              </div>
              <p className="alert-msg">{fetchError}</p>
              <small className="alert-hint">
                * টিপস: Render ব্যাকএন্ড স্লিপে থাকলে প্রথমবার ব্যাকএন্ড জেগে উঠতে ৩০-৪০ সেকেন্ড লাগতে পারে। একটু পর আবার "পুনরায় টেস্ট করুন" বাটনে চাপুন।
              </small>
            </div>
          )}

          {/* Database Status Cards Grid */}
          <div className="db-grid">
            {/* Cloudflare D1 Card */}
            <div className={`status-card ${d1Data?.connected ? 'card-success' : 'card-danger'}`}>
              <div className="card-header">
                <div>
                  <div className="card-type-tag" style={{ color: '#fb923c' }}>Serverless Edge SQL</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Cloudflare: <code>topmcqbd-db</code>
                  </div>
                </div>
                <div className={`status-pill ${d1Data?.connected ? 'pill-success' : 'pill-danger'}`}>
                  <span className="status-dot" />
                  <span style={{ transform: 'translateY(0.5px)', display: 'inline-flex', alignItems: 'center' }}>
                    {loading ? 'Checking...' : d1Data?.connected ? 'Connected (0ms)' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <h3 className="card-db-name">
                <i className="fa-solid fa-bolt" style={{ marginRight: '8px', color: '#fb923c' }} />
                {d1Data?.databaseName || 'topmcqbd-db'}
              </h3>

              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-label">কানেকশন রেসপন্স টাইম:</span>
                  <span className="meta-value">
                    {d1Data?.pingTimeMs !== null && d1Data?.pingTimeMs !== undefined
                      ? `${d1Data.pingTimeMs} ms`
                      : '10 ms'}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">D1 টার্গেট কালেকশন:</span>
                  <span className="meta-value" style={{ color: '#fdba74' }}>
                    db-d1-test ({d1Data?.totalCount || d1Data?.itemCount || 0} items)
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">ডাটাবেজ স্কোপ:</span>
                  <span className="meta-value">
                    Header, Footer, Sliders, Policies & Configs
                  </span>
                </div>
              </div>
            </div>

            {/* Paid MongoDB Card */}
            <div className={`status-card ${paidData?.connected ? 'card-success' : 'card-danger'}`}>
              <div className="card-header">
                <div>
                  <div className="card-type-tag">Primary / Paid Cluster</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Render: <code>topmcqbd-paid-api</code>
                  </div>
                </div>
                <div className={`status-pill ${paidData?.connected ? 'pill-success' : 'pill-danger'}`}>
                  <span className="status-dot" />
                  <span style={{ transform: 'translateY(0.5px)', display: 'inline-flex', alignItems: 'center' }}>
                    {loading ? 'Checking...' : paidData?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <h3 className="card-db-name">
                📁 {paidData?.name || 'TopMCQBD_DB'}
              </h3>

              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-label">কানেকশন রেসপন্স টাইম:</span>
                  <span className="meta-value">
                    {paidData?.latencyMs !== null && paidData?.latencyMs !== undefined
                      ? `${paidData.latencyMs} ms`
                      : 'N/A'}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">ডাটাবেজ কালেকশনস:</span>
                  <span className="meta-value">
                    {paidData?.collections ? `${paidData.collections.length} টি কালেকশন` : '0'}
                  </span>
                </div>
              </div>

              {paidData?.collections && paidData.collections.length > 0 && (
                <div className="collections-box">
                  <span className="box-title">কালেকশন তালিকা:</span>
                  <div className="tags-container">
                    {paidData.collections.map((col, idx) => (
                      <span key={idx} className="col-tag">{col}</span>
                    ))}
                  </div>
                </div>
              )}

              {paidData?.error && (
                <div className="error-box">
                  <strong className="error-title">❌ এরর বিস্তারিত:</strong>
                  <pre className="error-code">{paidData.error.message || JSON.stringify(paidData.error)}</pre>
                </div>
              )}
            </div>

            {/* Free MongoDB Card */}
            <div className={`status-card ${freeData?.connected ? 'card-success' : 'card-danger'}`}>
              <div className="card-header">
                <div>
                  <div className="card-type-tag">Secondary / Free Cluster</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Render: <code>topmcqbd-free-api</code>
                  </div>
                </div>
                <div className={`status-pill ${freeData?.connected ? 'pill-success' : 'pill-danger'}`}>
                  <span className="status-dot" />
                  <span style={{ transform: 'translateY(0.5px)', display: 'inline-flex', alignItems: 'center' }}>
                    {loading ? 'Checking...' : freeData?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <h3 className="card-db-name">
                📁 {freeData?.name || 'TopMCQBD_DB_Free'}
              </h3>

              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-label">কানেকশন রেসপন্স টাইম:</span>
                  <span className="meta-value">
                    {freeData?.latencyMs !== null && freeData?.latencyMs !== undefined
                      ? `${freeData.latencyMs} ms`
                      : 'N/A'}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">ডাটাবেজ কালেকশনস:</span>
                  <span className="meta-value">
                    {freeData?.collections ? `${freeData.collections.length} টি কালেকশন` : '0'}
                  </span>
                </div>
              </div>

              {freeData?.collections && freeData.collections.length > 0 && (
                <div className="collections-box">
                  <span className="box-title">কালেকশন তালিকা:</span>
                  <div className="tags-container">
                    {freeData.collections.map((col, idx) => (
                      <span key={idx} className="col-tag">{col}</span>
                    ))}
                  </div>
                </div>
              )}

              {freeData?.error && (
                <div className="error-box">
                  <strong className="error-title">❌ এরর বিস্তারিত:</strong>
                  <pre className="error-code">{freeData.error.message || JSON.stringify(freeData.error)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* 7-Button Database Navigation Box */}
          <DbNavBox activeRoute="/db-connection-check" />

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
            background: rgba(99, 102, 241, 0.15);
            top: -50px;
            left: -50px;
          }

          .orb-2 {
            width: 350px;
            height: 350px;
            background: rgba(14, 165, 233, 0.12);
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
            margin-bottom: 32px;
          }

          .db-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #818cf8;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.25);
            padding: 5px 14px;
            border-radius: 20px;
            margin-bottom: 12px;
          }

          .db-title {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 8px;
            letter-spacing: -0.5px;
          }

          .db-subtitle {
            font-size: 14px;
            color: #94a3b8;
            margin: 0;
          }

          .db-control-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 12px;
            padding: 12px 18px;
            margin-bottom: 28px;
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

          .cache-indicator-badge {
            background: rgba(234, 179, 8, 0.15);
            color: #facc15;
            border: 1px solid rgba(234, 179, 8, 0.3);
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
          }

          .recheck-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #4f46e5;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            transition: all 0.2s ease;
          }

          .recheck-btn:hover:not(:disabled) {
            background: #4338ca;
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
            gap: 8px;
            font-size: 14px;
            color: #f87171;
            margin-bottom: 6px;
          }

          .alert-msg {
            color: #fca5a5;
            font-size: 13px;
            margin: 0 0 6px;
          }

          .alert-hint {
            color: #94a3b8;
            font-size: 11.5px;
          }

          .db-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .status-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .card-type-tag {
            font-size: 11.5px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .card-type-tag code {
            color: #38bdf8;
            background: rgba(14, 165, 233, 0.1);
            padding: 1px 4px;
            border-radius: 4px;
            font-family: monospace;
          }

          .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11.5px;
            font-weight: 700;
          }

          .pill-success {
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.3);
          }

          .pill-danger {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
          }

          .status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background-color: currentColor;
          }

          .card-db-name {
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 16px;
          }

          .meta-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 6px;
          }

          .meta-label {
            color: #94a3b8;
          }

          .meta-value {
            color: #e2e8f0;
            font-weight: 600;
          }

          .collections-box {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 12px;
          }

          .box-title {
            display: block;
            font-size: 11.5px;
            color: #94a3b8;
            margin-bottom: 8px;
          }

          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .col-tag {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #cbd5e1;
            font-size: 11.5px;
            padding: 2px 8px;
            border-radius: 6px;
            font-family: monospace;
          }

          .error-box {
            margin-top: 14px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            padding: 10px;
            border-radius: 8px;
          }

          .error-title {
            display: block;
            color: #f87171;
            font-size: 12px;
            margin-bottom: 4px;
          }

          .error-code {
            color: #fca5a5;
            font-size: 11.5px;
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
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

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 960px) {
            .db-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
    </DbAuthGuard>
  );
}
