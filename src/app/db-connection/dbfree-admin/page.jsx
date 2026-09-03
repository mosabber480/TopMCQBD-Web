'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import DbNavBox from '@/components/common/DbNavBox';
import DbAuthGuard from '@/components/common/DbAuthGuard';
import { showTopAlert } from '@/components/layout/TopAlert';

const CACHE_KEY = 'topmcqbd_dbfree_admin_cache';

export default function DBFreeAdminPage() {
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

  const getApiUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '';
      }
    }
    return process.env.NEXT_PUBLIC_FREE_API_URL || 'https://topmcqbd-free-api.onrender.com';
  }, []);

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
    setActiveBackendUrl(getApiUrl() || 'Local Server (http://localhost:3000)');
  }, [getApiUrl]);

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
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // Live fetch from Free API
  const fetchFreeData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const baseUrl = getApiUrl();
      const endpoint = `${baseUrl}/api/db-test/free`;
      const res = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const currentTime = formatDateTime(new Date());

      setStatusData(json);
      setItems(json.items || []);
      setLastChecked(currentTime);
      setIsFromCache(false);
      saveToCache(json, json.items || [], currentTime);
    } catch (err) {
      setFetchError(
        `${err.message || 'Failed to connect'}. (Render-এ কোড পুশ ও ডেপ্লয় না থাকলে 404 বা Failed to fetch দেখাতে পারে।)`
      );
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  // Initial load: check localStorage first
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && cached.statusData) {
          setStatusData(cached.statusData);
          setItems(cached.items || []);
          setLastChecked(cached.lastChecked || formatDateTime(cached.savedAt));
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    fetchFreeData();
  }, [fetchFreeData]);

  // Multi-Row Add Data Handlers
  const openAddDataForm = () => {
    setIsAddingData(true);
    setNewDataRows([{ text: '' }]);
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
      showTopAlert('কমপক্ষে একটি বক্সে ডাটা বা টেক্সট লিখুন!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = getApiUrl();
      for (const row of validRows) {
        const res = await fetch(`${baseUrl}/api/db-test/free`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: row.text.trim() }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'ডাটা যুক্ত করতে সমস্যা হয়েছে।');
        }
      }

      setIsAddingData(false);
      setNewDataRows([{ text: '' }]);
      try { localStorage.removeItem('topmcqbd_dbfree_test_cache'); } catch (e) {}
      showTopAlert(`✅ ${validRows.length} টি ডাটা সফলভাবে "db-free-test" কালেকশনে সংরক্ষিত হয়েছে!`, 'success');
      fetchFreeData();
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Text
  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;

    setSubmitting(true);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/db-test/free`, {
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
      try { localStorage.removeItem('topmcqbd_dbfree_test_cache'); } catch (e) {}
      showTopAlert('✅ টেক্সট সফলভাবে আপডেট করা হয়েছে!', 'success');
      fetchFreeData();
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Text
  const handleDeleteText = async (id) => {
    const confirmed = await showTopAlert('আপনি কি নিশ্চিত এই টেক্সটটি মুছে ফেলতে চান?', 'warning', true);
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/db-test/free?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'মুছে ফেলা সম্ভব হয়নি।');
      }

      try { localStorage.removeItem('topmcqbd_dbfree_test_cache'); } catch (e) {}
      showTopAlert('🗑️ টেক্সট সফলভাবে মুছে ফেলা হয়েছে!', 'success');
      fetchFreeData();
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
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
    <DbAuthGuard activeRoute="/db-connection/dbfree-admin">
      <main className="db-page-container">
      {/* Background Ambient Orbs */}
      <div className="glow-orb orb-1" />
      <div className="glow-orb orb-2" />

      <div className="db-content-card">
        {/* Header */}
        <div className="db-header">
          <div className="db-badge">
            Free Admin Diagnostic & Manager
          </div>
          <h1 className="db-title">Free Database Manager</h1>
          <p className="db-subtitle">
            Secondary Cluster (<strong>TopMCQBD_DB_Free</strong>) ও <code>db-free-test</code> কালেকশন ম্যানেজমেন্ট ও লাইভ ডায়াগনস্টিক
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
            <button onClick={fetchFreeData} disabled={loading} className="recheck-btn">
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  চেক করা হচ্ছে...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrows-rotate" />
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
              * নিশ্চিত করুন যে সার্ভার সচল আছে এবং <code>.env</code> ফাইলে সঠিক <code>MONGODB_URI_FREE</code> দেওয়া আছে।
            </small>
          </div>
        )}

        {/* Single Database Diagnostic Card */}
        <div className="db-grid" style={{ gridTemplateColumns: '1fr', marginBottom: '24px' }}>
          <div className={`status-card ${statusData?.connected ? 'card-success' : 'card-danger'}`}>
            <div className="card-header">
              <div>
                <div className="card-type-tag">Secondary / Free Cluster</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                  টার্গেট কালেকশন: <strong>db-free-test</strong>
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
              📁 {statusData?.cluster || 'TopMCQBD_DB_Free'}
            </h3>

            <div className="meta-list">
              <div className="meta-row">
                <span className="meta-label">কানেকশন রেসপন্স টাইম (Latency):</span>
                <span className="meta-value">
                  {statusData?.latencyMs !== null && statusData?.latencyMs !== undefined
                    ? `${statusData.latencyMs} ms`
                    : 'N/A'}
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-label">db-free-test কালেকশনে মোট ডাটা:</span>
                <span className="meta-value" style={{ color: '#0284c7', fontSize: '15px' }}>
                  {items.length} টি আইটেম
                </span>
              </div>
              <div className="meta-row">
                <span className="meta-label">ডাটাবেজের মোট কালেকশনস:</span>
                <span className="meta-value">
                  {statusData?.collections ? `${statusData.collections.length} টি কালেকশন` : '0'}
                </span>
              </div>
            </div>

            {/* Collection Tags */}
            {statusData?.collections && statusData.collections.length > 0 && (
              <div className="collections-box">
                <span className="box-title">কালেকশন তালিকা:</span>
                <div className="tags-container">
                  {statusData.collections.map((col, idx) => (
                    <span key={idx} className="col-tag">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive CRUD Box */}
        <div className="crud-container">
          <div className="crud-header">
            <h3>
              <i className="fa-solid fa-pen-nib" style={{ marginRight: '8px', color: '#0080c3' }} />
              ডাটা যোগ ও সম্পাদনা প্যানেল (db-free-test)
            </h3>
            <p>নিচের বক্সে টেক্সট লিখে যোগ করুন। এটি সরাসরি Free MongoDB ক্লাস্টারে সেভ হবে এবং <code>/db-connection/dbfree-test</code> পেজে লাইভ আপডেট হবে।</p>
          </div>

          {/* Diagnostic Meta Cards Grid inside CRUD Box */}
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">ডাটাবেজ ক্লাস্টার</span>
              <strong className="summary-val" style={{ color: '#0080c3' }}>
                {statusData?.cluster || 'TopMCQBD_DB_Free'}
              </strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">টার্গেট কালেকশন</span>
              <strong className="summary-val" style={{ color: '#0080c3' }}>db-free-test</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">মোট সংরক্ষিত ডাটা</span>
              <strong className="summary-val" style={{ color: '#16a34a' }}>
                {items.length} টি আইটেম
              </strong>
            </div>
          </div>

          {/* Items List Table */}
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
                            <span className="item-index" style={{ color: '#34d399' }}>#{idx + 1}</span>
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
                    <i className="fa-solid fa-layer-group" style={{ marginRight: '8px', color: '#34d399' }} />
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

        {/* 5-Button Database Navigation Box */}
        <DbNavBox activeRoute="/db-connection/dbfree-admin" />

        {/* Bottom Navigation Links Bar */}
        <div className="bottom-nav-bar">
          <Link href="/" className="bottom-nav-link left-link">
            <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }} />
            ওয়েবসাইট ভিজিট
          </Link>
          <Link href="/admin/dashboard" className="bottom-nav-link right-link">
            অ্যাডমিন প্যানেল
            <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }} />
          </Link>
        </div>
      </div>

      <style jsx>{`
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
        .control-btn-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .view-test-link {
          background: #eff6ff;
          color: #0080c3;
          border: 1px solid #bae6fd;
          padding: 9px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s;
        }
        .view-test-link:hover {
          background: #e0f2fe;
        }
        .clear-cache-btn {
          background: #fefce8;
          color: #ca8a04;
          border: 1px solid #fde047;
          padding: 9px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-cache-btn:hover {
          background: #fef08a;
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
          background: #f7f7f7;
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
        .btn-add-main {
          background: #059669;
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
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
        }
        .btn-add-main:hover {
          background: #047857;
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
          background: #059669;
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
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
        }
        .btn-save-all-rows:hover:not(:disabled) {
          background: #047857;
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
        .admin-search-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .search-box-inner {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 6px 12px;
          gap: 8px;
          flex: 1;
          min-width: 200px;
        }
        .search-icon {
          font-size: 12px;
          color: #64748b;
        }
        .admin-search-input {
          background: transparent;
          border: none;
          color: #1e293b;
          font-size: 13px;
          width: 100%;
          outline: none;
        }
        .clear-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 11px;
        }
        .admin-count-text {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }
        .empty-box {
          text-align: center;
          padding: 32px 20px;
          color: #64748b;
          font-size: 13px;
          background: #f8fafc;
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
          border-color: #6ee7b7;
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
        .item-id-tag {
          font-family: monospace;
          color: #64748b;
        }
        .id-copy-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #64748b;
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .id-copy-btn:hover {
          color: #0080c3;
          border-color: #7dd3fc;
          background: #f0f9ff;
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
          border: 1px solid #008fb0;
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
          background: #008fb0;
          color: #fff;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-save:hover:not(:disabled) {
          background: #007a99;
        }
        .btn-cancel {
          background: #0f1629;
          color: #fff;
          border: 1px solid #0f1629;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-cancel:hover {
          background: #1e293b;
          border-color: #1e293b;
        }
        .bottom-nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding: 8px 4px 0 4px;
          flex-wrap: wrap;
          gap: 12px;
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
        .orb-1, .orb-2 {
          display: none !important;
        }
      `}</style>
    </main>
    </DbAuthGuard>
  );
}
