'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminFullModelQuestionsDashboardPage() {
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'subjects' | 'csv' | 'json' | 'questions'
  const [loading, setLoading] = useState(true);

  // Config data: Exams & Subjects
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Stats
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Search & Filter
  const [examSearch, setExamSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Exam Modal State (Create / Edit)
  const [showExamModal, setShowExamModal] = useState(false);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    id: '',
    title: '',
    category: 'bcs',
    categoryName: 'বিসিএস পূর্ণাঙ্গ',
    tags: ['Live Grand Test', '200 Marks'],
    badgeColor: 'rose',
    onlineUsers: 45,
    borderColor: '#0284c7',
    description: '',
    subjectsText: '',
    totalQuestions: 200,
    totalMarks: 200,
    durationMinutes: 120,
    negativeMarks: '০.৫০',
    status: 'active'
  });

  // Subject Modal State (Create / Edit)
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    code: '',
    name: '',
    desc: '',
    modelTestsCount: 20,
    theme: {
      color: '#0284c7',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
      lightBg: '#f0f9ff',
      borderColor: '#bae6fd',
      glowColor: 'rgba(2, 132, 199, 0.12)'
    }
  });

  // CSV Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [targetUploadCategory, setTargetUploadCategory] = useState('');
  const csvInputRef = useRef(null);

  // JSON Upload State
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [isUploadingJson, setIsUploadingJson] = useState(false);
  const jsonInputRef = useRef(null);

  // Question Explorer State
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerCategory, setExplorerCategory] = useState('all');
  const [questionsList, setQuestionsList] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // New Single Question Builder State
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState({
    q: '',
    options: ['', '', '', ''],
    ans: 0,
    explanation: '',
    category: ''
  });

  // Fetch Config (Exams & Subjects)
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/full-model-test/config');
      const data = await res.json();
      if (data.success) {
        setExams(data.exams || []);
        setSubjects(data.subjects || []);
        if (data.exams.length > 0 && !targetUploadCategory) {
          const first = data.exams[0];
          setTargetUploadCategory(`${first.categoryName} > ${first.title} > বাংলা > মডেল টেস্ট - ০১`);
        }
      }
    } catch (err) {
      console.error('Failed to load full model test config:', err);
      showTopAlert('কনফিগারেশন লোড করতে ব্যর্থ হয়েছে!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Questions
  const fetchQuestions = async (cat = explorerCategory, search = explorerSearch) => {
    setLoadingQuestions(true);
    try {
      let url = '/api/full-model-test/questions?limit=50';
      if (cat && cat !== 'all') url += `&category=${encodeURIComponent(cat)}`;
      if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setQuestionsList(data.questions || []);
        setTotalQuestions(data.total || data.questions?.length || 0);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchQuestions('all', '');
  }, []);

  // Save updated config to API
  const saveConfig = async (updatedExams, updatedSubjects) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch('/api/full-model-test/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          exams: updatedExams !== undefined ? updatedExams : exams,
          subjects: updatedSubjects !== undefined ? updatedSubjects : subjects
        })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('🎉 কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        if (data.exams) setExams(data.exams);
        if (data.subjects) setSubjects(data.subjects);
        return true;
      } else {
        showTopAlert(`❌ সংরক্ষণ ব্যর্থ: ${data.error}`, 'danger');
        return false;
      }
    } catch (err) {
      showTopAlert('❌ সার্ভার সংযোগে ত্রুটি!', 'danger');
      return false;
    }
  };

  // Exam Handlers
  const handleOpenCreateExam = () => {
    setIsEditingExam(false);
    setExamForm({
      id: `exam-${Date.now()}`,
      title: '',
      category: 'bcs',
      categoryName: 'বিসিএস পূর্ণাঙ্গ',
      tags: ['Live Grand Test', '200 Marks'],
      badgeColor: 'rose',
      onlineUsers: 50,
      borderColor: '#0284c7',
      description: '',
      subjectsText: '',
      totalQuestions: 200,
      totalMarks: 200,
      durationMinutes: 120,
      negativeMarks: '০.৫০',
      status: 'active'
    });
    setShowExamModal(true);
  };

  const handleOpenEditExam = (exam) => {
    setIsEditingExam(true);
    setExamForm({
      ...exam,
      tags: exam.tags || ['Grand Test'],
      negativeMarks: exam.negativeMarks || '০.৫০'
    });
    setShowExamModal(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examForm.title.trim()) {
      showTopAlert('অনুগ্রহ করে মডেল টেস্টের শিরোনাম লিখুন!', 'warning');
      return;
    }

    let updated;
    if (isEditingExam) {
      updated = exams.map((ex) => (ex.id === examForm.id ? examForm : ex));
    } else {
      updated = [examForm, ...exams];
    }

    const ok = await saveConfig(updated, subjects);
    if (ok) {
      setShowExamModal(false);
    }
  };

  const handleDeleteExam = async (id, title) => {
    const confirmed = await showTopAlert(`আপনি কি নিশ্চিতভাবে "${title}" মডেল টেস্টটি মুছে ফেলতে চান?`, 'danger', true);
    if (!confirmed) return;

    const updated = exams.filter((ex) => ex.id !== id);
    await saveConfig(updated, subjects);
  };

  // Subject Handlers
  const handleOpenCreateSubject = () => {
    setIsEditingSubject(false);
    setSubjectForm({
      id: `subj-${Date.now()}`,
      code: 'NEW_SUBJ',
      name: '',
      desc: '',
      modelTestsCount: 20,
      theme: {
        color: '#0284c7',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
        lightBg: '#f0f9ff',
        borderColor: '#bae6fd',
        glowColor: 'rgba(2, 132, 199, 0.12)'
      }
    });
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (sub) => {
    setIsEditingSubject(true);
    setSubjectForm({ ...sub });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      showTopAlert('অনুগ্রহ করে বিষয়ের নাম লিখুন!', 'warning');
      return;
    }

    let updated;
    if (isEditingSubject) {
      updated = subjects.map((s) => (s.id === subjectForm.id ? subjectForm : s));
    } else {
      updated = [...subjects, subjectForm];
    }

    const ok = await saveConfig(exams, updated);
    if (ok) {
      setShowSubjectModal(false);
    }
  };

  const handleDeleteSubject = async (id, name) => {
    const confirmed = await showTopAlert(`আপনি কি নিশ্চিতভাবে "${name}" বিষয়টি মুছে ফেলতে চান?`, 'danger', true);
    if (!confirmed) return;

    const updated = subjects.filter((s) => s.id !== id);
    await saveConfig(exams, updated);
  };

  // CSV Upload Handler
  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      showTopAlert('অনুগ্রহ করে একটি CSV ফাইল নির্বাচন করুন!', 'warning');
      return;
    }
    if (!targetUploadCategory.trim()) {
      showTopAlert('অনুগ্রহ করে লক্ষ্য ক্যাটাগরি বা মডেল টেস্টের নাম দিন!', 'warning');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('category', targetUploadCategory.trim());

    setIsUploadingCsv(true);
    try {
      const res = await fetch('/api/full-model-test/upload-csv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`🎉 সফলভাবে ${data.count} টি প্রশ্ন আপলোড হয়েছে!`, 'success');
        setCsvFile(null);
        if (csvInputRef.current) csvInputRef.current.value = '';
        fetchQuestions('all', '');
      } else {
        showTopAlert(`❌ আপলোড ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ সার্ভার সমস্যা!', 'danger');
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // JSON Upload Handler
  const handleJsonUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    setIsUploadingJson(true);
    try {
      let res;
      if (jsonFile) {
        const formData = new FormData();
        formData.append('file', jsonFile);
        if (targetUploadCategory.trim()) {
          formData.append('category', targetUploadCategory.trim());
        }

        res = await fetch('/api/full-model-test/upload-json', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else if (jsonText.trim()) {
        let parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (jsonErr) {
          showTopAlert('❌ ইনভ্যালিড JSON টেক্সট: ' + jsonErr.message, 'danger');
          setIsUploadingJson(false);
          return;
        }

        if (Array.isArray(parsed) && targetUploadCategory.trim()) {
          parsed = parsed.map((item) => ({
            category: targetUploadCategory.trim(),
            ...item
          }));
        }

        res = await fetch('/api/full-model-test/upload-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(parsed)
        });
      } else {
        showTopAlert('অনুগ্রহ করে JSON ফাইল নির্বাচন করুন অথবা JSON টেক্সট পেস্ট করুন!', 'warning');
        setIsUploadingJson(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        showTopAlert(`🎉 সফলভাবে ${data.count} টি প্রশ্ন আপলোড হয়েছে!`, 'success');
        setJsonFile(null);
        setJsonText('');
        if (jsonInputRef.current) jsonInputRef.current.value = '';
        fetchQuestions('all', '');
      } else {
        showTopAlert(`❌ আপলোড ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ সার্ভার সমস্যা!', 'danger');
    } finally {
      setIsUploadingJson(false);
    }
  };

  // Delete single question
  const handleDeleteQuestion = async (id) => {
    const confirmed = await showTopAlert('আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirmed) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/full-model-test/questions?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('✅ প্রশ্ন মুছে ফেলা হয়েছে।', 'success');
        setQuestionsList((prev) => prev.filter((q) => q._id !== id));
      } else {
        showTopAlert(`❌ ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ সার্ভার সমস্যা!', 'danger');
    }
  };

  // Add single question handler
  const handleCreateSingleQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionForm.q.trim() || !newQuestionForm.category.trim()) {
      showTopAlert('প্রশ্ন ও ক্যাটাগরি অবশ্যই পূরণ করতে হবে!', 'warning');
      return;
    }
    const filteredOptions = newQuestionForm.options.map((o) => o.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      showTopAlert('কমপক্ষে ২টি অপশন প্রদান করুন!', 'warning');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch('/api/full-model-test/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          q: newQuestionForm.q.trim(),
          options: filteredOptions,
          ans: parseInt(newQuestionForm.ans || 0, 10),
          explanation: newQuestionForm.explanation.trim(),
          category: newQuestionForm.category.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('🎉 প্রশ্ন সফলভাবে তৈরি হয়েছে!', 'success');
        setShowAddQuestionModal(false);
        setNewQuestionForm({
          q: '',
          options: ['', '', '', ''],
          ans: 0,
          explanation: '',
          category: targetUploadCategory || ''
        });
        fetchQuestions(explorerCategory, explorerSearch);
      } else {
        showTopAlert(`❌ ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ সার্ভার সংযোগ ত্রুটি!', 'danger');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          background: '#ffffff',
          padding: '20px 24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              PAID FULL MODEL TEST
            </span>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Control Panel</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            পূর্ণাঙ্গ মডেল প্রশ্ন কন্ট্রোল ড্যাশবোর্ড
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/full-model-test"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
            }}
          >
            <i className="fa-solid fa-globe"></i>
            <span>মডেল টেস্ট প্রিভিউ</span>
          </Link>

          <Link
            href="/full-model-questions"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: '#006a4e',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0, 106, 78, 0.25)'
            }}
          >
            <i className="fa-solid fa-file-circle-question"></i>
            <span>প্রশ্ন সমাধান পেজ</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0284c7'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>মোট পূর্ণাঙ্গ টেস্ট</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
            {exams.length} টি
          </h2>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>সক্রিয় বিষয়সমূহ</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
            {subjects.length} টি
          </h2>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #8b5cf6'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>মোট মডেল টেস্ট সেট</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
            {subjects.reduce((acc, s) => acc + (s.modelTestsCount || 20), 0)} টি
          </h2>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #f59e0b'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>ডাটাবেজ প্রশ্নাবলি</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
            {totalQuestions} টি
          </h2>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}
      >
        {[
          { id: 'exams', label: 'মডেল টেস্ট তালিকা', icon: 'fa-solid fa-list-check' },
          { id: 'subjects', label: 'বিষয় ও থিম কনফিগার', icon: 'fa-solid fa-palette' },
          { id: 'csv', label: 'CSV প্রশ্ন আপলোড', icon: 'fa-solid fa-file-csv' },
          { id: 'json', label: 'JSON প্রশ্ন আপলোড', icon: 'fa-solid fa-code' },
          { id: 'questions', label: 'প্রশ্নাবলি এক্সপ্লোরার', icon: 'fa-solid fa-magnifying-glass' }
        ].map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#0284c7' : '#64748b',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <i className={t.icon}></i>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXAMS LIST & MANAGEMENT */}
      {activeTab === 'exams' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                placeholder="মডেল টেস্ট খুঁজুন..."
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  minWidth: '260px',
                  outline: 'none'
                }}
              />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="all">সকল ক্যাটাগরি</option>
                <option value="bcs">বিসিএস</option>
                <option value="bank">ব্যাংক জব</option>
                <option value="primary">প্রাইমারি শিক্ষক</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateExam}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
              }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>নতুন পূর্ণাঙ্গ টেস্ট যোগ করুন</span>
            </button>
          </div>

          {/* Exams Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
            {exams
              .filter((ex) => {
                const matchCat = selectedCategoryFilter === 'all' || ex.category === selectedCategoryFilter;
                const matchSearch =
                  !examSearch.trim() ||
                  ex.title.toLowerCase().includes(examSearch.toLowerCase()) ||
                  ex.categoryName.toLowerCase().includes(examSearch.toLowerCase());
                return matchCat && matchSearch;
              })
              .map((exam) => (
                <div
                  key={exam.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '22px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `5px solid ${exam.borderColor || '#0284c7'}`,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span
                        style={{
                          backgroundColor: '#e0f2fe',
                          color: '#0284c7',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        {exam.categoryName}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                        <i className="fa-solid fa-circle" style={{ fontSize: '7px', marginRight: '4px' }}></i>
                        {exam.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}>
                      {exam.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 14px' }}>
                      {exam.description}
                    </p>

                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                        fontSize: '0.82rem',
                        color: '#475569',
                        marginBottom: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>প্রশ্ন: <strong>{exam.totalQuestions} টি</strong></span>
                        <span>পূর্ণমান: <strong>{exam.totalMarks}</strong></span>
                        <span>সময়: <strong>{exam.durationMinutes} মিনিট</strong></span>
                      </div>
                      <div>কাট মার্ক: <strong>{exam.negativeMarks}</strong></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => handleOpenEditExam(exam)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                      <span>এডিট</span>
                    </button>

                    <button
                      onClick={() => handleDeleteExam(exam.id, exam.title)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fecaca',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                      <span>ডিলিট</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECTS MANAGEMENT */}
      {activeTab === 'subjects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              বিষয়সমূহ ও থিম স্টাইলিং ({subjects.length})
            </h2>

            <button
              onClick={handleOpenCreateSubject}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#006a4e',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 106, 78, 0.3)'
              }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>নতুন বিষয় যোগ করুন</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {subjects.map((sub) => (
              <div
                key={sub.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  borderTop: `4px solid ${sub.theme?.color || '#0284c7'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: sub.theme?.color, letterSpacing: '1px' }}>
                    {sub.code}
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                    {sub.name}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 14px' }}>
                    {sub.desc}
                  </p>
                  <div
                    style={{
                      backgroundColor: sub.theme?.lightBg || '#f8fafc',
                      color: sub.theme?.color || '#0284c7',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      display: 'inline-block',
                      marginBottom: '14px'
                    }}
                  >
                    {sub.modelTestsCount || 20} টি মডেল টেস্ট সেট
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <button
                    onClick={() => handleOpenEditSubject(sub)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    এডিট
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#fef2f2',
                      color: '#ef4444',
                      border: '1px solid #fecaca',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ডিলিট
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CSV UPLOAD */}
      {activeTab === 'csv' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            CSV ফাইল আপলোডের মাধ্যমে এক ক্লিকে প্রশ্ন তৈরি করুন
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px' }}>
            যেকোনো ক্যাটাগরি, পরীক্ষা ও বিষয়ের জন্য একবারে শত শত প্রশ্ন ডাটাবেজে অন্তর্ভুক্ত করুন।
          </p>

          <form onSubmit={handleCsvUpload}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                লক্ষ্য ক্যাটাগরি পাথ (Hierarchy):
              </label>
              <input
                type="text"
                value={targetUploadCategory}
                onChange={(e) => setTargetUploadCategory(e.target.value)}
                placeholder="উদাহরণ: বিসিএস পূর্ণাঙ্গ > ৪৬তম বিসিএস > বাংলা > মডেল টেস্ট - ০১"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                * এই ক্যাটাগরি অনুযায়ী মডেল টেস্টের প্রশ্নসমূহ সংযুক্ত হবে।
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                CSV ফাইল নির্বাচন করুন:
              </label>
              <input
                type="file"
                accept=".csv"
                ref={csvInputRef}
                onChange={(e) => setCsvFile(e.target.files[0] || null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px dashed #94a3b8',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* CSV Format Guide */}
            <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '10px', border: '1px solid #bae6fd', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 6px', color: '#0369a1', fontSize: '0.92rem' }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
                CSV ফরম্যাট গাইডলাইন:
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#075985', lineHeight: '1.6' }}>
                CSV ফাইলে প্রথম লাইনে হেডার থাকতে হবে: <code>question, opt0, opt1, opt2, opt3, ans, explanation</code><br />
                <code>ans</code> কলামে সঠিক উত্তরের ইনডেক্স (0, 1, 2, 3 বা ক, খ, গ, ঘ) প্রদান করুন।
              </p>
            </div>

            <button
              type="submit"
              disabled={isUploadingCsv}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: isUploadingCsv ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isUploadingCsv ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>CSV প্রশ্ন আপলোড সম্পন্ন করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: JSON UPLOAD */}
      {activeTab === 'json' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            JSON ফরম্যাটের মাধ্যমে বাল্ক প্রশ্ন আপলোড
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '24px' }}>
            সরাসরি JSON ফাইল সিলেক্ট করুন অথবা নিচে বক্সে JSON টেক্সট পেস্ট করুন।
          </p>

          <form onSubmit={handleJsonUpload}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                ডিফল্ট ক্যাটাগরি (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={targetUploadCategory}
                onChange={(e) => setTargetUploadCategory(e.target.value)}
                placeholder="উদাহরণ: বিসিএস পূর্ণাঙ্গ > ৪৬তম বিসিএস > বাংলা > মডেল টেস্ট - ০১"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                JSON ফাইল নির্বাচন করুন:
              </label>
              <input
                type="file"
                accept=".json"
                ref={jsonInputRef}
                onChange={(e) => setJsonFile(e.target.files[0] || null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1.5px dashed #94a3b8',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div style={{ textAlign: 'center', margin: '14px 0', color: '#94a3b8', fontWeight: 600 }}>অথবা</div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                JSON কোড পেস্ট করুন:
              </label>
              <textarea
                rows={6}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='[ { "q": "প্রশ্ন কী?", "options": ["ক", "খ", "গ", "ঘ"], "ans": 0, "explanation": "..." } ]'
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isUploadingJson}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#006a4e',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: isUploadingJson ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(0, 106, 78, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isUploadingJson ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check-to-slot"></i>
                  <span>JSON প্রশ্ন সাবমিট করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: QUESTIONS EXPLORER */}
      {activeTab === 'questions' && (
        <div>
          {/* Top Filter & Search */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={explorerSearch}
                onChange={(e) => setExplorerSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuestions(explorerCategory, explorerSearch)}
                placeholder="প্রশ্ন খুঁজুন..."
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  minWidth: '260px'
                }}
              />

              <button
                onClick={() => fetchQuestions(explorerCategory, explorerSearch)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                খুঁজুন
              </button>
            </div>

            <button
              onClick={() => {
                setNewQuestionForm({
                  q: '',
                  options: ['', '', '', ''],
                  ans: 0,
                  explanation: '',
                  category: targetUploadCategory || ''
                });
                setShowAddQuestionModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#006a4e',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>নতুন প্রশ্ন লিখুন</span>
            </button>
          </div>

          {/* Questions List */}
          {loadingQuestions ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.8rem', marginBottom: '10px' }}></i>
              <p>প্রশ্নাবলি লোড হচ্ছে...</p>
            </div>
          ) : questionsList.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                padding: '50px',
                textAlign: 'center',
                borderRadius: '14px',
                border: '1px dashed #cbd5e1',
                color: '#64748b'
              }}
            >
              <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '12px', color: '#94a3b8' }}></i>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>কোনো প্রশ্ন পাওয়া যায়নি।</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>CSV বা JSON ট্যাবের মাধ্যমে প্রশ্ন আপলোড করুন।</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {questionsList.map((q, idx) => (
                <div
                  key={q._id || idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '18px 22px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          marginRight: '8px'
                        }}
                      >
                        {q.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      style={{
                        color: '#ef4444',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '4px'
                      }}
                      title="মুছে ফেলুন"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
                    <span style={{ color: '#0284c7', marginRight: '6px' }}>{idx + 1}.</span>
                    {q.q}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    {(q.options || []).map((opt, oIdx) => {
                      const isCorrect = q.ans === oIdx;
                      return (
                        <div
                          key={oIdx}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.88rem',
                            backgroundColor: isCorrect ? '#ecfdf5' : '#f8fafc',
                            color: isCorrect ? '#065f46' : '#334155',
                            border: isCorrect ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                            fontWeight: isCorrect ? 700 : 500
                          }}
                        >
                          <span style={{ marginRight: '6px', opacity: 0.8 }}>
                            {['(ক)', '(খ)', '(গ)', '(ঘ)'][oIdx] || `(${oIdx + 1})`}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <i className="fa-solid fa-check" style={{ marginLeft: '6px', color: '#10b981' }}></i>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div style={{ backgroundColor: '#fdf4ff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', color: '#86198f' }}>
                      <strong>ব্যাখ্যা: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXAM CREATE/EDIT MODAL */}
      {showExamModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {isEditingExam ? 'পূর্ণাঙ্গ মডেল টেস্ট এডিট' : 'নতুন পূর্ণাঙ্গ মডেল টেস্ট তৈরি'}
              </h3>
              <button
                onClick={() => setShowExamModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveExam}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  টেস্টের শিরোনাম:
                </label>
                <input
                  type="text"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="যেমন: ৪৬তম বিসিএস প্রিলিমিনারি পূর্ণাঙ্গ গ্র্যান্ড মডেল টেস্ট - ০১"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                    ক্যাটাগরি আইডি:
                  </label>
                  <select
                    value={examForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      let name = 'বিসিএস পূর্ণাঙ্গ';
                      if (val === 'bank') name = 'ব্যাংক জব পূর্ণাঙ্গ';
                      if (val === 'primary') name = 'প্রাইমারি পূর্ণাঙ্গ';
                      if (val === 'subject') name = 'বিষয়ভিত্তিক পূর্ণাঙ্গ';
                      setExamForm({ ...examForm, category: val, categoryName: name });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="bcs">বিসিএস (bcs)</option>
                    <option value="bank">ব্যাংক জব (bank)</option>
                    <option value="primary">প্রাইমারি শিক্ষক (primary)</option>
                    <option value="subject">বিষয়ভিত্তিক (subject)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                    ক্যাটাগরি নাম (বাংলা):
                  </label>
                  <input
                    type="text"
                    value={examForm.categoryName}
                    onChange={(e) => setExamForm({ ...examForm, categoryName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                    মোট প্রশ্ন:
                  </label>
                  <input
                    type="number"
                    value={examForm.totalQuestions}
                    onChange={(e) => setExamForm({ ...examForm, totalQuestions: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                    সময় (মিনিট):
                  </label>
                  <input
                    type="number"
                    value={examForm.durationMinutes}
                    onChange={(e) => setExamForm({ ...examForm, durationMinutes: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                    কাট মার্ক:
                  </label>
                  <input
                    type="text"
                    value={examForm.negativeMarks}
                    onChange={(e) => setExamForm({ ...examForm, negativeMarks: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  বর্ণনা (Description):
                </label>
                <textarea
                  rows={3}
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  সিলেবাস ও বিষয়ভিত্তিক বণ্টন টেক্সট:
                </label>
                <input
                  type="text"
                  value={examForm.subjectsText}
                  onChange={(e) => setExamForm({ ...examForm, subjectsText: e.target.value })}
                  placeholder="বাংলা (৩৫), English (৩৫), গণিত (৩০), সাধারণ জ্ঞান (৫০)..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT CREATE/EDIT MODAL */}
      {showSubjectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '550px',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {isEditingSubject ? 'বিষয় এডিট' : 'নতুন বিষয় যোগ'}
              </h3>
              <button
                onClick={() => setShowSubjectModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveSubject}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  বিষয়ের নাম:
                </label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="যেমন: বাংলা / English / গণিত"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                    কোড (Code):
                  </label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    placeholder="BANGLA"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                    মডেল টেস্ট সংখ্যা:
                  </label>
                  <input
                    type="number"
                    value={subjectForm.modelTestsCount}
                    onChange={(e) => setSubjectForm({ ...subjectForm, modelTestsCount: parseInt(e.target.value, 10) || 20 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  সংক্ষিপ্ত বিবরণ:
                </label>
                <input
                  type="text"
                  value={subjectForm.desc}
                  onChange={(e) => setSubjectForm({ ...subjectForm, desc: e.target.value })}
                  placeholder="ব্যাকরণ, সাহিত্য ও শুদ্ধ প্রয়োগ"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  থিম কালার (Hex):
                </label>
                <input
                  type="color"
                  value={subjectForm.theme?.color || '#0284c7'}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      theme: {
                        ...subjectForm.theme,
                        color: e.target.value,
                        gradient: `linear-gradient(135deg, ${e.target.value} 0%, #2563eb 100%)`
                      }
                    })
                  }
                  style={{ width: '60px', height: '36px', padding: '0', borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#006a4e', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE QUESTION CREATE MODAL */}
      {showAddQuestionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                নতুন প্রশ্ন তৈরি করুন
              </h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSingleQuestion}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  ক্যাটাগরি পাথ:
                </label>
                <input
                  type="text"
                  value={newQuestionForm.category}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, category: e.target.value })}
                  placeholder="যেমন: বিসিএস পূর্ণাঙ্গ > ৪৬তম বিসিএস > বাংলা > মডেল টেস্ট - ০১"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  প্রশ্ন (Question):
                </label>
                <textarea
                  rows={2}
                  value={newQuestionForm.q}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, q: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {newQuestionForm.options.map((opt, idx) => (
                  <div key={idx}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '2px' }}>
                      অপশন {['ক', 'খ', 'গ', 'ঘ'][idx]}:
                    </label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...newQuestionForm.options];
                        newOpts[idx] = e.target.value;
                        setNewQuestionForm({ ...newQuestionForm, options: newOpts });
                      }}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  সঠিক উত্তর:
                </label>
                <select
                  value={newQuestionForm.ans}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, ans: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value={0}>অপশন ক (১ম অপশন)</option>
                  <option value={1}>অপশন খ (২য় অপশন)</option>
                  <option value={2}>অপশন গ (৩য় অপশন)</option>
                  <option value={3}>অপশন ঘ (৪র্থ অপশন)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>
                  ব্যাখ্যা (ঐচ্ছিক):
                </label>
                <textarea
                  rows={2}
                  value={newQuestionForm.explanation}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#006a4e', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  প্রশ্ন যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
