'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DbAuthGuard from '@/components/common/DbAuthGuard';
import DbNavBox from '@/components/common/DbNavBox';
import { showTopAlert } from '@/components/layout/TopAlert';

const DB_CONFIG = {
  id: 'live-exam',
  name: 'Live Exam Engine Paid DB',
  cluster: 'TopMCQBD_DB_Live_Exam',
  host: 'topmcqbd.ns1gpls.mongodb.net',
  targetColl: 'db-live-exam-test',
  badgeColor: '#059669',
  badgeBg: '#ecfdf5',
  badgeBorder: '#a7f3d0',
  icon: 'fa-solid fa-bolt-lightning',
  hostName: 'live-exam-paid-api.onrender.com',
  apiEndpoint: '/api/db-test/live-exam',
};

const formatDateTime = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  } catch {
    return String(dateVal);
  }
};

export default function DbLiveExamPage() {
  return (
    <DbAuthGuard activeRoute="/db-connection-api/dbliveexam-api">
      <DbLiveExamContent />
    </DbAuthGuard>
  );
}

function DbLiveExamContent() {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [items, setItems] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [refreshFeedback, setRefreshFeedback] = useState(null);

  // Multi-Row Add Data States
  const [isAddingData, setIsAddingData] = useState(false);
  const [newDataRows, setNewDataRows] = useState([{ text: '' }]);
  const [submitting, setSubmitting] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [pendingReorder, setPendingReorder] = useState(null);

  // Delete confirmation floating action bar state
  const [pendingDelete, setPendingDelete] = useState(null);

  const getApiBaseUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '';
      }
    }
    return process.env.NEXT_PUBLIC_LIVE_EXAM_API_URL || 'https://live-exam-paid-api.onrender.com';
  }, []);

  const fetchDbData = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshFeedback({ type: 'loading', msg: 'রিফ্রেশ হচ্ছে...' });
    }
    setLoading(true);
    const startTime = Date.now();

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${DB_CONFIG.apiEndpoint}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const data = json.liveExamDb || json;
      const freshItems = Array.isArray(data.items) ? data.items : [];

      setStatusData(data);
      setItems(freshItems);
      setLatencyMs(data.latencyMs ?? data.pingTimeMs ?? (Date.now() - startTime));
      setPendingReorder(null);
      const timestamp = formatDateTime(new Date());
      setLastRefreshed(timestamp);

      if (isManual) {
        setRefreshFeedback({ type: 'success', msg: `রিফ্রেশ সফল (${freshItems.length}টি রেকর্ড)` });
        setTimeout(() => setRefreshFeedback(null), 3500);
      }
    } catch (err) {
      setLatencyMs(Date.now() - startTime);
      setStatusData({
        connected: false,
        error: err.message || 'Connection Error',
        cluster: DB_CONFIG.cluster,
      });
      setItems([]);
      if (isManual) {
        showTopAlert(`❌ রিফ্রেশ ব্যর্থ: ${err.message}`, 'danger');
        setRefreshFeedback({ type: 'error', msg: `রিফ্রেশ ব্যর্থ: ${err.message}` });
        setTimeout(() => setRefreshFeedback(null), 3500);
      }
    } finally {
      setLoading(false);
    }
  }, [getApiBaseUrl]);

  useEffect(() => {
    fetchDbData();
  }, [fetchDbData]);

  // Copy API URL
  const copyApiUrl = () => {
    const fullUrl = `https://${DB_CONFIG.hostName}${DB_CONFIG.apiEndpoint}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(true);
      showTopAlert('API URL কপি করা হয়েছে!', 'success');
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Multi-Row Add Data Handlers
  const openAddDataForm = () => {
    setIsAddingData(true);
    setNewDataRows([{ text: '' }]);
  };

  const closeAddDataForm = () => {
    setIsAddingData(false);
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
      const baseUrl = getApiBaseUrl();
      for (const row of validRows) {
        const res = await fetch(`${baseUrl}${DB_CONFIG.apiEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: row.text.trim() }),
        });
        if (!res.ok) throw new Error('ডাটা যুক্ত করতে সমস্যা হয়েছে।');
      }

      setIsAddingData(false);
      setNewDataRows([{ text: '' }]);
      showTopAlert(`✅ ${validRows.length} টি ডাটা সফলভাবে "${DB_CONFIG.targetColl}" কালেকশনে সংরক্ষিত হয়েছে!`, 'success');
      fetchDbData();
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Inline Edit Handlers
  const handleStartEdit = (item) => {
    setEditingId(item._id || item.id);
    setEditText(item.text || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;

    setSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${DB_CONFIG.apiEndpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: editText.trim() }),
      });

      if (!res.ok) throw new Error('আপডেট করতে ব্যর্থ হয়েছে।');

      setEditingId(null);
      setEditText('');
      showTopAlert('✅ টেক্সট সফলভাবে আপডেট করা হয়েছে!', 'success');
      fetchDbData();
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Item Handlers (Bottom Floating Action Bar)
  const handlePromptDelete = (id) => {
    setPendingDelete(id);
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete;

    setSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}${DB_CONFIG.apiEndpoint}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('মুছে ফেলতে ব্যর্থ হয়েছে।');

      setPendingDelete(null);
      showTopAlert('🗑️ টেক্সট সফলভাবে মুছে ফেলা হয়েছে!', 'success');
      fetchDbData();
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (idx) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragOverIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const currentItems = [...items];
    if (!pendingReorder) {
      setPendingReorder({ backupItems: [...currentItems] });
    }

    const [moved] = currentItems.splice(draggedIndex, 1);
    currentItems.splice(targetIdx, 0, moved);

    setItems(currentItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveReorder = () => {
    if (!pendingReorder) return;
    showTopAlert(`✅ ${DB_CONFIG.name}-এর নতুন ক্রম সফলভাবে সেভ করা হয়েছে!`, 'success');
    setPendingReorder(null);
  };

  const handleCancelReorder = () => {
    if (!pendingReorder) return;
    setItems(pendingReorder.backupItems);
    setPendingReorder(null);
  };

  const isConnected = statusData?.connected ?? false;
  const collections = statusData?.collections || [DB_CONFIG.targetColl];

  return (
    <main className="workers-api-container">
      <div className="workers-api-wrapper">
        {/* BREADCRUMB */}
        <div className="breadcrumb-bar">
          <div className="breadcrumb-links">
            <Link href="/" className="bc-link">হোম</Link>
            <span className="bc-sep">/</span>
            <Link href="/db-connection-api" className="bc-link">DB Suite</Link>
            <span className="bc-sep">/</span>
            <span className="bc-active">{DB_CONFIG.name}</span>
          </div>
        </div>

        {/* 1. TOP MASTER BOX */}
        <div className="top-api-master-box">
          <div className="top-box-left">
            <div className={`api-badge-pill ${isConnected ? 'pill-connected' : 'pill-disconnected'}`}>
              <span className="live-dot" />
              <span className="api-badge-text">{isConnected ? 'Active Connected' : 'Disconnected'}</span>
            </div>
            <h1 className="api-master-title">
              {DB_CONFIG.name} — Diagnostic & Control Suite
            </h1>
            <p className="api-master-desc">
              এই পেজের মাধ্যমে <strong>https://{DB_CONFIG.hostName}</strong> ব্যাকআপ এপিআই ব্যবহার করে {DB_CONFIG.name} ডাটাবেজের লাইভ কানেকশন চেক এবং টেক্সট ডাটা সরাসরি Add, Edit, Delete ও Drag-and-Drop করা যাবে।
            </p>

            <div className="api-meta-row">
              <div className="meta-pill">
                <span className="mp-label">API Host:</span>
                <span className="mp-val mono">{DB_CONFIG.hostName}</span>
              </div>
              <div className="meta-pill">
                <span className="mp-label">Database:</span>
                <span className="mp-val mono">{DB_CONFIG.cluster}</span>
              </div>
              <div className="meta-pill">
                <span className="mp-label">Endpoint:</span>
                <span className="mp-val mono">{DB_CONFIG.apiEndpoint}</span>
              </div>
            </div>
          </div>

          <div className="top-box-bottom">
            <div className="copy-action-box">
              <span className="copy-label">ব্যাকআপ এপিআই চেক URL:</span>
              <div className="copy-field">
                <span className="copy-url-text">https://{DB_CONFIG.hostName}{DB_CONFIG.apiEndpoint}</span>
                <button onClick={copyApiUrl} className="btn-copy" title="URL কপি করুন">
                  <i className={`fa-solid ${copiedUrl ? 'fa-check' : 'fa-copy'}`} />
                  {copiedUrl ? 'কপি হয়েছে' : 'কপি'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1.5 DEDICATED RECHECK BAR BOX */}
        <div className="dedicated-recheck-box">
          <div className="recheck-left">
            <div
              className="recheck-icon-circle"
              style={{
                background: DB_CONFIG.badgeBg,
                color: DB_CONFIG.badgeColor,
                borderColor: DB_CONFIG.badgeBorder,
              }}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'}`} />
            </div>
            <div className="recheck-texts">
              <h3 className="recheck-title">লাইভ কানেকশন টেস্ট ও স্ট্যাটাস রিফ্রেশ</h3>
              <p className="recheck-desc">
                সর্বশেষ চেক: {lastRefreshed || 'লোড হচ্ছে...'}
              </p>
            </div>
          </div>

          <div className="recheck-right">
            {/* Connected / Disconnected Badge */}
            <div
              className={`recheck-status-badge ${isConnected ? 'status-connected' : 'status-disconnected'}`}
            >
              <span className="recheck-dot" />
              <span className="recheck-status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>

            {/* Latency Badge */}
            <div className="recheck-latency-badge">
              <i className="fa-solid fa-bolt" />
              <span>{latencyMs !== null ? `${latencyMs} ms` : '— ms'}</span>
            </div>

            {/* Recheck Button */}
            <button
              type="button"
              onClick={() => fetchDbData(true)}
              disabled={loading}
              className="btn-recheck-all-dedicated"
              style={{
                background: DB_CONFIG.badgeColor,
                boxShadow: `0 2px 8px ${DB_CONFIG.badgeColor}35`,
              }}
            >
              <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'}`} style={{ marginRight: '7px' }} />
              {loading ? 'চেক হচ্ছে...' : 'পুনরায় চেক করুন'}
            </button>
          </div>
        </div>

        {/* 2. MAIN CLUSTER CONTROL PANEL CARD */}
        <div className="control-boxes-container">
          <div className="cluster-control-panel">
            {/* Panel Header */}
            <div className="cc-header">
              <div className="cc-title-left">
                <span className="cc-badge-icon" style={{ backgroundColor: DB_CONFIG.badgeBg, color: DB_CONFIG.badgeColor, borderColor: DB_CONFIG.badgeBorder }}>
                  <i className={DB_CONFIG.icon} />
                </span>
                <div>
                  <h3 className="cc-title">{DB_CONFIG.name}</h3>
                  <p className="cc-subtitle">
                    ডাটাবেজ: <strong>{DB_CONFIG.cluster}</strong> | টার্গেট কালেকশন: <code style={{ color: DB_CONFIG.badgeColor }}>{DB_CONFIG.targetColl}</code>
                  </p>
                </div>
              </div>

              <div className="cc-header-actions">
                {refreshFeedback && (
                  <span className={`cc-refresh-toast toast-${refreshFeedback.type}`}>
                    {refreshFeedback.type === 'loading' && <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '5px' }} />}
                    {refreshFeedback.type === 'success' && <i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }} />}
                    {refreshFeedback.type === 'error' && <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '5px' }} />}
                    {refreshFeedback.msg}
                  </span>
                )}
                <span className="cc-items-count-badge">
                  {items.length} টি টেক্সট রেকর্ড
                </span>
              </div>
            </div>

            {/* Raw / Collections List Full-Width Box below Header */}
            <div className="cc-header-collections">
              <span className="box-title">
                <i className="fa-solid fa-database" style={{ marginRight: '5px', fontSize: '10px' }} />
                রো কালেকশন তালিকা ({collections.length}):
              </span>
              <div className="tags-container">
                {collections.length > 0 ? (
                  collections.map((col, idx) => (
                    <span
                      key={idx}
                      className="col-tag"
                      style={col === DB_CONFIG.targetColl ? { background: DB_CONFIG.badgeBg, color: DB_CONFIG.badgeColor, borderColor: DB_CONFIG.badgeBorder, fontWeight: '700' } : {}}
                    >
                      {col} {col === DB_CONFIG.targetColl && '★'}
                    </span>
                  ))
                ) : (
                  <span className="col-tag-empty">
                    {loading ? 'লোড হচ্ছে...' : 'কোনো কালেকশন পাওয়া যায়নি'}
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column Split: Left Add/Multi-row & Right Live Texts */}
            <div className="cc-split-layout">
              {/* LEFT: Add / Multi-Row Data Section */}
              <div className="cc-form-panel">
                <div className="cc-panel-head">
                  <h4 className="cc-panel-title">
                    <i className="fa-solid fa-layer-group" style={{ color: DB_CONFIG.badgeColor, marginRight: '6px' }} />
                    ডাটা যোগ ও ব্যবস্থাপনা
                  </h4>
                  <span className="cc-panel-hint">
                    {DB_CONFIG.targetColl} কালেকশনে সরাসরি সেভ হবে
                  </span>
                </div>

                {!isAddingData ? (
                  <div className="add-btn-wrapper">
                    <button
                      type="button"
                      onClick={openAddDataForm}
                      className="btn-add-main"
                      style={{ background: '#059669' }}
                    >
                      <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} /> Add Text (ডাটা যোগ করুন)
                    </button>
                  </div>
                ) : (
                  <div className="add-rows-container">
                    <div className="add-rows-header">
                      <span className="add-rows-title">
                        <i className="fa-solid fa-layer-group" style={{ marginRight: '8px', color: '#0284c7' }} />
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
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                saveAllNewData();
                              }
                            }}
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
                          onClick={closeAddDataForm}
                          className="btn-cancel-all-rows"
                        >
                          <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dotted Divider between Left & Right Panels */}
              <div className="cc-panel-dotted-divider" />

              {/* RIGHT: Live Texts List with Drag & Drop */}
              <div className="cc-list-panel">
                <div className="cc-panel-head">
                  <h4 className="cc-panel-title">
                    <i className="fa-solid fa-list-check" style={{ color: DB_CONFIG.badgeColor, marginRight: '6px' }} />
                    সংরক্ষিত টেক্সট তালিকা ({items.length})
                  </h4>
                  <span className="cc-panel-hint">
                    মাউস দিয়ে ড্র্যাগ করে ক্রম সাজান
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="cc-empty-box">
                    <i className="fa-regular fa-folder-open" style={{ fontSize: '24px', opacity: 0.5, display: 'block', marginBottom: '6px' }} />
                    এই কালেকশনে এখনো কোনো টেক্সট যোগ করা হয়নি। বামপাশের বাটন দিয়ে ডাটা যোগ করুন।
                  </div>
                ) : (
                  <div className="items-list">
                    {items.map((item, idx) => {
                      const itemId = item._id || item.id;
                      const isBeingEdited = editingId === itemId;
                      const isDragTarget = draggedIndex !== null && dragOverIndex === idx;

                      return (
                        <div
                          key={itemId || idx}
                          draggable={!isBeingEdited}
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          className={`item-row ${isBeingEdited ? 'item-editing' : ''} ${isDragTarget ? 'item-dragover' : ''}`}
                        >
                          {isBeingEdited ? (
                            <div className="edit-box-inline">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="edit-input"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(itemId);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                              />
                              <div className="edit-btn-group">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(itemId)}
                                  disabled={submitting}
                                  className="btn-save-inline"
                                >
                                  <i className="fa-solid fa-check" style={{ marginRight: '4px' }} /> সেভ করুন
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="btn-cancel-inline"
                                >
                                  বাতিল
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="item-row-left">
                                <span className="drag-handle-icon" title="মাউস দিয়ে ড্র্যাগ করে ক্রম পরিবর্তন করুন">
                                  <i className="fa-solid fa-grip-vertical" />
                                </span>

                                <div className="item-content">
                                  <div className="item-title-row">
                                    <span className="item-index" style={{ color: DB_CONFIG.badgeColor }}>#{idx + 1}</span>
                                    <span className="item-text">{item.text}</span>
                                  </div>
                                  <div className="item-time-row">
                                    <i className="fa-regular fa-clock" />
                                    <span>{formatDateTime(item.updatedAt || item.createdAt)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="item-actions">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(item)}
                                  className="action-btn edit-btn"
                                  title="সম্পাদনা করুন"
                                >
                                  <i className="fa-solid fa-pen" style={{ marginRight: '5px' }} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePromptDelete(itemId)}
                                  className="action-btn del-btn"
                                  title="মুছে ফেলুন"
                                >
                                  <i className="fa-solid fa-trash-can" style={{ marginRight: '5px' }} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drag & Drop Floating Action Bar */}
        {pendingReorder && (
          <div id="reorder-action-bar">
            <span className="reorder-bar-text">
              আপনি টেক্সটের ক্রম পরিবর্তন করেছেন। সেভ করতে বোতাম চাপুন।
            </span>
            <button onClick={handleSaveReorder} className="btn-submit">
              <i className="fa-solid fa-floppy-disk" /> পরিবর্তন সেভ করুন
            </button>
            <button onClick={handleCancelReorder} className="btn-danger">
              <i className="fa-solid fa-xmark" /> বাতিল করুন
            </button>
          </div>
        )}

        {/* Delete Confirmation Floating Action Bar */}
        {pendingDelete && (
          <div id="delete-action-bar">
            <span className="delete-bar-text">
              আপনি কি নিশ্চিত এই টেক্সটটি মুছে ফেলতে চান?
            </span>
            <button
              type="button"
              className="btn-delete-confirm"
              onClick={handleConfirmDelete}
              disabled={submitting}
            >
              <i className="fa-solid fa-trash-can" /> {submitting ? 'মুছে ফেলা হচ্ছে...' : 'মুছে ফেলুন'}
            </button>
            <button
              type="button"
              className="btn-delete-cancel"
              onClick={handleCancelDelete}
              disabled={submitting}
            >
              <i className="fa-solid fa-xmark" /> বাতিল করুন
            </button>
          </div>
        )}

        {/* Global DB Navigation Box */}
        <DbNavBox activeRoute="/db-connection-api/dbliveexam-api" />
      </div>

      <style jsx>{`
        .workers-api-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 28px 16px 60px;
          color: #1e293b;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .workers-api-wrapper {
          max-width: 1300px;
          margin: 0 auto;
        }

        .breadcrumb-bar {
          margin-bottom: 20px;
        }

        .breadcrumb-links {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }

        :global(.bc-link) {
          color: #4f46e5 !important;
          text-decoration: none !important;
          font-weight: 600;
        }

        .bc-sep {
          color: #cbd5e1;
        }

        .bc-active {
          color: #1e293b;
          font-weight: 700;
        }

        /* Top Box */
        .top-api-master-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
        }

        .api-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 10px;
        }

        .api-badge-pill.pill-connected {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .api-badge-pill.pill-disconnected {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          display: inline-block;
        }

        .pill-connected .live-dot {
          background: #059669;
          box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.65);
          animation: statusDotPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        .pill-disconnected .live-dot {
          background: #dc2626;
        }

        .api-badge-text {
          display: inline-flex;
          align-items: center;
          line-height: 1;
          transform: translateY(0.5px);
        }

        .api-master-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .api-master-desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .api-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
        }

        .meta-pill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          line-height: 1.4;
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
        }

        .mp-label {
          color: #64748b;
          font-weight: 600;
          line-height: 1.4;
        }

        .mp-val {
          color: #0f172a;
          font-weight: 700;
          line-height: 1.4;
          font-family: inherit;
        }

        .meta-pill .mono {
          font-family: inherit;
        }

        .top-box-bottom {
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }

        .copy-action-box {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .copy-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #334155;
        }

        .copy-field {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          overflow: hidden;
          flex: 1;
          max-width: 600px;
        }

        .copy-url-text {
          padding: 8px 12px;
          font-size: 12.5px;
          font-family: monospace;
          color: #4f46e5;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-copy {
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .btn-copy:hover { background: #4338ca; }

        /* Dedicated Recheck Bar Box */
        .dedicated-recheck-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 22px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }

        .recheck-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .recheck-icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          border: 1px solid transparent;
        }

        .recheck-texts {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .recheck-title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .recheck-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .recheck-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .recheck-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
        }

        .recheck-status-badge.status-connected {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .recheck-status-badge.status-disconnected {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .recheck-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
          display: inline-block;
        }

        .status-connected .recheck-dot {
          background: #059669;
          box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.65);
          animation: statusDotPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        .status-disconnected .recheck-dot {
          background: #dc2626;
        }

        .recheck-status-text {
          display: inline-flex;
          align-items: center;
          line-height: 1;
          transform: translateY(0.5px);
        }

        .recheck-latency-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 13px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
        }

        .recheck-latency-badge i {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          font-size: 11px;
          transform: translateY(-0.5px);
        }

        .recheck-latency-badge span {
          display: inline-flex;
          align-items: center;
          line-height: 1;
          transform: translateY(0.5px);
        }

        @keyframes statusDotPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.65);
          }
          70% {
            box-shadow: 0 0 0 5px rgba(5, 150, 105, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(5, 150, 105, 0);
          }
        }

        .btn-recheck-all-dedicated {
          color: #ffffff;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
        }

        .btn-recheck-all-dedicated:hover:not(:disabled) {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }

        /* Main Cluster Control Panel */
        .control-boxes-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 32px;
        }

        .cluster-control-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
        }

        .cc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 12px;
        }

        .cc-title-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cc-badge-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }

        .cc-title {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .cc-subtitle {
          font-size: 12.5px;
          color: #64748b;
          margin: 0;
        }

        .cc-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cc-refresh-toast {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
          animation: toastFadeIn 0.2s ease-out;
        }

        .toast-loading {
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
        }

        .toast-success {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .toast-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        @keyframes toastFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .cc-items-count-badge {
          background: #f1f5f9;
          color: #334155;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }

        .cc-refresh-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cc-refresh-btn:hover {
          background: #eef2ff;
          color: #4f46e5;
        }

        .cc-header-collections {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 20px;
        }

        .cc-header-collections .box-title {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .cc-header-collections .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cc-header-collections .col-tag {
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          color: #4f46e5;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 5px;
          font-family: monospace;
          white-space: nowrap;
        }

        .cc-header-collections .col-tag-empty {
          font-size: 11.5px;
          color: #94a3b8;
          font-style: italic;
        }

        /* 2-Column Split with Center Dotted Divider */
        .cc-split-layout {
          display: grid;
          grid-template-columns: 1fr auto 1.3fr;
          gap: 20px;
          align-items: stretch;
        }

        .cc-panel-dotted-divider {
          width: 0;
          border-left: 2px dotted #94a3b8;
          margin: 4px 0;
          align-self: stretch;
        }

        @media (max-width: 860px) {
          .cc-split-layout {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .cc-panel-dotted-divider {
            width: 100%;
            height: 0;
            border-left: none;
            border-top: 2px dotted #94a3b8;
            margin: 4px 0;
          }
        }

        .cc-form-panel,
        .cc-list-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px;
        }

        .cc-panel-head {
          margin-bottom: 14px;
        }

        .cc-panel-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 2px 0;
          display: flex;
          align-items: center;
        }

        .cc-panel-hint {
          font-size: 11.5px;
          color: #64748b;
        }

        .add-btn-wrapper {
          padding: 8px 0;
        }

        .btn-add-main {
          background: #059669;
          color: #ffffff;
          border: none;
          padding: 11px 22px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
        }

        .btn-add-main:hover {
          background: #047857;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
        }

        .add-rows-container {
          background: #ffffff;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
        }

        .add-rows-header {
          margin-bottom: 12px;
        }

        .add-rows-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0284c7;
          display: flex;
          align-items: center;
        }

        .add-rows-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }

        .add-row-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 6px 10px;
        }

        .row-num-badge {
          background: #eff6ff;
          color: #2563eb;
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .add-row-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #0f172a;
          font-size: 13px;
          outline: none;
          padding: 4px 0;
          font-family: inherit;
        }

        .add-row-input::placeholder {
          color: #94a3b8;
        }

        .btn-row-delete {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 11.5px;
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
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px dashed #cbd5e1;
        }

        .btn-add-more-rows {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 8px 14px;
          border-radius: 7px;
          font-size: 12.5px;
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
          padding: 8px 16px;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
        }

        .btn-save-all-rows:hover:not(:disabled) {
          background: #047857;
          transform: translateY(-1px);
        }

        .btn-cancel-all-rows {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
          padding: 8px 14px;
          border-radius: 7px;
          font-size: 12.5px;
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

        /* Items List */
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 10px 16px;
          border-radius: 10px;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: grab;
        }

        .item-row:hover {
          border-color: #c7d2fe;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
        }

        .item-row:active {
          cursor: grabbing;
        }

        .item-row-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .item-editing {
          border-color: #4f46e5 !important;
          background: #eef2ff !important;
        }

        .item-dragover {
          border-top: 3px solid #4f46e5 !important;
        }

        .item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .item-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .item-index {
          color: #4f46e5;
          font-size: 14px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .item-text {
          color: #1e293b;
          font-size: 14px;
          font-weight: 700;
          word-break: break-word;
        }

        .item-time-row {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          line-height: 1.2;
        }

        .item-time-row i {
          font-size: 11px;
          color: #64748b;
        }

        .item-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .action-btn {
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12.5px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }

        .edit-btn {
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
        }

        .edit-btn:hover {
          background: #4f46e5;
          color: #ffffff;
        }

        .del-btn {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
        }

        .del-btn:hover {
          background: #dc2626;
          color: #ffffff;
        }

        .drag-handle-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: grab;
          transition: all 0.2s ease;
          flex-shrink: 0;
          font-size: 16px;
        }

        .drag-handle-icon:hover {
          background: #eef2ff;
          color: #4f46e5;
          border-color: #c7d2fe;
        }

        .drag-handle-icon:active {
          cursor: grabbing;
        }

        .edit-box-inline {
          display: flex;
          width: 100%;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .edit-input {
          flex: 1;
          min-width: 180px;
          background: #ffffff;
          border: 1px solid #0284c7;
          border-radius: 6px;
          padding: 6px 10px;
          color: #0f172a;
          font-size: 13px;
          outline: none;
        }

        .edit-btn-group {
          display: flex;
          gap: 6px;
        }

        .btn-save-inline {
          background: #059669;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-save-inline:hover:not(:disabled) {
          background: #047857;
        }

        .btn-cancel-inline {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-cancel-inline:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .cc-empty-box {
          text-align: center;
          padding: 28px 14px;
          color: #64748b;
          font-size: 13px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          background: #ffffff;
        }

        /* Drag & Drop Floating Action Bar */
        #reorder-action-bar {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #f4f7f6;
          color: #2c3e50;
          padding: 14px 20px;
          border-top: 1px solid #cbd5e1;
          border-left: 6px solid #ffc107;
          z-index: 99999;
          box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.04), 0 -8px 20px rgba(0, 0, 0, 0.08), 0 -16px 36px rgba(15, 23, 42, 0.08);
          justify-content: center;
          align-items: center;
          gap: 20px;
          animation: slideUp 0.3s ease;
          flex-wrap: wrap;
        }

        /* Delete Floating Action Bar */
        #delete-action-bar {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #f4f7f6;
          color: #2c3e50;
          padding: 14px 20px;
          border-top: 1px solid #cbd5e1;
          border-left: 6px solid #dc3545;
          z-index: 99999;
          box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.04), 0 -8px 20px rgba(0, 0, 0, 0.08), 0 -16px 36px rgba(15, 23, 42, 0.08);
          justify-content: center;
          align-items: center;
          gap: 20px;
          animation: slideUp 0.3s ease;
          flex-wrap: wrap;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .reorder-bar-text,
        .delete-bar-text {
          color: #2c3e50;
          font-weight: bold;
          font-size: 15px;
        }

        .btn-delete-confirm {
          background: #dc3545;
          color: #ffffff;
          border: none;
          padding: 9px 20px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
        }

        .btn-delete-confirm:hover {
          background: #bb2d3b;
        }

        .btn-delete-cancel {
          background: #000000;
          color: #ffffff;
          border: none;
          padding: 9px 16px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-delete-cancel:hover {
          background: #27272a;
        }

        .btn-submit {
          background: #28a745;
          color: #ffffff;
          border: none;
          padding: 9px 20px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);
        }

        .btn-submit:hover {
          background: #218838;
          transform: translateY(-1px);
        }

        .btn-danger {
          background: #dc3545;
          color: #ffffff;
          border: none;
          padding: 9px 16px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
        }

        .btn-danger:hover {
          background: #c82333;
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .cc-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .cc-header-actions {
            justify-content: space-between;
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .cluster-control-panel {
            padding: 14px;
            border-radius: 12px;
          }

          #reorder-action-bar,
          #delete-action-bar {
            flex-direction: column;
            gap: 10px;
            padding: 12px 16px;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}
