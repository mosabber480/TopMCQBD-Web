'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

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
    subjectsText: "বাংলা (৩৫), English (৩৫), গণিত ও মানসিক দক্ষতা (৩০), সাধারণ জ্ঞান (৫০), বিজ্ঞান ও আইসিটি (৩০), ভূগোল ও সুশাসন (২০)"
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
    subjectsText: "বাংলা সাহিত্য ও ব্যাকরণ, English Language & Literature, সাধারণ গণিত, বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি"
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
    subjectsText: "English (30), Mathematics (30), General Knowledge & Banking (20), Bangla (10), ICT (10)"
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
    subjectsText: "বাংলা (২০), ইংরেজি (২০), গণিত (২০), সাধারণ জ্ঞান (২০)"
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
    subjectsText: "বাংলা সাহিত্য ও ব্যাকরণ, ইংরেজি গ্রামার, পাটিগণিত ও জ্যামিতি, সাম্প্রতিক তথ্য"
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
    subjectsText: "বাংলা (২৫), ইংরেজি (২৫), সাধারণ গণিত (২৫), সাধারণ জ্ঞান (২৫)"
  }
];

// Subjects Data per Full Model Test
const SUBJECTS_DATA = [
  {
    id: "bangla",
    code: "BANGLA",
    name: "বাংলা",
    desc: "ভাষা, ব্যাকরণ ও সাহিত্য অংশ",
    chaptersCount: 4
  },
  {
    id: "english",
    code: "ENGLISH",
    name: "English",
    desc: "Language, Grammar & Literature",
    chaptersCount: 18
  },
  {
    id: "math",
    code: "MATHEMATICS",
    name: "গণিত ও মানসিক দক্ষতা",
    desc: "পাটিগণিত, বীজগণিত, জ্যামিতি ও মানসিক দক্ষতা",
    chaptersCount: 20
  },
  {
    id: "gk",
    code: "GENERAL KNOWLEDGE",
    name: "সাধারণ জ্ঞান ও সাম্প্রতিক",
    desc: "বাংলাদেশ, আন্তর্জাতিক ও তথ্যপ্রযুক্তি বিষয়াবলি",
    chaptersCount: 20
  }
];

// Chapters per Subject
const CHAPTERS_BY_SUBJECT = {
  bangla: [
    {
      id: 1,
      title: "বাংলা ভাষা ও ব্যাকরণ পূর্ণাঙ্গ অংশ",
      desc: "বাংলা ভাষার উৎপত্তি, ধ্বনি, বর্ণ, শব্দ, পদ, কারক, সমাস, সন্ধি, প্রত্যয়, বাক্যশুদ্ধি ও বাগধারা।"
    },
    {
      id: 2,
      title: "বাংলা সাহিত্য পূর্ণাঙ্গ অংশ",
      desc: "প্রাচীন যুগ, মধ্যযুগ, আধুনিক যুগ, রবীন্দ্র-নজরুল সাহিত্য ও আধুনিক বাংলা কবিতা।"
    },
    {
      id: 3,
      title: "সাহিত্যকর্ম ও বিখ্যাত চরিত্র",
      desc: "গুরুত্বপূর্ণ কাব্য, উপন্যাস, নাটক, গল্প ও সাহিত্যিকদের উল্লেখযোগ্য চরিত্রসমূহ।"
    },
    {
      id: 4,
      title: "বাংলা সাহিত্যের গুরুত্বপূর্ণ তথ্যসম্ভার",
      desc: "পত্র-পত্রিকা, সাহিত্যিক ছদ্মনাম, উপাধি ও জাতীয় পুরস্কারপ্রাপ্ত সাহিত্য।"
    }
  ],

  english: [
    {
      id: 1,
      title: "Grammar & Structure Full Section",
      desc: "Parts of Speech, Nouns, Pronouns, Adjectives, Verbs and Tenses."
    },
    {
      id: 2,
      title: "Sentence Correction & Agreement",
      desc: "Subject-Verb Agreement, Modifiers, Parallelism and Voice change."
    },
    {
      id: 3,
      title: "Vocabulary & Idioms",
      desc: "Synonyms, Antonyms, Idiomatic Expressions, and Appropriate Prepositions."
    },
    {
      id: 4,
      title: "English Literature Overview",
      desc: "Elizabethan, Romantic, Victorian and Modern Age key authors & quotations."
    }
  ],

  math: [
    {
      id: 1,
      title: "পাটিগণিত ও বাস্তব সংখ্যা",
      desc: "বাস্তব সংখ্যা, লসাগু-গসাগু, ঐকিক নিয়ম, কাজ-সময় ও শতকরা হিসাব।"
    },
    {
      id: 2,
      title: "লাভ-ক্ষতি ও সুদকষা",
      desc: "ক্রয়-বিক্রয়, লাভ-ক্ষতির হার, সরল মুনাফা ও চক্রবৃদ্ধি মুনাফা।"
    },
    {
      id: 3,
      title: "বীজগণিত ও সমীকরণ",
      desc: "বীজগণিতীয় সূত্রাবলি, মান নির্ণয়, সূচক, লগারিদম ও ধারা।"
    },
    {
      id: 4,
      title: "জ্যামিতি, স্থানাঙ্ক ও মানসিক দক্ষতা",
      desc: "রেখা, কোণ, ত্রিভুজ, বৃত্ত, চতুর্ভুজ ও যুক্তিভিত্তিক সমস্যা সমাধান।"
    }
  ],

  gk: [
    {
      id: 1,
      title: "বাংলাদেশ বিষয়াবলি পূর্ণাঙ্গ অংশ",
      desc: "প্রাচীন জনপদ, মুক্তিযুদ্ধ, সংবিধান, জাতীয় সংসদ ও ভৌগোলিক পরিচিতি।"
    },
    {
      id: 2,
      title: "আন্তর্জাতিক বিষয়াবলি পূর্ণাঙ্গ অংশ",
      desc: "জাতিসংঘ, আন্তর্জাতিক চুক্তি, ভূ-রাজনীতি, বিশ্ব অর্থনীতি ও গুরুত্বপূর্ণ সংস্থা।"
    },
    {
      id: 3,
      title: "দৈনন্দিন বিজ্ঞান ও তথ্যপ্রযুক্তি",
      desc: "পদার্থ, রসায়ন, জীববিজ্ঞান, কম্পিউটার নেটওয়ার্ক ও সাইবার নিরাপত্তা।"
    },
    {
      id: 4,
      title: "সাম্প্রতিক ঘটনাপ্রবাহ ও সাধারণ জ্ঞান",
      desc: "দেশীয় ও আন্তর্জাতিক সাম্প্রতিক তথ্য, খেলাধুলা, পুরস্কার ও সমসাময়িক রিপোর্ট।"
    }
  ]
};

// Topics list per Chapter for each Subject
const CHAPTER_TOPICS = {
  bangla: {
    1: ["বাংলা ব্যাকরণ সমগ্র", "ধ্বনি ও বর্ণ", "শব্দ ও পদ প্রকরণ", "সমাস ও সন্ধি", "কারক ও বিভক্তি", "বাক্য শুদ্ধি"],
    2: ["প্রাচীন ও মধ্যযুগ", "আধুনিক যুগের সাহিত্যিকগণ", "রবীন্দ্রনাথ ও নজরুল", "মুক্তিযুদ্ধভিত্তিক সাহিত্য"],
    3: ["উপন্যাস ও গল্পসমগ্র", "নাটক ও প্রবন্ধ", "বিখ্যাত উক্তি ও পঙ্ক্তি"],
    4: ["পত্রিকা ও সাময়িকী", "সাহিত্য পুরস্কার ও একাডেমি", "ছদ্মনাম ও উপাধি"]
  },
  english: {
    1: ["Parts of Speech Complete", "Noun, Pronoun, Adjective", "Verbs, Adverbs, Prepositions"],
    2: ["Subject-Verb Agreement", "Transformation of Sentences", "Clause and Phrases"],
    3: ["Synonyms & Antonyms", "Idioms & Phrases", "One Word Substitution"],
    4: ["Major Literary Periods", "Famous Authors & Works", "Famous Quotes & Characters"]
  },
  math: {
    1: ["সংখ্যা পদ্ধতি ও লসাগু-গসাগু", "ঐকিক নিয়ম ও কাজের হিসাব", "শতকরা ও অনুপাত"],
    2: ["লাভ ও ক্ষতি", "সরল ও চক্রবৃদ্ধি সুদ", "নল ও চৌবাচ্চা"],
    3: ["বীজগণিতীয় মান নির্ণয়", "সূচক ও লগারিদম", "সমান্তর ও গুণোত্তর ধারা"],
    4: ["জ্যামিতি ও পরিমিতি", "স্থানাঙ্ক জ্যামিতি", "মানসিক দক্ষতা ও অ্যানালজি"]
  },
  gk: {
    1: ["প্রাচীন বাংলা ও সুলতানি আমল", "ভাষা আন্দোলন ও মুক্তিযুদ্ধ ১৯৭১", "বাংলাদেশের সংবিধান ও সরকার ব্যবস্থা"],
    2: ["আন্তর্জাতিক সংস্থা ও জাতিসংঘ", "বিশ্বরাজনীতি ও বিরোধপূর্ণ অঞ্চল", "আন্তর্জাতিক সম্মেলন ও চুক্তি"],
    3: ["দৈনন্দিন বিজ্ঞান", "কম্পিউটার ও আইসিটি", "মহাকাশ ও ভূগোল"],
    4: ["সাম্প্রতিক জাতীয় ও আন্তর্জাতিক তথ্য", "নোবেল পুরস্কার ও খেলাধুলা", "অর্থনৈতিক সমীক্ষা ও বাজেট"]
  }
};

function FullModelTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const examId = searchParams.get('examId');
  const subjectId = searchParams.get('subject');
  const chapterId = searchParams.get('chapterId');

  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      initial[e.id] = e.onlineUsers || 40;
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

  // Selected Exam & Subject
  const selectedExam = INITIAL_EXAMS.find(e => e.id === examId) || INITIAL_EXAMS[0];
  const selectedSubject = SUBJECTS_DATA.find(s => s.id === subjectId);

  const categories = [
    { id: 'all', label: 'সকল পূর্ণাঙ্গ টেস্ট' },
    { id: 'bcs', label: 'বিসিএস গ্র্যান্ড' },
    { id: 'bank', label: 'ব্যাংক জব' },
    { id: 'primary', label: 'প্রাইমারি শিক্ষক' }
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
  // VIEW 4: TOPICS OF SELECTED CHAPTER VIEW
  // -------------------------------------------------------------
  if (examId && subjectId && chapterId && selectedSubject) {
    const chaptersList = CHAPTERS_BY_SUBJECT[subjectId] || [];
    const currentChapter = chaptersList.find(c => String(c.id) === String(chapterId)) || chaptersList[0];
    const topicsList = (CHAPTER_TOPICS[subjectId] && CHAPTER_TOPICS[subjectId][chapterId]) || [currentChapter.title];

    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)', paddingBottom: '80px', paddingTop: '30px' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/full-model-test-demo" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>পূর্ণাঙ্গ মডেল টেস্ট</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/full-model-test-demo?examId=${selectedExam.id}&subject=${selectedSubject.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{selectedSubject.name}</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>অধ্যায় {chapterId}</span>
            </div>

            <button
              onClick={() => router.push(`/full-model-test-demo?examId=${selectedExam.id}&subject=${selectedSubject.id}`)}
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
              <span>অধ্যায় তালিকায় ফিরে যান</span>
            </button>
          </div>

          {/* Heading */}
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800, marginBottom: '20px' }}>
            টপিকসমূহ ({topicsList.length})
          </h2>

          {/* 3-Column Topics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {topicsList.map((top, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/questions?category=${encodeURIComponent(`${selectedExam.categoryName} > ${selectedSubject.name} > ${currentChapter.title} > ${top}`)}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#006a4e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Green Number Box */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#e6f4ea',
                    color: '#006a4e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </div>

                {/* Topic Title */}
                <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700, lineHeight: '1.4' }}>
                  {top}
                </span>
              </div>
            ))}
          </div>

        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: CHAPTERS VIEW
  // -------------------------------------------------------------
  if (examId && subjectId && selectedSubject) {
    const chaptersList = CHAPTERS_BY_SUBJECT[subjectId] || [];

    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)', paddingBottom: '80px' }}>
        {/* Banner Header */}
        <div style={{ backgroundColor: '#006a4e', color: '#ffffff', padding: '40px 20px', textAlign: 'left' }}>
          <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <span style={{ fontSize: '0.85rem', letterSpacing: '1.5px', fontWeight: 700, opacity: 0.9, textTransform: 'uppercase' }}>
              {selectedSubject.code}
            </span>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, margin: '6px 0 10px', color: '#ffffff' }}>
              {selectedSubject.name}
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#e2e8f0', margin: 0, opacity: 0.95 }}>
              {chaptersList.length} টি অধ্যায় — পূর্ণাঙ্গ পরীক্ষার বিষয়ভিত্তিক সমাধান ও অনুশীলন।
            </p>
          </div>
        </div>

        {/* Sub-header / Breadcrumb Bar */}
        <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
          <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/full-model-test-demo" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>পূর্ণাঙ্গ মডেল টেস্ট</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/full-model-test-demo?examId=${selectedExam.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{selectedExam.categoryName}</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedSubject.name}</span>
            </div>

            <button
              onClick={() => router.push(`/full-model-test-demo?examId=${selectedExam.id}`)}
              style={{
                backgroundColor: '#f1f5f9',
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
        </div>

        {/* Chapters Grid Container */}
        <div className="container" style={{ maxWidth: '1100px', margin: '35px auto 0', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '20px' }}>
            {chaptersList.map(ch => (
              <div
                key={ch.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                {/* Green Number Badge Box */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#e6f4ea',
                    color: '#006a4e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0
                  }}
                >
                  {ch.id}
                </div>

                {/* Chapter Details */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, marginBottom: '8px', lineHeight: '1.4' }}>
                    {ch.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                    {ch.desc}
                  </p>
                  <button
                    onClick={() => router.push(`/full-model-test-demo?examId=${selectedExam.id}&subject=${selectedSubject.id}&chapterId=${ch.id}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#006a4e',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: 0
                    }}
                  >
                    <span>অধ্যায় দেখুন</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: SUBJECTS SELECTION VIEW
  // -------------------------------------------------------------
  if (examId) {
    return (
      <main style={{ padding: '40px 0 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          
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
                পূর্ণাঙ্গ বিষয় অন্তর্ভুক্ত
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

          {/* Subjects Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {SUBJECTS_DATA.map(sub => (
              <div
                key={sub.id}
                onClick={() => router.push(`/full-model-test-demo?examId=${selectedExam.id}&subject=${sub.id}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.07)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    {sub.code}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}>
                    {sub.name}
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', marginBottom: '20px' }}>
                    {sub.desc}
                  </p>
                </div>

                <div style={{ color: '#006a4e', fontWeight: 700, fontSize: '0.92rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>{sub.chaptersCount} টি অধ্যায়</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: ALL MODEL TESTS LIST VIEW (Default / Home of full-model-test-demo)
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
            <span>পূর্ণাঙ্গ মডেল টেস্ট সম্ভার</span>
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            পূর্ণাঙ্গ অনলাইন মডেল টেস্ট
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            আপনার পছন্দের ক্যাটাগরি বাছাই করুন এবং নির্ধারিত সময়ের মধ্যে পূর্ণাঙ্গ পরীক্ষা দিয়ে রিয়েল-টাইম মেরিট অবস্থান যাচাই করুন।
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
              // Badge colors
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
                        backgroundColor: '#0284c7',
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
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                      }}
                    >
                      <span>বিষয় ও সিলেবাস দেখুন</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
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

export default function FullModelTestDemoPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
        পূর্ণাঙ্গ মডেল টেস্ট পেজ লোড হচ্ছে...
      </div>
    }>
      <FullModelTestContent />
    </Suspense>
  );
}
