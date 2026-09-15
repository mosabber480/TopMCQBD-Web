'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';

// Default Fallback Data
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

const toBanglaNumber = (num) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => banglaDigits[d] !== undefined ? banglaDigits[d] : d).join('');
};

const toSlug = (str) => (str || '').trim().replace(/[,\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

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
    chaptersCount: 4,
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
    chaptersCount: 4,
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
    chaptersCount: 4,
    theme: {
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
      lightBg: "#faf5ff",
      borderColor: "#ddd6fe",
      glowColor: "rgba(124, 58, 237, 0.12)"
    }
  }
];

const DEFAULT_CHAPTERS = [
  { id: 1, title: "মৌলিক ধারণা ও প্রারম্ভিক প্রস্তুতি", desc: "বিষয়টির প্রাথমিক ধারণা, গুরুত্বপূর্ণ সিলেবাস ও মৌলিক আলোচনা।" },
  { id: 2, title: "গুরুত্বপূর্ণ অধ্যায় ও বিগত বছরের প্রশ্ন", desc: "বিগত বিসিএস ও পিএসসি পরীক্ষার আলোকে সর্বাধিক কমনোপযোগী টপিক।" },
  { id: 3, title: "এডভান্সড কনসেপ্ট ও অনুশীলন", desc: "পরীক্ষায় আসা কঠিন ও প্যাঁচানো প্রশ্নাবলি এবং শর্টকাট সমাধান।" },
  { id: 4, title: "রিভিশন ও চূড়ান্ত প্রস্তুতি", desc: "পূর্ণাঙ্গ রিভিশন ও সময় নিয়ন্ত্রণ করে বিষয়ভিত্তিক চূড়ান্ত প্রস্তুতি।" }
];

const CHAPTERS_BY_SUBJECT = {
  bangla: [
    { id: 1, title: "বাংলা ভাষা ও ব্যাকরণ", desc: "বাংলা ভাষার উৎপত্তি ও বিকাশ, সাধু ও চলিত রীতি, ধ্বনি ও বর্ণ, শব্দ, পদ, কারক ও বিভক্তি, সমাস, সন্ধি..." },
    { id: 2, title: "বাংলা সাহিত্যের ইতিহাস", desc: "প্রাচীন যুগ, মধ্যযুগ, আধুনিক যুগ, চর্যাপদ, বৈষ্ণব পদাবলি, মঙ্গলকাব্য..." },
    { id: 3, title: "গল্প, নাটক, প্রবন্ধ ও সাহিত্যকর্ম", desc: "গুরুত্বপূর্ণ কাব্য, উপন্যাস, ছোটগল্প, নাটক, চরিত্র ও বিষয়বস্তু।" },
    { id: 4, title: "বাংলা সাহিত্যের গুরুত্বপূর্ণ তথ্য", desc: "সাহিত্যের প্রথম, বিখ্যাত পঙ্ক্তি, সাহিত্যিকদের উপাধি, ছদ্মনাম, পত্র-পত্রিকা..." }
  ],
  english: [
    { id: 1, title: "Parts of Speech & Grammar", desc: "Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction..." },
    { id: 2, title: "Sentence & Clauses", desc: "Structure, Transformation, Voice Change, Narration..." },
    { id: 3, title: "Vocabulary & Idioms", desc: "Synonyms, Antonyms, Idioms and Phrases, One Word Substitution..." },
    { id: 4, title: "English Literature", desc: "Periods of English Literature, Famous Poets, Dramatists, Works..." }
  ],
  math: [
    { id: 1, title: "পাটিগণিত", desc: "বাস্তব সংখ্যা, লসাগু-গসাগু, শতকরা, লাভ-ক্ষতি, সরল ও যৌগিক মুনাফা, অনুপাত..." },
    { id: 2, title: "বীজগণিত", desc: "বীজগাণিতিক সূত্রাবলি, বহুপদী উৎপাদক, সরল ও দ্বিপদী সমীকরণ, সূচক ও লগারিদম..." },
    { id: 3, title: "জ্যামিতি ও পরিমিতি", desc: "রেখা, কোণ, ত্রিভুজ, চতুর্ভুজ, বৃত্ত, পিথাগোরাসের উপপাদ্য, পরিমিতির ক্ষেত্রফল..." },
    { id: 4, title: "পরিসংখ্যান ও সম্ভাবনা", desc: "গড়, মধ্যক, প্রচুরক, বিন্যাস, সমাবেশ ও সম্ভাব্যতা।" }
  ],
  gk: [
    { id: 1, title: "বাংলাদেশ বিষয়াবলি (ইতিহাস ও ঐতিহ্য)", desc: "প্রাচীন বাংলা, মুসলিম শাসন, ব্রিটিশ আমল, ভাষা আন্দোলন, মুক্তিযুদ্ধ..." },
    { id: 2, title: "বাংলাদেশ সংবিধান ও সরকার ব্যবস্থা", desc: "সংবিধানের মূলনীতি, অনুচ্ছেদ, সংসদ, বিচার বিভাগ ও প্রশাসন..." },
    { id: 3, title: "আন্তর্জাতিক বিষয়াবলি", desc: "জাতিসংঘ, আন্তর্জাতিক চুক্তি, ভূ-রাজনীতি, বৈশ্বিক সমস্যা ও জলবায়ু..." },
    { id: 4, title: "বিজ্ঞান ও প্রযুক্তি", desc: "দৈনন্দিন বিজ্ঞান, কম্পিউটার, ইন্টারনেট ও সাম্প্রতিক বিশ্ব।" }
  ]
};

const CHAPTER_TOPICS = {
  bangla: {
    "1": ["ধ্বনি ও বর্ণ", "ধ্বনি পরিবর্তন ও ণ-ত্ব ও ষ-ত্ব বিধান", "সন্ধি ও নিয়মাবলি", "শব্দ ও শব্দের শ্রেণিবিভাগ", "পদ প্রকরণ", "কারক ও বিভক্তি", "সমাস", "উপসর্গ ও প্রত্যয়"],
    "2": ["চর্যাপদ", "শ্রীকৃষ্ণকীর্তন ও মঙ্গলকাব্য", "বৈষ্ণব পদাবলি", "অনুবাদ সাহিত্য ও আরাকান রাজসভা", "ফোর্ট উইলিয়াম কলেজ ও বাংলা গদ্য", "মাইকেল মধুসূদন দত্ত", "বঙ্কিমচন্দ্র চট্টোপাধ্যায়", "রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম"],
    "3": ["গুরুত্বপূর্ণ উপন্যাস ও চরিত্র", "বিখ্যাত নাটক ও নাট্যকার", "ছোটগল্প ও গল্পকার", "প্রবন্ধ ও সাময়িকী"],
    "4": ["সাহিত্যিকদের ছদ্মনাম ও উপাধি", "বিখ্যাত পঙ্ক্তি ও উক্তি", "বাংলা সাহিত্যের পত্রিকা ও সম্পাদক", "পুরস্কার ও পদক"]
  },
  english: {
    "1": ["Noun & Determiners", "Pronoun & Agreement", "Verb, Tense & Gerund", "Adjective & Comparison", "Adverb & Inversion", "Preposition Mastery", "Conjunctions"],
    "2": ["Sentence Types", "Voice Change", "Direct & Indirect Speech", "Conditional Sentences", "Clause Analysis"],
    "3": ["Synonyms & Antonyms", "Idioms & Phrases", "One Word Substitution", "Spelling & Corrections"],
    "4": ["Elizabethan Period", "Romantic Age", "Victorian Period", "Modern Age & Key Quotations"]
  }
};

function SubjectivePracticeCategoriesDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const examId = searchParams.get('examId');
  const subjectId = searchParams.get('subject');
  const chapterId = searchParams.get('chapterId') || searchParams.get('chapter');

  const [examsData, setExamsData] = useState(INITIAL_EXAMS);
  const [subjectsData, setSubjectsData] = useState(SUBJECTS_DATA);
  const [chaptersMap, setChaptersMap] = useState(CHAPTERS_BY_SUBJECT);
  const [topicsMap, setTopicsMap] = useState(CHAPTER_TOPICS);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showExamModal, setShowExamModal] = useState(false);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    id: '',
    title: '',
    category: 'bcs',
    categoryName: 'বিসিএস',
    tags: 'Live Exam, BCS',
    badgeColor: 'rose',
    onlineUsers: 42,
    borderColor: '#0284c7',
    description: '',
    subjectsText: ''
  });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    code: '',
    name: '',
    desc: '',
    chaptersCount: 4,
    color: '#006a4e'
  });

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [chapterForm, setChapterForm] = useState({
    id: '',
    title: '',
    desc: ''
  });

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicModalIdx, setTopicModalIdx] = useState(-1);
  const [topicModalText, setTopicModalText] = useState('');
  const [inlineNewTopic, setInlineNewTopic] = useState('');

  // Fetch initial config from API
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subjective/config', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.exams) && data.exams.length > 0) setExamsData(data.exams);
        if (Array.isArray(data.subjects) && data.subjects.length > 0) setSubjectsData(data.subjects);
        if (data.chapters && Object.keys(data.chapters).length > 0) setChaptersMap(data.chapters);
        if (data.topics && Object.keys(data.topics).length > 0) setTopicsMap(data.topics);
      }
    } catch (err) {
      console.error('Failed to load subjective practice config:', err);
      showTopAlert('কনফিগারেশন লোড করা সম্ভব হয়নি!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save Config to Server
  const saveConfig = async (
    newExams = examsData,
    newSubjects = subjectsData,
    newChapters = chaptersMap,
    newTopics = topicsMap
  ) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch('/api/subjective/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          exams: newExams,
          subjects: newSubjects,
          chapters: newChapters,
          topics: newTopics
        })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('সাবজেক্টিভ প্র্যাকটিস কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        setExamsData(newExams);
        setSubjectsData(newSubjects);
        setChaptersMap(newChapters);
        setTopicsMap(newTopics);
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

  // Exam Operations
  const handleOpenAddExam = () => {
    setIsEditingExam(false);
    setExamForm({
      id: `practice-exam-${Date.now().toString().slice(-4)}`,
      title: '',
      category: 'bcs',
      categoryName: 'বিসিএস',
      tags: 'Practice Exam, BCS',
      badgeColor: 'rose',
      onlineUsers: 40,
      borderColor: '#0284c7',
      description: '',
      subjectsText: ''
    });
    setShowExamModal(true);
  };

  const handleOpenEditExam = (eItem) => {
    setIsEditingExam(true);
    setExamForm({
      id: eItem.id,
      title: eItem.title || '',
      category: eItem.category || 'bcs',
      categoryName: eItem.categoryName || 'বিসিএস',
      tags: Array.isArray(eItem.tags) ? eItem.tags.join(', ') : (eItem.tags || ''),
      badgeColor: eItem.badgeColor || 'rose',
      onlineUsers: eItem.onlineUsers || 40,
      borderColor: eItem.borderColor || '#0284c7',
      description: eItem.description || '',
      subjectsText: eItem.subjectsText || ''
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
      onlineUsers: Number(examForm.onlineUsers) || 35
    };

    let updatedList;
    if (isEditingExam) {
      updatedList = examsData.map(x => x.id === examForm.id ? updatedExamObj : x);
    } else {
      updatedList = [updatedExamObj, ...examsData];
    }

    setShowExamModal(false);
    await saveConfig(updatedList, subjectsData, chaptersMap, topicsMap);
  };

  const handleDeleteExam = async (idToDelete) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই মডেল টেস্টটি মুছে ফেলতে চান?')) return;
    const updated = examsData.filter(x => x.id !== idToDelete);
    await saveConfig(updated, subjectsData, chaptersMap, topicsMap);
    if (examId === idToDelete) {
      router.push('/admin/subjective-all-mcqs-Practice-categories-dashbaord');
    }
  };

  // Subject Operations
  const handleOpenAddSubject = () => {
    setIsEditingSubject(false);
    setSubjectForm({
      id: `subj-${Date.now().toString().slice(-4)}`,
      code: 'SUBJECT',
      name: '',
      desc: '',
      chaptersCount: 4,
      color: '#006a4e'
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
      chaptersCount: sItem.chaptersCount || 4,
      color: sItem.theme?.color || '#006a4e'
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
      chaptersCount: Number(subjectForm.chaptersCount) || 4,
      theme: {
        color: subjectForm.color,
        gradient: `linear-gradient(135deg, ${subjectForm.color} 0%, ${subjectForm.color}cc 100%)`,
        lightBg: '#f8fafc',
        borderColor: '#e2e8f0',
        glowColor: `${subjectForm.color}22`
      }
    };

    let updatedList;
    if (isEditingSubject) {
      updatedList = subjectsData.map(s => s.id === subjectForm.id ? updatedSubjObj : s);
    } else {
      updatedList = [...subjectsData, updatedSubjObj];
      if (!chaptersMap[subjectForm.id]) {
        chaptersMap[subjectForm.id] = [...DEFAULT_CHAPTERS];
      }
    }

    setShowSubjectModal(false);
    await saveConfig(examsData, updatedList, chaptersMap, topicsMap);
  };

  const handleDeleteSubject = async (idToDelete) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই বিষয়টি মুছে ফেলতে চান?')) return;
    const updated = subjectsData.filter(s => s.id !== idToDelete);
    await saveConfig(examsData, updated, chaptersMap, topicsMap);
    if (subjectId === idToDelete) {
      router.push(`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${examId}`);
    }
  };

  // Chapter Operations
  const handleOpenAddChapter = () => {
    setIsEditingChapter(false);
    const currChapters = chaptersMap[subjectId] || [];
    setChapterForm({
      id: String(currChapters.length + 1),
      title: '',
      desc: ''
    });
    setShowChapterModal(true);
  };

  const handleOpenEditChapter = (ch) => {
    setIsEditingChapter(true);
    setChapterForm({
      id: String(ch.id),
      title: ch.title || '',
      desc: ch.desc || ''
    });
    setShowChapterModal(true);
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) {
      showTopAlert('অধ্যায়ের নাম আবশ্যক!', 'warning');
      return;
    }

    const currList = [...(chaptersMap[subjectId] || DEFAULT_CHAPTERS)];
    let updatedList;
    if (isEditingChapter) {
      updatedList = currList.map(c => String(c.id) === String(chapterForm.id) ? { ...c, title: chapterForm.title.trim(), desc: chapterForm.desc.trim() } : c);
    } else {
      updatedList = [...currList, { id: currList.length + 1, title: chapterForm.title.trim(), desc: chapterForm.desc.trim() }];
    }

    const updatedChaptersMap = { ...chaptersMap, [subjectId]: updatedList };
    const updatedSubjects = subjectsData.map(s => s.id === subjectId ? { ...s, chaptersCount: updatedList.length } : s);

    setShowChapterModal(false);
    await saveConfig(examsData, updatedSubjects, updatedChaptersMap, topicsMap);
  };

  const handleDeleteChapter = async (chId) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই অধ্যায়টি মুছে ফেলতে চান?')) return;
    const currList = chaptersMap[subjectId] || DEFAULT_CHAPTERS;
    const updatedList = currList.filter(c => String(c.id) !== String(chId));
    const updatedChaptersMap = { ...chaptersMap, [subjectId]: updatedList };
    const updatedSubjects = subjectsData.map(s => s.id === subjectId ? { ...s, chaptersCount: updatedList.length } : s);

    await saveConfig(examsData, updatedSubjects, updatedChaptersMap, topicsMap);
    if (chapterId === String(chId)) {
      router.push(`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${examId}&subject=${subjectId}`);
    }
  };

  // Topic Operations
  const getSubjectTopics = (sId, chKey) => {
    if (!topicsMap[sId]) return [];
    return topicsMap[sId][String(chKey)] || [];
  };

  const handleAddInlineTopic = async (sId, chKey) => {
    if (!inlineNewTopic.trim()) return;
    const currentList = getSubjectTopics(sId, chKey);
    const updated = [...currentList, inlineNewTopic.trim()];

    const updatedTopicsMap = {
      ...topicsMap,
      [sId]: {
        ...(topicsMap[sId] || {}),
        [String(chKey)]: updated
      }
    };

    setInlineNewTopic('');
    await saveConfig(examsData, subjectsData, chaptersMap, updatedTopicsMap);
  };

  const handleOpenEditTopic = (idx, text) => {
    setTopicModalIdx(idx);
    setTopicModalText(text);
    setShowTopicModal(true);
  };

  const handleSaveTopicModal = async (sId, chKey) => {
    if (!topicModalText.trim()) return;
    const currentList = getSubjectTopics(sId, chKey);
    let updated;
    if (topicModalIdx >= 0) {
      updated = currentList.map((t, i) => i === topicModalIdx ? topicModalText.trim() : t);
    } else {
      updated = [...currentList, topicModalText.trim()];
    }

    const updatedTopicsMap = {
      ...topicsMap,
      [sId]: {
        ...(topicsMap[sId] || {}),
        [String(chKey)]: updated
      }
    };

    setShowTopicModal(false);
    await saveConfig(examsData, subjectsData, chaptersMap, updatedTopicsMap);
  };

  const handleDeleteTopic = async (sId, chKey, idxToDelete) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই টপিকটি মুছে ফেলতে চান?')) return;
    const currentList = getSubjectTopics(sId, chKey);
    const updated = currentList.filter((_, i) => i !== idxToDelete);

    const updatedTopicsMap = {
      ...topicsMap,
      [sId]: {
        ...(topicsMap[sId] || {}),
        [String(chKey)]: updated
      }
    };

    await saveConfig(examsData, subjectsData, chaptersMap, updatedTopicsMap);
  };

  // Selected Entities
  const selectedExam = examsData.find(e => e.id === examId) || examsData[0];
  const selectedSubject = subjectsData.find(s => s.id === subjectId);
  const currentChapters = (chaptersMap && chaptersMap[subjectId]) || CHAPTERS_BY_SUBJECT[subjectId] || DEFAULT_CHAPTERS;

  let activeChapterObj = null;
  if (chapterId && currentChapters) {
    let decoded = '';
    try { decoded = decodeURIComponent(chapterId); } catch (e) { decoded = chapterId; }
    activeChapterObj = currentChapters.find(c => String(c.id) === String(chapterId) || toSlug(c.title) === toSlug(decoded) || c.title === decoded);
  }

  // Categories Filtering
  const categories = [
    { id: 'all', label: 'সকল', count: examsData.length },
    { id: 'bcs', label: 'বিসিএস', count: examsData.filter(e => e.category === 'bcs').length },
    { id: 'bank', label: 'ব্যাংক জব', count: examsData.filter(e => e.category === 'bank').length },
    { id: 'primary', label: 'প্রাইমারি শিক্ষক', count: examsData.filter(e => e.category === 'primary').length },
    { id: 'subject', label: 'গণিত ও আইসিটি', count: examsData.filter(e => e.category === 'subject').length }
  ];

  const filteredExams = examsData.filter(exam => {
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
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                SUBJECTIVE ALL MCQ CONTROL
              </span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                বিষয়ভিত্তিক অল এমসিকিউ প্র্যাকটিস ক্যাটাগরি ড্যাশবোর্ড
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              এখানে সংরক্ষিত পরিবর্তনসমূহ সরাসরি <span style={{ color: '#059669', fontWeight: 600 }}>/subjective-all-mcqs-Practice-success</span> পেজে দৃশ্যমান হবে।
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/subjective-all-mcqs-Practice-success"
              target="_blank"
              style={{
                backgroundColor: '#f8fafc',
                color: '#059669',
                border: '1px solid #a7f3d0',
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
              href="/admin/subjective-all-mcqs-dashabord"
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
              <i className="fa-solid fa-file-circle-question"></i>
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
            <Link href="/admin/subjective-all-mcqs-Practice-categories-dashbaord" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>
              মডেল টেস্ট তালিকা
            </Link>
            {examId && selectedExam && (
              <>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>/</span>
                <Link href={`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${selectedExam.id}`} style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>
                  {selectedExam.title}
                </Link>
              </>
            )}
            {examId && subjectId && selectedSubject && (
              <>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>/</span>
                <Link href={`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${selectedExam.id}&subject=${selectedSubject.id}`} style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>
                  {selectedSubject.name}
                </Link>
              </>
            )}
            {examId && subjectId && activeChapterObj && (
              <>
                <span style={{ margin: '0 8px', color: '#94a3b8' }}>/</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{activeChapterObj.title}</span>
              </>
            )}
          </div>

          {examId && (
            <button
              onClick={() => {
                if (activeChapterObj) {
                  router.push(`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${examId}&subject=${subjectId}`);
                } else if (subjectId) {
                  router.push(`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${examId}`);
                } else {
                  router.push('/admin/subjective-all-mcqs-Practice-categories-dashbaord');
                }
              }}
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
              <span>পূর্ববর্তী ধাপে ফিরুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div style={{ maxWidth: '1350px', margin: '24px auto 0', padding: '0 20px' }}>

        {/* ------------------------------------------------------------- */}
        {/* LEVEL 4: TOPICS UNDER SELECTED CHAPTER */}
        {/* ------------------------------------------------------------- */}
        {examId && subjectId && activeChapterObj ? (
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
                  backgroundColor: selectedSubject?.theme?.color || '#006a4e',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 12px',
                  borderRadius: '20px',
                  marginBottom: '8px'
                }}>
                  {selectedSubject?.code} • অধ্যায় {toBanglaNumber(activeChapterObj.id)}
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {activeChapterObj.title} — টপিকসমূহ
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.92rem' }}>
                  {activeChapterObj.desc}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleOpenEditChapter(activeChapterObj)}
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
                  অধ্যায় এডিট করুন
                </button>
              </div>
            </div>

            {/* Inline Add Topic Box */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '16px 20px',
              border: '1px dashed #cbd5e1',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <input
                type="text"
                value={inlineNewTopic}
                onChange={(e) => setInlineNewTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInlineTopic(subjectId, activeChapterObj.id);
                  }
                }}
                placeholder="নতুন টপিকের নাম লিখুন এবং 'যোগ করুন' বাটনে চাপুন..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleAddInlineTopic(subjectId, activeChapterObj.id)}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-plus"></i>
                <span>যোগ করুন</span>
              </button>
            </div>

            {/* Topics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
              {getSubjectTopics(subjectId, activeChapterObj.id).map((topic, idx) => {
                const catSlug = `${selectedExam.categoryName} > ${selectedExam.title} > ${selectedSubject.name} > ${activeChapterObj.title} > ${topic}`.trim().replace(/\s+/g, '-');
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                        টপিক #{idx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                        {topic}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        href={`/admin/subjective-all-mcqs-dashabord?category=${encodeURIComponent(catSlug)}`}
                        style={{
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                        title="প্রশ্ন পরিচালনা করুন"
                      >
                        <i className="fa-solid fa-list-check"></i>
                      </Link>

                      <button
                        onClick={() => handleOpenEditTopic(idx, topic)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="টপিক এডিট"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>

                      <button
                        onClick={() => handleDeleteTopic(subjectId, activeChapterObj.id, idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="টপিক মুছুন"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : examId && subjectId && selectedSubject ? (

          /* ------------------------------------------------------------- */
          /* LEVEL 3: CHAPTERS LIST UNDER SELECTED SUBJECT */
          /* ------------------------------------------------------------- */
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
                  {selectedSubject.name} — অধ্যায়সমূহ
                </h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.92rem' }}>
                  {selectedExam.title} • মোট অধ্যায়: {toBanglaNumber(currentChapters.length)} টি
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
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
                  বিষয় এডিট
                </button>

                <button
                  onClick={handleOpenAddChapter}
                  style={{
                    backgroundColor: '#059669',
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
                  নতুন অধ্যায় যোগ করুন
                </button>
              </div>
            </div>

            {/* Chapters Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
              {currentChapters.map(ch => {
                const topicsCount = getSubjectTopics(subjectId, ch.id).length;
                return (
                  <div
                    key={ch.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          অধ্যায় {toBanglaNumber(ch.id)}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditChapter(ch)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                            title="অধ্যায় এডিট"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteChapter(ch.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="অধ্যায় মুছুন"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                        {ch.title}
                      </h3>

                      <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                        {ch.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                        টপিক সংখ্যা: {toBanglaNumber(topicsCount)} টি
                      </span>

                      <button
                        onClick={() => router.push(`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${selectedExam.id}&subject=${selectedSubject.id}&chapterId=${encodeURIComponent(toSlug(ch.title))}`)}
                        style={{
                          backgroundColor: '#059669',
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
                        <span>টপিক পরিচালনা</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
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
            {/* Exam Overview Card */}
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
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {selectedExam.categoryName}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                      <i className="fa-solid fa-circle" style={{ fontSize: '0.55rem', marginRight: '4px' }}></i>
                      {toBanglaNumber(selectedExam.onlineUsers || 40)} জন পরীক্ষার্থী অনুশীলনরত
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                    {selectedExam.title}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 14px 0', lineHeight: '1.6' }}>
                    {selectedExam.description}
                  </p>
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
                      backgroundColor: '#059669',
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
                বিষয়সমূহ ({toBanglaNumber(subjectsData.length)})
              </h3>
            </div>

            {/* Subjects Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {subjectsData.map(subj => {
                const themeColor = subj.theme?.color || '#006a4e';
                const chCount = (chaptersMap[subj.id] || []).length || subj.chaptersCount || 4;
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
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                          title="এডিট"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subj.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
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
                        {subj.desc || 'অধ্যায়ভিত্তিক প্রশ্নাবলি ও প্র্যাকটিস সেট।'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                          অধ্যায়: {toBanglaNumber(chCount)} টি
                        </span>

                        <button
                          onClick={() => router.push(`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${selectedExam.id}&subject=${subj.id}`)}
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
                          <span>অধ্যায়সমূহ দেখুন</span>
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
                        border: isActive ? '1px solid #059669' : '1px solid #e2e8f0',
                        backgroundColor: isActive ? '#059669' : '#ffffff',
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
                    backgroundColor: '#059669',
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
                  <span>নতুন টেস্ট যোগ করুন</span>
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
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
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
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px 4px' }}
                            title="এডিট"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 4px' }}
                            title="মুছে ফেলুন"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {exam.title}
                      </h3>

                      <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                        {exam.description}
                      </p>

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
                    </div>

                    <button
                      onClick={() => router.push(`/admin/subjective-all-mcqs-Practice-categories-dashbaord?examId=${exam.id}`)}
                      style={{
                        backgroundColor: '#059669',
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
                      <span>বিষয় ও অধ্যায় পরিচালনা</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditingExam ? 'পরীক্ষা এডিট করুন' : 'নতুন পরীক্ষা যোগ করুন'}
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
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    ক্যাটাগরি কি
                  </label>
                  <select
                    value={examForm.category}
                    onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="bcs">bcs (বিসিএস)</option>
                    <option value="bank">bank (ব্যাংক)</option>
                    <option value="primary">primary (প্রাইমারি)</option>
                    <option value="subject">subject (গণিত ও আইসিটি)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    ক্যাটাগরি নাম
                  </label>
                  <input
                    type="text"
                    value={examForm.categoryName}
                    onChange={(e) => setExamForm({ ...examForm, categoryName: e.target.value })}
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
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    অনলাইন পরীক্ষার্থী সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={examForm.onlineUsers}
                    onChange={(e) => setExamForm({ ...examForm, onlineUsers: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

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
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
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
                    আইডি (যেমন: bangla)
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
                  বিষয়ের নাম
                </label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  বিবরণ
                </label>
                <textarea
                  rows={2}
                  value={subjectForm.desc}
                  onChange={(e) => setSubjectForm({ ...subjectForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  থিম কালার
                </label>
                <input
                  type="color"
                  value={subjectForm.color}
                  onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '2px 4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CHAPTER MODAL (CREATE / EDIT) */}
      {/* ------------------------------------------------------------- */}
      {showChapterModal && (
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
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditingChapter ? 'অধ্যায় এডিট করুন' : 'নতুন অধ্যায় যোগ করুন'}
              </h3>
              <button
                onClick={() => setShowChapterModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveChapter} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  অধ্যায়ের শিরোনাম (Title)
                </label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  placeholder="যেমন: বাংলা ভাষা ও ব্যাকরণ"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  অধ্যায়ের বিবরণ ও সিলেবাস
                </label>
                <textarea
                  rows={3}
                  value={chapterForm.desc}
                  onChange={(e) => setChapterForm({ ...chapterForm, desc: e.target.value })}
                  placeholder="অধ্যায়ের মূল টপিকসমূহের বিবরণ..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TOPIC EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showTopicModal && (
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
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                টপিক এডিট করুন
              </h3>
              <button
                onClick={() => setShowTopicModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  টপিকের নাম
                </label>
                <input
                  type="text"
                  value={topicModalText}
                  onChange={(e) => setTopicModalText(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveTopicModal(subjectId, activeChapterObj?.id)}
                  style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SubjectivePracticeCategoriesDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>লোড হচ্ছে...</div>}>
      <SubjectivePracticeCategoriesDashboardContent />
    </Suspense>
  );
}
