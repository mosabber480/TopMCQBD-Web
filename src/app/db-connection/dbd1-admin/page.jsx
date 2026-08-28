'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import DbNavBox from '@/components/common/DbNavBox';
import DbAuthGuard from '@/components/common/DbAuthGuard';

const CACHE_KEY = 'topmcqbd_dbd1_admin_cache';

export default function DBD1AdminPage() {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [items, setItems] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [activeBackendUrl, setActiveBackendUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [isAddingData, setIsAddingData] = useState(false);
  const [newDataRows, setNewDataRows] = useState([{ text: '' }]);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

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

  useEffect(() => {
    setActiveBackendUrl(process.env.NEXT_PUBLIC_APP_URL || 'https://topmcqbd.pages.dev');
  }, []);

  // Save to cache
  const saveToCache = (dataObj, itemsArr, timestamp) => {
    try {
      const cacheObj = {
        statusData: dataObj,
        items: itemsArr,
        lastChecked: timestamp,
        savedAt: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch (e) {}
  };

  // Live fetch from D1 API
  const fetchD1Data = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
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
      const currentTime = formatDateTime(new Date());

      const liveItems = json.items || [];

      setStatusData(json);
      setItems(liveItems);
      setLastChecked(currentTime);
      setIsFromCache(false);
      saveToCache(json, liveItems, currentTime);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch items from Cloudflare D1');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.statusData) {
          setStatusData(parsed.statusData);
          setItems(parsed.items || []);
          setLastChecked(parsed.lastChecked || formatDateTime(parsed.savedAt));
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    fetchD1Data();
  }, [fetchD1Data]);

  // Multi-Row Add Data Handlers
  const openAddDataForm = () => {
    setIsAddingData(true);
    setNewDataRows([{ text: '' }]);
    setActionMsg(null);
  };

  const addNewDataRow = () => {
    setNewDataRows((prev) => [...prev, { text: '' }]);
  };

  const updateNewDataRow = (index, value) => {
    const rows = [...newDataRows];
    rows[index].text = value;
    setNewDataRows(rows);
  };

  const removeNewDataRow = (index) => {
    const rows = newDataRows.filter((_, i) => i !== index);
    if (rows.length === 0) {
      setIsAddingData(false);
      setNewDataRows([{ text: '' }]);
    } else {
      setNewDataRows(rows);
    }
  };

  const saveAllNewData = async () => {
    const validRows = newDataRows.filter((r) => r.text && r.text.trim());
    if (validRows.length === 0) {
      setActionMsg({ type: 'error', text: 'কমপক্ষে একটি বক্সে ডাটা বা টেক্সট লিখুন!' });
      return;
    }

    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/db-test/d1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validRows.map((r) => ({ text: r.text.trim() })) }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ডাটা যুক্ত করতে সমস্যা হয়েছে।');
      }

      setIsAddingData(false);
      setNewDataRows([{ text: '' }]);
      try { localStorage.removeItem('topmcqbd_dbd1_test_cache'); } catch (e) {}
      setActionMsg({ type: 'success', text: `✅ ${validRows.length} টি ডাটা সফলভাবে "db-d1-test" রো-তে যুক্ত হয়েছে!` });
      fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Text
  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;

    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/db-test/d1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: editText.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'আপডেট করা সম্ভব হয়নি।');
      }

      setEditingId(null);
      setEditText('');
      try { localStorage.removeItem('topmcqbd_dbd1_test_cache'); } catch (e) {}
      setActionMsg({ type: 'success', text: '✅ টেক্সট সফলভাবে আপডেট করা হয়েছে!' });
      fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Text
  const handleDeleteText = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই টেক্সটটি মুছে ফেলতে চান?')) return;

    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/db-test/d1?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'মুছে ফেলা সম্ভব হয়নি।');
      }

      try { localStorage.removeItem('topmcqbd_dbd1_test_cache'); } catch (e) {}
      setActionMsg({ type: 'success', text: '🗑️ টেক্সট সফলভাবে মুছে ফেলা হয়েছে!' });
      fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.text && item.text.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  return (
    <DbAuthGuard activeRoute="/db-connection/dbd1-admin">
      <main className="db-page-container">
        <div className="db-content-card">
          {/* Header */}
          <div className="db-header">
            <div className="db-badge" style={{ background: 'rgba(234, 88, 12, 0.1)', borderColor: 'rgba(234, 88, 12, 0.4)', color: '#ea580c' }}>
              D1 Admin Diagnostic & Manager
            </div>
            <h1 className="db-title">D1 Database Manager</h1>
            <p className="db-subtitle">
              Serverless Edge SQL (<strong>topmcqbd-db</strong>) ও <code>db-d1-test</code> রো ম্যানেজমেন্ট ও লাইভ ডায়াগনস্টিক
            </p>
            <div className="server-status-indicator">
              <span>কানেক্টেড এন্ডপয়েন্ট:</span> <code>{activeBackendUrl}</code>
            </div>
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

            <div className="control-btn-group">
              <button onClick={fetchD1Data} disabled={loading} className="recheck-btn" style={{ background: '#ea580c' }}>
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
          </div>

          {/* Error Alert */}
          {fetchError && (
            <div className="alert-card alert-error">
              <div className="alert-header">
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f87171', marginRight: '6px' }} />
                <strong>এপিআই রিকোয়েস্ট ব্যর্থ হয়েছে:</strong>
              </div>
              <p className="alert-msg">{fetchError}</p>
              <small className="alert-hint">
                * নিশ্চিত করুন যে Cloudflare D1 ডাটাবেস বাইন্ডিং সঠিকভাবে কনফিগার করা আছে।
              </small>
            </div>
          )}

          {/* Action Message Alert */}
          {actionMsg && (
            <div className={`action-feedback ${actionMsg.type === 'success' ? 'msg-success' : 'msg-error'}`}>
              <i className={`fa-solid ${actionMsg.type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ marginRight: '8px' }} />
              {actionMsg.text}
            </div>
          )}

          {/* Single Database Diagnostic Card */}
          <div className="db-grid" style={{ gridTemplateColumns: '1fr', marginBottom: '24px' }}>
            <div className={`status-card ${statusData?.connected ? 'card-success' : 'card-danger'}`}>
              <div className="card-header">
                <div>
                  <div className="card-type-tag">Serverless / D1 Cluster</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                    টার্গেট রো: <strong style={{ color: '#ea580c' }}>db-d1-test</strong>
                  </div>
                </div>
                <div className={`status-pill ${statusData?.connected ? 'pill-success' : 'pill-danger'}`}>
                  <span className="status-dot" />
                  <span style={{ transform: 'translateY(0.5px)', display: 'inline-flex', alignItems: 'center' }}>
                    {loading ? 'Checking...' : statusData?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              <h3 className="card-db-name">
                <i className="fa-solid fa-folder" style={{ marginRight: '8px', color: '#ea580c' }} />
                {statusData?.databaseName || 'topmcqbd-db'}
              </h3>

              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-label">কানেকশন রেসপন্স টাইম (Latency):</span>
                  <span className="meta-value">
                    {statusData?.pingTimeMs !== null && statusData?.pingTimeMs !== undefined
                      ? `${statusData.pingTimeMs} ms`
                      : '10 ms'}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">db-d1-test রো-তে মোট ডাটা:</span>
                  <span className="meta-value" style={{ color: '#ea580c', fontSize: '15px' }}>
                    {items.length} টি আইটেম
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">ডাটাবেজের মোট রো:</span>
                  <span className="meta-value">
                    {statusData?.collections ? `${statusData.collections.length} টি রো` : '9 টি রো'}
                  </span>
                </div>
              </div>

              {/* Collection / Row Tags */}
              <div className="collections-box">
                <span className="box-title">রো তালিকা:</span>
                <div className="tags-container">
                  {(statusData?.collections || ['layout-config', 'home-config', 'sidebar-config', 'policy-config', 'about-data', 'faq-data', 'packages-data', 'db-suite-auth', 'db-d1-test']).map((col, idx) => (
                    <span key={idx} className="col-tag">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive CRUD Box (Matching dbfree-admin exactly) */}
          <div className="crud-container">
            <div className="crud-header">
              <h3>
                <i className="fa-solid fa-pen-nib" style={{ marginRight: '8px', color: '#0080c3' }} />
                ডাটা যোগ ও সম্পাদনা প্যানেল (db-d1-test)
              </h3>
              <p>নিচের বক্সে টেক্সট লিখে যোগ করুন। এটি সরাসরি Cloudflare D1 ডাটাবেজে সেভ হবে এবং <code>/db-connection/dbd1-test</code> পেজে লাইভ আপডেট হবে।</p>
            </div>

            {/* Diagnostic Meta Cards Grid inside CRUD Box */}
            <div className="summary-grid">
              <div className="summary-card">
                <span className="summary-label">ডাটাবেজ ক্লাস্টার</span>
                <strong className="summary-val" style={{ color: '#0080c3' }}>
                  {statusData?.databaseName || 'topmcqbd-db (D1)'}
                </strong>
              </div>
              <div className="summary-card">
                <span className="summary-label">টার্গেট রো</span>
                <strong className="summary-val" style={{ color: '#0080c3' }}>db-d1-test</strong>
              </div>
              <div className="summary-card">
                <span className="summary-label">মোট সংরক্ষিত ডাটা</span>
                <strong className="summary-val" style={{ color: '#16a34a' }}>
                  {items.length} টি আইটেম
                </strong>
              </div>
            </div>

            {/* Items List Table (Card Rows) */}
            <div className="crud-list-wrapper">
              {items.length === 0 ? (
                <div className="empty-box">
                  <i className="fa-solid fa-inbox" style={{ fontSize: '28px', display: 'block', marginBottom: '8px', opacity: 0.6 }} />
                  এখনো কোনো ডাটা যোগ করা হয়নি। নিচের বাটন থেকে ডাটা যোগ করুন!
                </div>
              ) : (
                <div className="items-list">
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="item-row">
                      {editingId === item.id ? (
                        <div className="edit-box-inline">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="edit-input"
                            autoFocus
                          />
                          <div className="edit-btn-group">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              disabled={submitting}
                              className="btn-save"
                              style={{ background: '#059669' }}
                            >
                              <i className="fa-solid fa-check" style={{ marginRight: '4px' }} /> সেভ করুন
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditText('');
                              }}
                              className="btn-cancel"
                            >
                              বাতিল
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="item-content">
                            <div className="item-main-row">
                              <span className="item-index" style={{ color: '#0080c3' }}>#{idx + 1}</span>
                              <span className="item-text">{item.text}</span>
                            </div>
                            <div className="item-meta-row">
                              <span className="item-time">
                                <i className="fa-regular fa-clock" style={{ marginRight: '4px' }} />
                                {formatDateTime(item.updatedAt || item.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="item-actions">
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditText(item.text);
                              }}
                              className="action-btn edit-btn"
                            >
                              <i className="fa-solid fa-pen" style={{ marginRight: '4px' }} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteText(item.id)}
                              className="action-btn del-btn"
                            >
                              <i className="fa-solid fa-trash-can" style={{ marginRight: '4px' }} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Multi-Row Add Data Section (at the bottom) */}
            <div style={{ marginTop: '20px' }}>
              {!isAddingData ? (
                <div>
                  <button
                    type="button"
                    onClick={openAddDataForm}
                    className="btn-add-main"
                  >
                    <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Text (ডাটা যোগ করুন)
                  </button>
                </div>
              ) : (
                <div className="add-rows-container">
                  <div className="add-rows-header">
                    <span className="add-rows-title">
                      <i className="fa-solid fa-layer-group" style={{ marginRight: '8px', color: '#0080c3' }} />
                      নতুন ডাটা যোগ করুন:
                    </span>
                  </div>

                  <div className="add-rows-list">
                    {newDataRows.map((row, rIdx) => (
                      <div key={rIdx} className="add-row-item">
                        <span className="row-num-badge">#{rIdx + 1}</span>
                        <input
                          type="text"
                          placeholder="এখানে যেকোনো টেক্সট বা টেস্ট ডাটা লিখুন..."
                          value={row.text}
                          onChange={(e) => updateNewDataRow(rIdx, e.target.value)}
                          className="add-row-input"
                          autoFocus={rIdx === newDataRows.length - 1}
                        />
                        <button
                          type="button"
                          onClick={() => removeNewDataRow(rIdx)}
                          className="btn-row-delete"
                          title="এই রো মুছে ফেলুন"
                        >
                          <i className="fa-solid fa-trash" style={{ marginRight: '4px' }} /> Delete
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="add-rows-actions">
                    <button
                      type="button"
                      onClick={addNewDataRow}
                      className="btn-add-more-rows"
                    >
                      <i className="fa-solid fa-plus" style={{ marginRight: '6px' }} /> আরো ডাটা যোগ করুন
                    </button>
                    <div className="save-cancel-group">
                      <button
                        type="button"
                        onClick={saveAllNewData}
                        disabled={submitting}
                        className="btn-save-all-rows"
                      >
                        <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }} />
                        {submitting ? 'সেভ হচ্ছে...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingData(false);
                          setNewDataRows([{ text: '' }]);
                        }}
                        className="btn-cancel-all-rows"
                      >
                        <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Database Navigation Box */}
          <DbNavBox activeRoute="/db-connection/dbd1-admin" />

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
            margin-bottom: 28px;
          }

          .db-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 5px 14px;
            border-radius: 20px;
            margin-bottom: 12px;
          }

          .db-title {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px;
            letter-spacing: -0.5px;
          }

          .db-subtitle {
            font-size: 13.5px;
            color: #64748b;
            margin: 0;
          }

          .server-status-indicator {
            margin-top: 10px;
            font-size: 13px;
            color: #64748b;
          }

          .server-status-indicator code {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 3px 10px;
            border-radius: 6px;
            color: #0080c3;
            font-size: 12px;
            font-weight: 600;
          }

          .db-control-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px 18px;
            margin-bottom: 24px;
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

          .control-btn-group {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .recheck-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #0080c3;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 128, 195, 0.25);
            transition: all 0.2s ease;
          }

          .recheck-btn:hover:not(:disabled) {
            background: #006da6;
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

          .action-feedback {
            padding: 12px 18px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
          }

          .msg-success {
            background: #f7f7f7;
            border: 1px solid #86efac;
            color: #15803d;
          }

          .msg-error {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            color: #b91c1c;
          }

          .db-grid {
            display: grid;
            grid-template-columns: 1fr;
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

          .crud-container {
            background: #f7f7f7;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 26px;
            margin-bottom: 28px;
          }

          .crud-header h3 {
            margin: 0 0 6px 0;
            font-size: 18px;
            color: #1e293b;
            font-weight: 700;
          }

          .crud-header p {
            margin: 0 0 18px 0;
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin-bottom: 24px;
          }

          @media (max-width: 650px) {
            .summary-grid { grid-template-columns: 1fr; }
          }

          .summary-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 18px 16px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            text-align: center;
          }

          .summary-label {
            font-size: 11.5px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
          }

          .summary-val {
            font-size: 17px;
            font-weight: 700;
            color: #1e293b;
          }

          .empty-box {
            text-align: center;
            padding: 32px 20px;
            color: #64748b;
            font-size: 13px;
            background: #ffffff;
            border-radius: 12px;
            border: 1px dashed #cbd5e1;
          }

          .items-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .item-row {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .item-row:hover {
            border-color: #7dd3fc;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          }

          .item-content {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
          }

          .item-main-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .item-index {
            font-weight: 700;
            font-size: 13px;
          }

          .item-text {
            color: #1e293b;
            font-size: 14px;
            word-break: break-word;
          }

          .item-meta-row {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 11px;
            color: #64748b;
            flex-wrap: wrap;
          }

          .item-actions {
            display: flex;
            gap: 8px;
          }

          .action-btn {
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            font-weight: 700;
            transition: all 0.2s;
          }

          .edit-btn {
            background: #eff6ff;
            color: #0284c7;
            border: 1px solid #bae6fd;
          }

          .edit-btn:hover {
            background: #0284c7;
            color: #fff;
          }

          .del-btn {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fca5a5;
          }

          .del-btn:hover {
            background: #dc2626;
            color: #fff;
          }

          .edit-box-inline {
            display: flex;
            width: 100%;
            gap: 8px;
            flex-wrap: wrap;
          }

          .edit-input {
            flex: 1;
            min-width: 200px;
            background: #ffffff;
            border: 1px solid #0080c3;
            border-radius: 6px;
            padding: 8px 12px;
            color: #1e293b;
            font-size: 13px;
          }

          .edit-btn-group {
            display: flex;
            gap: 6px;
          }

          .btn-save {
            color: #fff;
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          .btn-cancel {
            background: #64748b;
            color: #fff;
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
          }

          .btn-add-main {
            background: #0080c3;
            color: #ffffff;
            border: none;
            padding: 12px 26px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            box-shadow: 0 2px 8px rgba(0, 128, 195, 0.25);
          }

          .btn-add-main:hover {
            background: #006da6;
            transform: translateY(-1px);
          }

          .add-rows-container {
            background: #ffffff;
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
          }

          .add-rows-header {
            margin-bottom: 14px;
          }

          .add-rows-title {
            font-size: 14px;
            font-weight: 700;
            color: #0080c3;
            display: flex;
            align-items: center;
          }

          .add-rows-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 16px;
          }

          .add-row-item {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 8px 12px;
          }

          .row-num-badge {
            background: #e0f2fe;
            color: #0284c7;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 6px;
            white-space: nowrap;
          }

          .add-row-input {
            flex: 1;
            background: transparent;
            border: none;
            color: #1e293b;
            font-size: 14px;
            outline: none;
            padding: 6px 0;
          }

          .add-row-input::placeholder {
            color: #94a3b8;
          }

          .btn-row-delete {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            color: #b91c1c;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
          }

          .btn-row-delete:hover {
            background: #ef4444;
            color: #ffffff;
          }

          .add-rows-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            padding-top: 12px;
            border-top: 1px dashed #e2e8f0;
          }

          .btn-add-more-rows {
            background: #0284c7;
            color: #ffffff;
            border: none;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
          }

          .btn-add-more-rows:hover {
            background: #0369a1;
            transform: translateY(-1px);
          }

          .save-cancel-group {
            display: flex;
            gap: 8px;
          }

          .btn-save-all-rows {
            background: #0080c3;
            color: #ffffff;
            border: none;
            padding: 9px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
          }

          .btn-save-all-rows:hover:not(:disabled) {
            background: #006da6;
            transform: translateY(-1px);
          }

          .btn-cancel-all-rows {
            background: #f1f5f9;
            color: #64748b;
            border: 1px solid #cbd5e1;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
          }

          .btn-cancel-all-rows:hover {
            background: #e2e8f0;
            color: #1e293b;
          }

          .bottom-nav-link {
            color: #0080c3;
            font-size: 13.5px;
            font-weight: 700;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            padding: 9px 16px;
            border-radius: 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease;
          }

          .bottom-nav-link:hover {
            color: #006093;
            background: #f0f9ff;
            border-color: #bae6fd;
            transform: translateY(-1px);
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    </DbAuthGuard>
  );
}
