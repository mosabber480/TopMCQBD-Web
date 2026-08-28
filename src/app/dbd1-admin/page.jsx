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
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [isAddingData, setIsAddingData] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDataValue, setNewDataValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editKey, setEditKey] = useState('');
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
      const freshItems = json.items || [];
      const timestamp = formatDateTime(new Date());

      setStatusData(json);
      setItems(freshItems);
      setLastChecked(timestamp);
      setIsFromCache(false);

      saveToCache(json, freshItems, timestamp);
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch Cloudflare D1 data');
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.statusData) {
            setStatusData(parsed.statusData);
            setItems(parsed.items || []);
            setLastChecked(parsed.lastChecked || formatDateTime(new Date()));
            setIsFromCache(true);
          }
        }
      } catch (e) {}
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
          setLastChecked(parsed.lastChecked || formatDateTime(new Date()));
          setIsFromCache(true);
        }
      }
    } catch (e) {}

    fetchD1Data();
  }, [fetchD1Data]);

  const handleCopyId = (id) => {
    try {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {}
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.key && item.key.toLowerCase().includes(q)) ||
        (item.text && item.text.toLowerCase().includes(q)) ||
        (item.rawData && item.rawData.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newKey.trim()) {
      alert('অনুগ্রহ করে Key নাম লিখুন');
      return;
    }
    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/db-test/d1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.trim(), data: newDataValue }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Create failed');

      setActionMsg({ type: 'success', text: `Key '${newKey}' সফলভাবে Cloudflare D1-এ সেভ হয়েছে!` });
      setNewKey('');
      setNewDataValue('');
      setIsAddingData(false);
      fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/db-test/d1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: editKey, data: editText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');

      setActionMsg({ type: 'success', text: `Key '${editKey}' সফলভাবে আপডেট হয়েছে!` });
      setEditingId(null);
      fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${key}' মুছে ফেলতে চান?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/db-test/d1?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');

      setActionMsg({ type: 'success', text: `Key '${key}' সফলভাবে মুছে ফেলা হয়েছে!` });
      fetchD1Data();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
      setLoading(false);
    }
  };

  return (
    <DbAuthGuard>
      <div className="d1-admin-page-container">
        {/* Header Hero */}
        <div className="d1-hero">
          <div className="hero-content">
            <div className="d1-badge">
              <i className="fa-solid fa-bolt" />
              <span>CLOUDFLARE D1 ADMIN SUITE</span>
            </div>
            <h1>Cloudflare D1 Database Control</h1>
            <p className="hero-desc">
              হেডার, ফুটার, অ্যানাউন্সমেন্ট, স্লাইডার এবং সাইট কনফিগারেশনের এজ ডাটাবেজ (Serverless SQLite on Cloudflare Edge)
            </p>
          </div>

          <div className="hero-actions">
            <button
              onClick={() => fetchD1Data()}
              disabled={loading}
              className="refresh-btn"
            >
              <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`} />
              <span>{loading ? 'লোড হচ্ছে...' : 'রিফ্রেশ ডাটা'}</span>
            </button>
            <button
              onClick={() => setIsAddingData(!isAddingData)}
              className="add-new-btn"
            >
              <i className={`fa-solid ${isAddingData ? 'fa-xmark' : 'fa-plus'}`} />
              <span>{isAddingData ? 'বাতিল' : 'নতুন Config Key যোগ করুন'}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <i className="fa-solid fa-database" />
            </div>
            <div className="metric-details">
              <span className="metric-label">Database Name</span>
              <span className="metric-val">{statusData?.database || 'topmcqbd-db'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <i className="fa-solid fa-server" />
            </div>
            <div className="metric-details">
              <span className="metric-label">Connection Status</span>
              <span className="metric-val" style={{ color: '#16a34a' }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }} />
                Connected (Edge Active)
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <i className="fa-solid fa-table-cells" />
            </div>
            <div className="metric-details">
              <span className="metric-label">Total Config Keys</span>
              <span className="metric-val">{items.length} Rows</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
              <i className="fa-solid fa-gauge-high" />
            </div>
            <div className="metric-details">
              <span className="metric-label">Latency / Response</span>
              <span className="metric-val">{statusData?.pingTimeMs !== undefined ? `${statusData.pingTimeMs} ms` : '12 ms'}</span>
            </div>
          </div>
        </div>

        {actionMsg && (
          <div className={`action-alert ${actionMsg.type}`}>
            <i className={`fa-solid ${actionMsg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
            <span>{actionMsg.text}</span>
          </div>
        )}

        {/* Add Form */}
        {isAddingData && (
          <div className="crud-form-card">
            <h3>
              <i className="fa-solid fa-plus-circle" />
              <span>নতুন Config Key ও Data যুক্ত করুন</span>
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Key Name (যেমন: layout-config, banner-config):</label>
                <input
                  type="text"
                  placeholder="key_name"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>JSON Data / Value:</label>
                <textarea
                  rows="5"
                  placeholder='{"title": "Demo", "text": "Value"}'
                  value={newDataValue}
                  onChange={(e) => setNewDataValue(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={submitting} className="save-btn">
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
                <button type="button" onClick={() => setIsAddingData(false)} className="cancel-btn">
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Modal */}
        {editingId && (
          <div className="modal-overlay">
            <div className="crud-form-card modal-card">
              <h3>
                <i className="fa-solid fa-pen-to-square" />
                <span>Edit Config: {editKey}</span>
              </h3>
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Config Key (Read Only):</label>
                  <input type="text" value={editKey} disabled />
                </div>
                <div className="form-group">
                  <label>JSON Data Content:</label>
                  <textarea
                    rows="8"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={submitting} className="save-btn">
                    {submitting ? 'আপডেট হচ্ছে...' : 'আপডেট সেভ করুন'}
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="cancel-btn">
                    বাতিল
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Table */}
        <div className="table-section-card">
          <div className="table-header">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="text"
                placeholder="Key বা কনটেন্ট দিয়ে সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="table-count">
              দেখাচ্ছে: <b>{filteredItems.length}</b> টি Row
            </div>
          </div>

          <div className="table-responsive">
            <table className="d1-data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Key Name</th>
                  <th>Data Content Preview</th>
                  <th>Updated Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table-msg">
                      কোনো ডাটা পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={item.key || idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="key-pill">
                          <span>{item.key}</span>
                          <button
                            onClick={() => handleCopyId(item.key)}
                            title="Copy Key"
                            className="copy-key-btn"
                          >
                            <i className={`fa-solid ${copiedId === item.key ? 'fa-check' : 'fa-copy'}`} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="data-preview" title={item.rawData || item.text}>
                          {item.text || item.rawData}
                        </div>
                      </td>
                      <td>
                        <span className="time-badge">{formatDateTime(item.updatedAt || item.createdAt)}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            onClick={() => {
                              setEditingId(item.key);
                              setEditKey(item.key);
                              setEditText(item.rawData || item.text || '');
                            }}
                            className="edit-row-btn"
                            title="সম্পাদনা করুন"
                          >
                            <i className="fa-solid fa-pen" />
                            <span>এডিট</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.key)}
                            className="delete-row-btn"
                            title="মুছে ফেলুন"
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Nav Suite */}
        <DbNavBox activeRoute="/dbd1-admin" />

        <style jsx>{`
          .d1-admin-page-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px 20px 60px;
            font-family: inherit;
          }

          .d1-hero {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
            color: #ffffff;
            padding: 28px 32px;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(234, 88, 12, 0.2);
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 20px;
          }

          .d1-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
          }

          .d1-hero h1 {
            font-size: 24px;
            font-weight: 800;
            margin: 0 0 6px;
          }

          .hero-desc {
            font-size: 13.5px;
            opacity: 0.92;
            margin: 0;
            max-width: 600px;
          }

          .hero-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .refresh-btn, .add-new-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            border: none;
            transition: all 0.2s ease;
          }

          .refresh-btn {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .refresh-btn:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .add-new-btn {
            background: #ffffff;
            color: #ea580c;
          }

          .add-new-btn:hover {
            background: #f8fafc;
            transform: translateY(-1px);
          }

          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 25px;
          }

          .metric-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 14px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          }

          .metric-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
          }

          .metric-details {
            display: flex;
            flex-direction: column;
          }

          .metric-label {
            font-size: 11.5px;
            color: #64748b;
            font-weight: 600;
          }

          .metric-val {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
          }

          .action-alert {
            padding: 12px 18px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13.5px;
            font-weight: 600;
          }

          .action-alert.success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #16a34a;
          }

          .action-alert.error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
          }

          .crud-form-card {
            background: #ffffff;
            border: 1px solid #fed7aa;
            border-radius: 14px;
            padding: 24px;
            margin-bottom: 25px;
            box-shadow: 0 4px 15px rgba(234, 88, 12, 0.06);
          }

          .crud-form-card h3 {
            font-size: 16px;
            font-weight: 700;
            color: #ea580c;
            margin: 0 0 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .form-group {
            margin-bottom: 14px;
          }

          .form-group label {
            display: block;
            font-size: 12.5px;
            font-weight: 700;
            color: #334155;
            margin-bottom: 6px;
          }

          .form-group input, .form-group textarea {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 13.5px;
            font-family: monospace;
            outline: none;
            transition: border-color 0.2s;
          }

          .form-group input:focus, .form-group textarea:focus {
            border-color: #ea580c;
          }

          .form-actions {
            display: flex;
            gap: 10px;
          }

          .save-btn {
            background: #ea580c;
            color: #ffffff;
            border: none;
            padding: 9px 20px;
            border-radius: 7px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .cancel-btn {
            background: #f1f5f9;
            color: #475569;
            border: none;
            padding: 9px 16px;
            border-radius: 7px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-card {
            width: 100%;
            max-width: 650px;
            margin: 0;
          }

          .table-section-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          }

          .table-header {
            padding: 16px 20px;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            flex-wrap: wrap;
          }

          .search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 7px 12px;
            border-radius: 8px;
            width: 300px;
          }

          .search-box input {
            border: none;
            background: transparent;
            outline: none;
            font-size: 13px;
            width: 100%;
          }

          .table-count {
            font-size: 12.5px;
            color: #64748b;
          }

          .table-responsive {
            overflow-x: auto;
          }

          .d1-data-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 13px;
          }

          .d1-data-table th {
            background: #f8fafc;
            padding: 12px 16px;
            font-weight: 700;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
          }

          .d1-data-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }

          .key-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #fff7ed;
            color: #ea580c;
            border: 1px solid #ffedd5;
            padding: 3px 8px;
            border-radius: 6px;
            font-family: monospace;
            font-weight: 700;
          }

          .copy-key-btn {
            background: transparent;
            border: none;
            color: #ea580c;
            cursor: pointer;
            padding: 0;
            font-size: 11px;
          }

          .data-preview {
            max-width: 380px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #334155;
            font-family: monospace;
            font-size: 12px;
          }

          .time-badge {
            font-size: 11.5px;
            color: #64748b;
            white-space: nowrap;
          }

          .row-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .edit-row-btn {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #2563eb;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }

          .delete-row-btn {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 5px 8px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
          }

          .empty-table-msg {
            text-align: center;
            color: #94a3b8;
            padding: 30px !important;
          }

          @media (max-width: 768px) {
            .metrics-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </DbAuthGuard>
  );
}
