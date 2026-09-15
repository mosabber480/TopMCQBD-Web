'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';

// Bengali number helpers
const toBengaliNumber = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => bnDigits[parseInt(d)] || d).join('');
};

const toBengaliNumberStr = (str) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(str).replace(/[0-9]/g, (d) => bnDigits[parseInt(d)]);
};

const toEnglishNumberStr = (str) => {
  const enDigits = {'০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'};
  return String(str).replace(/[০-৯]/g, (d) => enDigits[d] || d);
};

const DEFAULT_CATEGORIES = [
  { id: 'All', label: 'সকল' },
  { id: 'BCS', label: 'বিসিএস প্রিলি' },
  { id: 'Bank', label: 'ব্যাংক জবস' },
  { id: 'Primary', label: 'প্রাথমিক শিক্ষক' },
  { id: 'NTRCA', label: 'শিক্ষক নিবন্ধন' }
];

function FreeRecentJobCategoriesDashboardContent() {
  const router = useRouter();

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentTag, setCurrentTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    id: '',
    year: '',
    category: 'BCS',
    date: '২০২৪',
    totalQ: 200,
    time: '২ ঘণ্টা',
    subjectStats: '',
    status: 'সম্পূর্ণ সমাধানসহ উপলব্ধ',
    tags: '',
    displayTag: ''
  });

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');

  // Fetch initial config
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/free-recent-job-solution/config', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
        if (Array.isArray(data.items) && data.items.length > 0) setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load free recent job config:', err);
      showTopAlert('কনফিগারেশন লোড করা সম্ভব হয়নি!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save config to Server
  const saveConfig = async (newCats = categories, newItems = items) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch('/api/free-recent-job-solution/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          categories: newCats,
          items: newItems
        })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('রিসেন্ট জব সল্যুশন কনফিগারেশন সফলভাবে সেভ করা হয়েছে!', 'success');
        setCategories(newCats);
        setItems(newItems);
      } else {
        showTopAlert(data.error || 'সেভ করতে সমস্যা হয়েছে', 'danger');
      }
    } catch (err) {
      console.error('Failed to save config:', err);
      showTopAlert('সার্ভারে সেভ করতে ব্যর্থ হয়েছে!', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  // Item Handlers
  const handleOpenAddItem = () => {
    setIsEditingItem(false);
    const defaultCat = currentTag !== 'All' ? currentTag : 'BCS';
    setItemForm({
      id: `recent-${defaultCat.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      year: '',
      category: defaultCat,
      date: '২০২৪',
      totalQ: defaultCat === 'BCS' ? 200 : defaultCat === 'Primary' ? 80 : 100,
      time: defaultCat === 'BCS' ? '২ ঘণ্টা' : '১ ঘণ্টা',
      subjectStats: 'বাংলা ২০, ইংরেজি ২০, গণিত ২০, সাধারণ জ্ঞান ২০',
      status: 'সম্পূর্ণ সমাধানসহ উপলব্ধ',
      tags: `${defaultCat}, Recent, 2024`,
      displayTag: defaultCat === 'BCS' ? '47th' : defaultCat
    });
    setShowItemModal(true);
  };

  const handleOpenEditItem = (it) => {
    setIsEditingItem(true);
    setItemForm({
      id: it.id,
      year: it.year || '',
      category: it.category || 'BCS',
      date: it.date || '২০২৪',
      totalQ: it.totalQ || 100,
      time: it.time || '১ ঘণ্টা',
      subjectStats: it.subjectStats || '',
      status: it.status || 'সম্পূর্ণ সমাধানসহ উপলব্ধ',
      tags: Array.isArray(it.tags) ? it.tags.join(', ') : (it.tags || ''),
      displayTag: it.displayTag || ''
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.year.trim()) {
      showTopAlert('পরীক্ষার শিরোনাম/সাল আবশ্যক!', 'warning');
      return;
    }

    const tagsArr = itemForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const updatedObj = {
      ...itemForm,
      year: itemForm.year.trim(),
      tags: tagsArr,
      totalQ: Number(itemForm.totalQ) || 100
    };

    let updatedList;
    if (isEditingItem) {
      updatedList = items.map(x => x.id === itemForm.id ? updatedObj : x);
    } else {
      updatedList = [updatedObj, ...items];
    }

    setShowItemModal(false);
    await saveConfig(categories, updatedList);
  };

  const handleDeleteItem = async (idToDelete) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই প্রশ্ন সেটটি মুছে ফেলতে চান?')) return;
    const updated = items.filter(x => x.id !== idToDelete);
    await saveConfig(categories, updated);
  };

  // Category Handlers
  const handleAddCategory = async () => {
    if (!newCatId.trim() || !newCatLabel.trim()) {
      showTopAlert('ক্যাটাগরি আইডি ও লেবেল উভয়ই পূরণ করুন', 'warning');
      return;
    }
    const cleanId = newCatId.trim();
    if (categories.some(c => c.id.toLowerCase() === cleanId.toLowerCase())) {
      showTopAlert('এই আইডি দিয়ে ইতোমধ্যে ক্যাটাগরি রয়েছে!', 'warning');
      return;
    }

    const updatedCats = [...categories, { id: cleanId, label: newCatLabel.trim() }];
    setNewCatId('');
    setNewCatLabel('');
    setShowCatModal(false);
    await saveConfig(updatedCats, items);
  };

  const handleDeleteCategory = async (catId) => {
    if (catId === 'All') return;
    if (!window.confirm(`আপনি কি নিশ্চিত '${catId}' ক্যাটাগরি মুছে ফেলতে চান?`)) return;
    const updatedCats = categories.filter(c => c.id !== catId);
    if (currentTag === catId) setCurrentTag('All');
    await saveConfig(updatedCats, items);
  };

  // Filter Tags & Data
  const filterTags = categories.map(cat => {
    const count = cat.id === 'All'
      ? items.length
      : items.filter(i => i.category === cat.id).length;
    return { ...cat, count };
  });

  const filteredData = items.filter(item => {
    const matchTag = currentTag === 'All' || item.category === currentTag;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchTag;

    const qBn = toBengaliNumberStr(q);
    const itemYear = (item.year || '').toLowerCase();
    const itemDate = (item.date || '').toLowerCase();
    const itemCat = (item.category || '').toLowerCase();
    const itemStats = (item.subjectStats || '').toLowerCase();
    const itemDispTag = (item.displayTag || '').toLowerCase();

    const matchText =
      itemYear.includes(q) ||
      itemYear.includes(qBn) ||
      itemDate.includes(q) ||
      itemCat.includes(q) ||
      itemStats.includes(q) ||
      itemDispTag.includes(q) ||
      (item.tags && item.tags.some(t => (t || '').toLowerCase().includes(q)));

    return matchTag && matchText;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', paddingBottom: '80px' }}>
      
      {/* Top Header Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                FREE USER PAGES CONTROL
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                ফ্রি রিসেন্ট জব সল্যুশন ক্যাটাগরি ড্যাশবোর্ড
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              এখানে সংরক্ষিত প্রশ্ন সেট ও ক্যাটাগরি সরাসরি <span style={{ color: '#0284c7', fontWeight: 600 }}>/free-recent-job-solution</span> পেজে দৃশ্যমান হবে।
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/free-recent-job-solution"
              target="_blank"
              style={{
                backgroundColor: '#f8fafc',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>ইউজার পেজ ভিজিট</span>
            </Link>

            <button
              onClick={() => saveConfig()}
              disabled={isSaving}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
              }}
            >
              <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
              <span>{isSaving ? 'সেভ হচ্ছে...' : 'সব সেভ করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: '1350px', margin: '24px auto 0', padding: '0 20px' }}>

        {/* Filter, Search & Add Action Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '18px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {filterTags.map(tag => {
              const isActive = currentTag === tag.id;
              return (
                <div key={tag.id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentTag(tag.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: tag.id === 'All' ? '20px' : '20px 0 0 20px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#0284c7' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{tag.label}</span>
                    <span style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.74rem'
                    }}>
                      {toBengaliNumber(tag.count)}
                    </span>
                  </button>

                  {/* Remove Category button for custom ones */}
                  {tag.id !== 'All' && !['BCS', 'Bank', 'Primary', 'NTRCA'].includes(tag.id) && (
                    <button
                      onClick={() => handleDeleteCategory(tag.id)}
                      title="ক্যাটাগরি মুছে ফেলুন"
                      style={{
                        padding: '6px 8px',
                        borderRadius: '0 20px 20px 0',
                        fontSize: '0.74rem',
                        border: '1px solid #e2e8f0',
                        borderLeft: 'none',
                        backgroundColor: '#fff1f2',
                        color: '#e11d48',
                        cursor: 'pointer'
                      }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setShowCatModal(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px dashed #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>ক্যাটাগরি</span>
            </button>
          </div>

          {/* Search Box & Add Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রশ্ন সেট খুঁজুন..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
              <i className="fa-solid fa-magnifying-glass" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '0.82rem'
              }} />
            </div>

            <button
              onClick={handleOpenAddItem}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>নতুন প্রশ্ন সেট যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Question Sets Grid */}
        {filteredData.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}>
            <i className="fa-regular fa-folder-open" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '12px' }}></i>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#334155' }}>কোনো প্রশ্ন সেট পাওয়া যায়নি</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>ফিল্টার পরিবর্তন করুন অথবা &quot;নতুন প্রশ্ন সেট যোগ করুন&quot; বাটনে ক্লিক করুন।</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(390px, 1fr))', gap: '20px' }}>
            {filteredData.map(item => {
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Header Chips & Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px'
                        }}>
                          {item.category}
                        </span>

                        {item.displayTag && (
                          <span style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {item.displayTag}
                          </span>
                        )}

                        <span style={{
                          backgroundColor: '#f8fafc',
                          color: '#64748b',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}>
                          {toEnglishNumberStr(item.date)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditItem(item)}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                          title="এডিট"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          title="মুছে ফেলুন"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                      {item.year}
                    </h3>

                    {/* Subject Breakdown Box */}
                    {item.subjectStats && (
                      <div style={{
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #e0f2fe',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '0.82rem',
                        color: '#0369a1',
                        marginBottom: '14px',
                        lineHeight: '1.5'
                      }}>
                        <i className="fa-solid fa-layer-group" style={{ marginRight: '6px', color: '#0284c7' }}></i>
                        {item.subjectStats}
                      </div>
                    )}

                    {/* Meta Stats */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: '#475569', marginBottom: '14px' }}>
                      <span><strong>প্রশ্ন:</strong> {toBengaliNumber(item.totalQ)} টি</span>
                      <span><strong>সময়:</strong> {item.time}</span>
                      <span><strong>সাল:</strong> {item.date}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                      <i className="fa-solid fa-check-circle" style={{ marginRight: '4px' }}></i>
                      {item.status || 'সক্রিয়'}
                    </span>

                    <button
                      onClick={() => handleOpenEditItem(item)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      তথ্য সংশোধন করুন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ITEM MODAL (CREATE / EDIT) */}
      {/* ------------------------------------------------------------- */}
      {showItemModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditingItem ? 'প্রশ্ন সেট এডিট করুন' : 'নতুন প্রশ্ন সেট যোগ করুন'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  আইডি (Unique ID)
                </label>
                <input
                  type="text"
                  value={itemForm.id}
                  disabled={isEditingItem}
                  onChange={(e) => setItemForm({ ...itemForm, id: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  পরীক্ষার নাম ও সাল (শিরোনাম)
                </label>
                <input
                  type="text"
                  value={itemForm.year}
                  onChange={(e) => setItemForm({ ...itemForm, year: e.target.value })}
                  placeholder="যেমন: ৪৭তম বিসিএস প্রিলিমিনারি পরীক্ষা"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    ক্যাটাগরি
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    {categories.filter(c => c.id !== 'All').map(c => (
                      <option key={c.id} value={c.id}>{c.label} ({c.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    সাল / তারিখ
                  </label>
                  <input
                    type="text"
                    value={itemForm.date}
                    onChange={(e) => setItemForm({ ...itemForm, date: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    মোট প্রশ্ন সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={itemForm.totalQ}
                    onChange={(e) => setItemForm({ ...itemForm, totalQ: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    সময়
                  </label>
                  <input
                    type="text"
                    value={itemForm.time}
                    onChange={(e) => setItemForm({ ...itemForm, time: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  বিষয়ভিত্তিক বিন্যাস (Subject Breakdown)
                </label>
                <input
                  type="text"
                  value={itemForm.subjectStats}
                  onChange={(e) => setItemForm({ ...itemForm, subjectStats: e.target.value })}
                  placeholder="বাংলা ২০, ইংরেজি ২০, গণিত ২০, সাধারণ জ্ঞান ২০"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    ডিসপ্লে ট্যাগ
                  </label>
                  <input
                    type="text"
                    value={itemForm.displayTag}
                    onChange={(e) => setItemForm({ ...itemForm, displayTag: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    স্ট্যাটাস
                  </label>
                  <input
                    type="text"
                    value={itemForm.status}
                    onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                    placeholder="সম্পূর্ণ সমাধানসহ উপলব্ধ"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  সার্চ ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={itemForm.tags}
                  onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })}
                  placeholder="BCS, Recent, 2024"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY ADD MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                নতুন ক্যাটাগরি যোগ করুন
              </h3>
              <button
                onClick={() => setShowCatModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  ক্যাটাগরি আইডি (ইংরেজি)
                </label>
                <input
                  type="text"
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  placeholder="Judicial"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  ক্যাটাগরি লেবেল (বাংলায়)
                </label>
                <input
                  type="text"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="জুডিশিয়ারি"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  যোগ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function FreeRecentJobCategoriesDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>লোড হচ্ছে...</div>}>
      <FreeRecentJobCategoriesDashboardContent />
    </Suspense>
  );
}
