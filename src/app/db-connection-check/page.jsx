'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CACHE_KEY = 'topmcqbd_db_check_cache';

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
        year: 'numeric'
      });

  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return `${dateStr}, ${timeStr}`;
};

export default function DBConnectionCheck() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Function to save result to cache (localStorage & Cookie)
  const saveToCache = (payload, timestamp) => {
    try {
      const cacheObj = {
        data: payload,
        lastChecked: timestamp,
        savedAt: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
      // Also save in cookie (expires in 7 days)
      document.cookie = `${CACHE_KEY}=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } catch (e) {
      console.warn('Unable to write to localStorage:', e);
    }
  };

  // Perform a live connection check
  const checkConnection = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/db-check', { cache: 'no-store' });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      const currentTime = formatDateTime(new Date());
      
      setData(json);
      setLastChecked(currentTime);
      setIsFromCache(false);
      saveToCache(json, currentTime);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch database diagnostic endpoint');
    } finally {
      setLoading(false);
    }
  };

  // On page load/reload, check cache first
  useEffect(() => {
    checkConnection();
  }, []);

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
            Cloudflare Pages ও MongoDB ক্লাস্টারের মধ্যকার রিয়েল-টাইম কানেকশন স্ট্যাটাস
          </p>
        </div>

        {/* Action Bar */}
        <div className="db-control-bar">
          <div className="status-info-text">
            {lastChecked ? (
              <div className="status-badge-row">
                <span>সর্বশেষ টেস্ট: <strong>{lastChecked}</strong></span>
                {isFromCache ? (
                  <span className="cache-indicator-badge">📦 আগের যাচাইকৃত ফলাফল</span>
                ) : (
                  <span className="live-indicator-badge">⚡ সদ্য যাচাইকৃত ফলাফল</span>
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
              <strong>এপিআই রিকোয়েস্ট ব্যর্থ হয়েছে:</strong>
            </div>
            <p className="alert-msg">{fetchError}</p>
            <small className="alert-hint">
              * যদি আপনি লাইভ ক্লাউডফ্লেয়ার ডোমেইন সিলেক্ট করে থাকেন, নিশ্চিত করুন যে ফাংশনটি ডেপ্লয় হয়েছে এবং CORS এনাবল আছে।
            </small>
          </div>
        )}

        {/* Database Status Cards Grid */}
        <div className="db-grid">
          {/* Paid MongoDB Card */}
          <div className={`status-card ${data?.paidDb?.connected ? 'card-success' : 'card-danger'}`}>
            <div className="card-header">
              <div className="card-type-tag">Primary / Paid Cluster</div>
              <div className={`status-pill ${data?.paidDb?.connected ? 'pill-success' : 'pill-danger'}`}>
                <span className="status-dot" />
                {loading ? 'Checking...' : data?.paidDb?.connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            <h3 className="card-db-name">
              📁 {data?.paidDb?.name || 'TopMCQBD_DB'}
            </h3>

            <div className="meta-list">
              <div className="meta-row">
                <span className="meta-label">কানেকশন রেসপন্স টাইম:</span>
                <span className="meta-value">
                  {data?.paidDb?.latencyMs !== null && data?.paidDb?.latencyMs !== undefined
                    ? `${data.paidDb.latencyMs} ms`
                    : 'N/A'}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-label">ডাটাবেজ কালেকশনস:</span>
                <span className="meta-value">
                  {data?.paidDb?.collections ? `${data.paidDb.collections.length} টি কালেকশন` : '0'}
                </span>
              </div>
            </div>

            {data?.paidDb?.collections && data.paidDb.collections.length > 0 && (
              <div className="collections-box">
                <span className="box-title">কালেকশন তালিকা:</span>
                <div className="tags-container">
                  {data.paidDb.collections.map((col, idx) => (
                    <span key={idx} className="col-tag">{col}</span>
                  ))}
                </div>
              </div>
            )}

            {data?.paidDb?.error && (
              <div className="error-box">
                <strong className="error-title">❌ এরর বিস্তারিত:</strong>
                <pre className="error-code">{data.paidDb.error.message || JSON.stringify(data.paidDb.error)}</pre>
              </div>
            )}
          </div>

          {/* Free MongoDB Card */}
          <div className={`status-card ${data?.freeDb?.connected ? 'card-success' : 'card-danger'}`}>
            <div className="card-header">
              <div className="card-type-tag">Secondary / Free Cluster</div>
              <div className={`status-pill ${data?.freeDb?.connected ? 'pill-success' : 'pill-danger'}`}>
                <span className="status-dot" />
                {loading ? 'Checking...' : data?.freeDb?.connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            <h3 className="card-db-name">
              📁 {data?.freeDb?.name || 'TopMCQBD_DB_Free'}
            </h3>

            <div className="meta-list">
              <div className="meta-row">
                <span className="meta-label">কানেকশন রেসপন্স টাইম:</span>
                <span className="meta-value">
                  {data?.freeDb?.latencyMs !== null && data?.freeDb?.latencyMs !== undefined
                    ? `${data.freeDb.latencyMs} ms`
                    : 'N/A'}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-label">ডাটাবেজ কালেকশনস:</span>
                <span className="meta-value">
                  {data?.freeDb?.collections ? `${data.freeDb.collections.length} টি কালেকশন` : '0'}
                </span>
              </div>
            </div>

            {data?.freeDb?.collections && data.freeDb.collections.length > 0 && (
              <div className="collections-box">
                <span className="box-title">কালেকশন তালিকা:</span>
                <div className="tags-container">
                  {data.freeDb.collections.map((col, idx) => (
                    <span key={idx} className="col-tag">{col}</span>
                  ))}
                </div>
              </div>
            )}

            {data?.freeDb?.error && (
              <div className="error-box">
                <strong className="error-title">❌ এরর বিস্তারিত:</strong>
                <pre className="error-code">{data.freeDb.error.message || JSON.stringify(data.freeDb.error)}</pre>
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
