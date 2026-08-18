'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

const defaultMenus = [
  { href: '/admin/dashboard', icon: 'fa-solid fa-gauge-high', label: 'ড্যাশবোর্ড', subMenus: [] },
  { href: '/admin/header-dashboard', icon: 'fa-solid fa-window-restore', label: 'হেডার কন্ট্রোল', subMenus: [] },
  { href: '/admin/footer-dashboard', icon: 'fa-solid fa-table-columns', label: 'ফুটার কন্ট্রোল', subMenus: [] },
  { href: '/admin/home-dashboard', icon: 'fa-solid fa-sliders', label: 'হোম পেজ কন্ট্রোল', subMenus: [] },
  { href: '/admin/about-dashboard', icon: 'fa-solid fa-address-card', label: 'আমাদের সম্পর্কে', subMenus: [] },
  { href: '/admin/quiz-dashboard', icon: 'fa-solid fa-file-circle-question', label: 'প্রশ্ন ব্যাংক ও কুইজ', subMenus: [] },
  { href: '/admin/packages-dashboard', icon: 'fa-solid fa-box-open', label: 'প্যাকেজসমূহ পেজ', subMenus: [] },
  { href: '/admin/users', icon: 'fa-solid fa-users-gear', label: 'ইউজার ও সাবস্ক্রিপশন', subMenus: [] },
  { href: '/admin/admin-menu-dashboard', icon: 'fa-solid fa-list-check', label: 'সাইডবার মেনু কন্ট্রোল', subMenus: [] },
  { href: '/admin/policy-dashboard', icon: 'fa-solid fa-file-invoice-dollar', label: 'রিফান্ড ও পলিসি', subMenus: [] },
  { href: '/admin/free-mcqs-dashboard', icon: 'fa-solid fa-gift', label: 'ফ্রি এমসিকিউ কন্ট্রোল', subMenus: [] }
];

export default function AdminMenuDashboardPage() {
  const [menus, setMenus] = useState([]);
  const [headerButtons, setHeaderButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReordered, setIsReordered] = useState(false);

  // New Menu Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('fa-solid fa-link');

  // Inline Editing State
  const [editingMenuIndex, setEditingMenuIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editIcon, setEditIcon] = useState('');

  // Inline Submenu Form State
  const [activeSubmenuMenuIndex, setActiveSubmenuMenuIndex] = useState(null);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubUrl, setNewSubUrl] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('fa-solid fa-circle-dot');

  // Header Button Form State
  const [newBtnText, setNewBtnText] = useState('');
  const [newBtnUrl, setNewBtnUrl] = useState('');
  const [newBtnIcon, setNewBtnIcon] = useState('fa-solid fa-arrow-up-right-from-square');
  const [newBtnColor, setNewBtnColor] = useState('primary');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sidebar-config');
      const data = await res.json();
      if (data && data.menus && data.menus.length > 0) {
        setMenus(
          data.menus.map((m) => ({
            label: m.title || m.label,
            href: m.url || m.href,
            icon: m.icon || 'fa-solid fa-link',
            subMenus: m.subMenus || []
          }))
        );
      } else {
        setMenus(defaultMenus);
      }

      if (data && data.headerButtons) {
        setHeaderButtons(data.headerButtons);
      }
    } catch (err) {
      console.error('Failed to load sidebar config:', err);
      setMenus(defaultMenus);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveToDB = async (menusToSave = menus, btnsToSave = headerButtons) => {
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    const formattedMenus = menusToSave.map((m) => ({
      title: m.label,
      url: m.href,
      icon: m.icon,
      subMenus: (m.subMenus || []).map((s) => ({
        title: s.title || s.label,
        url: s.url || s.href,
        icon: s.icon || 'fa-solid fa-circle-dot'
      }))
    }));

    try {
      const res = await fetch('/api/sidebar-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          menus: formattedMenus,
          headerButtons: btnsToSave
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ সাইডবার ও হেডার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        setIsReordered(false);
      } else {
        showTopAlert('❌ ' + (data.message || 'সংরক্ষণ ব্যর্থ হয়েছে'), 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার কানেকশন এরর!', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Add New Menu
  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newMenu = {
      label: newTitle.trim(),
      href: newUrl.trim(),
      icon: newIcon.trim() || 'fa-solid fa-link',
      subMenus: []
    };

    const updated = [...menus, newMenu];
    setMenus(updated);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('fa-solid fa-link');
    handleSaveToDB(updated);
  };

  // Delete Menu
  const handleDeleteMenu = (index) => {
    if (!window.confirm('আপনি কি এই মেনুটি মুছে ফেলতে চান?')) return;
    const updated = menus.filter((_, i) => i !== index);
    setMenus(updated);
    handleSaveToDB(updated);
  };

  // Move Menu Position
  const moveMenu = (index, dir) => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === menus.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const updated = [...menus];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setMenus(updated);
    setIsReordered(true);
  };

  // Inline Edit
  const handleStartEdit = (index) => {
    setEditingMenuIndex(index);
    setEditTitle(menus[index].label);
    setEditUrl(menus[index].href);
    setEditIcon(menus[index].icon);
  };

  const handleSaveEdit = (index) => {
    const updated = [...menus];
    updated[index] = {
      ...updated[index],
      label: editTitle.trim(),
      href: editUrl.trim(),
      icon: editIcon.trim() || 'fa-solid fa-link'
    };
    setMenus(updated);
    setEditingMenuIndex(null);
    handleSaveToDB(updated);
  };

  // Add Submenu
  const handleAddSubmenu = (menuIndex) => {
    if (!newSubTitle.trim() || !newSubUrl.trim()) return;
    const updated = [...menus];
    const subList = updated[menuIndex].subMenus || [];
    updated[menuIndex].subMenus = [
      ...subList,
      {
        title: newSubTitle.trim(),
        url: newSubUrl.trim(),
        icon: newSubIcon.trim() || 'fa-solid fa-circle-dot'
      }
    ];
    setMenus(updated);
    setNewSubTitle('');
    setNewSubUrl('');
    setActiveSubmenuMenuIndex(null);
    handleSaveToDB(updated);
  };

  // Delete Submenu
  const handleDeleteSubmenu = (menuIndex, subIndex) => {
    const updated = [...menus];
    updated[menuIndex].subMenus = (updated[menuIndex].subMenus || []).filter((_, idx) => idx !== subIndex);
    setMenus(updated);
    handleSaveToDB(updated);
  };

  // Header Button Actions
  const handleAddHeaderBtn = (e) => {
    e.preventDefault();
    if (!newBtnText.trim() || !newBtnUrl.trim()) return;

    const newBtn = {
      text: newBtnText.trim(),
      url: newBtnUrl.trim(),
      icon: newBtnIcon.trim() || 'fa-solid fa-link',
      color: newBtnColor,
      targetBlank: true,
      action: 'link'
    };

    const updated = [...headerButtons, newBtn];
    setHeaderButtons(updated);
    setNewBtnText('');
    setNewBtnUrl('');
    handleSaveToDB(menus, updated);
  };

  const handleDeleteHeaderBtn = (index) => {
    const updated = headerButtons.filter((_, idx) => idx !== index);
    setHeaderButtons(updated);
    handleSaveToDB(menus, updated);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>মেনু কনফিগারেশন লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 30px 25px' }}>
      <style jsx>{`
        :root {
          --primary: #007bff;
          --primary-dark: #0056b3;
          --secondary: #17a2b8;
          --warning: #ff9f43;
          --danger: #dc3545;
          --dark: #2c3e50;
          --light: #f4f7f6;
          --main-dash-btn: #28a745;
        }

        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr auto;
          gap: 12px;
          align-items: flex-end;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 0;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13px;
          color: #475569;
        }
        input,
        select {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus,
        select:focus {
          border-color: #007bff;
        }

        .menu-item-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .menu-item-card:hover {
          background: #f1f5f9;
        }
        .menu-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .btn {
          padding: 8px 14px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.2s;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .btn-success {
          background: #28a745;
          color: white;
        }
        .btn-warning {
          background: #ffc107;
          color: #212529;
        }
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        .btn-secondary {
          background: #64748b;
          color: white;
        }

        .arrow-btn-group {
          display: inline-flex;
          flex-direction: column;
          gap: 2px;
          margin-right: 8px;
        }
        .btn-arrow {
          background: #e2e8f0;
          border: none;
          color: #475569;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 9px;
          cursor: pointer;
        }
        .btn-arrow:hover {
          background: #007bff;
          color: white;
        }

        .submenu-container {
          margin-top: 12px;
          padding-left: 20px;
          border-left: 3px solid #cbd5e1;
        }
        .submenu-item {
          background: white;
          border: 1px dashed #cbd5e1;
          border-radius: 5px;
          padding: 8px 12px;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bottom-action-bar {
          position: sticky;
          bottom: 20px;
          background: #1e293b;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          z-index: 100;
          margin-top: 20px;
        }

        @media (max-width: 900px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 1. SIDEBAR MENUS BUILDER */}
      <div className="box" style={{ borderLeft: '6px solid #475569' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>
              <i className="fa-solid fa-list-check" style={{ color: '#475569', marginRight: '8px' }}></i>
              সাইডবার মেনু কন্ট্রোল (Sidebar Navigation Builder)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              অ্যাডমিন প্যানেলের সাইডবারে কোন কোন মেনু ও সাবমেনু দৃশ্যমান হবে তা এখান থেকে সাজান।
            </p>
          </div>
          <button className="btn btn-success" onClick={() => handleSaveToDB()} disabled={saving}>
            <i className="fa-solid fa-floppy-disk"></i> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </button>
        </div>

        {/* Add New Menu Form */}
        <form onSubmit={handleAddMenu} className="form-grid">
          <div className="form-group">
            <label>মেনুর শিরোনাম (Title):</label>
            <input
              type="text"
              placeholder="যেমন: নোটিশ বোর্ড"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>লিংক / URL:</label>
            <input
              type="text"
              placeholder="যেমন: /admin/notices"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>FontAwesome Icon ক্লাস:</label>
            <input
              type="text"
              placeholder="যেমন: fa-solid fa-bullhorn"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '40px' }}>
            <i className="fa-solid fa-plus"></i> মেনু যোগ করুন
          </button>
        </form>

        {/* Menus List */}
        <div>
          {menus.map((menu, index) => {
            const isEditing = editingMenuIndex === index;
            const subMenus = menu.subMenus || [];
            const isAddingSub = activeSubmenuMenuIndex === index;

            return (
              <div key={index} className="menu-item-card">
                {isEditing ? (
                  /* INLINE EDIT */
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr auto', gap: '10px' }}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="URL"
                      />
                      <input
                        type="text"
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        placeholder="Icon"
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => handleSaveEdit(index)}
                        >
                          💾 Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setEditingMenuIndex(null)}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* READ VIEW */
                  <div>
                    <div className="menu-item-header">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="arrow-btn-group">
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveMenu(index, 'up')}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-arrow"
                            onClick={() => moveMenu(index, 'down')}
                          >
                            ▼
                          </button>
                        </div>
                        <i
                          className={menu.icon || 'fa-solid fa-link'}
                          style={{ fontSize: '16px', color: '#007bff', marginRight: '10px' }}
                        ></i>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#1e293b' }}>{menu.label}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            <code>{menu.href}</code> {subMenus.length > 0 && `• (${subMenus.length} সাবমেনু)`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            setActiveSubmenuMenuIndex(isAddingSub ? null : index)
                          }
                        >
                          <i className="fa-solid fa-plus"></i> Submenu
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => handleStartEdit(index)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteMenu(index)}
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>

                    {/* Inline Add Submenu Form */}
                    {isAddingSub && (
                      <div style={{ marginTop: '10px', padding: '10px', background: '#eef6ff', borderRadius: '6px', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Submenu Title"
                          value={newSubTitle}
                          onChange={(e) => setNewSubTitle(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Submenu URL"
                          value={newSubUrl}
                          onChange={(e) => setNewSubUrl(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Submenu Icon"
                          value={newSubIcon}
                          onChange={(e) => setNewSubIcon(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => handleAddSubmenu(index)}
                          >
                            + Add
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setActiveSubmenuMenuIndex(null)}
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submenus List */}
                    {subMenus.length > 0 && (
                      <div className="submenu-container">
                        {subMenus.map((sub, sIdx) => (
                          <div key={sIdx} className="submenu-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <i className={sub.icon || 'fa-solid fa-circle-dot'} style={{ fontSize: '11px', color: '#17a2b8' }}></i>
                              <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#334155' }}>
                                {sub.title || sub.label}
                              </span>
                              <code style={{ fontSize: '11px', color: '#64748b' }}>{sub.url || sub.href}</code>
                            </div>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ padding: '2px 6px', fontSize: '10px' }}
                              onClick={() => handleDeleteSubmenu(index, sIdx)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. HEADER ACTION BUTTONS */}
      <div className="box" style={{ borderLeft: '6px solid var(--secondary, #17a2b8)' }}>
        <h2>
          <i className="fa-solid fa-window-maximize" style={{ color: 'var(--secondary)', marginRight: '8px' }}></i>
          অ্যাডমিন টপ হেডার বাটনসমূহ (Header Quick Actions)
        </h2>
        <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '4px' }}>
          হেডারের ডানপাশে দৃশ্যমান কুইক অ্যাকশন বাটনগুলো পরিচালনা করুন।
        </p>

        <form onSubmit={handleAddHeaderBtn} className="form-grid">
          <div className="form-group">
            <label>বাটন টেক্সট:</label>
            <input
              type="text"
              placeholder="যেমন: ওয়েবসাইট ভিজিট"
              value={newBtnText}
              onChange={(e) => setNewBtnText(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>লিংক / URL:</label>
            <input
              type="text"
              placeholder="যেমন: /"
              value={newBtnUrl}
              onChange={(e) => setNewBtnUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>রঙ ও স্টাইল:</label>
            <select value={newBtnColor} onChange={(e) => setNewBtnColor(e.target.value)}>
              <option value="primary">Primary (Blue)</option>
              <option value="success">Success (Green)</option>
              <option value="warning">Warning (Orange)</option>
              <option value="info">Info (Cyan)</option>
              <option value="danger">Danger (Red)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '40px' }}>
            <i className="fa-solid fa-plus"></i> বাটন যোগ করুন
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
          {headerButtons.map((btn, index) => (
            <div
              key={index}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className={btn.icon || 'fa-solid fa-link'}></i>
              <span style={{ fontWeight: 'bold', fontSize: '13.5px' }}>{btn.text}</span>
              <code style={{ fontSize: '11px', color: '#64748b' }}>({btn.url})</code>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ padding: '2px 6px', fontSize: '10px', marginLeft: '6px' }}
                onClick={() => handleDeleteHeaderBtn(index)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Reorder Save Bar */}
      {isReordered && (
        <div className="bottom-action-bar">
          <span>⚠️ মেনুর পজিশন পরিবর্তন করা হয়েছে!</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-success" onClick={() => handleSaveToDB()}>
              <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
            </button>
            <button className="btn btn-secondary" onClick={() => fetchConfig()}>
              <i className="fa-solid fa-xmark"></i> বাতিল
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
