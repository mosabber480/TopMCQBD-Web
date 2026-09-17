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

export default function DbMainWorkersApiPage() {
  return (
    <DbAuthGuard activeRoute="/db-connection-api/db-main-workers-api">
      <DbMainWorkersApiContent />
    </DbAuthGuard>
  );
}

function DbMainWorkersApiContent() {
  const [clusterData, setClusterData] = useState({});
  const [loadingAll, setLoadingAll] = useState(false);
  const [clusterLoading, setClusterLoading] = useState({});
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [selectedClusterUrl, setSelectedClusterUrl] = useState('paid');
  const [copiedCluster, setCopiedCluster] = useState(null);
  const [showAllUrls, setShowAllUrls] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  // Multi-Row Add Data States per cluster: { [clusterId]: boolean }
  const [isAddingData, setIsAddingData] = useState({});
  const [newDataRows, setNewDataRows] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [editingId, setEditingId] = useState({});
  const [editText, setEditText] = useState({});

  // Drag-and-drop state: { clusterId, draggedIndex, dragOverIndex }
  const [dragState, setDragState] = useState({ clusterId: null, draggedIndex: null, dragOverIndex: null });
  // Pending reorder floating action bar state: { clusterId, backupItems }
  const [pendingReorder, setPendingReorder] = useState(null);
  // Delete confirmation floating action bar state: { clusterId, id }
  const [pendingDelete, setPendingDelete] = useState(null);
  // Refresh feedback state per cluster: { [clusterId]: { type: 'loading' | 'success' | 'error', msg: string } }
  const [refreshFeedback, setRefreshFeedback] = useState({});

  const apiBaseDomain = 'https://topmcqbd-web-test-api.mosabber480.workers.dev';

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

  const getApiEndpoint = useCallback((clusterId) => {
    return `${apiBaseDomain}/api/db-test/${clusterId}`;
  }, []);

  // Fetch single cluster data from Main Worker API (mosabber480)
  const fetchSingleCluster = useCallback(async (clusterId, showNotification = false) => {
    setClusterLoading((prev) => ({ ...prev, [clusterId]: true }));
    if (showNotification) {
      setRefreshFeedback((prev) => ({ ...prev, [clusterId]: { type: 'loading', msg: 'রিফ্রেশ হচ্ছে...' } }));
    }
    const endpoint = getApiEndpoint(clusterId);
    const cObj = CLUSTERS.find((c) => c.id === clusterId);
    const cName = cObj ? cObj.name : clusterId;

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      const isConnected = res.ok && data.connected !== false;
      const items = Array.isArray(data.items) ? data.items : [];
      const latency = data.latencyMs ?? null;

      setClusterData((prev) => ({
        ...prev,
        [clusterId]: {
          connected: isConnected,
          latencyMs: latency,
          items,
          collections: Array.isArray(data.collections) ? data.collections : [],
          cluster: data.cluster || clusterId,
          error: data.error || null,
        },
      }));

      if (showNotification) {
        if (isConnected) {
          // Success: No top alert popup, show inline feedback inside card
          setRefreshFeedback((prev) => ({ ...prev, [clusterId]: { type: 'success', msg: `✓ রিফ্রেশ সফল (${items.length}টি রেকর্ড)` } }));
        } else {
          showTopAlert(`❌ ${cName}: রিফ্রেশ ব্যর্থ হয়েছে (${data.error || 'কানেকশন এরর'})`, 'danger');
          setRefreshFeedback((prev) => ({ ...prev, [clusterId]: { type: 'error', msg: '✕ রিফ্রেশ ব্যর্থ' } }));
        }
        setTimeout(() => {
          setRefreshFeedback((prev) => ({ ...prev, [clusterId]: null }));
        }, 3500);
      }
      return isConnected;
    } catch (err) {
      // Diagnostic Isolation Rule: No silent fallback to local/render APIs!
      // If Cloudflare Worker fails or is offline, show explicit error and disconnected state.
      setClusterData((prev) => ({
        ...prev,
        [clusterId]: {
          connected: false,
          latencyMs: null,
          items: [],
          collections: [],
          cluster: clusterId,
          error: err.message || 'Worker API Connection Failed',
        },
      }));
      if (showNotification) {
        showTopAlert(`❌ ${cName}: Worker রিফ্রেশ এরর - ${err.message}`, 'danger');
        setRefreshFeedback((prev) => ({ ...prev, [clusterId]: { type: 'error', msg: `✕ এরর: ${err.message}` } }));
        setTimeout(() => {
          setRefreshFeedback((prev) => ({ ...prev, [clusterId]: null }));
        }, 3500);
      }
      return false;
    } finally {
      setClusterLoading((prev) => ({ ...prev, [clusterId]: false }));
    }
  }, [getApiEndpoint]);

  // Fetch all 6 clusters
  const fetchAllClusters = useCallback(async (notify = false) => {
    setLoadingAll(true);
    const promises = CLUSTERS.map((c) => fetchSingleCluster(c.id, false));
    const results = await Promise.allSettled(promises);
    setLastCheckTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    setLoadingAll(false);
    if (notify === true) {
      const failed = results.filter((r) => r.status === 'rejected' || r.value === false);
      if (failed.length > 0) {
        showTopAlert(`❌ ${failed.length}টি ক্লাস্টারে রিফ্রেশ ব্যর্থ হয়েছে! অনুগ্রহ করে নিচের বক্সগুলো দেখুন।`, 'danger');
      }
    }
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

  // Delete Item Handlers (Bottom Floating Action Bar)
  const handlePromptDelete = (clusterId, id) => {
    setPendingDelete({ clusterId, id });
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { clusterId, id } = pendingDelete;

    setSubmitting((prev) => ({ ...prev, [clusterId]: true }));
    const endpoint = getApiEndpoint(clusterId);

    try {
      const deleteUrl = endpoint.includes('?')
        ? `${endpoint}&id=${encodeURIComponent(id)}`
        : `${endpoint}?id=${encodeURIComponent(id)}`;
      const res = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || 'মুছে ফেলা সম্ভব হয়নি।');

      setPendingDelete(null);
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

    // Save backup of original items before first reorder
    if (!pendingReorder || pendingReorder.clusterId !== clusterId) {
      setPendingReorder({
        clusterId,
        backupItems: [...currentItems],
      });
    }

    // Immediately reorder items so user visually sees the change
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
  };

  const handleSaveReorder = () => {
    if (!pendingReorder) return;
    const clusterInfo = CLUSTERS.find((c) => c.id === pendingReorder.clusterId);
    showTopAlert(`✅ ${clusterInfo?.name || 'কালেকশন'}-এর নতুন ক্রম সফলভাবে সেভ করা হয়েছে!`, 'success');
    setPendingReorder(null);
  };

  const handleCancelReorder = () => {
    if (!pendingReorder) return;
    setClusterData((prev) => ({
      ...prev,
      [pendingReorder.clusterId]: {
        ...prev[pendingReorder.clusterId],
        items: pendingReorder.backupItems,
      },
    }));
    setPendingReorder(null);
  };

  const copyApiUrl = (clusterId = selectedClusterUrl) => {
    const url = `${apiBaseDomain}/api/db-test/${clusterId}`;
    navigator.clipboard.writeText(url);
    setCopiedCluster(clusterId);
    setCopiedUrl(true);
    setTimeout(() => {
      setCopiedUrl(false);
      setCopiedCluster(null);
    }, 2000);
  };

  return (
    <main className="workers-api-container">
      <div className="workers-api-wrapper">

        {/* BREADCRUMB */}
        <div className="breadcrumb-bar">
          <div className="breadcrumb-links">
            <Link href="/" className="bc-link">হোম</Link>
            <span className="bc-sep">/</span>
            <Link href="/db-connection" className="bc-link">DB Suite</Link>
            <span className="bc-sep">/</span>
            <span className="bc-active">Cloudflare Main Worker Test API Suite (mosabber480)</span>
          </div>
        </div>

        {/* 1. TOP BOX: CONNECTED API STATUS & COPY URL */}
        <div className="top-api-master-box">
          <div className="top-box-left">
            <div className="api-badge-pill">
              <span className="live-dot" /> Cloudflare Worker 24/7 Redundant API
            </div>
            <h1 className="api-master-title">
              Cloudflare Main Worker API (mosabber480) — MongoDB Diagnostic & Control Suite
            </h1>
            <p className="api-master-desc">
              এই পেজের মাধ্যমে <strong>https://topmcqbd-web-test-api.mosabber480.workers.dev</strong> ব্যাকআপ এপিআই ব্যবহার করে ৬টি MongoDB ক্লাস্টারের লাইভ কানেকশন চেক এবং টেক্সট ডাটা সরাসরি Add, Edit, Delete ও Drag-and-Drop করা যাবে।
            </p>

            <div className="api-meta-row">
              <div className="meta-pill">
                <span className="mp-label">Worker Host:</span>
                <span className="mp-val mono">topmcqbd-backup-api.mosabber5266.workers.dev</span>
              </div>
              <div className="meta-pill">
                <span className="mp-label">Runtime:</span>
                <span className="mp-val">Edge / V8 Isolate (Direct TCP)</span>
              </div>
              <div className="meta-pill">
                <span className="mp-label">Active Endpoints:</span>
                <span className="mp-val">/api/db-test/* (GET, POST, PUT, DELETE)</span>
              </div>
            </div>
          </div>

          <div className="top-box-bottom">
            <div className="copy-action-box">
              <div className="copy-box-header">
                <span className="copy-label">
                  <i className="fa-solid fa-link" style={{ marginRight: '6px', color: '#059669' }} />
                  ৬টি MongoDB ক্লাস্টারের ব্যাকআপ এপিআই চেক URL:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllUrls(!showAllUrls)}
                  className="btn-toggle-all-urls"
                >
                  <i className={`fa-solid ${showAllUrls ? 'fa-chevron-up' : 'fa-list-check'}`} style={{ marginRight: '6px' }} />
                  {showAllUrls ? 'তালিকা গুটিয়ে ফেলুন' : '৬টি URL একসাথে দেখুন'}
                </button>
              </div>

              {/* Cluster Selector Tabs */}
              <div className="cluster-url-selector-tabs">
                {CLUSTERS.map((c) => {
                  const isSelected = selectedClusterUrl === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClusterUrl(c.id)}
                      className={`cluster-url-tab ${isSelected ? 'active' : ''}`}
                      style={{
                        borderColor: isSelected ? c.badgeColor : '#cbd5e1',
                        color: isSelected ? c.badgeColor : '#475569',
                        backgroundColor: isSelected ? c.badgeBg : '#ffffff',
                      }}
                    >
                      <i className="fa-solid fa-database" style={{ fontSize: '11px', marginRight: '5px' }} />
                      <span>{c.name.split('.')[1]?.trim() || c.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Selected Cluster URL */}
              <div className="copy-field">
                <div className="copy-url-wrapper">
                  <span className="copy-badge" style={{
                    backgroundColor: CLUSTERS.find((c) => c.id === selectedClusterUrl)?.badgeBg || '#ecfdf5',
                    color: CLUSTERS.find((c) => c.id === selectedClusterUrl)?.badgeColor || '#059669',
                    border: `1px solid ${CLUSTERS.find((c) => c.id === selectedClusterUrl)?.badgeBorder || '#a7f3d0'}`
                  }}>
                    {CLUSTERS.find((c) => c.id === selectedClusterUrl)?.cluster}
                  </span>
                  <span className="copy-url-text">
                    {apiBaseDomain}/api/db-test/{selectedClusterUrl}
                  </span>
                </div>
                <button
                  onClick={() => copyApiUrl(selectedClusterUrl)}
                  className="btn-copy"
                  title="এই URL কপি করুন"
                >
                  <i className={`fa-solid ${copiedUrl && (!copiedCluster || copiedCluster === selectedClusterUrl) ? 'fa-check' : 'fa-copy'}`} />
                  {copiedUrl && (!copiedCluster || copiedCluster === selectedClusterUrl) ? 'কপি হয়েছে' : 'কপি'}
                </button>
              </div>

              {/* Expandable All 6 URLs List */}
              {showAllUrls && (
                <div className="all-urls-grid">
                  {CLUSTERS.map((c, idx) => {
                    const cUrl = `${apiBaseDomain}/api/db-test/${c.id}`;
                    const isCopied = copiedUrl && copiedCluster === c.id;
                    return (
                      <div key={c.id} className="all-url-card">
                        <div className="auc-info">
                          <div className="auc-title-row">
                            <span className="auc-num" style={{ backgroundColor: c.badgeBg, color: c.badgeColor, border: `1px solid ${c.badgeBorder}` }}>
                              {idx + 1}
                            </span>
                            <strong className="auc-name">{c.name}</strong>
                            <span className="auc-db-name mono" style={{ color: c.badgeColor }}>
                              ({c.cluster})
                            </span>
                          </div>
                          <code className="auc-url mono">{cUrl}</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyApiUrl(c.id)}
                          className={`btn-copy-sm ${isCopied ? 'copied' : ''}`}
                        >
                          <i className={`fa-solid ${isCopied ? 'fa-check' : 'fa-copy'}`} style={{ marginRight: '4px' }} />
                          {isCopied ? 'কপি হয়েছে' : 'কপি'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1.5 DEDICATED RECHECK BAR BOX */}
        {(() => {
          const connectedCount = CLUSTERS.filter((c) => clusterData[c.id]?.connected).length;
          const allConn = connectedCount === CLUSTERS.length && CLUSTERS.length > 0;
          const latencies = CLUSTERS.map((c) => clusterData[c.id]?.latencyMs).filter((l) => typeof l === 'number');
          const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

          return (
            <div className="dedicated-recheck-box">
              <div className="recheck-left">
                <div className="recheck-icon-circle" style={{ background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe' }}>
                  <i className={`fa-solid ${loadingAll ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'}`} />
                </div>
                <div className="recheck-texts">
                  <h3 className="recheck-title">লাইভ কানেকশন টেস্ট ও স্ট্যাটাস রিফ্রেশ</h3>
                  <p className="recheck-desc">
                    সর্বশেষ চেক: {lastCheckTime || 'লোড হচ্ছে...'}
                  </p>
                </div>
              </div>

              <div className="recheck-right">
                <div
                  className="recheck-status-badge"
                  style={{
                    background: allConn ? '#ecfdf5' : '#fef2f2',
                    color: allConn ? '#059669' : '#dc2626',
                    border: `1px solid ${allConn ? '#a7f3d0' : '#fecaca'}`,
                  }}
                >
                  <span
                    className={`recheck-dot ${allConn ? 'dot-connected' : 'dot-disconnected'}`}
                  />
                  <span>{allConn ? 'All Connected' : `${connectedCount}/${CLUSTERS.length} Connected`}</span>
                </div>

                <div className="recheck-latency-badge">
                  <i className="fa-solid fa-bolt" style={{ color: '#475569', fontSize: '11px' }} />
                  <span>{avgLatency ? `${avgLatency} ms avg` : '— ms'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => fetchAllClusters(true)}
                  disabled={loadingAll}
                  className="btn-recheck-all-dedicated"
                  style={{ background: '#4f46e5', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)' }}
                >
                  <i className={`fa-solid ${loadingAll ? 'fa-spinner fa-spin' : 'fa-arrows-rotate'}`} style={{ marginRight: '7px' }} />
                  {loadingAll ? 'চেক হচ্ছে...' : 'পুনরায় চেক করুন'}
                </button>
              </div>
            </div>
          );
        })()}

        {/* 2. SECOND SECTION: 6x MONGODB CONNECTION STATUS BOXES */}
        <div className="section-title-bar">
          <div className="sec-heading-group">
            <i className="fa-solid fa-network-wired" style={{ color: '#4f46e5' }} />
            <h2>৬টি MongoDB ক্লাস্টারের লাইভ কানেকশন স্ট্যাটাস (Worker API)</h2>
          </div>
          <span className="sec-subtext">Main Worker API (mosabber480)-র মাধ্যমে সরাসরি TCP সকেটে পিং লেটেন্সি</span>
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
                    <strong className="sb-name">{c.name}</strong>
                  </div>
                  <div className={`status-pill ${isConn ? 'pill-success' : 'pill-danger'}`}>
                    <span className="status-dot" />
                    <span style={{ transform: 'translateY(0.5px)', display: 'inline-flex', alignItems: 'center' }}>
                      {isLoading ? 'Checking...' : isConn ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
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
                  onClick={() => fetchSingleCluster(c.id, true)}
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
            <i className="fa-solid fa-sliders" style={{ color: '#4f46e5' }} />
            <h2>৬টি MongoDB টেক্সট কন্ট্রোল প্যানেল (Worker API)</h2>
          </div>
          <span className="sec-subtext">Main Worker API (mosabber480) দিয়ে প্রতিটি কালেকশনের ডাটা সরাসরি Add, Edit, Delete ও Drag-and-Drop</span>
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
                      <i className="fa-solid fa-bolt" />
                    </span>
                    <div>
                      <h3 className="cc-title">{c.name}</h3>
                      <p className="cc-subtitle">
                        ডাটাবেজ: <strong>{c.cluster}</strong> | টার্গেট কালেকশন: <code style={{ color: c.badgeColor }}>{c.targetColl}</code>
                      </p>
                    </div>
                  </div>

                  <div className="cc-header-actions">
                    {refreshFeedback[c.id] && (
                      <span className={`cc-refresh-toast toast-${refreshFeedback[c.id].type}`}>
                        {refreshFeedback[c.id].type === 'loading' && <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '5px' }} />}
                        {refreshFeedback[c.id].type === 'success' && <i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }} />}
                        {refreshFeedback[c.id].type === 'error' && <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '5px' }} />}
                        {refreshFeedback[c.id].msg}
                      </span>
                    )}
                    <span className="cc-items-count-badge">
                      {items.length} টি টেক্সট রেকর্ড
                    </span>
                    <button
                      onClick={() => fetchSingleCluster(c.id, true)}
                      disabled={clusterLoading[c.id]}
                      className="cc-refresh-btn"
                      title="কালেকশন রিফ্রেশ করুন"
                    >
                      <i className={`fa-solid fa-arrows-rotate ${clusterLoading[c.id] ? 'fa-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Raw / Collections List Full-Width Box below Header */}
                <div className="cc-header-collections">
                  <span className="box-title">
                    <i className="fa-solid fa-database" style={{ marginRight: '5px', fontSize: '10px' }} />
                    রো কালেকশন তালিকা ({data?.collections?.length || 0}):
                  </span>
                  <div className="tags-container">
                    {data?.collections && data.collections.length > 0 ? (
                      data.collections.map((col, idx) => (
                        <span key={idx} className="col-tag">{col}</span>
                      ))
                    ) : (
                      <span className="col-tag-empty">
                        {clusterLoading[c.id] ? 'লোড হচ্ছে...' : 'কোনো কালেকশন পাওয়া যায়নি'}
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
                        <i className="fa-solid fa-layer-group" style={{ color: c.badgeColor, marginRight: '6px' }} />
                        ডাটা যোগ ও ব্যবস্থাপনা
                      </h4>
                      <span className="cc-panel-hint">
                        Main Worker API (mosabber480) হয়ে {c.targetColl} কালেকশনে সেভ হবে
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

                  {/* Dotted Divider between Left & Right Panels */}
                  <div className="cc-panel-dotted-divider" />

                  {/* RIGHT: Live Texts List with Drag & Drop */}
                  <div className="cc-list-panel">
                    <div className="cc-panel-head">
                      <h4 className="cc-panel-title">
                        <i className="fa-solid fa-list-check" style={{ color: '#4f46e5', marginRight: '6px' }} />
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
                                  <div className="item-row-left">
                                    <span className="drag-handle-icon" title="মাউস দিয়ে ড্র্যাগ করে ক্রম পরিবর্তন করুন">
                                      <i className="fa-solid fa-grip-vertical" />
                                    </span>

                                    <div className="item-content">
                                      <div className="item-title-row">
                                        <span className="item-index">#{idx + 1}</span>
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
                                      onClick={() => handleStartEdit(c.id, item)}
                                      className="action-btn edit-btn"
                                      title="সম্পাদনা করুন"
                                    >
                                      <i className="fa-solid fa-pen" style={{ marginRight: '5px' }} /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePromptDelete(c.id, item.id)}
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
        <DbNavBox activeRoute="/db-connection-api/db-main-workers-api" />

        {/* Bottom Navigation Links Bar */}
        <div className="bottom-nav-row">
          <Link href="/" className="b-link">
            <i className="fa-solid fa-arrow-left" /> ওয়েবসাইট ভিজিট
          </Link>
          <Link href="/admin/dashboard" className="b-link">
            অ্যাডমিন প্যানেল <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>

        {/* Drag & Drop Floating Save Action Bar matching user attachment */}
        {pendingReorder && (
          <div id="reorder-action-bar">
            <span className="reorder-bar-text">
              আপনি টেক্সটের ক্রম পরিবর্তন করেছেন। সেভ করতে বোতাম চাপুন।
            </span>
            <button
              type="button"
              className="btn btn-submit"
              onClick={handleSaveReorder}
            >
              <i className="fa-solid fa-floppy-disk" style={{ marginRight: '6px' }} /> পরিবর্তন সেভ করুন
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancelReorder}
            >
              <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} /> বাতিল করুন
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
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={submitting[pendingDelete.clusterId]}
            >
              <i className="fa-solid fa-trash-can" style={{ marginRight: '6px' }} /> {submitting[pendingDelete.clusterId] ? 'মুছে ফেলা হচ্ছে...' : 'মুছে ফেলুন'}
            </button>
            <button
              type="button"
              className="btn btn-cancel-gray"
              onClick={handleCancelDelete}
              disabled={submitting[pendingDelete.clusterId]}
            >
              <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} /> বাতিল করুন
            </button>
          </div>
        )}

      </div>

      <style jsx>{`
        .workers-api-container {
          min-height: 100vh;
          background-color: #f8fafc;
          padding: 30px 20px 80px;
          font-family: inherit;
          color: #0f172a;
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
          font-size: 13.5px;
        }

        :global(.bc-link) {
          color: #4f46e5 !important;
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
          flex-direction: column;
          gap: 20px;
          margin-bottom: 32px;
        }

        .top-box-left {
          width: 100%;
          min-width: 0;
        }

        .api-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4f46e5;
          box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.65);
          animation: liveDotPulseWorker 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
          display: inline-block;
          flex-shrink: 0;
        }

        @keyframes liveDotPulseWorker {
          0% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.65);
          }
          70% {
            box-shadow: 0 0 0 5px rgba(79, 70, 229, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
          }
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

        .top-box-bottom {
          width: 100%;
        }

        .copy-action-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px 18px;
          width: 100%;
          box-sizing: border-box;
        }

        .copy-box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .btn-toggle-all-urls {
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-toggle-all-urls:hover {
          background: #a7f3d0;
          color: #047857;
        }

        .cluster-url-selector-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .cluster-url-tab {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cluster-url-tab:hover {
          filter: brightness(0.96);
          transform: translateY(-1px);
        }

        .cluster-url-tab.active {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          font-weight: 700;
        }

        .copy-url-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .copy-badge {
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          white-space: nowrap;
        }

        .all-urls-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px dashed #cbd5e1;
        }

        .all-url-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .auc-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }

        .auc-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .auc-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
        }

        .auc-name {
          color: #1e293b;
        }

        .auc-db-name {
          font-size: 11px;
          font-weight: 600;
        }

        .auc-url {
          font-size: 12px;
          color: #059669;
          background: #f8fafc;
          padding: 2px 6px;
          border-radius: 4px;
          word-break: break-all;
        }

        .btn-copy-sm {
          display: inline-flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .btn-copy-sm:hover {
          background: #f1f5f9;
        }

        .btn-copy-sm.copied {
          background: #ecfdf5;
          color: #059669;
          border-color: #a7f3d0;
        }

        .copy-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          display: block;
          margin-bottom: 5px;
          letter-spacing: 0.3px;
        }

        .copy-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .copy-url-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #4f46e5;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
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
          background: #eef2ff;
          color: #4f46e5;
          border-color: #c7d2fe;
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

        .sb-name {
          font-size: 14px;
          color: #0f172a;
          font-weight: 700;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
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
          flex-shrink: 0;
          display: inline-block;
        }

        .pill-success .status-dot {
          background-color: #16a34a;
          box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.65);
          animation: statusDotPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        .pill-danger .status-dot {
          background-color: #dc2626;
        }

        @keyframes statusDotPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.65);
          }
          70% {
            box-shadow: 0 0 0 5px rgba(22, 163, 74, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
          }
        }

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
          background: #eef2ff;
          color: #4f46e5;
          border-color: #c7d2fe;
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
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
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
        .alert-info { background: #eff6ff; color: #4f46e5; border: 1px solid #bfdbfe; }

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
          gap: 7px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .recheck-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .recheck-dot.dot-connected {
          background: #059669;
          box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.65);
          animation: recheckDotPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }

        .recheck-dot.dot-disconnected {
          background: #dc2626;
        }

        @keyframes recheckDotPulse {
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
          padding: 10px 16px;
          border-radius: 10px;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .item-row:hover {
          border-color: #c7d2fe;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
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
          color: #4f46e5 !important;
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

        /* Drag Handle Icon */
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

        .item-row {
          cursor: grab;
        }

        .item-row:active {
          cursor: grabbing;
        }

        /* Drag & Drop Floating Action Bar matching attachment */
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
          border-bottom: none;
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
          border-bottom: none;
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
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        .btn-delete-cancel:hover {
          background: #27272a;
        }

        .btn-cancel-gray {
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
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }

        .btn-cancel-gray:hover {
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

        /* Responsive Mobile Layout Polish */
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

        @media (max-width: 768px) {
          .cluster-control-panel {
            padding: 14px;
            border-radius: 12px;
          }

          .cc-split-layout {
            flex-direction: column;
            gap: 16px;
          }

          .cc-panel-dotted-divider {
            display: none;
          }

          .cc-form-panel,
          .cc-list-panel {
            padding: 14px;
            border-radius: 12px;
            width: 100%;
            box-sizing: border-box;
          }

          .add-btn-wrapper {
            width: 100%;
          }

          .btn-add-main {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px 16px !important;
            box-sizing: border-box !important;
          }

          .add-row-item {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .add-row-input {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          .btn-row-delete {
            width: 100% !important;
            justify-content: center !important;
            padding: 9px 12px !important;
            box-sizing: border-box !important;
          }

          .add-rows-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            width: 100%;
          }

          .btn-add-more-rows {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px 16px !important;
            box-sizing: border-box !important;
          }

          .save-cancel-group {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .btn-save-all-rows,
          .btn-cancel-all-rows {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px 16px !important;
            box-sizing: border-box !important;
          }

          .item-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            padding: 12px;
          }

          .item-row-left {
            width: 100%;
            align-items: flex-start;
            gap: 10px;
          }

          .item-content {
            width: 100%;
            min-width: 0;
          }

          .item-text {
            word-break: break-word;
            font-size: 14px;
            line-height: 1.4;
          }

          .item-actions {
            display: flex;
            flex-direction: row;
            width: 100%;
            gap: 8px;
            padding-top: 8px;
            border-top: 1px dashed #e2e8f0;
          }

          .action-btn {
            flex: 1 1 50%;
            width: 50% !important;
            justify-content: center !important;
            padding: 9px 12px !important;
            font-size: 13px !important;
            height: 38px !important;
            box-sizing: border-box !important;
          }

          .edit-box-inline {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            width: 100%;
          }

          .edit-input {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          .edit-btn-group {
            width: 100%;
            display: flex;
            flex-direction: row;
            gap: 8px;
          }

          .btn-save-inline,
          .btn-cancel-inline {
            flex: 1 1 50%;
            width: 50% !important;
            justify-content: center !important;
            padding: 9px 12px !important;
            font-size: 13px !important;
            height: 38px !important;
            box-sizing: border-box !important;
          }

          .dedicated-recheck-box {
            padding: 14px;
            flex-direction: column;
            align-items: stretch;
          }

          .recheck-right {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .btn-recheck-all-dedicated,
          .btn-header-recheck {
            width: 100% !important;
            justify-content: center !important;
            padding: 10px 16px !important;
            box-sizing: border-box !important;
          }

          #reorder-action-bar,
          #delete-action-bar {
            flex-direction: column;
            gap: 10px;
            padding: 12px 16px;
            text-align: center;
          }

          .btn-submit,
          .btn-danger,
          .btn-delete-confirm,
          .btn-delete-cancel,
          .btn-cancel-gray {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px 16px !important;
            box-sizing: border-box !important;
          }

          .bottom-nav-row,
          .bottom-nav-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            width: 100%;
          }

          .bottom-nav-link,
          :global(.b-link) {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px 16px !important;
            border-radius: 8px !important;
            border: 1px solid #cbd5e1 !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
            text-align: center !important;
          }
        }
      `}</style>
    </main>
  );
}
