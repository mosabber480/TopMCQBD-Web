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

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.paidData || parsed.freeData || parsed.d1Data)) {
          setPaidData(parsed.paidData);
          setFreeData(parsed.freeData);
          setD1Data(parsed.d1Data);
          setLastChecked(parsed.lastChecked || formatDateTime(parsed.savedAt));
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    checkConnection();
  }, [checkConnection]);

  return (
    <DbAuthGuard activeRoute="/db-connection-check">
      <main className="db-page-container">
        <div className="db-card">
          {/* Header */}
          <div className="header-flex">
            <div>
              <div className="db-badge">
                <i className="fa-solid fa-server" style={{ marginRight: '6px' }} />
                <span>TOPMCQBD MULTI-DATABASE ARCHITECTURE</span>
              </div>
              <h1 className="title">Database Live Connection Hub</h1>
              <p className="subtitle">
                Cloudflare D1 (Edge SQL) + Render Paid MongoDB Atlas + Render Free MongoDB Atlas
              </p>
            </div>
            <button onClick={checkConnection} disabled={loading} className="btn-refresh">
              <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`} style={{ marginRight: '6px' }} />
              <span>{loading ? 'যাচাই চলছে...' : 'নতুন করে চেক করুন'}</span>
            </button>
          </div>

          {/* Cache bar */}
          <div className="cache-bar">
            <span>
              <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '6px' }} />
              সর্বশেষ টেস্ট: <b>{lastChecked || 'লোড হচ্ছে...'}</b>
            </span>
            {isFromCache && (
              <span className="cache-pill">
                <i className="fa-solid fa-bolt" style={{ marginRight: '4px' }} />
                ক্যাশ মেমোরি থেকে লোড হয়েছে
              </span>
            )}
          </div>

          {fetchError && (
            <div className="alert-box error">
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px', color: '#dc2626' }} />
              <div>
                <b style={{ color: '#dc2626' }}>কানেকশন সতর্কতা:</b>
                <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c' }}>{fetchError}</p>
              </div>
            </div>
          )}

          {/* Database Grid: Row 1 (2 boxes), Row 2 (1 box on the left) */}
          <div className="db-grid-container">
            {/* 1. Paid MongoDB Card (Top Left) */}
            <div className="db-cluster-box" style={{ borderColor: '#bae6fd' }}>
              <div className="cluster-header" style={{ background: '#f0f9ff', borderBottomColor: '#e0f2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#008fb0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    <i className="fa-solid fa-crown" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#008fb0', fontWeight: '800' }}>Paid DB (MongoDB)</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Database: TopMCQBD_DB</span>
                  </div>
                </div>
                <span className={`status-pill ${paidData?.connected ? 'connected' : 'error'}`}>
                  <i className={`fa-solid ${paidData?.connected ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight: '4px' }} />
                  <span>{paidData?.connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div className="cluster-body">
                <div className="info-row">
                  <span className="info-lbl">Database Scope:</span>
                  <span className="info-val">Users, Auth, Paid Quiz, Subscriptions</span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Server Backend:</span>
                  <span className="info-val">Render Paid API (Node.js)</span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Latency / Ping:</span>
                  <span className="info-val" style={{ color: '#16a34a', fontWeight: '700' }}>
                    {paidData?.latencyMs !== null && paidData?.latencyMs !== undefined ? `${paidData.latencyMs} ms` : 'Active'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Collections:</span>
                  <span className="info-val">users, questions, quiz_exams</span>
                </div>

                <div className="action-links">
                  <Link href="/dbpaid-admin" className="card-action-btn" style={{ background: '#f0f9ff', color: '#008fb0', border: '1px solid #bae6fd' }}>
                    <i className="fa-solid fa-sliders" style={{ marginRight: '4px' }} />
                    <span>Paid DB Admin</span>
                  </Link>
                  <Link href="/dbpaid-test" className="card-action-btn" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-globe" style={{ marginRight: '4px' }} />
                    <span>Paid DB Test</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Free MongoDB Card (Top Right) */}
            <div className="db-cluster-box" style={{ borderColor: '#bae6fd' }}>
              <div className="cluster-header" style={{ background: '#f0f9ff', borderBottomColor: '#e0f2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#0080c3', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    <i className="fa-solid fa-layer-group" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0080c3', fontWeight: '800' }}>Free DB (MongoDB)</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Database: TopMCQBD_DB_Free</span>
                  </div>
                </div>
                <span className={`status-pill ${freeData?.connected ? 'connected' : 'error'}`}>
                  <i className={`fa-solid ${freeData?.connected ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight: '4px' }} />
                  <span>{freeData?.connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div className="cluster-body">
                <div className="info-row">
                  <span className="info-lbl">Database Scope:</span>
                  <span className="info-val">Free MCQs, All MCQ Question Bank</span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Server Backend:</span>
                  <span className="info-val">Render Free API (Node.js)</span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Latency / Ping:</span>
                  <span className="info-val" style={{ color: '#16a34a', fontWeight: '700' }}>
                    {freeData?.latencyMs !== null && freeData?.latencyMs !== undefined ? `${freeData.latencyMs} ms` : 'Active'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Collections:</span>
                  <span className="info-val">free_mcqs, question_bank</span>
                </div>

                <div className="action-links">
                  <Link href="/dbfree-admin" className="card-action-btn" style={{ background: '#f0f9ff', color: '#0080c3', border: '1px solid #bae6fd' }}>
                    <i className="fa-solid fa-sliders" style={{ marginRight: '4px' }} />
                    <span>Free DB Admin</span>
                  </Link>
                  <Link href="/dbfree-test" className="card-action-btn" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-globe" style={{ marginRight: '4px' }} />
                    <span>Free DB Test</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Cloudflare D1 Card (Bottom Left) */}
            <div className="db-cluster-box" style={{ borderColor: '#fed7aa' }}>
              <div className="cluster-header" style={{ background: '#fff7ed', borderBottomColor: '#ffedd5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    <i className="fa-solid fa-bolt" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#ea580c', fontWeight: '800' }}>Cloudflare D1 (SQL)</h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Database: topmcqbd-db</span>
                  </div>
                </div>
                <span className={`status-pill ${d1Data?.connected ? 'connected' : 'error'}`}>
                  <i className={`fa-solid ${d1Data?.connected ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight: '4px' }} />
                  <span>{d1Data?.connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
                </span>
              </div>

              <div className="cluster-body">
                <div className="info-row">
                  <span className="info-lbl">Database Scope:</span>
                  <span className="info-val">Header, Footer, Sliders, Policies</span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Engine & Type:</span>
                  <span className="info-val">Serverless SQLite on Cloudflare Edge</span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Latency / Ping:</span>
                  <span className="info-val" style={{ color: '#16a34a', fontWeight: '700' }}>
                    {d1Data?.pingTimeMs !== null && d1Data?.pingTimeMs !== undefined ? `${d1Data.pingTimeMs} ms` : '10 ms'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-lbl">Active Collections:</span>
                  <span className="info-val">app_configs, db-d1-test</span>
                </div>

                <div className="action-links">
                  <Link href="/dbd1-admin" className="card-action-btn" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
                    <i className="fa-solid fa-sliders" style={{ marginRight: '4px' }} />
                    <span>D1 Admin Panel</span>
                  </Link>
                  <Link href="/dbd1-test" className="card-action-btn" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
                    <i className="fa-solid fa-bolt" style={{ marginRight: '4px' }} />
                    <span>D1 Live Test</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Box */}
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

          .db-card {
            width: 100%;
            max-width: 1050px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }

          .header-flex {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }

          .db-badge {
            display: inline-flex;
            align-items: center;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 10px;
          }

          .title {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 6px;
          }

          .subtitle {
            font-size: 14px;
            color: #64748b;
            margin: 0;
          }

          .btn-refresh {
            display: inline-flex;
            align-items: center;
            background: #4f46e5;
            color: #ffffff;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(79, 70, 229, 0.2);
            transition: all 0.2s ease;
          }

          .btn-refresh:hover {
            background: #4338ca;
            transform: translateY(-1px);
          }

          .cache-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            color: #475569;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .cache-pill {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fde68a;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
          }

          .alert-box {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .alert-box.error {
            background: #fef2f2;
            border: 1px solid #fecaca;
          }

          .db-grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .db-cluster-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
          }

          .cluster-header {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .status-pill {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }

          .status-pill.connected {
            background: #dcfce7;
            color: #16a34a;
            border: 1px solid #bbf7d0;
          }

          .status-pill.error {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fca5a5;
          }

          .cluster-body {
            padding: 18px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 12.5px;
            border-bottom: 1px dashed #f1f5f9;
            padding-bottom: 6px;
          }

          .info-lbl {
            color: #64748b;
          }

          .info-val {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
          }

          .action-links {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 10px;
          }

          .card-action-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: 7px;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s ease;
          }

          .card-action-btn:hover {
            transform: translateY(-1px);
            filter: brightness(0.96);
          }

          .bottom-nav-link {
            font-size: 13px;
            color: #64748b;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            font-weight: 600;
            transition: color 0.2s;
          }

          .bottom-nav-link:hover {
            color: #0f172a;
          }

          @media (max-width: 800px) {
            .db-grid-container {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
    </DbAuthGuard>
  );
}
