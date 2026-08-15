'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminHomeDashboardPage() {
  const [loading, setLoading] = useState(true);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isEditingSeo, setIsEditingSeo] = useState(false);

  // Sliders
  const [sliders, setSliders] = useState([]);
  const [editingSliderIndex, setEditingSliderIndex] = useState(null);
  const [draggedSliderIdx, setDraggedSliderIdx] = useState(null);
  const [sliderDropPos, setSliderDropPos] = useState({}); // { [idx]: 'top' | 'bottom' }

  // Demo Quizzes
  const [demoHeader, setDemoHeader] = useState({ title: '', subtitle: '' });
  const [isEditingDemoHeader, setIsEditingDemoHeader] = useState(false);
  const [demoQuizzes, setDemoQuizzes] = useState([]);
  const [editingDemoIndex, setEditingDemoIndex] = useState(null);
  const [draggedDemoIdx, setDraggedDemoIdx] = useState(null);
  const [demoDropPos, setDemoDropPos] = useState({});

  // Packages
  const [packageHeader, setPackageHeader] = useState({ title: '', subtitle: '' });
  const [isEditingPackageHeader, setIsEditingPackageHeader] = useState(false);
  const [packages, setPackages] = useState([]);
  const [editingPackageIndex, setEditingPackageIndex] = useState(null);
  const [draggedPkgIdx, setDraggedPkgIdx] = useState(null);
  const [pkgDropPos, setPkgDropPos] = useState({});

  // Mission
  const [missionInfo, setMissionInfo] = useState({
    sectionTitle: '',
    sectionSubtitle: '',
    missionTitle: '',
    missionDesc: '',
    goalTitle: '',
    goalDesc: ''
  });
  const [isEditingMission, setIsEditingMission] = useState(false);

  // Reorder save tracking
  const [hasSliderChanges, setHasSliderChanges] = useState(false);
  const [hasDemoChanges, setHasDemoChanges] = useState(false);
  const [hasPackageChanges, setHasPackageChanges] = useState(false);

  const fetchHomeConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/home-config');
      const data = await res.json();
      if (data) {
        setSeoTitle(data.seoTitle || '');
        setSeoDescription(data.seoDescription || '');
        setSliders(data.sliders || []);
        setDemoQuizzes(data.demoQuizzes || []);
        setPackages(data.packages || []);
        setDemoHeader(data.demoSectionInfo || { title: '', subtitle: '' });
        setPackageHeader(data.packageSectionInfo || { title: '', subtitle: '' });
        setMissionInfo(data.missionSectionInfo || {
          sectionTitle: '',
          sectionSubtitle: '',
          missionTitle: '',
          missionDesc: '',
          goalTitle: '',
          goalDesc: ''
        });
      }
    } catch (err) {
      console.error('Error loading home config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeConfig();
  }, []);

  const saveHomeConfig = async (overrideData = {}) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    if (!token) {
      showTopAlert('অনুগ্রহ করে লগইন করুন!', 'warning');
      return;
    }

    const payload = {
      seoTitle: overrideData.seoTitle !== undefined ? overrideData.seoTitle : seoTitle,
      seoDescription: overrideData.seoDescription !== undefined ? overrideData.seoDescription : seoDescription,
      sliders: overrideData.sliders !== undefined ? overrideData.sliders : sliders,
      demoQuizzes: overrideData.demoQuizzes !== undefined ? overrideData.demoQuizzes : demoQuizzes,
      packages: overrideData.packages !== undefined ? overrideData.packages : packages,
      demoSectionInfo: overrideData.demoSectionInfo !== undefined ? overrideData.demoSectionInfo : demoHeader,
      packageSectionInfo: overrideData.packageSectionInfo !== undefined ? overrideData.packageSectionInfo : packageHeader,
      missionSectionInfo: overrideData.missionSectionInfo !== undefined ? overrideData.missionSectionInfo : missionInfo
    };

    try {
      const res = await fetch('/api/home-config', {
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
        setHasSliderChanges(false);
        setHasDemoChanges(false);
        setHasPackageChanges(false);
        fetchHomeConfig();
      } else {
        showTopAlert('❌ ' + (result.message || 'সেভ করতে ব্যর্থ হয়েছে!'), 'danger');
      }
    } catch (err) {
      console.error('Save error:', err);
      showTopAlert('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!', 'danger');
    }
  };

  // Drag and Drop helpers for Sliders
  const handleSliderDragStart = (e, idx) => {
    setDraggedSliderIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSliderDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const pos = offset < rect.height / 2 ? 'top' : 'bottom';
    setSliderDropPos({ [idx]: pos });
  };

  const handleSliderDragLeave = () => {
    setSliderDropPos({});
  };

  const handleSliderDrop = (e, targetIdx) => {
    e.preventDefault();
    setSliderDropPos({});
    if (draggedSliderIdx === null || draggedSliderIdx === targetIdx) return;

    const list = [...sliders];
    const item = list.splice(draggedSliderIdx, 1)[0];
    list.splice(targetIdx, 0, item);
    setSliders(list);
    setHasSliderChanges(true);
    setDraggedSliderIdx(null);
  };

  const moveSlider = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= sliders.length) return;
    const updated = [...sliders];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setSliders(updated);
    setHasSliderChanges(true);
  };

  const addSlider = () => {
    const newSlide = {
      title: 'বিসিএস ও ব্যাংক জব প্রস্তুতির সেরা মাধ্যম',
      subtitle: 'হাজারো সঠিক প্রশ্নের ব্যাখ্যাসহ নিজেকে যাচাই করুন এবং দ্রুততম সময়ে আপনার চাকরির প্রস্তুতি সম্পন্ন করুন',
      bgImage: 'images/slider-01.jpg',
      bgOpacity: 0.5,
      btn1Text: '🚀 কুইজ শুরু করুন',
      btn1Link: 'all-mcq.html',
      btn2Text: 'ফ্রি ডেমো দেখুন',
      btn2Link: '#demo'
    };
    const updated = [...sliders, newSlide];
    setSliders(updated);
    setEditingSliderIndex(updated.length - 1);
    setHasSliderChanges(true);
  };

  const deleteSlider = async (idx) => {
    const confirm = await showTopAlert('আপনি কি এই স্লাইডারটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;
    const updated = sliders.filter((_, i) => i !== idx);
    setSliders(updated);
    await saveHomeConfig({ sliders: updated });
  };

  // Demo Drag and Drop
  const handleDemoDragStart = (e, idx) => {
    setDraggedDemoIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDemoDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const pos = offset < rect.height / 2 ? 'top' : 'bottom';
    setDemoDropPos({ [idx]: pos });
  };

  const handleDemoDragLeave = () => {
    setDemoDropPos({});
  };

  const handleDemoDrop = (e, targetIdx) => {
    e.preventDefault();
    setDemoDropPos({});
    if (draggedDemoIdx === null || draggedDemoIdx === targetIdx) return;

    const list = [...demoQuizzes];
    const item = list.splice(draggedDemoIdx, 1)[0];
    list.splice(targetIdx, 0, item);
    setDemoQuizzes(list);
    setHasDemoChanges(true);
    setDraggedDemoIdx(null);
  };

  const moveDemo = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= demoQuizzes.length) return;
    const updated = [...demoQuizzes];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setDemoQuizzes(updated);
    setHasDemoChanges(true);
  };

  const addDemo = () => {
    const newDemo = {
      title: 'বাংলা ভাষা ও সাহিত্য',
      badgeText: 'ফ্রি টেস্ট',
      desc: 'সন্ধি, সমাস ও গুরুত্বপূর্ণ সাহিত্যিকদের প্রশ্নাবলি।',
      link: '/quiz'
    };
    const updated = [...demoQuizzes, newDemo];
    setDemoQuizzes(updated);
    setEditingDemoIndex(updated.length - 1);
    setHasDemoChanges(true);
  };

  const deleteDemo = async (idx) => {
    const confirm = await showTopAlert('আপনি কি এই ডেমো কুইজটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;
    const updated = demoQuizzes.filter((_, i) => i !== idx);
    setDemoQuizzes(updated);
    await saveHomeConfig({ demoQuizzes: updated });
  };

  // Package Drag and Drop
  const handlePkgDragStart = (e, idx) => {
    setDraggedPkgIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePkgDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const pos = offset < rect.height / 2 ? 'top' : 'bottom';
    setPkgDropPos({ [idx]: pos });
  };

  const handlePkgDragLeave = () => {
    setPkgDropPos({});
  };

  const handlePkgDrop = (e, targetIdx) => {
    e.preventDefault();
    setPkgDropPos({});
    if (draggedPkgIdx === null || draggedPkgIdx === targetIdx) return;

    const list = [...packages];
    const item = list.splice(draggedPkgIdx, 1)[0];
    list.splice(targetIdx, 0, item);
    setPackages(list);
    setHasPackageChanges(true);
    setDraggedPkgIdx(null);
  };

  const movePackage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= packages.length) return;
    const updated = [...packages];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setPackages(updated);
    setHasPackageChanges(true);
  };

  const addPackage = () => {
    const newPkg = {
      title: '১ মাসের প্যাকেজ',
      price: '৳ ৩০০',
      duration: '১ মাস',
      desc: 'সকল বিষয়ের প্রিমিয়াম প্রশ্ন ও আনলিমিটেড টেস্ট।',
      imageUrl: 'images/slider-01.jpg',
      buyLink: '/packages'
    };
    const updated = [...packages, newPkg];
    setPackages(updated);
    setEditingPackageIndex(updated.length - 1);
    setHasPackageChanges(true);
  };

  const deletePackage = async (idx) => {
    const confirm = await showTopAlert('আপনি কি এই প্যাকেজটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirm) return;
    const updated = packages.filter((_, i) => i !== idx);
    setPackages(updated);
    await saveHomeConfig({ packages: updated });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '10px', color: '#666' }}>হোম পেজ ডাটা লোড হচ্ছে...</p>
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
        .sub-header-title {
          font-size: 15px;
          font-weight: bold;
          color: #475569;
          margin: 20px 0 10px 0;
          display: flex;
          align-items: center;
          gap: 8px;
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
        .draggable-box {
          cursor: move;
        }
        .drag-handle {
          cursor: grab;
          color: #888;
          margin-right: 8px;
          font-size: 16px;
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .dragging {
          opacity: 0.4;
          background: #eef6ff !important;
        }
        .drag-over-top {
          border-top: 3px solid #007bff !important;
        }
        .drag-over-bottom {
          border-bottom: 3px solid #007bff !important;
        }

        .seo-card { border-left: 6px solid #e83e8c; }
        .slider-card { border-left: 6px solid var(--primary, #007bff); }
        .demo-card { border-left: 6px solid var(--secondary, #17a2b8); }
        .package-card { border-left: 6px solid var(--warning, #ff9f43); }
        .mission-card { border-left: 6px solid var(--purple-btn, #6f42c1); }

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
        .btn-warning:hover { background-color: #e0a800; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-danger:hover { background-color: #c82333; }
        .btn-submit { background-color: #28a745; color: white; }
        .btn-submit:hover { background-color: #218838; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .btn-secondary:hover { background-color: #5a6268; }

        .section-action-bar {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 15px;
          flex-wrap: wrap;
        }
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
        .btn-save-section {
          background: var(--primary, #007bff);
          color: white;
          border: none;
          padding: 10px 22px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .btn-save-section:hover { background-color: var(--primary-dark, #0056b3); }

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
        .btn-arrow:hover {
          background: #007bff;
          color: #ffffff;
        }
      `}</style>

      {/* ০. SEO SETTINGS CARD */}
      <div className="section-card seo-card" id="card-seo">
        <div className="section-title">
          <i className="fa-solid fa-magnifying-glass" style={{ color: '#e83e8c' }}></i> হোম পেজ SEO সেটিংস
        </div>

        {!isEditingSeo ? (
          <div className="read-box" style={{ borderLeft: '5px solid #e83e8c' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
              <button className="btn btn-warning" onClick={() => setIsEditingSeo(true)}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
              {(seoTitle || seoDescription) && (
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    if (await showTopAlert('আপনি কি নিশ্চিত যে SEO সেটিংস মুছে ফেলতে চান?', 'danger', true)) {
                      setSeoTitle('');
                      setSeoDescription('');
                      await saveHomeConfig({ seoTitle: '', seoDescription: '' });
                    }
                  }}
                >
                  <i className="fa-solid fa-trash"></i> Delete
                </button>
              )}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--dark)' }}>
              {seoTitle || '(টাইটেল নেই)'}
            </div>
            <div style={{ marginTop: '5px', color: '#666', fontSize: '13.5px' }}>
              <b>Meta Description:</b> {seoDescription || '(ডেসক্রিপশন নেই)'}
            </div>
          </div>
        ) : (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#007bff' }}>
              SEO টাইটেল ও ডেসক্রিপশন এডিট করুন
            </div>
            <div className="row">
              <div className="form-group">
                <label>Home Meta Title (SEO):</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="যেমন: TopMCQ - সেরা অনলাইন কুইজ প্ল্যাটফর্ম"
                />
              </div>
            </div>
            <div className="row">
              <div className="form-group">
                <label>Home Meta Description (SEO):</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="যেমন: TopMCQ-তে সেরা সব কুইজ দিয়ে আপনার প্রস্তুতি যাচাই করুন..."
                ></textarea>
              </div>
            </div>
            <div className="card-actions">
              <button
                className="btn btn-submit"
                onClick={async () => {
                  await saveHomeConfig({ seoTitle, seoDescription });
                  setIsEditingSeo(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingSeo(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ১. SLIDERS MANAGER CARD */}
      <div className="section-card slider-card" id="card-slider">
        <div className="section-title">
          <i className="fa-solid fa-images" style={{ color: 'var(--primary, #007bff)' }}></i> ১. স্লাইডার সেকশন (Sliders)
        </div>

        <div>
          {sliders.map((s, idx) => {
            const isEditing = editingSliderIndex === idx;
            const dropClass = sliderDropPos[idx] === 'top' ? 'drag-over-top' : sliderDropPos[idx] === 'bottom' ? 'drag-over-bottom' : '';
            const isDragging = draggedSliderIdx === idx;

            if (isEditing) {
              return (
                <div key={idx} className="read-box" style={{ background: '#ffffff', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', color: 'var(--primary)' }}>
                    স্লাইডার #{idx + 1} এডিট করুন
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Title:</label>
                      <input
                        type="text"
                        value={s.title}
                        onChange={(e) => {
                          const updated = [...sliders];
                          updated[idx].title = e.target.value;
                          setSliders(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Background Image Path:</label>
                      <input
                        type="text"
                        value={s.bgImage}
                        onChange={(e) => {
                          const updated = [...sliders];
                          updated[idx].bgImage = e.target.value;
                          setSliders(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Subtitle:</label>
                      <input
                        type="text"
                        value={s.subtitle}
                        onChange={(e) => {
                          const updated = [...sliders];
                          updated[idx].subtitle = e.target.value;
                          setSliders(updated);
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ maxWidth: '140px' }}>
                      <label>Opacity (0.1 - 1.0):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={s.bgOpacity}
                        onChange={(e) => {
                          const updated = [...sliders];
                          updated[idx].bgOpacity = parseFloat(e.target.value);
                          setSliders(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Button 1 Text:</label>
                      <input
                        type="text"
                        value={s.btn1Text}
                        onChange={(e) => {
                          const updated = [...sliders];
                          updated[idx].btn1Text = e.target.value;
                          setSliders(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Button 1 Link:</label>
                      <input
                        type="text"
                        value={s.btn1Link}
                        onChange={(e) => {
                          const updated = [...sliders];
                          updated[idx].btn1Link = e.target.value;
                          setSliders(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Button 2 Text:</label>
                      <input
                        type="text"
                        value={s.btn2Text}
                        onChange={(e) => {
                          const updated = [...sliders];
                          updated[idx].btn2Text = e.target.value;
                          setSliders(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Button 2 Link:</label>
                      <input
                        type="text"
                        value={s.btn2Link}
                        onChange={(e) => {
                          const updated = [...sliders];
                          updated[idx].btn2Link = e.target.value;
                          setSliders(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-submit"
                      onClick={async () => {
                        await saveHomeConfig();
                        setEditingSliderIndex(null);
                      }}
                    >
                      <i className="fa-solid fa-floppy-disk"></i> Save Slider
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingSliderIndex(null)}>
                      <i className="fa-solid fa-xmark"></i> Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`read-box draggable-box ${isDragging ? 'dragging' : ''} ${dropClass}`}
                draggable
                onDragStart={(e) => handleSliderDragStart(e, idx)}
                onDragOver={(e) => handleSliderDragOver(e, idx)}
                onDragLeave={handleSliderDragLeave}
                onDrop={(e) => handleSliderDrop(e, idx)}
              >
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-warning" onClick={() => setEditingSliderIndex(idx)}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteSlider(idx)}>
                    <i className="fa-solid fa-trash"></i> Delete
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-grip-vertical drag-handle" title="টেনে ধরে স্থান পরিবর্তন করুন"></i>
                  <div className="arrow-btn-group">
                    <button className="btn-arrow" onClick={() => moveSlider(idx, idx - 1)} disabled={idx === 0}>
                      ▲
                    </button>
                    <button className="btn-arrow" onClick={() => moveSlider(idx, idx + 1)} disabled={idx === sliders.length - 1}>
                      ▼
                    </button>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--dark)' }}>
                      #{idx + 1}. {s.title}
                    </h4>
                    <p style={{ fontSize: '13.5px', color: '#666', margin: '0 0 8px 0' }}>{s.subtitle}</p>
                    <div style={{ fontSize: '12.5px', color: '#888' }}>
                      Image: <code>{s.bgImage}</code> | Opacity: <code>{s.bgOpacity}</code> | Button 1: <code>{s.btn1Text || 'None'}</code> | Button 2: <code>{s.btn2Text || 'None'}</code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section-action-bar">
          <button type="button" className="btn-add" onClick={addSlider}>
            <i className="fa-solid fa-plus"></i> স্লাইডার যোগ করুন
          </button>
          {hasSliderChanges && (
            <button type="button" className="btn-save-section" onClick={() => saveHomeConfig()}>
              <i className="fa-solid fa-floppy-disk"></i> সেভ করুন
            </button>
          )}
        </div>
      </div>

      {/* ২. DEMO QUIZZES CARD */}
      <div className="section-card demo-card" id="card-demo">
        <div className="section-title">
          <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--secondary, #17a2b8)' }}></i> ২. ফ্রি ডেমো কুইজ (Demo Quizzes)
        </div>

        {/* Demo Header Info */}
        {!isEditingDemoHeader ? (
          <div className="read-box" style={{ borderLeft: '5px solid #17a2b8' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <button className="btn btn-warning" onClick={() => setIsEditingDemoHeader(true)}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--dark)' }}>
              <i className="fa-solid fa-heading" style={{ color: 'var(--secondary)', marginRight: '6px' }}></i>
              {demoHeader.title || 'ফ্রি কুইজ'}
            </div>
            <div style={{ marginTop: '5px', color: '#666', fontSize: '13.5px' }}>
              <b>সাব-টাইটেল:</b> {demoHeader.subtitle || 'বিবরণ দেওয়া হয়নি'}
            </div>
          </div>
        ) : (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div className="form-group">
              <label>Section Title:</label>
              <input
                type="text"
                value={demoHeader.title}
                onChange={(e) => setDemoHeader({ ...demoHeader, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Section Subtitle:</label>
              <input
                type="text"
                value={demoHeader.subtitle}
                onChange={(e) => setDemoHeader({ ...demoHeader, subtitle: e.target.value })}
              />
            </div>
            <div className="card-actions">
              <button
                className="btn btn-submit"
                onClick={async () => {
                  await saveHomeConfig({ demoSectionInfo: demoHeader });
                  setIsEditingDemoHeader(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingDemoHeader(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        )}

        <div className="sub-header-title">
          <i className="fa-solid fa-list"></i> ডেমো কুইজের তালিকা:
        </div>

        <div>
          {demoQuizzes.map((d, idx) => {
            const isEditing = editingDemoIndex === idx;
            const dropClass = demoDropPos[idx] === 'top' ? 'drag-over-top' : demoDropPos[idx] === 'bottom' ? 'drag-over-bottom' : '';
            const isDragging = draggedDemoIdx === idx;

            if (isEditing) {
              return (
                <div key={idx} className="read-box" style={{ background: '#ffffff', borderLeft: '4px solid var(--secondary)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', color: 'var(--secondary)' }}>
                    ডেমো কুইজ #{idx + 1} এডিট করুন
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Title:</label>
                      <input
                        type="text"
                        value={d.title}
                        onChange={(e) => {
                          const updated = [...demoQuizzes];
                          updated[idx].title = e.target.value;
                          setDemoQuizzes(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Badge Text:</label>
                      <input
                        type="text"
                        value={d.badgeText}
                        onChange={(e) => {
                          const updated = [...demoQuizzes];
                          updated[idx].badgeText = e.target.value;
                          setDemoQuizzes(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Quiz Link (URL):</label>
                      <input
                        type="text"
                        value={d.link}
                        onChange={(e) => {
                          const updated = [...demoQuizzes];
                          updated[idx].link = e.target.value;
                          setDemoQuizzes(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      rows={2}
                      value={d.desc}
                      onChange={(e) => {
                        const updated = [...demoQuizzes];
                        updated[idx].desc = e.target.value;
                        setDemoQuizzes(updated);
                      }}
                    ></textarea>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-submit"
                      onClick={async () => {
                        await saveHomeConfig();
                        setEditingDemoIndex(null);
                      }}
                    >
                      <i className="fa-solid fa-floppy-disk"></i> Save Demo
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingDemoIndex(null)}>
                      <i className="fa-solid fa-xmark"></i> Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`read-box draggable-box ${isDragging ? 'dragging' : ''} ${dropClass}`}
                draggable
                onDragStart={(e) => handleDemoDragStart(e, idx)}
                onDragOver={(e) => handleDemoDragOver(e, idx)}
                onDragLeave={handleDemoDragLeave}
                onDrop={(e) => handleDemoDrop(e, idx)}
              >
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-warning" onClick={() => setEditingDemoIndex(idx)}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteDemo(idx)}>
                    <i className="fa-solid fa-trash"></i> Delete
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-grip-vertical drag-handle" title="টেনে ধরে স্থান পরিবর্তন করুন"></i>
                  <div className="arrow-btn-group">
                    <button className="btn-arrow" onClick={() => moveDemo(idx, idx - 1)} disabled={idx === 0}>
                      ▲
                    </button>
                    <button className="btn-arrow" onClick={() => moveDemo(idx, idx + 1)} disabled={idx === demoQuizzes.length - 1}>
                      ▼
                    </button>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--dark)' }}>
                      #{idx + 1}. {d.title} <span style={{ fontSize: '12px', background: '#e3f2fd', color: '#007bff', padding: '2px 6px', borderRadius: '4px' }}>{d.badgeText}</span>
                    </h4>
                    <p style={{ fontSize: '13.5px', color: '#666', margin: '0 0 6px 0' }}>{d.desc}</p>
                    <div style={{ fontSize: '12.5px', color: '#888' }}>
                      Link: <code>{d.link || 'None'}</code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section-action-bar">
          <button type="button" className="btn-add" onClick={addDemo}>
            <i className="fa-solid fa-plus"></i> ডেমো কুইজ যোগ করুন
          </button>
          {hasDemoChanges && (
            <button type="button" className="btn-save-section" onClick={() => saveHomeConfig()}>
              <i className="fa-solid fa-floppy-disk"></i> সেভ করুন
            </button>
          )}
        </div>
      </div>

      {/* ৩. PACKAGES CARD */}
      <div className="section-card package-card" id="card-package">
        <div className="section-title">
          <i className="fa-solid fa-box-open" style={{ color: 'var(--warning, #ff9f43)' }}></i> ৩. প্রিপারেশন প্যাকেজ (Packages)
        </div>

        {/* Package Header Info */}
        {!isEditingPackageHeader ? (
          <div className="read-box" style={{ borderLeft: '5px solid #ff9f43' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <button className="btn btn-warning" onClick={() => setIsEditingPackageHeader(true)}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--dark)' }}>
              <i className="fa-solid fa-heading" style={{ color: 'var(--warning)', marginRight: '6px' }}></i>
              {packageHeader.title || 'আমাদের প্যাকেজসমূহ'}
            </div>
            <div style={{ marginTop: '5px', color: '#666', fontSize: '13.5px' }}>
              <b>সাব-টাইটেল:</b> {packageHeader.subtitle || 'বিবরণ দেওয়া হয়নি'}
            </div>
          </div>
        ) : (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div className="form-group">
              <label>Section Title:</label>
              <input
                type="text"
                value={packageHeader.title}
                onChange={(e) => setPackageHeader({ ...packageHeader, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Section Subtitle:</label>
              <input
                type="text"
                value={packageHeader.subtitle}
                onChange={(e) => setPackageHeader({ ...packageHeader, subtitle: e.target.value })}
              />
            </div>
            <div className="card-actions">
              <button
                className="btn btn-submit"
                onClick={async () => {
                  await saveHomeConfig({ packageSectionInfo: packageHeader });
                  setIsEditingPackageHeader(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingPackageHeader(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        )}

        <div className="sub-header-title">
          <i className="fa-solid fa-list"></i> প্যাকেজের তালিকা:
        </div>

        <div>
          {packages.map((pkg, idx) => {
            const isEditing = editingPackageIndex === idx;
            const dropClass = pkgDropPos[idx] === 'top' ? 'drag-over-top' : pkgDropPos[idx] === 'bottom' ? 'drag-over-bottom' : '';
            const isDragging = draggedPkgIdx === idx;

            if (isEditing) {
              return (
                <div key={idx} className="read-box" style={{ background: '#ffffff', borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', color: 'var(--warning)' }}>
                    প্যাকেজ #{idx + 1} এডিট করুন
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Title:</label>
                      <input
                        type="text"
                        value={pkg.title}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].title = e.target.value;
                          setPackages(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Price (e.g. ৳ ৩০০):</label>
                      <input
                        type="text"
                        value={pkg.price}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].price = e.target.value;
                          setPackages(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration (e.g. ১ মাস):</label>
                      <input
                        type="text"
                        value={pkg.duration}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].duration = e.target.value;
                          setPackages(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="form-group">
                      <label>Image URL / Path:</label>
                      <input
                        type="text"
                        value={pkg.imageUrl}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].imageUrl = e.target.value;
                          setPackages(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Buy Link:</label>
                      <input
                        type="text"
                        value={pkg.buyLink}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].buyLink = e.target.value;
                          setPackages(updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      rows={2}
                      value={pkg.desc}
                      onChange={(e) => {
                        const updated = [...packages];
                        updated[idx].desc = e.target.value;
                        setPackages(updated);
                      }}
                    ></textarea>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-submit"
                      onClick={async () => {
                        await saveHomeConfig();
                        setEditingPackageIndex(null);
                      }}
                    >
                      <i className="fa-solid fa-floppy-disk"></i> Save Package
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditingPackageIndex(null)}>
                      <i className="fa-solid fa-xmark"></i> Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`read-box draggable-box ${isDragging ? 'dragging' : ''} ${dropClass}`}
                draggable
                onDragStart={(e) => handlePkgDragStart(e, idx)}
                onDragOver={(e) => handlePkgDragOver(e, idx)}
                onDragLeave={handlePkgDragLeave}
                onDrop={(e) => handlePkgDrop(e, idx)}
              >
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-warning" onClick={() => setEditingPackageIndex(idx)}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => deletePackage(idx)}>
                    <i className="fa-solid fa-trash"></i> Delete
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-grip-vertical drag-handle" title="টেনে ধরে স্থান পরিবর্তন করুন"></i>
                  <div className="arrow-btn-group">
                    <button className="btn-arrow" onClick={() => movePackage(idx, idx - 1)} disabled={idx === 0}>
                      ▲
                    </button>
                    <button className="btn-arrow" onClick={() => movePackage(idx, idx + 1)} disabled={idx === packages.length - 1}>
                      ▼
                    </button>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--dark)' }}>
                      #{idx + 1}. {pkg.title} <span style={{ color: '#27ae60', fontWeight: 'bold' }}>({pkg.price} / {pkg.duration})</span>
                    </h4>
                    <p style={{ fontSize: '13.5px', color: '#666', margin: '0 0 6px 0' }}>{pkg.desc}</p>
                    <div style={{ fontSize: '12.5px', color: '#888' }}>
                      Image: <code>{pkg.imageUrl}</code> | Link: <code>{pkg.buyLink}</code>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section-action-bar">
          <button type="button" className="btn-add" onClick={addPackage}>
            <i className="fa-solid fa-plus"></i> প্যাকেজ যোগ করুন
          </button>
          {hasPackageChanges && (
            <button type="button" className="btn-save-section" onClick={() => saveHomeConfig()}>
              <i className="fa-solid fa-floppy-disk"></i> সেভ করুন
            </button>
          )}
        </div>
      </div>

      {/* ৪. MISSION & GOALS CARD */}
      <div className="section-card mission-card" id="card-mission">
        <div className="section-title">
          <i className="fa-solid fa-bullseye" style={{ color: 'var(--purple-btn, #6f42c1)' }}></i> ৪. আমাদের মিশন ও লক্ষ্য (Mission & Goals)
        </div>

        {!isEditingMission ? (
          <div className="read-box" style={{ borderLeft: '5px solid var(--purple-btn, #6f42c1)' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <button className="btn btn-warning" onClick={() => setIsEditingMission(true)}>
                <i className="fa-solid fa-pen-to-square"></i> Edit
              </button>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--dark)' }}>
              <i className="fa-solid fa-bullseye" style={{ color: 'var(--purple-btn)', marginRight: '6px' }}></i>
              {missionInfo.sectionTitle || 'আমাদের মিশন ও লক্ষ্য'}
            </div>
            <div style={{ marginTop: '5px', color: '#666', fontSize: '13.5px' }}>
              <b>সাব-টাইটেল:</b> {missionInfo.sectionSubtitle || 'বিবরণ দেওয়া হয়নি'}
            </div>
            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <div><strong>আমাদের মিশন:</strong> {missionInfo.missionTitle}</div>
            <p style={{ fontSize: '13.5px', color: '#555', marginTop: '4px' }}>{missionInfo.missionDesc}</p>
            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <div><strong>আমাদের লক্ষ্য:</strong> {missionInfo.goalTitle}</div>
            <p style={{ fontSize: '13.5px', color: '#555', marginTop: '4px' }}>{missionInfo.goalDesc}</p>
          </div>
        ) : (
          <div className="read-box" style={{ borderLeft: '5px solid #007bff', background: '#ffffff' }}>
            <div className="row">
              <div className="form-group">
                <label>Section Title:</label>
                <input
                  type="text"
                  value={missionInfo.sectionTitle}
                  onChange={(e) => setMissionInfo({ ...missionInfo, sectionTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Section Subtitle:</label>
                <input
                  type="text"
                  value={missionInfo.sectionSubtitle}
                  onChange={(e) => setMissionInfo({ ...missionInfo, sectionSubtitle: e.target.value })}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Mission Title:</label>
                <input
                  type="text"
                  value={missionInfo.missionTitle}
                  onChange={(e) => setMissionInfo({ ...missionInfo, missionTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Goal / Vision Title:</label>
                <input
                  type="text"
                  value={missionInfo.goalTitle}
                  onChange={(e) => setMissionInfo({ ...missionInfo, goalTitle: e.target.value })}
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label>Mission Description:</label>
                <textarea
                  rows={3}
                  value={missionInfo.missionDesc}
                  onChange={(e) => setMissionInfo({ ...missionInfo, missionDesc: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Goal / Vision Description:</label>
                <textarea
                  rows={3}
                  value={missionInfo.goalDesc}
                  onChange={(e) => setMissionInfo({ ...missionInfo, goalDesc: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="card-actions">
              <button
                className="btn btn-submit"
                onClick={async () => {
                  await saveHomeConfig({ missionSectionInfo: missionInfo });
                  setIsEditingMission(false);
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> পরিবর্তন সংরক্ষণ করুন
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditingMission(false)}>
                <i className="fa-solid fa-xmark"></i> বাতিল করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
