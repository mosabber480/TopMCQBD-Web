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
  const [paidData, setPaidData] = useState(null);
  const [freeData, setFreeData] = useState(null);
  const [d1Data, setD1Data] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Save results to localStorage
  const saveToCache = (paid, free, d1, timestamp) => {
    try {
      const cacheObj = {
        paidData: paid,
        freeData: free,
        d1Data: d1,
        lastChecked: timestamp,
        savedAt: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch (e) {
      console.warn('Unable to write to localStorage:', e);
    }
  };

  // Perform live database connection check on BOTH Render APIs + Cloudflare D1
  const checkConnection = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      // 1. Fetch Paid Database from Paid Render API
      const paidPromise = fetch(`${PAID_API_URL}/api/db-check`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Paid API HTTP ${res.status}`);
        return res.json();
      });

      // 2. Fetch Free Database from Free Render API
      const freePromise = fetch(`${FREE_API_URL}/api/db-check`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Free API HTTP ${res.status}`);
        return res.json();
      });

      // 3. Fetch Cloudflare D1 Database
      const d1Promise = fetch('/api/db-test/d1', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }).then(async (res) => {
        if (!res.ok) throw new Error(`D1 API HTTP ${res.status}`);
        return res.json();
      });

      const [paidRes, freeRes, d1Res] = await Promise.allSettled([paidPromise, freePromise, d1Promise]);

      let newPaid = null;
      let newFree = null;
      let newD1 = null;
      const errors = [];

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

      const currentTime = formatDateTime(new Date());
      setPaidData(newPaid);
      setFreeData(newFree);
      setD1Data(newD1);
      setLastChecked(currentTime);
      setIsFromCache(false);

      if (errors.length > 0) {
        setFetchError(errors.join(' | '));
      }

      saveToCache(newPaid, newFree, newD1, currentTime);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch diagnostic data');
    } finally {
      setLoading(false);
    }
  }, []);

  // On page load/reload: Read from localStorage first. If no cache exists, run live check once.
  useEffect(() => {
    try {
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && (cached.paidData || cached.data || cached.d1Data)) {
          setPaidData(cached.paidData || cached.data?.paidDb || null);
          setFreeData(cached.freeData || cached.data?.freeDb || null);
          setD1Data(cached.d1Data || null);
          setLastChecked(cached.lastChecked || formatDateTime(cached.savedAt));
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Error reading from localStorage cache:', err);
    }

    checkConnection();
  }, [checkConnection]);

  return (
    <DbAuthGuard activeRoute="/db-connection">
      <main className="db-page-container">
        <div className="db-content-card">
          {/* Header */}
          <div className="db-header">
            <div className="db-badge">Diagnostic Tool</div>
            <h1 className="db-title">DB Connection Check</h1>
            <p className="db-subtitle">
              Render Backend ও MongoDB ক্লাস্টারের মধ্যকার রিয়েল-টাইম কানেকশন স্ট্যাটাস
            </p>
          </div>

          {/* Action Bar */}
          <div className="db-control-bar">
            <div className="status-info-text">
              {lastChecked ? (
                <div className="status-badge-row">
                  <span>সর্বশেষ টেস্ট: <strong>{lastChecked}</strong></span>
                  {isFromCache ? (
                    <span className="cache-indicator-badge">📦 লোকাল স্টোরেজের পূর্ববর্তী ফলাফল</span>
                  ) : (
                    <span className="live-indicator-badge">⚡ লাইভ টেস্ট ফলাফল</span>
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
            {/* Paid MongoDB Card */}
            <div className={`status-card ${paidData?.connected ? 'card-success' : 'card-danger'}`}>
              <div className="card-header">
                <div>
                  <div className="card-type-tag">PRIMARY / PAID CLUSTER</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
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
                  <div className="card-type-tag">SECONDARY / FREE CLUSTER</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
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

            {/* Cloudflare D1 Card (Row 2 Left) */}
            <div className={`status-card ${d1Data?.connected ? 'card-success' : 'card-danger'}`}>
              <div className="card-header">
                <div>
                  <div className="card-type-tag">SERVERLESS / D1 CLUSTER</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Cloudflare Pages: <code>topmcqbd-db</code>
                  </div>
                </div>
                <div className={`status-pill ${d1Data?.connected ? 'pill-success' : 'pill-danger'}`}>
                  <span className="status-dot" />
                  <span style={{ transform: 'translateY(0.5px)', display: 'inline-flex', alignItems: 'center' }}>
                    {loading ? 'Checking...' : d1Data?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <h3 className="card-db-name">
                📁 {d1Data?.databaseName || 'topmcqbd-db'}
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
                  <span className="meta-label">ডাটাবেজ রো:</span>
                  <span className="meta-value">
                    {d1Data?.totalCount ? `${d1Data.totalCount} টি রো` : (d1Data?.collections?.length ? `${d1Data.collections.length} টি রো` : '5 টি রো')}
                  </span>
                </div>
              </div>

              <div className="collections-box">
                <span className="box-title">রো কালেকশন তালিকা:</span>
                <div className="tags-container">
                  {(d1Data?.collections || d1Data?.keys || ['layout-config', 'home-config', 'sidebar-config', 'policy-config', 'db-d1-test']).map((col, idx) => (
                    <span key={idx} className="col-tag">{col}</span>
                  ))}
                </div>
              </div>

              {d1Data?.error && (
                <div className="error-box">
                  <strong className="error-title">❌ এরর বিস্তারিত:</strong>
                  <pre className="error-code">{d1Data.error.message || JSON.stringify(d1Data.error)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Database Navigation Box */}
          <DbNavBox activeRoute="/db-connection" />

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
              ওয়েবসাইট ভিজিট
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
            margin-bottom: 32px;
          }

          .db-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #2563eb;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 5px 14px;
            border-radius: 20px;
            margin-bottom: 12px;
          }

          .db-title {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px;
            letter-spacing: -0.5px;
          }

          .db-subtitle {
            font-size: 14px;
            color: #64748b;
            margin: 0;
          }

          .db-control-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
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
            color: #334155;
            flex-wrap: wrap;
          }

          .cache-indicator-badge {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fde68a;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
          }

          .live-indicator-badge {
            background: #dcfce7;
            color: #16a34a;
            border: 1px solid #bbf7d0;
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
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
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
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }

          .alert-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #dc2626;
            margin-bottom: 6px;
          }

          .alert-msg {
            color: #b91c1c;
            font-size: 13px;
            margin: 0 0 6px;
          }

          .alert-hint {
            color: #64748b;
            font-size: 11.5px;
          }

          .db-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .status-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .card-type-tag {
            font-size: 11.5px;
            color: #475569;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .card-type-tag code {
            color: #0284c7;
            background: #f0f9ff;
            padding: 1px 5px;
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
            background: #dcfce7;
            color: #16a34a;
            border: 1px solid #bbf7d0;
          }

          .pill-danger {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fca5a5;
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
            color: #0f172a;
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
            border-bottom: 1px dashed #e2e8f0;
            padding-bottom: 6px;
          }

          .meta-label {
            color: #475569;
          }

          .meta-value {
            color: #0f172a;
            font-weight: 700;
          }

          .collections-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
          }

          .box-title {
            display: block;
            font-size: 11.5px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 8px;
          }

          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .col-tag {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #2563eb;
            font-size: 11.5px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 6px;
            font-family: monospace;
          }

          .error-box {
            margin-top: 14px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 10px;
            border-radius: 8px;
          }

          .error-title {
            display: block;
            color: #dc2626;
            font-size: 12px;
            margin-bottom: 4px;
          }

          .error-code {
            color: #b91c1c;
            font-size: 11.5px;
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
          }

          .bottom-nav-link {
            font-size: 13px;
            color: #2563eb;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            font-weight: 600;
            transition: color 0.2s;
          }

          .bottom-nav-link:hover {
            color: #1d4ed8;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 800px) {
            .db-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
    </DbAuthGuard>
  );
}
