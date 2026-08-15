'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminSidebarMenuDashboardPage() {
  const [menus, setMenus] = useState([]);
  const [headerButtons, setHeaderButtons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New sidebar menu form
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('fa-solid fa-circle');

  // Editing sidebar menu index
  const [editingIdx, setEditingIdx] = useState(null);

  // Submenu state
  const [addingSubMenuIdx, setAddingSubMenuIdx] = useState(null);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubUrl, setNewSubUrl] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('fa-solid fa-circle');

  // Drag and drop state for sidebar menus
  const [draggedMenuIdx, setDraggedMenuIdx] = useState(null);
  const [menuDropPos, setMenuDropPos] = useState({});

  // --- Header Buttons State ---
  const [showNewHeaderBtn, setShowNewHeaderBtn] = useState(false);
  const [btnText, setBtnText] = useState('');
  const [btnUrl, setBtnUrl] = useState('');
  const [btnIcon, setBtnIcon] = useState('fa-solid fa-arrow-up-right-from-square');
  const [btnColor, setBtnColor] = useState('primary');
  const [btnTargetBlank, setBtnTargetBlank] = useState(false);
  const [btnAction, setBtnAction] = useState('link');
  const [editingHeaderBtnIdx, setEditingHeaderBtnIdx] = useState(null);

  // Drag and drop state for header buttons
  const [draggedBtnIdx, setDraggedBtnIdx] = useState(null);
  const [btnDropPos, setBtnDropPos] = useState({});

  const fetchSidebarConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sidebar-config');
      const data = await res.json();
      if (data) {
        if (data.menus) setMenus(data.menus);
        if (data.headerButtons) setHeaderButtons(data.headerButtons);
      }
    } catch (err) {
      console.error('Error fetching sidebar config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarConfig();
  }, []);

  const saveSidebarConfig = async (overrideMenus = null, overrideButtons = null) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    if (!token) {
      showTopAlert('অনুগ্রহ করে লগইন করুন!', 'warning');
      return;
    }

    const payloadMenus = overrideMenus !== null ? overrideMenus : menus;
    const payloadButtons = overrideButtons !== null ? overrideButtons : headerButtons;

    try {
      const res = await fetch('/api/sidebar-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          menus: payloadMenus,
          headerButtons: payloadButtons
        })
      });

      const data = await res.json();
      if (res.ok) {
        showTopAlert('✅ কনফিগারেশন সফলভাবে সেভ হয়েছে!', 'success');
        fetchSidebarConfig();
      } else {
        showTopAlert('❌ ' + (data.message || 'সেভ করতে ব্যর্থ হয়েছে!'), 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!', 'danger');
    }
  };

  // --- Sidebar Menus DND & Sort ---
  const handleDragStart = (e, idx) => {
    setDraggedMenuIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const pos = offset < rect.height / 2 ? 'top' : 'bottom';
    setMenuDropPos({ [idx]: pos });
  };

  const handleDragLeave = () => {
    setMenuDropPos({});
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    setMenuDropPos({});
    if (draggedMenuIdx === null || draggedMenuIdx === targetIdx) return;

    const list = [...menus];
    const item = list.splice(draggedMenuIdx, 1)[0];
    list.splice(targetIdx, 0, item);
    setMenus(list);
    saveSidebarConfig(list, null);
    setDraggedMenuIdx(null);
  };

  const moveMenu = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= menus.length) return;
    const updated = [...menus];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setMenus(updated);
    saveSidebarConfig(updated, null);
  };

  const handleAddMenu = async () => {
    if (!newTitle.trim()) {
      showTopAlert('মেনু টাইটেল লিখুন!', 'warning');
      return;
    }

    const updated = [
      ...menus,
      {
        title: newTitle.trim(),
        url: newUrl.trim() || '#',
        icon: newIcon.trim() || 'fa-solid fa-circle',
        subMenus: []
      }
    ];
    setMenus(updated);
    await saveSidebarConfig(updated, null);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('fa-solid fa-circle');
    setShowNewMenu(false);
  };

  const handleDeleteMenu = async (idx) => {
    const confirm = await showTopAlert('আপনি কি এই মেনুটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;
    const updated = menus.filter((_, i) => i !== idx);
    setMenus(updated);
    await saveSidebarConfig(updated, null);
  };

  const handleAddSubMenu = async (mIdx) => {
    if (!newSubTitle.trim()) {
      showTopAlert('সাব-মেনু টাইটেল লিখুন!', 'warning');
      return;
    }

    const updated = [...menus];
    if (!updated[mIdx].subMenus) updated[mIdx].subMenus = [];

    updated[mIdx].subMenus.push({
      title: newSubTitle.trim(),
      url: newSubUrl.trim() || '#',
      icon: newSubIcon.trim() || 'fa-solid fa-circle'
    });

    setMenus(updated);
    await saveSidebarConfig(updated, null);
    setNewSubTitle('');
    setNewSubUrl('');
    setNewSubIcon('fa-solid fa-circle');
    setAddingSubMenuIdx(null);
  };

  const handleDeleteSubMenu = async (mIdx, sIdx) => {
    const confirm = await showTopAlert('আপনি কি এই সাব-মেনুটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;
    const updated = [...menus];
    updated[mIdx].subMenus = updated[mIdx].subMenus.filter((_, i) => i !== sIdx);
    setMenus(updated);
    await saveSidebarConfig(updated, null);
  };

  // --- Header Buttons Actions & DND ---
  const handleBtnDragStart = (e, idx) => {
    setDraggedBtnIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBtnDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const pos = offset < rect.height / 2 ? 'top' : 'bottom';
    setBtnDropPos({ [idx]: pos });
  };

  const handleBtnDragLeave = () => {
    setBtnDropPos({});
  };

  const handleBtnDrop = (e, targetIdx) => {
    e.preventDefault();
    setBtnDropPos({});
    if (draggedBtnIdx === null || draggedBtnIdx === targetIdx) return;

    const list = [...headerButtons];
    const item = list.splice(draggedBtnIdx, 1)[0];
    list.splice(targetIdx, 0, item);
    setHeaderButtons(list);
    saveSidebarConfig(null, list);
    setDraggedBtnIdx(null);
  };

  const moveHeaderBtn = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= headerButtons.length) return;
    const updated = [...headerButtons];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setHeaderButtons(updated);
    saveSidebarConfig(null, updated);
  };

  const handleSaveHeaderBtn = async () => {
    if (!btnText.trim()) {
      showTopAlert('বোতামের নাম (Label) লিখুন!', 'warning');
      return;
    }

    const updated = [...headerButtons];
    const btnData = {
      text: btnText.trim(),
      url: btnUrl.trim() || '#',
      icon: btnIcon.trim() || 'fa-solid fa-arrow-up-right-from-square',
      color: btnColor || 'primary',
      targetBlank: btnTargetBlank,
      action: btnAction || 'link'
    };

    if (editingHeaderBtnIdx !== null) {
      updated[editingHeaderBtnIdx] = btnData;
    } else {
      updated.push(btnData);
    }

    setHeaderButtons(updated);
    await saveSidebarConfig(null, updated);

    // Reset Form
    setBtnText('');
    setBtnUrl('');
    setBtnIcon('fa-solid fa-arrow-up-right-from-square');
    setBtnColor('primary');
    setBtnTargetBlank(false);
    setBtnAction('link');
    setEditingHeaderBtnIdx(null);
    setShowNewHeaderBtn(false);
  };

  const handleEditHeaderBtn = (idx) => {
    const btn = headerButtons[idx];
    setBtnText(btn.text);
    setBtnUrl(btn.url);
    setBtnIcon(btn.icon || 'fa-solid fa-arrow-up-right-from-square');
    setBtnColor(btn.color || 'primary');
    setBtnTargetBlank(!!btn.targetBlank);
    setBtnAction(btn.action || 'link');
    setEditingHeaderBtnIdx(idx);
    setShowNewHeaderBtn(true);
  };

  const handleDeleteHeaderBtn = async (idx) => {
    const confirm = await showTopAlert('আপনি কি এই হেডার বোতামটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;
    const updated = headerButtons.filter((_, i) => i !== idx);
    setHeaderButtons(updated);
    await saveSidebarConfig(null, updated);
  };

  const getButtonBg = (color) => {
    switch (color) {
      case 'primary': return '#0284c7';
      case 'success': return '#16a34a';
      case 'danger': return '#dc2626';
      case 'warning': return '#d97706';
      case 'info': return '#0891b2';
      case 'dark': return '#334155';
      default: return '#0284c7';
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 15px' }}>
      <style jsx>{`
        .admin-card {
          background: #fff;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        .admin-card h2 {
          font-size: 19px;
          color: #1e293b;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 10px;
        }
        .menu-list-item {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 14px 18px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
          position: relative;
        }
        .menu-list-item.drag-over-top {
          border-top: 3px solid #007bff;
        }
        .menu-list-item.drag-over-bottom {
          border-bottom: 3px solid #007bff;
        }
        .drag-handle {
          cursor: grab;
          color: #94a3b8;
          margin-right: 12px;
          font-size: 16px;
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .btn-order {
          background: #e2e8f0;
          border: none;
          color: #475569;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .btn-order:hover:not(:disabled) {
          background: #007bff;
          color: white;
        }
        .btn-order:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .btn-primary {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary:hover { background-color: #0056b3; }
        .btn-secondary {
          background-color: #64748b;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13.5px;
        }
        .btn-danger {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12.5px;
        }
        .btn-danger:hover { background-color: #dc2626; }
        .btn-edit {
          background-color: #f59e0b;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12.5px;
        }
        .btn-edit:hover { background-color: #d97706; }
        .btn-sub {
          background-color: #10b981;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12.5px;
        }
        .btn-sub:hover { background-color: #059669; }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 5px;
        }
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 13.5px;
          outline: none;
        }
        .form-control:focus { border-color: #007bff; }
        .submenu-item {
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 4px;
          padding: 8px 14px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-btn-preview-bar {
          background: #0f172a;
          padding: 12px 20px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          border: 1px solid #1e293b;
        }
      `}</style>

      {/* Page Header Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', color: '#1e293b', fontWeight: 'bold' }}>
          <i className="fa-solid fa-list-check" style={{ color: '#007bff', marginRight: '10px' }}></i>
          অ্যাডমিন সাইডবার ও হেডার কন্ট্রোল ড্যাশবোর্ড
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          বাম পাশের সাইডবার মেনু এবং উপরের কালো হেডার বারের বোতামগুলো সাজান ও নিয়ন্ত্রণ করুন।
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ADMIN SIDEBAR MENU LIST (Existing functionality fully preserved) */}
      {/* ========================================================================= */}
      <div className="admin-card">
        <h2>
          <span>
            <i className="fa-solid fa-bars" style={{ color: '#007bff', marginRight: '8px' }}></i>
            অ্যাডমিন সাইডবার মেনু তালিকা (Sidebar Menus)
          </span>
          <button className="btn-primary" onClick={() => setShowNewMenu(!showNewMenu)}>
            <i className={`fa-solid ${showNewMenu ? 'fa-xmark' : 'fa-plus'}`}></i>
            {showNewMenu ? 'বাতিল করুন' : 'নতুন মেনু যোগ করুন'}
          </button>
        </h2>

        {/* Add/Edit Sidebar Menu Form */}
        {showNewMenu && (
          <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1e293b' }}>
              <i className="fa-solid fa-circle-plus" style={{ color: '#007bff', marginRight: '6px' }}></i>
              নতুন সাইডবার মেনু তথ্য
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label>মেনু টাইটেল *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="যেমন: ড্যাশবোর্ড"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>লিংক URL *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="যেমন: /admin/dashboard"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>আইকন ক্লাস (FontAwesome)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="যেমন: fa-solid fa-gauge-high"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={handleAddMenu}>
                <i className="fa-solid fa-check"></i> মেনু সংরক্ষণ করুন
              </button>
              <button className="btn-secondary" onClick={() => setShowNewMenu(false)}>
                বাতিল
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Menu List */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
            <i className="fa-solid fa-spinner fa-spin"></i> মেনু লোড হচ্ছে...
          </p>
        ) : menus.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            কোনো সাইডবার মেনু পাওয়া যায়নি।
          </p>
        ) : (
          <div>
            {menus.map((m, idx) => (
              <div
                key={idx}
                className={`menu-list-item ${menuDropPos[idx] === 'top' ? 'drag-over-top' : ''} ${menuDropPos[idx] === 'bottom' ? 'drag-over-bottom' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="drag-handle" title="মাউস দিয়ে টেনে স্থান পরিবর্তন করুন">
                      <i className="fa-solid fa-grip-vertical"></i>
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        className="btn-order"
                        disabled={idx === 0}
                        onClick={() => moveMenu(idx, idx - 1)}
                        title="উপরে নিন"
                      >
                        ▲
                      </button>
                      <button
                        className="btn-order"
                        disabled={idx === menus.length - 1}
                        onClick={() => moveMenu(idx, idx + 1)}
                        title="নিচে নিন"
                      >
                        ▼
                      </button>
                    </div>

                    <div style={{ marginLeft: '6px' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {m.icon && <i className={m.icon} style={{ color: '#007bff' }}></i>}
                        <span>{m.title}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                        URL: <code>{m.url || '#'}</code>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn-sub" onClick={() => setAddingSubMenuIdx(addingSubMenuIdx === idx ? null : idx)}>
                      <i className="fa-solid fa-plus"></i> সাব-মেনু
                    </button>
                    <button className="btn-danger" onClick={() => handleDeleteMenu(idx)}>
                      <i className="fa-solid fa-trash"></i> মুছুন
                    </button>
                  </div>
                </div>

                {/* Submenu Add Form */}
                {addingSubMenuIdx === idx && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '5px', border: '1px solid #cbd5e1' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '13.5px', color: '#1e293b' }}>
                      {m.title}-এ নতুন সাব-মেনু যোগ করুন
                    </h5>
                    <div className="form-grid">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="সাব-মেনু টাইটেল *"
                        value={newSubTitle}
                        onChange={(e) => setNewSubTitle(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="সাব-মেনু URL *"
                        value={newSubUrl}
                        onChange={(e) => setNewSubUrl(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="আইকন ক্লাস (ঐচ্ছিক)"
                        value={newSubIcon}
                        onChange={(e) => setNewSubIcon(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button className="btn-primary" onClick={() => handleAddSubMenu(idx)}>
                        যোগ করুন
                      </button>
                      <button className="btn-secondary" onClick={() => setAddingSubMenuIdx(null)}>
                        বাতিল
                      </button>
                    </div>
                  </div>
                )}

                {/* Submenu List */}
                {m.subMenus && m.subMenus.length > 0 && (
                  <div style={{ marginTop: '10px', paddingLeft: '25px', borderLeft: '2px solid #cbd5e1' }}>
                    {m.subMenus.map((sub, sIdx) => (
                      <div key={sIdx} className="submenu-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {sub.icon && <i className={sub.icon} style={{ color: '#10b981', fontSize: '12px' }}></i>}
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{sub.title}</span>
                          <span style={{ color: '#64748b', fontSize: '12px' }}>({sub.url})</span>
                        </div>
                        <button className="btn-danger" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => handleDeleteSubMenu(idx, sIdx)}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: ADMIN TOP BLACK HEADER BUTTONS CONTROL (Requested New Section) */}
      {/* ========================================================================= */}
      <div className="admin-card">
        <h2>
          <span>
            <i className="fa-solid fa-window-maximize" style={{ color: '#0f172a', marginRight: '8px' }}></i>
            অ্যাডমিন হেডার বোতাম কন্ট্রোল (Admin Top Header Buttons)
          </span>
          <button
            className="btn-primary"
            style={{ backgroundColor: '#0f172a' }}
            onClick={() => {
              setShowNewHeaderBtn(!showNewHeaderBtn);
              setEditingHeaderBtnIdx(null);
              setBtnText('');
              setBtnUrl('');
              setBtnIcon('fa-solid fa-arrow-up-right-from-square');
              setBtnColor('primary');
              setBtnTargetBlank(false);
              setBtnAction('link');
            }}
          >
            <i className={`fa-solid ${showNewHeaderBtn ? 'fa-xmark' : 'fa-plus'}`}></i>
            {showNewHeaderBtn ? 'বাতিল করুন' : 'নতুন হেডার বোতাম যোগ করুন'}
          </button>
        </h2>

        <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '15px' }}>
          এখানে কনফিগার করা বোতামগুলো অ্যাডমিন প্যানেলের উপরের কালো ব্যাকগ্রাউন্ড হেডারে সরাসরি দৃশ্যমান হবে।
        </p>

        {/* Live Preview Bar */}
        <div style={{ marginBottom: '10px', fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>
          <i className="fa-solid fa-eye" style={{ marginRight: '6px' }}></i> লাইভ প্রিভিউ (Live Header Preview):
        </div>
        <div className="header-btn-preview-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
          {headerButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              style={{
                backgroundColor: getButtonBg(btn.color),
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              {btn.icon && <i className={btn.icon}></i>}
              {btn.text}
            </button>
          ))}
        </div>

        {/* Add/Edit Header Button Form */}
        {showNewHeaderBtn && (
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1e293b' }}>
              <i className="fa-solid fa-pen-to-square" style={{ color: '#0f172a', marginRight: '6px' }}></i>
              {editingHeaderBtnIdx !== null ? 'হেডার বোতাম এডিট করুন' : 'নতুন হেডার বোতাম তথ্য'}
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <label>বোতামের নাম (Label) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="যেমন: ওয়েবসাইট ভিজিট"
                  value={btnText}
                  onChange={(e) => setBtnText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>বোতাম লিংক (URL) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="যেমন: /admin/quiz-dashboard বা /"
                  value={btnUrl}
                  onChange={(e) => setBtnUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>আইকন ক্লাস (FontAwesome)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="যেমন: fa-solid fa-globe"
                  value={btnIcon}
                  onChange={(e) => setBtnIcon(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>কালার থিম (Theme)</label>
                <select
                  className="form-control"
                  value={btnColor}
                  onChange={(e) => setBtnColor(e.target.value)}
                >
                  <option value="primary">Primary (Blue)</option>
                  <option value="success">Success (Green)</option>
                  <option value="danger">Danger (Red)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="info">Info (Cyan)</option>
                  <option value="dark">Dark (Slate)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={btnTargetBlank}
                  onChange={(e) => setBtnTargetBlank(e.target.checked)}
                />
                নতুন ট্যাবে ওপেন হবে (Open in New Tab)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={btnAction === 'logout'}
                  onChange={(e) => setBtnAction(e.target.checked ? 'logout' : 'link')}
                />
                এটি লগআউট বোতাম (Logout Action)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" style={{ backgroundColor: '#0f172a' }} onClick={handleSaveHeaderBtn}>
                <i className="fa-solid fa-check"></i> {editingHeaderBtnIdx !== null ? 'আপডেট করুন' : 'বোতাম যোগ করুন'}
              </button>
              <button className="btn-secondary" onClick={() => setShowNewHeaderBtn(false)}>
                বাতিল
              </button>
            </div>
          </div>
        )}

        {/* Header Buttons Sortable List */}
        {headerButtons.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            কোনো হেডার বোতাম পাওয়া যায়নি। নতুন বোতাম যোগ করুন।
          </p>
        ) : (
          <div>
            {headerButtons.map((btn, idx) => (
              <div
                key={idx}
                className={`menu-list-item ${btnDropPos[idx] === 'top' ? 'drag-over-top' : ''} ${btnDropPos[idx] === 'bottom' ? 'drag-over-bottom' : ''}`}
                draggable
                onDragStart={(e) => handleBtnDragStart(e, idx)}
                onDragOver={(e) => handleBtnDragOver(e, idx)}
                onDragLeave={handleBtnDragLeave}
                onDrop={(e) => handleBtnDrop(e, idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="drag-handle" title="মাউস দিয়ে টেনে স্থান পরিবর্তন করুন">
                      <i className="fa-solid fa-grip-vertical"></i>
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        className="btn-order"
                        disabled={idx === 0}
                        onClick={() => moveHeaderBtn(idx, idx - 1)}
                        title="উপরে নিন"
                      >
                        ▲
                      </button>
                      <button
                        className="btn-order"
                        disabled={idx === headerButtons.length - 1}
                        onClick={() => moveHeaderBtn(idx, idx + 1)}
                        title="নিচে নিন"
                      >
                        ▼
                      </button>
                    </div>

                    <div style={{ marginLeft: '6px' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: getButtonBg(btn.color)
                          }}
                        ></span>
                        {btn.icon && <i className={btn.icon}></i>}
                        <span>{btn.text}</span>
                        {btn.targetBlank && (
                          <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px' }}>
                            New Tab
                          </span>
                        )}
                        {btn.action === 'logout' && (
                          <span style={{ fontSize: '11px', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px' }}>
                            Logout
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                        URL: <code>{btn.url || '#'}</code> | কালার: <strong>{btn.color}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-edit" onClick={() => handleEditHeaderBtn(idx)}>
                      <i className="fa-solid fa-pen"></i> এডিট
                    </button>
                    <button className="btn-danger" onClick={() => handleDeleteHeaderBtn(idx)}>
                      <i className="fa-solid fa-trash"></i> মুছুন
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
