'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';

// Default Fallback Data for Free Model Tests
const DEFAULT_EXAMS = [
  {
    id: "bcs-46-live",
    title: "৪৬তম বিসিএস প্রিলিমিনারি লাইভ গ্র্যান্ড মডেল টেস্ট - ০১",
    category: "bcs",
    categoryName: "বিসিএস",
    tags: ["Live Exam", "BCS", "Grand Test"],
    badgeColor: "rose",
    onlineUsers: 42,
    borderColor: "#0284c7",
    description: "৪৬তম বিসিএস প্রিলিমিনারি পরীক্ষার সর্বশেষ সিলেবাস অনুসারে প্রণীত সম্পূর্ণ মডেল টেস্ট। ব্যাখ্যামূলক সমাধান ও তাৎক্ষণিক মেরিট পজিশন।",
    subjectsText: "বাংলা (৩৫), English (৩৫), গণিত ও মানসিক দক্ষতা (৩০), সাধারণ জ্ঞান (৫০), বিজ্ঞান ও আইসিটি (৩০), ভূগোল ও সুশাসন (২০)",
    totalQuestions: 200,
    totalMarks: 200,
    durationMinutes: 120,
    negativeMarks: "০.৫০",
    status: "active"
  },
  {
    id: "bcs-45-past",
    title: "৪৫তম বিসিএস প্রিলিমিনারি মূল প্রশ্ন সমাধান ও পরীক্ষা",
    category: "bcs",
    categoryName: "বিসিএস প্রশ্নব্যাংক",
    tags: ["Previous Year", "BCS", "Question Bank"],
    badgeColor: "amber",
    onlineUsers: 38,
    borderColor: "#0284c7",
    description: "৪৫তম বিসিএস পরীক্ষার ২০০টি প্রশ্নের নির্ভুল সমাধান ও ব্যাখ্যা।",
    subjectsText: "বাংলা ভাষা ও ব্যাকরণ, বাংলা সাহিত্যের ইতিহাস, গল্প, নাটক, প্রবন্ধ, গুরুত্বপূর্ণ তথ্য",
    totalQuestions: 200,
    totalMarks: 200,
    durationMinutes: 120,
    negativeMarks: "০.৫০",
    status: "active"
  },
  {
    id: "bank-officer-daily",
    title: "কম্বাইন্ড ৮ ব্যাংক অফিসার ডেইলি প্র্যাকটিস টেস্ট",
    category: "bank",
    categoryName: "ব্যাংক জব",
    tags: ["Popular", "Bank Job", "Daily Test"],
    badgeColor: "emerald",
    onlineUsers: 29,
    borderColor: "#10b981",
    description: "বাংলাদেশ ব্যাংক এবং সমন্বিত ব্যাংক অফিসার পদের জন্য বিশেষ ইংরেজি, গণিত ও জেনারেল নলেজ প্রশ্ন সেট।",
    subjectsText: "English (30), Mathematics (30), General Knowledge & Banking (20), Bangla (10), ICT (10)",
    totalQuestions: 100,
    totalMarks: 100,
    durationMinutes: 60,
    negativeMarks: "০.২৫",
    status: "active"
  },
  {
    id: "primary-teacher-2026",
    title: "প্রাথমিক সহকারী শিক্ষক নিয়োগ স্পেশাল মডেল টেস্ট - ০৩",
    category: "primary",
    categoryName: "প্রাইমারি",
    tags: ["New", "Primary", "Teacher Exam"],
    badgeColor: "violet",
    onlineUsers: 45,
    borderColor: "#8b5cf6",
    description: "প্রাইমারি নিয়োগ পরীক্ষার অনুরূপ ৮০ নম্বরের প্রস্তুতিমূলক প্রশ্ন থেকে বাছাইকৃত গুরুত্বপূর্ণ সেট।",
    subjectsText: "বাংলা (২০), ইংরেজি (২০), গণিত (২০), সাধারণ জ্ঞান (২০)",
    totalQuestions: 80,
    totalMarks: 80,
    durationMinutes: 60,
    negativeMarks: "০.২৫",
    status: "active"
  },
  {
    id: "math-shortcut-mastery",
    title: "বিসিএস ও ব্যাংক ম্যাথ শর্টকাট স্পেশাল টেস্ট",
    category: "subject",
    categoryName: "গণিত ও আইসিটি",
    tags: ["Top Rated", "Math", "Shortcut"],
    badgeColor: "cyan",
    onlineUsers: 19,
    borderColor: "#06b6d4",
    description: "ঐকিক নিয়ম, শতকরা, লাভ-ক্ষতি, ধারা ও বীজগণিতের গুরুত্বপূর্ণ বাছাই করা প্রশ্ন।",
    subjectsText: "ঐকিক নিয়ম, শতকরা, লাভ-ক্ষতি, মান নির্ণয়, সূচক ও লগারিদম, জ্যামিতি",
    totalQuestions: 50,
    totalMarks: 50,
    durationMinutes: 45,
    negativeMarks: "০.২৫",
    status: "active"
  },
  {
    id: "ntrca-18th-college",
    title: "১৮তম শিক্ষক নিবন্ধন (NTRCA) স্পেশাল গ্র্যান্ড টেস্ট",
    category: "primary",
    categoryName: "শিক্ষক নিবন্ধন",
    tags: ["Popular", "NTRCA", "Teacher Registration"],
    badgeColor: "amber",
    onlineUsers: 33,
    borderColor: "#f59e0b",
    description: "স্কুল ও কলেজ পর্যায়ের শিক্ষক নিবন্ধন পরীক্ষার শতভাগ কমন উপযোগী মডেল টেস্ট।",
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
    desc: "ব্যাকরণ, সাহিত্য, ভাষা রীতি ও শুদ্ধ প্রয়োগ",
    modelTestsCount: 20,
    questionsCount: 35,
    duration: 35,
    marks: 35,
    theme: {
      color: "#006a4e",
      gradient: "linear-gradient(135deg, #006a4e 0%, #059669 100%)",
      lightBg: "#f0fdf4",
      borderColor: "#bbf7d0",
      badgeBg: "#dcfce7",
      badgeText: "#15803d",
      icon: "fa-solid fa-book-open-reader",
      glowColor: "rgba(0, 106, 78, 0.12)"
    }
  },
  {
    id: "english",
    code: "ENGLISH",
    name: "English",
    desc: "Grammar, Vocabulary, Idioms & Comprehension",
    modelTestsCount: 20,
    questionsCount: 35,
    duration: 35,
    marks: 35,
    theme: {
      color: "#0284c7",
      gradient: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
      lightBg: "#f0f9ff",
      borderColor: "#bae6fd",
      badgeBg: "#e0f2fe",
      badgeText: "#0369a1",
      icon: "fa-solid fa-spell-check",
      glowColor: "rgba(2, 132, 199, 0.12)"
    }
  },
  {
    id: "math",
    code: "MATHEMATICS",
    name: "গণিত",
    desc: "পাটিগণিত, বীজগণিত, জ্যামিতি ও মানসিক দক্ষতা",
    modelTestsCount: 20,
    questionsCount: 30,
    duration: 35,
    marks: 30,
    theme: {
      color: "#d97706",
      gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      lightBg: "#fffbeb",
      borderColor: "#fde68a",
      badgeBg: "#fef3c7",
      badgeText: "#b45309",
      icon: "fa-solid fa-calculator",
      glowColor: "rgba(217, 119, 6, 0.12)"
    }
  },
  {
    id: "gk",
    code: "GENERAL KNOWLEDGE",
    name: "সাধারণ জ্ঞান",
    desc: "বাংলাদেশ, আন্তর্জাতিক, বিজ্ঞান ও সাম্প্রতিক বিষয়াবলি",
    modelTestsCount: 20,
    questionsCount: 50,
    duration: 45,
    marks: 50,
    theme: {
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
      lightBg: "#faf5ff",
      borderColor: "#ddd6fe",
      badgeBg: "#ede9fe",
      badgeText: "#6d28d9",
      icon: "fa-solid fa-earth-americas",
      glowColor: "rgba(124, 58, 237, 0.12)"
    }
  }
];

const toBanglaDigits = (num) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => bn[d] !== undefined ? bn[d] : d).join('');
};

function FreeModelCategoriesDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState('exams'); // 'exams' or 'subjects'
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Exam Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    id: '',
    title: '',
    category: 'bcs',
    categoryName: 'বিসিএস',
    tags: '',
    badgeColor: 'rose',
    onlineUsers: 40,
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
    questionsCount: 35,
    duration: 35,
    marks: 35,
    color: '#006a4e',
    lightBg: '#f0fdf4',
    borderColor: '#bbf7d0',
    badgeBg: '#dcfce7',
    badgeText: '#15803d',
    icon: 'fa-solid fa-book-open-reader'
  });

  // Fetch initial config from API
  useEffect(() => {
    fetch('/api/free-model-test/config', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (Array.isArray(data.exams) && data.exams.length > 0) {
            setExams(data.exams);
          }
          if (Array.isArray(data.subjects) && data.subjects.length > 0) {
            setSubjects(data.subjects);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching free model test config:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle Save All to API
  const handleSaveAll = async (newExams = exams, newSubjects = subjects) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/free-model-test/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exams: newExams,
          subjects: newSubjects
        })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('সকল পরিবর্তন সফলভাবে সংরক্ষিত ও লাইভ হয়েছে!', 'success');
      } else {
        showTopAlert(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে!', 'error');
      }
    } catch (err) {
      console.error('Save error:', err);
      showTopAlert('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Exam Form Actions
  const openAddExamModal = () => {
    setIsEditingExam(false);
    setExamForm({
      id: `free-exam-${Date.now().toString().slice(-4)}`,
      title: '',
      category: 'bcs',
      categoryName: 'বিসিএস',
      tags: 'Free Exam, Practice',
      badgeColor: 'rose',
      onlineUsers: 35,
      borderColor: '#0284c7',
      description: '',
      subjectsText: '',
      totalQuestions: 100,
      totalMarks: 100,
      durationMinutes: 60,
      negativeMarks: '০.৫০',
      status: 'active'
    });
    setShowExamModal(true);
  };

  const openEditExamModal = (exam) => {
    setIsEditingExam(true);
    setExamForm({
      id: exam.id,
      title: exam.title || '',
      category: exam.category || 'bcs',
      categoryName: exam.categoryName || 'বিসিএস',
      tags: Array.isArray(exam.tags) ? exam.tags.join(', ') : (exam.tags || ''),
      badgeColor: exam.badgeColor || 'rose',
      onlineUsers: exam.onlineUsers || 35,
      borderColor: exam.borderColor || '#0284c7',
      description: exam.description || '',
      subjectsText: exam.subjectsText || '',
      totalQuestions: exam.totalQuestions || 100,
      totalMarks: exam.totalMarks || 100,
      durationMinutes: exam.durationMinutes || 60,
      negativeMarks: exam.negativeMarks || '০.৫০',
      status: exam.status || 'active'
    });
    setShowExamModal(true);
  };

  const handleExamSubmit = (e) => {
    e.preventDefault();
    if (!examForm.title.trim() || !examForm.id.trim()) {
      showTopAlert('শিরোনাম ও আইডি পূরণ করুন!', 'warning');
      return;
    }

    const tagsArray = examForm.tags
      ? examForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const newExamObj = {
      id: examForm.id.trim(),
      title: examForm.title.trim(),
      category: examForm.category,
      categoryName: examForm.categoryName,
      tags: tagsArray,
      badgeColor: examForm.badgeColor,
      onlineUsers: Number(examForm.onlineUsers) || 30,
      borderColor: examForm.borderColor,
      description: examForm.description.trim(),
      subjectsText: examForm.subjectsText.trim(),
      totalQuestions: Number(examForm.totalQuestions) || 100,
      totalMarks: Number(examForm.totalMarks) || 100,
      durationMinutes: Number(examForm.durationMinutes) || 60,
      negativeMarks: examForm.negativeMarks,
      status: examForm.status
    };

    let updatedExams;
    if (isEditingExam) {
      updatedExams = exams.map(item => item.id === newExamObj.id ? newExamObj : item);
    } else {
      if (exams.some(item => item.id === newExamObj.id)) {
        showTopAlert('এই আইডি দিয়ে ইতোমধ্যে একটি টেস্ট বিদ্যমান!', 'error');
        return;
      }
      updatedExams = [newExamObj, ...exams];
    }

    setExams(updatedExams);
    setShowExamModal(false);
    handleSaveAll(updatedExams, subjects);
  };

  const handleDeleteExam = (id, title) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${title}" টেস্টটি মুছে ফেলতে চান?`)) {
      const updatedExams = exams.filter(e => e.id !== id);
      setExams(updatedExams);
      handleSaveAll(updatedExams, subjects);
    }
  };

  // Subject Form Actions
  const openAddSubjectModal = () => {
    setIsEditingSubject(false);
    setSubjectForm({
      id: `subj-${Date.now().toString().slice(-4)}`,
      code: 'SUBJECT',
      name: '',
      desc: '',
      modelTestsCount: 20,
      questionsCount: 30,
      duration: 30,
      marks: 30,
      color: '#0284c7',
      lightBg: '#f0f9ff',
      borderColor: '#bae6fd',
      badgeBg: '#e0f2fe',
      badgeText: '#0369a1',
      icon: 'fa-solid fa-graduation-cap'
    });
    setShowSubjectModal(true);
  };

  const openEditSubjectModal = (subj) => {
    setIsEditingSubject(true);
    setSubjectForm({
      id: subj.id,
      code: subj.code || '',
      name: subj.name || '',
      desc: subj.desc || '',
      modelTestsCount: subj.modelTestsCount || 20,
      questionsCount: subj.questionsCount || 30,
      duration: subj.duration || 30,
      marks: subj.marks || 30,
      color: subj.theme?.color || '#0284c7',
      lightBg: subj.theme?.lightBg || '#f0f9ff',
      borderColor: subj.theme?.borderColor || '#bae6fd',
      badgeBg: subj.theme?.badgeBg || '#e0f2fe',
      badgeText: subj.theme?.badgeText || '#0369a1',
      icon: subj.theme?.icon || 'fa-solid fa-graduation-cap'
    });
    setShowSubjectModal(true);
  };

  const handleSubjectSubmit = (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim() || !subjectForm.id.trim()) {
      showTopAlert('বিষয়ের নাম ও আইডি দিন!', 'warning');
      return;
    }

    const newSubjectObj = {
      id: subjectForm.id.trim(),
      code: subjectForm.code.trim().toUpperCase(),
      name: subjectForm.name.trim(),
      desc: subjectForm.desc.trim(),
      modelTestsCount: Number(subjectForm.modelTestsCount) || 20,
      questionsCount: Number(subjectForm.questionsCount) || 30,
      duration: Number(subjectForm.duration) || 30,
      marks: Number(subjectForm.marks) || 30,
      theme: {
        color: subjectForm.color,
        gradient: `linear-gradient(135deg, ${subjectForm.color} 0%, #1e293b 100%)`,
        lightBg: subjectForm.lightBg,
        borderColor: subjectForm.borderColor,
        badgeBg: subjectForm.badgeBg,
        badgeText: subjectForm.badgeText,
        icon: subjectForm.icon,
        glowColor: `${subjectForm.color}20`
      }
    };

    let updatedSubjects;
    if (isEditingSubject) {
      updatedSubjects = subjects.map(s => s.id === newSubjectObj.id ? newSubjectObj : s);
    } else {
      if (subjects.some(s => s.id === newSubjectObj.id)) {
        showTopAlert('এই আইডি দিয়ে ইতোমধ্যে একটি বিষয় আছে!', 'error');
        return;
      }
      updatedSubjects = [...subjects, newSubjectObj];
    }

    setSubjects(updatedSubjects);
    setShowSubjectModal(false);
    handleSaveAll(exams, updatedSubjects);
  };

  const handleDeleteSubject = (id, name) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${name}" বিষয়টি মুছে ফেলতে চান?`)) {
      const updatedSubjects = subjects.filter(s => s.id !== id);
      setSubjects(updatedSubjects);
      handleSaveAll(exams, updatedSubjects);
    }
  };

  // Filtered Exams
  const filteredExams = exams.filter(exam => {
    const matchCat = selectedCategory === 'all' || exam.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchCat;

    const matchTitle = (exam.title || '').toLowerCase().includes(q);
    const matchDesc = (exam.description || '').toLowerCase().includes(q);
    const matchCatName = (exam.categoryName || '').toLowerCase().includes(q);
    const matchTags = Array.isArray(exam.tags)
      ? exam.tags.some(t => t.toLowerCase().includes(q))
      : (exam.tags || '').toLowerCase().includes(q);

    return matchCat && (matchTitle || matchDesc || matchCatName || matchTags);
  });

  const categories = [
    { id: 'all', label: 'সকল ক্যাটাগরি' },
    { id: 'bcs', label: 'বিসিএস' },
    { id: 'bank', label: 'ব্যাংক জব' },
    { id: 'primary', label: 'প্রাইমারি শিক্ষক' },
    { id: 'subject', label: 'বিষয়ভিত্তিক' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur-md transition-all sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-emerald-600"
              title="অ্যাডমিন ড্যাশবোর্ড"
            >
              <i className="fa-solid fa-arrow-left text-sm" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                  ফ্রি মডেল টেস্ট কন্ট্রোল ড্যাশবোর্ড
                </h1>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Free Model Test
                </span>
              </div>
              <p className="text-xs text-slate-500">
                /free-model-test পেজের সকল মডেল টেস্ট, বিষয়সমূহ ও প্রশ্ন কনফিগারেশন পরিচালনা করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/free-model-test"
              target="_blank"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
            >
              <i className="fa-solid fa-eye text-emerald-600" />
              <span>মূল পেজ দেখুন</span>
            </Link>

            <Link
              href="/admin/questions-dashboard"
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/50 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
            >
              <i className="fa-solid fa-database text-blue-600" />
              <span>প্রশ্নব্যাংক ড্যাশবোর্ড</span>
            </Link>

            <button
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" />
                  <span>সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
        {/* Quick Stats Overview */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-4 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-medium">মোট মডেল টেস্ট</span>
              <i className="fa-solid fa-file-signature text-lg" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {toBanglaDigits(exams.length)} টি
            </div>
            <div className="mt-1 text-[11px] text-slate-500">ফ্রি সেটে লাইভ টেস্ট</div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-sm">
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-xs font-medium">সক্রিয় টেস্ট</span>
              <i className="fa-solid fa-circle-check text-lg" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {toBanglaDigits(exams.filter(e => e.status === 'active').length)} টি
            </div>
            <div className="mt-1 text-[11px] text-slate-500">বর্তমানে দৃশ্যমান</div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/40 p-4 shadow-sm">
            <div className="flex items-center justify-between text-violet-600">
              <span className="text-xs font-medium">মোট বিষয়সমূহ</span>
              <i className="fa-solid fa-book-bookmark text-lg" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {toBanglaDigits(subjects.length)} টি
            </div>
            <div className="mt-1 text-[11px] text-slate-500">বিষয়ভিত্তিক সাব-ক্যাটাগরি</div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/40 p-4 shadow-sm">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-medium">বিষয়ভিত্তিক মডেল টেস্ট</span>
              <i className="fa-solid fa-layer-group text-lg" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {toBanglaDigits(subjects.reduce((acc, s) => acc + (s.modelTestsCount || 20), 0))} টি
            </div>
            <div className="mt-1 text-[11px] text-slate-500">প্রতি বিষয়ে ২০টি টেস্ট</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'exams'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <i className="fa-solid fa-list-check" />
              <span>মডেল টেস্ট তালিকা ({toBanglaDigits(exams.length)})</span>
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'subjects'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <i className="fa-solid fa-shapes" />
              <span>বিষয়সমূহ ও থিম ({toBanglaDigits(subjects.length)})</span>
            </button>
          </div>

          {activeTab === 'exams' ? (
            <button
              onClick={openAddExamModal}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <i className="fa-solid fa-plus" />
              <span>নতুন মডেল টেস্ট যোগ করুন</span>
            </button>
          ) : (
            <button
              onClick={openAddSubjectModal}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700"
            >
              <i className="fa-solid fa-plus" />
              <span>নতুন বিষয় যোগ করুন</span>
            </button>
          )}
        </div>

        {/* TAB 1: EXAMS LIST */}
        {activeTab === 'exams' && (
          <div>
            {/* Filter & Search Toolbar */}
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="মডেল টেস্টের নাম, ট্যাগ বা বিবরণ দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exams Cards Grid */}
            {filteredExams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <i className="fa-regular fa-folder-open text-4xl text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">কোনো মডেল টেস্ট পাওয়া যায়নি!</p>
                <p className="mt-1 text-xs text-slate-400">নতুন মডেল টেস্ট যোগ করতে উপরের বাটনে ক্লিক করুন</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 hover:shadow-md"
                    style={{ borderTop: `4px solid ${exam.borderColor || '#0284c7'}` }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {exam.categoryName || exam.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              exam.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                exam.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {exam.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </span>
                        </div>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-slate-900 line-clamp-2">
                        {exam.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {exam.description || 'কোনো বিবরণ দেওয়া নেই'}
                      </p>

                      {exam.subjectsText && (
                        <div className="mt-3 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-700">সিলেবাস: </span>
                          <span className="line-clamp-2">{exam.subjectsText}</span>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs">
                        <div className="rounded-lg bg-slate-50 p-1.5">
                          <div className="text-[10px] text-slate-400">প্রশ্ন</div>
                          <div className="font-bold text-slate-700">{toBanglaDigits(exam.totalQuestions)}টি</div>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-1.5">
                          <div className="text-[10px] text-slate-400">সময়</div>
                          <div className="font-bold text-slate-700">{toBanglaDigits(exam.durationMinutes)} মি.</div>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-1.5">
                          <div className="text-[10px] text-slate-400">নেগেটিভ</div>
                          <div className="font-bold text-rose-600">-{exam.negativeMarks}</div>
                        </div>
                      </div>

                      {exam.tags && exam.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(Array.isArray(exam.tags) ? exam.tags : [exam.tags]).map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="font-mono text-[10px] text-slate-400">ID: {exam.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditExamModal(exam)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          title="সম্পাদনা করুন"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id, exam.title)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                          title="মুছে ফেলুন"
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBJECTS LIST */}
        {activeTab === 'subjects' && (
          <div>
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <i className="fa-solid fa-circle-info text-blue-500" />
                <span>
                  এখানে প্রতিটি বিষয়ের অধীনে ২০টি করে সাবজেক্টিভ মডেল টেস্ট স্বয়ংক্রিয়ভাবে তৈরি হবে। আপনি বিষয়ের নাম, প্রশ্ন সংখ্যা ও থিম পরিবর্তন করতে পারেন।
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {subjects.map((subj) => {
                const theme = subj.theme || {};
                return (
                  <div
                    key={subj.id}
                    className="relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md"
                    style={{
                      borderColor: theme.borderColor || '#e2e8f0',
                      backgroundColor: theme.lightBg || '#ffffff'
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-xs"
                          style={{
                            backgroundColor: theme.color || '#0284c7',
                            color: '#ffffff'
                          }}
                        >
                          <i className={`${theme.icon || 'fa-solid fa-book'} text-base`} />
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: theme.badgeBg || '#e0f2fe',
                            color: theme.badgeText || '#0369a1'
                          }}
                        >
                          {subj.code || 'CODE'}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-slate-900">{subj.name}</h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {subj.desc || 'কোনো বিবরণ দেওয়া নেই'}
                      </p>

                      <div className="mt-4 space-y-1.5 rounded-xl bg-white/80 p-3 text-xs border border-slate-100">
                        <div className="flex justify-between text-slate-600">
                          <span>মডেল টেস্ট সংখ্যা:</span>
                          <span className="font-bold text-slate-900">
                            {toBanglaDigits(subj.modelTestsCount || 20)} টি
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>প্রতি টেস্টে প্রশ্ন:</span>
                          <span className="font-bold text-slate-900">
                            {toBanglaDigits(subj.questionsCount || 30)} টি
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>সময়সীমা:</span>
                          <span className="font-bold text-slate-900">
                            {toBanglaDigits(subj.duration || 30)} মিনিট
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-200/60 pt-3">
                      <span className="font-mono text-[10px] text-slate-400">ID: {subj.id}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditSubjectModal(subj)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                          title="সম্পাদনা করুন"
                        >
                          <i className="fa-solid fa-pen-to-square text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subj.id, subj.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                          title="মুছে ফেলুন"
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* EXAM MODAL */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isEditingExam ? 'মডেল টেস্ট সম্পাদনা করুন' : 'নতুন মডেল টেস্ট যোগ করুন'}
              </h2>
              <button
                onClick={() => setShowExamModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <form onSubmit={handleExamSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">টেস্ট আইডি (ইউনিক ID)</label>
                  <input
                    type="text"
                    required
                    value={examForm.id}
                    onChange={(e) => setExamForm({ ...examForm, id: e.target.value })}
                    disabled={isEditingExam}
                    placeholder="যেমন: bcs-46-grand-01"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">ক্যাটাগরি কোড</label>
                  <select
                    value={examForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      let catName = 'বিসিএস';
                      if (val === 'bank') catName = 'ব্যাংক জব';
                      if (val === 'primary') catName = 'প্রাইমারি শিক্ষক';
                      if (val === 'subject') catName = 'বিষয়ভিত্তিক';
                      setExamForm({ ...examForm, category: val, categoryName: catName });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="bcs">বিসিএস (bcs)</option>
                    <option value="bank">ব্যাংক জব (bank)</option>
                    <option value="primary">প্রাইমারি শিক্ষক (primary)</option>
                    <option value="subject">বিষয়ভিত্তিক (subject)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">মডেল টেস্টের পূর্ণ নাম / শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="যেমন: ৪৬তম বিসিএস প্রিলিমিনারি লাইভ পূর্ণাঙ্গ টেস্ট"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">ক্যাটাগরি ডিসপ্লে নাম</label>
                  <input
                    type="text"
                    value={examForm.categoryName}
                    onChange={(e) => setExamForm({ ...examForm, categoryName: e.target.value })}
                    placeholder="যেমন: বিসিএস পূর্ণাঙ্গ"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)</label>
                  <input
                    type="text"
                    value={examForm.tags}
                    onChange={(e) => setExamForm({ ...examForm, tags: e.target.value })}
                    placeholder="Live Exam, 200 Marks, BCS"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows="2"
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  placeholder="পরীক্ষার প্রস্তুতি ও সিলেবাস সম্পর্কে সংক্ষিপ্ত বিবরণ..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">সিলেবাস / বিষয় সামারি</label>
                <input
                  type="text"
                  value={examForm.subjectsText}
                  onChange={(e) => setExamForm({ ...examForm, subjectsText: e.target.value })}
                  placeholder="যেমন: বাংলা (৩৫), English (৩৫), গণিত (৩০)..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700">মোট প্রশ্ন</label>
                  <input
                    type="number"
                    value={examForm.totalQuestions}
                    onChange={(e) => setExamForm({ ...examForm, totalQuestions: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700">মোট পূর্ণমান</label>
                  <input
                    type="number"
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700">সময়সীমা (মিনিট)</label>
                  <input
                    type="number"
                    value={examForm.durationMinutes}
                    onChange={(e) => setExamForm({ ...examForm, durationMinutes: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700">নেগেটিভ মার্ক</label>
                  <input
                    type="text"
                    value={examForm.negativeMarks}
                    onChange={(e) => setExamForm({ ...examForm, negativeMarks: e.target.value })}
                    placeholder="০.৫০"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">বর্ডার কালার</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={examForm.borderColor}
                      onChange={(e) => setExamForm({ ...examForm, borderColor: e.target.value })}
                      className="h-8 w-12 cursor-pointer rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={examForm.borderColor}
                      onChange={(e) => setExamForm({ ...examForm, borderColor: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">অনলাইন পরীক্ষার্থী সংখ্যা</label>
                  <input
                    type="number"
                    value={examForm.onlineUsers}
                    onChange={(e) => setExamForm({ ...examForm, onlineUsers: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">স্ট্যাটাস</label>
                  <select
                    value={examForm.status}
                    onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  {isEditingExam ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {isEditingSubject ? 'বিষয় সম্পাদনা করুন' : 'নতুন বিষয় যোগ করুন'}
              </h2>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">বিষয় আইডি (ইউনিক ID)</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.id}
                    onChange={(e) => setSubjectForm({ ...subjectForm, id: e.target.value })}
                    disabled={isEditingSubject}
                    placeholder="bangla, english, math"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono outline-none focus:border-violet-500 focus:bg-white disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">বিষয় কোড (বড়হাতের)</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    placeholder="BANGLA, MATH"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs uppercase outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">বিষয়ের নাম</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="যেমন: বাংলা, ইংরেজি, গণিত"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">সংক্ষিপ্ত বিবরণ</label>
                <input
                  type="text"
                  value={subjectForm.desc}
                  onChange={(e) => setSubjectForm({ ...subjectForm, desc: e.target.value })}
                  placeholder="যেমন: ব্যাকরণ, সাহিত্য ও শুদ্ধ প্রয়োগ"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">মডেল টেস্ট সংখ্যা</label>
                  <input
                    type="number"
                    value={subjectForm.modelTestsCount}
                    onChange={(e) => setSubjectForm({ ...subjectForm, modelTestsCount: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">প্রতি টেস্টে প্রশ্ন</label>
                  <input
                    type="number"
                    value={subjectForm.questionsCount}
                    onChange={(e) => setSubjectForm({ ...subjectForm, questionsCount: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">সময়সীমা (মিনিট)</label>
                  <input
                    type="number"
                    value={subjectForm.duration}
                    onChange={(e) => setSubjectForm({ ...subjectForm, duration: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">থিম কালার</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={subjectForm.color}
                      onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                      className="h-8 w-12 cursor-pointer rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={subjectForm.color}
                      onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Font Awesome আইকন ক্লাস</label>
                  <input
                    type="text"
                    value={subjectForm.icon}
                    onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })}
                    placeholder="fa-solid fa-book-open"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
                >
                  {isEditingSubject ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FreeModelCategoriesDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500">লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <FreeModelCategoriesDashboardContent />
    </Suspense>
  );
}
