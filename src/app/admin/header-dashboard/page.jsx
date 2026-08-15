'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminHeaderDashboardPage() {
  const [loading, setLoading] = useState(true);

  // Announcement
  const [announceInfo, setAnnounceInfo] = useState({ text: '', link: '' });
  const [isEditingAnnounce, setIsEditingAnnounce] = useState(false);

  // Header settings
  const [headerInfo, setHeaderInfo] = useState({
    seoTitle: '',
    siteTitle: 'TopMCQBD',
    logoUrl: 'images/TopMCQ.png',
    faviconUrl: 'images/favicon.ico',
    btnText: 'যোগাযোগ',
    btnLink: '/contact',
    menus: [],
    megaMenus: []
  });
  const [isEditingHeaderSettings, setIsEditingHeaderSettings] = useState(false);

  // Other layout pieces to preserve during save
  const [footerInfo, setFooterInfo] = useState(null);
  const [copyrightInfo, setCopyrightInfo] = useState(null);

  // New main menu form toggle
  const [showNewMenuForm, setShowNewMenuForm] = useState(false);
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [newMenuUrl, setNewMenuUrl] = useState('');

  // Editing main menu index
  const [editingMenuIdx, setEditingMenuIdx] = useState(null);

  // Submenu add state: menuIdx -> boolean
  const [addingSubMenuIdx, setAddingSubMenuIdx] = useState(null);
  const [newSubMenuTitle, setNewSubMenuTitle] = useState('');
  const [newSubMenuUrl, setNewSubMenuUrl] = useState('');

  // Mega menu connection state: menuIdx -> boolean
  const [connectingMegaMenuIdx, setConnectingMegaMenuIdx] = useState(null);
  const [selectedMegaId, setSelectedMegaId] = useState('');

  // Mega Menus Management
  const [showNewMegaForm, setShowNewMegaForm] = useState(false);
  const [newMegaTitle, setNewMegaTitle] = useState('');
  const [editingMegaIdx, setEditingMegaIdx] = useState(null);
  const [addingMegaColIdx, setAddingMegaColIdx] = useState(null); // { megaIdx, type }
  const [addingMegaLinkIdx, setAddingMegaLinkIdx] = useState(null); // { megaIdx, colIdx }
  const [newMegaLinkTitle, setNewMegaLinkTitle] = useState('');
  const [newMegaLinkUrl, setNewMegaLinkUrl] = useState('');

  // Drag & drop state for header menus
  const [draggedMenuIdx, setDraggedMenuIdx] = useState(null);
  const [menuDropPos, setMenuDropPos] = useState({});

  const fetchLayoutConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/layout-config');
      const data = await res.json();
      if (data) {
        setAnnounceInfo(data.announcement || { text: '', link: '' });
        setHeaderInfo({
          seoTitle: data.header?.seoTitle || '',
          siteTitle: data.header?.siteTitle || 'TopMCQBD',
          logoUrl: data.header?.logoUrl || 'images/TopMCQ.png',
          faviconUrl: data.header?.faviconUrl || 'images/favicon.ico',
          btnText: data.header?.btnText || 'যোগাযোগ',
          btnLink: data.header?.btnLink || '/contact',
          menus: data.header?.menus || [],
          megaMenus: data.header?.megaMenus || []
        });
        setFooterInfo(data.footer || null);
        setCopyrightInfo(data.copyright || null);
      }
    } catch (err) {
      console.error('Error loading layout config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayoutConfig();
  }, []);

  const saveLayoutConfig = async (overrideHeader = null, overrideAnnounce = null) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    if (!token) {
      showTopAlert('অনুগ্রহ করে লগইন করুন!', 'warning');
      return;
    }

    const payload = {
      announcement: overrideAnnounce || announceInfo,
      header: overrideHeader || headerInfo,
      footer: footerInfo,
      copyright: copyrightInfo
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
        try {
          localStorage.setItem('layout_config_data', JSON.stringify(payload));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('layout-updated'));
          }
        } catch (e) {}
        fetchLayoutConfig();
      } else {
        showTopAlert('❌ ' + (result.message || 'সেভ করতে ব্যর্থ হয়েছে!'), 'danger');
      }
    } catch (err) {
      console.error('Save error:', err);
      showTopAlert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!', 'danger');
    }
  };

  // Drag and drop for menus
  const handleMenuDragStart = (e, idx) => {
    setDraggedMenuIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMenuDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const pos = offset < rect.height / 2 ? 'top' : 'bottom';
    setMenuDropPos({ [idx]: pos });
  };

  const handleMenuDragLeave = () => {
    setMenuDropPos({});
  };

  const handleMenuDrop = (e, targetIdx) => {
    e.preventDefault();
    setMenuDropPos({});
    if (draggedMenuIdx === null || draggedMenuIdx === targetIdx) return;

    const list = [...headerInfo.menus];
    const item = list.splice(draggedMenuIdx, 1)[0];
    list.splice(targetIdx, 0, item);
    const updatedHeader = { ...headerInfo, menus: list };
    setHeaderInfo(updatedHeader);
    saveLayoutConfig(updatedHeader);
    setDraggedMenuIdx(null);
  };

  // Main menu operations
  const moveMenu = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= headerInfo.menus.length) return;
    const updatedMenus = [...headerInfo.menus];
    const item = updatedMenus.splice(fromIdx, 1)[0];
    updatedMenus.splice(toIdx, 0, item);
    const updatedHeader = { ...headerInfo, menus: updatedMenus };
    setHeaderInfo(updatedHeader);
    saveLayoutConfig(updatedHeader);
  };

  const handleAddMainMenu = async () => {
    if (!newMenuTitle.trim()) {
      showTopAlert('মেনুর টাইটেল দিন!', 'warning');
      return;
    }

    const updatedMenus = [
      ...headerInfo.menus,
      {
        title: newMenuTitle.trim(),
        url: newMenuUrl.trim() || '#',
        subMenus: [],
        isMegaMenu: false,
        megaMenuId: null
      }
    ];
    const updatedHeader = { ...headerInfo, menus: updatedMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
    setNewMenuTitle('');
    setNewMenuUrl('');
    setShowNewMenuForm(false);
  };

  const deleteMainMenu = async (idx) => {
    const confirm = await showTopAlert('আপনি কি এই মেনুটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;
    const updatedMenus = headerInfo.menus.filter((_, i) => i !== idx);
    const updatedHeader = { ...headerInfo, menus: updatedMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
  };

  // Submenu operations
  const handleAddSubMenu = async (mIdx) => {
    if (!newSubMenuTitle.trim()) {
      showTopAlert('সাব-মেনু টাইটেল দিন!', 'warning');
      return;
    }

    const updatedMenus = [...headerInfo.menus];
    if (!updatedMenus[mIdx].subMenus) updatedMenus[mIdx].subMenus = [];
    updatedMenus[mIdx].subMenus.push({
      title: newSubMenuTitle.trim(),
      url: newSubMenuUrl.trim() || '#'
    });

    const updatedHeader = { ...headerInfo, menus: updatedMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
    setNewSubMenuTitle('');
    setNewSubMenuUrl('');
    setAddingSubMenuIdx(null);
  };

  const deleteSubMenu = async (mIdx, smIdx) => {
    const updatedMenus = [...headerInfo.menus];
    updatedMenus[mIdx].subMenus.splice(smIdx, 1);
    const updatedHeader = { ...headerInfo, menus: updatedMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
  };

  // Mega Menu Connection
  const handleConnectMega = async (mIdx) => {
    if (!selectedMegaId) {
      showTopAlert('একটি মেগা মেনু নির্বাচন করুন!', 'warning');
      return;
    }

    const updatedMenus = [...headerInfo.menus];
    updatedMenus[mIdx].isMegaMenu = true;
    updatedMenus[mIdx].megaMenuId = selectedMegaId;
    updatedMenus[mIdx].subMenus = [];

    const updatedHeader = { ...headerInfo, menus: updatedMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
    setConnectingMegaMenuIdx(null);
    setSelectedMegaId('');
  };

  const handleDisconnectMega = async (mIdx) => {
    const confirm = await showTopAlert('আপনি কি এই মেগা মেনু কানেকশনটি বিচ্ছিন্ন করতে চান?', 'warning', true);
    if (!confirm) return;

    const updatedMenus = [...headerInfo.menus];
    updatedMenus[mIdx].isMegaMenu = false;
    updatedMenus[mIdx].megaMenuId = null;

    const updatedHeader = { ...headerInfo, menus: updatedMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
  };

  // Mega Menu Management (Card 4)
  const handleAddMegaMenu = async () => {
    if (!newMegaTitle.trim()) {
      showTopAlert('মেগা মেনুর নাম দিন!', 'warning');
      return;
    }

    const newMegaId = 'mega_' + Date.now();
    const newMega = {
      id: newMegaId,
      title: newMegaTitle.trim(),
      columns: [
        {
          type: 'info',
          title: 'সাইট পরিচিতি',
          text: 'TopMCQ একটি শীর্ষস্থানীয় অনলাইন কুইজ প্ল্যাটফর্ম।',
          fb: '',
          yt: '',
          wa: '',
          tw: '',
          tg: '',
          ln: ''
        },
        {
          type: 'links',
          title: 'জনপ্রিয় কুইজ',
          links: [
            { title: 'বিসিএস প্রশ্নব্যাংক', url: '/quiz?category=bcs' },
            { title: 'ব্যাংক নিয়োগ পরীক্ষা', url: '/quiz?category=bank' }
          ]
        }
      ]
    };

    const updatedMegaMenus = [...(headerInfo.megaMenus || []), newMega];
    const updatedHeader = { ...headerInfo, megaMenus: updatedMegaMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
    setNewMegaTitle('');
    setShowNewMegaForm(false);
  };

  const deleteMegaMenu = async (mIdx) => {
    const confirm = await showTopAlert('আপনি কি এই মেগা মেনুটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;

    const targetId = headerInfo.megaMenus[mIdx]?.id;
    const updatedMegaMenus = headerInfo.megaMenus.filter((_, i) => i !== mIdx);

    // Unlink any main menu attached to this mega menu
    const updatedMenus = (headerInfo.menus || []).map(m => {
      if (m.megaMenuId === targetId) {
        return { ...m, isMegaMenu: false, megaMenuId: null };
      }
      return m;
    });

    const updatedHeader = { ...headerInfo, menus: updatedMenus, megaMenus: updatedMegaMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
  };

  const addMegaColumn = async (megaIdx, type) => {
    const updatedMegaMenus = [...headerInfo.megaMenus];
    const newCol =
      type === 'info'
        ? {
            type: 'info',
            title: 'সাইট তথ্য',
            text: 'বিস্তারিত বিবরণ...',
            fb: '',
            yt: '',
            wa: ''
          }
        : {
            type: 'links',
            title: 'নতুন লিংক কলাম',
            links: [{ title: 'নতুন লিংক', url: '#' }]
          };

    if (!updatedMegaMenus[megaIdx].columns) updatedMegaMenus[megaIdx].columns = [];
    updatedMegaMenus[megaIdx].columns.push(newCol);

    const updatedHeader = { ...headerInfo, megaMenus: updatedMegaMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
  };

  const deleteMegaColumn = async (megaIdx, colIdx) => {
    const updatedMegaMenus = [...headerInfo.megaMenus];
    updatedMegaMenus[megaIdx].columns.splice(colIdx, 1);
    const updatedHeader = { ...headerInfo, megaMenus: updatedMegaMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
  };

  const handleAddMegaLink = async (megaIdx, colIdx) => {
    if (!newMegaLinkTitle.trim()) {
      showTopAlert('লিংকের নাম দিন!', 'warning');
      return;
    }

    const updatedMegaMenus = [...headerInfo.megaMenus];
    if (!updatedMegaMenus[megaIdx].columns[colIdx].links) {
      updatedMegaMenus[megaIdx].columns[colIdx].links = [];
    }

    updatedMegaMenus[megaIdx].columns[colIdx].links.push({
      title: newMegaLinkTitle.trim(),
      url: newMegaLinkUrl.trim() || '#'
    });

    const updatedHeader = { ...headerInfo, megaMenus: updatedMegaMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
    setNewMegaLinkTitle('');
    setNewMegaLinkUrl('');
    setAddingMegaLinkIdx(null);
  };

  const deleteMegaLink = async (megaIdx, colIdx, linkIdx) => {
    const updatedMegaMenus = [...headerInfo.megaMenus];
    updatedMegaMenus[megaIdx].columns[colIdx].links.splice(linkIdx, 1);
    const updatedHeader = { ...headerInfo, megaMenus: updatedMegaMenus };
    setHeaderInfo(updatedHeader);
    await saveLayoutConfig(updatedHeader);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '10px', color: '#666' }}>হেডার ডাটা লোড হচ্ছে...</p>
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
          align-items: center;
          gap: 10px;
        }
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

        .card-announce { border-left: 6px solid #e83e8c; }
        .card-header-main { border-left: 6px solid var(--primary, #007bff); }
        .card-menus { border-left: 6px solid var(--secondary-dark, #28a745); }
        .card-mega { border-left: 6px solid var(--purple-btn, #6f42c1); }

        .form-group { margin-bottom: 12px; }
        label { display: block; font-weight: 600; margin-bottom: 5px; color: #475569; font-size: 13.5px; }
        input, select, textarea {
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
        .btn-purple { background-color: #6f42c1; color: white; }
        .btn-info { background-color: #17a2b8; color: white; }

        .btn-add {
          background: var(--main-dash-btn, #28a745);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

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

        .sub-menu-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 15px;
          margin-top: 10px;
        }
        .sub-menu-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 13.5px;
        }
        .sub-menu-item:last-child { border-bottom: none; }
      `}</style>

      {/* ১. TOP ANNOUNCEMENT BAR CARD */}
      <div className="section-card card-announce">
        <div className="section-title">
          <i className="fa-solid fa-bullhorn" style={{ color: '#e83e8c' }}></i> ১. টপ অ্যানাউন্সমেন্ট বার (Top Notice Bar)
        </div>

        {!isEditingAnnounce ? (
          <div className="read-box" style={{ borderLeft: '5px solid #e83e8c' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <button className="btn btn-warning" onClick={() => setIsEditingAnnounce(true)}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </div>
            <p><strong>Notice Text:</strong> {announceInfo.text || '<span style="color:#aaa;">কোনো নোটিশ নেই</span>'}</p>
            <p style={{ marginTop: '6px' }}><strong>Notice Link:</strong> {announceInfo.link || '<span style="color:#aaa;">None</span>'}</p>
          </div>
        ) : (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div className="form-group">
              <label>Notice Text:</label>
              <input
                type="text"
                value={announceInfo.text}
                onChange={(e) => setAnnounceInfo({ ...announceInfo, text: e.target.value })}
                placeholder="বিশেষ বিজ্ঞপ্তি: নতুন কুইজ যুক্ত করা হয়েছে..."
              />
            </div>
            <div className="form-group">
              <label>Notice Link (Optional):</label>
              <input
                type="text"
                value={announceInfo.link}
                onChange={(e) => setAnnounceInfo({ ...announceInfo, link: e.target.value })}
                placeholder="/packages বা https://..."
              />
            </div>
            <div className="card-actions">
              <button
                className="btn btn-submit"
                onClick={async () => {
                  await saveLayoutConfig(null, announceInfo);
                  setIsEditingAnnounce(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingAnnounce(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ২. HEADER GENERAL SETTINGS CARD */}
      <div className="section-card card-header-main">
        <div className="section-title">
          <i className="fa-solid fa-gear" style={{ color: 'var(--primary, #007bff)' }}></i> ২. হেডার সাধারণ সেটিংস (Site Title, Logo, Button)
        </div>

        {!isEditingHeaderSettings ? (
          <div className="read-box" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <button className="btn btn-warning" onClick={() => setIsEditingHeaderSettings(true)}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </div>
            <p><strong>Site Title:</strong> {headerInfo.siteTitle}</p>
            <p style={{ marginTop: '6px' }}><strong>Logo Path:</strong> <code>{headerInfo.logoUrl}</code></p>
            <p style={{ marginTop: '6px' }}><strong>Favicon Path:</strong> <code>{headerInfo.faviconUrl}</code></p>
            <p style={{ marginTop: '6px' }}><strong>Header Button:</strong> {headerInfo.btnText} ({headerInfo.btnLink})</p>
          </div>
        ) : (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div className="row">
              <div className="form-group">
                <label>Site Title:</label>
                <input
                  type="text"
                  value={headerInfo.siteTitle}
                  onChange={(e) => setHeaderInfo({ ...headerInfo, siteTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Header Button Text:</label>
                <input
                  type="text"
                  value={headerInfo.btnText}
                  onChange={(e) => setHeaderInfo({ ...headerInfo, btnText: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Header Button Link:</label>
                <input
                  type="text"
                  value={headerInfo.btnLink}
                  onChange={(e) => setHeaderInfo({ ...headerInfo, btnLink: e.target.value })}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Logo URL / Path:</label>
                <input
                  type="text"
                  value={headerInfo.logoUrl}
                  onChange={(e) => setHeaderInfo({ ...headerInfo, logoUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Favicon URL / Path:</label>
                <input
                  type="text"
                  value={headerInfo.faviconUrl}
                  onChange={(e) => setHeaderInfo({ ...headerInfo, faviconUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="card-actions">
              <button
                className="btn btn-submit"
                onClick={async () => {
                  await saveLayoutConfig(headerInfo);
                  setIsEditingHeaderSettings(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingHeaderSettings(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ৩. NAVIGATION MENUS CARD */}
      <div className="section-card card-menus">
        <div className="section-title">
          <i className="fa-solid fa-bars" style={{ color: 'var(--secondary-dark, #28a745)' }}></i> ৩. হেডার নেভিগেশন মেনু (Header Menus)
        </div>

        <div>
          {headerInfo.menus.map((menu, mIdx) => {
            const isEditing = editingMenuIdx === mIdx;
            const dropClass = menuDropPos[mIdx] === 'top' ? 'drag-over-top' : menuDropPos[mIdx] === 'bottom' ? 'drag-over-bottom' : '';
            const isDragging = draggedMenuIdx === mIdx;
            const isMegaActive = menu.isMegaMenu === true && menu.megaMenuId;
            const linkedMega = (headerInfo.megaMenus || []).find((x) => x.id === menu.megaMenuId);

            if (isEditing) {
              return (
                <div key={mIdx} className="read-box" style={{ background: '#ffffff', borderLeft: '4px solid #007bff' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#007bff' }}>
                    মেনু #{mIdx + 1} এডিট করুন
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Menu Title:</label>
                      <input
                        type="text"
                        value={menu.title}
                        onChange={(e) => {
                          const updated = [...headerInfo.menus];
                          updated[mIdx].title = e.target.value;
                          setHeaderInfo({ ...headerInfo, menus: updated });
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>URL Path:</label>
                      <input
                        type="text"
                        value={menu.url}
                        onChange={(e) => {
                          const updated = [...headerInfo.menus];
                          updated[mIdx].url = e.target.value;
                          setHeaderInfo({ ...headerInfo, menus: updated });
                        }}
                      />
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-submit"
                      onClick={async () => {
                        await saveLayoutConfig();
                        setEditingMenuIdx(null);
                      }}
                    >
                      <i className="fa-solid fa-floppy-disk"></i> Save Changes
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingMenuIdx(null)}>
                      <i className="fa-solid fa-xmark"></i> Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={mIdx}
                className={`read-box draggable-box ${isDragging ? 'dragging' : ''} ${dropClass}`}
                draggable
                onDragStart={(e) => handleMenuDragStart(e, mIdx)}
                onDragOver={(e) => handleMenuDragOver(e, mIdx)}
                onDragLeave={handleMenuDragLeave}
                onDrop={(e) => handleMenuDrop(e, mIdx)}
                style={{ borderLeft: isMegaActive ? '5px solid #6f42c1' : '5px solid #20c997' }}
              >
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-warning" onClick={() => setEditingMenuIdx(mIdx)}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteMainMenu(mIdx)}>
                    <i className="fa-solid fa-trash"></i> Delete
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-grip-vertical drag-handle" title="টেনে ধরে স্থান পরিবর্তন করুন" style={{ marginTop: '6px' }}></i>
                  <div className="arrow-btn-group" style={{ marginTop: '4px' }}>
                    <button className="btn-arrow" onClick={() => moveMenu(mIdx, mIdx - 1)} disabled={mIdx === 0}>
                      ▲
                    </button>
                    <button className="btn-arrow" onClick={() => moveMenu(mIdx, mIdx + 1)} disabled={mIdx === headerInfo.menus.length - 1}>
                      ▼
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--dark)' }}>
                      #{mIdx + 1}. {menu.title}{' '}
                      {isMegaActive && (
                        <span style={{ background: '#6f42c1', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginLeft: '6px' }}>
                          <i className="fa-solid fa-layer-group"></i> Mega Menu Active
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginLeft: '8px' }}>
                        (<code>{menu.url}</code>)
                      </span>
                    </h4>

                    {/* Mega Menu info if connected */}
                    {isMegaActive && (
                      <div style={{ background: '#f3e8ff', padding: '10px 14px', borderRadius: '6px', border: '1px dashed #6f42c1', color: '#6f42c1', margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><i className="fa-solid fa-link"></i> যুক্ত মেগা মেনু: <strong>{linkedMega ? linkedMega.title : '(অজানা)'}</strong></span>
                        <button className="btn btn-danger" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => handleDisconnectMega(mIdx)}>
                          <i className="fa-solid fa-unlink"></i> সংযোগ বিচ্ছিন্ন করুন
                        </button>
                      </div>
                    )}

                    {/* Connect Mega Menu Form */}
                    {connectingMegaMenuIdx === mIdx && (
                      <div style={{ background: '#f3e8ff', padding: '12px 15px', borderRadius: '6px', border: '1px solid #d8b4fe', margin: '10px 0' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#6f42c1', marginBottom: '8px' }}>
                          <i className="fa-solid fa-layer-group"></i> মেগা মেনু সিলেক্ট করুন:
                        </div>
                        <div className="row" style={{ marginBottom: 0 }}>
                          <select
                            style={{ flex: 1 }}
                            value={selectedMegaId}
                            onChange={(e) => setSelectedMegaId(e.target.value)}
                          >
                            <option value="">-- মেগা মেনু নির্বাচন করুন --</option>
                            {(headerInfo.megaMenus || []).map((mm) => (
                              <option key={mm.id} value={mm.id}>{mm.title}</option>
                            ))}
                          </select>
                          <button className="btn btn-submit" style={{ padding: '6px 12px' }} onClick={() => handleConnectMega(mIdx)}>
                            <i className="fa-solid fa-floppy-disk"></i> কানেক্ট করুন
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setConnectingMegaMenuIdx(null)}>
                            <i className="fa-solid fa-xmark"></i> Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Regular Submenus (if not mega menu) */}
                    {!isMegaActive && (
                      <div className="sub-menu-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>
                            <i className="fa-solid fa-level-down-alt"></i> সাব-মেনু তালিকা ({(menu.subMenus || []).length})
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-purple"
                              style={{ padding: '3px 8px', fontSize: '12px' }}
                              onClick={() => {
                                setConnectingMegaMenuIdx(mIdx);
                                setAddingSubMenuIdx(null);
                              }}
                            >
                              <i className="fa-solid fa-layer-group"></i> মেগা মেনু কানেক্ট
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '12px' }}
                              onClick={() => {
                                setAddingSubMenuIdx(mIdx);
                                setConnectingMegaMenuIdx(null);
                              }}
                            >
                              <i className="fa-solid fa-plus"></i> সাব-মেনু যোগ
                            </button>
                          </div>
                        </div>

                        {addingSubMenuIdx === mIdx && (
                          <div className="row" style={{ background: '#f8fafc', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
                            <input
                              type="text"
                              placeholder="সাব-মেনু টাইটেল"
                              value={newSubMenuTitle}
                              onChange={(e) => setNewSubMenuTitle(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <input
                              type="text"
                              placeholder="URL (যেমন: /quiz?category=bcs)"
                              value={newSubMenuUrl}
                              onChange={(e) => setNewSubMenuUrl(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <button className="btn btn-submit" style={{ padding: '6px 12px' }} onClick={() => handleAddSubMenu(mIdx)}>
                              <i className="fa-solid fa-floppy-disk"></i> Save
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setAddingSubMenuIdx(null)}>
                              <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                          </div>
                        )}

                        {(menu.subMenus || []).map((sm, smIdx) => (
                          <div key={smIdx} className="sub-menu-item">
                            <span>
                              <strong>{sm.title}</strong> &rarr; <code>{sm.url}</code>
                            </span>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                              onClick={() => deleteSubMenu(mIdx, smIdx)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        ))}

                        {(!menu.subMenus || menu.subMenus.length === 0) && (
                          <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>কোনো সাব-মেনু যোগ করা হয়নি।</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Main Menu */}
        {!showNewMenuForm ? (
          <button type="button" className="btn-add" onClick={() => setShowNewMenuForm(true)}>
            <i className="fa-solid fa-plus"></i> নতুন মূল মেনু যোগ করুন
          </button>
        ) : (
          <div className="read-box" style={{ borderLeft: '5px solid #28a745', background: '#ffffff', marginTop: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#28a745' }}>নতুন মূল মেনু যোগ করুন</div>
            <div className="row">
              <input
                type="text"
                placeholder="মেনু টাইটেল (যেমন: সাধারণ জ্ঞান)"
                value={newMenuTitle}
                onChange={(e) => setNewMenuTitle(e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                placeholder="URL (যেমন: /all-mcq)"
                value={newMenuUrl}
                onChange={(e) => setNewMenuUrl(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <div className="card-actions">
              <button className="btn btn-submit" onClick={handleAddMainMenu}>
                <i className="fa-solid fa-floppy-disk"></i> Save Menu
              </button>
              <button className="btn btn-secondary" onClick={() => setShowNewMenuForm(false)}>
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ৪. MEGA MENU BUILDER CARD */}
      <div className="section-card card-mega">
        <div className="section-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-layer-group" style={{ color: 'var(--purple-btn)' }}></i> ৪. মেগা মেনু বিল্ডার (Mega Menu Builder)
          </div>
          <button className="btn btn-purple" onClick={() => setShowNewMegaForm(true)}>
            <i className="fa-solid fa-plus"></i> নতুন মেগা মেনু তৈরি করুন
          </button>
        </div>

        {/* New Mega Menu Form */}
        {showNewMegaForm && (
          <div className="read-box" style={{ background: '#ffffff', borderLeft: '4px solid #6f42c1', marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#6f42c1' }}>নতুন মেগা মেনু যোগ করুন</div>
            <div className="row">
              <input
                type="text"
                placeholder="মেগা মেনুর নাম (যেমন: All Courses / Mega Dropdown)"
                value={newMegaTitle}
                onChange={(e) => setNewMegaTitle(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <div className="card-actions">
              <button className="btn btn-submit" onClick={handleAddMegaMenu}>
                <i className="fa-solid fa-floppy-disk"></i> Save Mega Menu
              </button>
              <button className="btn btn-secondary" onClick={() => setShowNewMegaForm(false)}>
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mega Menus List */}
        <div>
          {(headerInfo.megaMenus || []).length === 0 ? (
            <p style={{ color: '#777', padding: '10px 0' }}>কোনো মেগা মেনু তৈরি করা হয়নি। উপরে বাটনে ক্লিক করে নতুন মেগা মেনু তৈরি করুন।</p>
          ) : (
            headerInfo.megaMenus.map((mega, megaIdx) => (
              <div key={mega.id || megaIdx} className="read-box" style={{ borderLeft: '5px solid #6f42c1', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: '#6f42c1', fontSize: '16px' }}>
                    <i className="fa-solid fa-layer-group" style={{ marginRight: '8px' }}></i>
                    {mega.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-info" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => addMegaColumn(megaIdx, 'info')}>
                      <i className="fa-solid fa-plus"></i> Info Column
                    </button>
                    <button className="btn btn-submit" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => addMegaColumn(megaIdx, 'links')}>
                      <i className="fa-solid fa-plus"></i> Links Column
                    </button>
                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => deleteMegaMenu(megaIdx)}>
                      <i className="fa-solid fa-trash"></i> Delete
                    </button>
                  </div>
                </div>

                {/* Columns inside this Mega Menu */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                  {(mega.columns || []).map((col, colIdx) => (
                    <div key={colIdx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: col.type === 'info' ? '#17a2b8' : '#28a745' }}>
                          <i className={col.type === 'info' ? 'fa-solid fa-circle-info' : 'fa-solid fa-link'}></i> {col.title}
                        </span>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '2px 6px', fontSize: '10px' }}
                          onClick={() => deleteMegaColumn(megaIdx, colIdx)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>

                      {col.type === 'info' ? (
                        <div>
                          <p style={{ fontSize: '12.5px', color: '#555', margin: '4px 0' }}>{col.text}</p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', color: '#666' }}>লিংক সমূহ ({(col.links || []).length}):</span>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '2px 6px', fontSize: '10px' }}
                              onClick={() => setAddingMegaLinkIdx({ megaIdx, colIdx })}
                            >
                              <i className="fa-solid fa-plus"></i> যোগ
                            </button>
                          </div>

                          {addingMegaLinkIdx?.megaIdx === megaIdx && addingMegaLinkIdx?.colIdx === colIdx && (
                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
                              <input
                                type="text"
                                placeholder="লিংক টাইটেল"
                                value={newMegaLinkTitle}
                                onChange={(e) => setNewMegaLinkTitle(e.target.value)}
                                style={{ marginBottom: '4px' }}
                              />
                              <input
                                type="text"
                                placeholder="URL (যেমন: /quiz?category=math)"
                                value={newMegaLinkUrl}
                                onChange={(e) => setNewMegaLinkUrl(e.target.value)}
                                style={{ marginBottom: '4px' }}
                              />
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn btn-submit" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handleAddMegaLink(megaIdx, colIdx)}>
                                  Save
                                </button>
                                <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => setAddingMegaLinkIdx(null)}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {(col.links || []).map((lk, lkIdx) => (
                            <div key={lkIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px dashed #eee', fontSize: '12px' }}>
                              <span>{lk.title}</span>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '1px 4px', fontSize: '9px' }}
                                onClick={() => deleteMegaLink(megaIdx, colIdx, lkIdx)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
