'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminSubjectiveModelTestDashboardPage() {
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'subjects' | 'csv' | 'json' | 'single' | 'questions'
  const [loading, setLoading] = useState(true);

  // Config data: Exams, Subjects, Chapters, Topics
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState({});
  const [topics, setTopics] = useState({});

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
    categoryName: 'বিসিএস',
    tags: ['Live Exam', 'BCS'],
    badgeColor: 'rose',
    onlineUsers: 40,
    borderColor: '#0284c7',
    description: '',
    subjectsText: ''
  });

  // Chapter Modal State
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedSubjectForChapter, setSelectedSubjectForChapter] = useState('bangla');
  const [chapterForm, setChapterForm] = useState({
    id: '',
    title: '',
    desc: ''
  });

  // Topic Modal State
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicSubjectId, setTopicSubjectId] = useState('bangla');
  const [topicChapterId, setTopicChapterId] = useState('1');
  const [newTopicName, setNewTopicName] = useState('');

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

  // Single Question Builder State
  const [newQuestionForm, setNewQuestionForm] = useState({
    q: '',
    options: ['', '', '', ''],
    ans: 0,
    explanation: '',
    category: ''
  });

  // Fetch Config (Exams, Subjects, Chapters, Topics)
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subjective-model-test/config');
      const data = await res.json();
      if (data.success) {
        setExams(data.exams || []);
        setSubjects(data.subjects || []);
        setChapters(data.chapters || {});
        setTopics(data.topics || {});

        if (data.exams.length > 0 && !targetUploadCategory) {
          const first = data.exams[0];
          setTargetUploadCategory(`${first.categoryName} > বাংলা > বাংলা ভাষা ও ব্যাকরণ > ধ্বনি ও বর্ণ`);
        }
      }
    } catch (err) {
      console.error('Failed to load subjective config:', err);
      showTopAlert('কনফিগারেশন লোড করতে ব্যর্থ হয়েছে!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Questions for Explorer
  const fetchQuestions = async (cat = explorerCategory, search = explorerSearch) => {
    setLoadingQuestions(true);
    try {
      let url = '/api/subjective-model-test/questions?limit=100';
      if (cat && cat !== 'all') url += `&category=${encodeURIComponent(cat)}`;
      if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setQuestionsList(data.questions || []);
        setTotalQuestions(data.total || (data.questions ? data.questions.length : 0));
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
  const saveConfig = async (updatedExams, updatedSubjects, updatedChapters, updatedTopics) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch('/api/subjective-model-test/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          exams: updatedExams !== undefined ? updatedExams : exams,
          subjects: updatedSubjects !== undefined ? updatedSubjects : subjects,
          chapters: updatedChapters !== undefined ? updatedChapters : chapters,
          topics: updatedTopics !== undefined ? updatedTopics : topics
        })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('🎉 কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        if (data.exams) setExams(data.exams);
        if (data.subjects) setSubjects(data.subjects);
        if (data.chapters) setChapters(data.chapters);
        if (data.topics) setTopics(data.topics);
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
      categoryName: 'বিসিএস',
      tags: ['Live Exam', 'BCS'],
      badgeColor: 'rose',
      onlineUsers: 40,
      borderColor: '#0284c7',
      description: '',
      subjectsText: 'বাংলা, English, গণিত, সাধারণ জ্ঞান'
    });
    setShowExamModal(true);
  };

  const handleOpenEditExam = (exam) => {
    setIsEditingExam(true);
    setExamForm({
      ...exam,
      tags: exam.tags || ['Live Exam']
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

    const ok = await saveConfig(updated, subjects, chapters, topics);
    if (ok) {
      setShowExamModal(false);
    }
  };

  const handleDeleteExam = async (id, title) => {
    const confirmed = await showTopAlert(`আপনি কি নিশ্চিতভাবে "${title}" মডেল টেস্টটি মুছে ফেলতে চান?`, 'danger', true);
    if (!confirmed) return;

    const updated = exams.filter((ex) => ex.id !== id);
    await saveConfig(updated, subjects, chapters, topics);
  };

  // Chapter Handlers
  const handleOpenAddChapter = (subjectId) => {
    setSelectedSubjectForChapter(subjectId);
    const existing = chapters[subjectId] || [];
    const nextId = existing.length > 0 ? Math.max(...existing.map(c => Number(c.id) || 0)) + 1 : 1;
    setChapterForm({
      id: nextId,
      title: '',
      desc: ''
    });
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) {
      showTopAlert('অধ্যায়ের শিরোনাম লিখুন!', 'warning');
      return;
    }

    const currentList = chapters[selectedSubjectForChapter] || [];
    const updatedList = [...currentList, chapterForm];
    const newChapters = { ...chapters, [selectedSubjectForChapter]: updatedList };

    const ok = await saveConfig(exams, subjects, newChapters, topics);
    if (ok) {
      setShowChapterModal(false);
    }
  };

  const handleDeleteChapter = async (subjectId, chapterId, title) => {
    const confirmed = await showTopAlert(`আপনি কি "${title}" অধ্যায়টি মুছে ফেলতে চান?`, 'danger', true);
    if (!confirmed) return;

    const currentList = chapters[subjectId] || [];
    const updatedList = currentList.filter(c => String(c.id) !== String(chapterId));
    const newChapters = { ...chapters, [subjectId]: updatedList };

    await saveConfig(exams, subjects, newChapters, topics);
  };

  // Topic Handlers
  const handleOpenAddTopic = (subjectId, chapterId) => {
    setTopicSubjectId(subjectId);
    setTopicChapterId(String(chapterId));
    setNewTopicName('');
    setShowTopicModal(true);
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) {
      showTopAlert('টপিকের নাম লিখুন!', 'warning');
      return;
    }

    const subTopics = topics[topicSubjectId] || {};
    const chapTopics = subTopics[topicChapterId] || [];
    const updatedChapTopics = [...chapTopics, newTopicName.trim()];
    const newTopics = {
      ...topics,
      [topicSubjectId]: {
        ...subTopics,
        [topicChapterId]: updatedChapTopics
      }
    };

    const ok = await saveConfig(exams, subjects, chapters, newTopics);
    if (ok) {
      setShowTopicModal(false);
      setNewTopicName('');
    }
  };

  const handleDeleteTopic = async (subjectId, chapterId, topicIdx) => {
    const confirmed = await showTopAlert('আপনি কি এই টপিকটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirmed) return;

    const subTopics = topics[subjectId] || {};
    const chapTopics = subTopics[chapterId] || [];
    const updatedChapTopics = chapTopics.filter((_, idx) => idx !== topicIdx);
    const newTopics = {
      ...topics,
      [subjectId]: {
        ...subTopics,
        [chapterId]: updatedChapTopics
      }
    };

    await saveConfig(exams, subjects, chapters, newTopics);
  };

  // CSV Upload Handlers
  const handleUploadCsv = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      showTopAlert('অনুগ্রহ করে একটি CSV ফাইল নির্বাচন করুন!', 'warning');
      return;
    }

    setIsUploadingCsv(true);
    const formData = new FormData();
    formData.append('file', csvFile);
    if (targetUploadCategory) {
      formData.append('category', targetUploadCategory);
    }

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch('/api/subjective-model-test/upload-csv', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`🎉 ${data.message || 'CSV আপলোড সফল হয়েছে!'}`, 'success');
        setCsvFile(null);
        if (csvInputRef.current) csvInputRef.current.value = '';
        fetchQuestions(explorerCategory);
      } else {
        showTopAlert(`❌ আপলোড ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ CSV আপলোডে ত্রুটি ঘটেছে!', 'danger');
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // JSON Upload Handlers
  const handleUploadJson = async (e) => {
    e.preventDefault();
    if (!jsonFile && !jsonText.trim()) {
      showTopAlert('JSON ফাইল নির্বাচন করুন অথবা সরাসরি JSON টেক্সট পেস্ট করুন!', 'warning');
      return;
    }

    setIsUploadingJson(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      let res;
      if (jsonFile) {
        const formData = new FormData();
        formData.append('file', jsonFile);
        if (targetUploadCategory) {
          formData.append('category', targetUploadCategory);
        }
        res = await fetch('/api/subjective-model-test/upload-json', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else {
        let parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (pe) {
          showTopAlert('❌ ইনপুট করা JSON ফরম্যাট সঠিক নয়!', 'danger');
          setIsUploadingJson(false);
          return;
        }

        res = await fetch('/api/subjective-model-test/upload-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            questions: Array.isArray(parsed) ? parsed : (parsed.questions || parsed.mcqs || []),
            category: targetUploadCategory
          })
        });
      }

      const data = await res.json();
      if (data.success) {
        showTopAlert(`🎉 ${data.message || 'JSON আপলোড সফল হয়েছে!'}`, 'success');
        setJsonFile(null);
        setJsonText('');
        if (jsonInputRef.current) jsonInputRef.current.value = '';
        fetchQuestions(explorerCategory);
      } else {
        showTopAlert(`❌ আপলোড ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ JSON আপলোডে ত্রুটি ঘটেছে!', 'danger');
    } finally {
      setIsUploadingJson(false);
    }
  };

  // Single Question Creator Handler
  const handleCreateSingleQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionForm.q.trim()) {
      showTopAlert('প্রশ্নের বিবরণ লিখুন!', 'warning');
      return;
    }
    if (newQuestionForm.options.some((o) => !o.trim())) {
      showTopAlert('৪টি অপশনই সঠিকভাবে পূরণ করুন!', 'warning');
      return;
    }

    const cat = newQuestionForm.category.trim() || targetUploadCategory || 'বিসিএস > বাংলা > ব্যাকরণ';
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch('/api/subjective-model-test/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          q: newQuestionForm.q.trim(),
          options: newQuestionForm.options.map((o) => o.trim()),
          ans: parseInt(newQuestionForm.ans, 10),
          explanation: newQuestionForm.explanation.trim(),
          category: cat
        })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('🎉 প্রশ্নটি সফলভাবে তৈরি হয়েছে!', 'success');
        setNewQuestionForm({
          q: '',
          options: ['', '', '', ''],
          ans: 0,
          explanation: '',
          category: cat
        });
        fetchQuestions(explorerCategory);
      } else {
        showTopAlert(`❌ প্রশ্ন সংরক্ষণ ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ সার্ভার সংযোগে ত্রুটি!', 'danger');
    }
  };

  // Delete Question Handler
  const handleDeleteQuestion = async (id) => {
    const confirmed = await showTopAlert('আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?', 'danger', true);
    if (!confirmed) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/subjective-model-test/questions?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('প্রশ্নটি মুছে ফেলা হয়েছে!', 'success');
        setQuestionsList((prev) => prev.filter((q) => q._id !== id));
        setTotalQuestions((prev) => Math.max(0, prev - 1));
      } else {
        showTopAlert(`মুছে ফেলা ব্যর্থ: ${data.error}`, 'danger');
      }
    } catch (err) {
      showTopAlert('মুছে ফেলতে ত্রুটি হয়েছে!', 'danger');
    }
  };

  // Filtered exams for UI
  const filteredExams = exams.filter((ex) => {
    const matchCat = selectedCategoryFilter === 'all' || ex.category === selectedCategoryFilter;
    const q = examSearch.toLowerCase().trim();
    if (!q) return matchCat;
    return matchCat && (
      (ex.title || '').toLowerCase().includes(q) ||
      (ex.categoryName || '').toLowerCase().includes(q) ||
      (ex.description || '').toLowerCase().includes(q)
    );
  });

  // Calculate total chapters & topics
  const totalChaptersCount = Object.values(chapters).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0);
  const totalTopicsCount = Object.values(topics).reduce((acc, subObj) => {
    if (!subObj) return acc;
    return acc + Object.values(subObj).reduce((tAcc, tArr) => tAcc + (Array.isArray(tArr) ? tArr.length : 0), 0);
  }, 0);

  return (
    <div style={{ padding: '24px 30px', maxWidth: '1400px', margin: '0 auto', color: '#1e293b' }}>
      
      {/* Top Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}
            >
              Paid System
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              বিষয়ভিত্তিক মডেল টেস্ট কন্ট্রোল ড্যাশবোর্ড
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
            বিষয় ও অধ্যায়ভিত্তিক মডেল টেস্ট, ক্যাটাগরি, CSV/JSON বাল্ক প্রশ্ন আপলোড এবং কোয়েশ্চন ব্যাংক নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/subjective-model-test"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
            }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
            <span>লাইভ পেজ দেখুন</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>মোট প্রশ্ন সংখ্যা</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>{totalQuestions}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>মোট মডেল টেস্ট</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{exams.length}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>মোট বিষয় (Subjects)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>{subjects.length}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>অধ্যায় ও টপিক সংখ্যা</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed' }}>{totalChaptersCount} / {totalTopicsCount}</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'exams', label: 'মডেল টেস্ট তালিকা', icon: 'fa-solid fa-list-check' },
          { id: 'subjects', label: 'বিষয়, অধ্যায় ও টপিক', icon: 'fa-solid fa-layer-group' },
          { id: 'csv', label: 'CSV বাল্ক আপলোড', icon: 'fa-solid fa-file-csv' },
          { id: 'json', label: 'JSON বাল্ক আপলোড', icon: 'fa-solid fa-file-code' },
          { id: 'single', label: 'নতুন প্রশ্ন তৈরি', icon: 'fa-solid fa-plus' },
          { id: 'questions', label: 'প্রশ্ন এক্সপ্লোরার', icon: 'fa-solid fa-magnifying-glass' }
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'questions') fetchQuestions(explorerCategory);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontWeight: 700,
                fontSize: '0.94rem',
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                borderBottom: active ? '3px solid #0284c7' : '3px solid transparent',
                color: active ? '#0284c7' : '#64748b',
                transition: 'all 0.2s ease',
                marginBottom: '-2px'
              }}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXAMS LIST */}
      {activeTab === 'exams' && (
        <div>
          {/* Controls Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                placeholder="মডেল টেস্ট খুঁজুন..."
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  minWidth: '240px'
                }}
              />

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="all">সকল ক্যাটাগরি</option>
                <option value="bcs">বিসিএস</option>
                <option value="bank">ব্যাংক জব</option>
                <option value="primary">প্রাথমিক শিক্ষক</option>
                <option value="subject">পূর্ণাঙ্গ বিষয়ভিত্তিক</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateExam}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>নতুন টেস্ট যোগ করুন</span>
            </button>
          </div>

          {/* Exams Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '18px' }}>
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      {exam.categoryName || exam.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                      <i className="fa-solid fa-users" style={{ marginRight: '4px' }}></i>
                      {exam.onlineUsers || 30} জন লাইভ
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    {exam.title}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', marginBottom: '14px' }}>
                    {exam.description}
                  </p>

                  {exam.subjectsText && (
                    <div style={{ fontSize: '0.8rem', color: '#0284c7', marginBottom: '16px' }}>
                      <i className="fa-solid fa-bookmark" style={{ marginRight: '6px' }}></i>
                      {exam.subjectsText}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <button
                    onClick={() => handleOpenEditExam(exam)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fa-regular fa-pen-to-square" style={{ marginRight: '6px' }}></i>
                    এডিট
                  </button>

                  <button
                    onClick={() => handleDeleteExam(exam.id, exam.title)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid #fee2e2',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECTS, CHAPTERS & TOPICS */}
      {activeTab === 'subjects' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {subjects.map((sub) => {
              const subChapters = chapters[sub.id] || [];

              return (
                <div
                  key={sub.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: sub.theme?.color || '#0284c7', backgroundColor: sub.theme?.lightBg || '#f0f9ff', padding: '3px 8px', borderRadius: '6px' }}>
                      {sub.code}
                    </span>
                    <button
                      onClick={() => handleOpenAddChapter(sub.id)}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fa-solid fa-plus" style={{ marginRight: '4px' }}></i> অধ্যায় যোগ
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    {sub.name}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '18px' }}>
                    {sub.desc}
                  </p>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                      অধ্যায়সমূহ ({subChapters.length}):
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {subChapters.map((ch) => {
                        const chapTopics = (topics[sub.id] && topics[sub.id][ch.id]) || [];

                        return (
                          <div
                            key={ch.id}
                            style={{
                              backgroundColor: '#f8fafc',
                              borderRadius: '10px',
                              padding: '12px',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                                  অধ্যায় {ch.id}: {ch.title}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleOpenAddTopic(sub.id, ch.id)}
                                  title="টপিক যোগ করুন"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#0284c7',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <i className="fa-solid fa-plus-circle"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteChapter(sub.id, ch.id, ch.title)}
                                  title="অধ্যায় মুছুন"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <i className="fa-regular fa-trash-can"></i>
                                </button>
                              </div>
                            </div>

                            {/* Topics pills */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                              {chapTopics.map((top, tIdx) => (
                                <span
                                  key={tIdx}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '14px',
                                    padding: '2px 8px',
                                    fontSize: '0.78rem',
                                    color: '#334155',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <span>{top}</span>
                                  <i
                                    className="fa-solid fa-xmark"
                                    onClick={() => handleDeleteTopic(sub.id, String(ch.id), tIdx)}
                                    style={{ cursor: 'pointer', color: '#94a3b8' }}
                                    title="টপিক মুছুন"
                                  />
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CSV BULK UPLOAD */}
      {activeTab === 'csv' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            CSV ফাইল থেকে প্রশ্ন আপলোড
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            এক ক্লিকে আপনার বিষয় ও অধ্যায়ভিত্তিক প্রশ্নমালা এক্সেল বা CSV ফাইল থেকে সিস্টেমে যুক্ত করুন।
          </p>

          <form onSubmit={handleUploadCsv}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                টার্গেট ক্যাটাগরি / বিষয় পাথ:
              </label>
              <input
                type="text"
                value={targetUploadCategory}
                onChange={(e) => setTargetUploadCategory(e.target.value)}
                placeholder="যেমন: বিসিএস > বাংলা > বাংলা ভাষা ও ব্যাকরণ > ধ্বনি ও বর্ণ"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                * CSV ফাইলে ক্যাটাগরি কলাম না থাকলে এই ক্যাটাগরি ব্যবহার করা হবে।
              </span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                CSV ফাইল নির্বাচন করুন:
              </label>
              <input
                type="file"
                accept=".csv"
                ref={csvInputRef}
                onChange={(e) => setCsvFile(e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px dashed #cbd5e1',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Template Info Box */}
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '14px', marginBottom: '24px', fontSize: '0.85rem', color: '#0369a1' }}>
              <strong>প্রয়োজনীয় CSV কলামসমূহ:</strong><br />
              <code>question, option1, option2, option3, option4, answer, explanation, category</code><br />
              <span style={{ color: '#0c4a6e', marginTop: '4px', display: 'inline-block' }}>
                * উত্তর কলামে 0-3 অথবা 1-4 অথবা ক-ঘ সমর্থন করে।
              </span>
            </div>

            <button
              type="submit"
              disabled={isUploadingCsv}
              style={{
                width: '100%',
                backgroundColor: isUploadingCsv ? '#94a3b8' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '13px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: isUploadingCsv ? 'not-allowed' : 'pointer',
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
                  <span>CSV প্রশ্ন আপলোড করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: JSON BULK UPLOAD */}
      {activeTab === 'json' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            JSON ফাইল বা সরাসরি টেক্সট পেস্ট
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            JSON ফরম্যাটে একাধিক MCQ প্রশ্ন একবারে ডাটাবেজে যুক্ত করুন।
          </p>

          <form onSubmit={handleUploadJson}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                ডিফল্ট ক্যাটাগরি:
              </label>
              <input
                type="text"
                value={targetUploadCategory}
                onChange={(e) => setTargetUploadCategory(e.target.value)}
                placeholder="যেমন: বিসিএস > বাংলা > ব্যাকরণ"
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
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                JSON ফাইল নির্বাচন (ঐচ্ছিক):
              </label>
              <input
                type="file"
                accept=".json"
                ref={jsonInputRef}
                onChange={(e) => setJsonFile(e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                অথবা সরাসরি JSON পেস্ট করুন:
              </label>
              <textarea
                rows={8}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='[
  {
    "q": "বাংলা বর্ণমালায় স্বরবর্ণ কয়টি?",
    "options": ["৯টি", "১০টি", "১১টি", "১২টি"],
    "ans": 2,
    "explanation": "বাংলা বর্ণমালায় মোট ১১টি স্বরবর্ণ রয়েছে।"
  }
]'
                style={{
                  width: '100%',
                  padding: '12px',
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
                backgroundColor: isUploadingJson ? '#94a3b8' : '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '13px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: isUploadingJson ? 'not-allowed' : 'pointer',
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
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>JSON প্রশ্ন আপলোড করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: SINGLE QUESTION BUILDER */}
      {activeTab === 'single' && (
        <div style={{ maxWidth: '850px', margin: '0 auto', backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            নতুন প্রশ্ন যোগ করুন (MCQ Builder)
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            সরাসরি একটি নতুন MCQ প্রশ্ন তৈরি করুন এবং সঠিক উত্তর চিহ্নিত করে সেভ করুন।
          </p>

          <form onSubmit={handleCreateSingleQuestion}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                ক্যাটাগরি / পাথ:
              </label>
              <input
                type="text"
                value={newQuestionForm.category}
                onChange={(e) => setNewQuestionForm({ ...newQuestionForm, category: e.target.value })}
                placeholder="যেমন: বিসিএস > বাংলা > বাংলা ভাষা ও ব্যাকরণ > শব্দ"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                প্রশ্ন:
              </label>
              <textarea
                rows={3}
                value={newQuestionForm.q}
                onChange={(e) => setNewQuestionForm({ ...newQuestionForm, q: e.target.value })}
                placeholder="প্রশ্নের বর্ণনা লিখুন..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {/* 4 Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '18px' }}>
              {['ক', 'খ', 'গ', 'ঘ'].map((lbl, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                    <input
                      type="radio"
                      name="correct_ans"
                      checked={newQuestionForm.ans === idx}
                      onChange={() => setNewQuestionForm({ ...newQuestionForm, ans: idx })}
                    />
                    <span>অপশন {lbl} {newQuestionForm.ans === idx && <span style={{ color: '#059669' }}>(সঠিক উত্তর)</span>}</span>
                  </label>
                  <input
                    type="text"
                    value={newQuestionForm.options[idx]}
                    onChange={(e) => {
                      const opts = [...newQuestionForm.options];
                      opts[idx] = e.target.value;
                      setNewQuestionForm({ ...newQuestionForm, options: opts });
                    }}
                    placeholder={`অপশন ${lbl} লিখুন`}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: newQuestionForm.ans === idx ? '2px solid #10b981' : '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                ব্যাখ্যা (ঐচ্ছিক):
              </label>
              <textarea
                rows={3}
                value={newQuestionForm.explanation}
                onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                placeholder="প্রশ্নের বিস্তারিত সমাধান ও ব্যাখ্যা..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '13px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>প্রশ্নটি সংরক্ষণ করুন</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: QUESTIONS EXPLORER */}
      {activeTab === 'questions' && (
        <div>
          {/* Controls Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              <input
                type="text"
                value={explorerSearch}
                onChange={(e) => setExplorerSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuestions(explorerCategory, explorerSearch)}
                placeholder="প্রশ্ন বা ব্যাখ্যা দিয়ে খুঁজুন..."
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  minWidth: '260px',
                  flex: 1
                }}
              />

              <button
                onClick={() => fetchQuestions(explorerCategory, explorerSearch)}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                খুঁজুন
              </button>
            </div>

            <button
              onClick={() => fetchQuestions('all', '')}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <i className="fa-solid fa-arrows-rotate" style={{ marginRight: '6px' }}></i> রিফ্রেশ
            </button>
          </div>

          {loadingQuestions ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7', marginBottom: '10px' }}></i>
              <p>প্রশ্ন লোড হচ্ছে...</p>
            </div>
          ) : questionsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <i className="fa-regular fa-folder-open" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '12px' }}></i>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>কোনো প্রশ্ন পাওয়া যায়নি। CSV বা একক ফরমের মাধ্যমে প্রশ্ন যোগ করুন।</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questionsList.map((qItem, idx) => (
                <div
                  key={qItem._id || idx}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '18px 22px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.78rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                        #{idx + 1}
                      </span>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.78rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>
                        {qItem.category || 'সাধারণ'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(qItem._id)}
                      title="প্রশ্ন মুছুন"
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#dc2626',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <i className="fa-regular fa-trash-can" style={{ marginRight: '4px' }}></i> মুছুন
                    </button>
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                    {qItem.q}
                  </div>

                  {/* Options List */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    {qItem.options && qItem.options.map((opt, oIdx) => {
                      const isCorrect = qItem.ans === oIdx;
                      return (
                        <div
                          key={oIdx}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: isCorrect ? '#ecfdf5' : '#f8fafc',
                            border: isCorrect ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            color: isCorrect ? '#065f46' : '#334155',
                            fontSize: '0.9rem',
                            fontWeight: isCorrect ? 700 : 500
                          }}
                        >
                          <span style={{ marginRight: '6px' }}>{['(ক)', '(খ)', '(গ)', '(ঘ)'][oIdx] || `(${oIdx + 1})`}</span>
                          <span>{opt}</span>
                          {isCorrect && <i className="fa-solid fa-check" style={{ marginLeft: '6px', color: '#10b981' }}></i>}
                        </div>
                      );
                    })}
                  </div>

                  {qItem.explanation && (
                    <div style={{ backgroundColor: '#f0f9ff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#0369a1', borderLeft: '4px solid #0284c7' }}>
                      <strong>ব্যাখ্যা: </strong> {qItem.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXAM MODAL */}
      {showExamModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '26px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {isEditingExam ? 'মডেল টেস্ট এডিট করুন' : 'নতুন মডেল টেস্ট তৈরি করুন'}
              </h3>
              <i className="fa-solid fa-xmark" onClick={() => setShowExamModal(false)} style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8' }} />
            </div>

            <form onSubmit={handleSaveExam}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>শিরোনাম:</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>ক্যাটাগরি আইডি:</label>
                  <select
                    value={examForm.category}
                    onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="bcs">bcs</option>
                    <option value="bank">bank</option>
                    <option value="primary">primary</option>
                    <option value="subject">subject</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>ক্যাটাগরি নাম (বাংলা):</label>
                  <input
                    type="text"
                    value={examForm.categoryName}
                    onChange={(e) => setExamForm({ ...examForm, categoryName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>বিবরণ:</label>
                <textarea
                  rows={3}
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>বিষয়সমূহের তালিকা:</label>
                <input
                  type="text"
                  value={examForm.subjectsText}
                  onChange={(e) => setExamForm({ ...examForm, subjectsText: e.target.value })}
                  placeholder="যেমন: বাংলা, English, গণিত, সাধারণ জ্ঞান"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHAPTER MODAL */}
      {showChapterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>নতুন অধ্যায় যুক্ত করুন</h3>
              <i className="fa-solid fa-xmark" onClick={() => setShowChapterModal(false)} style={{ cursor: 'pointer', color: '#94a3b8' }} />
            </div>

            <form onSubmit={handleSaveChapter}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>অধ্যায় নম্বর:</label>
                <input
                  type="number"
                  required
                  value={chapterForm.id}
                  onChange={(e) => setChapterForm({ ...chapterForm, id: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>অধ্যায় শিরোনাম:</label>
                <input
                  type="text"
                  required
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>বিবরণ:</label>
                <textarea
                  rows={3}
                  value={chapterForm.desc}
                  onChange={(e) => setChapterForm({ ...chapterForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {showTopicModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>নতুন টপিক যুক্ত করুন</h3>
              <i className="fa-solid fa-xmark" onClick={() => setShowTopicModal(false)} style={{ cursor: 'pointer', color: '#94a3b8' }} />
            </div>

            <form onSubmit={handleSaveTopic}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>টপিকের নাম:</label>
                <input
                  type="text"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="যেমন: ধ্বনি ও বর্ণ"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
