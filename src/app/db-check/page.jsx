'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const TEXTS_CACHE_KEY = 'topmcqbd_test_texts_cache';

const formatItemDate = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const DEFAULT_ITEMS = [
  {
    _id: 'local_init_1',
    text: 'DB Connection Check',
    createdAt: new Date().toISOString(),
  },
];

export default function DbCheckPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshToast, setRefreshToast] = useState(false);
  const [isLiveDatabase, setIsLiveDatabase] = useState(false);

  // Live database fetch (Executed ONLY when user clicks Refresh button)
  const fetchDbTexts = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/db-test-text', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
        try {
          localStorage.setItem(TEXTS_CACHE_KEY, JSON.stringify(data.items));
        } catch {}
      } else {
        setItems([]);
      }
      setIsLiveDatabase(true);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // On page load/reload: ONLY read from local storage / localhost, DO NOT query MongoDB Atlas!
  useEffect(() => {
    try {
      const cached = localStorage.getItem(TEXTS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
          setIsLiveDatabase(false);
          return;
        }
      }
    } catch {}

    setItems(DEFAULT_ITEMS);
    setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    setIsLiveDatabase(false);
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 40%, #030712 100%)',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: '2.5rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          top: '15%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '720px',
          width: '100%',
          zIndex: 1,
          padding: '2.5rem',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isRefreshing ? '#f59e0b' : '#10b981',
                boxShadow: isRefreshing ? '0 0 10px #f59e0b' : '0 0 10px #10b981',
              }}
            />
            MongoDB Collection: db-test-text
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0.25rem 0',
            }}
          >
            DB Connection Check
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            {isLiveDatabase
              ? '⚡ MongoDB Atlas থেকে সরাসরি যাচাইকৃত সকল সংরক্ষিত টেক্সট ও তারিখ'
              : '📦 লোকালহোস্ট / লোকাল ফাইল থেকে লোড হওয়া টেক্সট (রিফ্রেশ বাটনে ক্লিক করে MongoDB চেক করুন)'}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            ⚠️ এপিআই এরর: {error}
          </div>
        )}

        {/* Refresh feedback alert */}
        {refreshToast && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              textAlign: 'center',
            }}
          >
            ✅ MongoDB থেকে ডাটা সফলভাবে চেক ও রিফ্রেশ হয়েছে! ({items.length} টি টেক্সট)
          </div>
        )}

        {/* List of All Texts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
          {items.length === 0 ? (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                fontSize: '1rem',
              }}
            >
              বর্তমানে কোনো টেক্সট নেই।
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item._id || idx}
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: idx === 0 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                  border: idx === 0 ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Text Content */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', wordBreak: 'break-word' }}>
                    {item.text}
                  </div>
                  {item.createdAt && (
                    <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-regular fa-clock" style={{ fontSize: '0.78rem' }}></i>
                      <span>তারিখ ও সময়: {formatItemDate(item.createdAt)}</span>
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                {idx === 0 && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.18)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34d399',
                      fontWeight: 700,
                    }}
                  >
                    সর্বশেষ এন্ট্রি
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sync Status & Refresh Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem',
            color: '#94a3b8',
          }}
        >
          <span>
            {lastUpdated ? (
              <>
                সর্বশেষ স্ট্যাটাস: <strong>{lastUpdated}</strong>{' '}
                <span style={{ color: isLiveDatabase ? '#34d399' : '#a5b4fc', fontSize: '0.78rem' }}>
                  ({isLiveDatabase ? '⚡ লাইভ MongoDB' : '📦 লোকাল ফাইল'})
                </span>
              </>
            ) : (
              'প্রস্তুত...'
            )}
          </span>
          <button
            onClick={fetchDbTexts}
            disabled={isRefreshing}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              background: isRefreshing ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#ffffff',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            <i className={`fa-solid fa-arrows-rotate ${isRefreshing ? 'fa-spin' : ''}`} style={{ color: '#818cf8' }}></i>
            <span>{isRefreshing ? 'MongoDB চেক হচ্ছে...' : 'রিফ্রেশ'}</span>
          </button>
        </div>

        {/* Bottom Navigation Bar */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Left: Back to Home */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            ← হোম পেজে ফিরে যান
          </Link>

          {/* Right: Go to /db-connection-check */}
          <Link
            href="/db-connection-check"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#c7d2fe',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.85rem', color: '#a5b4fc' }}></i>
            <span>/db-connection-check পেজে যান</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
