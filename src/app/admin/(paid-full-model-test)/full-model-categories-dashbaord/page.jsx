'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';

// Fallback initial data
const DEFAULT_EXAMS = [
  {
    id: "bcs-46-grand-01",
    title: "৪৬তম বিসিএস প্রিলিমিনারি লাইভ পূর্ণাঙ্গ গ্র্যান্ড মডেল টেস্ট - ০১",
    category: "bcs",
    categoryName: "বিসিএস পূর্ণাঙ্গ",
    tags: ["Live Grand Test", "200 Marks", "BCS Full"],
    badgeColor: "rose",
    onlineUsers: 54,
    borderColor: "#0284c7",
    description: "৪৬তম বিসিএস প্রিলিমিনারি পরীক্ষার সর্বশেষ ২০০ নম্বরের সিলেবাস অনুসারে প্রণীত সম্পূর্ণ মডেল টেস্ট। ব্যাখ্যামূলক সমাধান ও তাৎক্ষণিক মেরিট পজিশন।",
    subjectsText: "বাংলা (৩৫), English (৩৫), গণিত ও মানসিক দক্ষতা (৩০), সাধারণ জ্ঞান (৫০), বিজ্ঞান ও আইসিটি (৩০), ভূগোল ও সুশাসন (২০)",
    totalQuestions: 200,
    totalMarks: 200,
    durationMinutes: 120,
    negativeMarks: "০.৫০",
    status: "active"
  },
  {
    id: "bcs-46-grand-02",
    title: "৪৬তম বিসিএস প্রিলিমিনারি পূর্ণাঙ্গ প্রস্তুতি স্পেশাল টেস্ট - ০২",
    category: "bcs",
    categoryName: "বিসিএস পূর্ণাঙ্গ",
    tags: ["Grand Test", "200 Marks", "Top Rated"],
    badgeColor: "amber",
    onlineUsers: 48,
    borderColor: "#0284c7",
    description: "২০০টি প্রশ্নের স্ট্যান্ডার্ড বিসিএস স্ট্যান্ডার্ড সেট। প্রতিটি প্রশ্নের রেফারেন্স ও ব্যাখ্যামূলক বিশ্লেষণ।",
    subjectsText: "বাংলা সাহিত্য ও ব্যাকরণ, English Language & Literature, সাধারণ গণিত, বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি",
    totalQuestions: 200,
    totalMarks: 200,
    durationMinutes: 120,
    negativeMarks: "০.৫০",
    status: "active"
  },
  {
    id: "bank-officer-full-01",
    title: "কম্বাইন্ড ৮ ব্যাংক অফিসার ১০০ নম্বরের পূর্ণাঙ্গ মডেল টেস্ট - ০১",
    category: "bank",
    categoryName: "ব্যাংক জব পূর্ণাঙ্গ",
    tags: ["Popular", "100 Marks", "Bank Full"],
    badgeColor: "emerald",
    onlineUsers: 39,
    borderColor: "#10b981",
    description: "বাংলাদেশ ব্যাংক ও ৮টি সমন্বিত সরকারি ব্যাংকের অফিসার পদের জন্য নির্ধারিত স্ট্যান্ডার্ড ১০০ নম্বরের প্রশ্ন সেট।",
    subjectsText: "English (30), Mathematics (30), General Knowledge & Banking (20), Bangla (10), ICT (10)",
    totalQuestions: 100,
    totalMarks: 100,
    durationMinutes: 60,
    negativeMarks: "০.২৫",
    status: "active"
  },
  {
    id: "primary-teacher-full-01",
    title: "প্রাথমিক সহকারী শিক্ষক নিয়োগ ৮০ নম্বরের পূর্ণাঙ্গ মডেল টেস্ট - ০১",
    category: "primary",
    categoryName: "প্রাইমারি পূর্ণাঙ্গ",
    tags: ["New", "80 Marks", "Primary Full"],
    badgeColor: "violet",
    onlineUsers: 62,
    borderColor: "#8b5cf6",
    description: "প্রাইমারি সহকারী শিক্ষক নিয়োগ পরীক্ষার সর্বশেষ প্যাটার্ন অনুযায়ী ৮০টি গুরুত্বপূর্ণ এমসিকিউ প্রশ্ন সংবলিত পূর্ণাঙ্গ সেট।",
    subjectsText: "বাংলা (২০), ইংরেজি (২০), গণিত (২০), সাধারণ জ্ঞান (২০)",
    totalQuestions: 80,
    totalMarks: 80,
    durationMinutes: 60,
    negativeMarks: "০.২৫",
    status: "active"
  },
  {
    id: "primary-teacher-full-02",
    title: "প্রাথমিক শিক্ষক নিয়োগ চূড়ান্ত প্রস্তুতি স্পেশাল মডেল টেস্ট - ০২",
    category: "primary",
    categoryName: "প্রাইমারি পূর্ণাঙ্গ",
    tags: ["80 Marks", "Top Selection"],
    badgeColor: "violet",
    onlineUsers: 41,
    borderColor: "#8b5cf6",
    description: "প্রাইমারি নিয়োগ পরীক্ষার অনুরূপ ৮০ নম্বরের প্রস্তুতিমূলক প্রশ্ন থেকে বাছাইকৃত শতভাগ কমন উপযোগী সেট।",
    subjectsText: "বাংলা সাহিত্য ও ব্যাকরণ, ইংরেজি গ্রামার, পাটিগণিত ও জ্যামিতি, সাম্প্রতিক তথ্য",
    totalQuestions: 80,
    totalMarks: 80,
    durationMinutes: 60,
    negativeMarks: "০.২৫",
    status: "active"
  },
  {
    id: "ntrca-18th-full",
    title: "১৮তম শিক্ষক নিবন্ধন (NTRCA) ১০০ নম্বরের পূর্ণাঙ্গ গ্র্যান্ড টেস্ট",
    category: "primary",
    categoryName: "শিক্ষক নিবন্ধন পূর্ণাঙ্গ",
    tags: ["Popular", "100 Marks", "NTRCA Full"],
    badgeColor: "amber",
    onlineUsers: 45,
    borderColor: "#f59e0b",
    description: "স্কুল ও কলেজ উভয় পর্যায়ের শিক্ষক নিবন্ধন পরীক্ষার ১০০ নম্বরের পূর্ণাঙ্গ প্রিলিমিনারি মডেল টেস্ট।",
    subjectsText: "বাংলা (২৫), ইংরেজি (২৫), সাধারণ গণিত (২৫), সাধারণ জ্ঞান (২৫)",
    totalQuestions: 100,
    totalMarks: 100,
    durationMinutes: 60,
    negativeMarks: "০.২৫",
    status: "active"
  }
];

const DEFAULT_SUBJECTS = [
  {
    id: "bangla",
    code: "BANGLA",
    name: "বাংলা",
    desc: "ব্যাকরণ, সাহিত্য ও শুদ্ধ প্রয়োগ",
    modelTestsCount: 20,
    theme: {
      color: "#006a4e",
      gradient: "linear-gradient(135deg, #006a4e 0%, #059669 100%)",
      lightBg: "#f0fdf4",
      borderColor: "#bbf7d0",
      glowColor: "rgba(0, 106, 78, 0.12)"
    }
  },
  {
    id: "english",
    code: "ENGLISH",
    name: "English",
    desc: "Grammar, Vocabulary & Composition",
    modelTestsCount: 20,
    theme: {
      color: "#0284c7",
      gradient: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
      lightBg: "#f0f9ff",
      borderColor: "#bae6fd",
      glowColor: "rgba(2, 132, 199, 0.12)"
    }
  },
  {
    id: "math",
    code: "MATHEMATICS",
    name: "গণিত",
    desc: "পাটিগণিত, বীজগণিত, জ্যামিতি ও পরিমিতি",
    modelTestsCount: 20,
    theme: {
      color: "#d97706",
      gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      lightBg: "#fffbeb",
      borderColor: "#fde68a",
      glowColor: "rgba(217, 119, 6, 0.12)"
    }
  },
  {
    id: "gk",
    code: "GENERAL KNOWLEDGE",
    name: "সাধারণ জ্ঞান",
    desc: "বাংলাদেশ, আন্তর্জাতিক ও সাম্প্রতিক বিষয়াবলি",
    modelTestsCount: 20,
    theme: {
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
      lightBg: "#faf5ff",
      borderColor: "#ddd6fe",
      glowColor: "rgba(124, 58, 237, 0.12)"
    }
  }
];

const toBanglaNumber = (num) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => banglaDigits[d] !== undefined ? banglaDigits[d] : d).join('');
};

function FullModelCategoriesDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const examId = searchParams.get('examId');
  const subjectId = searchParams.get('subject');

  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Exam Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    id: '',
    title: '',
    category: 'bcs',
    categoryName: 'বিসিএস পূর্ণাঙ্গ',
    tags: 'Live Grand Test, 200 Marks, BCS Full',
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

  // Subject Modal State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    code: '',
    name: '',
    desc: '',
    modelTestsCount: 20,
    color: '#006a4e',
    gradient: 'linear-gradient(135deg, #006a4e 0%, #059669 100%)',
    lightBg: '#f0fdf4',
    borderColor: '#bbf7d0'
  });

  // Fetch initial configuration
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/full-model-test/config', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.exams) && data.exams.length > 0) setExams(data.exams);
        if (Array.isArray(data.subjects) && data.subjects.length > 0) setSubjects(data.subjects);
      }
    } catch (err) {
      console.error('Failed to load full model test config:', err);
      showTopAlert('কনফিগারেশন লোড করা সম্ভব হয়নি!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save Config to Server
  const saveConfig = async (newExams = exams, newSubjects = subjects) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch('/api/full-model-test/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          exams: newExams,
          subjects: newSubjects
        })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('কনফিগারেশন সফলভাবে সেভ করা হয়েছে!', 'success');
        setExams(newExams);
        setSubjects(newSubjects);
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

  // Exam Handlers
  const handleOpenAddExam = () => {
    setIsEditingExam(false);
    setExamForm({
      id: `full-exam-${Date.now().toString().slice(-4)}`,
      title: '',
      category: 'bcs',
      categoryName: 'বিসিএস পূর্ণাঙ্গ',
      tags: 'Full Test, 200 Marks',
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
    setShowExamModal(true);
  };

  const handleOpenEditExam = (eItem) => {
    setIsEditingExam(true);
    setExamForm({
      id: eItem.id,
      title: eItem.title || '',
      category: eItem.category || 'bcs',
      categoryName: eItem.categoryName || 'বিসিএস পূর্ণাঙ্গ',
      tags: Array.isArray(eItem.tags) ? eItem.tags.join(', ') : (eItem.tags || ''),
      badgeColor: eItem.badgeColor || 'rose',
      onlineUsers: eItem.onlineUsers || 40,
      borderColor: eItem.borderColor || '#0284c7',
      description: eItem.description || '',
      subjectsText: eItem.subjectsText || '',
      totalQuestions: eItem.totalQuestions || 200,
      totalMarks: eItem.totalMarks || 200,
      durationMinutes: eItem.durationMinutes || 120,
      negativeMarks: eItem.negativeMarks || '০.৫০',
      status: eItem.status || 'active'
    });
    setShowExamModal(true);
  };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!examForm.title.trim()) {
      showTopAlert('পরীক্ষার শিরোনাম আবশ্যক!', 'warning');
      return;
    }

    const tagsArr = examForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const updatedExamObj = {
      ...examForm,
      tags: tagsArr,
      onlineUsers: Number(examForm.onlineUsers) || 30,
      totalQuestions: Number(examForm.totalQuestions) || 100,
      totalMarks: Number(examForm.totalMarks) || 100,
      durationMinutes: Number(examForm.durationMinutes) || 60
    };

    let updatedList;
    if (isEditingExam) {
      updatedList = exams.map(x => x.id === examForm.id ? updatedExamObj : x);
    } else {
      updatedList = [updatedExamObj, ...exams];
    }

    setShowExamModal(false);
    await saveConfig(updatedList, subjects);
  };

  const handleDeleteExam = async (idToDelete) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই মডেল টেস্টটি মুছে ফেলতে চান?')) return;
    const updated = exams.filter(x => x.id !== idToDelete);
    await saveConfig(updated, subjects);
    if (examId === idToDelete) {
      router.push('/admin/full-model-categories-dashbaord');
    }
  };

  // Subject Handlers
  const handleOpenAddSubject = () => {
    setIsEditingSubject(false);
    setSubjectForm({
      id: `subj-${Date.now().toString().slice(-4)}`,
      code: 'SUBJECT',
      name: '',
      desc: '',
      modelTestsCount: 20,
      color: '#006a4e',
      gradient: 'linear-gradient(135deg, #006a4e 0%, #059669 100%)',
      lightBg: '#f0fdf4',
      borderColor: '#bbf7d0'
    });
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (sItem) => {
    setIsEditingSubject(true);
    setSubjectForm({
      id: sItem.id,
      code: sItem.code || '',
      name: sItem.name || '',
      desc: sItem.desc || '',
      modelTestsCount: sItem.modelTestsCount || 20,
      color: sItem.theme?.color || '#006a4e',
      gradient: sItem.theme?.gradient || 'linear-gradient(135deg, #006a4e 0%, #059669 100%)',
      lightBg: sItem.theme?.lightBg || '#f0fdf4',
      borderColor: sItem.theme?.borderColor || '#bbf7d0'
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      showTopAlert('বিষয়ের নাম আবশ্যক!', 'warning');
      return;
    }

    const updatedSubjObj = {
      id: subjectForm.id,
      code: subjectForm.code.toUpperCase().trim() || 'SUBJECT',
      name: subjectForm.name.trim(),
      desc: subjectForm.desc.trim(),
      modelTestsCount: Number(subjectForm.modelTestsCount) || 20,
      theme: {
        color: subjectForm.color,
        gradient: subjectForm.gradient,
        lightBg: subjectForm.lightBg,
        borderColor: subjectForm.borderColor,
        glowColor: `${subjectForm.color}22`
      }
    };

    let updatedList;
    if (isEditingSubject) {
      updatedList = subjects.map(s => s.id === subjectForm.id ? updatedSubjObj : s);
    } else {
      updatedList = [...subjects, updatedSubjObj];
    }

    setShowSubjectModal(false);
    await saveConfig(exams, updatedList);
  };

  const handleDeleteSubject = async (idToDelete) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই বিষয়টি মুছে ফেলতে চান?')) return;
    const updated = subjects.filter(s => s.id !== idToDelete);
    await saveConfig(exams, updated);
    if (subjectId === idToDelete) {
      router.push(`/admin/full-model-categories-dashbaord?examId=${examId}`);
    }
  };

  // Filter Categories
  const categories = [
    { id: 'all', label: 'সকল', count: exams.length },
    { id: 'bcs', label: 'বিসিএস', count: exams.filter(e => e.category === 'bcs').length },
    { id: 'bank', label: 'ব্যাংক জব', count: exams.filter(e => e.category === 'bank').length },
    { id: 'primary', label: 'প্রাইমারি শিক্ষক', count: exams.filter(e => e.category === 'primary').length },
    { id: 'subject', label: 'বিষয়ভিত্তিক', count: exams.filter(e => e.category === 'subject').length }
  ];

  const filteredExams = exams.filter(exam => {
    const matchCat = currentCat === 'all' || exam.category === currentCat;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchCat;
    return matchCat && (
      (exam.title || '').toLowerCase().includes(q) ||
      (exam.categoryName || '').toLowerCase().includes(q) ||
      (exam.description || '').toLowerCase().includes(q) ||
      (exam.subjectsText || '').toLowerCase().includes(q)
    );
  });

  const selectedExam = exams.find(e => e.id === examId) || exams[0];
  const selectedSubject = subjects.find(s => s.id === subjectId);

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
                ADMIN CONTROL
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                পূর্ণাঙ্গ মডেল টেস্ট ক্যাটাগরি ড্যাশবোর্ড
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              এখানে সংরক্ষিত পরিবর্তনসমূহ সরাসরি <span style={{ color: '#0284c7', fontWeight: 600 }}>/full-model-test</span> পেজে দৃশ্যমান হবে।
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/full-model-test"
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

            <Link
              href="/admin/full-model-questions-dashabord"
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
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
              <i className="fa-solid fa-list-check"></i>
              <span>প্রশ্ন ড্যাশবোর্ড</span>
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

      {/* Breadcrumb Navigation */}
      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 24px' }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '0.88rem', color: '#64748b' }}>
            <Link href="/admin/full-model-categories-dashbaord" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
              মডেল টেস্ট তালিকা
            </Link>
            {examId && selectedExam && (
              <>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>/</span>
                <Link href={`/admin/full-model-categories-dashbaord?examId=${selectedExam.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                  {selectedExam.title}
                </Link>
              </>
            )}
            {examId && subjectId && selectedSubject && (
              <>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>/</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedSubject.name}</span>
              </>
            )}
          </div>

          {examId && (
            <button
              onClick={() => router.push(subjectId ? `/admin/full-model-categories-dashbaord?examId=${examId}` : '/admin/full-model-categories-dashbaord')}
              style={{
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>{subjectId ? 'বিষয় তালিকায় ফিরে যান' : 'পরীক্ষা তালিকায় ফিরে যান'}</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1350px', margin: '24px auto 0', padding: '0 20px' }}>

        {/* ------------------------------------------------------------- */}
        {/* LEVEL 3: MODEL TESTS UNDER A SELECTED SUBJECT */}
        {/* ------------------------------------------------------------- */}
        {examId && subjectId && selectedSubject ? (
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: selectedSubject.theme?.color || '#006a4e',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: '20px',
                  marginBottom: '8px'
                }}>
                  {selectedSubject.code}
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {selectedSubject.name} — মডেল টেস্টসমূহ
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.92rem' }}>
                  {selectedExam.title} • মোট মডেল টেস্ট: {toBanglaNumber(selectedSubject.modelTestsCount || 20)} টি
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => handleOpenEditSubject(selectedSubject)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }}></i>
                  বিষয়টি এডিট করুন
                </button>
              </div>
            </div>

            {/* Model Tests Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
              {Array.from({ length: selectedSubject.modelTestsCount || 20 }, (_, idx) => {
                const num = idx + 1;
                const formattedNum = String(num).padStart(2, '0');
                const bnNum = toBanglaNumber(formattedNum);
                const title = selectedSubject.id === 'english' ? `Model Test - ${formattedNum}` : `মডেল টেস্ট - ${bnNum}`;
                const catSlug = `${selectedExam.categoryName} > ${selectedExam.title} > ${selectedSubject.name} > ${title}`.trim().replace(/\s+/g, '-');

                return (
                  <div
                    key={num}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        {title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        প্রশ্ন: {toBanglaNumber(selectedExam.totalQuestions || 100)} টি • সময়: {toBanglaNumber(selectedExam.durationMinutes || 60)} মিনিট
                      </div>
                    </div>

                    <Link
                      href={`/admin/full-model-questions-dashabord?category=${encodeURIComponent(catSlug)}`}
                      style={{
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>প্রশ্ন পরিচালনা</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ) : examId && selectedExam ? (

          /* ------------------------------------------------------------- */
          /* LEVEL 2: SUBJECTS LIST UNDER SELECTED EXAM */
          /* ------------------------------------------------------------- */
          <div>
            {/* Selected Exam Overview Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${selectedExam.borderColor || '#e2e8f0'}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {selectedExam.categoryName}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                      <i className="fa-solid fa-circle" style={{ fontSize: '0.55rem', marginRight: '4px' }}></i>
                      {toBanglaNumber(selectedExam.onlineUsers || 40)} জন লাইভ পরীক্ষার্থী
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                    {selectedExam.title}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                    {selectedExam.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: '#334155' }}>
                    <span><strong>মোট প্রশ্ন:</strong> {toBanglaNumber(selectedExam.totalQuestions || 200)} টি</span>
                    <span><strong>পূর্ণমান:</strong> {toBanglaNumber(selectedExam.totalMarks || 200)}</span>
                    <span><strong>সময়:</strong> {toBanglaNumber(selectedExam.durationMinutes || 120)} মিনিট</span>
                    <span><strong>নেগেটিভ মার্কিং:</strong> {selectedExam.negativeMarks || '০.৫০'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleOpenEditExam(selectedExam)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }}></i>
                    এডিট
                  </button>

                  <button
                    onClick={handleOpenAddSubject}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>
                    নতুন বিষয় যোগ করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Subjects Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                বিষয়সমূহ ({toBanglaNumber(subjects.length)})
              </h3>
            </div>

            {/* Subjects Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {subjects.map(subj => {
                const themeColor = subj.theme?.color || '#006a4e';
                return (
                  <div
                    key={subj.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: `1px solid ${subj.theme?.borderColor || '#e2e8f0'}`,
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f1f5f9',
                      background: subj.theme?.lightBg || '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        backgroundColor: themeColor,
                        padding: '3px 10px',
                        borderRadius: '20px'
                      }}>
                        {subj.code}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditSubject(subj)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="এডিট"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subj.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="ডিলিট"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                        {subj.name}
                      </h4>
                      <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                        {subj.desc || 'পূর্ণাঙ্গ প্রস্তুতি ও মডেল টেস্ট সেট।'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                          মডেল টেস্ট: {toBanglaNumber(subj.modelTestsCount || 20)} টি
                        </span>

                        <button
                          onClick={() => router.push(`/admin/full-model-categories-dashbaord?examId=${selectedExam.id}&subject=${subj.id}`)}
                          style={{
                            backgroundColor: themeColor,
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>মডেল টেস্টসমূহ</span>
                          <i className="fa-solid fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (

          /* ------------------------------------------------------------- */
          /* LEVEL 1: ALL EXAMS LIST & FILTER */
          /* ------------------------------------------------------------- */
          <div>
            {/* Filter & Action Card */}
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
              {/* Category Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(cat => {
                  const isActive = currentCat === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCat(cat.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
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
                      <span>{cat.label}</span>
                      <span style={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#64748b',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '0.74rem'
                      }}>
                        {toBanglaNumber(cat.count)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box & Add Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px', justifyContent: 'flex-end' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="মডেল টেস্ট খুঁজুন..."
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
                  onClick={handleOpenAddExam}
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
                  <span>নতুন মডেল টেস্ট যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* Exams Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(390px, 1fr))', gap: '20px' }}>
              {filteredExams.map(exam => {
                return (
                  <div
                    key={exam.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: `1px solid ${exam.borderColor || '#e2e8f0'}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Badge & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '6px'
                        }}>
                          {exam.categoryName}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                            <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '3px' }}></i>
                            {toBanglaNumber(exam.onlineUsers || 35)}
                          </span>
                          <button
                            onClick={() => handleOpenEditExam(exam)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '2px 4px'
                            }}
                            title="এডিট"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '2px 4px'
                            }}
                            title="মুছে ফেলুন"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {exam.title}
                      </h3>

                      {/* Description */}
                      <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                        {exam.description}
                      </p>

                      {/* Subjects Text */}
                      {exam.subjectsText && (
                        <div style={{
                          backgroundColor: '#f8fafc',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#475569',
                          marginBottom: '14px',
                          border: '1px solid #f1f5f9'
                        }}>
                          <strong>সিলেবাস:</strong> {exam.subjectsText}
                        </div>
                      )}

                      {/* Stats */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: '#475569', marginBottom: '16px' }}>
                        <span><strong>প্রশ্ন:</strong> {toBanglaNumber(exam.totalQuestions || 100)} টি</span>
                        <span><strong>সময়:</strong> {toBanglaNumber(exam.durationMinutes || 60)} মিনিট</span>
                        <span><strong>মার্কস:</strong> {toBanglaNumber(exam.totalMarks || 100)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button
                        onClick={() => router.push(`/admin/full-model-categories-dashbaord?examId=${exam.id}`)}
                        style={{
                          flex: 1,
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>বিষয়সমূহ পরিচালনা</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EXAM MODAL (CREATE / EDIT) */}
      {/* ------------------------------------------------------------- */}
      {showExamModal && (
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
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditingExam ? 'মডেল টেস্ট এডিট করুন' : 'নতুন মডেল টেস্ট যোগ করুন'}
              </h3>
              <button
                onClick={() => setShowExamModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  আইডি (Unique ID)
                </label>
                <input
                  type="text"
                  value={examForm.id}
                  disabled={isEditingExam}
                  onChange={(e) => setExamForm({ ...examForm, id: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  পরীক্ষার শিরোনাম (Title)
                </label>
                <input
                  type="text"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="যেমন: ৪৭তম বিসিএস প্রিলিমিনারি পূর্ণাঙ্গ টেস্ট - ০১"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    ক্যাটাগরি কি (Key)
                  </label>
                  <select
                    value={examForm.category}
                    onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="bcs">bcs (বিসিএস)</option>
                    <option value="bank">bank (ব্যাংক)</option>
                    <option value="primary">primary (প্রাইমারি)</option>
                    <option value="subject">subject (বিষয়ভিত্তিক)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    ক্যাটাগরি প্রদর্শন নাম
                  </label>
                  <input
                    type="text"
                    value={examForm.categoryName}
                    onChange={(e) => setExamForm({ ...examForm, categoryName: e.target.value })}
                    placeholder="যেমন: বিসিএস পূর্ণাঙ্গ"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  বিবরণ (Description)
                </label>
                <textarea
                  rows={3}
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  সিলেবাস / বিষয় সংক্ষেপ
                </label>
                <input
                  type="text"
                  value={examForm.subjectsText}
                  onChange={(e) => setExamForm({ ...examForm, subjectsText: e.target.value })}
                  placeholder="বাংলা (৩৫), English (৩৫), গণিত (৩০)..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    মোট প্রশ্ন
                  </label>
                  <input
                    type="number"
                    value={examForm.totalQuestions}
                    onChange={(e) => setExamForm({ ...examForm, totalQuestions: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    মোট মার্কস
                  </label>
                  <input
                    type="number"
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    সময় (মিনিট)
                  </label>
                  <input
                    type="number"
                    value={examForm.durationMinutes}
                    onChange={(e) => setExamForm({ ...examForm, durationMinutes: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    অনলাইন ইউজার
                  </label>
                  <input
                    type="number"
                    value={examForm.onlineUsers}
                    onChange={(e) => setExamForm({ ...examForm, onlineUsers: e.target.value })}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
                  </label>
                  <input
                    type="text"
                    value={examForm.tags}
                    onChange={(e) => setExamForm({ ...examForm, tags: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    নেগেটিভ মার্কিং
                  </label>
                  <input
                    type="text"
                    value={examForm.negativeMarks}
                    onChange={(e) => setExamForm({ ...examForm, negativeMarks: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBJECT MODAL (CREATE / EDIT) */}
      {/* ------------------------------------------------------------- */}
      {showSubjectModal && (
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
            maxWidth: '560px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditingSubject ? 'বিষয় এডিট করুন' : 'নতুন বিষয় যোগ করুন'}
              </h3>
              <button
                onClick={() => setShowSubjectModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSubject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    আইডি (যেমন: bangla, math)
                  </label>
                  <input
                    type="text"
                    value={subjectForm.id}
                    disabled={isEditingSubject}
                    onChange={(e) => setSubjectForm({ ...subjectForm, id: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    কোড নেম (যেমন: BANGLA)
                  </label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  বিষয়ের নাম (বাংলায়)
                </label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="যেমন: বাংলা"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  value={subjectForm.desc}
                  onChange={(e) => setSubjectForm({ ...subjectForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    মডেল টেস্টের সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={subjectForm.modelTestsCount}
                    onChange={(e) => setSubjectForm({ ...subjectForm, modelTestsCount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    থিম কালার
                  </label>
                  <input
                    type="color"
                    value={subjectForm.color}
                    onChange={(e) => setSubjectForm({
                      ...subjectForm,
                      color: e.target.value,
                      gradient: `linear-gradient(135deg, ${e.target.value} 0%, ${e.target.value}dd 100%)`
                    })}
                    style={{ width: '100%', height: '38px', padding: '2px 4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FullModelCategoriesDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>লোড হচ্ছে...</div>}>
      <FullModelCategoriesDashboardContent />
    </Suspense>
  );
}
