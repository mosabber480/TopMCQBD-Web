'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { showTopAlert } from '@/components/layout/TopAlert';
import { getLiveExamApiUrl } from '@/lib/config';

export default function AdminLiveExamModelDashboardPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Edit or Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [examForm, setExamForm] = useState({
    id: '',
    title: '',
    category: 'bcs',
    categoryName: 'বিসিএস',
    badge: 'লাইভ এক্সাম',
    badgeColor: 'rose',
    durationMinutes: 15,
    totalMarks: 20,
    negativeMarking: 0.5,
    participants: 0,
    status: 'live',
    scheduledStart: new Date().toISOString().slice(0, 16),
    scheduledEnd: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
    description: '',
    questions: []
  });

  // Current Question Builder state inside modal
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'questions', 'csv'
  const [newQuestion, setNewQuestion] = useState({
    id: 1,
    question: '',
    subject: 'সাধারণ বিষয়',
    options: ['', '', '', ''],
    ans: 0,
    explanation: ''
  });

  const fileInputRef = useRef(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(getLiveExamApiUrl('/api/live-exam/exams'), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.exams) {
          setExams(data.exams);
        }
      }
    } catch (err) {
      console.error("Exams fetch error:", err);
      showTopAlert('ডাটাবেজ থেকে মডেল টেস্ট লোড করতে ত্রুটি।', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setExamForm({
      id: `live-exam-${Date.now()}`,
      title: '',
      category: 'bcs',
      categoryName: 'বিসিএস',
      badge: 'লাইভ এক্সাম',
      badgeColor: 'rose',
      durationMinutes: 15,
      totalMarks: 20,
      negativeMarking: 0.5,
      participants: 0,
      status: 'live',
      scheduledStart: new Date().toISOString().slice(0, 16),
      scheduledEnd: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      description: '',
      questions: []
    });
    setActiveTab('info');
    setShowModal(true);
  };

  const openEditModal = (exam) => {
    setIsEditing(true);
    setExamForm({
      id: exam.id,
      title: exam.title || '',
      category: exam.category || 'bcs',
      categoryName: exam.categoryName || 'বিসিএস',
      badge: exam.badge || 'লাইভ এক্সাম',
      badgeColor: exam.badgeColor || 'rose',
      durationMinutes: exam.durationMinutes || 15,
      totalMarks: exam.totalMarks || 20,
      negativeMarking: exam.negativeMarking || 0.5,
      participants: exam.participants || 0,
      status: exam.status || 'live',
      scheduledStart: exam.scheduledStart ? exam.scheduledStart.slice(0, 16) : new Date().toISOString().slice(0, 16),
      scheduledEnd: exam.scheduledEnd ? exam.scheduledEnd.slice(0, 16) : new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      description: exam.description || '',
      questions: exam.questions || []
    });
    setActiveTab('info');
    setShowModal(true);
  };

  const handleSaveExam = async (e) => {
    e?.preventDefault();
    if (!examForm.title.trim()) {
      showTopAlert('মডেল টেস্টের শিরোনাম প্রদান করুন।', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const url = getLiveExamApiUrl('/api/live-exam/exams');
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...examForm,
          questionsCount: examForm.questions.length
        })
      });

      if (res.ok) {
        showTopAlert(isEditing ? '✅ মডেল টেস্ট ও প্রশ্নাবলি ডাটাবেজে সফলভাবে আপডেট হয়েছে!' : '✅ নতুন মডেল টেস্ট ও প্রশ্নাবলি তৈরি সম্পন্ন হয়েছে!', 'success');
        setShowModal(false);
        fetchExams();
      } else {
        const errData = await res.json().catch(() => ({}));
        showTopAlert('❌ ' + (errData.error || 'সংরক্ষণ ব্যর্থ হয়েছে।'), 'danger');
      }
    } catch (err) {
      showTopAlert('❌ ডাটাবেজ সংযোগে ত্রুটি হয়েছে।', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই মডেল টেস্টটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(getLiveExamApiUrl(`/api/live-exam/exams?id=${id}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        showTopAlert('✅ মডেল টেস্ট ডাটাবেজ থেকে মুছে ফেলা হয়েছে।', 'success');
        fetchExams();
      } else {
        showTopAlert('❌ মুছে ফেলা সম্ভব হয়নি।', 'danger');
      }
    } catch (err) {
      showTopAlert('❌ ডাটাবেজ সংযোগ ত্রুটি।', 'danger');
    }
  };

  // Add question to current exam form
  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      showTopAlert('প্রশ্নের বিবরণ লিখুন।', 'warning');
      return;
    }
    const qObj = {
      id: examForm.questions.length + 1,
      question: newQuestion.question,
      subject: newQuestion.subject || examForm.categoryName || 'সাধারণ বিষয়',
      options: [...newQuestion.options],
      ans: Number(newQuestion.ans),
      explanation: newQuestion.explanation
    };

    setExamForm(prev => ({
      ...prev,
      questions: [...prev.questions, qObj]
    }));

    setNewQuestion({
      id: examForm.questions.length + 2,
      question: '',
      subject: examForm.categoryName || 'সাধারণ বিষয়',
      options: ['', '', '', ''],
      ans: 0,
      explanation: ''
    });

    showTopAlert('✓ প্রশ্নটি তালিকায় যুক্ত হয়েছে! সংরক্ষণ করতে "সব পরিবর্তন সংরক্ষণ করুন" বাটনে চাপ দিন।', 'success');
  };

  const handleRemoveQuestion = (index) => {
    setExamForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index)
    }));
    showTopAlert('প্রশ্নটি তালিকা থেকে সরানো হয়েছে।', 'info');
  };

  // Robust CSV line parser
  const parseCSVLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"' || c === "'") {
        inQuotes = !inQuotes;
      } else if ((c === ',' || c === '\t' || c === ';') && !inQuotes) {
        result.push(cur.trim().replace(/^["']|["']$/g, ''));
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  // CSV file parse
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const rawLines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (rawLines.length === 0) {
          showTopAlert('CSV ফাইলটি খালি!', 'warning');
          return;
        }

        const parsedQuestions = [];
        const startIndex = rawLines[0].toLowerCase().includes('question') || rawLines[0].toLowerCase().includes('option') || rawLines[0].includes('প্রশ্ন') ? 1 : 0;

        for (let idx = startIndex; idx < rawLines.length; idx++) {
          const parts = parseCSVLine(rawLines[idx]);
          if (parts.length >= 5) {
            const questionText = parts[0];
            const opt1 = parts[1] || '';
            const opt2 = parts[2] || '';
            const opt3 = parts[3] || '';
            const opt4 = parts[4] || '';
            
            let ansIndex = 0;
            const rawAns = (parts[5] || '0').trim().toLowerCase();
            if (rawAns === '1' || rawAns === 'b' || rawAns === 'খ') ansIndex = 1;
            else if (rawAns === '2' || rawAns === 'c' || rawAns === 'গ') ansIndex = 2;
            else if (rawAns === '3' || rawAns === 'd' || rawAns === 'ঘ') ansIndex = 3;
            else if (rawAns === '0' || rawAns === 'a' || rawAns === 'ক') ansIndex = 0;
            else if (Number(rawAns) >= 0 && Number(rawAns) <= 3) ansIndex = Number(rawAns);
            else if (Number(rawAns) >= 1 && Number(rawAns) <= 4) ansIndex = Number(rawAns) - 1;

            const explanation = parts[6] || '';

            if (questionText.trim()) {
              parsedQuestions.push({
                id: examForm.questions.length + parsedQuestions.length + 1,
                question: questionText,
                subject: examForm.categoryName || 'সাধারণ',
                options: [opt1, opt2, opt3, opt4],
                ans: ansIndex,
                explanation: explanation
              });
            }
          }
        }

        if (parsedQuestions.length > 0) {
          setExamForm(prev => ({
            ...prev,
            questions: [...prev.questions, ...parsedQuestions]
          }));
          showTopAlert(`✅ CSV থেকে ${parsedQuestions.length}টি প্রশ্ন সফলভাবে লোড হয়েছে! এখন "সব প্রশ্ন সংরক্ষণ করুন" বাটনে চাপ দিন।`, 'success');
        } else {
          showTopAlert('CSV ফরম্যাট মেলেনি! ফরম্যাট: Question, OptionA, OptionB, OptionC, OptionD, CorrectIndex(0-3), Explanation', 'danger');
        }
      } catch (parseErr) {
        showTopAlert('CSV প্রসেসিং ত্রুটি: ' + parseErr.message, 'danger');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const filteredExams = exams.filter(e => 
    !searchQuery || 
    (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (e.categoryName && e.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main style={{ padding: '30px 20px', backgroundColor: '#f8fafc', minHeight: '90vh' }}>
      <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
        
        {/* Top Header & Breadcrumb */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '25px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.85rem', color: '#64748b' }}>
              <Link href="/admin/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>অ্যাডমিন ড্যাশবোর্ড</Link>
              <span>/</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>শিডিউলড লাইভ মডেল টেস্ট ম্যানেজার</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
              🔴 Scheduled Live Exam Model Tests Control Suite
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link 
              href="/admin/merit-position-dashboard"
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              🏆 জাতীয় মেরিট ড্যাশবোর্ড
            </Link>
            <button
              onClick={openCreateModal}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2,132,199,0.25)'
              }}
            >
              ➕ নতুন লাইভ মডেল টেস্ট যোগ করুন
            </button>
          </div>
        </div>



        {/* Search & Overview Stats */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
            <input 
              type="text" 
              placeholder="মডেল টেস্ট খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: '#64748b' }}>
            <span>মোট টেস্ট: <strong style={{ color: '#0f172a' }}>{exams.length}</strong></span>
            <span>ডাটাবেজ: <strong style={{ color: '#0284c7' }}>TopMCQBD_DB_Live_Exam</strong></span>
          </div>
        </div>

        {/* Exams Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              লোড হচ্ছে...
            </div>
          ) : filteredExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              কোনো লাইভ মডেল টেস্ট পাওয়া যায়নি।
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 14px' }}>টেস্টের নাম</th>
                    <th style={{ padding: '12px 14px' }}>ক্যাটাগরি</th>
                    <th style={{ padding: '12px 14px' }}>সময় / নম্বর</th>
                    <th style={{ padding: '12px 14px' }}>নেগেটিভ</th>
                    <th style={{ padding: '12px 14px' }}>প্রশ্ন সংখ্যা</th>
                    <th style={{ padding: '12px 14px' }}>পরীক্ষার্থী</th>
                    <th style={{ padding: '12px 14px' }}>স্ট্যাটাস</th>
                    <th style={{ padding: '12px 14px' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map((exam, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a', maxWidth: '300px' }}>
                        <div>{exam.title}</div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {exam.id}</span>
                      </td>
                      <td style={{ padding: '14px', color: '#475569' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '0.8rem', fontWeight: 600 }}>
                          {exam.categoryName || exam.category}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: '#0f172a' }}>
                        {exam.durationMinutes} মি. / {exam.totalMarks} মার্ক
                      </td>
                      <td style={{ padding: '14px', color: '#e11d48', fontWeight: 600 }}>
                        -{exam.negativeMarking}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#0284c7' }}>
                        {exam.questions ? exam.questions.length : (exam.questionsCount || 0)} টি
                      </td>
                      <td style={{ padding: '14px', color: '#64748b' }}>
                        👥 {exam.participants || 0}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '50px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: exam.status === 'live' ? '#d1fae5' : '#fef3c7',
                          color: exam.status === 'live' ? '#059669' : '#d97706'
                        }}>
                          {exam.status === 'live' ? '🔴 Live' : '⏳ Upcoming'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(exam)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            এডিট
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            ডিলিট
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* EXAM CREATE / EDIT MODAL */}
      {/* ========================================================= */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '850px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                {isEditing ? 'মডেল টেস্ট সম্পাদনা করুন' : 'নতুন শিডিউলড মডেল টেস্ট তৈরি'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <button
                onClick={() => setActiveTab('info')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'info' ? '#0284c7' : '#f1f5f9',
                  color: activeTab === 'info' ? '#ffffff' : '#475569'
                }}
              >
                ⚙️ সাধারণ তথ্য ও শিডিউল
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'questions' ? '#0284c7' : '#f1f5f9',
                  color: activeTab === 'questions' ? '#ffffff' : '#475569'
                }}
              >
                📝 প্রশ্নাবলি ({examForm.questions.length})
              </button>
              <button
                onClick={() => setActiveTab('csv')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === 'csv' ? '#0284c7' : '#f1f5f9',
                  color: activeTab === 'csv' ? '#ffffff' : '#475569'
                }}
              >
                📂 CSV বাল্ক আপলোড
              </button>
            </div>

            {/* Tab 1: General Info */}
            {activeTab === 'info' && (
              <form onSubmit={handleSaveExam} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    মডেল টেস্টের শিরোনাম *
                  </label>
                  <input 
                    type="text" 
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    placeholder="যেমন: ৪৬তম বিসিএস প্রিলিমিনারি লাইভ গ্র্যান্ড মডেল টেস্ট - ০১"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      ক্যাটাগরি
                    </label>
                    <select
                      value={examForm.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const catMap = { bcs: 'বিসিএস', bank: 'ব্যাংক জব', primary: 'প্রাথমিক শিক্ষক', subject: 'বিষয়ভিত্তিক' };
                        setExamForm({ ...examForm, category: val, categoryName: catMap[val] || 'বিসিএস' });
                      }}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="bcs">বিসিএস</option>
                      <option value="bank">ব্যাংক জব</option>
                      <option value="primary">প্রাথমিক শিক্ষক</option>
                      <option value="subject">বিষয়ভিত্তিক</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      স্ট্যাটাস
                    </label>
                    <select
                      value={examForm.status}
                      onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="live">🔴 লাইভ (Live Running)</option>
                      <option value="upcoming">⏳ শীঘ্রই আসছে (Upcoming)</option>
                      <option value="ended">সাপ্তাহিক আর্কাইভ (Ended)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      সময়সীমা (মিনিট) <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>(১০০ প্রশ্নে ৬০ মি.)</span>
                    </label>
                    <input 
                      type="number" 
                      value={examForm.durationMinutes}
                      onChange={(e) => setExamForm({ ...examForm, durationMinutes: Number(e.target.value) })}
                      placeholder="যেমন: ১০ প্রশ্নে ৬, ১০০ প্রশ্নে ৬০"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      মোট মার্কস
                    </label>
                    <input 
                      type="number" 
                      value={examForm.totalMarks}
                      onChange={(e) => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      নেগেটিভ মার্কিং
                    </label>
                    <input 
                      type="number" 
                      step="0.05"
                      value={examForm.negativeMarking}
                      onChange={(e) => setExamForm({ ...examForm, negativeMarking: Number(e.target.value) })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    সংক্ষিপ্ত বিবরণ
                  </label>
                  <textarea 
                    value={examForm.description}
                    onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                    rows={3}
                    placeholder="মডেল টেস্টের বর্ণনা লিখুন..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #0f1629', backgroundColor: '#0f1629', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Question Builder */}
            {activeTab === 'questions' && (
              <div>
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                    ➕ নতুন প্রশ্ন যুক্ত করুন
                  </h4>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>প্রশ্নের বিষয় ও টেক্সট</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                    {newQuestion.options.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="radio" 
                          name="correctAns" 
                          checked={newQuestion.ans === idx}
                          onChange={() => setNewQuestion({ ...newQuestion, ans: idx })}
                        />
                        <input 
                          type="text" 
                          placeholder={`অপশন ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...newQuestion.options];
                            copy[idx] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: copy });
                          }}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>ব্যাখ্যা (ঐচ্ছিক)</label>
                    <input 
                      type="text" 
                      placeholder="প্রশ্নের বিস্তারিত ব্যাখ্যা..."
                      value={newQuestion.explanation}
                      onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '6px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✓ এই প্রশ্নটি যুক্ত করুন
                  </button>
                </div>

                {/* Questions List */}
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
                  বর্তমান প্রশ্ন তালিকা ({examForm.questions.length} টি)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {examForm.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong>{qIdx + 1}. {q.question}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                          সঠিক উত্তর: <strong>{q.options[q.ans] || 'অপশন ১'}</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveQuestion(qIdx)}
                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                      >
                        মুছুন
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    onClick={handleSaveExam}
                    disabled={isSaving}
                    style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সব পরিবর্তন সংরক্ষণ করুন'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: CSV Upload */}
            {activeTab === 'csv' && (
              <div>
                <div style={{ textAlign: 'center', padding: '30px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', marginBottom: '20px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>CSV ফাইল আপলোড করুন</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                    কলাম বিন্যাস: Question, OptionA, OptionB, OptionC, OptionD, CorrectIndex(0-3), Explanation
                  </p>

                  <input 
                    type="file" 
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleCsvUpload}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📁 CSV ফাইল নির্বাচন করুন
                  </button>
                </div>

                {examForm.questions.length > 0 && (
                  <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#065f46', fontWeight: 600 }}>
                      ✓ মোট প্রস্তুতকৃত প্রশ্ন: {examForm.questions.length} টি
                    </div>
                    <button
                      onClick={handleSaveExam}
                      disabled={isSaving}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isSaving ? 'সংরক্ষণ হচ্ছে...' : '💾 সব প্রশ্ন সংরক্ষণ করুন'}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}
