'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Bengali number converter helper
const toBanglaNumber = (num) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => banglaDigits[d] !== undefined ? banglaDigits[d] : d).join('');
};

// Free Model Tests Data
const INITIAL_EXAMS = [
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
    negativeMarks: "০.৫০"
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
    negativeMarks: "০.৫০"
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
    negativeMarks: "০.২৫"
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
    negativeMarks: "০.২৫"
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
    negativeMarks: "০.২৫"
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
    negativeMarks: "০.২৫"
  }
];

// Master Subjects Data per Exam
const ALL_SUBJECTS_DATA = [
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

// Displayed Subjects (3 items)
const SUBJECTS_DATA = ALL_SUBJECTS_DATA.slice(0, 3);

function FreeModelTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const examId = searchParams.get('examId');
  const subjectId = searchParams.get('subject');

  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelTestSearch, setModelTestSearch] = useState('');

  // Live dynamic Online User counts
  const getWeightedOnlineCount = (current) => {
    if (current && Math.random() < 0.85) {
      const delta = Math.floor(Math.random() * 5) - 2;
      let val = current + delta;
      if (val >= 12 && val <= 65) return val;
    }
    const rand = Math.random();
    if (rand < 0.70) {
      return Math.floor(Math.random() * 25) + 20;
    } else if (rand < 0.90) {
      return Math.floor(Math.random() * 20) + 45;
    } else {
      return Math.floor(Math.random() * 8) + 12;
    }
  };

  const [onlineCounts, setOnlineCounts] = useState(() => {
    const initial = {};
    INITIAL_EXAMS.forEach(e => {
      initial[e.id] = e.onlineUsers || 35;
    });
    return initial;
  });

  useEffect(() => {
    setOnlineCounts(prev => {
      const next = { ...prev };
      INITIAL_EXAMS.forEach(e => {
        next[e.id] = getWeightedOnlineCount(prev[e.id]);
      });
      return next;
    });

    const interval = setInterval(() => {
      setOnlineCounts(prev => {
        const next = { ...prev };
        INITIAL_EXAMS.forEach(e => {
          next[e.id] = getWeightedOnlineCount(prev[e.id]);
        });
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Selected Exam & Selected Subject
  const selectedExam = INITIAL_EXAMS.find(e => e.id === examId) || INITIAL_EXAMS[0];
  const selectedSubject = ALL_SUBJECTS_DATA.find(s => s.id === subjectId);

  const categories = [
    { id: 'all', label: 'সকল ফ্রি টেস্ট' },
    { id: 'bcs', label: 'বিসিএস' },
    { id: 'bank', label: 'ব্যাংক জব' },
    { id: 'primary', label: 'প্রাইমারি শিক্ষক' },
    { id: 'subject', label: 'বিষয়ভিত্তিক' }
  ];

  const filteredExams = INITIAL_EXAMS.filter(exam => {
    const matchCat = currentCat === 'all' || exam.category === currentCat;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchCat;

    const matchTitle = exam.title.toLowerCase().includes(q);
    const matchDesc = exam.description.toLowerCase().includes(q);
    const matchCatName = exam.categoryName.toLowerCase().includes(q);
    const matchSubjects = (exam.subjectsText || '').toLowerCase().includes(q);
    const matchTags = (exam.tags || [exam.badge]).some(tag => tag.toLowerCase().includes(q));

    return matchCat && (matchTitle || matchDesc || matchCatName || matchSubjects || matchTags);
  });

  // -------------------------------------------------------------
  // VIEW 3: MODEL TESTS 1 - 20 UNDER SELECTED SUBJECT
  // (When examId and subjectId are both present)
  // Cards styled matching /live-exam-model-test page with:
  // - সময়সীমা (durationMin মিনিট)
  // - প্রশ্ন সংখ্যা (qCount টি)
  // - নেগেটিভ মার্ক (-negativeMarking)
  // -------------------------------------------------------------
  if (examId && subjectId && selectedSubject) {
    const totalQuestions = selectedSubject.questionsCount || 20;
    const durationMinutes = selectedSubject.duration || 20;
    const rawNegative = selectedExam.negativeMarks || "০.৫০";
    // Convert to standard decimal string like 0.5 or 0.25
    const negativeMarking = rawNegative.includes('২৫') ? '0.25' : '0.5';

    const BADGE_THEMES = [
      { bg: '#ffe4e6', color: '#e11d48', border: '#fecdd3', label: 'লাইভ এক্সাম', icon: '🔴' },
      { bg: '#fef3c7', color: '#d97706', border: '#fde68a', label: 'টপ রেটেড', icon: '⭐' },
      { bg: '#d1fae5', color: '#059669', border: '#a7f3d0', label: 'স্পেশাল টেস্ট', icon: '⚡' },
      { bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe', label: 'পূর্ণাঙ্গ প্র্যাকটিস', icon: '🎯' }
    ];

    // Generate 20 Model Tests for this subject
    const MODEL_TESTS_COUNT = 20;
    const allModelTests = Array.from({ length: MODEL_TESTS_COUNT }, (_, idx) => {
      const testNo = idx + 1;
      const formattedNum = String(testNo).padStart(2, '0');
      const bnNum = toBanglaNumber(formattedNum);
      const badgeTheme = BADGE_THEMES[idx % BADGE_THEMES.length];

      let testType = "লাইভ গ্র্যান্ড";
      if (testNo % 4 === 2) testType = "মূল প্রশ্ন ও স্পেশাল";
      else if (testNo % 4 === 3) testType = "ডেইলি প্র্যাকটিস";
      else if (testNo % 4 === 0) testType = "চূড়ান্ত প্রস্তুতি";

      const examPrefix = selectedExam.title.split(' ')[0] || "বিসিএস";

      return {
        id: `${selectedSubject.id}-model-test-${testNo}`,
        testNo,
        formattedNum,
        bnNum,
        title: `${examPrefix} প্রিলিমিনারি ${selectedSubject.name} ${testType} মডেল টেস্ট - ${bnNum}`,
        description: `${examPrefix} প্রিলিমিনারি পরীক্ষার্থীদের জন্য ${selectedSubject.name} বিষয়ের জাতীয় পর্যায়ের মেধা যাচাই মডেল টেস্ট।`,
        duration: durationMinutes,
        questionsCount: totalQuestions,
        negativeMarking: negativeMarking,
        badgeTheme: badgeTheme,
        participantsCount: 85 + (testNo * 19),
        onlineCount: onlineCounts[`${selectedSubject.id}-${testNo}`] || (16 + ((testNo * 7) % 28))
      };
    });

    const filteredModelTests = allModelTests.filter(test => {
      const q = modelTestSearch.trim().toLowerCase();
      if (!q) return true;
      const matchNum = String(test.testNo).includes(q) || test.bnNum.includes(q) || test.formattedNum.includes(q);
      const matchTitle = test.title.toLowerCase().includes(q);
      const matchDesc = test.description.toLowerCase().includes(q);
      const matchTag = test.badgeTheme.label.toLowerCase().includes(q);
      return matchNum || matchTitle || matchDesc || matchTag;
    });

    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)', paddingBottom: '80px', paddingTop: '30px' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/free-model-test-demo" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>ফ্রি মডেল টেস্ট</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/free-model-test-demo?examId=${selectedExam.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                {selectedExam.title.length > 30 ? selectedExam.title.substring(0, 30) + '...' : selectedExam.title}
              </Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedSubject.name}</span>
            </div>

            <button
              onClick={() => router.push(`/free-model-test-demo?examId=${selectedExam.id}`)}
              style={{
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>বিষয় তালিকায় ফিরে যান</span>
            </button>
          </div>

          {/* Heading & Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, margin: '0 0 6px 0' }}>
                {selectedSubject.name} — মডেল টেস্টসমূহ ({allModelTests.length})
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                {selectedExam.title} • নির্ধারিত সময়ে পরীক্ষা দিয়ে রিয়েল-টাইম মেধা যাচাই ও ফলাফল দেখুন
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <input
                type="text"
                value={modelTestSearch}
                onChange={(e) => setModelTestSearch(e.target.value)}
                placeholder="মডেল টেস্ট খুঁজুন (যেমন: ০১, টেস্ট)..."
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 36px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Cards Grid matching /live-exam-model-test */}
          {filteredModelTests.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px dashed #cbd5e1'
              }}
            >
              <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
                কোনো মডেল টেস্ট পাওয়া যায়নি।
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '24px'
              }}
            >
              {filteredModelTests.map(test => {
                const questionsCategoryParam = `${selectedExam.categoryName} > ${selectedExam.title} > ${selectedSubject.name} > ${test.title}`;

                return (
                  <div
                    key={test.testNo}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div>
                      {/* Top Meta */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '50px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: test.badgeTheme.bg,
                            color: test.badgeTheme.color,
                            border: `1px solid ${test.badgeTheme.border}`
                          }}
                        >
                          {test.badgeTheme.icon} {test.badgeTheme.label}
                        </span>

                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.78rem',
                            fontWeight: 600
                          }}
                        >
                          {selectedExam.categoryName} • {selectedSubject.name}
                        </span>
                      </div>

                      {/* Title (Clickable) */}
                      <h3
                        onClick={() => router.push(`/questions?category=${encodeURIComponent(questionsCategoryParam)}`)}
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          lineHeight: 1.5,
                          marginBottom: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <Link
                          href={`/questions?category=${encodeURIComponent(questionsCategoryParam)}`}
                          style={{
                            color: '#0f172a',
                            textDecoration: 'none',
                            transition: 'color 0.2s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                        >
                          {test.title}
                        </Link>
                      </h3>

                      {/* Description - matching attached reference image text */}
                      <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                        {test.description}
                      </p>

                      {/* Meta Specs Grid - Exactly matching attached screenshot from /live-exam-model-test */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          backgroundColor: '#f8fafc',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid #f1f5f9',
                          marginBottom: '20px',
                          textAlign: 'center'
                        }}
                      >
                        <div>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>সময়সীমা</span>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{test.duration} মিনিট</strong>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>প্রশ্ন সংখ্যা</span>
                          <strong style={{ fontSize: '0.95rem', color: '#0284c7' }}>{test.questionsCount} টি</strong>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>নেগেটিভ মার্ক</span>
                          <strong style={{ fontSize: '0.95rem', color: '#e11d48' }}>-{test.negativeMarking}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>

                      <button
                        onClick={() => router.push(`/questions?category=${encodeURIComponent(questionsCategoryParam)}`)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'center',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s, transform 0.15s',
                          boxShadow: '0 4px 12px rgba(2,132,199,0.25)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#0369a1';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0284c7';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        🔥 পরীক্ষায় অংশ নিন ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: SUBJECTS SELECTION VIEW (When examId is present)
  // Shows Subject Cards with "২০ টি মডেল টেস্ট ➔" (Chapter removed!)
  // -------------------------------------------------------------
  if (examId) {
    return (
      <main style={{ padding: '36px 0 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
              <Link 
                href="/free-model-test-demo" 
                style={{ 
                  color: '#0284c7', 
                  textDecoration: 'none', 
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-house" style={{ fontSize: '0.82rem' }}></i>
                <span>ফ্রি মডেল টেস্ট</span>
              </Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.72rem', color: '#94a3b8' }}></i>
              <span style={{ color: '#0f172a', fontWeight: 700, maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedExam.title}
              </span>
            </div>

            <button
              onClick={() => router.push('/free-model-test-demo')}
              style={{
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#94a3b8';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>সকল মডেল টেস্টে ফিরে যান</span>
            </button>
          </div>

          {/* Exam Info Header (Comfortable spacing & typography) */}
          <div style={{ marginBottom: '32px' }}>
            {/* Tags row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <span
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-award"></i>
                {selectedExam.categoryName}
              </span>

              <span
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                ১০০% ফ্রি এক্সেস
              </span>
            </div>

            {/* Title & Description with spacious line height and margin */}
            <h1 style={{ fontSize: '2.1rem', color: '#0f172a', fontWeight: 800, marginBottom: '16px', lineHeight: 1.45, letterSpacing: '-0.01em' }}>
              {selectedExam.title}
            </h1>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.8', margin: 0, maxWidth: '960px' }}>
              {selectedExam.description}
            </p>

            {/* Subject count indicator (Moved below description) */}
            <div style={{ marginTop: '18px' }}>
              <span
                style={{
                  fontSize: '0.92rem',
                  color: '#475569',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px'
                }}
              >
                <i className="fa-solid fa-layer-group" style={{ color: '#0284c7', fontSize: '0.95rem' }} />
                <span>{toBanglaNumber(SUBJECTS_DATA.length)} টি বিষয় অন্তর্ভুক্ত</span>
              </span>
            </div>
          </div>

          {/* Subjects Grid - 3 Boxes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px' }}>
            {SUBJECTS_DATA.map(sub => {
              const theme = sub.theme || {
                color: '#006a4e',
                gradient: 'linear-gradient(135deg, #006a4e 0%, #059669 100%)',
                lightBg: '#f0fdf4',
                borderColor: '#bbf7d0',
                badgeBg: '#dcfce7',
                badgeText: '#15803d',
                icon: 'fa-solid fa-book-open-reader',
                glowColor: 'rgba(0, 106, 78, 0.12)'
              };

              return (
                <div
                  key={sub.id}
                  onClick={() => router.push(`/free-model-test-demo?examId=${selectedExam.id}&subject=${sub.id}`)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '24px 22px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = `0 18px 30px -6px ${theme.glowColor}, 0 8px 16px rgba(0,0,0,0.04)`;
                    e.currentTarget.style.borderColor = theme.color;
                    const cta = e.currentTarget.querySelector('.subject-cta-btn');
                    if (cta) {
                      cta.style.filter = 'brightness(0.92)';
                      const arrow = cta.querySelector('.subject-cta-arrow');
                      if (arrow) arrow.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    const cta = e.currentTarget.querySelector('.subject-cta-btn');
                    if (cta) {
                      cta.style.filter = 'none';
                      const arrow = cta.querySelector('.subject-cta-arrow');
                      if (arrow) arrow.style.transform = 'none';
                    }
                  }}
                >
                  {/* Decorative left accent line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: '5px',
                      background: theme.gradient
                    }}
                  />

                  <div>
                    {/* Subject Code & Name */}
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: theme.color,
                        fontWeight: 800,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginTop: '2px',
                        marginBottom: '4px'
                      }}
                    >
                      {sub.code}
                    </span>
                    <h3 style={{ fontSize: '1.45rem', color: '#0f172a', fontWeight: 800, marginBottom: '6px', lineHeight: 1.25 }}>
                      {sub.name}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                      {sub.desc}
                    </p>

                    {/* Meta Specs Box inside Card (২০ টি মডেল টেস্ট - একলাইনে) */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        marginBottom: '14px',
                        textAlign: 'center',
                        fontSize: '0.98rem',
                        color: '#334155',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <strong style={{ color: theme.color, fontWeight: 800, fontSize: '1.05rem' }}>
                        {toBanglaNumber(sub.modelTestsCount || 20)} টি
                      </strong>
                      <span>মডেল টেস্ট</span>
                    </div>
                  </div>

                  {/* Call to Action Button (Normally active with subtle hover effect) */}
                  <div
                    className="subject-cta-btn"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: theme.gradient,
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.25s ease, filter 0.2s ease',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      e.currentTarget.style.filter = 'brightness(0.88)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.14)';
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      e.currentTarget.style.filter = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <span>মডেল টেস্টসমূহ দেখুন</span>
                    <i className="fa-solid fa-arrow-right subject-cta-arrow" style={{ fontSize: '0.85rem', transition: 'transform 0.2s ease' }}></i>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: ALL FREE MODEL TESTS LIST (Default / Home of free-model-test-demo)
  // -------------------------------------------------------------
  return (
    <main style={{ padding: '40px 0 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '12px'
            }}
          >
            <i className="fa-solid fa-graduation-cap"></i>
            <span>ফ্রি মডেল টেস্ট সম্ভার</span>
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            ফ্রি অনলাইন মডেল টেস্ট
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            আপনার পছন্দের ক্যাটাগরি বাছাই করুন এবং নির্ধারিত পরীক্ষার বিষয়ভিত্তিক মডেল টেস্টে অংশ নিন সম্পূর্ণ ফ্রিতে।
          </p>
        </div>

        {/* Filters & Search Box */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '18px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            marginBottom: '35px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const isActive = currentCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCat(cat.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: isActive ? '#0284c7' : '#ffffff',
                    color: isActive ? '#ffffff' : '#334155',
                    boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '0 1 300px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ফ্রি টেস্ট খুঁজুন..."
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1'
            }}
          >
            <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
              কোনো ফ্রি মডেল টেস্ট পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
              gap: '24px'
            }}
          >
            {filteredExams.map(exam => {
              let badgeBg = '#e0f2fe';
              let badgeColor = '#0284c7';
              if (exam.badgeColor === 'rose') {
                badgeBg = '#ffe4e6';
                badgeColor = '#e11d48';
              } else if (exam.badgeColor === 'emerald') {
                badgeBg = '#d1fae5';
                badgeColor = '#059669';
              } else if (exam.badgeColor === 'amber') {
                badgeBg = '#fef3c7';
                badgeColor = '#d97706';
              } else if (exam.badgeColor === 'violet') {
                badgeBg = '#ede9fe';
                badgeColor = '#7c3aed';
              } else if (exam.badgeColor === 'cyan' || exam.badgeColor === 'primary') {
                badgeBg = '#e0f2fe';
                badgeColor = '#0284c7';
              }

              return (
                <div
                  key={exam.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${exam.borderColor || '#0284c7'}`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.07)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                  }}
                >
                  <div>
                    {/* Top Row: Tags & Category */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {(exam.tags || []).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchQuery(tag);
                            }}
                            style={{
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              padding: '5px 12px 4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1.2',
                              transform: 'translateY(1px)',
                              transition: 'transform 0.15s ease'
                            }}
                            title={`Tag: ${tag} (Click to search)`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                        {exam.categoryName}
                      </span>
                    </div>

                    {/* Title (Clickable) */}
                    <h2
                      onClick={() => router.push(`/free-model-test-demo?examId=${exam.id}`)}
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '10px',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}
                    >
                      <Link
                        href={`/free-model-test-demo?examId=${exam.id}`}
                        style={{
                          color: '#0f172a',
                          textDecoration: 'none',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                      >
                        {exam.title}
                      </Link>
                    </h2>

                    {/* Description */}
                    <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '20px' }}>
                      {exam.description}
                    </p>

                    {/* Subjects & Topics Summary Box */}
                    <div
                      style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                        সিলেবাস ও বিষয়ভিত্তিক নম্বর বণ্টন:
                      </span>
                      <strong style={{ color: '#0f172a', fontSize: '0.92rem', fontWeight: 700, lineHeight: '1.5' }}>
                        {exam.subjectsText}
                      </strong>
                    </div>
                  </div>

                  {/* Bottom Footer Action */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    {/* Live Online User Badge */}
                    <div
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <span
                        style={{
                          position: 'relative',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '8px',
                          height: '8px',
                          flexShrink: 0,
                          top: '-1px'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            animation: 'onlinePulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                            opacity: 0.75
                          }}
                        />
                        <span
                          style={{
                            position: 'relative',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981'
                          }}
                        />
                      </span>
                      <span
                        style={{
                          display: 'inline-block',
                          lineHeight: '1',
                          position: 'relative',
                          top: '2px'
                        }}
                      >
                        {onlineCounts[exam.id] || 35} Online
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/free-model-test-demo?examId=${exam.id}`)}
                      style={{
                        backgroundColor: '#006a4e',
                        color: '#ffffff',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s ease',
                        boxShadow: '0 2px 6px rgba(0, 106, 78, 0.3)'
                      }}
                    >
                      <span>বিষয় ও টপিক দেখুন</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes onlinePulse {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        @media (max-width: 640px) {
          .container {
            padding: 0 14px !important;
          }
          div[style*="gridTemplateColumns: repeat(auto-fill, minmax(500px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function FreeModelTestDemoPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
        ফ্রি মডেল টেস্ট পেজ লোড হচ্ছে...
      </div>
    }>
      <FreeModelTestContent />
    </Suspense>
  );
}
