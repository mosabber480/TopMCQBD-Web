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

      setStatusData(json);
      setItems(json.items || []);
      setLastChecked(currentTime);
      setIsFromCache(false);
      saveToCache(json, json.items || [], currentTime);
    } catch (err) {
      setFetchError(
        `${err.message || 'Failed to connect'}. (Cloudflare D1-এ টেবিল বা বাইন্ডিং কনফিগারেশন চেক করুন।)`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
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
      for (const row of validRows) {
        const res = await fetch('/api/db-test/d1', {
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
      try { localStorage.removeItem('topmcqbd_dbd1_test_cache'); } catch (e) {}
      setActionMsg({ type: 'success', text: `✅ ${validRows.length} টি ডাটা সফলভাবে "db-d1-test" কালেকশনে যুক্ত হয়েছে!` });
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
      const res = await fetch(`/api/db-test/d1?id=${id}`, {
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
    <DbAuthGuard activeRoute="/dbd1-admin">
      <main className="db-page-container">
        {/* Background Ambient Orbs */}
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />

        <div className="db-content-card">
          {/* Header */}
          <div className="db-header">
            <div className="db-badge" style={{ borderColor: 'rgba(234, 88, 12, 0.4)', color: '#fb923c', background: 'rgba(234, 88, 12, 0.1)' }}>
              D1 Admin Diagnostic & Manager
            </div>
            <h1 className="db-title">Cloudflare D1 Database Manager</h1>
            <p className="db-subtitle">
              Serverless Edge SQL (<strong>topmcqbd-db</strong>) ও <code>db-d1-test</code> কালেকশন ম্যানেজমেন্ট ও লাইভ ডায়াগনস্টিক
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
                    <span className="live-indicator-badge" style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                      ⚡ সদ্য যাচাইকৃত লাইভ ফলাফল
                    </span>
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
                * নিশ্চিত করুন যে Cloudflare Pages ফাংশন সক্রিয় আছে এবং D1 binding <code>DB</code> কনফিগার করা আছে।
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
                  <div className="card-type-tag" style={{ color: '#fb923c' }}>Serverless Edge SQL / D1</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                    টার্গেট কালেকশন: <strong style={{ color: '#fb923c' }}>db-d1-test</strong>
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
                <i className="fa-solid fa-bolt" style={{ marginRight: '8px', color: '#fb923c' }} />
                {statusData?.databaseName || statusData?.database || 'topmcqbd-db'}
              </h3>

              <div className="meta-list">
                <div className="meta-row">
                  <span className="meta-label">কানেকশন রেসপন্স টাইম (Latency):</span>
                  <span className="meta-value">
                    {statusData?.pingTimeMs !== null && statusData?.pingTimeMs !== undefined
                      ? `${statusData.pingTimeMs} ms`
                      : 'N/A'}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">db-d1-test কালেকশনে মোট ডাটা:</span>
                  <span className="meta-value" style={{ color: '#fb923c', fontSize: '15px' }}>
                    {items.length} টি আইটেম
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">ডাটাবেজের স্কোপ:</span>
                  <span className="meta-value">
                    Serverless SQLite on Cloudflare Global Edge
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive CRUD Box */}
          <div className="crud-container">
            <div className="crud-header">
              <h3>
                <i className="fa-solid fa-pen-nib" style={{ marginRight: '8px', color: '#fb923c' }} />
                ডাটা যোগ ও সম্পাদনা প্যানেল (db-d1-test)
              </h3>
              <p>নিচের বক্সে টেক্সট লিখে যোগ করুন। এটি সরাসরি Cloudflare D1 ডাটাবেজে সেভ হবে এবং <code>/dbd1-test</code> পেজে লাইভ আপডেট হবে।</p>
            </div>

            {/* Diagnostic Meta Cards Grid inside CRUD Box */}
            <div className="summary-grid">
              <div className="summary-card">
                <span className="summary-label">ডাটাবেজ ইঞ্জিন</span>
                <strong className="summary-val" style={{ color: '#fb923c' }}>
                  {statusData?.databaseName || 'topmcqbd-db'}
                </strong>
              </div>
              <div className="summary-card">
                <span className="summary-label">টার্গেট কালেকশন</span>
                <strong className="summary-val" style={{ color: '#fdba74' }}>db-d1-test</strong>
              </div>
              <div className="summary-card">
                <span className="summary-label">মোট সংরক্ষিত ডাটা</span>
                <strong className="summary-val" style={{ color: '#4ade80' }}>
                  {items.length} টি আইটেম
                </strong>
              </div>
            </div>

            {/* Open / Close Add Button */}
            {!isAddingData ? (
              <div className="add-btn-wrapper" style={{ marginTop: '16px' }}>
                <button onClick={openAddDataForm} className="add-open-btn" style={{ background: '#ea580c' }}>
                  <i className="fa-solid fa-plus" style={{ marginRight: '6px' }} />
                  + নতুন ডাটা যুক্ত করুন (db-d1-test)
                </button>
              </div>
            ) : (
              <div className="multi-row-form-box" style={{ marginTop: '16px' }}>
                <div className="form-box-title">
                  <span>নতুন ডাটা এন্ট্রি (মাল্টিপল রো যোগ করুন)</span>
                  <span className="row-counter-tag">{newDataRows.length} টি রো প্রস্তুত</span>
                </div>

                <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="add-rows-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>টেক্সট / ডাটা কন্টেন্ট</th>
                        <th style={{ width: '60px' }}>মুছুন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newDataRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="row-num-cell">{idx + 1}</td>
                          <td>
                            <input
                              type="text"
                              value={row.text}
                              onChange={(e) => updateNewDataRow(idx, e.target.value)}
                              placeholder={`রো #${idx + 1} এর জন্য যেকোনো টেক্সট বা ডাটা লিখুন...`}
                              className="table-input"
                              autoFocus={idx === newDataRows.length - 1}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addNewDataRow();
                                }
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeNewDataRow(idx)}
                              className="remove-row-btn"
                              title="এই রো মুছে ফেলুন"
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="multi-form-actions">
                  <button type="button" onClick={addNewDataRow} className="add-more-row-btn">
                    <i className="fa-solid fa-circle-plus" style={{ marginRight: '6px' }} />
                    + আরও ১টি রো যোগ করুন
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddingData(false)}
                      className="cancel-form-btn"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      onClick={saveAllNewData}
                      disabled={submitting}
                      className="save-all-btn"
                      style={{ background: '#ea580c' }}
                    >
                      {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সবগুলো সংরক্ষণ করুন'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data List & Search Section */}
          <div className="data-table-container">
            <div className="table-top-bar">
              <div className="search-box-wrapper">
                <i className="fa-solid fa-magnifying-glass search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সার্চ করুন (ID বা টেক্সট)..."
                  className="search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
              <div className="items-count-badge">
                মোট ফলাফল: <strong>{filteredItems.length}</strong> / {items.length} টি
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-folder-open" style={{ fontSize: '32px', color: '#64748b', marginBottom: '12px' }} />
                <p>{searchQuery ? 'সার্চের সাথে মিল রেখে কোনো ডাটা পাওয়া যায়নি।' : '"db-d1-test" কালেকশনে কোনো ডাটা নেই। উপরে "+ নতুন ডাটা যুক্ত করুন" বাটনে ক্লিক করে ডাটা যোগ করুন।'}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th style={{ width: '220px' }}>Data ID</th>
                      <th>Text / Data Content</th>
                      <th style={{ width: '170px' }}>Created Date & Time</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="row-idx">{idx + 1}</td>
                        <td>
                          <div className="id-cell">
                            <code>{item.id}</code>
                            <button
                              onClick={() => copyToClipboard(item.id, item.id)}
                              className="copy-mini-btn"
                              title="Copy ID"
                            >
                              <i className={`fa-solid ${copiedId === item.id ? 'fa-check' : 'fa-copy'}`} />
                            </button>
                          </div>
                        </td>
                        <td>
                          {editingId === item.id ? (
                            <div className="inline-edit-box">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="inline-edit-input"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(item.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                              />
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                disabled={submitting}
                                className="inline-save-btn"
                                style={{ background: '#ea580c' }}
                              >
                                {submitting ? '...' : 'সেভ'}
                              </button>
                              <button onClick={() => setEditingId(null)} className="inline-cancel-btn">
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <span className="text-display">{item.text}</span>
                          )}
                        </td>
                        <td className="date-cell">
                          {formatDateTime(item.createdAt || item.updatedAt)}
                        </td>
                        <td>
                          <div className="action-btns-group">
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditText(item.text || '');
                              }}
                              className="action-edit-btn"
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen" />
                            </button>
                            <button
                              onClick={() => handleDeleteText(item.id)}
                              className="action-delete-btn"
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash-can" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 7-Button Database Navigation Box */}
          <DbNavBox activeRoute="/dbd1-admin" />

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
              ওয়েবসাইট ভিজিট
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
            background-color: #0b0f19;
            color: #f8fafc;
            padding: 40px 20px 80px;
            position: relative;
            overflow-x: hidden;
            font-family: inherit;
            display: flex;
            justify-content: center;
          }

          .glow-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            z-index: 0;
            pointer-events: none;
          }

          .orb-1 {
            width: 400px;
            height: 400px;
            background: rgba(234, 88, 12, 0.12);
            top: -50px;
            left: -50px;
          }

          .orb-2 {
            width: 350px;
            height: 350px;
            background: rgba(249, 115, 22, 0.08);
            bottom: 50px;
            right: -50px;
          }

          .db-content-card {
            width: 100%;
            max-width: 1050px;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 36px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            position: relative;
            z-index: 1;
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
            color: #ffffff;
            margin: 0 0 8px;
            letter-spacing: -0.5px;
          }

          .db-subtitle {
            font-size: 13.5px;
            color: #94a3b8;
            margin: 0;
          }

          .server-status-indicator {
            margin-top: 10px;
            font-size: 12px;
            color: #64748b;
          }

          .server-status-indicator code {
            color: #fdba74;
            background: rgba(234, 88, 12, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
          }

          .db-control-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.07);
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
            color: #cbd5e1;
            flex-wrap: wrap;
          }

          .cache-indicator-badge {
            background: rgba(234, 179, 8, 0.15);
            color: #facc15;
            border: 1px solid rgba(234, 179, 8, 0.3);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
          }

          .live-indicator-badge {
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
          }

          .recheck-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
            transition: all 0.2s ease;
          }

          .recheck-btn:hover:not(:disabled) {
            filter: brightness(1.1);
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
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
          }

          .alert-header {
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #f87171;
            margin-bottom: 6px;
          }

          .alert-msg {
            color: #fca5a5;
            font-size: 13px;
            margin: 0 0 6px;
          }

          .alert-hint {
            color: #94a3b8;
            font-size: 11.5px;
          }

          .action-feedback {
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 13.5px;
            font-weight: 600;
          }

          .msg-success {
            background: rgba(34, 197, 94, 0.12);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #4ade80;
          }

          .msg-error {
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
          }

          .status-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 22px;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 14px;
          }

          .card-type-tag {
            font-size: 11.5px;
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
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.3);
          }

          .pill-danger {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
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
            color: #ffffff;
            margin: 0 0 16px;
          }

          .meta-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 6px;
          }

          .meta-label {
            color: #94a3b8;
          }

          .meta-value {
            color: #e2e8f0;
            font-weight: 600;
          }

          .crud-container {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 22px;
            margin-bottom: 24px;
          }

          .crud-header h3 {
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 6px;
          }

          .crud-header p {
            font-size: 12.5px;
            color: #94a3b8;
            margin: 0 0 16px;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }

          .summary-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .summary-label {
            font-size: 11px;
            color: #94a3b8;
          }

          .summary-val {
            font-size: 13.5px;
          }

          .add-open-btn {
            width: 100%;
            color: #ffffff;
            border: none;
            padding: 11px;
            border-radius: 9px;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .add-open-btn:hover {
            filter: brightness(1.1);
          }

          .multi-row-form-box {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(234, 88, 12, 0.3);
            border-radius: 12px;
            padding: 16px;
          }

          .form-box-title {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 700;
            color: #fdba74;
            margin-bottom: 12px;
          }

          .row-counter-tag {
            font-size: 11px;
            background: rgba(234, 88, 12, 0.2);
            color: #fdba74;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .add-rows-table {
            width: 100%;
            border-collapse: collapse;
          }

          .add-rows-table th {
            text-align: left;
            font-size: 11.5px;
            color: #94a3b8;
            padding: 6px 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .add-rows-table td {
            padding: 6px 8px;
          }

          .row-num-cell {
            color: #64748b;
            font-size: 12px;
            font-weight: 700;
          }

          .table-input {
            width: 100%;
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 7px;
            font-size: 13px;
            outline: none;
          }

          .table-input:focus {
            border-color: #ea580c;
          }

          .remove-row-btn {
            background: transparent;
            border: none;
            color: #f87171;
            cursor: pointer;
            padding: 6px;
            font-size: 12px;
          }

          .multi-form-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 14px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .add-more-row-btn {
            background: rgba(255, 255, 255, 0.08);
            color: #e2e8f0;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 7px 12px;
            border-radius: 7px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }

          .cancel-form-btn {
            background: rgba(255, 255, 255, 0.06);
            color: #cbd5e1;
            border: none;
            padding: 7px 14px;
            border-radius: 7px;
            font-size: 12.5px;
            cursor: pointer;
          }

          .save-all-btn {
            color: #ffffff;
            border: none;
            padding: 7px 16px;
            border-radius: 7px;
            font-size: 12.5px;
            font-weight: 700;
            cursor: pointer;
          }

          .data-table-container {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 20px;
          }

          .table-top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .search-box-wrapper {
            position: relative;
            width: 280px;
          }

          .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            font-size: 12px;
          }

          .search-input {
            width: 100%;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 7px 12px 7px 32px;
            border-radius: 7px;
            font-size: 12.5px;
            outline: none;
          }

          .search-input:focus {
            border-color: #ea580c;
          }

          .clear-search-btn {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
          }

          .items-count-badge {
            font-size: 12.5px;
            color: #94a3b8;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
            font-size: 13.5px;
          }

          .custom-data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          .custom-data-table th {
            text-align: left;
            background: rgba(15, 23, 42, 0.6);
            color: #94a3b8;
            padding: 10px 12px;
            font-size: 11.5px;
            font-weight: 700;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .custom-data-table td {
            padding: 11px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #e2e8f0;
          }

          .id-cell {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(15, 23, 42, 0.7);
            padding: 3px 6px;
            border-radius: 5px;
            font-size: 11.5px;
            color: #fdba74;
            font-family: monospace;
          }

          .copy-mini-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 0;
            font-size: 10.5px;
          }

          .inline-edit-box {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .inline-edit-input {
            flex: 1;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid #ea580c;
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 12.5px;
          }

          .inline-save-btn {
            color: #ffffff;
            border: none;
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 11.5px;
            cursor: pointer;
          }

          .inline-cancel-btn {
            background: rgba(255, 255, 255, 0.1);
            color: #cbd5e1;
            border: none;
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 11.5px;
            cursor: pointer;
          }

          .action-btns-group {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }

          .action-edit-btn {
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #60a5fa;
            padding: 5px 8px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11.5px;
          }

          .action-delete-btn {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
            padding: 5px 8px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 11.5px;
          }

          .date-cell {
            font-size: 12px;
            color: #94a3b8;
          }

          .bottom-nav-link {
            font-size: 13px;
            color: #94a3b8;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            transition: color 0.2s;
          }

          .bottom-nav-link:hover {
            color: #ffffff;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .db-content-card {
              padding: 20px;
            }
            .summary-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
    </DbAuthGuard>
  );
}
