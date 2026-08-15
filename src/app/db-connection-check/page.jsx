'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DBConnectionCheck() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedServer, setSelectedServer] = useState('current');
  const [fetchError, setFetchError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const serverOptions = [
    { id: 'current', name: 'Current Origin (Default)', url: '/api/db-check' },
    { id: 'paid', name: 'Paid Server (topmcqbd.pages.dev)', url: 'https://topmcqbd.pages.dev/api/db-check' },
    { id: 'free', name: 'Free Server (topmcqbd-web-free.pages.dev)', url: 'https://topmcqbd-web-free.pages.dev/api/db-check' }
  ];

  const checkConnection = async (serverType = selectedServer) => {
    setLoading(true);
    setFetchError(null);
    try {
      const selected = serverOptions.find(s => s.id === serverType) || serverOptions[0];
      const res = await fetch(selected.url, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      setData(json);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch database diagnostic endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection('current');
  }, []);

  const handleServerChange = (e) => {
    const newServer = e.target.value;
    setSelectedServer(newServer);
    checkConnection(newServer);
  };

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
            Cloudflare Pages সার্ভারলেস ও MongoDB ক্লাস্টারের মধ্যকার রিয়েল-টাইম কানেকশন স্ট্যাটাস
          </p>
        </div>

        {/* Server Selector & Refresh Action */}
        <div className="db-control-bar">
          <div className="select-wrapper">
            <label htmlFor="server-select" className="control-label">টার্গেট ক্লাউডফ্লেয়ার সার্ভার:</label>
            <select
              id="server-select"
              value={selectedServer}
              onChange={handleServerChange}
              className="server-dropdown"
              disabled={loading}
            >
              {serverOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => checkConnection(selectedServer)}
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

        {lastChecked && (
          <div className="last-checked-bar">
            সর্বশেষ টেস্ট করা হয়েছে: <strong>{lastChecked}</strong>
          </div>
        )}

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

        {/* Diagnostic Explanation & Troubleshooting Guide */}
        <div className="guide-card">
          <h2 className="guide-title">📖 ডাটাবেজ কানেকশন গাইড ও সমাধান (Troubleshooting)</h2>
          
          <div className="guide-grid">
            <div className="guide-item">
              <div className="guide-icon">🟢</div>
              <div>
                <strong>কানেকশন সফল (Connected):</strong>
                <p>Cloudflare Pages Functions সরাসরি Native MongoDB Driver দিয়ে ক্লাস্টারের সাথে যুক্ত হয়েছে এবং পিং কমান্ড সফল হয়েছে।</p>
              </div>
            </div>

            <div className="guide-item">
              <div className="guide-icon">🔒</div>
              <div>
                <strong>আইপি অ্যাক্সেস সমস্যা (Timeout / ECONNREFUSED):</strong>
                <p>MongoDB Atlas ড্যাশবোর্ডে <strong>Network Access ➔ Add IP Address</strong> এ গিয়ে <code>0.0.0.0/0</code> (Allow Access from Anywhere) এনাবল থাকতে হবে, কারণ Cloudflare Pages ডাইনামিক ক্লাউড আইপি ব্যবহার করে।</p>
              </div>
            </div>

            <div className="guide-item">
              <div className="guide-icon">🔑</div>
              <div>
                <strong>অথেনটিকেশন এরর (AuthenticationFailed):</strong>
                <p>MongoDB Atlas-এর Database Access ইউজার পাসওয়ার্ড ও URI সঠিক আছে কিনা যাচাই করুন।</p>
              </div>
            </div>

            <div className="guide-item">
              <div className="guide-icon">🌐</div>
              <div>
                <strong>সার্ভার রাউটিং আর্কিটেকচার:</strong>
                <p>
                  • <code>https://topmcqbd.pages.dev</code> ➔ পেইড সিস্টেম ও মূল ক্লাস্টার (TopMCQBD_DB)<br />
                  • <code>https://topmcqbd-web-free.pages.dev</code> ➔ ফ্রি এমসিকিউ ক্লাস্টার (TopMCQBD_DB_Free)
                </p>
              </div>
            </div>
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
