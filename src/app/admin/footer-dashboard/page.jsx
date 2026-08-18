'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

const defaultFooterConfig = {
  announcement: { text: '', link: '' },
  header: {
    siteTitle: '',
    logoUrl: '',
    seoTitle: '',
    faviconUrl: '',
    btnText: '',
    btnLink: '',
    menus: [],
    megaMenus: []
  },
  footer: {
    columns: [
      {
        id: 'col_1',
        type: 'info',
        title: 'TopMCQBD',
        description: 'বাংলাদেশের অন্যতম সেরা অনলাইন কুইজ ও MCQ প্র্যাকটিস প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ ও সরকারি চাকরির চূড়ান্ত প্রস্তুতির বিশ্বস্ত সঙ্গী।',
        socialLinks: {
          facebook: 'https://facebook.com',
          youtube: 'https://youtube.com',
          whatsapp: 'https://wa.me/8801700000000',
          twitter: '',
          telegram: '',
          linkedin: ''
        },
        links: []
      },
      {
        id: 'col_2',
        type: 'links',
        title: 'প্রয়োজনীয় লিংক',
        description: '',
        socialLinks: {},
        links: [
          { title: 'হোম পেজ', url: '/' },
          { title: 'আমাদের সম্পর্কে', url: '/about-us' },
          { title: 'প্যাকেজসমূহ', url: '/packages' },
          { title: 'ফ্রি এমসিকিউ', url: '/free-mcqs' }
        ]
      },
      {
        id: 'col_3',
        type: 'links',
        title: 'জনপ্রিয় পরীক্ষা',
        description: '',
        socialLinks: {},
        links: [
          { title: 'বিসিএস প্রিলিমিনারি', url: '/packages' },
          { title: 'প্রাইমারি সহকারী শিক্ষক', url: '/packages' },
          { title: 'ব্যাংক জব প্রস্তুতি', url: '/packages' },
          { title: 'এনটিআরসিএ (NTRCA)', url: '/packages' }
        ]
      },
      {
        id: 'col_4',
        type: 'links',
        title: 'সহায়তা ও নীতি',
        description: '',
        socialLinks: {},
        links: [
          { title: 'রিফান্ড পলিসি', url: '/policy' },
          { title: 'প্রাইভেসি পলিসি', url: '/policy' },
          { title: 'ব্যবহারের শর্তাবলী', url: '/policy' },
          { title: 'যোগাযোগ করুন', url: '/about-us' }
        ]
      }
    ]
  },
  copyright: {
    text: '© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।',
    links: [
      { title: 'Privacy Policy', url: '/policy' },
      { title: 'Refund Policy', url: '/policy' }
    ]
  }
};

export default function AdminFooterDashboardPage() {
  const [config, setConfig] = useState(defaultFooterConfig);
  const [columns, setColumns] = useState([]);
  const [copyrightText, setCopyrightText] = useState('');
  const [copyrightLinks, setCopyrightLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReordered, setIsReordered] = useState(false);

  // New Link inside Column Form State
  const [newLinkInputs, setNewLinkInputs] = useState({}); // { [colId]: { title: '', url: '' } }

  // New Copyright Link Form State
  const [newCopLinkTitle, setNewCopLinkTitle] = useState('');
  const [newCopLinkUrl, setNewCopLinkUrl] = useState('');

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/layout-config');
      const data = await res.json();
      if (data && data.footer) {
        setConfig(data);
        setColumns(data.footer.columns && data.footer.columns.length > 0 ? data.footer.columns : defaultFooterConfig.footer.columns);
        setCopyrightText(data.copyright?.text || defaultFooterConfig.copyright.text);
        setCopyrightLinks(data.copyright?.links || defaultFooterConfig.copyright.links);
      } else {
        setConfig(defaultFooterConfig);
        setColumns(defaultFooterConfig.footer.columns);
        setCopyrightText(defaultFooterConfig.copyright.text);
        setCopyrightLinks(defaultFooterConfig.copyright.links);
      }
    } catch (err) {
      console.error('Failed to load footer config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveToDB = async (customCols = columns, customText = copyrightText, customLinks = copyrightLinks) => {
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    const payload = {
      ...config,
      footer: {
        columns: customCols
      },
      copyright: {
        text: customText,
        links: customLinks
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
        showTopAlert('✅ ফুটার কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
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

  // Move Column position (Up/Down)
  const moveColumn = (index, dir) => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === columns.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const updated = [...columns];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setColumns(updated);
    setIsReordered(true);
  };

  // Update Column field
  const handleColumnChange = (index, field, value) => {
    const updated = [...columns];
    updated[index][field] = value;
    setColumns(updated);
  };

  // Update Social Links inside Info column
  const handleSocialLinkChange = (index, platform, value) => {
    const updated = [...columns];
    updated[index].socialLinks = {
      ...(updated[index].socialLinks || {}),
      [platform]: value
    };
    setColumns(updated);
  };

  // Add Link into Column
  const handleAddLinkToColumn = (index, colId) => {
    const input = newLinkInputs[colId] || {};
    if (!input.title?.trim() || !input.url?.trim()) return;

    const updated = [...columns];
    const currentLinks = updated[index].links || [];
    updated[index].links = [...currentLinks, { title: input.title.trim(), url: input.url.trim() }];
    setColumns(updated);
    setNewLinkInputs({ ...newLinkInputs, [colId]: { title: '', url: '' } });
    handleSaveToDB(updated);
  };

  // Delete Link from Column
  const handleDeleteLinkFromColumn = (colIdx, linkIdx) => {
    const updated = [...columns];
    updated[colIdx].links = updated[colIdx].links.filter((_, idx) => idx !== linkIdx);
    setColumns(updated);
    handleSaveToDB(updated);
  };

  // Add Column
  const handleAddColumn = () => {
    if (columns.length >= 4) {
      showTopAlert('সর্বোচ্চ ৪টি কলাম সাপোর্ট করে!', 'warning');
      return;
    }
    const newCol = {
      id: 'col_' + Date.now(),
      type: 'links',
      title: `কলাম ${columns.length + 1}`,
      description: '',
      socialLinks: {},
      links: []
    };
    const updated = [...columns, newCol];
    setColumns(updated);
    handleSaveToDB(updated);
  };

  // Delete Column
  const handleDeleteColumn = (index) => {
    if (!window.confirm('আপনি কি এই কলামটি মুছে ফেলতে চান?')) return;
    const updated = columns.filter((_, idx) => idx !== index);
    setColumns(updated);
    handleSaveToDB(updated);
  };

  // Copyright Links
  const handleAddCopyrightLink = (e) => {
    e.preventDefault();
    if (!newCopLinkTitle.trim() || !newCopLinkUrl.trim()) return;

    const updated = [...copyrightLinks, { title: newCopLinkTitle.trim(), url: newCopLinkUrl.trim() }];
    setCopyrightLinks(updated);
    setNewCopLinkTitle('');
    setNewCopLinkUrl('');
    handleSaveToDB(columns, copyrightText, updated);
  };

  const handleDeleteCopyrightLink = (index) => {
    const updated = copyrightLinks.filter((_, idx) => idx !== index);
    setCopyrightLinks(updated);
    handleSaveToDB(columns, copyrightText, updated);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>ফুটার কনফিগারেশন লোড হচ্ছে...</p>
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
        }

        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }

        .columns-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .col-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 18px 20px;
        }
        .col-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 8px;
        }

        .form-group {
          margin-bottom: 12px;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13px;
          color: #475569;
        }
        input,
        select,
        textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 13.5px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus,
        select:focus,
        textarea:focus {
          border-color: #007bff;
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
          .columns-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 1. FOOTER COLUMNS MANAGER */}
      <div className="box" style={{ borderLeft: '6px solid var(--secondary, #17a2b8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>
              <i className="fa-solid fa-table-columns" style={{ color: 'var(--secondary)', marginRight: '8px' }}></i>
              ফুটার কলাম ম্যানেজমেন্ট (Footer 4 Columns)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              ওয়েবসাইটের ফুটারের ৪টি কলাম সাজান, সোশ্যাল লিংক ও নেভিগেশন লিংক পরিচালনা করুন।
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {columns.length < 4 && (
              <button className="btn btn-primary" onClick={handleAddColumn}>
                <i className="fa-solid fa-plus"></i> কলাম যোগ করুন
              </button>
            )}
            <button className="btn btn-success" onClick={() => handleSaveToDB()} disabled={saving}>
              <i className="fa-solid fa-floppy-disk"></i> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </div>

        <div className="columns-grid">
          {columns.map((col, index) => (
            <div key={col.id || index} className="col-card">
              <div className="col-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="arrow-btn-group">
                    <button type="button" className="btn-arrow" onClick={() => moveColumn(index, 'up')}>
                      ▲
                    </button>
                    <button type="button" className="btn-arrow" onClick={() => moveColumn(index, 'down')}>
                      ▼
                    </button>
                  </div>
                  <strong style={{ fontSize: '15px', color: '#1e293b' }}>
                    কলাম {index + 1}: {col.title}
                  </strong>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ padding: '2px 6px', fontSize: '11px' }}
                  onClick={() => handleDeleteColumn(index)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>

              <div className="form-group">
                <label>কলাম টাইপ:</label>
                <select
                  value={col.type}
                  onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                >
                  <option value="info">Info & Socials (বিবরণ ও সোশ্যাল মিডিয়া)</option>
                  <option value="links">Navigation Links (প্রয়োজনীয় লিংকসমূহ)</option>
                </select>
              </div>

              <div className="form-group">
                <label>কলাম শিরোনাম (Title):</label>
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) => handleColumnChange(index, 'title', e.target.value)}
                />
              </div>

              {col.type === 'info' ? (
                <div>
                  <div className="form-group">
                    <label>বিবরণ (Description):</label>
                    <textarea
                      rows={3}
                      value={col.description}
                      onChange={(e) => handleColumnChange(index, 'description', e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ background: '#eef6ff', padding: '10px 12px', borderRadius: '6px', marginTop: '10px' }}>
                    <label style={{ color: '#007bff', fontWeight: 'bold' }}>সোশ্যাল মিডিয়া লিংকসমূহ:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                      <input
                        type="text"
                        placeholder="Facebook URL"
                        value={col.socialLinks?.facebook || ''}
                        onChange={(e) => handleSocialLinkChange(index, 'facebook', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="YouTube URL"
                        value={col.socialLinks?.youtube || ''}
                        onChange={(e) => handleSocialLinkChange(index, 'youtube', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="WhatsApp Link"
                        value={col.socialLinks?.whatsapp || ''}
                        onChange={(e) => handleSocialLinkChange(index, 'whatsapp', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Telegram URL"
                        value={col.socialLinks?.telegram || ''}
                        onChange={(e) => handleSocialLinkChange(index, 'telegram', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label>লিংকসমূহ ({col.links?.length || 0}):</label>
                  <div style={{ marginBottom: '10px' }}>
                    {(col.links || []).map((lnk, lIdx) => (
                      <div
                        key={lIdx}
                        style={{
                          background: 'white',
                          border: '1px solid #cbd5e1',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          marginBottom: '4px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: '13px' }}>
                          <b>{lnk.title}</b> <code style={{ fontSize: '11px', color: '#64748b' }}>({lnk.url})</code>
                        </span>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          style={{ padding: '1px 5px', fontSize: '9px' }}
                          onClick={() => handleDeleteLinkFromColumn(index, lIdx)}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Link Form */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr auto', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Title"
                      value={newLinkInputs[col.id]?.title || ''}
                      onChange={(e) =>
                        setNewLinkInputs({
                          ...newLinkInputs,
                          [col.id]: { ...(newLinkInputs[col.id] || {}), title: e.target.value }
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={newLinkInputs[col.id]?.url || ''}
                      onChange={(e) =>
                        setNewLinkInputs({
                          ...newLinkInputs,
                          [col.id]: { ...(newLinkInputs[col.id] || {}), url: e.target.value }
                        })
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddLinkToColumn(index, col.id)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. COPYRIGHT & BOTTOM LINKS */}
      <div className="box" style={{ borderLeft: '6px solid #ff9f43' }}>
        <h2>
          <i className="fa-solid fa-copyright" style={{ color: '#ff9f43', marginRight: '8px' }}></i>
          কপিরাইট ও বটম লিংক (Copyright & Bottom Links)
        </h2>

        <div className="form-group">
          <label>কপিরাইট টেক্সট:</label>
          <input
            type="text"
            value={copyrightText}
            onChange={(e) => setCopyrightText(e.target.value)}
            placeholder="© 2026 TopMCQBD. All rights reserved."
          />
        </div>

        <form onSubmit={handleAddCopyrightLink} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto', gap: '10px', marginTop: '15px' }}>
          <input
            type="text"
            placeholder="বটম লিংক নাম (যেমন: Terms & Conditions)"
            value={newCopLinkTitle}
            onChange={(e) => setNewCopLinkTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="লিংক URL (যেমন: /policy)"
            value={newCopLinkUrl}
            onChange={(e) => setNewCopLinkUrl(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> লিংক যোগ করুন
          </button>
        </form>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {copyrightLinks.map((lnk, cIdx) => (
            <div
              key={cIdx}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{lnk.title}</span>
              <code style={{ fontSize: '11px', color: '#64748b' }}>({lnk.url})</code>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ padding: '1px 5px', fontSize: '9px' }}
                onClick={() => handleDeleteCopyrightLink(cIdx)}
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
          <span>⚠️ কলামের পজিশন পরিবর্তন করা হয়েছে!</span>
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
