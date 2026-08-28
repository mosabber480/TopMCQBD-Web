'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import DbNavBox from '@/components/common/DbNavBox';
import DbAuthGuard from '@/components/common/DbAuthGuard';

const CACHE_KEY = 'topmcqbd_dbd1_admin_cache';

const defaultD1ConfigRows = [
  { id: 'layout-config', key: 'layout-config', text: 'Navbar, Mega Menus & Footers', title: 'Layout Config' },
  { id: 'home-config', key: 'home-config', text: 'Home Sliders & Hero Sections', title: 'Home Config' },
  { id: 'sidebar-config', key: 'sidebar-config', text: 'Admin Sidebar Navigation', title: 'Sidebar Config' },
  { id: 'policy-config', key: 'policy-config', text: 'Privacy & Refund Policy HTML', title: 'Policy Config' },
  { id: 'about-data', key: 'about-data', text: 'About Us Content', title: 'About Data' },
  { id: 'faq-data', key: 'faq-data', text: 'FAQ Questions & Answers', title: 'FAQ Data' },
  { id: 'packages-data', key: 'packages-data', text: 'Pricing & Subscription Packages', title: 'Packages Data' },
];

export default function DBD1AdminPage() {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [items, setItems] = useState(defaultD1ConfigRows);
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

      let liveItems = json.items || [];
      if (!liveItems || liveItems.length === 0) {
        liveItems = defaultD1ConfigRows;
      }

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
        if (parsed && (parsed.items || parsed.statusData)) {
          setStatusData(parsed.statusData);
          setItems(parsed.items || defaultD1ConfigRows);
          setLastChecked(parsed.lastChecked || formatDateTime(parsed.savedAt));
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    fetchD1Data();
  }, [fetchD1Data]);

  // Handle multi-row input change
  const handleRowChange = (index, value) => {
    const updated = [...newDataRows];
    updated[index].text = value;
    setNewDataRows(updated);
  };

  const addMoreRow = () => {
    setNewDataRows([...newDataRows, { text: '' }]);
  };

  const removeRow = (index) => {
    if (newDataRows.length <= 1) return;
    setNewDataRows(newDataRows.filter((_, i) => i !== index));
  };

  const handleAddItems = async (e) => {
    e?.preventDefault?.();
    const validRows = newDataRows.filter((r) => r.text && r.text.trim().length > 0);
    const singleText = inputText.trim();

    if (validRows.length === 0 && !singleText) {
      alert('দয়া করে কমপক্ষে একটি টেক্সট লিখুন!');
      return;
    }

    setSubmitting(true);
    setActionMsg(null);
    try {
      const payload = validRows.length > 0
        ? { items: validRows.map((r) => ({ text: r.text.trim() })) }
        : { text: singleText };

      const res = await fetch('/api/db-test/d1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      setInputText('');
      setNewDataRows([{ text: '' }]);
      setIsAddingData(false);
      setActionMsg({ type: 'success', text: '✅ সফলভাবে D1 ডাটাবেজে রো সেভ হয়েছে!' });

      await fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: `❌ সেভ ব্যর্থ: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) {
      alert('টেক্সট খালি রাখা যাবে না!');
      return;
    }

    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/db-test/d1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: editText.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      setEditingId(null);
      setEditText('');
      setActionMsg({ type: 'success', text: '✅ রো সফলভাবে আপডেট হয়েছে!' });

      await fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: `❌ আপডেট ব্যর্থ: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই রো-টি ডিলিট করতে চান?')) return;

    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/db-test/d1?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      setActionMsg({ type: 'success', text: '🗑️ রো সফলভাবে ডিলিট হয়েছে!' });
      await fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: `❌ ডিলিট ব্যর্থ: ${err.message}` });
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
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.key && item.key.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const otherCollections = statusData?.collections || [
    'layout-config',
    'home-config',
    'sidebar-config',
    'policy-config',
    'db-d1-test',
  ];

  return (
    <DbAuthGuard activeRoute="/db-connection/dbd1-admin">
      <main className="db-page-container">
        {/* Background Ambient Orbs */}
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />

        <div className="db-content-card">
          {/* Header */}
          <div className="db-header">
            <div className="db-badge" style={{ borderColor: 'rgba(234, 88, 12, 0.4)', color: '#ea580c', background: 'rgba(234, 88, 12, 0.1)' }}>
              D1 DB Admin Manager
            </div>
            <h1 className="db-title">DB D1 Admin Manager</h1>
            <p className="db-subtitle">
              Serverless Edge SQL (<strong>topmcqbd-db</strong>) এর <code>db-d1-test</code> রো কালেকশন কন্ট্রোল প্যানেল
            </p>
            <div className="server-status-indicator">
              <span>কানেক্টেড ব্যাকএন্ড:</span> <code>{activeBackendUrl}</code>
            </div>
          </div>

          {/* Action & Status Bar */}
          <div className="db-control-bar">
            <div className="status-info-text">
              {lastChecked ? (
                <div className="status-badge-row">
                  <span>সর্বশেষ টেস্ট: <strong>{lastChecked}</strong></span>
                  {isFromCache ? (
                    <span className="cache-pill">
                      <span>⚡</span> LocalStorage Cache
                    </span>
                  ) : (
                    <span className="live-pill" style={{ borderColor: 'rgba(234, 88, 12, 0.3)', background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c' }}>
                      <span className="live-bullet-wrapper">
                        <span className="live-bullet-ring" style={{ borderColor: '#ea580c' }} />
                        <span className="live-bullet-core" style={{ background: '#ea580c' }} />
                      </span>
                      <span>Live D1 Edge</span>
                    </span>
                  )}
                  {statusData?.pingTimeMs !== undefined && (
                    <span className="latency-pill">⚡ {statusData.pingTimeMs} ms</span>
                  )}
                </div>
              ) : (
                <span>ডাটাবেস কানেকশন স্ট্যাটাস চেক করা হচ্ছে...</span>
              )}
            </div>

            <div className="control-btn-group">
              <button
                onClick={() => setIsAddingData(!isAddingData)}
                className="add-toggle-btn"
                style={{ background: isAddingData ? '#64748b' : '#ea580c' }}
              >
                <i className={`fa-solid ${isAddingData ? 'fa-xmark' : 'fa-plus'}`} style={{ marginRight: '6px' }} />
                {isAddingData ? 'ফর্ম বন্ধ করুন' : 'নতুন রো যোগ করুন'}
              </button>

              <button
                onClick={fetchD1Data}
                disabled={loading}
                className="recheck-btn"
                style={{ background: '#0284c7' }}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    চেক হচ্ছে...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-rotate" style={{ marginRight: '6px' }} />
                    রিফ্রেশ করুন
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Message Toast */}
          {actionMsg && (
            <div className={`action-alert ${actionMsg.type}`}>
              <span>{actionMsg.text}</span>
              <button onClick={() => setActionMsg(null)} className="close-alert">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          )}

          {/* Fetch Error Card */}
          {fetchError && (
            <div className="alert-card alert-error">
              <div className="alert-header">
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#dc2626', marginRight: '6px' }} />
                <strong>এপিআই রিকোয়েস্ট সমস্যা:</strong>
              </div>
              <p className="alert-msg">{fetchError}</p>
            </div>
          )}

          {/* Diagnostic Summary Cards Grid */}
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">ডাটাবেজ ইঞ্জিন</span>
              <strong className="summary-val" style={{ color: '#ea580c' }}>
                topmcqbd-db (D1)
              </strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">টার্গেট রো কালেকশন</span>
              <strong className="summary-val" style={{ color: '#0284c7' }}>
                db-d1-test
              </strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">মোট সংরক্ষিত রো</span>
              <strong className="summary-val" style={{ color: '#16a34a' }}>
                {items.length} টি রো
              </strong>
            </div>
          </div>

          {/* Other Collections / Row Keys Box (Image 1 Style) */}
          <div className="collections-box" style={{ marginBottom: '24px' }}>
            <span className="box-title">ক্লাস্টারের অন্যান্য কালেকশনসমূহ:</span>
            <div className="tags-container">
              {otherCollections.map((col, idx) => (
                <span key={idx} className="col-tag">
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Multi-Row Add Data Form */}
          {isAddingData && (
            <div className="crud-container form-slide-down">
              <div className="form-header">
                <h3>
                  <i className="fa-solid fa-file-circle-plus" style={{ marginRight: '8px', color: '#ea580c' }} />
                  নতুন রো ইনপুট (Multi-Row Input)
                </h3>
                <span className="form-sub">একাধিক রো একসাথে লিখে এক ক্লিকে সেভ করুন</span>
              </div>

              <form onSubmit={handleAddItems} className="add-data-form">
                <div className="multi-rows-wrapper">
                  {newDataRows.map((row, idx) => (
                    <div key={idx} className="input-row-group">
                      <span className="row-num">#{idx + 1}</span>
                      <input
                        type="text"
                        value={row.text}
                        onChange={(e) => handleRowChange(idx, e.target.value)}
                        placeholder={`রো #${idx + 1} এর টেক্সট লিখুন...`}
                        className="multi-input-field"
                        required={idx === 0}
                      />
                      {newDataRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="remove-row-btn"
                          title="এই রো মুছে ফেলুন"
                        >
                          <i className="fa-solid fa-trash-can" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="form-footer-actions">
                  <button
                    type="button"
                    onClick={addMoreRow}
                    className="add-more-btn"
                  >
                    <i className="fa-solid fa-plus" style={{ marginRight: '6px' }} />
                    আরও ১টি রো যোগ করুন
                  </button>

                  <div className="submit-btn-group">
                    <button
                      type="button"
                      onClick={() => setIsAddingData(false)}
                      className="cancel-btn"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="submit-btn"
                      style={{ background: '#ea580c' }}
                    >
                      {submitting ? (
                        <>
                          <span className="btn-spinner" />
                          সেভ হচ্ছে...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '6px' }} />
                          সব রো সেভ করুন ({newDataRows.filter(r => r.text.trim()).length || 1})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Real-time Data Table Section */}
          <div className="crud-container">
            <div className="section-header-row">
              <h3>
                <i className="fa-solid fa-table-list" style={{ marginRight: '8px', color: '#ea580c' }} />
                সংরক্ষিত রো তালিকা ({filteredItems.length})
              </h3>
              <div className="search-box-wrapper">
                <i className="fa-solid fa-magnifying-glass search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="রো বা আইডি সার্চ..."
                  className="search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-folder-open" style={{ fontSize: '36px', color: '#64748b', marginBottom: '12px' }} />
                <p>
                  {searchQuery
                    ? 'সার্চের সাথে মিল রেখে কোনো রো পাওয়া যায়নি।'
                    : '"db-d1-test" কালেকশনে এখনো কোনো রো নেই। ওপরের বাটনে চাপ দিয়ে নতুন রো যুক্ত করুন।'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="db-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th style={{ width: '160px' }}>রো আইডি (ID)</th>
                      <th>টেক্সট / রো ডাটা</th>
                      <th style={{ width: '180px' }}>তৈরির সময়</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, idx) => {
                      const rowKey = item.key || item.id || 'db-d1-test';
                      return (
                        <tr key={item.id || idx} className={editingId === item.id ? 'row-editing' : ''}>
                          <td>
                            <span className="row-index-badge">{idx + 1}</span>
                          </td>
                          <td>
                            <div className="id-cell">
                              <code>{rowKey}</code>
                              <button
                                onClick={() => copyToClipboard(rowKey, `admin_tag_${idx}`)}
                                className="copy-mini-btn"
                                title="আইডি কপি করুন"
                              >
                                <i className={`fa-solid ${copiedId === `admin_tag_${idx}` ? 'fa-check' : 'fa-copy'}`} />
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
                                />
                                <div className="edit-btn-actions">
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    disabled={submitting}
                                    className="save-edit-btn"
                                  >
                                    <i className="fa-solid fa-check" />
                                  </button>
                                  <button onClick={cancelEdit} className="cancel-edit-btn">
                                    <i className="fa-solid fa-xmark" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-display-cell">
                                <span>{item.text}</span>
                                <button
                                  onClick={() => copyToClipboard(item.text, `admin_txt_${idx}`)}
                                  className="copy-text-icon"
                                  title="টেক্সট কপি করুন"
                                >
                                  <i className={`fa-solid ${copiedId === `admin_txt_${idx}` ? 'fa-check' : 'fa-copy'}`} />
                                </button>
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="date-badge">
                              <i className="fa-regular fa-clock" style={{ marginRight: '5px' }} />
                              {formatDateTime(item.createdAt || item.updatedAt)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="table-actions">
                              <button
                                onClick={() => startEdit(item)}
                                disabled={editingId === item.id}
                                className="edit-action-btn"
                                title="রো এডিট করুন"
                              >
                                <i className="fa-solid fa-pen-to-square" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={submitting}
                                className="delete-action-btn"
                                title="রো ডিলিট করুন"
                              >
                                <i className="fa-solid fa-trash-can" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
            font-size: 12px;
            color: #64748b;
          }

          .server-status-indicator code {
            color: #ea580c;
            background: #fff7ed;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
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

          .cache-pill {
            background: #fef3c7;
            color: #d97706;
            border: 1px solid #fde68a;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
          }

          .live-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
            border: 1px solid;
          }

          .latency-pill {
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #bfdbfe;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 600;
          }

          .live-bullet-wrapper {
            position: relative;
            width: 7px;
            height: 7px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .live-bullet-core {
            width: 7px;
            height: 7px;
            border-radius: 50%;
          }

          .live-bullet-ring {
            position: absolute;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            border: 1px solid;
            animation: pulse 1.5s infinite;
          }

          .control-btn-group {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .add-toggle-btn, .recheck-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #ffffff;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 12.5px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }

          .add-toggle-btn:hover, .recheck-btn:hover:not(:disabled) {
            filter: brightness(1.1);
            transform: translateY(-1px);
          }

          .btn-spinner {
            width: 13px;
            height: 13px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .action-alert {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 20px;
          }

          .action-alert.success {
            background: #dcfce7;
            color: #16a34a;
            border: 1px solid #bbf7d0;
          }

          .action-alert.error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }

          .close-alert {
            background: transparent;
            border: none;
            cursor: pointer;
            color: inherit;
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
            font-size: 14px;
            color: #dc2626;
            margin-bottom: 6px;
          }

          .alert-msg {
            color: #b91c1c;
            font-size: 13px;
            margin: 0;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }

          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .summary-label {
            font-size: 11.5px;
            color: #64748b;
          }

          .summary-val {
            font-size: 15px;
          }

          .collections-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 18px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          }

          .box-title {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 10px;
          }

          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .col-tag {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #2563eb;
            font-size: 12px;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 6px;
            font-family: monospace;
          }

          .crud-container {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 22px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          }

          .form-header {
            margin-bottom: 16px;
          }

          .form-header h3 {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 4px;
          }

          .form-sub {
            font-size: 12px;
            color: #64748b;
          }

          .multi-rows-wrapper {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 16px;
          }

          .input-row-group {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .row-num {
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            width: 24px;
            text-align: center;
          }

          .multi-input-field {
            flex: 1;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #0f172a;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 13px;
            outline: none;
          }

          .multi-input-field:focus {
            border-color: #ea580c;
            background: #ffffff;
          }

          .remove-row-btn {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            color: #dc2626;
            width: 34px;
            height: 34px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .form-footer-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            border-top: 1px solid #f1f5f9;
            padding-top: 14px;
          }

          .add-more-btn {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            color: #334155;
            padding: 7px 14px;
            border-radius: 7px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }

          .add-more-btn:hover {
            background: #e2e8f0;
          }

          .submit-btn-group {
            display: flex;
            gap: 8px;
          }

          .cancel-btn {
            background: transparent;
            border: 1px solid #e2e8f0;
            color: #64748b;
            padding: 7px 14px;
            border-radius: 7px;
            font-size: 12.5px;
            cursor: pointer;
          }

          .submit-btn {
            color: #ffffff;
            border: none;
            padding: 7px 18px;
            border-radius: 7px;
            font-size: 12.5px;
            font-weight: 700;
            cursor: pointer;
          }

          .section-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
            flex-wrap: wrap;
            gap: 12px;
          }

          .section-header-row h3 {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }

          .search-box-wrapper {
            position: relative;
            width: 240px;
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
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #0f172a;
            padding: 6px 12px 6px 32px;
            border-radius: 7px;
            font-size: 12.5px;
            outline: none;
          }

          .search-input:focus {
            border-color: #ea580c;
            background: #ffffff;
          }

          .clear-search-btn {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
          }

          .empty-state {
            text-align: center;
            padding: 36px 20px;
            color: #64748b;
            font-size: 13px;
          }

          .table-responsive {
            overflow-x: auto;
          }

          .db-data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          .db-data-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
          }

          .db-data-table td {
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
          }

          .row-index-badge {
            display: inline-block;
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
          }

          .id-cell {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .id-cell code {
            color: #ea580c;
            background: #fff7ed;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11.5px;
            font-family: monospace;
          }

          .copy-mini-btn, .copy-text-icon {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 11px;
          }

          .copy-mini-btn:hover, .copy-text-icon:hover {
            color: #0f172a;
          }

          .text-display-cell {
            display: flex;
            align-items: center;
            gap: 8px;
            word-break: break-word;
          }

          .inline-edit-box {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .inline-edit-input {
            flex: 1;
            background: #ffffff;
            border: 1px solid #ea580c;
            color: #0f172a;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 13px;
          }

          .save-edit-btn, .cancel-edit-btn {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
          }

          .save-edit-btn {
            background: #16a34a;
            color: #ffffff;
          }

          .cancel-edit-btn {
            background: #f1f5f9;
            color: #64748b;
          }

          .date-badge {
            font-size: 11.5px;
            color: #64748b;
          }

          .table-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }

          .edit-action-btn, .delete-action-btn {
            width: 30px;
            height: 30px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid;
          }

          .edit-action-btn {
            background: #f0f9ff;
            border-color: #bae6fd;
            color: #0284c7;
          }

          .delete-action-btn {
            background: #fef2f2;
            border-color: #fecaca;
            color: #dc2626;
          }

          .bottom-nav-link {
            font-size: 13px;
            color: #2563eb;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            font-weight: 600;
          }

          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
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
