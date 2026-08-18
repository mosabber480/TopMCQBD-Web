'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

const defaultLayoutConfig = {
  announcement: {
    text: 'বিসিএস ও অন্যান্য সরকারি চাকরির প্রস্তুতিমূলক সেরা MCQ প্ল্যাটফর্ম TopMCQBD তে স্বাগতম!',
    link: '/packages'
  },
  header: {
    siteTitle: 'TopMCQBD',
    logoUrl: '/images/logo.png',
    seoTitle: 'TopMCQBD - Best MCQ Practice Platform in Bangladesh',
    faviconUrl: '/favicon.ico',
    btnText: 'সাবস্ক্রিপশন নিন',
    btnLink: '/packages',
    menus: [
      { title: 'হোম', url: '/', subMenus: [] },
      { title: 'আমাদের সম্পর্কে', url: '/about-us', subMenus: [] },
      { title: 'প্যাকেজসমূহ', url: '/packages', subMenus: [] },
      { title: 'ফ্রি এমসিকিউ', url: '/free-mcqs', subMenus: [] },
      { title: 'পলিসি ও রিফান্ড', url: '/policy', subMenus: [] }
    ],
    megaMenus: []
  },
  footer: {
    columns: []
  },
  copyright: {
    text: '© 2026 TopMCQBD. All rights reserved.',
    links: []
  }
};

export default function AdminHeaderDashboardPage() {
  const [config, setConfig] = useState(defaultLayoutConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReordered, setIsReordered] = useState(false);

  // Announcement State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');

  // Branding State
  const [siteTitle, setSiteTitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  // Header Button State
  const [btnText, setBtnText] = useState('');
  const [btnLink, setBtnLink] = useState('');

  // Navigation Menus State
  const [menus, setMenus] = useState([]);
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [newMenuUrl, setNewMenuUrl] = useState('');

  // Inline Menu Edit State
  const [editingMenuIdx, setEditingMenuIdx] = useState(null);
  const [editMenuTitle, setEditMenuTitle] = useState('');
  const [editMenuUrl, setEditMenuUrl] = useState('');

  // Submenu Form State
  const [activeSubMenuIdx, setActiveSubMenuIdx] = useState(null);
  const [newSubMenuTitle, setNewSubMenuTitle] = useState('');
  const [newSubMenuUrl, setNewSubMenuUrl] = useState('');

  // Mega Menu State
  const [megaMenus, setMegaMenus] = useState([]);
  const [newMegaTitle, setNewMegaTitle] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/layout-config');
      const data = await res.json();
      if (data && data.header) {
        setConfig(data);
        setAnnouncementText(data.announcement?.text || '');
        setAnnouncementLink(data.announcement?.link || '');
        setSiteTitle(data.header?.siteTitle || '');
        setLogoUrl(data.header?.logoUrl || '');
        setSeoTitle(data.header?.seoTitle || '');
        setFaviconUrl(data.header?.faviconUrl || '');
        setBtnText(data.header?.btnText || '');
        setBtnLink(data.header?.btnLink || '');
        setMenus(data.header?.menus || defaultLayoutConfig.header.menus);
        setMegaMenus(data.header?.megaMenus || []);
      } else {
        setConfig(defaultLayoutConfig);
        setAnnouncementText(defaultLayoutConfig.announcement.text);
        setAnnouncementLink(defaultLayoutConfig.announcement.link);
        setSiteTitle(defaultLayoutConfig.header.siteTitle);
        setLogoUrl(defaultLayoutConfig.header.logoUrl);
        setSeoTitle(defaultLayoutConfig.header.seoTitle);
        setFaviconUrl(defaultLayoutConfig.header.faviconUrl);
        setBtnText(defaultLayoutConfig.header.btnText);
        setBtnLink(defaultLayoutConfig.header.btnLink);
        setMenus(defaultLayoutConfig.header.menus);
        setMegaMenus([]);
      }
    } catch (err) {
      console.error('Failed to load header config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveToDB = async (customConfig = null) => {
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    const payload = customConfig || {
      ...config,
      announcement: {
        text: announcementText,
        link: announcementLink
      },
      header: {
        siteTitle,
        logoUrl,
        seoTitle,
        faviconUrl,
        btnText,
        btnLink,
        menus,
        megaMenus
      }
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
      const data = await res.json();
      if (res.ok) {
        showTopAlert('✅ হেডার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        setConfig(payload);
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

  // Add Menu
  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!newMenuTitle.trim() || !newMenuUrl.trim()) return;

    const newMenu = {
      title: newMenuTitle.trim(),
      url: newMenuUrl.trim(),
      subMenus: []
    };

    const updated = [...menus, newMenu];
    setMenus(updated);
    setNewMenuTitle('');
    setNewMenuUrl('');
    handleSaveToDB({
      ...config,
      header: { ...config.header, menus: updated, megaMenus }
    });
  };

  // Delete Menu
  const handleDeleteMenu = (index) => {
    if (!window.confirm('আপনি কি এই মেনুটি মুছে ফেলতে চান?')) return;
    const updated = menus.filter((_, i) => i !== index);
    setMenus(updated);
    handleSaveToDB({
      ...config,
      header: { ...config.header, menus: updated, megaMenus }
    });
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

  // Inline Edit Menu
  const handleStartEditMenu = (index) => {
    setEditingMenuIdx(index);
    setEditMenuTitle(menus[index].title);
    setEditMenuUrl(menus[index].url);
  };

  const handleSaveEditMenu = (index) => {
    const updated = [...menus];
    updated[index] = {
      ...updated[index],
      title: editMenuTitle.trim(),
      url: editMenuUrl.trim()
    };
    setMenus(updated);
    setEditingMenuIdx(null);
    handleSaveToDB({
      ...config,
      header: { ...config.header, menus: updated, megaMenus }
    });
  };

  // Add SubMenu
  const handleAddSubMenu = (menuIdx) => {
    if (!newSubMenuTitle.trim() || !newSubMenuUrl.trim()) return;
    const updated = [...menus];
    const subList = updated[menuIdx].subMenus || [];
    updated[menuIdx].subMenus = [
      ...subList,
      {
        title: newSubMenuTitle.trim(),
        url: newSubMenuUrl.trim()
      }
    ];
    setMenus(updated);
    setNewSubMenuTitle('');
    setNewSubMenuUrl('');
    setActiveSubMenuIdx(null);
    handleSaveToDB({
      ...config,
      header: { ...config.header, menus: updated, megaMenus }
    });
  };

  // Delete SubMenu
  const handleDeleteSubMenu = (menuIdx, subIdx) => {
    const updated = [...menus];
    updated[menuIdx].subMenus = (updated[menuIdx].subMenus || []).filter((_, idx) => idx !== subIdx);
    setMenus(updated);
    handleSaveToDB({
      ...config,
      header: { ...config.header, menus: updated, megaMenus }
    });
  };

  // Mega Menu Actions
  const handleAddMegaMenu = (e) => {
    e.preventDefault();
    if (!newMegaTitle.trim()) return;

    const newMega = {
      id: 'mega_' + Date.now(),
      title: newMegaTitle.trim(),
      columns: [
        {
          title: 'কলাম ১',
          links: [{ title: 'প্রথম লিংক', url: '/' }]
        }
      ]
    };

    const updated = [...megaMenus, newMega];
    setMegaMenus(updated);
    setNewMegaTitle('');
    handleSaveToDB({
      ...config,
      header: { ...config.header, menus, megaMenus: updated }
    });
  };

  const handleDeleteMegaMenu = (megaIdx) => {
    if (!window.confirm('আপনি কি এই মেগা মেনুটি মুছে ফেলতে চান?')) return;
    const updated = megaMenus.filter((_, idx) => idx !== megaIdx);
    setMegaMenus(updated);
    handleSaveToDB({
      ...config,
      header: { ...config.header, menus, megaMenus: updated }
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>হেডার কনফিগারেশন লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 30px 25px' }}>
      <style jsx>{`
        :root {
          --primary: #007bff;
          --secondary: #17a2b8;
          --warning: #ff9f43;
          --danger: #dc3545;
          --dark: #2c3e50;
          --light: #f4f7f6;
          --purple-btn: #6f42c1;
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
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        }
        .form-group {
          margin-bottom: 12px;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 6px;
          font-size: 13.5px;
          color: #475569;
        }
        input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus {
          border-color: #007bff;
        }

        .btn {
          padding: 9px 16px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 13.5px;
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

        .menu-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 10px;
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

        @media (max-width: 800px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 1. ANNOUNCEMENT BAR */}
      <div className="box" style={{ borderLeft: '6px solid var(--purple-btn, #6f42c1)' }}>
        <h2>
          <i className="fa-solid fa-bullhorn" style={{ color: 'var(--purple-btn, #6f42c1)', marginRight: '8px' }}></i>
          টপ অ্যানাউন্সমেন্ট বার (Top Announcement Bar)
        </h2>
        <div className="form-grid">
          <div className="form-group">
            <label>অ্যানাউন্সমেন্ট টেক্সট:</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="অ্যানাউন্সমেন্ট টেক্সট লিখুন..."
            />
          </div>
          <div className="form-group">
            <label>ক্লিক করলে যাওয়ার লিংক (URL):</label>
            <input
              type="text"
              value={announcementLink}
              onChange={(e) => setAnnouncementLink(e.target.value)}
              placeholder="যেমন: /packages"
            />
          </div>
        </div>
        <button type="button" className="btn btn-success" onClick={() => handleSaveToDB()} disabled={saving}>
          <i className="fa-solid fa-floppy-disk"></i> অ্যানাউন্সমেন্ট সেভ করুন
        </button>
      </div>

      {/* 2. BRANDING & LOGO */}
      <div className="box" style={{ borderLeft: '6px solid #007bff' }}>
        <h2>
          <i className="fa-solid fa-shield-halved" style={{ color: '#007bff', marginRight: '8px' }}></i>
          লোগো, টাইটেল ও ফেভিকন (Branding & Identity)
        </h2>
        <div className="form-grid">
          <div className="form-group">
            <label>ওয়েবসাইটের টাইটেল (Site Title):</label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="TopMCQBD"
            />
          </div>
          <div className="form-group">
            <label>লোগো URL / পাথ:</label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="/images/logo.png"
            />
          </div>
          <div className="form-group">
            <label>SEO টাইটেল:</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="TopMCQBD - Best Online MCQ Platform"
            />
          </div>
          <div className="form-group">
            <label>ফেভিকন (Favicon) URL:</label>
            <input
              type="text"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="/favicon.ico"
            />
          </div>
        </div>
        <button type="button" className="btn btn-success" onClick={() => handleSaveToDB()} disabled={saving}>
          <i className="fa-solid fa-floppy-disk"></i> ব্র্যান্ডিং সেভ করুন
        </button>
      </div>

      {/* 3. HEADER ACTION BUTTON */}
      <div className="box" style={{ borderLeft: '6px solid #17a2b8' }}>
        <h2>
          <i className="fa-solid fa-hand-pointer" style={{ color: '#17a2b8', marginRight: '8px' }}></i>
          হেডার অ্যাকশন বাটন (Call to Action Button)
        </h2>
        <div className="form-grid">
          <div className="form-group">
            <label>বাটন টেক্সট:</label>
            <input
              type="text"
              value={btnText}
              onChange={(e) => setBtnText(e.target.value)}
              placeholder="যেমন: সাবস্ক্রিপশন নিন"
            />
          </div>
          <div className="form-group">
            <label>বাটন লিংক (URL):</label>
            <input
              type="text"
              value={btnLink}
              onChange={(e) => setBtnLink(e.target.value)}
              placeholder="যেমন: /packages"
            />
          </div>
        </div>
        <button type="button" className="btn btn-success" onClick={() => handleSaveToDB()} disabled={saving}>
          <i className="fa-solid fa-floppy-disk"></i> বাটন সেভ করুন
        </button>
      </div>

      {/* 4. NAVIGATION MENUS */}
      <div className="box" style={{ borderLeft: '6px solid #ff9f43' }}>
        <h2>
          <i className="fa-solid fa-compass" style={{ color: '#ff9f43', marginRight: '8px' }}></i>
          হেডার নেভিগেশন মেনু (Navigation Menus)
        </h2>

        {/* Add Menu Form */}
        <form onSubmit={handleAddMenu} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="মেনু নাম (যেমন: প্যাকেজসমূহ)"
            value={newMenuTitle}
            onChange={(e) => setNewMenuTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="লিংক (যেমন: /packages)"
            value={newMenuUrl}
            onChange={(e) => setNewMenuUrl(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> যোগ করুন
          </button>
        </form>

        {/* Menus List */}
        <div>
          {menus.map((menu, index) => {
            const isEditing = editingMenuIdx === index;
            const subMenus = menu.subMenus || [];
            const isAddingSub = activeSubMenuIdx === index;

            return (
              <div key={index} className="menu-card">
                {isEditing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto', gap: '10px' }}>
                    <input
                      type="text"
                      value={editMenuTitle}
                      onChange={(e) => setEditMenuTitle(e.target.value)}
                    />
                    <input
                      type="text"
                      value={editMenuUrl}
                      onChange={(e) => setEditMenuUrl(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-success btn-sm" onClick={() => handleSaveEditMenu(index)}>
                        💾 Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingMenuIdx(null)}>
                        ❌
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="arrow-btn-group">
                          <button type="button" className="btn-arrow" onClick={() => moveMenu(index, 'up')}>
                            ▲
                          </button>
                          <button type="button" className="btn-arrow" onClick={() => moveMenu(index, 'down')}>
                            ▼
                          </button>
                        </div>
                        <strong style={{ fontSize: '15px', color: '#1e293b' }}>{menu.title}</strong>
                        <code style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px' }}>{menu.url}</code>
                        {subMenus.length > 0 && (
                          <span style={{ fontSize: '12px', color: '#007bff', marginLeft: '8px' }}>
                            ({subMenus.length} সাবমেনু)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActiveSubMenuIdx(isAddingSub ? null : index)}
                        >
                          + Submenu
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => handleStartEditMenu(index)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteMenu(index)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {/* Inline Add SubMenu Form */}
                    {isAddingSub && (
                      <div style={{ marginTop: '10px', padding: '10px', background: '#eef6ff', borderRadius: '6px', display: 'grid', gridTemplateColumns: '2fr 2fr auto', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Submenu Title"
                          value={newSubMenuTitle}
                          onChange={(e) => setNewSubMenuTitle(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Submenu URL"
                          value={newSubMenuUrl}
                          onChange={(e) => setNewSubMenuUrl(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => handleAddSubMenu(index)}
                          >
                            + Add
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setActiveSubMenuIdx(null)}
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submenus List */}
                    {subMenus.length > 0 && (
                      <div style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '3px solid #cbd5e1' }}>
                        {subMenus.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              background: 'white',
                              border: '1px dashed #cbd5e1',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              marginBottom: '5px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <b>{sub.title}</b> <code style={{ fontSize: '11px', color: '#64748b' }}>({sub.url})</code>
                            </div>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              style={{ padding: '2px 6px', fontSize: '10px' }}
                              onClick={() => handleDeleteSubMenu(index, sIdx)}
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

      {/* 5. MEGA MENU BUILDER */}
      <div className="box" style={{ borderLeft: '6px solid #28a745' }}>
        <h2>
          <i className="fa-solid fa-table-cells-large" style={{ color: '#28a745', marginRight: '8px' }}></i>
          মেগা মেনু বিল্ডার (Mega Menu Builder)
        </h2>

        <form onSubmit={handleAddMegaMenu} style={{ display: 'flex', gap: '10px', maxWidth: '500px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="নতুন মেগা মেনু শিরোনাম (যেমন: চাকরির প্রস্তুতি)"
            value={newMegaTitle}
            onChange={(e) => setNewMegaTitle(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <i className="fa-solid fa-plus"></i> মেগা মেনু তৈরি করুন
          </button>
        </form>

        {megaMenus.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>কোনো মেগা মেনু তৈরি করা হয়নি।</p>
        ) : (
          <div>
            {megaMenus.map((mega, mIdx) => (
              <div key={mega.id || mIdx} className="menu-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '15px', color: '#166534' }}>
                    <i className="fa-solid fa-layer-group" style={{ marginRight: '6px' }}></i>
                    {mega.title}
                  </strong>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMegaMenu(mIdx)}>
                    🗑️ Delete Mega Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
