'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Bengali number converter helper
const toBanglaNumber = (num) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => banglaDigits[d] !== undefined ? banglaDigits[d] : d).join('');
};

// Full Grand Model Tests Data
const INITIAL_EXAMS = [
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
    negativeMarks: "০.৫০"
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
    negativeMarks: "০.৫০"
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
    negativeMarks: "০.২৫"
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
    negativeMarks: "০.২৫"
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
    negativeMarks: "০.২৫"
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
    negativeMarks: "০.২৫"
  }
];

// Subjects Data per Exam
const SUBJECTS_DATA = [
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

export default function FullModelTestClient({ initialSearchParams }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Instant SSR-available params from server prop + dynamic fallback
  const examId = initialSearchParams?.examId || searchParams?.get('examId');
  const subjectId = initialSearchParams?.subject || searchParams?.get('subject');
  const chapterId = initialSearchParams?.chapterId || searchParams?.get('chapterId');

  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Clean chapterId from URL if present and redirect to clean subject URL
  useEffect(() => {
    if (chapterId && examId && subjectId) {
      router.replace(`/full-model-test-demo?examId=${examId}&subject=${subjectId}`);
    }
  }, [chapterId, examId, subjectId, router]);

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
    const interval = setInterval(() => {
      setOnlineCounts(prev => {
        const next = { ...prev };
        INITIAL_EXAMS.forEach(e => {
          next[e.id] = getWeightedOnlineCount(prev[e.id]);
        });
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const selectedExam = INITIAL_EXAMS.find(e => e.id === examId) || INITIAL_EXAMS[0];
  const selectedSubject = SUBJECTS_DATA.find(s => s.id === subjectId);

  const categories = [
    { id: 'all', label: 'সকল পূর্ণাঙ্গ টেস্ট' },
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
  // VIEW 3: 20 MODEL TESTS UNDER SELECTED SUBJECT
  // (2 Boxes per line, with প্রশ্ন : ১০০ and সময় : ৬০ মিনিট)
  // -------------------------------------------------------------
  if (examId && subjectId && selectedSubject) {
    const MODEL_COUNT = 20;
    const modelsList = Array.from({ length: MODEL_COUNT }, (_, idx) => {
      const num = idx + 1;
      const formattedNum = String(num).padStart(2, '0');
      const bnNum = toBanglaNumber(formattedNum);
      const title = selectedSubject.id === 'english'
        ? `Model Test - ${formattedNum}`
        : `মডেল টেস্ট - ${bnNum}`;

      return {
        num,
        formattedNum,
        bnNum,
        title
      };
    });

    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)', paddingBottom: '80px', paddingTop: '30px' }}>
        <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/full-model-test-demo" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>MCQ</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/full-model-test-demo?examId=${selectedExam.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{selectedExam.categoryName}</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedSubject.name}</span>
            </div>

            <button
              onClick={() => router.push(`/full-model-test-demo?examId=${selectedExam.id}`)}
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

          {/* Heading */}
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800, marginBottom: '20px' }}>
            মডেল টেস্টসমূহ ({toBanglaNumber(modelsList.length)})
          </h2>

          {/* 2-Column Models Grid: 2 boxes per line */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '14px' }}>
            {modelsList.map((model) => (
              <div
                key={model.num}
                onClick={() => router.push(`/questions?category=${encodeURIComponent(`${selectedExam.categoryName} > ${selectedExam.title} > ${selectedSubject.name} > ${model.title}`)}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = selectedSubject?.theme?.color || '#006a4e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Left Side: Number Badge + Model Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: selectedSubject?.theme?.lightBg || '#e6f4ea',
                      color: selectedSubject?.theme?.color || '#006a4e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      flexShrink: 0
                    }}
                  >
                    {model.num}
                  </div>

                  <span style={{ fontSize: '1.02rem', color: '#0f172a', fontWeight: 700, lineHeight: '1.4' }}>
                    {model.title}
                  </span>
                </div>

                {/* Right Side: প্রশ্ন: ১০০ এবং সময়: ৬০ মিনিট */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                  >
                    {selectedSubject.id === 'english' ? 'Questions : 100' : 'প্রশ্ন : ১০০'}
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                  >
                    {selectedSubject.id === 'english' ? 'Time : 60 Minutes' : 'সময় : ৬০ মিনিট'}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: SUBJECTS SELECTION VIEW (When examId is present)
  // Shows Subject Cards with "২০ টি মডেল টেস্ট অন্তর্ভুক্ত" (Chapter removed!)
  // -------------------------------------------------------------
  if (examId) {
    return (
      <main style={{ padding: '40px 0 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/full-model-test-demo" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>পূর্ণাঙ্গ মডেল টেস্ট</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedExam.title}</span>
            </div>

            <button
              onClick={() => router.push('/full-model-test-demo')}
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
              <span>সকল মডেল টেস্টে ফিরে যান</span>
            </button>
          </div>

          {/* Exam Info Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #e2e8f0',
              borderLeft: `5px solid ${selectedExam.borderColor || '#0284c7'}`,
              marginBottom: '35px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700 }}>
                {selectedExam.categoryName}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                <i className="fa-solid fa-layer-group" style={{ marginRight: '6px' }} />
                বিষয়ভিত্তিক মডেল টেস্ট অন্তর্ভুক্ত
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800, marginBottom: '10px' }}>
              {selectedExam.title}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.6', margin: 0 }}>
              {selectedExam.description}
            </p>
          </div>

          {/* Section Title */}
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '20px' }}>
            বিষয়সমূহ নির্বাচন করুন ({SUBJECTS_DATA.length})
          </h2>

          {/* Subjects Grid - Refined Box Design */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px' }}>
            {SUBJECTS_DATA.map(sub => {
              const theme = sub.theme || {
                color: '#006a4e',
                gradient: 'linear-gradient(135deg, #006a4e 0%, #059669 100%)',
                lightBg: '#f0fdf4',
                borderColor: '#bbf7d0',
                glowColor: 'rgba(0, 106, 78, 0.12)'
              };

              return (
                <div
                  key={sub.id}
                  onClick={() => router.push(`/full-model-test-demo?examId=${selectedExam.id}&subject=${sub.id}`)}
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

                    {/* Meta Specs Box inside Card showing 20 Model Tests */}
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
                      <span>মডেল টেস্ট অন্তর্ভুক্ত</span>
                    </div>
                  </div>

                  {/* Call to Action Button */}
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
  // VIEW 1: ALL FULL MODEL TESTS LIST (Default / Home of full-model-test-demo)
  // -------------------------------------------------------------
  return (
    <main style={{ padding: '40px 0 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
      <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        
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
            <span>পূর্ণাঙ্গ মডেল টেস্ট সম্ভার</span>
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            পূর্ণাঙ্গ অনলাইন মডেল টেস্ট
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            আপনার পছন্দের ক্যাটাগরি বাছাই করুন এবং নির্ধারিত পরীক্ষার বিষয়ভিত্তিক মডেল টেস্টে অংশ নিন।
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
              placeholder="পূর্ণাঙ্গ টেস্ট খুঁজুন..."
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
              কোনো পূর্ণাঙ্গ মডেল টেস্ট পাওয়া যায়নি।
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

                    {/* Title */}
                    <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, marginBottom: '10px', lineHeight: '1.4' }}>
                      {exam.title}
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
                      onClick={() => router.push(`/full-model-test-demo?examId=${exam.id}`)}
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
                      <span>বিষয় ও মডেল টেস্ট দেখুন</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
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
