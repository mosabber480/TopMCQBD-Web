'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminQuestionBankDashboardPage() {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' | 'json' | 'list'
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Target categorization state
  const [targetCategory, setTargetCategory] = useState('BCS');
  const [customCategory, setCustomCategory] = useState('');
  const [examYear, setExamYear] = useState('');
  const [examTitle, setExamTitle] = useState('');

  // CSV Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const csvInputRef = useRef(null);

  // JSON Upload State
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [isUploadingJson, setIsUploadingJson] = useState(false);
  const jsonInputRef = useRef(null);

  // Questions Explorer State
  const [explorerCategory, setExplorerCategory] = useState('all');
  const [questionsList, setQuestionsList] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const getEffectiveCategory = () => {
    if (targetCategory === 'custom') return customCategory.trim();
    return targetCategory;
  };

  // Fetch Category Stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/question-bank/categories');
      const data = await res.json();
      if (data.success) {
        setTotalQuestions(data.totalQuestions || 0);
        setCategoriesList(data.categories || []);
      }
    } catch (e) {
      console.error('Error fetching question bank stats:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Questions for Explorer
  const fetchQuestions = async (cat = explorerCategory) => {
    setLoadingQuestions(true);
    try {
      const url = cat && cat !== 'all'
        ? `/api/question-bank/questions?category=${encodeURIComponent(cat)}&limit=100`
        : '/api/question-bank/questions?limit=100';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setQuestionsList(data.questions || data.mcqs || []);
      }
    } catch (e) {
      console.error('Error fetching question bank questions:', e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchQuestions('all');
  }, []);

  // CSV Upload Handler
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    const finalCategory = getEffectiveCategory();

    if (!csvFile) {
      showTopAlert('অনুগ্রহ করে একটি CSV ফাইল নির্বাচন করুন!', 'warning');
      return;
    }
    if (!finalCategory) {
      showTopAlert('অনুগ্রহ করে ক্যাটাগরি বা পরীক্ষার নাম উল্লেখ করুন!', 'warning');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('category', finalCategory);
    if (examYear) formData.append('year', examYear);
    if (examTitle) formData.append('examTitle', examTitle);

    setIsUploadingCsv(true);
    try {
      const res = await fetch('/api/question-bank/upload-csv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        showTopAlert(`🎉 সফলভাবে ${result.count} টি প্রশ্ন Question Bank-এ আপলোড হয়েছে!`, 'success');
        setCsvFile(null);
        if (csvInputRef.current) csvInputRef.current.value = '';
        fetchStats();
        fetchQuestions(finalCategory);
      } else {
        showTopAlert(`❌ আপলোড ব্যর্থ: ${result.error || result.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ সার্ভার সংযোগে সমস্যা হয়েছে!', 'danger');
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // JSON Upload Handler
  const handleJsonUpload = async (e) => {
    e.preventDefault();
    const finalCategory = getEffectiveCategory();
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    setIsUploadingJson(true);
    try {
      let res;
      if (jsonFile) {
        const formData = new FormData();
        formData.append('file', jsonFile);
        if (finalCategory) formData.append('category', finalCategory);

        res = await fetch('/api/question-bank/upload-json', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else if (jsonText.trim()) {
        let parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (jsonErr) {
          showTopAlert('❌ ইনভ্যালিড JSON ফরম্যাট: ' + jsonErr.message, 'danger');
          setIsUploadingJson(false);
          return;
        }

        // Attach default category if item doesn't have one
        if (Array.isArray(parsed) && finalCategory) {
          parsed = parsed.map(item => ({
            category: finalCategory,
            year: examYear || item.year,
            examTitle: examTitle || item.examTitle,
            ...item
          }));
        }

        res = await fetch('/api/question-bank/upload-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(parsed)
        });
      } else {
        showTopAlert('অনুগ্রহ করে JSON ফাইল নির্বাচন করুন অথবা নিচের বক্সে JSON পেস্ট করুন!', 'warning');
        setIsUploadingJson(false);
        return;
      }

      const result = await res.json();
      if (result.success) {
        showTopAlert(`🎉 সফলভাবে ${result.count} টি প্রশ্ন আপলোড হয়েছে!`, 'success');
        setJsonFile(null);
        setJsonText('');
        if (jsonInputRef.current) jsonInputRef.current.value = '';
        fetchStats();
        fetchQuestions(finalCategory || 'all');
      } else {
        showTopAlert(`❌ আপলোড ব্যর্থ: ${result.error || result.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ সার্ভার সংযোগে সমস্যা হয়েছে!', 'danger');
    } finally {
      setIsUploadingJson(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (id) => {
    const confirmed = await showTopAlert('আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirmed) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/question-bank/questions?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('✅ প্রশ্ন মুছে ফেলা হয়েছে।', 'success');
        setQuestionsList(prev => prev.filter(q => q._id !== id));
        fetchStats();
      } else {
        showTopAlert(`❌ ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (e) {
      showTopAlert('❌ সমস্যা হয়েছে', 'danger');
    }
  };

  // Delete all in category
  const handleDeleteCategoryQuestions = async () => {
    if (!explorerCategory || explorerCategory === 'all') {
      showTopAlert('ক্যাটাগরি নির্ধারণ করুন!', 'warning');
      return;
    }

    const confirmed = await showTopAlert(
      `সতর্কতা: '${explorerCategory}' ক্যাটাগরির সকল প্রশ্ন সম্পূর্ণ মুছে যাবে! আপনি কি নিশ্চিত?`,
      'danger',
      true
    );
    if (!confirmed) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/question-bank/questions?category=${encodeURIComponent(explorerCategory)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.count} টি প্রশ্ন মুছে ফেলা হয়েছে!`, 'success');
        fetchStats();
        fetchQuestions(explorerCategory);
      } else {
        showTopAlert(`❌ ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (e) {
      showTopAlert('❌ সার্ভারে সমস্যা হয়েছে', 'danger');
    }
  };

  // Sample CSV Download Trigger
  const downloadSampleCsv = () => {
    const csvContent = `question,option1,option2,option3,option4,answer,explanation,category,year,examTitle
"বাংলাদেশের প্রথম অস্থায়ী রাষ্ট্রপতি কে ছিলেন?","সৈয়দ নজরুল ইসলাম","তাজউদ্দীন আহমদ","বঙ্গবন্ধু শেখ মুজিবুর রহমান","এ এইচ এম কামারুজ্জামান",0,"১৯৭১ সালের ১০ এপ্রিল গঠিত অস্থায়ী সরকারের রাষ্ট্রপতি ছিলেন বঙ্গবন্ধু শেখ মুজিবুর রহমান এবং উপ-রাষ্ট্রপতি ছিলেন সৈয়দ নজরুল ইসলাম।","BCS","2024","৪৫তম বিসিএস প্রিলিমিনারি"
"Which one is the correct spelling?","Misspelled","Mispelled","Mispeld","Misspeled",0,"Misspelled is the correct orthographic form.","Bank","2024","বাংলাদেশ ব্যাংক সহকারী পরিচালক"
"পদ্মা সেতুর দৈর্ঘ্য কত কিলোমিটার?","৬.১৫ কিমি","৬.২৫ কিমি","৫.৮০ কিমি","৭.১৫ কিমি",0,"পদ্মা সেতুর মূল দৈর্ঘ্য ৬.১৫ কিলোমিটার।","Primary","2023","প্রাথমিক সহকারী শিক্ষক নিয়োগ"`;

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample-question-bank.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample JSON Download Trigger
  const downloadSampleJson = () => {
    const jsonSample = [
      {
        q: "চর্যাপদ কোন ছন্দে রচিত?",
        options: ["মাত্রাবৃত্ত", "অক্ষরবৃত্ত", "স্বরবৃত্ত", "মুক্তক"],
        ans: 0,
        explanation: "চর্যাপদের পদগুলো প্রধানত মাত্রাবৃত্ত ছন্দে রচিত।",
        category: "BCS",
        year: "2024",
        examTitle: "৪৪তম বিসিএস প্রিলিমিনারি"
      },
      {
        q: "The antonym of 'Vague' is -",
        options: ["Clear", "Unclear", "Dull", "Obscure"],
        ans: 0,
        explanation: "Vague means indistinct or uncertain. Its antonym is Clear.",
        category: "Bank",
        year: "2024",
        examTitle: "কম্বাইন্ড ৮ ব্যাংক অফিসার"
      }
    ];

    const blob = new Blob([JSON.stringify(jsonSample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample-question-bank.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBanglaLetter = (i) => ['ক', 'খ', 'গ', 'ঘ'][i] || i + 1;

  const filteredQuestions = questionsList.filter(q => {
    if (!searchFilter.trim()) return true;
    const s = searchFilter.toLowerCase();
    return (
      (q.q && q.q.toLowerCase().includes(s)) ||
      (q.category && q.category.toLowerCase().includes(s)) ||
      (q.year && q.year.toLowerCase().includes(s)) ||
      (q.examTitle && q.examTitle.toLowerCase().includes(s))
    );
  });

  return (
    <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '15px 20px 40px 20px' }}>
      <style jsx>{`
        .dash-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 22px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        .header-title-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        .tabs-header {
          display: flex;
          gap: 10px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 20px;
        }
        .tab-btn {
          padding: 10px 20px;
          background: transparent;
          border: none;
          font-weight: 600;
          font-size: 15px;
          color: #64748b;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .tab-btn:hover {
          color: #0f172a;
        }
        .tab-btn.active {
          color: #0284c7;
          border-bottom-color: #0284c7;
        }
        .stats-badge-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        .stat-val {
          font-size: 26px;
          font-weight: 800;
          color: #0284c7;
        }
        .stat-lbl {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
          margin-top: 4px;
        }
        .upload-dropzone {
          border: 2px dashed #94a3b8;
          border-radius: 8px;
          background: #f8fafc;
          padding: 30px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .upload-dropzone:hover {
          border-color: #0284c7;
          background: #f0f9ff;
        }
        .btn-action {
          padding: 9px 18px;
          font-weight: 600;
          font-size: 14px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: opacity 0.2s ease;
        }
        .btn-action:hover {
          opacity: 0.9;
        }
        .btn-primary { background: #0284c7; color: #fff; }
        .btn-success { background: #16a34a; color: #fff; }
        .btn-danger { background: #dc2626; color: #fff; }
        .btn-outline { background: #fff; border: 1px solid #cbd5e1; color: #334155; }
        .btn-outline:hover { background: #f1f5f9; }
        .form-input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
        }
        .form-input:focus {
          border-color: #0284c7;
        }
        .questions-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .questions-table th, .questions-table td {
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          text-align: left;
          font-size: 13.5px;
        }
        .questions-table th {
          background: #f1f5f9;
          font-weight: 700;
          color: #334155;
        }
        .option-tag {
          display: inline-block;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 2px 7px;
          border-radius: 4px;
          margin: 2px 3px 2px 0;
          font-size: 12px;
        }
        .option-tag.correct {
          background: #dcfce7;
          border-color: #86efac;
          color: #15803d;
          font-weight: 600;
        }
      `}</style>

      {/* Header Bar */}
      <div className="header-title-box">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 5px 0' }}>
            <i className="fa-solid fa-book-bookmark" style={{ color: '#0284c7', marginRight: '10px' }}></i>
            প্রশ্নব্যাংক ড্যাশবোর্ড (Question Bank Dashboard)
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            বিসিএস, ব্যাংক, প্রাইমারি ও শিক্ষক নিবন্ধনের বিগত সালের প্রশ্নব্যাংক CSV অথবা JSON ফরম্যাটে সহজে আপলোড করুন।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/question-bank" target="_blank" className="btn-action btn-outline">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> প্রশ্নব্যাংক পেজ দেখুন
          </Link>
          <Link href="/question-bank-questions" target="_blank" className="btn-action btn-outline">
            <i className="fa-solid fa-layer-group"></i> সমাধান পেজ
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-badge-grid">
        <div className="stat-card">
          <div className="stat-val">{loadingStats ? '...' : totalQuestions}</div>
          <div className="stat-lbl">মোট সংরক্ষিত প্রশ্ন</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{loadingStats ? '...' : categoriesList.length}</div>
          <div className="stat-lbl">মোট ক্যাটাগরি / পরীক্ষা</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: '#16a34a', fontSize: '18px' }}>
            <i className="fa-solid fa-database"></i> Connected
          </div>
          <div className="stat-lbl">TopMCQBD_DB_Question_Bank</div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="dash-card">
        {/* Navigation Tabs */}
        <div className="tabs-header">
          <button
            onClick={() => setActiveTab('csv')}
            className={`tab-btn ${activeTab === 'csv' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-file-csv"></i> CSV ফাইল আপলোড
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-file-code"></i> JSON ফাইল / ডাটা আপলোড
          </button>
          <button
            onClick={() => { setActiveTab('list'); fetchQuestions(); }}
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-list-check"></i> প্রশ্নব্যাংক তালিকা ও ব্যবস্থাপনা ({questionsList.length})
          </button>
        </div>

        {/* Global Category Selector for Uploads */}
        {activeTab !== 'list' && (
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155' }}>
              <i className="fa-solid fa-tag" style={{ color: '#0284c7', marginRight: '6px' }}></i>
              টার্গেট ক্যাটাগরি ও পরীক্ষার বিবরণ (Metadata)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  ক্যাটাগরি নির্বাচন করুন:
                </label>
                <select
                  className="form-input"
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                >
                  <option value="BCS">বিসিএস প্রিলিমিনারি (BCS)</option>
                  <option value="Bank">ব্যাংক জবস (Bank)</option>
                  <option value="Primary">প্রাথমিক শিক্ষক নিয়োগ (Primary)</option>
                  <option value="NTRCA">শিক্ষক নিবন্ধন (NTRCA)</option>
                  <option value="custom">+ নতুন কাস্টম ক্যাটাগরি...</option>
                </select>
              </div>

              {targetCategory === 'custom' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    কাস্টম ক্যাটাগরির নাম:
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="যেমন: ৯ম গ্রেড জব"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  সাল (Year):
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: 2024 বা ২০২৪"
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  পরীক্ষার শিরোনাম (Exam Title):
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: ৪৫তম বিসিএস প্রিলিমিনারি পরীক্ষা"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 1: CSV UPLOAD ----------------- */}
        {activeTab === 'csv' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                CSV ফাইলের মাধ্যমে একসাথে শত শত প্রশ্ন যুক্ত করুন
              </span>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="btn-action btn-outline"
                title="স্যাম্পল CSV ফাইল নামিয়ে ফরম্যাট দেখুন"
              >
                <i className="fa-solid fa-download"></i> Sample CSV ডাউনলোড
              </button>
            </div>

            <form onSubmit={handleCsvUpload}>
              <div
                className="upload-dropzone"
                onClick={() => csvInputRef.current?.click()}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '36px', color: '#0284c7', marginBottom: '10px' }}></i>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#1e293b' }}>
                  {csvFile ? csvFile.name : 'এখানে ক্লিক করে CSV ফাইল সিলেক্ট করুন'}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  {csvFile ? `সাইজ: ${(csvFile.size / 1024).toFixed(1)} KB` : 'অথবা ফাইল টেনে এনে ছেড়ে দিন (.csv ফাইল)'}
                </p>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Guidelines */}
              <div style={{ background: '#f1f5f9', padding: '14px', borderRadius: '6px', marginTop: '15px', fontSize: '13px', color: '#334155' }}>
                <strong>📌 CSV হেডার ফরম্যাট:</strong>
                <code style={{ display: 'block', background: '#e2e8f0', padding: '6px 10px', borderRadius: '4px', margin: '6px 0', wordBreak: 'break-all' }}>
                  question, option1, option2, option3, option4, answer, explanation, category, year, examTitle
                </code>
                <span>Answer কলামে 0, 1, 2, 3 অথবা ক, খ, গ, ঘ লিখতে পারবেন (যেমন: 0 = ক / option1)।</span>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={!csvFile || isUploadingCsv}
                  className="btn-action btn-primary"
                  style={{ opacity: (!csvFile || isUploadingCsv) ? 0.6 : 1 }}
                >
                  <i className={`fa-solid ${isUploadingCsv ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>
                  {isUploadingCsv ? 'আপলোড হচ্ছে...' : 'CSV প্রশ্নগুলো আপলোড করুন'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------- TAB 2: JSON UPLOAD ----------------- */}
        {activeTab === 'json' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                JSON ফাইল অথবা সরাসরি কোড পেস্ট করে প্রশ্ন যুক্ত করুন
              </span>
              <button
                type="button"
                onClick={downloadSampleJson}
                className="btn-action btn-outline"
                title="স্যাম্পল JSON ফাইল নামিয়ে ফরম্যাট দেখুন"
              >
                <i className="fa-solid fa-download"></i> Sample JSON ডাউনলোড
              </button>
            </div>

            <form onSubmit={handleJsonUpload}>
              {/* Option A: Upload JSON file */}
              <div
                className="upload-dropzone"
                style={{ padding: '20px' }}
                onClick={() => jsonInputRef.current?.click()}
              >
                <i className="fa-solid fa-file-code" style={{ fontSize: '28px', color: '#0284c7', marginBottom: '8px' }}></i>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                  {jsonFile ? `সিলেক্টেড: ${jsonFile.name}` : 'কম্পিউটার থেকে .json ফাইল নির্বাচন করুন'}
                </div>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
                />
              </div>

              <div style={{ textAlign: 'center', margin: '14px 0', color: '#94a3b8', fontWeight: 700, fontSize: '12px' }}>
                — অথবা সরাসরি নিচে JSON পেস্ট করুন —
              </div>

              {/* Option B: JSON Textarea */}
              <textarea
                className="form-input"
                rows={10}
                placeholder={`[\n  {\n    "q": "চর্যাপদ কোন ছন্দে রচিত?",\n    "options": ["মাত্রাবৃত্ত", "অক্ষরবৃত্ত", "স্বরবৃত্ত", "মুক্তক"],\n    "ans": 0,\n    "explanation": "চর্যাপদের পদগুলো প্রধানত মাত্রাবৃত্ত ছন্দে রচিত।",\n    "category": "BCS",\n    "year": "2024",\n    "examTitle": "৪৪তম বিসিএস প্রিলিমিনারি"\n  }\n]`}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '13px' }}
              />

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-action btn-outline"
                  onClick={() => {
                    setJsonFile(null);
                    setJsonText('');
                    if (jsonInputRef.current) jsonInputRef.current.value = '';
                  }}
                >
                  <i className="fa-solid fa-rotate-left"></i> রিসেট
                </button>

                <button
                  type="submit"
                  disabled={(!jsonFile && !jsonText.trim()) || isUploadingJson}
                  className="btn-action btn-primary"
                  style={{ opacity: ((!jsonFile && !jsonText.trim()) || isUploadingJson) ? 0.6 : 1 }}
                >
                  <i className={`fa-solid ${isUploadingJson ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>
                  {isUploadingJson ? 'আপলোড হচ্ছে...' : 'JSON প্রশ্নগুলো সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------- TAB 3: QUESTIONS LIST & MANAGEMENT ----------------- */}
        {activeTab === 'list' && (
          <div>
            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  className="form-input"
                  style={{ width: 'auto' }}
                  value={explorerCategory}
                  onChange={(e) => {
                    setExplorerCategory(e.target.value);
                    fetchQuestions(e.target.value);
                  }}
                >
                  <option value="all">সকল ক্যাটাগরি ({totalQuestions})</option>
                  {categoriesList.map(c => (
                    <option key={c.category} value={c.category}>
                      {c.category} ({c.count} টি প্রশ্ন)
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="form-input"
                  style={{ width: '220px' }}
                  placeholder="প্রশ্ন বা সালে খুঁজুন..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>

              {explorerCategory !== 'all' && (
                <button
                  onClick={handleDeleteCategoryQuestions}
                  className="btn-action btn-danger"
                  title="এই ক্যাটাগরির সকল প্রশ্ন মুছে ফেলুন"
                >
                  <i className="fa-solid fa-trash-can"></i> এই ক্যাটাগরির সকল প্রশ্ন মুছুন
                </button>
              )}
            </div>

            {/* Table */}
            {loadingQuestions ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', marginRight: '8px' }}></i>
                প্রশ্ন লোড হচ্ছে...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
                <i className="fa-solid fa-box-open" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}></i>
                কোনো প্রশ্ন পাওয়া যায়নি। উপরে CSV বা JSON ট্যাব থেকে প্রশ্ন আপলোড করুন।
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="questions-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>প্রশ্ন</th>
                      <th>অপশনসমূহ</th>
                      <th style={{ width: '120px' }}>ক্যাটাগরি / সাল</th>
                      <th>ব্যাখ্যা</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((q, idx) => (
                      <tr key={q._id || idx}>
                        <td style={{ fontWeight: 'bold', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          {q.q}
                        </td>
                        <td>
                          {(q.options || []).map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className={`option-tag ${oIdx === q.ans ? 'correct' : ''}`}
                            >
                              {getBanglaLetter(oIdx)}. {opt}
                            </span>
                          ))}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0284c7', fontSize: '12px' }}>
                            {q.category}
                          </div>
                          {q.year && (
                            <small style={{ color: '#64748b' }}>({q.year})</small>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: '#475569' }}>
                          {q.explanation || '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="btn-action btn-danger"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            title="মুছে ফেলুন"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
