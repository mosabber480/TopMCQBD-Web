'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

const defaultHomeConfig = {
  seoTitle: 'TopMCQBD - বাংলাদেশের সেরা অনলাইন MCQ ও কুইজ প্র্যাকটিস প্ল্যাটফর্ম',
  seoDescription: 'বিসিএস, ব্যাংক, প্রাথমিক সহকারী শিক্ষক নিয়োগ ও সরকারি চাকরির চূড়ান্ত প্রস্তুতির জন্য অনলাইন মডেল টেস্ট ও ব্যাখ্যাসহ MCQ প্র্যাকটিস।',
  sliders: [
    {
      title: 'বিসিএস ও সরকারি চাকরির সেরা প্রস্তুতি',
      subtitle: 'হাজারো মডেল টেস্ট ও বিষয়ভিত্তিক MCQ প্র্যাকটিসের মাধ্যমে নিজের প্রস্তুতি যাচাই করুন।',
      bgImage: '/images/hero-banner.jpg',
      opacity: '0.85',
      btn1Text: 'প্র্যাকটিস শুরু করুন',
      btn1Link: '/packages',
      btn2Text: 'ফ্রি কুইজ দিন',
      btn2Link: '/free-mcqs'
    }
  ],
  demoSectionInfo: {
    title: 'ফ্রি ডেমো কুইজ',
    subtitle: 'নিবন্ধন ছাড়াই এখনই বিষয়ভিত্তিক ফ্রি কুইজে অংশ নিন'
  },
  demoQuizzes: [
    {
      title: 'বাংলা ভাষা ও সাহিত্য',
      badge: '১০ মিনিট • ২০ প্রশ্ন',
      desc: 'প্রাচীন, মধ্য ও আধুনিক যুগের গুরুত্বপূর্ণ বিগত বছরের প্রশ্নাবলি।',
      link: '/free-mcqs'
    },
    {
      title: 'বাংলাদেশ বিষয়াবলী',
      badge: '১০ মিনিট • ২০ প্রশ্ন',
      desc: 'বাংলাদেশের ইতিহাস, মুক্তিযুদ্ধ, সংবিধান ও অর্থনৈতিক সমীক্ষা।',
      link: '/free-mcqs'
    }
  ],
  packageSectionInfo: {
    title: 'আমাদের প্রিপারেশন প্যাকেজসমূহ',
    subtitle: 'সাশ্রয়ী মূল্যে সেরা চাকরির প্রস্তুতি ও আনলিমিটেড মডেল টেস্ট'
  },
  packages: [
    {
      title: '১ মাসের স্ট্যান্ডার্ড প্যাক',
      price: '৯৯ টাকা',
      duration: '১ মাস',
      desc: 'সকল বিষয়ের অধ্যায়ভিত্তিক আনলিমিটেড মডেল টেস্ট ও সম্পূর্ণ ব্যাখ্যা।',
      img: '',
      link: '/packages'
    },
    {
      title: '৬ মাসের প্রিমিয়াম প্যাক',
      price: '৩৯৯ টাকা',
      duration: '৬ মাস',
      desc: 'বিসিএস ও সকল পরীক্ষার স্পেশাল মডেল টেস্ট এবং লাইভ এক্সাম।',
      img: '',
      link: '/packages'
    },
    {
      title: '১ বছরের মেগা প্যাক',
      price: '৫৯৯ টাকা',
      duration: '১ বছর',
      desc: 'এক বছরের জন্য সমস্ত পেইড ফিচার, প্রশ্ন ব্যাংক ও সার্বক্ষণিক আপডেট।',
      img: '',
      link: '/packages'
    }
  ],
  missionSectionInfo: {
    sectionTitle: 'আমাদের লক্ষ্য ও উদ্দেশ্য',
    sectionSubtitle: 'ডিজিটাল প্রযুক্তির মাধ্যমে চাকরি প্রার্থীদের প্রস্তুতিকে সহজ ও নিখুঁত করা',
    missionTitle: 'আমাদের মিশন',
    missionDesc: 'বাংলাদেশের প্রতিটি প্রান্তের শিক্ষার্থীদের জন্য মানসম্মত প্রশ্ন ব্যাংক ও সহজলভ্য মডেল টেস্ট পৌঁছে দেওয়া।',
    goalTitle: 'আমাদের ভিশন',
    goalDesc: 'স্মার্ট ও নির্ভুল অ্যানালিটিক্স দিয়ে চাকরি প্রার্থীদের সাফল্যের শীর্ষে পৌঁছে দেওয়া।'
  }
};

export default function AdminHomeDashboardPage() {
  const [config, setConfig] = useState(defaultHomeConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReordered, setIsReordered] = useState(false);

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Sliders State
  const [sliders, setSliders] = useState([]);
  const [newSlider, setNewSlider] = useState({
    title: '',
    subtitle: '',
    bgImage: '',
    opacity: '0.85',
    btn1Text: 'শুরু করুন',
    btn1Link: '/packages',
    btn2Text: '',
    btn2Link: ''
  });

  // Demo Quizzes State
  const [demoSectionTitle, setDemoSectionTitle] = useState('');
  const [demoSectionSubtitle, setDemoSectionSubtitle] = useState('');
  const [demoQuizzes, setDemoQuizzes] = useState([]);
  const [newDemoQuiz, setNewDemoQuiz] = useState({ title: '', badge: '', desc: '', link: '/free-mcqs' });

  // Packages State
  const [pkgSectionTitle, setPkgSectionTitle] = useState('');
  const [pkgSectionSubtitle, setPkgSectionSubtitle] = useState('');
  const [packages, setPackages] = useState([]);
  const [newPackage, setNewPackage] = useState({ title: '', price: '', duration: '', desc: '', img: '', link: '/packages' });

  // Mission State
  const [missionInfo, setMissionInfo] = useState({
    sectionTitle: '',
    sectionSubtitle: '',
    missionTitle: '',
    missionDesc: '',
    goalTitle: '',
    goalDesc: ''
  });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/home-config');
      const data = await res.json();
      if (data && (data.sliders || data.seoTitle)) {
        setConfig(data);
        setSeoTitle(data.seoTitle || defaultHomeConfig.seoTitle);
        setSeoDescription(data.seoDescription || defaultHomeConfig.seoDescription);
        setSliders(data.sliders || defaultHomeConfig.sliders);
        setDemoSectionTitle(data.demoSectionInfo?.title || defaultHomeConfig.demoSectionInfo.title);
        setDemoSectionSubtitle(data.demoSectionInfo?.subtitle || defaultHomeConfig.demoSectionInfo.subtitle);
        setDemoQuizzes(data.demoQuizzes || defaultHomeConfig.demoQuizzes);
        setPkgSectionTitle(data.packageSectionInfo?.title || defaultHomeConfig.packageSectionInfo.title);
        setPkgSectionSubtitle(data.packageSectionInfo?.subtitle || defaultHomeConfig.packageSectionInfo.subtitle);
        setPackages(data.packages || defaultHomeConfig.packages);
        setMissionInfo(data.missionSectionInfo || defaultHomeConfig.missionSectionInfo);
      } else {
        setConfig(defaultHomeConfig);
        setSeoTitle(defaultHomeConfig.seoTitle);
        setSeoDescription(defaultHomeConfig.seoDescription);
        setSliders(defaultHomeConfig.sliders);
        setDemoSectionTitle(defaultHomeConfig.demoSectionInfo.title);
        setDemoSectionSubtitle(defaultHomeConfig.demoSectionInfo.subtitle);
        setDemoQuizzes(defaultHomeConfig.demoQuizzes);
        setPkgSectionTitle(defaultHomeConfig.packageSectionInfo.title);
        setPkgSectionSubtitle(defaultHomeConfig.packageSectionInfo.subtitle);
        setPackages(defaultHomeConfig.packages);
        setMissionInfo(defaultHomeConfig.missionSectionInfo);
      }
    } catch (err) {
      console.error('Failed to load home config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveToDB = async (customPayload = null) => {
    setSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    const payload = customPayload || {
      seoTitle,
      seoDescription,
      sliders,
      demoSectionInfo: { title: demoSectionTitle, subtitle: demoSectionSubtitle },
      demoQuizzes,
      packageSectionInfo: { title: pkgSectionTitle, subtitle: pkgSectionSubtitle },
      packages,
      missionSectionInfo: missionInfo
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
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ হোম পেজের সমস্ত পরিবর্তন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
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

  // Slider actions
  const handleAddSlider = (e) => {
    e.preventDefault();
    if (!newSlider.title.trim()) return;
    const updated = [...sliders, newSlider];
    setSliders(updated);
    setNewSlider({
      title: '',
      subtitle: '',
      bgImage: '',
      opacity: '0.85',
      btn1Text: 'শুরু করুন',
      btn1Link: '/packages',
      btn2Text: '',
      btn2Link: ''
    });
    handleSaveToDB({ ...config, sliders: updated });
  };

  const handleDeleteSlider = (index) => {
    if (!window.confirm('আপনি কি এই স্লাইডারটি মুছে ফেলতে চান?')) return;
    const updated = sliders.filter((_, idx) => idx !== index);
    setSliders(updated);
    handleSaveToDB({ ...config, sliders: updated });
  };

  const moveSlider = (index, dir) => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === sliders.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const updated = [...sliders];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSliders(updated);
    setIsReordered(true);
  };

  // Demo Quiz actions
  const handleAddDemoQuiz = (e) => {
    e.preventDefault();
    if (!newDemoQuiz.title.trim()) return;
    const updated = [...demoQuizzes, newDemoQuiz];
    setDemoQuizzes(updated);
    setNewDemoQuiz({ title: '', badge: '', desc: '', link: '/free-mcqs' });
    handleSaveToDB({ ...config, demoQuizzes: updated });
  };

  const handleDeleteDemoQuiz = (index) => {
    if (!window.confirm('আপনি কি এই ডেমো কুইজটি মুছে ফেলতে চান?')) return;
    const updated = demoQuizzes.filter((_, idx) => idx !== index);
    setDemoQuizzes(updated);
    handleSaveToDB({ ...config, demoQuizzes: updated });
  };

  // Package actions
  const handleAddPackage = (e) => {
    e.preventDefault();
    if (!newPackage.title.trim() || !newPackage.price.trim()) return;
    const updated = [...packages, newPackage];
    setPackages(updated);
    setNewPackage({ title: '', price: '', duration: '', desc: '', img: '', link: '/packages' });
    handleSaveToDB({ ...config, packages: updated });
  };

  const handleDeletePackage = (index) => {
    if (!window.confirm('আপনি কি এই প্যাকেজটি মুছে ফেলতে চান?')) return;
    const updated = packages.filter((_, idx) => idx !== index);
    setPackages(updated);
    handleSaveToDB({ ...config, packages: updated });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>হোম পেজ কনফিগারেশন লোড হচ্ছে...</p>
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
        input,
        textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus,
        textarea:focus {
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

        .item-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 12px;
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

      {/* 1. SEO META SETTINGS */}
      <div className="box" style={{ borderLeft: '6px solid #007bff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>
              <i className="fa-solid fa-globe" style={{ color: '#007bff', marginRight: '8px' }}></i>
              হোম পেজ SEO মেটা তথ্য (SEO Settings)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              গুগল ও সার্চ ইঞ্জিনে হোম পেজের টাইটেল ও মেটা ডেসক্রিপশন সেট করুন।
            </p>
          </div>
          <button className="btn btn-success" onClick={() => handleSaveToDB()} disabled={saving}>
            <i className="fa-solid fa-floppy-disk"></i> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </button>
        </div>

        <div className="form-group">
          <label>SEO Meta Title:</label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="SEO Meta Title..."
          />
        </div>
        <div className="form-group">
          <label>SEO Meta Description:</label>
          <textarea
            rows={3}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="SEO Meta Description..."
          ></textarea>
        </div>
      </div>

      {/* 2. HERO SLIDERS */}
      <div className="box" style={{ borderLeft: '6px solid #ff9f43' }}>
        <h2>
          <i className="fa-solid fa-images" style={{ color: '#ff9f43', marginRight: '8px' }}></i>
          হিরো ব্যানার ও স্লাইডার্স (Hero Sliders)
        </h2>

        {/* Sliders List */}
        <div style={{ marginBottom: '20px' }}>
          {sliders.map((slider, index) => (
            <div key={index} className="item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="arrow-btn-group">
                    <button type="button" className="btn-arrow" onClick={() => moveSlider(index, 'up')}>
                      ▲
                    </button>
                    <button type="button" className="btn-arrow" onClick={() => moveSlider(index, 'down')}>
                      ▼
                    </button>
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#1e293b' }}>
                      স্লাইডার {index + 1}: {slider.title}
                    </strong>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>{slider.subtitle}</div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSlider(index)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Slider Form */}
        <form onSubmit={handleAddSlider} style={{ background: '#fdfdfd', border: '1px dashed #cbd5e1', padding: '15px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#007bff' }}>+ নতুন স্লাইডার যোগ করুন</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>স্লাইডার শিরোনাম (Title):</label>
              <input
                type="text"
                placeholder="যেমন: বিসিএস ও সরকারি চাকরির প্রস্তুতি"
                value={newSlider.title}
                onChange={(e) => setNewSlider({ ...newSlider, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>সাব-টাইটেল (Subtitle):</label>
              <input
                type="text"
                placeholder="সংক্ষিপ্ত বর্ণনা..."
                value={newSlider.subtitle}
                onChange={(e) => setNewSlider({ ...newSlider, subtitle: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>বাটন ১ টেক্সট ও লিংক:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="বাটন টেক্সট"
                  value={newSlider.btn1Text}
                  onChange={(e) => setNewSlider({ ...newSlider, btn1Text: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="URL (/packages)"
                  value={newSlider.btn1Link}
                  onChange={(e) => setNewSlider({ ...newSlider, btn1Link: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>বাটন ২ টেক্সট ও লিংক (ঐচ্ছিক):</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="বাটন ২ টেক্সট"
                  value={newSlider.btn2Text}
                  onChange={(e) => setNewSlider({ ...newSlider, btn2Text: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="URL (/free-mcqs)"
                  value={newSlider.btn2Link}
                  onChange={(e) => setNewSlider({ ...newSlider, btn2Link: e.target.value })}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> স্লাইডার যোগ করুন
          </button>
        </form>
      </div>

      {/* 3. FREE DEMO QUIZZES */}
      <div className="box" style={{ borderLeft: '6px solid #17a2b8' }}>
        <h2>
          <i className="fa-solid fa-gift" style={{ color: '#17a2b8', marginRight: '8px' }}></i>
          ফ্রি ডেমো কুইজ সেকশন (Free Demo Quizzes)
        </h2>

        <div className="form-grid">
          <div className="form-group">
            <label>সেকশন টাইটেল:</label>
            <input
              type="text"
              value={demoSectionTitle}
              onChange={(e) => setDemoSectionTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>সেকশন সাব-টাইটেল:</label>
            <input
              type="text"
              value={demoSectionSubtitle}
              onChange={(e) => setDemoSectionSubtitle(e.target.value)}
            />
          </div>
        </div>

        {/* Demo Quizzes List */}
        <div style={{ marginBottom: '20px' }}>
          {demoQuizzes.map((quiz, index) => (
            <div key={index} className="item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#1e293b' }}>{quiz.title}</strong>{' '}
                  <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px' }}>
                    {quiz.badge}
                  </span>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{quiz.desc}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDemoQuiz(index)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Demo Quiz Form */}
        <form onSubmit={handleAddDemoQuiz} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr 1fr auto', gap: '8px', alignItems: 'flex-end' }}>
          <input
            type="text"
            placeholder="কুইজের নাম"
            value={newDemoQuiz.title}
            onChange={(e) => setNewDemoQuiz({ ...newDemoQuiz, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="ব্যাজ (১০ মিনিট • ২০ প্রশ্ন)"
            value={newDemoQuiz.badge}
            onChange={(e) => setNewDemoQuiz({ ...newDemoQuiz, badge: e.target.value })}
          />
          <input
            type="text"
            placeholder="সংক্ষিপ্ত বিবরণ"
            value={newDemoQuiz.desc}
            onChange={(e) => setNewDemoQuiz({ ...newDemoQuiz, desc: e.target.value })}
          />
          <input
            type="text"
            placeholder="লিংক (/free-mcqs)"
            value={newDemoQuiz.link}
            onChange={(e) => setNewDemoQuiz({ ...newDemoQuiz, link: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">
            + যোগ করুন
          </button>
        </form>
      </div>

      {/* 4. PREPARATION PACKAGES */}
      <div className="box" style={{ borderLeft: '6px solid #6366f1' }}>
        <h2>
          <i className="fa-solid fa-box-open" style={{ color: '#6366f1', marginRight: '8px' }}></i>
          প্রিপারেশন প্যাকেজসমূহ (Preparation Packages)
        </h2>

        <div className="form-grid">
          <div className="form-group">
            <label>সেকশন টাইটেল:</label>
            <input
              type="text"
              value={pkgSectionTitle}
              onChange={(e) => setPkgSectionTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>সেকশন সাব-টাইটেল:</label>
            <input
              type="text"
              value={pkgSectionSubtitle}
              onChange={(e) => setPkgSectionSubtitle(e.target.value)}
            />
          </div>
        </div>

        {/* Packages List */}
        <div style={{ marginBottom: '20px' }}>
          {packages.map((pkg, index) => (
            <div key={index} className="item-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#1e293b' }}>{pkg.title}</strong>{' '}
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#16a34a', marginLeft: '6px' }}>
                    {pkg.price}
                  </span>{' '}
                  <span style={{ fontSize: '12px', color: '#64748b' }}>({pkg.duration})</span>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{pkg.desc}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeletePackage(index)}>
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Package Form */}
        <form onSubmit={handleAddPackage} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr auto', gap: '8px', alignItems: 'flex-end' }}>
          <input
            type="text"
            placeholder="প্যাকেজের নাম"
            value={newPackage.title}
            onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="মূল্য (যেমন: ৯৯ টাকা)"
            value={newPackage.price}
            onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="মেয়াদ (যেমন: ১ মাস)"
            value={newPackage.duration}
            onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
          />
          <input
            type="text"
            placeholder="বিবরণ"
            value={newPackage.desc}
            onChange={(e) => setNewPackage({ ...newPackage, desc: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">
            + যোগ করুন
          </button>
        </form>
      </div>

      {/* 5. MISSION & VISION */}
      <div className="box" style={{ borderLeft: '6px solid #20c997' }}>
        <h2>
          <i className="fa-solid fa-bullseye" style={{ color: '#20c997', marginRight: '8px' }}></i>
          আমাদের লক্ষ্য ও উদ্দেশ্য (Mission & Vision)
        </h2>

        <div className="form-grid">
          <div className="form-group">
            <label>সেকশন টাইটেল:</label>
            <input
              type="text"
              value={missionInfo.sectionTitle || ''}
              onChange={(e) => setMissionInfo({ ...missionInfo, sectionTitle: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>সেকশন সাব-টাইটেল:</label>
            <input
              type="text"
              value={missionInfo.sectionSubtitle || ''}
              onChange={(e) => setMissionInfo({ ...missionInfo, sectionSubtitle: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>মিশন টাইটেল:</label>
            <input
              type="text"
              value={missionInfo.missionTitle || ''}
              onChange={(e) => setMissionInfo({ ...missionInfo, missionTitle: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>মিশন বিবরণ:</label>
            <textarea
              rows={2}
              value={missionInfo.missionDesc || ''}
              onChange={(e) => setMissionInfo({ ...missionInfo, missionDesc: e.target.value })}
            ></textarea>
          </div>
          <div className="form-group">
            <label>ভিশন/লক্ষ্য টাইটেল:</label>
            <input
              type="text"
              value={missionInfo.goalTitle || ''}
              onChange={(e) => setMissionInfo({ ...missionInfo, goalTitle: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>ভিশন/লক্ষ্য বিবরণ:</label>
            <textarea
              rows={2}
              value={missionInfo.goalDesc || ''}
              onChange={(e) => setMissionInfo({ ...missionInfo, goalDesc: e.target.value })}
            ></textarea>
          </div>
        </div>

        <button type="button" className="btn btn-success" onClick={() => handleSaveToDB()} disabled={saving}>
          <i className="fa-solid fa-floppy-disk"></i> মিশন ও ভিশন সেভ করুন
        </button>
      </div>

      {/* Floating Reorder Save Bar */}
      {isReordered && (
        <div className="bottom-action-bar">
          <span>⚠️ আইটেমের পজিশন পরিবর্তন করা হয়েছে!</span>
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
