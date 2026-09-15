'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const DB_SERVICES = [
  {
    id: 'paid',
    name: 'Paid Core DB (Auth & Payments)',
    cluster: 'TopMCQBD_DB',
    host: 'mosabber.3ajdj0u.mongodb.net',
    renderUrl: 'https://topmcqbd-paid-api.onrender.com',
    pingUrl: 'https://topmcqbd-paid-api.onrender.com/api/db-test/paid',
    collectionTarget: 'db-paid-test / users',
    type: 'Paid MongoDB Atlas Cluster',
    badgeColor: '#10b981'
  },
  {
    id: 'subjective',
    name: 'Subjective MCQs Paid DB',
    cluster: 'TopMCQBD_DB_Subjective',
    host: 'topmcqbd.3ifvd7c.mongodb.net',
    renderUrl: 'https://subjective-paid-api.onrender.com',
    pingUrl: 'https://subjective-paid-api.onrender.com/api/db-test/subjective',
    collectionTarget: 'db-subjective-test',
    type: 'Paid MongoDB Atlas Cluster',
    badgeColor: '#059669'
  },
  {
    id: 'live-exam',
    name: 'Live Exam Engine Paid DB',
    cluster: 'TopMCQBD_DB_Live_Exam',
    host: 'topmcqbd.ns1gpls.mongodb.net',
    renderUrl: 'https://live-exam-paid-api.onrender.com',
    pingUrl: 'https://live-exam-paid-api.onrender.com/api/db-test/live-exam',
    collectionTarget: 'db-live-exam-test',
    type: 'Paid MongoDB Atlas Cluster',
    badgeColor: '#047857'
  },
  {
    id: 'written',
    name: 'Written Exam Paid DB',
    cluster: 'TopMCQBD_DB_written',
    host: 'topmcqbd.hfivdlt.mongodb.net',
    renderUrl: 'https://written-paid-api.onrender.com',
    pingUrl: 'https://written-paid-api.onrender.com/api/db-test/written',
    collectionTarget: 'db-written-test',
    type: 'Paid MongoDB Atlas Cluster',
    badgeColor: '#0d9488'
  },
  {
    id: 'question-bank',
    name: 'Question Bank Paid DB',
    cluster: 'TopMCQBD_DB_Question_Bank',
    host: 'topmcqbd.bexo18c.mongodb.net',
    renderUrl: 'https://question-bank-paid-api.onrender.com',
    pingUrl: 'https://question-bank-paid-api.onrender.com/api/db-test/question-bank',
    collectionTarget: 'db-question-bank-test',
    type: 'Paid MongoDB Atlas Cluster',
    badgeColor: '#0284c7'
  },
  {
    id: 'free',
    name: 'Free Practice & Open MCQs DB',
    cluster: 'TopMCQBD_DB_Free',
    host: 'topmcqbd.pixb7fx.mongodb.net',
    renderUrl: 'https://topmcqbd-free-api.onrender.com',
    pingUrl: 'https://topmcqbd-free-api.onrender.com/api/db-test/free',
    collectionTarget: 'db-free-test',
    type: 'Free MongoDB Atlas Cluster',
    badgeColor: '#16a34a'
  },
  {
    id: 'd1',
    name: 'Cloudflare D1 SQL Edge DB',
    cluster: 'topmcqbd-db',
    host: 'Cloudflare APAC Edge Network',
    renderUrl: 'https://topmcqbd.pages.dev',
    pingUrl: 'https://topmcqbd.pages.dev/api/db-test/d1',
    collectionTarget: 'app_configs (SQL)',
    type: 'Serverless SQL Edge Database',
    badgeColor: '#f59e0b'
  }
];

export default function DbMongodbActiveConnectionPage() {
  const [loading, setLoading] = useState(false);
  const [dbStatuses, setDbStatuses] = useState({});
  const [lastWakeTime, setLastWakeTime] = useState(null);
  const [totalAwake, setTotalAwake] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Perform simultaneous wake-up ping to all 6 MongoDB clusters + D1
  const wakeUpAllDatabases = useCallback(async () => {
    setLoading(true);

    const results = {};
    let activeCount = 0;
    let sumLatency = 0;
    let latencyCount = 0;

    const pingPromises = DB_SERVICES.map(async (svc) => {
      const t0 = Date.now();
      try {
        const res = await fetch(svc.pingUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' }
        });
        const t1 = Date.now();
        const latency = t1 - t0;
        const data = await res.json().catch(() => ({}));

        const isConnected = res.ok && (data.connected === true || data.success === true);
        if (isConnected) activeCount++;
        sumLatency += latency;
        latencyCount++;

        results[svc.id] = {
          connected: isConnected,
          latencyMs: data.latencyMs || latency,
          collections: data.collections || (data.collection ? [data.collection] : []),
          totalItems: data.totalItems ?? (Array.isArray(data.items) ? data.items.length : null),
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: true }),
          statusText: isConnected ? 'সক্রিয় ও সজাগ (Awake)' : 'রেসপন্স এরর'
        };
      } catch (err) {
        results[svc.id] = {
          connected: false,
          latencyMs: Date.now() - t0,
          error: err.message || 'সংযোগ ব্যর্থ',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: true }),
          statusText: 'কানেকশন ফেইল্ড'
        };
      }
    });

    await Promise.allSettled(pingPromises);

    setDbStatuses(results);
    setTotalAwake(activeCount);
    setAvgLatency(latencyCount > 0 ? Math.round(sumLatency / latencyCount) : 0);
    setLastWakeTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    setLoading(false);
  }, []);

  // Run immediately on page mount (NO PASSWORD REQUIRED)
  useEffect(() => {
    wakeUpAllDatabases();
  }, [wakeUpAllDatabases]);

  const copyUptimeUrl = () => {
    const url = 'https://topmcqbd.pages.dev/api/db-mongodb-active-connection';
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '32px 20px', fontFamily: "'Hind Siliguri', sans-serif" }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* TOP BREADCRUMB & NAV */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
            <Link href="/" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: '600' }}>হোম</Link>
            <span>/</span>
            <Link href="/db-connection" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: '600' }}>DB Suite</Link>
            <span>/</span>
            <span style={{ color: '#0f172a', fontWeight: '700' }}>MongoDB Active Connection Hub</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/db-connection"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <i className="fa-solid fa-lock" style={{ fontSize: '11px' }}></i> পাসওয়ার্ড প্রটেক্টেড DB Suite
            </Link>
          </div>
        </div>

        {/* HERO CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
            borderRadius: '20px',
            padding: '36px 32px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                marginBottom: '14px'
              }}
            >
              <i className="fa-solid fa-bolt" style={{ color: '#34d399' }}></i> নো-পাসওয়ার্ড ইনস্ট্যান্ট ওয়েকআপ হাব
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
              MongoDB Atlas 24/7 Active Connection & Keep-Alive
            </h1>
            <p style={{ fontSize: '16px', color: '#a7f3d0', maxWidth: '850px', lineHeight: '1.6' }}>
              এই পেজে প্রবেশ করলেই স্বয়ংক্রিয়ভাবে ৬টি ডেডিকেটেড MongoDB Atlas ক্লাস্টার এবং Cloudflare D1-এ একসাথে লাইভ রিড কোয়েরি চলে যায়। 
              ফলে কোনো ডেটাবেজ কখনোই স্লিপ (Paused) মোডে যায় না এবং সবসময় ১০০% জাগ্রত থাকে।
            </p>

            {/* LIVE SUMMARY PILLS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px' }}>
              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: totalAwake === DB_SERVICES.length ? '#10b981' : '#f59e0b', boxShadow: '0 0 10px #10b981' }}></div>
                <div>
                  <div style={{ fontSize: '11px', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: '700' }}>জাগ্রত ডেটাবেজ</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>{totalAwake} / {DB_SERVICES.length} টি সচল</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-solid fa-gauge-high" style={{ color: '#38bdf8', fontSize: '20px' }}></i>
                <div>
                  <div style={{ fontSize: '11px', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: '700' }}>গড় রেসপন্স স্পিড</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>{avgLatency} ms</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="fa-regular fa-clock" style={{ color: '#fbbf24', fontSize: '20px' }}></i>
                <div>
                  <div style={{ fontSize: '11px', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: '700' }}>সর্বশেষ ওয়েক-আপ</div>
                  <div style={{ fontSize: '18px', fontWeight: '700' }}>{lastWakeTime || 'চেকিং...'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION CONTROL BAR */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <button
            onClick={wakeUpAllDatabases}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px',
              borderRadius: '10px',
              backgroundColor: loading ? '#94a3b8' : '#047857',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-bolt'}`}></i>
            {loading ? 'সব ডেটাবেজ সজাগ করা হচ্ছে...' : 'এক ক্লিকে সব ডাটাবেজ সজাগ করুন'}
          </button>
        </div>

        {/* MASTER KEEP-ALIVE URL CARD */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1.5px dashed #3b82f6',
            borderRadius: '16px',
            padding: '18px 24px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: '800', fontSize: '15.5px', marginBottom: '8px' }}>
              <i className="fa-solid fa-link" style={{ color: '#2563eb' }}></i> মাস্টার কিপ-অ্যালাইভ URL
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', backgroundColor: '#ffffff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e3a8a', width: 'fit-content', fontWeight: '600' }}>
              https://topmcqbd.pages.dev/api/db-mongodb-active-connection
            </div>
          </div>

          <button
            onClick={copyUptimeUrl}
            style={{
              padding: '10px 18px',
              backgroundColor: copiedUrl ? '#16a34a' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
          >
            <i className={`fa-solid ${copiedUrl ? 'fa-check' : 'fa-copy'}`}></i>
            {copiedUrl ? 'কপি হয়েছে!' : 'URL কপি করুন'}
          </button>
        </div>

        {/* 7x LIVE DATABASE CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          {DB_SERVICES.map((svc, idx) => {
            const status = dbStatuses[svc.id] || {};
            const isConnected = status.connected === true;
            const latency = status.latencyMs;

            return (
              <div
                key={svc.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Colored Accent Bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: svc.badgeColor }}></div>

                <div>
                  {/* Status & Type Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569'
                      }}
                    >
                      {svc.type}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        backgroundColor: loading ? '#f1f5f9' : isConnected ? '#ecfdf5' : '#fef2f2',
                        color: loading ? '#64748b' : isConnected ? '#059669' : '#dc2626',
                        border: `1px solid ${loading ? '#e2e8f0' : isConnected ? '#a7f3d0' : '#fecaca'}`
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: loading ? '#94a3b8' : isConnected ? '#10b981' : '#ef4444'
                        }}
                      ></span>
                      {loading ? 'পিং হচ্ছে...' : isConnected ? 'জাগ্রত ও সক্রিয়' : 'ডিসকানেক্টেড'}
                    </span>
                  </div>

                  {/* Title & DB Name */}
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                    {idx + 1}. {svc.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Database:</span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#047857',
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: '#ecfdf5',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {svc.cluster}
                    </span>
                  </div>

                  {/* Clean Cluster Host URL (NO KEY) */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
                      <i className="fa-solid fa-link" style={{ marginRight: '4px' }}></i> ক্লাস্টার হোস্ট URL (No Key)
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#334155', fontWeight: '600', wordBreak: 'break-all' }}>
                      {svc.host}
                    </div>
                  </div>

                  {/* Metrics Row: Equal Size Boxes & Wrapping Collections */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {/* Upper Row: Latency & Collection Count (Side-by-side with exact equal 65px height) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          height: '65px'
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>
                          <i className="fa-solid fa-gauge-high" style={{ marginRight: '5px' }}></i> পিং লেটেন্সি
                        </div>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: '800',
                            color: latency < 500 ? '#059669' : latency < 1200 ? '#d97706' : '#dc2626',
                            fontFamily: "'Outfit', sans-serif",
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {latency ? `${latency} ms` : '--'}
                        </div>
                      </div>

                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          height: '65px'
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>
                          <i className="fa-solid fa-layer-group" style={{ marginRight: '5px' }}></i> মোট কালেকশন
                        </div>
                        <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                          {status.collections && status.collections.length > 0 ? `${status.collections.length}টি কালেকশন` : '১টি কালেকশন'}
                        </div>
                      </div>
                    </div>

                    {/* Lower Box: Dedicated Collection List (Wraps downwards cleanly without hiding!) */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        minHeight: '88px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                        <i className="fa-solid fa-database" style={{ marginRight: '5px' }}></i> কালেকশন তালিকা:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'flex-start' }}>
                        {((status.collections && status.collections.length > 0)
                          ? status.collections
                          : (svc.collectionTarget ? svc.collectionTarget.split(',').map(s => s.trim()) : [])
                        ).map((colName) => (
                          <span
                            key={colName}
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#1e293b',
                              fontSize: '11.5px',
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: '600',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              lineHeight: '1.3',
                              wordBreak: 'break-all'
                            }}
                          >
                            {colName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div style={{ paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    রেসপন্স: {status.timestamp || 'অপেক্ষমান'}
                  </span>

                  <a
                    href={svc.pingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '12px',
                      color: '#0284c7',
                      textDecoration: 'none',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    সরাসরি টেস্ট <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px' }}></i>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
