'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
  const [fetchError, setFetchError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Save results to localStorage
  const saveToCache = (paid, free, timestamp) => {
    try {
      const cacheObj = {
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

  // Perform live database connection check on BOTH Render APIs
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

      const [paidRes, freeRes] = await Promise.allSettled([paidPromise, freePromise]);

      let newPaid = null;
      let newFree = null;
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

      const currentTime = formatDateTime(new Date());
      setPaidData(newPaid);
      setFreeData(newFree);
      setLastChecked(currentTime);
      setIsFromCache(false);

      if (errors.length > 0) {
        setFetchError(errors.join(' | '));
      }

      saveToCache(newPaid, newFree, currentTime);
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
        if (cached && (cached.paidData || cached.data)) {
          setPaidData(cached.paidData || cached.data?.paidDb || null);
          setFreeData(cached.freeData || cached.data?.freeDb || null);
          setLastChecked(cached.lastChecked || formatDateTime(cached.savedAt));
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Error reading from localStorage cache:', err);
    }

    // If no cache exists in localStorage, perform initial live check
    checkConnection();
  }, [checkConnection]);

  return (
    <main className="db-page-container">
      {/* Background Orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />

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
                <div className="card-type-tag">Primary / Paid Cluster</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Render: <code>topmcqbd-paid-api</code>
                </div>
              </div>
              <div className={`status-pill ${paidData?.connected ? 'pill-success' : 'pill-danger'}`}>
                <span className="status-dot" />
                {loading ? 'Checking...' : paidData?.connected ? 'Connected' : 'Disconnected'}
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
                {loading ? 'Checking...' : freeData?.connected ? 'Connected' : 'Disconnected'}
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

        {/* Back Link */}
        <div className="back-bar">
          <Link href="/" className="back-link">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
      </div>
    </main>
  );
}
