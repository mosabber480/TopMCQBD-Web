'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DbAuthGuard from '@/components/common/DbAuthGuard';
import DbNavBox from '@/components/common/DbNavBox';
import { showTopAlert } from '@/components/layout/TopAlert';

const CLUSTERS = [
  {
    id: 'paid',
    name: '1. Primary Paid Core DB',
    cluster: 'TopMCQBD_DB',
    host: 'mosabber.3ajdj0u.mongodb.net',
    targetColl: 'db-paid-test',
    badgeColor: '#4f46e5',
    badgeBg: '#eef2ff',
    badgeBorder: '#c7d2fe',
  },
  {
    id: 'free',
    name: '2. Open Free MCQ DB',
    cluster: 'TopMCQBD_DB_Free',
    host: 'topmcqbd.pixb7fx.mongodb.net',
    targetColl: 'db-free-test',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
  },
  {
    id: 'subjective',
    name: '3. Subjective MCQs DB',
    cluster: 'TopMCQBD_DB_Subjective',
    host: 'topmcqbd.3ifvd7c.mongodb.net',
    targetColl: 'db-subjective-test',
    badgeColor: '#9333ea',
    badgeBg: '#f3e8ff',
    badgeBorder: '#d8b4fe',
  },
  {
    id: 'live-exam',
    name: '4. Live Exam Engine DB',
    cluster: 'TopMCQBD_DB_Live_Exam',
    host: 'topmcqbd.ns1gpls.mongodb.net',
    targetColl: 'db-live-exam-test',
    badgeColor: '#0d9488',
    badgeBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
  },
  {
    id: 'written',
    name: '5. Written Exam DB',
    cluster: 'TopMCQBD_DB_written',
    host: 'topmcqbd.hfivdlt.mongodb.net',
    targetColl: 'db-written-test',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    badgeBorder: '#fde68a',
  },
  {
    id: 'question-bank',
    name: '6. Question Bank DB',
    cluster: 'TopMCQBD_DB_Question_Bank',
    host: 'topmcqbd.bexo18c.mongodb.net',
    targetColl: 'db-question-bank-test',
    badgeColor: '#ea580c',
    badgeBg: '#fff7ed',
    badgeBorder: '#fed7aa',
  },
];

export default function DbPagesApiPage() {
  return (
    <DbAuthGuard activeRoute="/db-connection/db-pages-api">
      <DbPagesApiContent />
    </DbAuthGuard>
  );
}

function DbPagesApiContent() {
  const [clusterData, setClusterData] = useState({});
  const [loadingAll, setLoadingAll] = useState(false);
  const [clusterLoading, setClusterLoading] = useState({});
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  // Multi-Row Add Data States per cluster: { [clusterId]: boolean }
  const [isAddingData, setIsAddingData] = useState({});
  const [newDataRows, setNewDataRows] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [editingId, setEditingId] = useState({});
  const [editText, setEditText] = useState({});

  // Drag-and-drop state: { clusterId, draggedIndex, dragOverIndex }
  const [dragState, setDragState] = useState({ clusterId: null, draggedIndex: null, dragOverIndex: null });

  const apiBaseDomain = 'https://topmcqbd.pages.dev';

  const formatDateTime = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return String(dateVal);
    }
  };

  const getApiEndpoint = useCallback((clusterId) => {
    const isClient = typeof window !== 'undefined';
    const isLocal = isClient && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    return isLocal ? `/api/db-test/${clusterId}` : `${apiBaseDomain}/api/db-test/${clusterId}`;
  }, []);

  // Fetch single cluster data
  const fetchSingleCluster = useCallback(async (clusterId) => {
    setClusterLoading((prev) => ({ ...prev, [clusterId]: true }));
    const endpoint = getApiEndpoint(clusterId);

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));

      setClusterData((prev) => ({
        ...prev,
        [clusterId]: {
          connected: res.ok && data.connected !== false,
          latencyMs: data.latencyMs ?? null,
          items: Array.isArray(data.items) ? data.items : [],
          collections: Array.isArray(data.collections) ? data.collections : [],
          cluster: data.cluster || clusterId,
          error: data.error || null,
        },
      }));
    } catch (err) {
      setClusterData((prev) => ({
        ...prev,
        [clusterId]: {
          connected: false,
          latencyMs: null,
          items: [],
          collections: [],
          error: err.message,
        },
      }));
    } finally {
      setClusterLoading((prev) => ({ ...prev, [clusterId]: false }));
    }
  }, [getApiEndpoint]);

  // Fetch all 6 clusters simultaneously
  const fetchAllClusters = useCallback(async () => {
    setLoadingAll(true);
    const promises = CLUSTERS.map((c) => fetchSingleCluster(c.id));
    await Promise.allSettled(promises);
    setLastCheckTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    setLoadingAll(false);
  }, [fetchSingleCluster]);

  useEffect(() => {
    fetchAllClusters();
  }, [fetchAllClusters]);

  // Multi-Row Add Data Handlers per cluster
  const openAddDataForm = (clusterId) => {
    setIsAddingData((prev) => ({ ...prev, [clusterId]: true }));
    setNewDataRows((prev) => ({ ...prev, [clusterId]: [{ text: '' }] }));
  };

  const closeAddDataForm = (clusterId) => {
    setIsAddingData((prev) => ({ ...prev, [clusterId]: false }));
    setNewDataRows((prev) => ({ ...prev, [clusterId]: [{ text: '' }] }));
  };

  const addNewDataRow = (clusterId) => {
    setNewDataRows((prev) => ({
      ...prev,
      [clusterId]: [...(prev[clusterId] || [{ text: '' }]), { text: '' }],
    }));
  };

  const updateNewDataRow = (clusterId, index, value) => {
    setNewDataRows((prev) => {
      const rows = [...(prev[clusterId] || [{ text: '' }])];
      rows[index] = { text: value };
      return { ...prev, [clusterId]: rows };
    });
  };

  const removeNewDataRow = (clusterId, index) => {
    setNewDataRows((prev) => {
      const rows = (prev[clusterId] || [{ text: '' }]).filter((_, i) => i !== index);
      if (rows.length === 0) {
        setIsAddingData((p) => ({ ...p, [clusterId]: false }));
        return { ...prev, [clusterId]: [{ text: '' }] };
      }
      return { ...prev, [clusterId]: rows };
    });
  };

  const saveAllNewData = async (clusterId) => {
    const rows = newDataRows[clusterId] || [];
    const validRows = rows.filter((r) => r.text && r.text.trim());
    if (validRows.length === 0) {
      showTopAlert('কমপক্ষে একটি বক্সে ডাটা বা টেক্সট লিখুন!', 'warning');
      return;
    }

    setSubmitting((prev) => ({ ...prev, [clusterId]: true }));
    const endpoint = getApiEndpoint(clusterId);
    let successCount = 0;

    try {
      for (const row of validRows) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: row.text.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data.error || 'ডাটা যুক্ত করতে সমস্যা হয়েছে।');
        }
        successCount++;
      }

      closeAddDataForm(clusterId);
      const targetCollName = CLUSTERS.find((c) => c.id === clusterId)?.targetColl || clusterId;
      showTopAlert(`✅ ${successCount} টি ডাটা সফলভাবে "${targetCollName}" কালেকশনে সংরক্ষিত হয়েছে!`, 'success');
      fetchSingleCluster(clusterId);
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
    } finally {
      setSubmitting((prev) => ({ ...prev, [clusterId]: false }));
    }
  };

  // Inline Edit Handlers
  const handleStartEdit = (clusterId, item) => {
    setEditingId((prev) => ({ ...prev, [clusterId]: item.id }));
    setEditText((prev) => ({ ...prev, [clusterId]: item.text || '' }));
  };

  const handleCancelEdit = (clusterId) => {
    setEditingId((prev) => ({ ...prev, [clusterId]: null }));
    setEditText((prev) => ({ ...prev, [clusterId]: '' }));
  };

  const handleSaveEdit = async (clusterId, id) => {
    const textVal = (editText[clusterId] || '').trim();
    if (!textVal) return;

    setSubmitting((prev) => ({ ...prev, [clusterId]: true }));
    const endpoint = getApiEndpoint(clusterId);

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: textVal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || 'আপডেট করা সম্ভব হয়নি।');

      handleCancelEdit(clusterId);
      showTopAlert('✅ টেক্সট সফলভাবে আপডেট করা হয়েছে!', 'success');
      fetchSingleCluster(clusterId);
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
    } finally {
      setSubmitting((prev) => ({ ...prev, [clusterId]: false }));
    }
  };

  // Delete Item Handler
  const handleDeleteItem = async (clusterId, id) => {
    const confirmed = await showTopAlert('আপনি কি নিশ্চিত এই টেক্সটটি মুছে ফেলতে চান?', 'warning', true);
    if (!confirmed) return;

    setSubmitting((prev) => ({ ...prev, [clusterId]: true }));
    const endpoint = getApiEndpoint(clusterId);

    try {
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || 'মুছে ফেলা সম্ভব হয়নি।');

      showTopAlert('🗑️ টেক্সট সফলভাবে মুছে ফেলা হয়েছে!', 'success');
      fetchSingleCluster(clusterId);
    } catch (err) {
      showTopAlert(`❌ ${err.message}`, 'danger');
    } finally {
      setSubmitting((prev) => ({ ...prev, [clusterId]: false }));
    }
  };

  // Drag & drop handlers
  const handleDragStart = (clusterId, idx) => {
    setDragState({ clusterId, draggedIndex: idx, dragOverIndex: null });
  };

  const handleDragOver = (e, clusterId, idx) => {
    e.preventDefault();
    if (dragState.clusterId === clusterId && dragState.dragOverIndex !== idx) {
      setDragState((prev) => ({ ...prev, dragOverIndex: idx }));
    }
  };

  const handleDrop = (e, clusterId, targetIdx) => {
    e.preventDefault();
    if (dragState.clusterId !== clusterId || dragState.draggedIndex === null || dragState.draggedIndex === targetIdx) {
      setDragState({ clusterId: null, draggedIndex: null, dragOverIndex: null });
      return;
    }

    const currentItems = [...(clusterData[clusterId]?.items || [])];
    const [moved] = currentItems.splice(dragState.draggedIndex, 1);
    currentItems.splice(targetIdx, 0, moved);

    setClusterData((prev) => ({
      ...prev,
      [clusterId]: {
        ...prev[clusterId],
        items: currentItems,
      },
    }));

    setDragState({ clusterId: null, draggedIndex: null, dragOverIndex: null });
    updateForm(clusterId, 'feedback', { type: 'info', text: 'ক্রম সফলভাবে সাজানো হয়েছে।' });
  };

  const copyApiUrl = () => {
    navigator.clipboard.writeText(`${apiBaseDomain}/api/db-test/paid`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <main className="pages-api-container">
      <div className="pages-api-wrapper">

        {/* BREADCRUMB */}
        <div className="breadcrumb-bar">
          <div className="breadcrumb-links">
            <Link href="/" className="bc-link">হোম</Link>
            <span className="bc-sep">/</span>
            <Link href="/db-connection" className="bc-link">DB Suite</Link>
            <span className="bc-sep">/</span>
            <span className="bc-active">Cloudflare Pages API Suite (All MongoDB)</span>
          </div>
        </div>

        {/* 1. TOP BOX: CONNECTED API STATUS & COPY URL */}
        <div className="top-api-master-box">
          <div className="top-box-left">
            <div className="api-badge-pill">
              <span className="live-dot" /> Cloudflare Pages Edge Gateway Live
            </div>
            <h1 className="api-master-title">
              Cloudflare Pages API — MongoDB Diagnostic & Control Suite
            </h1>
            <p className="api-master-desc">
              এই পেজের মাধ্যমে <strong>https://topmcqbd.pages.dev</strong> এপিআই ব্যবহার করে ৬টি MongoDB ক্লাস্টারের লাইভ কানেকশন চেক এবং টেক্সট ডাটা সরাসরি Add, Edit, Delete ও Drag-and-Drop করা যাবে।
            </p>

            <div className="api-meta-row">
              <div className="meta-pill">
                <span className="mp-label">API Host:</span>
                <span className="mp-val mono">topmcqbd.pages.dev</span>
              </div>
              <div className="meta-pill">
                <span className="mp-label">Runtime:</span>
                <span className="mp-val">Cloudflare Pages (V8 Isolate)</span>
              </div>
              <div className="meta-pill">
                <span className="mp-label">Active Endpoints:</span>
                <span className="mp-val">/api/db-test/* (GET, POST, PUT, DELETE)</span>
              </div>
            </div>
          </div>

          <div className="top-box-right">
            <div className="copy-action-box">
              <span className="copy-label">এপিআই চেক URL:</span>
              <div className="copy-field">
                <span className="copy-url-text">{apiBaseDomain}/api/db-test/paid</span>
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
            <div className="recheck-icon-circle">
              <i className={`fa-solid ${loadingAll ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'}`} />
            </div>
            <div>
              <h3 className="recheck-title">সবগুলো ডাটাবেজ কানেকশন ডায়াগনস্টিক ও রিফ্রেশ</h3>
              <p className="recheck-desc">Cloudflare Pages API ব্যবহার করে সবগুলো ৬টি MongoDB ক্লাস্টারের লাইভ কানেকশন ও পিং লেটেন্সি পুনরায় টেস্ট করুন</p>
            </div>
          </div>
          <div className="recheck-right">
            <button onClick={fetchAllClusters} disabled={loadingAll} className="btn-recheck-all-dedicated">
              <i className={`fa-solid ${loadingAll ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'}`} style={{ marginRight: '8px' }} />
              {loadingAll ? 'সবগুলো চেক হচ্ছে...' : 'সবগুলো ডাটাবেজ পুনরায় টেস্ট করুন'}
            </button>
            {lastCheckTime && (
              <span className="recheck-last-time">সর্বশেষ টেস্ট: {lastCheckTime}</span>
            )}
          </div>
        </div>

        {/* 2. SECOND SECTION: 6x MONGODB CONNECTION STATUS BOXES */}
        <div className="section-title-bar">
          <div className="sec-heading-group">
            <i className="fa-solid fa-network-wired" style={{ color: '#0284c7' }} />
            <h2>৬টি MongoDB ক্লাস্টারের লাইভ কানেকশন স্ট্যাটাস</h2>
          </div>
          <span className="sec-subtext">সবগুলো ডেডিকেটেড ক্লাস্টারের রিয়েল-টাইম পিং লেটেন্সি</span>
        </div>

        <div className="status-grid-6">
          {CLUSTERS.map((c) => {
            const data = clusterData[c.id];
            const isConn = data?.connected === true;
            const isLoading = clusterLoading[c.id] || loadingAll;

            return (
              <div key={c.id} className="status-box-card">
                <div className="sb-header">
                  <div className="sb-title-group">
                    <span className="sb-dot" style={{ backgroundColor: isConn ? '#10b981' : '#ef4444' }} />
                    <strong className="sb-name">{c.name}</strong>
                  </div>
                  <span className={`sb-pill ${isConn ? 'pill-green' : 'pill-red'}`}>
                    {isLoading ? 'চেকিং...' : isConn ? 'Connected' : 'Error'}
                  </span>
                </div>

                <div className="sb-body">
                  <div className="sb-row">
                    <span className="sb-lbl">ক্লাস্টার ডাটাবেজ:</span>
                    <span className="sb-val mono" style={{ color: c.badgeColor }}>{c.cluster}</span>
                  </div>
                  <div className="sb-row">
                    <span className="sb-lbl">টার্গেট কালেকশন:</span>
                    <span className="sb-val mono font-bold">{c.targetColl}</span>
                  </div>
                  <div className="sb-row">
                    <span className="sb-lbl">কানেকশন লেটেন্সি:</span>
                    <span className="sb-val latency-num">
                      {data?.latencyMs ? `${data.latencyMs} ms` : isLoading ? '...' : 'N/A'}
                    </span>
                  </div>
                  <div className="sb-row">
                    <span className="sb-lbl">মোট সংরক্ষিত টেক্সট:</span>
                    <span className="sb-val">{data?.items?.length ?? 0} টি আইটেম</span>
                  </div>
                </div>

                <button
                  onClick={() => fetchSingleCluster(c.id)}
                  disabled={isLoading}
                  className="sb-ping-btn"
                >
                  <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-bolt'}`} />
                  {isLoading ? 'টেস্ট হচ্ছে...' : 'পিং টেস্ট করুন'}
                </button>
              </div>
            );
          })}
        </div>

        {/* 3. THIRD SECTION: 6x CONTROL BOXES (ADD, EDIT, DELETE & DRAG-AND-DROP FOR EACH MONGODB) */}
        <div className="section-title-bar" style={{ marginTop: '40px' }}>
          <div className="sec-heading-group">
            <i className="fa-solid fa-sliders" style={{ color: '#059669' }} />
            <h2>৬টি MongoDB টেক্সট ম্যানেজমেন্ট ও কন্ট্রোল প্যানেল</h2>
          </div>
          <span className="sec-subtext">প্রতিটি কালেকশনের জন্য আলাদা Add, Edit, Delete ও Drag-and-Drop বক্স</span>
        </div>

        <div className="control-boxes-container">
          {CLUSTERS.map((c) => {
            const data = clusterData[c.id] || { items: [] };
            const items = data.items || [];
            const isAdding = Boolean(isAddingData[c.id]);

            return (
              <div key={c.id} className="cluster-control-panel">

                {/* Panel Header */}
                <div className="cc-header">
                  <div className="cc-title-left">
                    <span className="cc-badge-icon" style={{ backgroundColor: c.badgeBg, color: c.badgeColor, borderColor: c.badgeBorder }}>
                      <i className="fa-solid fa-database" />
                    </span>
                    <div>
                      <h3 className="cc-title">{c.name}</h3>
                      <p className="cc-subtitle">
                        ডাটাবেজ: <strong>{c.cluster}</strong> | টার্গেট কালেকশন: <code style={{ color: c.badgeColor }}>{c.targetColl}</code>
                      </p>
                    </div>
                  </div>

                  <div className="cc-header-actions">
                    <span className="cc-items-count-badge">
                      {items.length} টি টেক্সট রেকর্ড
                    </span>
                    <button
                      onClick={() => fetchSingleCluster(c.id)}
                      disabled={clusterLoading[c.id]}
                      className="cc-refresh-btn"
                      title="কালেকশন রিফ্রেশ করুন"
                    >
                      <i className={`fa-solid fa-arrows-rotate ${clusterLoading[c.id] ? 'fa-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 2-Column Split: Left Add/Multi-row & Right Live Texts */}
                <div className="cc-split-layout">

                  {/* LEFT: Add / Multi-Row Data Section */}
                  <div className="cc-form-panel">
                    <div className="cc-panel-head">
                      <h4 className="cc-panel-title">
                        <i className="fa-solid fa-layer-group" style={{ color: c.badgeColor, marginRight: '6px' }} />
                        ডাটা যোগ ও ব্যবস্থাপনা
                      </h4>
                      <span className="cc-panel-hint">
                        {c.targetColl} কালেকশনে সরাসরি সেভ হবে
                      </span>
                    </div>

                    {!isAdding ? (
                      <div className="add-btn-wrapper">
                        <button
                          type="button"
                          onClick={() => openAddDataForm(c.id)}
                          className="btn-add-main"
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
                          {(newDataRows[c.id] || [{ text: '' }]).map((row, rIdx) => (
                            <div key={rIdx} className="add-row-item">
                              <span className="row-num-badge">#{rIdx + 1}</span>
                              <input
                                type="text"
                                placeholder="এখানে যেকোনো টেক্সট বা টেস্ট ডাটা লিখুন..."
                                value={row.text}
                                onChange={(e) => updateNewDataRow(c.id, rIdx, e.target.value)}
                                className="add-row-input"
                                autoFocus={rIdx === (newDataRows[c.id] || []).length - 1}
                              />
                              <button
                                type="button"
                                onClick={() => removeNewDataRow(c.id, rIdx)}
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
                            onClick={() => addNewDataRow(c.id)}
                            className="btn-add-more-rows"
                          >
                            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }} /> আরো ডাটা যোগ করুন
                          </button>
                          <div className="save-cancel-group">
                            <button
                              type="button"
                              onClick={() => saveAllNewData(c.id)}
                              disabled={submitting[c.id]}
                              className="btn-save-all-rows"
                            >
                              <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }} />
                              {submitting[c.id] ? 'সেভ হচ্ছে...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => closeAddDataForm(c.id)}
                              className="btn-cancel-all-rows"
                            >
                              <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} /> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Live Texts List with Drag & Drop */}
                  <div className="cc-list-panel">
                    <div className="cc-panel-head">
                      <h4 className="cc-panel-title">
                        <i className="fa-solid fa-list-check" style={{ color: '#0284c7', marginRight: '6px' }} />
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
                          const isBeingEdited = editingId[c.id] === item.id;
                          const isDragTarget = dragState.clusterId === c.id && dragState.dragOverIndex === idx;

                          return (
                            <div
                              key={item.id || idx}
                              draggable={!isBeingEdited}
                              onDragStart={() => handleDragStart(c.id, idx)}
                              onDragOver={(e) => handleDragOver(e, c.id, idx)}
                              onDrop={(e) => handleDrop(e, c.id, idx)}
                              className={`item-row ${isBeingEdited ? 'item-editing' : ''} ${isDragTarget ? 'item-dragover' : ''}`}
                            >
                              {isBeingEdited ? (
                                <div className="edit-box-inline">
                                  <input
                                    type="text"
                                    value={editText[c.id] ?? ''}
                                    onChange={(e) => setEditText((p) => ({ ...p, [c.id]: e.target.value }))}
                                    className="edit-input"
                                    autoFocus
                                  />
                                  <div className="edit-btn-group">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(c.id, item.id)}
                                      disabled={submitting[c.id]}
                                      className="btn-save-inline"
                                    >
                                      <i className="fa-solid fa-check" style={{ marginRight: '4px' }} /> সেভ করুন
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelEdit(c.id)}
                                      className="btn-cancel-inline"
                                    >
                                      বাতিল
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="item-content">
                                    <div className="item-main-row">
                                      <span className="item-index">#{idx + 1}</span>
                                      <span className="item-text">{item.text}</span>
                                    </div>
                                    <div className="item-meta-row">
                                      <span className="item-time">
                                        <i className="fa-regular fa-clock" style={{ marginRight: '5px' }} />
                                        {formatDateTime(item.updatedAt || item.createdAt)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="item-actions">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(c.id, item)}
                                      className="action-btn edit-btn"
                                      title="সম্পাদনা করুন"
                                    >
                                      <i className="fa-solid fa-pen" style={{ marginRight: '5px' }} /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(c.id, item.id)}
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
            );
          })}
        </div>

        {/* Database Navigation Box */}
        <DbNavBox activeRoute="/db-connection/db-pages-api" />

        {/* Bottom Navigation Links Bar */}
        <div className="bottom-nav-row">
          <Link href="/" className="b-link">
            <i className="fa-solid fa-arrow-left" /> ওয়েবসাইট ভিজিট
          </Link>
          <Link href="/admin/dashboard" className="b-link">
            অ্যাডমিন প্যানেল <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>

      </div>

      <style jsx>{`
        .pages-api-container {
          min-height: 100vh;
          background-color: #f8fafc;
          padding: 30px 20px 80px;
          font-family: inherit;
          color: #0f172a;
        }

        .pages-api-wrapper {
          max-width: 1280px;
          margin: 0 auto;
        }

        .breadcrumb-bar {
          margin-bottom: 20px;
        }

        .breadcrumb-links {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13.5px;
        }

        :global(.bc-link) {
          color: #0284c7 !important;
          text-decoration: none !important;
          font-weight: 600;
        }

        .bc-sep { color: #94a3b8; }
        .bc-active { color: #0f172a; font-weight: 700; }

        /* 1. TOP BOX: API MASTER BOX */
        .top-api-master-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 28px 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 32px;
        }

        .top-box-left {
          flex: 1;
          min-width: 320px;
        }

        .api-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eff6ff;
          color: #0284c7;
          border: 1px solid #bfdbfe;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0284c7;
          box-shadow: 0 0 8px #0284c7;
        }

        .api-master-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          letter-spacing: -0.3px;
        }

        .api-master-desc {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 16px 0;
          max-width: 760px;
        }

        .api-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .meta-pill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .mp-label { color: #64748b; font-weight: 600; }
        .mp-val { color: #1e293b; font-weight: 700; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        .top-box-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          min-width: 280px;
        }

        .copy-action-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 14px;
          width: 100%;
          box-sizing: border-box;
        }

        .copy-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }

        .copy-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .copy-url-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #0284c7;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-copy {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .btn-copy:hover {
          background: #eff6ff;
          color: #0284c7;
          border-color: #93c5fd;
        }



        /* SECTION TITLE */
        .section-title-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 10px;
        }

        .sec-heading-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sec-heading-group h2 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .sec-subtext {
          font-size: 13px;
          color: #64748b;
        }

        /* 2. 6x STATUS BOXES GRID */
        .status-grid-6 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        @media (max-width: 1024px) {
          .status-grid-6 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .status-grid-6 {
            grid-template-columns: 1fr;
          }
        }

        .status-box-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .status-box-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }

        .sb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 8px;
        }

        .sb-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sb-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .sb-name {
          font-size: 14px;
          color: #0f172a;
        }

        .sb-pill {
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .pill-green { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .pill-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        .sb-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
          font-size: 12.5px;
        }

        .sb-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 4px;
          border-bottom: 1px dashed #f1f5f9;
        }

        .sb-lbl { color: #64748b; }
        .sb-val { color: #1e293b; }
        .latency-num { color: #059669; font-weight: 800; font-family: 'Outfit', sans-serif; }
        .font-bold { font-weight: 700; }

        .sb-ping-btn {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 7px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .sb-ping-btn:hover:not(:disabled) {
          background: #eff6ff;
          color: #0284c7;
          border-color: #93c5fd;
        }

        /* 3. 6x CONTROL BOXES */
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
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 18px;
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
          background: #eff6ff;
          color: #0284c7;
        }

        .cc-feedback-alert {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alert-success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .alert-info { background: #eff6ff; color: #0284c7; border: 1px solid #bfdbfe; }

        .cc-split-layout {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 20px;
          align-items: flex-start;
        }

        @media (max-width: 860px) {
          .cc-split-layout {
            grid-template-columns: 1fr;
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

        /* Dedicated Recheck Bar Box */
        .dedicated-recheck-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 20px;
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
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .recheck-title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 3px 0;
        }

        .recheck-desc {
          font-size: 12.5px;
          color: #64748b;
          margin: 0;
        }

        .recheck-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .btn-recheck-all-dedicated {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
        }

        .btn-recheck-all-dedicated:hover:not(:disabled) {
          background: #0369a1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
        }

        .recheck-last-time {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 600;
        }

        /* Items List matching dbquestionbank-admin */
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
          padding: 12px 16px;
          border-radius: 10px;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .item-row:hover {
          border-color: #93c5fd;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
        }

        .item-editing {
          border-color: #0284c7 !important;
          background: #eff6ff !important;
        }

        .item-dragover {
          border-top: 3px solid #0284c7 !important;
        }

        .item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .item-main-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .item-index {
          color: #0284c7;
          font-size: 13.5px;
          font-weight: 800;
        }

        .item-text {
          color: #1e293b;
          font-size: 14px;
          font-weight: 700;
          word-break: break-word;
        }

        .item-meta-row {
          font-size: 11.5px;
          color: #64748b;
        }

        .item-time {
          display: inline-flex;
          align-items: center;
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
          background: #eff6ff;
          color: #0284c7;
          border: 1px solid #bae6fd;
        }

        .edit-btn:hover {
          background: #0284c7;
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

        .bottom-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 24px;
          padding: 8px 4px 0;
          flex-wrap: wrap;
          gap: 12px;
        }

        :global(.b-link) {
          color: #0284c7 !important;
          text-decoration: none !important;
          font-weight: 700;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        :global(.b-link:hover) {
          text-decoration: underline !important;
        }
      `}</style>
    </main>
  );
}
