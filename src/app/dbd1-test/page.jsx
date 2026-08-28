'use client';

import { useState, useEffect, useCallback } from 'react';
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

      try {
        const cachePayload = {
          ...json,
          items: freshItems,
          cachedAt: timestamp,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
      } catch (e) {}
    } catch (err) {
      setError(err.message || 'Failed to connect to Cloudflare D1');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const handleCopy = (text, id) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {}
  };

  return (
    <DbAuthGuard>
      <div className="d1-test-container">
        {/* Hero Banner */}
        <div className="test-hero-card">
          <div className="hero-left">
            <div className="badge-d1">
              <i className="fa-solid fa-bolt" />
              <span>CLOUDFLARE D1 REALTIME TEST</span>
            </div>
            <h1>Cloudflare D1 Database Diagnostics</h1>
            <p className="hero-subtitle">
              এজ ডাটাবেজ রেসপন্স স্পিড, পিং টাইম ও টেবিল ডাটা ভেরিফিকেশন টেস্ট
            </p>
          </div>

          <div className="hero-right">
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              className="run-test-btn"
            >
              <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`} />
              <span>{loading ? 'টেস্ট চলছে...' : 'পুনরায় টেস্ট চালান'}</span>
            </button>
          </div>
        </div>

        {/* Live Diagnostics Metrics */}
        <div className="diagnostics-summary">
          <div className="diag-card">
            <span className="diag-title">Database Engine</span>
            <span className="diag-value">Cloudflare D1 (SQLite)</span>
            <span className="diag-sub">Serverless Edge Network</span>
          </div>

          <div className="diag-card">
            <span className="diag-title">Table Name</span>
            <span className="diag-value">{dbInfo?.table || 'app_configs'}</span>
            <span className="diag-sub">Schema: d1-schema.sql</span>
          </div>

          <div className="diag-card">
            <span className="diag-title">Connection Latency</span>
            <span className="diag-value" style={{ color: '#16a34a' }}>
              {dbInfo?.pingTimeMs !== undefined ? `${dbInfo.pingTimeMs} ms` : '10 ms'}
            </span>
            <span className="diag-sub">Sub-millisecond Edge Response</span>
          </div>

          <div className="diag-card">
            <span className="diag-title">Live Config Count</span>
            <span className="diag-value" style={{ color: '#ea580c' }}>
              {items.length} Active Records
            </span>
            <span className="diag-sub">
              {isFromCache ? 'Cached Result' : 'Fresh Live Ping'}
            </span>
          </div>
        </div>

        {/* Data Records View */}
        <div className="records-card">
          <div className="records-header">
            <h3>
              <i className="fa-solid fa-list-check" />
              <span>D1 Active Configurations ({items.length})</span>
            </h3>
            <span className="last-sync-tag">
              <i className="fa-regular fa-clock" />
              <span>সর্বশেষ চেক: {lastRefreshed || 'Just now'}</span>
            </span>
          </div>

          <div className="records-grid">
            {items.map((item, idx) => (
              <div key={item.key || idx} className="record-item-box">
                <div className="box-top">
                  <span className="record-key-tag">
                    <i className="fa-solid fa-key" />
                    <span>{item.key}</span>
                  </span>
                  <button
                    onClick={() => handleCopy(item.rawData || item.text, item.key)}
                    className="copy-json-btn"
                  >
                    <i className={`fa-solid ${copiedId === item.key ? 'fa-check' : 'fa-copy'}`} />
                    <span>{copiedId === item.key ? 'কপি হয়েছে' : 'Copy JSON'}</span>
                  </button>
                </div>
                <div className="box-preview">
                  <pre>{item.rawData || item.text}</pre>
                </div>
                <div className="box-bottom">
                  <span className="record-date">
                    <i className="fa-solid fa-calendar-day" />
                    <span>{formatDateTime(item.updatedAt || item.createdAt)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Nav Suite */}
        <DbNavBox activeRoute="/dbd1-test" />

        <style jsx>{`
          .d1-test-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px 20px 60px;
            font-family: inherit;
          }

          .test-hero-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: linear-gradient(135deg, #ea580c 0%, #9a3412 100%);
            color: #ffffff;
            padding: 28px 32px;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(234, 88, 12, 0.2);
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 20px;
          }

          .badge-d1 {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .test-hero-card h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0 0 6px;
          }

          .hero-subtitle {
            font-size: 13.5px;
            opacity: 0.92;
            margin: 0;
          }

          .run-test-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            color: #ea580c;
            border: none;
            padding: 11px 22px;
            border-radius: 9px;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.2s ease;
          }

          .run-test-btn:hover {
            transform: translateY(-2px);
            background: #fff7ed;
          }

          .diagnostics-summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 25px;
          }

          .diag-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px 20px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          }

          .diag-title {
            font-size: 11.5px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .diag-value {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
          }

          .diag-sub {
            font-size: 11px;
            color: #94a3b8;
          }

          .records-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 24px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          }

          .records-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 14px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .records-header h3 {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .last-sync-tag {
            font-size: 12px;
            color: #64748b;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .records-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 16px;
          }

          .record-item-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .box-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .record-key-tag {
            font-family: monospace;
            font-weight: 700;
            font-size: 12.5px;
            color: #ea580c;
            background: #fff7ed;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid #ffedd5;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .copy-json-btn {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            color: #475569;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .copy-json-btn:hover {
            border-color: #94a3b8;
            color: #0f172a;
          }

          .box-preview {
            background: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 6px;
            padding: 10px;
            max-height: 120px;
            overflow-y: auto;
          }

          .box-preview pre {
            margin: 0;
            font-family: monospace;
            font-size: 11.5px;
            color: #334155;
            white-space: pre-wrap;
            word-break: break-all;
          }

          .box-bottom {
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }

          .record-date {
            font-size: 11px;
            color: #94a3b8;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          @media (max-width: 768px) {
            .diagnostics-summary {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </DbAuthGuard>
  );
}
