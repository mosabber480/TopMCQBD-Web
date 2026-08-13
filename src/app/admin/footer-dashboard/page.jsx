'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminFooterDashboardPage() {
  const [loading, setLoading] = useState(true);

  // Layout pieces
  const [announceInfo, setAnnounceInfo] = useState(null);
  const [headerInfo, setHeaderInfo] = useState(null);

  // Footer columns
  const [columns, setColumns] = useState([]);
  const [editingColIdx, setEditingColIdx] = useState(null);
  const [draggedColIdx, setDraggedColIdx] = useState(null);
  const [colDropPos, setColDropPos] = useState({});

  // Copyright
  const [copyrightText, setCopyrightText] = useState('© 2026 TopMCQ. All rights reserved.');
  const [copyrightLinks, setCopyrightLinks] = useState([]);
  const [isEditingCopyright, setIsEditingCopyright] = useState(false);

  // New link form state per column
  const [addingLinkColIdx, setAddingLinkColIdx] = useState(null);
  const [newLinkText, setNewLinkText] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const fetchLayoutConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/layout-config');
      const data = await res.json();
      if (data) {
        setAnnounceInfo(data.announcement || null);
        setHeaderInfo(data.header || null);

        const foot = data.footer || {};
        if (foot.columns && foot.columns.length > 0) {
          setColumns(foot.columns);
        } else {
          setColumns([
            {
              type: 'info',
              title: 'সাইট তথ্য ও সোশাল লিংক',
              text: foot.col1Text || 'TopMCQ অনলাইন কুইজ প্ল্যাটফর্ম।',
              fb: foot.col1Fb || '',
              yt: foot.col1Yt || '',
              wa: foot.col1Wa || '',
              tw: foot.col1Tw || '',
              tg: foot.col1Tg || '',
              ln: foot.col1Ln || ''
            },
            { type: 'links', title: foot.col2Title || 'প্রয়োজনীয় লিংক', links: foot.col2Links || [] },
            { type: 'links', title: foot.col3Title || 'ক্যাটাগরি', links: foot.col3Links || [] },
            { type: 'links', title: foot.col4Title || 'যোগাযোগ', links: foot.col4Links || [] }
          ]);
        }

        const copy = data.copyright || {};
        setCopyrightText(copy.text || '© 2026 TopMCQ. All rights reserved.');
        setCopyrightLinks(copy.links || []);
      }
    } catch (err) {
      console.error('Error fetching layout config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayoutConfig();
  }, []);

  const saveLayoutConfig = async (overrideCols = null, overrideCopy = null) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    if (!token) {
      showTopAlert('অনুগ্রহ করে লগইন করুন!', 'warning');
      return;
    }

    const payload = {
      announcement: announceInfo,
      header: headerInfo,
      footer: { columns: overrideCols || columns },
      copyright: overrideCopy || { text: copyrightText, links: copyrightLinks }
    };

    try {
      const res = await fetch('/api/layout-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showTopAlert('✅ সফলভাবে সেভ হয়েছে!', 'success');
        fetchLayoutConfig();
      } else {
        showTopAlert('❌ ' + (result.message || 'সেভ করতে ব্যর্থ হয়েছে!'), 'danger');
      }
    } catch (err) {
      console.error('Save error:', err);
      showTopAlert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!', 'danger');
    }
  };

  // Drag and drop for columns
  const handleColDragStart = (e, idx) => {
    setDraggedColIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const pos = offset < rect.height / 2 ? 'top' : 'bottom';
    setColDropPos({ [idx]: pos });
  };

  const handleColDragLeave = () => {
    setColDropPos({});
  };

  const handleColDrop = (e, targetIdx) => {
    e.preventDefault();
    setColDropPos({});
    if (draggedColIdx === null || draggedColIdx === targetIdx) return;

    const list = [...columns];
    const item = list.splice(draggedColIdx, 1)[0];
    list.splice(targetIdx, 0, item);
    setColumns(list);
    saveLayoutConfig(list);
    setDraggedColIdx(null);
  };

  const moveColumn = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= columns.length) return;
    const updated = [...columns];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setColumns(updated);
    saveLayoutConfig(updated);
  };

  const addColumn = (type) => {
    const newCol =
      type === 'info'
        ? {
            type: 'info',
            title: 'সাইট তথ্য',
            text: 'ওয়েবসাইট পরিচিতি...',
            fb: '',
            yt: '',
            wa: '',
            tw: '',
            tg: '',
            ln: ''
          }
        : {
            type: 'links',
            title: 'নতুন লিংক কলাম',
            links: []
          };
    const updated = [...columns, newCol];
    setColumns(updated);
    setEditingColIdx(updated.length - 1);
  };

  const deleteColumn = async (idx) => {
    const confirm = await showTopAlert('আপনি কি এই ফুটার কলামটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;
    const updated = columns.filter((_, i) => i !== idx);
    setColumns(updated);
    await saveLayoutConfig(updated);
  };

  // Add link to a link-column
  const handleAddLink = async (colIdx) => {
    if (!newLinkText.trim()) {
      showTopAlert('লিংকের নাম লিখুন!', 'warning');
      return;
    }

    const updated = [...columns];
    if (!updated[colIdx].links) updated[colIdx].links = [];
    updated[colIdx].links.push({
      text: newLinkText.trim(),
      url: newLinkUrl.trim() || '#'
    });

    setColumns(updated);
    await saveLayoutConfig(updated);
    setNewLinkText('');
    setNewLinkUrl('');
    setAddingLinkColIdx(null);
  };

  const deleteLink = async (colIdx, linkIdx) => {
    const updated = [...columns];
    updated[colIdx].links.splice(linkIdx, 1);
    setColumns(updated);
    await saveLayoutConfig(updated);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '10px', color: '#666' }}>ফুটার ডাটা লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 25px 25px' }}>
      <style jsx>{`
        .section-card {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: var(--dark, #2c3e50);
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .footer-card { border-left: 6px solid var(--secondary, #17a2b8); }
        .copy-card { border-left: 6px solid var(--purple-btn, #6f42c1); }

        .read-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 15px 20px;
          margin-bottom: 15px;
          position: relative;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .draggable-box { cursor: move; }
        .drag-handle {
          cursor: grab;
          color: #888;
          margin-right: 8px;
          font-size: 16px;
        }
        .drag-handle:active { cursor: grabbing; }
        .dragging { opacity: 0.4; background: #eef6ff !important; }
        .drag-over-top { border-top: 3px solid #007bff !important; }
        .drag-over-bottom { border-bottom: 3px solid #007bff !important; }

        .form-group { margin-bottom: 12px; }
        label { display: block; font-weight: 600; margin-bottom: 5px; color: #475569; font-size: 13.5px; }
        input, textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
        }
        input:focus, textarea:focus { border-color: var(--primary, #007bff); }
        .row { display: flex; gap: 15px; margin-bottom: 10px; flex-wrap: wrap; align-items: flex-start; }
        .row .form-group { flex: 1; min-width: 240px; }
        .card-actions { display: flex; gap: 10px; margin-top: 15px; }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-warning { background-color: #ffc107; color: #212529; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-submit { background-color: #28a745; color: white; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .btn-info { background-color: #17a2b8; color: white; }

        .arrow-btn-group {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
          margin-right: 10px;
        }
        .btn-arrow {
          background: #e2e8f0;
          border: none;
          color: #475569;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          cursor: pointer;
          line-height: 1;
        }
        .btn-arrow:hover { background: #007bff; color: #ffffff; }

        .link-list-box {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          padding: 10px 15px;
          margin-top: 8px;
        }
        .link-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 13.5px;
        }
        .link-item-row:last-child { border-bottom: none; }
      `}</style>

      {/* 1. FOOTER COLUMNS CARD */}
      <div className="section-card footer-card">
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-table-columns" style={{ color: 'var(--secondary)' }}></i> ৩. ফুটার সেটিং (Footer Columns)
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-info" onClick={() => addColumn('info')}>
              <i className="fa-solid fa-plus"></i> Info Column যোগ
            </button>
            <button className="btn btn-submit" onClick={() => addColumn('links')}>
              <i className="fa-solid fa-plus"></i> Links Column যোগ
            </button>
          </div>
        </div>

        <div>
          {columns.map((col, cIdx) => {
            const isEditing = editingColIdx === cIdx;
            const dropClass = colDropPos[cIdx] === 'top' ? 'drag-over-top' : colDropPos[cIdx] === 'bottom' ? 'drag-over-bottom' : '';
            const isDragging = draggedColIdx === cIdx;

            if (isEditing) {
              return (
                <div key={cIdx} className="read-box" style={{ background: '#ffffff', borderLeft: '4px solid var(--secondary)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--secondary)' }}>
                    কলাম #{cIdx + 1} ({col.type === 'info' ? 'Info / Social' : 'Links'}) এডিট করুন
                  </div>

                  <div className="form-group">
                    <label>Column Title:</label>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => {
                        const updated = [...columns];
                        updated[cIdx].title = e.target.value;
                        setColumns(updated);
                      }}
                    />
                  </div>

                  {col.type === 'info' ? (
                    <>
                      <div className="form-group">
                        <label>Description / Text:</label>
                        <textarea
                          rows={2}
                          value={col.text || ''}
                          onChange={(e) => {
                            const updated = [...columns];
                            updated[cIdx].text = e.target.value;
                            setColumns(updated);
                          }}
                        ></textarea>
                      </div>
                      <div className="row">
                        <div className="form-group">
                          <label>Facebook Link:</label>
                          <input
                            type="text"
                            value={col.fb || ''}
                            onChange={(e) => {
                              const updated = [...columns];
                              updated[cIdx].fb = e.target.value;
                              setColumns(updated);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>YouTube Link:</label>
                          <input
                            type="text"
                            value={col.yt || ''}
                            onChange={(e) => {
                              const updated = [...columns];
                              updated[cIdx].yt = e.target.value;
                              setColumns(updated);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>WhatsApp Link:</label>
                          <input
                            type="text"
                            value={col.wa || ''}
                            onChange={(e) => {
                              const updated = [...columns];
                              updated[cIdx].wa = e.target.value;
                              setColumns(updated);
                            }}
                          />
                        </div>
                      </div>
                    </>
                  ) : null}

                  <div className="card-actions">
                    <button
                      className="btn btn-submit"
                      onClick={async () => {
                        await saveLayoutConfig();
                        setEditingColIdx(null);
                      }}
                    >
                      <i className="fa-solid fa-floppy-disk"></i> Save Column
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingColIdx(null)}>
                      <i className="fa-solid fa-xmark"></i> Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cIdx}
                className={`read-box draggable-box ${isDragging ? 'dragging' : ''} ${dropClass}`}
                draggable
                onDragStart={(e) => handleColDragStart(e, cIdx)}
                onDragOver={(e) => handleColDragOver(e, cIdx)}
                onDragLeave={handleColDragLeave}
                onDrop={(e) => handleColDrop(e, cIdx)}
              >
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-warning" onClick={() => setEditingColIdx(cIdx)}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteColumn(cIdx)}>
                    <i className="fa-solid fa-trash"></i> Delete
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-grip-vertical drag-handle" title="টেনে ধরে স্থান পরিবর্তন করুন" style={{ marginTop: '6px' }}></i>
                  <div className="arrow-btn-group" style={{ marginTop: '4px' }}>
                    <button className="btn-arrow" onClick={() => moveColumn(cIdx, cIdx - 1)} disabled={cIdx === 0}>
                      ▲
                    </button>
                    <button className="btn-arrow" onClick={() => moveColumn(cIdx, cIdx + 1)} disabled={cIdx === columns.length - 1}>
                      ▼
                    </button>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--dark)' }}>
                      #{cIdx + 1}. {col.title}{' '}
                      <span style={{ fontSize: '12px', background: '#e3f2fd', color: '#007bff', padding: '2px 6px', borderRadius: '4px' }}>
                        {col.type.toUpperCase()}
                      </span>
                    </h4>

                    {col.type === 'info' && (
                      <p style={{ fontSize: '13.5px', color: '#666', margin: '4px 0 0 0' }}>{col.text}</p>
                    )}

                    {col.type === 'links' && (
                      <div className="link-list-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>
                            <i className="fa-solid fa-link"></i> লিংক তালিকা ({(col.links || []).length})
                          </span>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '2px 8px', fontSize: '12px' }}
                            onClick={() => setAddingLinkColIdx(cIdx)}
                          >
                            <i className="fa-solid fa-plus"></i> লিংক যোগ
                          </button>
                        </div>

                        {addingLinkColIdx === cIdx && (
                          <div className="row" style={{ background: '#f8fafc', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
                            <input
                              type="text"
                              placeholder="লিংক টাইটেল (যেমন: আমাদের সম্পর্কে)"
                              value={newLinkText}
                              onChange={(e) => setNewLinkText(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <input
                              type="text"
                              placeholder="URL (যেমন: /about-us)"
                              value={newLinkUrl}
                              onChange={(e) => setNewLinkUrl(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button className="btn btn-submit" style={{ padding: '6px 12px' }} onClick={() => handleAddLink(cIdx)}>
                              <i className="fa-solid fa-floppy-disk"></i> Save
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setAddingLinkColIdx(null)}>
                              <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                          </div>
                        )}

                        {(col.links || []).map((lnk, lIdx) => (
                          <div key={lIdx} className="link-item-row">
                            <span>
                              <strong>{lnk.text}</strong> &rarr; <code>{lnk.url}</code>
                            </span>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                              onClick={() => deleteLink(cIdx, lIdx)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. COPYRIGHT SETTINGS CARD */}
      <div className="section-card copy-card">
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-copyright" style={{ color: 'var(--purple-btn)' }}></i> ৪. কপিরাইট ও ফুটনোট টেক্সট
          </div>
        </div>

        {!isEditingCopyright ? (
          <div className="read-box" style={{ borderLeft: '5px solid var(--purple-btn)' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <button className="btn btn-warning" onClick={() => setIsEditingCopyright(true)}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </div>
            <p><strong>Copyright Text:</strong> {copyrightText}</p>
          </div>
        ) : (
          <div className="read-box" style={{ background: '#ffffff', borderLeft: '5px solid #007bff' }}>
            <div className="form-group">
              <label>Copyright Text:</label>
              <input
                type="text"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
              />
            </div>
            <div className="card-actions">
              <button
                className="btn btn-submit"
                onClick={async () => {
                  await saveLayoutConfig(null, { text: copyrightText, links: copyrightLinks });
                  setIsEditingCopyright(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingCopyright(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
