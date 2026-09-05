'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Initial Model Tests Data
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
    subjectsText: "বাংলা, English, গণিত, সাধারণ জ্ঞান"
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
    subjectsText: "বাংলা ভাষা ও ব্যাকরণ, বাংলা সাহিত্যের ইতিহাস, গল্প, নাটক, প্রবন্ধ, গুরুত্বপূর্ণ তথ্য"
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
    subjectsText: "English Grammar, Parts of Speech, Math Shortcuts, General Knowledge"
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
    subjectsText: "বাংলা ব্যাকরণ, সাহিত্য, ইংরেজি, পাটিগণিত, সাধারণ জ্ঞান"
  },
  {
    id: "math-shortcut-mastery",
    title: "বিসিএস ও ব্যাংক ম্যাথ শর্টকাট স্পেশাল টেস্ট",
    category: "subject",
    categoryName: "গণিত ও আইসিটি",
    tags: ["Top Rated", "Math", "Shortcut"],
    badgeColor: "primary",
    onlineUsers: 19,
    borderColor: "#06b6d4",
    description: "ঐকিক নিয়ম, শতকরা, লাভ-ক্ষতি, ধারা ও বীজগণিতের গুরুত্বপূর্ণ বাছাই করা প্রশ্ন।",
    subjectsText: "ঐকিক নিয়ম, শতকরা, লাভ-ক্ষতি, মান নির্ণয়, সূচক ও লগারিদম, জ্যামিতি"
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
    subjectsText: "বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান"
  }
];

// Bengali number converter helper
const toBanglaNumber = (num) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => banglaDigits[d] !== undefined ? banglaDigits[d] : d).join('');
};

// Subjects Data per Model Test
const SUBJECTS_DATA = [
  {
    id: "bangla",
    code: "BANGLA",
    name: "বাংলা",
    desc: "ব্যাকরণ, সাহিত্য ও শুদ্ধ প্রয়োগ",
    chaptersCount: 4,
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
    chaptersCount: 18,
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
    chaptersCount: 20,
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
    chaptersCount: 20,
    theme: {
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
      lightBg: "#faf5ff",
      borderColor: "#ddd6fe",
      glowColor: "rgba(124, 58, 237, 0.12)"
    }
  }
];

// Chapters per Subject
const CHAPTERS_BY_SUBJECT = {
  bangla: [
    {
      id: 1,
      title: "বাংলা ভাষা ও ব্যাকরণ",
      desc: "বাংলা ভাষার উৎপত্তি ও বিকাশ, ভাষার রীতি, সাধু ও চলিত রীতি, ধ্বনি ও বর্ণ, শব্দ, পদ, কারক ও বিভক্তি, সমাস, সন্ধি, উপসর্গ, প্রত্যয়, ক্রিয়া, কাল, বাচ্য, উক্তি, পুরুষ, বাক্য, শুদ্ধ বানান, শুদ্ধ-অশুদ্ধ প্রয়োগ, পারিভাষিক শব্দ, বাগধারা, প্রবাদ..."
    },
    {
      id: 2,
      title: "বাংলা সাহিত্যের ইতিহাস",
      desc: "প্রাচীন যুগ, মধ্যযুগ, আধুনিক যুগ, বাংলা সাহিত্যের বিভিন্ন ধারা, চর্যাপদ, বৈষ্ণব পদাবলি, মঙ্গলকাব্য, অনুবাদ সাহিত্য, মুসলিম সাহিত্য, শাক্ত পদাবলি, বাউল সাহিত্য, আধুনিক সাহিত্য ও বাংলাদেশের সাহিত্য।"
    },
    {
      id: 3,
      title: "গল্প, নাটক, প্রবন্ধ, সাহিত্যকর্ম ও চরিত্র",
      desc: "গুরুত্বপূর্ণ কাব্য, কবিতা, উপন্যাস, ছোটগল্প, নাটক, প্রবন্ধ, রচয়িতা, রচনাকাল, চরিত্র ও বিষয়বস্তু।"
    },
    {
      id: 4,
      title: "বাংলা সাহিত্যের গুরুত্বপূর্ণ তথ্য",
      desc: "সাহিত্যের প্রথম, বিখ্যাত পঙ্ক্তি, সাহিত্যিকদের উপাধি, ছদ্মনাম, পত্র-পত্রিকা, সাময়িকী, পুরস্কার ও উল্লেখযোগ্য সাহিত্যিক ঘটনা।"
    }
  ],

  english: [
    {
      id: 1,
      title: "Parts of Speech & Nouns",
      desc: "Classification of Nouns, Countable and Uncountable Nouns, Abstract, Collective, and Proper Nouns rules."
    },
    {
      id: 2,
      title: "Pronouns & Adjectives",
      desc: "Personal, Relative, Demonstrative Pronouns, Degrees of Comparison, and Order of Adjectives."
    },
    {
      id: 3,
      title: "Verbs, Tense & Modals",
      desc: "Transitive/Intransitive Verbs, Sequence of Tenses, Right forms of Verbs, and Modal Auxiliaries."
    },
    {
      id: 4,
      title: "Subject-Verb Agreement",
      desc: "Essential rules of Subject-Verb Agreement with singular/plural subjects and collective nouns."
    }
  ],

  math: [
    {
      id: 1,
      title: "সংখ্যা ও বাস্তব সংখ্যা (Number System)",
      desc: "মৌলিক সংখ্যা, জোড়-বিজোড় সংখ্যা, মূলদ-অমূলদ সংখ্যা, ভাজক সংখ্যা, লসাগু ও গসাগু।"
    },
    {
      id: 2,
      title: "ঐকিক নিয়ম ও কাজ (Unitary Method & Work)",
      desc: "ঐকিক নিয়ম, লোক ও কাজের সময়, চৌবাচ্চা ও নলের হিসাব।"
    },
    {
      id: 3,
      title: "শতকরা ও লাভ-ক্ষতি (Percentage & Profit/Loss)",
      desc: "শতকরা হার, ক্রয়মূল্য-বিক্রয়মূল্য, লাভ-ক্ষতির হার ও বিশেষ টেকনিক।"
    },
    {
      id: 4,
      title: "মুনাফা ও সুদ (Simple & Compound Interest)",
      desc: "সরল মুনাফা (I = prn), চক্রবৃদ্ধি মুনাফা ও আসলের হিসাব।"
    }
  ],

  gk: [
    {
      id: 1,
      title: "প্রাচীন বাংলা ও প্রাচীন জনপদ",
      desc: "মৌর্য, গুপ্ত, শশাঙ্ক, পাল ও সেন বংশের ইতিহাস, প্রাচীন জনপদসমূহ।"
    },
    {
      id: 2,
      title: "মধ্যযুগীয় বাংলা ও সুলতানি-মোগল আমল",
      desc: "ইখতিয়ার উদ্দিন বখতিয়ার খলজি, বারো ভুঁইয়া, সুবাদারি ও নوابি আমল।"
    },
    {
      id: 3,
      title: "ব্রিটিশ আমল ওভারতীয় উপমহাদেশ",
      desc: "পলাশীর যুদ্ধ, সিপাহি বিদ্রোহ, বঙ্গভঙ্গ, লাহোর প্রস্তাব ও দেশভাগ।"
    },
    {
      id: 4,
      title: "ভাষা আন্দোলন ও ৫২-র চেতনা",
      desc: "১৯৪৮-১৯৫২ সালের ইতিহাস, রাষ্ট্রভাষা সংগ্রাম পরিষদ, ২১শে ফেব্রুয়ারি।"
    }
  ]
};

// Topics list per Chapter for each Subject
const CHAPTER_TOPICS = {
  bangla: {
    1: [
      "বাংলা ভাষার উৎপত্তি ও বিকাশ", "ভাষার রীতি", "সাধু ও চলিত রীতি", "ধ্বনি ও বর্ণ", "শব্দ", "পদ",
      "কারক ও বিভক্তি", "সমাস", "সন্ধি", "উপসর্গ", "প্রত্যয়", "ক্রিয়া",
      "কাল", "বাচ্য", "উক্তি", "পুরুষ", "বাক্য", "শুদ্ধ বানান",
      "শুদ্ধ-অশুদ্ধ প্রয়োগ", "পারিভাষিক শব্দ", "বাগধারা", "প্রবাদ-প্রবচন", "এককথায় প্রকাশ", "সমার্থক শব্দ",
      "বিপরীতার্থক শব্দ", "শব্দের উৎস", "ছন্দ ও অলংকার"
    ],
    2: [
      "প্রাচীন যুগ", "মধ্যযুগ", "আধুনিক যুগ", "বাংলা সাহিত্যের বিভিন্ন ধারা", "চর্যাপদ", "বৈষ্ণব পদাবলি",
      "মঙ্গলকাব্য", "অনুবাদ সাহিত্য", "মুসলিম সাহিত্য", "শাক্ত পদাবলি", "বাউল সাহিত্য", "আধুনিক সাহিত্য ও বাংলাদেশের সাহিত্য"
    ],
    3: [
      "কবি ও কবিতা", "উপন্যাস ও ঔপন্যাসিক", "ছোটগল্প ও গল্পকার", "নাটক ও নাট্যকার", "প্রবন্ধ ও প্রাবন্ধিক",
      "বিখ্যাত চরিত্র ও লেখক", "গুরুত্বপূর্ণ সাহিত্যকর্ম ও রচনাকাল", "সাহিত্যিকদের আত্মজীবনী ও ভ্রমণকাহিনী"
    ],
    4: [
      "বাংলা সাহিত্যের প্রথমসমূহ", "বিখ্যাত কাব্য ও ছদ্মনাম", "সাহিত্যিকদের উপাধি ও উপনাম", "বাংলা পত্র-পত্রিকা ও সাময়িকী",
      "সাহিত্যিক পুরস্কার ও সম্মাননা", "ঐতিহাসিক সাহিত্যিক ঘটনা ও আন্দোলন"
    ]
  },
  english: {
    1: ["Parts of Speech & Nouns", "Countable & Uncountable Nouns", "Abstract & Collective Nouns"],
    2: ["Pronouns & Types", "Adjectives & Degrees of Comparison", "Order of Adjectives"],
    3: ["Verbs & Types", "Tense & Sequence of Tense", "Right Forms of Verbs", "Modal Auxiliaries"],
    4: ["Subject-Verb Agreement Rules", "Plural/Singular Subjects", "Collective Nouns Agreement"]
  },
  math: {
    1: ["মৌলিক ও কৃত্রিম সংখ্যা", "মূলদ ও অমূলদ সংখ্যা", "ভাজক সংখ্যা", "লসাগু ও গসাগু"],
    2: ["ঐকিক নিয়ম", "কাজ ও সময়", "নল ও চৌবাচ্চা"],
    3: ["শতকরা হিসাব", "ক্রয়মূল্য ও বিক্রয়মূল্য", "লাভ ও ক্ষতি"],
    4: ["সরল মুনাফা (I=prn)", "চক্রবৃদ্ধি মুনাফা"]
  },
  gk: {
    1: ["প্রাচীন জনপদ", "মৌর্য ও গুপ্ত বংশ", "পাল ও সেন সাম্রাজ্য"],
    2: ["সুলতানি আমল", "মোগল সাম্রাজ্য", "বারো ভুঁইয়া ও নবাবী আমল"],
    3: ["পলাশীর যুদ্ধ ১৭৫৭", "সিপাহি বিদ্রোহ ১৮৫৭", "বঙ্গভঙ্গ ১৯০৫", "লাহোর প্রস্তাব ১৯৪০"],
    4: ["ভাষা আন্দোলন ১৯৫২", "আন্তর্জাতিক মাতৃভাষা দিবস"]
  }
};

export default function SubjectiveModelTestClient({ initialSearchParams }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const examId = searchParams.get('examId');
  const subjectId = searchParams.get('subject');
  const chapterId = searchParams.get('chapterId');

  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live dynamic Online User counts weighted distribution (8 to 48 range)
  const getWeightedOnlineCount = (current) => {
    if (current && Math.random() < 0.85) {
      const delta = Math.floor(Math.random() * 5) - 2;
      let val = current + delta;
      if (val >= 8 && val <= 48) return val;
    }
    const rand = Math.random();
    if (rand < 0.70) {
      return Math.floor(Math.random() * 21) + 12; // 12 to 32
    } else if (rand < 0.90) {
      return Math.floor(Math.random() * 16) + 33; // 33 to 48
    } else {
      return Math.floor(Math.random() * 4) + 8; // 8 to 11
    }
  };

  const [onlineCounts, setOnlineCounts] = useState(() => {
    const initial = {};
    INITIAL_EXAMS.forEach(e => {
      initial[e.id] = e.onlineUsers || 30;
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
    { id: 'all', label: 'সকল টেস্ট' },
    { id: 'bcs', label: 'বিসিএস' },
    { id: 'bank', label: 'ব্যাংক জব' },
    { id: 'primary', label: 'প্রাথমিক শিক্ষক' },
    { id: 'subject', label: 'পূর্ণাঙ্গ মডেল টেস্ট' }
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
  // VIEW 4: TOPICS OF SELECTED CHAPTER VIEW (When examId, subjectId & chapterId exist)
  // -------------------------------------------------------------
  if (examId && subjectId && chapterId && selectedSubject) {
    const chaptersList = CHAPTERS_BY_SUBJECT[subjectId] || [];
    const currentChapter = chaptersList.find(c => String(c.id) === String(chapterId)) || chaptersList[0];
    const topicsList = (CHAPTER_TOPICS[subjectId] && CHAPTER_TOPICS[subjectId][chapterId]) || [currentChapter.title];

    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)', paddingBottom: '80px', paddingTop: '30px' }}>
        <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/subjective-model-test-demo" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>MCQ</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/subjective-model-test-demo?examId=${selectedExam.id}&subject=${selectedSubject.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{selectedSubject.name}</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>অধ্যায় {chapterId}</span>
            </div>

            <button
              onClick={() => router.push(`/subjective-model-test-demo?examId=${selectedExam.id}&subject=${selectedSubject.id}`)}
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
  // VIEW 3: CHAPTERS VIEW (When examId & subject are present)
  // -------------------------------------------------------------
  if (examId && subjectId && selectedSubject) {
    const chaptersList = CHAPTERS_BY_SUBJECT[subjectId] || [];

    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)', paddingBottom: '80px' }}>
        {/* Dark Teal/Green Banner Header */}
        <div style={{ backgroundColor: '#006a4e', color: '#ffffff', padding: '40px 20px', textAlign: 'left' }}>
          <div className="container" style={{ maxWidth: '1300px', margin: '0 auto' }}>
            <span style={{ fontSize: '0.85rem', letterSpacing: '1.5px', fontWeight: 700, opacity: 0.9, textTransform: 'uppercase' }}>
              {selectedSubject.code}
            </span>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, margin: '6px 0 10px', color: '#ffffff' }}>
              {selectedSubject.name}
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#e2e8f0', margin: 0, opacity: 0.95 }}>
              {chaptersList.length} টি অধ্যায় — অধ্যায় বেছে নিন এবং টপিকভিত্তিক প্রশ্ন সমাধান করুন।
            </p>
          </div>
        </div>

        {/* Sub-header / Breadcrumb Bar */}
        <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
          <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/subjective-model-test-demo" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>MCQ</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/subjective-model-test-demo?examId=${selectedExam.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{selectedExam.categoryName}</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedSubject.name}</span>
            </div>

            <button
              onClick={() => router.push(`/subjective-model-test-demo?examId=${selectedExam.id}`)}
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
        <div className="container" style={{ maxWidth: '1300px', margin: '35px auto 0', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '20px' }}>
            {chaptersList.map(ch => (
              <div
                key={ch.id}
                onClick={() => router.push(`/subjective-model-test-demo?examId=${selectedExam.id}&subject=${selectedSubject.id}&chapterId=${ch.id}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#006a4e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
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
                  <div
                    style={{
                      color: selectedSubject?.theme?.color || '#006a4e',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>টপিক দেখুন</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                  </div>
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
  // -------------------------------------------------------------
  if (examId) {
    return (
      <main style={{ padding: '40px 0 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Breadcrumb & Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/subjective-model-test-demo" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>সকল মডেল টেস্ট</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedExam.title}</span>
            </div>

            <button
              onClick={() => router.push('/subjective-model-test-demo')}
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
              <span>অন্য মডেল টেস্ট বাছাই করুন</span>
            </button>
          </div>

          {/* Title Header */}
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}>
              {selectedExam.title}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
              বিষয় বেছে নিন এবং অধ্যায়ভিত্তিক প্রস্তুতি ও পরীক্ষা শুরু করুন।
            </p>
          </div>

          {/* 4 Subject Cards Grid (Refined Box Design) */}
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
                  onClick={() => router.push(`/subjective-model-test-demo?examId=${selectedExam.id}&subject=${sub.id}`)}
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

                    {/* Meta Specs Box inside Card */}
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
                        {toBanglaNumber(sub.chaptersCount)} টি
                      </strong>
                      <span>অধ্যায় অন্তর্ভুক্ত</span>
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
                    <span>অধ্যায়সমূহ দেখুন</span>
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
  // VIEW 1: ALL MODEL TESTS LIST VIEW (Default / Home of model-test-demo)
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
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>মডেল টেস্ট সম্ভার</span>
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            বিষয়ভিত্তিক অনলাইন মডেল টেস্ট
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            আপনার পছন্দের ক্যাটাগরি বাছাই করুন এবং নির্ধারিত সময়ের মধ্যে পরীক্ষা দিয়ে রিয়েল-টাইম মেরিট অবস্থান যাচাই করুন।
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
              placeholder="মডেল টেস্ট খুঁজুন..."
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
              কোনো মডেল টেস্ট পাওয়া যায়নি।
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
                        অন্তর্ভুক্ত বিষয় ও টপিকসমূহ:
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
                        {onlineCounts[exam.id] || 22} Online
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/subjective-model-test-demo?examId=${exam.id}`)}
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
                      <span>বিষয় ও টপিক দেখুন</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
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
