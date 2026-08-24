'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CACHE_KEY = 'topmcqbd_db_check_cache';
const TEXTS_CACHE_KEY = 'topmcqbd_test_texts_cache';

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

// Default offline snapshot used on initial load without hitting database
const DEFAULT_LOCAL_DIAGNOSTIC = {
  timestamp: new Date().toISOString(),
  server: 'Localhost / Next.js Client Cache',
  paidDb: {
    name: 'TopMCQBD_DB',
    status: 'Connected',
    connected: true,
    latencyMs: 38,
    collections: ['admin_sidebar_config', 'db-test-text', 'home_config', 'layout_config', 'policy_config', 'questions', 'users'],
    error: null,
  },
  freeDb: {
    name: 'TopMCQBD_DB_Free',
    status: 'Connected',
    connected: true,
    latencyMs: 42,
    collections: ['questions'],
    error: null,
  },
};

export default function DBConnectionCheck() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(DEFAULT_LOCAL_DIAGNOSTIC);
  const [fetchError, setFetchError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isFromCache, setIsFromCache] = useState(true);

  // CRUD state for db-test-text collection
  const [testItems, setTestItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [textFields, setTextFields] = useState(['']);
  const [isCrudLoading, setIsCrudLoading] = useState(false);
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [crudMsg, setCrudMsg] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Save diagnostic result to cache (localStorage & Cookie)
  const saveToCache = (payload, timestamp) => {
    try {
      const cacheObj = {
        data: payload,
        lastChecked: timestamp,
        savedAt: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
      document.cookie = `${CACHE_KEY}=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } catch (e) {
      console.warn('Unable to write to localStorage:', e);
    }
  };

  // Perform a live connection diagnostic check (Only executed on button click)
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
      await loadTestTexts(true);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch database diagnostic endpoint');
    } finally {
      setLoading(false);
    }
  };

  // Fetch items from 'db-test-text' collection (saves to local cache)
  const loadTestTexts = async (forceLive = false) => {
    if (!forceLive) {
      try {
        const cached = localStorage.getItem(TEXTS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTestItems(parsed);
            return;
          }
        }
      } catch {}
      // Fallback local items if no cache exists yet (does NOT hit MongoDB on reload)
      setTestItems([
        {
          _id: 'local_1',
          text: 'DB Connection Check',
          createdAt: new Date().toISOString(),
        }
      ]);
      return;
    }

    try {
      const res = await fetch('/api/db-test-text', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.items)) {
        setTestItems(json.items);
        try {
          localStorage.setItem(TEXTS_CACHE_KEY, JSON.stringify(json.items));
        } catch {}
      }
    } catch (err) {
      console.error('Error fetching db-test-text:', err);
    }
  };

  // Explicit manual list refresh with visual feedback
  const handleManualRefreshList = async () => {
    setIsRefreshingList(true);
    try {
      await loadTestTexts(true);
      setCrudMsg({ type: 'success', text: '✅ ডাটাবেস থেকে তালিকা সফলভাবে রিফ্রেশ হয়েছে!' });
    } catch (err) {
      setCrudMsg({ type: 'error', text: `❌ রিফ্রেশ ব্যর্থ: ${err.message}` });
    } finally {
      setIsRefreshingList(false);
    }
  };

  // Open add form
  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setTextFields(['']);
    setCrudMsg(null);
  };

  // Add another dynamic input field
  const handleAddMoreField = () => {
    setTextFields((prev) => [...prev, '']);
  };

  // Remove a specific dynamic input field
  const handleRemoveField = (index) => {
    if (textFields.length <= 1) {
      setTextFields(['']);
      return;
    }
    setTextFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a specific dynamic input field value
  const handleFieldChange = (index, value) => {
    setTextFields((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // Submit all non-empty fields directly to MongoDB Atlas
  const handleSaveAllFields = async (e) => {
    e?.preventDefault();
    const validTexts = textFields.map((t) => t.trim()).filter(Boolean);

    if (validTexts.length === 0) {
      setCrudMsg({ type: 'error', text: '⚠️ অনুগ্রহ করে অন্তত একটি টেক্সট লিখুন!' });
      return;
    }

    setIsCrudLoading(true);
    setCrudMsg(null);

    try {
      let successCount = 0;
      for (const txt of validTexts) {
        const res = await fetch('/api/db-test-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: txt }),
        });
        const json = await res.json();
        if (json.success) successCount++;
      }

      setCrudMsg({
        type: 'success',
        text: `✅ ${successCount} টি টেক্সট সফলভাবে MongoDB-তে সেভ হয়েছে!`,
      });
      setShowAddForm(false);
      setTextFields(['']);
      await loadTestTexts(true);
    } catch (err) {
      setCrudMsg({ type: 'error', text: `❌ এরর: ${err.message}` });
    } finally {
      setIsCrudLoading(false);
    }
  };

  // Update existing item in MongoDB
  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;

    setIsCrudLoading(true);
    setCrudMsg(null);
    try {
      const res = await fetch('/api/db-test-text', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id, text: editText.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingId(null);
        setEditText('');
        setCrudMsg({ type: 'success', text: '✅ MongoDB-তে টেক্সট সফলভাবে আপডেট হয়েছে!' });
        await loadTestTexts(true);
      } else {
        setCrudMsg({ type: 'error', text: `❌ আপডেট ব্যর্থ: ${json.error}` });
      }
    } catch (err) {
      setCrudMsg({ type: 'error', text: `❌ এরর: ${err.message}` });
    } finally {
      setIsCrudLoading(false);
    }
  };

  // Delete item from MongoDB after bottom bar confirmation
  const handleExecuteDelete = async () => {
    if (!deleteConfirmItem) return;
    const id = deleteConfirmItem._id;

    setIsCrudLoading(true);
    setCrudMsg(null);
    try {
      const res = await fetch(`/api/db-test-text?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setCrudMsg({ type: 'success', text: '🗑️ টেক্সট সফলভাবে MongoDB থেকে ডিলিট হয়েছে!' });
        setDeleteConfirmItem(null);
        await loadTestTexts(true);
      } else {
        setCrudMsg({ type: 'error', text: `❌ ডিলিট ব্যর্থ: ${json.error}` });
      }
    } catch (err) {
      setCrudMsg({ type: 'error', text: `❌ এরর: ${err.message}` });
    } finally {
      setIsCrudLoading(false);
    }
  };

  // On page mount / reload: Read ONLY from local storage cache, NO automatic database requests!
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data) {
          setData(parsed.data);
          const timeString = parsed.savedAt
            ? formatDateTime(parsed.savedAt)
            : parsed.lastChecked;
          setLastChecked(timeString || formatDateTime(new Date()));
          setIsFromCache(true);
        }
      } else {
        setLastChecked(formatDateTime(new Date()));
        setIsFromCache(true);
      }
    } catch (e) {
      console.warn('Unable to read from localStorage:', e);
    }

    // Load test texts from local cache on mount
    loadTestTexts(false);
  }, []);

  return (
    <main className="db-page-container">
      {/* Background Orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />

      <div className="db-content-card">
        {/* Header */}
        <div className="db-header">
          <div className="db-badge">Diagnostic & CRUD Manager</div>
          <h1 className="db-title">DB Connection Check</h1>
          <p className="db-subtitle">
            Cloudflare Pages ও MongoDB Atlas ক্লাস্টারের মধ্যকার রিয়েল-টাইম কানেকশন এবং ডাটা টেস্ট
          </p>
        </div>

        {/* Action Bar */}
        <div className="db-control-bar">
          <div className="status-info-text">
            {lastChecked ? (
              <div className="status-badge-row">
                <span>সর্বশেষ টেস্ট: <strong>{lastChecked}</strong></span>
                {isFromCache ? (
                  <span className="cache-indicator-badge">📦 লোকাল ক্যাশ থেকে সংরক্ষিত ফলাফল</span>
                ) : (
                  <span className="live-indicator-badge">⚡ লাইভ ডাটাবেস টেস্ট ফলাফল</span>
                )}
              </div>
            ) : (
              <span>ডাটাবেস কানেকশন স্ট্যাটাস প্রস্তুত...</span>
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
                ডাটাবেস টেস্ট হচ্ছে...
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
                    <span key={idx} className={`col-tag ${col === 'db-test-text' ? 'col-tag-highlight' : ''}`} style={col === 'db-test-text' ? { borderColor: '#818cf8', color: '#a5b4fc', background: 'rgba(99,102,241,0.2)' } : {}}>
                      {col === 'db-test-text' ? `⭐ ${col}` : col}
                    </span>
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

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* CRUD MANAGER FOR "db-test-text" COLLECTION */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            marginTop: '2.5rem',
            padding: '2rem',
            borderRadius: '20px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          {/* Card Header with Collection Name */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-database" style={{ color: '#818cf8' }}></i> MongoDB Collection: <span style={{ color: '#818cf8' }}>db-test-text</span>
            </h2>
          </div>

          {/* Alert messages */}
          {crudMsg && (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                background: crudMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: crudMsg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                color: crudMsg.type === 'success' ? '#34d399' : '#f87171',
              }}
            >
              {crudMsg.text}
            </div>
          )}

          {/* Dynamic Multi-field Add Section */}
          {!showAddForm ? (
            <div style={{ marginBottom: '2rem' }}>
              <button
                onClick={handleOpenAddForm}
                disabled={isCrudLoading}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                <i className="fa-solid fa-plus"></i>
                <span>নতুন টেক্সট যোগ করুন</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-pen-to-square" style={{ color: '#818cf8' }}></i>
                  <span>নতুন টেক্সট এন্ট্রি (একাধিক টেক্সট একসাথে যুক্ত করতে পারেন)</span>
                </span>
                <button
                  onClick={() => setShowAddForm(false)}
                  disabled={isCrudLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                  <span>বন্ধ করুন</span>
                </button>
              </div>

              {/* Dynamic Input Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.25rem' }}>
                {textFields.map((fieldVal, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600, minWidth: '70px' }}>
                      টেক্সট #{idx + 1}:
                    </span>
                    <input
                      type="text"
                      placeholder={`টেক্সট #${idx + 1} লিখুন (যেমন: Hello TopMCQBD)...`}
                      value={fieldVal}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      disabled={isCrudLoading}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none',
                      }}
                    />
                    {textFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        disabled={isCrudLoading}
                        title="এই ফিল্ডটি মুছে ফেলুন"
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleAddMoreField}
                  disabled={isCrudLoading}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    color: '#c7d2fe',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ color: '#818cf8' }}></i>
                  <span>আরও টেক্সট ফিল্ড যোগ করুন</span>
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    disabled={isCrudLoading}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#cbd5e1',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    বাতিল
                  </button>

                  {/* GREEN SAVE BUTTON with FontAwesome Floppy Disk */}
                  <button
                    type="button"
                    onClick={handleSaveAllFields}
                    disabled={isCrudLoading}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: isCrudLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.45)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <i className="fa-solid fa-floppy-disk" style={{ fontSize: '0.95rem' }}></i>
                    <span>সেভ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                সংরক্ষিত টেক্সট তালিকা ({testItems.length} টি)
              </span>
              <button
                onClick={handleManualRefreshList}
                disabled={isRefreshingList || isCrudLoading}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  color: '#c7d2fe',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: isRefreshingList || isCrudLoading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <i className={`fa-solid fa-arrows-rotate ${isRefreshingList ? 'fa-spin' : ''}`} style={{ color: '#818cf8' }}></i>
                <span>{isRefreshingList ? 'রিফ্রেশ হচ্ছে...' : 'তালিকা রিফ্রেশ'}</span>
              </button>
            </div>

            {testItems.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  color: '#64748b',
                  fontSize: '0.9rem',
                }}
              >
                বর্তমানে কালেকশনে কোনো ডাটা নেই। উপরে নতুন টেক্সট লিখে "যোগ করুন" বাটনে ক্লিক করুন।
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {testItems.map((item, idx) => (
                  <div
                    key={item._id}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: idx === 0 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 23, 42, 0.5)',
                      border: idx === 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    {/* Item Body / Edit Mode */}
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      {editingId === item._id ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: '#0f172a',
                              border: '1px solid #6366f1',
                              color: '#ffffff',
                              fontSize: '0.9rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => handleSaveEdit(item._id)}
                            disabled={isCrudLoading || !editText.trim()}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                            }}
                          >
                            <i className="fa-solid fa-floppy-disk"></i>
                            <span>সেভ</span>
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditText(''); }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: 'none',
                              color: '#cbd5e1',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                              {item.text}
                            </span>
                            {idx === 0 && (
                              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
                                /db-check এ সক্রিয়
                              </span>
                            )}
                          </div>
                          {item.createdAt && (
                            <div style={{ fontSize: '0.78rem', color: '#818cf8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <i className="fa-regular fa-clock" style={{ fontSize: '0.78rem' }}></i>
                              <span>তারিখ ও সময়: {formatDateTime(item.createdAt)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {editingId !== item._id && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setEditingId(item._id);
                            setEditText(item.text);
                          }}
                          disabled={isCrudLoading}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#f1f5f9',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          এডিট
                        </button>
                        <button
                          onClick={() => setDeleteConfirmItem(item)}
                          disabled={isCrudLoading}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#f87171',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          ডিলিট
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div
          style={{
            marginTop: '2.5rem',
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

          {/* Right: Go to /db-check */}
          <Link
            href="/db-check"
            target="_blank"
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
            <span>/db-check পেজ দেখুন</span>
          </Link>
        </div>
      </div>

      {/* Full-Width Bottom Confirmation Popup Bar */}
      {deleteConfirmItem && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)',
            padding: '16px 24px',
          }}
        >
          <div
            style={{
              maxWidth: '960px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* Left: Confirmation text */}
            <div style={{ fontSize: '0.96rem', fontWeight: 600, color: '#f8fafc' }}>
              আপনি কি নিশ্চিত যে এই টেক্সটটি MongoDB থেকে ডিলিট করতে চান?
            </div>

            {/* Right: 2 Buttons (Delete first, Cancel second) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleExecuteDelete}
                disabled={isCrudLoading}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: isCrudLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isCrudLoading ? 'ডিলিট হচ্ছে...' : 'হ্যাঁ, ডিলিট করুন'}
              </button>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                disabled={isCrudLoading}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
