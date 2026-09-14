'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';

// Default Fallback Data (mirroring SubjectiveModelTestClient.jsx)
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
  },
  {
    id: "bangladesh",
    code: "BANGLADESH AFFAIRS",
    name: "বাংলাদেশ বিষয়াবলি",
    desc: "ইতিহাস, মুক্তিযুদ্ধ, সংবিধান ও অর্থনীতি",
    chaptersCount: 4,
    theme: {
      color: "#059669",
      gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      lightBg: "#ecfdf5",
      borderColor: "#a7f3d0",
      glowColor: "rgba(5, 150, 105, 0.12)"
    }
  },
  {
    id: "international",
    code: "INTERNATIONAL AFFAIRS",
    name: "আন্তর্জাতিক বিষয়াবলি",
    desc: "আন্তর্জাতিক সংস্থা, বিশ্ব রাজনীতি ও বৈশ্বিক ইতিহাস",
    chaptersCount: 4,
    theme: {
      color: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
      lightBg: "#eff6ff",
      borderColor: "#bfdbfe",
      glowColor: "rgba(37, 99, 235, 0.12)"
    }
  },
  {
    id: "science",
    code: "GENERAL SCIENCE",
    name: "সাধারণ বিজ্ঞান",
    desc: "দৈনন্দিন বিজ্ঞান, পদার্থ, রসায়ন ও জীববিদ্যা",
    chaptersCount: 4,
    theme: {
      color: "#0d9488",
      gradient: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
      lightBg: "#f0fdfa",
      borderColor: "#99f6e4",
      glowColor: "rgba(13, 148, 136, 0.12)"
    }
  },
  {
    id: "computer",
    code: "COMPUTER & IT",
    name: "কম্পিউটার ও তথ্যপ্রযুক্তি",
    desc: "হার্ডওয়্যার, নেটওয়ার্ক, ইন্টারনেট ও সাইবার নিরাপত্তা",
    chaptersCount: 4,
    theme: {
      color: "#4f46e5",
      gradient: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
      lightBg: "#eef2ff",
      borderColor: "#c7d2fe",
      glowColor: "rgba(79, 70, 229, 0.12)"
    }
  },
  {
    id: "mental",
    code: "MENTAL ABILITY",
    name: "মানসিক দক্ষতা",
    desc: "যৌক্তিক যুক্তি, স্থানিক বিশ্লেষণ ও সমস্যা সমাধান",
    chaptersCount: 4,
    theme: {
      color: "#db2777",
      gradient: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
      lightBg: "#fdf2f8",
      borderColor: "#fbcfe8",
      glowColor: "rgba(219, 39, 119, 0.12)"
    }
  },
  {
    id: "geography",
    code: "GEOGRAPHY & ENVIRONMENT",
    name: "ভূগোল ও পরিবেশ",
    desc: "বাংলাদেশ ও বৈশ্বিক ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা",
    chaptersCount: 4,
    theme: {
      color: "#ea580c",
      gradient: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
      lightBg: "#fff7ed",
      borderColor: "#fed7aa",
      glowColor: "rgba(234, 88, 12, 0.12)"
    }
  },
  {
    id: "ethics",
    code: "ETHICS & GOVERNANCE",
    name: "নৈতিকতা ও সুশাসন",
    desc: "নৈতিক মূল্যবোধ, জাতীয় সদাচার ও সুশাসনের ভিত্তি",
    chaptersCount: 4,
    theme: {
      color: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
      lightBg: "#e0e7ff",
      borderColor: "#c7d2fe",
      glowColor: "rgba(99, 102, 241, 0.12)"
    }
  },
  {
    id: "literature",
    code: "BANGLA LITERATURE",
    name: "বাংলা সাহিত্য স্পেশাল",
    desc: "প্রাচীন, মধ্য ও আধুনিক যুগের কবি-সাহিত্যিকদের বিশদ প্রস্তুতি",
    chaptersCount: 4,
    theme: {
      color: "#b45309",
      gradient: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
      lightBg: "#fef3c7",
      borderColor: "#fde68a",
      glowColor: "rgba(180, 83, 9, 0.12)"
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
    1: ["মৌর্য ও গুপ্ত সাম্রাজ্য", "প্রাচীন বাংলার জনপদ", "শশাঙ্ক ও পাল রাজবংশ"],
    2: ["সুলতানি আমল ও বারো ভুঁইয়া", "মুঘল সুবাদারি আমল", "নবাব আলীবর্দী ও সিরাজউদ্দৌলা"],
    3: ["পলাশীর যুদ্ধ ১৭৫৭", "সিপাহী বিদ্রোহ ১৮৫৭", "বঙ্গভঙ্গ ১৯০৫"],
    4: ["ভাষা আন্দোলন ১৯৫২", "আন্তর্জাতিক মাতৃভাষা দিবস"]
  }
};

function AdminSubjectModelCategoriesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const examId = searchParams.get('examId');
  const subjectId = searchParams.get('subject');
  const chapterId = searchParams.get('chapterId') || searchParams.get('chapter');

  // Config Data States
  const [examsData, setExamsData] = useState(INITIAL_EXAMS);
  const [subjectsData, setSubjectsData] = useState(SUBJECTS_DATA);
  const [chaptersMap, setChaptersMap] = useState(CHAPTERS_BY_SUBJECT);
  const [topicsMap, setTopicsMap] = useState(CHAPTER_TOPICS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter
  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals States
  // 1. Exam Modal
  const [showExamModal, setShowExamModal] = useState(false);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    id: '',
    title: '',
    category: 'bcs',
    categoryName: 'বিসিএস',
    tags: 'Live Exam, BCS',
    badgeColor: 'rose',
    onlineUsers: 40,
    borderColor: '#0284c7',
    description: '',
    subjectsText: ''
  });

  // 2. Subject Modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    code: '',
    name: '',
    desc: '',
    chaptersCount: 4,
    color: '#006a4e',
    lightBg: '#f0fdf4',
    borderColor: '#bbf7d0'
  });

  // 3. Chapter Modal
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [chapterForm, setChapterForm] = useState({
    id: '',
    title: '',
    desc: ''
  });

  // 4. Topic Modal & Inline Topic Input
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicModalIdx, setTopicModalIdx] = useState(-1);
  const [topicModalText, setTopicModalText] = useState('');
  const [inlineNewTopic, setInlineNewTopic] = useState('');

  // Fetch live configuration from API
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subjective-model-test/config', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.exams) && data.exams.length > 0) setExamsData(data.exams);
        if (Array.isArray(data.subjects) && data.subjects.length > 0) setSubjectsData(data.subjects);
        if (data.chapters && Object.keys(data.chapters).length > 0) setChaptersMap(data.chapters);
        if (data.topics && Object.keys(data.topics).length > 0) setTopicsMap(data.topics);
      }
    } catch (err) {
      console.error('Failed to load subjective model test config:', err);
      showTopAlert('কনফিগারেশন লোড করা সম্ভব হয়নি!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save config function (POST to API)
  const saveConfig = async (newExams, newSubjects, newChapters, newTopics) => {
    setIsSaving(true);
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('quiz_token')) : '';
    try {
      const payload = {
        exams: newExams !== undefined ? newExams : examsData,
        subjects: newSubjects !== undefined ? newSubjects : subjectsData,
        chapters: newChapters !== undefined ? newChapters : chaptersMap,
        topics: newTopics !== undefined ? newTopics : topicsMap
      };

      const res = await fetch('/api/subjective-model-test/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        showTopAlert('🎉 পরিবর্তনসমূহ সফলভাবে সংরক্ষিত ও আপডেট হয়েছে!', 'success');
        if (result.exams) setExamsData(result.exams);
        if (result.subjects) setSubjectsData(result.subjects);
        if (result.chapters) setChaptersMap(result.chapters);
        if (result.topics) setTopicsMap(result.topics);
        return true;
      } else {
        showTopAlert(`❌ সংরক্ষণ ব্যর্থ হয়েছে: ${result.error}`, 'danger');
        return false;
      }
    } catch (err) {
      console.error('Save error:', err);
      showTopAlert('❌ সার্ভার সংযোগে সমস্যা হয়েছে!', 'danger');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // Level 1: Exam Handlers
  // -------------------------------------------------------------
  const handleOpenNewExam = () => {
    setIsEditingExam(false);
    setExamForm({
      id: `exam-${Date.now()}`,
      title: '',
      category: 'bcs',
      categoryName: 'বিসিএস',
      tags: 'Live Exam, BCS',
      badgeColor: 'rose',
      onlineUsers: 40,
      borderColor: '#0284c7',
      description: '',
      subjectsText: ''
    });
    setShowExamModal(true);
  };

  const handleOpenEditExam = (e, exam) => {
    e.stopPropagation();
    setIsEditingExam(true);
    setExamForm({
      id: exam.id,
      title: exam.title || '',
      category: exam.category || 'bcs',
      categoryName: exam.categoryName || 'বিসিএস',
      tags: Array.isArray(exam.tags) ? exam.tags.join(', ') : (exam.tags || ''),
      badgeColor: exam.badgeColor || 'rose',
      onlineUsers: exam.onlineUsers || 40,
      borderColor: exam.borderColor || '#0284c7',
      description: exam.description || '',
      subjectsText: exam.subjectsText || ''
    });
    setShowExamModal(true);
  };

  const handleSaveExamSubmit = async (e) => {
    e.preventDefault();
    if (!examForm.title.trim()) {
      showTopAlert('দয়া করে মডেল টেস্টের নাম লিখুন!', 'warning');
      return;
    }

    const tagsArr = examForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const updatedExamItem = {
      ...examForm,
      tags: tagsArr.length > 0 ? tagsArr : ['Model Test']
    };

    let nextExams = [];
    if (isEditingExam) {
      nextExams = examsData.map(item => item.id === examForm.id ? updatedExamItem : item);
    } else {
      nextExams = [updatedExamItem, ...examsData];
    }

    const ok = await saveConfig(nextExams);
    if (ok) setShowExamModal(false);
  };

  const handleDeleteExam = async (e, id, title) => {
    e.stopPropagation();
    const confirmed = await showTopAlert(`আপনি কি "${title}" মডেল টেস্টটি মুছে ফেলতে চান?`, 'warning', true);
    if (!confirmed) return;

    const nextExams = examsData.filter(item => item.id !== id);
    await saveConfig(nextExams);
  };

  // -------------------------------------------------------------
  // Level 2: Subject Handlers
  // -------------------------------------------------------------
  const handleOpenNewSubject = () => {
    setIsEditingSubject(false);
    setSubjectForm({
      id: `sub-${Date.now()}`,
      code: 'NEW_SUBJECT',
      name: '',
      desc: '',
      chaptersCount: 4,
      color: '#006a4e',
      lightBg: '#f0fdf4',
      borderColor: '#bbf7d0'
    });
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (e, sub) => {
    e.stopPropagation();
    setIsEditingSubject(true);
    setSubjectForm({
      id: sub.id,
      code: sub.code || '',
      name: sub.name || '',
      desc: sub.desc || '',
      chaptersCount: sub.chaptersCount || 4,
      color: sub.theme?.color || '#006a4e',
      lightBg: sub.theme?.lightBg || '#f0fdf4',
      borderColor: sub.theme?.borderColor || '#bbf7d0'
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      showTopAlert('দয়া করে বিষয়ের নাম লিখুন!', 'warning');
      return;
    }

    const updatedSub = {
      id: subjectForm.id.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      code: (subjectForm.code || subjectForm.name).toUpperCase(),
      name: subjectForm.name,
      desc: subjectForm.desc,
      chaptersCount: Number(subjectForm.chaptersCount) || 4,
      theme: {
        color: subjectForm.color,
        gradient: `linear-gradient(135deg, ${subjectForm.color} 0%, ${adjustColor(subjectForm.color, 25)} 100%)`,
        lightBg: subjectForm.lightBg,
        borderColor: subjectForm.borderColor,
        glowColor: `${subjectForm.color}20`
      }
    };

    let nextSubjects = [];
    if (isEditingSubject) {
      nextSubjects = subjectsData.map(item => item.id === subjectForm.id ? updatedSub : item);
    } else {
      nextSubjects = [...subjectsData, updatedSub];
      // initialize default chapters if missing
      if (!chaptersMap[updatedSub.id]) {
        chaptersMap[updatedSub.id] = DEFAULT_CHAPTERS;
      }
    }

    const ok = await saveConfig(undefined, nextSubjects, chaptersMap);
    if (ok) setShowSubjectModal(false);
  };

  const handleDeleteSubject = async (e, id, name) => {
    e.stopPropagation();
    const confirmed = await showTopAlert(`আপনি কি "${name}" বিষয়টি মুছে ফেলতে চান?`, 'warning', true);
    if (!confirmed) return;

    const nextSubjects = subjectsData.filter(s => s.id !== id);
    await saveConfig(undefined, nextSubjects);
  };

  // Helper for color gradient adjustment
  function adjustColor(hex, lum = 20) {
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    let rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * (lum / 100))), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }
    return rgb;
  }

  // -------------------------------------------------------------
  // Level 3: Chapter Handlers
  // -------------------------------------------------------------
  const handleOpenNewChapter = () => {
    setIsEditingChapter(false);
    const currList = (chaptersMap && chaptersMap[subjectId]) || CHAPTERS_BY_SUBJECT[subjectId] || DEFAULT_CHAPTERS;
    setChapterForm({
      id: currList.length + 1,
      title: '',
      desc: ''
    });
    setShowChapterModal(true);
  };

  const handleOpenEditChapter = (e, ch) => {
    e.stopPropagation();
    setIsEditingChapter(true);
    setChapterForm({
      id: ch.id,
      title: ch.title || '',
      desc: ch.desc || ''
    });
    setShowChapterModal(true);
  };

  const handleSaveChapterSubmit = async (e) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) {
      showTopAlert('দয়া করে অধ্যায়ের নাম লিখুন!', 'warning');
      return;
    }

    const currList = (chaptersMap && chaptersMap[subjectId]) ? [...chaptersMap[subjectId]] : [...(CHAPTERS_BY_SUBJECT[subjectId] || DEFAULT_CHAPTERS)];
    let nextList = [];

    if (isEditingChapter) {
      nextList = currList.map(item => String(item.id) === String(chapterForm.id) ? { ...item, ...chapterForm } : item);
    } else {
      nextList = [...currList, { ...chapterForm, id: Number(chapterForm.id) || (currList.length + 1) }];
    }

    const nextChaptersMap = {
      ...chaptersMap,
      [subjectId]: nextList
    };

    // Update subject's chapter count
    const nextSubjects = subjectsData.map(s => s.id === subjectId ? { ...s, chaptersCount: nextList.length } : s);

    const ok = await saveConfig(undefined, nextSubjects, nextChaptersMap);
    if (ok) setShowChapterModal(false);
  };

  const handleDeleteChapter = async (e, chId, title) => {
    e.stopPropagation();
    const confirmed = await showTopAlert(`আপনি কি "${title}" অধ্যায়টি মুছে ফেলতে চান?`, 'warning', true);
    if (!confirmed) return;

    const currList = (chaptersMap && chaptersMap[subjectId]) ? [...chaptersMap[subjectId]] : [...(CHAPTERS_BY_SUBJECT[subjectId] || DEFAULT_CHAPTERS)];
    const nextList = currList.filter(c => String(c.id) !== String(chId));

    const nextChaptersMap = {
      ...chaptersMap,
      [subjectId]: nextList
    };

    const nextSubjects = subjectsData.map(s => s.id === subjectId ? { ...s, chaptersCount: nextList.length } : s);
    await saveConfig(undefined, nextSubjects, nextChaptersMap);
  };

  // -------------------------------------------------------------
  // Level 4: Topic Handlers
  // -------------------------------------------------------------
  const getCurrentChapterObj = () => {
    const chaptersList = (chaptersMap && chaptersMap[subjectId]) || CHAPTERS_BY_SUBJECT[subjectId] || DEFAULT_CHAPTERS;
    let decoded = '';
    try {
      decoded = chapterId ? decodeURIComponent(chapterId) : '';
    } catch (e) {
      decoded = chapterId || '';
    }
    return chaptersList.find(c =>
      String(c.id) === String(chapterId) ||
      toSlug(c.title) === toSlug(decoded) ||
      toSlug(c.title) === toSlug(chapterId) ||
      c.title === chapterId ||
      c.title === decoded ||
      encodeURIComponent(c.title) === chapterId
    ) || chaptersList[0] || { id: 1, title: 'অধ্যায় ০১' };
  };

  const getCurrentTopicsList = () => {
    const currentCh = getCurrentChapterObj();
    const subjectTopics = (topicsMap && topicsMap[subjectId]) || CHAPTER_TOPICS[subjectId] || {};
    return subjectTopics[currentCh.id] || subjectTopics[String(currentCh.id)] || subjectTopics[chapterId] || [currentCh.title];
  };

  const handleAddInlineTopic = async (e) => {
    e.preventDefault();
    if (!inlineNewTopic.trim()) {
      showTopAlert('দয়া করে টপিকের নাম লিখুন!', 'warning');
      return;
    }

    const currentCh = getCurrentChapterObj();
    const currTopics = getCurrentTopicsList();
    const nextTopicsList = [...currTopics, inlineNewTopic.trim()];

    const nextTopicsMap = {
      ...topicsMap,
      [subjectId]: {
        ...((topicsMap && topicsMap[subjectId]) || {}),
        [currentCh.id]: nextTopicsList
      }
    };

    const ok = await saveConfig(undefined, undefined, undefined, nextTopicsMap);
    if (ok) {
      setInlineNewTopic('');
    }
  };

  const handleOpenEditTopic = (e, idx, topicText) => {
    e.stopPropagation();
    setTopicModalIdx(idx);
    setTopicModalText(topicText);
    setShowTopicModal(true);
  };

  const handleSaveTopicSubmit = async (e) => {
    e.preventDefault();
    if (!topicModalText.trim()) {
      showTopAlert('দয়া করে টপিকের নাম লিখুন!', 'warning');
      return;
    }

    const currentCh = getCurrentChapterObj();
    const currTopics = getCurrentTopicsList();
    const nextTopicsList = currTopics.map((t, i) => i === topicModalIdx ? topicModalText.trim() : t);

    const nextTopicsMap = {
      ...topicsMap,
      [subjectId]: {
        ...((topicsMap && topicsMap[subjectId]) || {}),
        [currentCh.id]: nextTopicsList
      }
    };

    const ok = await saveConfig(undefined, undefined, undefined, nextTopicsMap);
    if (ok) setShowTopicModal(false);
  };

  const handleDeleteTopic = async (e, idx, topicText) => {
    e.stopPropagation();
    const confirmed = await showTopAlert(`আপনি কি "${topicText}" টপিকটি মুছে ফেলতে চান?`, 'warning', true);
    if (!confirmed) return;

    const currentCh = getCurrentChapterObj();
    const currTopics = getCurrentTopicsList();
    const nextTopicsList = currTopics.filter((_, i) => i !== idx);

    const nextTopicsMap = {
      ...topicsMap,
      [subjectId]: {
        ...((topicsMap && topicsMap[subjectId]) || {}),
        [currentCh.id]: nextTopicsList
      }
    };

    await saveConfig(undefined, undefined, undefined, nextTopicsMap);
  };

  // Selected Exam & Subject helper objects
  const selectedExam = examsData.find(e => e.id === examId) || examsData[0] || INITIAL_EXAMS[0];
  const selectedSubject = subjectsData.find(s => s.id === subjectId);

  const categories = [
    { id: 'all', label: 'সকল', count: examsData.length },
    { id: 'bcs', label: 'বিসিএস', count: examsData.filter(e => e.category === 'bcs').length },
    { id: 'bank', label: 'ব্যাংক জব', count: examsData.filter(e => e.category === 'bank').length },
    { id: 'primary', label: 'প্রাথমিক শিক্ষক', count: examsData.filter(e => e.category === 'primary').length },
    { id: 'subject', label: 'পূর্ণাঙ্গ মডেল টেস্ট', count: examsData.filter(e => e.category === 'subject').length }
  ];

  const filteredExams = examsData.filter(exam => {
    const matchCat = currentCat === 'all' || exam.category === currentCat;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchCat;

    const matchTitle = (exam.title || '').toLowerCase().includes(q);
    const matchDesc = (exam.description || '').toLowerCase().includes(q);
    const matchCatName = (exam.categoryName || '').toLowerCase().includes(q);
    const matchSubjects = (exam.subjectsText || '').toLowerCase().includes(q);
    const matchTags = ((exam.tags && Array.isArray(exam.tags)) ? exam.tags : [exam.badge || '']).some(tag => (tag || '').toLowerCase().includes(q));

    return matchCat && (matchTitle || matchDesc || matchCatName || matchSubjects || matchTags);
  });

  // Top Admin Mode Bar
  const renderAdminTopBar = () => (
    <div style={{
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '12px 20px',
      borderBottom: '2px solid #0284c7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      fontSize: '0.9rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          backgroundColor: '#0284c7',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.78rem',
          padding: '4px 10px',
          borderRadius: '6px',
          letterSpacing: '0.8px',
          textTransform: 'uppercase'
        }}>
          Admin Panel
        </span>
        <span style={{ fontWeight: 600, color: '#93c5fd' }}>
          বিষয়ভিত্তিক মডেল টেস্ট ক্যাটাগরি ও সিলেবাস ম্যানেজমেন্ট ড্যাশবোর্ড
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isSaving && (
          <span style={{ color: '#f59e0b', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-spinner fa-spin"></i> সেভ হচ্ছে...
          </span>
        )}
        <Link
          href="/subjective-model-test"
          target="_blank"
          style={{
            backgroundColor: '#1e293b',
            color: '#38bdf8',
            border: '1px solid #334155',
            padding: '6px 14px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>পাবলিক ভিউ দেখুন</span>
          <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.75rem' }}></i>
        </Link>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // VIEW 4: TOPICS OF SELECTED CHAPTER (Admin View)
  // -------------------------------------------------------------
  if (examId && subjectId && chapterId && selectedSubject) {
    const currentChapter = getCurrentChapterObj();
    const topicsList = getCurrentTopicsList();

    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 100px)', paddingBottom: '80px' }}>
        {renderAdminTopBar()}

        {/* Full-width Chapter Banner Header */}
        <div style={{
          width: '100%',
          backgroundImage: "url('/images/chapter-banner-bg.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundColor: '#daf9e2',
          borderBottom: '1px solid #bbf7d0',
          padding: '24px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="container" style={{
            maxWidth: '1300px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ flex: '1 1 500px', zIndex: 1 }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.78rem',
                letterSpacing: '1.2px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#ffffff',
                backgroundColor: selectedSubject?.theme?.color || '#006a4e',
                padding: '5px 18px',
                borderRadius: '20px',
                marginBottom: '10px',
                boxShadow: '0 2px 8px rgba(0, 106, 78, 0.25)'
              }}>
                {selectedSubject.code} • অধ্যায় {toBanglaNumber(currentChapter.id)}
              </span>
              <h1 style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                margin: '4px 0 10px',
                color: '#064e3b',
                letterSpacing: '-0.5px',
                lineHeight: '1.2'
              }}>
                {currentChapter.title}
              </h1>
              <p style={{
                fontSize: '1.02rem',
                color: '#064e3b',
                margin: 0,
                fontWeight: 600,
                lineHeight: '1.6'
              }}>
                {currentChapter.desc || `${toBanglaNumber(topicsList.length)} টি টপিক — টপিক এডিট করুন অথবা নতুন টপিক যোগ করুন।`}
              </p>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <img
                src="/images/chapter-banner-graphic.png"
                alt="Chapter Graphic"
                style={{ height: '145px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
        </div>

        {/* Sub-header / Breadcrumb Bar */}
        <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
          <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/admin/subject-model-categories-dashbaord" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>বিষয়ভিত্তিক মডেল টেস্ট</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/admin/subject-model-categories-dashbaord?examId=${selectedExam.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{selectedExam.title}</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/admin/subject-model-categories-dashbaord?examId=${selectedExam.id}&subject=${selectedSubject.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{selectedSubject.name}</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{currentChapter.title}</span>
            </div>

            <button
              onClick={() => router.push(`/admin/subject-model-categories-dashbaord?examId=${selectedExam.id}&subject=${selectedSubject.id}`)}
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
              <span>অধ্যায় তালিকায় ফিরে যান</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Topics Management Section */}
        <div className="container" style={{ maxWidth: '1300px', margin: '35px auto 0', padding: '0 20px' }}>
          {/* Header with Inline Topic Creator */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                টপিকসমূহ ({toBanglaNumber(topicsList.length)})
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0' }}>
                টপিকের নাম পরিবর্তন করতে "এডিট" বাটন চাপুন অথবা নতুন টপিক যোগ করুন।
              </p>
            </div>

            {/* Quick Add Topic Form */}
            <form onSubmit={handleAddInlineTopic} style={{ display: 'flex', gap: '8px', flex: '0 1 420px', width: '100%' }}>
              <input
                type="text"
                value={inlineNewTopic}
                onChange={(e) => setInlineNewTopic(e.target.value)}
                placeholder="নতুন টপিকের নাম লিখুন..."
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <i className="fa-solid fa-plus"></i>
                <span>টপিক যোগ করুন</span>
              </button>
            </form>
          </div>

          {/* Topics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {topicsList.map((top, idx) => {
              const globalIdx = idx + 1;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = selectedSubject?.theme?.color || '#0284c7';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    {/* Number Box */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: selectedSubject?.theme?.lightBg || '#f0f9ff',
                        color: selectedSubject?.theme?.color || '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}
                    >
                      {globalIdx}
                    </div>

                    {/* Topic Title */}
                    <span style={{
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      fontWeight: 700,
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {top}
                    </span>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => handleOpenEditTopic(e, idx, top)}
                      title="টপিক এডিট করুন"
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#0284c7',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                      <span>এডিট</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteTopic(e, idx, top)}
                      title="টপিক মুছুন"
                      style={{
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Edit Modal */}
        {renderTopicModal()}
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: CHAPTERS OF SELECTED SUBJECT (Admin View)
  // -------------------------------------------------------------
  if (examId && subjectId && selectedSubject) {
    const chaptersList = (chaptersMap && chaptersMap[subjectId]) || CHAPTERS_BY_SUBJECT[subjectId] || DEFAULT_CHAPTERS;

    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 100px)', paddingBottom: '80px' }}>
        {renderAdminTopBar()}

        {/* Full-width Illustrated Subject Banner Header */}
        <div style={{
          width: '100%',
          backgroundImage: "url('/images/subject-banner-bg.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundColor: '#e6f4ea',
          borderBottom: '1px solid #cbf0d7',
          padding: '24px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="container" style={{
            maxWidth: '1300px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ flex: '1 1 500px', zIndex: 1 }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.78rem',
                letterSpacing: '1.2px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#ffffff',
                backgroundColor: selectedSubject?.theme?.color || '#006a4e',
                padding: '5px 18px',
                borderRadius: '20px',
                marginBottom: '10px',
                boxShadow: '0 2px 8px rgba(0, 106, 78, 0.25)'
              }}>
                {selectedSubject.code}
              </span>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                margin: '4px 0 10px',
                color: '#064e3b',
                letterSpacing: '-0.5px',
                lineHeight: '1.2'
              }}>
                {selectedSubject.name}
              </h1>
              <p style={{
                fontSize: '1.02rem',
                color: '#064e3b',
                margin: 0,
                fontWeight: 600,
                lineHeight: '1.6'
              }}>
                {selectedSubject.desc} — মোট {toBanglaNumber(chaptersList.length)} টি অধ্যায় রয়েছে।
              </p>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <img
                src="/images/subject-banner-graphic.png"
                alt="Study Graphic"
                style={{ height: '145px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
        </div>

        {/* Sub-header / Breadcrumb Bar */}
        <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
          <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/admin/subject-model-categories-dashbaord" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>বিষয়ভিত্তিক মডেল টেস্ট</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <Link href={`/admin/subject-model-categories-dashbaord?examId=${selectedExam.id}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{selectedExam.title}</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedSubject.name}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleOpenNewChapter}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
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
                <i className="fa-solid fa-plus"></i>
                <span>নতুন অধ্যায় যোগ করুন</span>
              </button>

              <button
                onClick={() => router.push(`/admin/subject-model-categories-dashbaord?examId=${selectedExam.id}`)}
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
                <span>বিষয় তালিকায় ফিরে যান</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Chapters Grid Container */}
        <div className="container" style={{ maxWidth: '1300px', margin: '35px auto 0', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              অধ্যায়সমূহ ({toBanglaNumber(chaptersList.length)})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '20px' }}>
            {chaptersList.map(ch => (
              <div
                key={ch.id}
                onClick={() => router.push(`/admin/subject-model-categories-dashbaord?examId=${selectedExam.id}&subject=${selectedSubject.id}&chapterId=${encodeURIComponent(toSlug(ch.title))}`)}
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
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  position: 'relative'
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
                {/* Number Badge Box */}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, marginBottom: '8px', lineHeight: '1.4' }}>
                      {ch.title}
                    </h3>

                    {/* Edit & Delete Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={(e) => handleOpenEditChapter(e, ch)}
                        title="অধ্যায় এডিট করুন"
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#0284c7',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '5px 9px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600
                        }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteChapter(e, ch.id, ch.title)}
                        title="অধ্যায় মুছুন"
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '5px 9px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>

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
                    <span>টপিক ও সিলেবাস দেখুন</span>
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter Edit Modal */}
        {renderChapterModal()}
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: SUBJECTS OF SELECTED EXAM (Admin View)
  // -------------------------------------------------------------
  if (examId && selectedExam) {
    return (
      <main style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 100px)', paddingBottom: '80px' }}>
        {renderAdminTopBar()}

        {/* Hero banner for selected exam */}
        <div style={{
          width: '100%',
          backgroundImage: "url('/images/subject-banner-bg.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundColor: '#e0f2fe',
          borderBottom: '1px solid #bae6fd',
          padding: '24px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="container" style={{
            maxWidth: '1300px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ flex: '1 1 500px', zIndex: 1 }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.78rem',
                letterSpacing: '1.2px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#ffffff',
                backgroundColor: '#0284c7',
                padding: '5px 18px',
                borderRadius: '20px',
                marginBottom: '10px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
              }}>
                {selectedExam.categoryName}
              </span>
              <h1 style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                margin: '4px 0 10px',
                color: '#0c4a6e',
                letterSpacing: '-0.5px',
                lineHeight: '1.2'
              }}>
                {selectedExam.title}
              </h1>
              <p style={{
                fontSize: '1.02rem',
                color: '#075985',
                margin: 0,
                fontWeight: 600,
                lineHeight: '1.6'
              }}>
                {selectedExam.description}
              </p>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <img
                src="/images/subject-banner-graphic.png"
                alt="Study Graphic"
                style={{ height: '145px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
        </div>

        {/* Sub-header / Breadcrumb Bar */}
        <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px' }}>
          <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
              <Link href="/admin/subject-model-categories-dashbaord" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>বিষয়ভিত্তিক মডেল টেস্ট</Link>
              <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>{selectedExam.title}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleOpenNewSubject}
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
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
                <i className="fa-solid fa-plus"></i>
                <span>নতুন বিষয় যোগ করুন</span>
              </button>

              <button
                onClick={() => router.push('/admin/subject-model-categories-dashbaord')}
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
                <span>অন্য মডেল টেস্ট বাছাই করুন</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Subjects Grid Container */}
        <div className="container" style={{ maxWidth: '1300px', margin: '35px auto 0', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              বিষয়সমূহ ({toBanglaNumber(subjectsData.length)})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px' }}>
            {subjectsData.map(sub => {
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
                  onClick={() => router.push(`/admin/subject-model-categories-dashbaord?examId=${selectedExam.id}&subject=${sub.id}`)}
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
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = `0 16px 32px ${theme.glowColor}`;
                    e.currentTarget.style.borderColor = theme.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
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
                    {/* Top Row: Subject Code Badge + Edit / Delete Controls */}
                    <div style={{
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          backgroundColor: theme.lightBg,
                          color: theme.color,
                          border: `1px solid ${theme.borderColor}`,
                          display: 'inline-block'
                        }}
                      >
                        {sub.code}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={(e) => handleOpenEditSubject(e, sub)}
                          title="বিষয় এডিট করুন"
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#0284c7',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '4px 9px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          <span>এডিট</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteSubject(e, sub.id, sub.name)}
                          title="বিষয় মুছুন"
                          style={{
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '4px 9px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <h2 style={{
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>
                      {sub.name}
                    </h2>

                    <p style={{
                      color: '#64748b',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      margin: '0 0 14px 0'
                    }}>
                      {sub.desc}
                    </p>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.88rem',
                        color: '#475569'
                      }}
                    >
                      <i className="fa-solid fa-layer-group" style={{ color: theme.color, fontSize: '0.9rem' }}></i>
                      <strong style={{ color: '#0f172a', fontWeight: 700 }}>
                        {toBanglaNumber(sub.chaptersCount || 4)} টি
                      </strong>
                      <span>অধ্যায় অন্তর্ভুক্ত</span>
                    </div>
                  </div>

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
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span>অধ্যায়সমূহ দেখুন</span>
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Edit Modal */}
        {renderSubjectModal()}
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: ALL MODEL TESTS LIST (Admin Default View)
  // -------------------------------------------------------------
  return (
    <main style={{ padding: '0 0 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 100px)' }}>
      {renderAdminTopBar()}

      <div className="container" style={{ maxWidth: '1300px', margin: '40px auto 0', padding: '0 20px' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
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
            <span>অ্যাডমিন ড্যাশবোর্ড • মডেল টেস্ট সম্ভার</span>
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            বিষয়ভিত্তিক অনলাইন মডেল টেস্ট ম্যানেজমেন্ট
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            পাবলিক পেজের মতো একইভাবে ক্যাটাগরি, বিষয়, অধ্যায় ও টপিক ব্রাউজ করুন এবং "এডিট" বাটন দিয়ে সরাসরি লাইভ তথ্য পরিবর্তন করুন।
          </p>
        </div>

        {/* Filters, Add Button & Search Box */}
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {categories.map(cat => {
              const isActive = currentCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCat(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#0284c7' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#475569',
                    boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
                  }}
                >
                  <span>{cat.label}</span>
                  <span
                    style={{
                      padding: '1px 7px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#cbd5e1',
                      color: isActive ? '#ffffff' : '#334155',
                      display: 'inline-block'
                    }}
                  >
                    {toBanglaNumber(cat.count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Action: Search Bar + Add New Exam Button */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: '0 1 540px', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 240px' }}>
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
                  color: '#0f172a'
                }}
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

            <button
              onClick={handleOpenNewExam}
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                whiteSpace: 'nowrap'
              }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>নতুন মডেল টেস্ট</span>
            </button>
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
                    {/* Top Row: Tags, Category & Edit Controls */}
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
                            style={{
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              padding: '5px 12px 4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1.2'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                          {exam.categoryName}
                        </span>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={(e) => handleOpenEditExam(e, exam)}
                            title="মডেল টেস্ট এডিট করুন"
                            style={{
                              backgroundColor: '#f1f5f9',
                              color: '#0284c7',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                            <span>এডিট</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteExam(e, exam.id, exam.title)}
                            title="মডেল টেস্ট মুছুন"
                            style={{
                              backgroundColor: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600
                            }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
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
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
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
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          display: 'inline-block'
                        }}
                      />
                      <span>{exam.onlineUsers || 30} Online</span>
                    </div>

                    <button
                      onClick={() => router.push(`/admin/subject-model-categories-dashbaord?examId=${exam.id}`)}
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
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                      }}
                    >
                      <span>বিষয় ও সিলেবাস দেখুন</span>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exam Edit Modal */}
      {renderExamModal()}
    </main>
  );

  // -------------------------------------------------------------
  // MODALS RENDERING HELPERS
  // -------------------------------------------------------------
  function renderExamModal() {
    if (!showExamModal) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              {isEditingExam ? 'মডেল টেস্ট তথ্য এডিট করুন' : 'নতুন মডেল টেস্ট যোগ করুন'}
            </h3>
            <button
              onClick={() => setShowExamModal(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSaveExamSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                মডেল টেস্ট শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                placeholder="যেমন: ৪৬তম বিসিএস প্রিলিমিনারি লাইভ গ্র্যান্ড মডেল টেস্ট - ০১"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  ক্যাটাগরি আইডি *
                </label>
                <select
                  value={examForm.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    let name = 'বিসিএস';
                    if (cat === 'bank') name = 'ব্যাংক জব';
                    else if (cat === 'primary') name = 'প্রাইমারি';
                    else if (cat === 'subject') name = 'গণিত ও বিষয়ভিত্তিক';
                    setExamForm({ ...examForm, category: cat, categoryName: name });
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', backgroundColor: '#ffffff' }}
                >
                  <option value="bcs">BCS (বিসিএস)</option>
                  <option value="bank">Bank Job (ব্যাংক জব)</option>
                  <option value="primary">Primary (প্রাইমারি শিক্ষক)</option>
                  <option value="subject">Subjective / Full (বিষয়ভিত্তিক)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  ক্যাটাগরি ডিসপ্লে নাম
                </label>
                <input
                  type="text"
                  value={examForm.categoryName}
                  onChange={(e) => setExamForm({ ...examForm, categoryName: e.target.value })}
                  placeholder="যেমন: বিসিএস"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  ব্যাজ কালার
                </label>
                <select
                  value={examForm.badgeColor}
                  onChange={(e) => setExamForm({ ...examForm, badgeColor: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', backgroundColor: '#ffffff' }}
                >
                  <option value="rose">Rose (লালচে)</option>
                  <option value="emerald">Emerald (সবুজ)</option>
                  <option value="amber">Amber (হলুদ)</option>
                  <option value="violet">Violet (বেগুনী)</option>
                  <option value="primary">Sky Blue (নীল)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  বর্ডার কালার
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="color"
                    value={examForm.borderColor}
                    onChange={(e) => setExamForm({ ...examForm, borderColor: e.target.value })}
                    style={{ width: '42px', height: '42px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={examForm.borderColor}
                    onChange={(e) => setExamForm({ ...examForm, borderColor: e.target.value })}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
              </label>
              <input
                type="text"
                value={examForm.tags}
                onChange={(e) => setExamForm({ ...examForm, tags: e.target.value })}
                placeholder="Live Exam, BCS, Grand Test"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                সংক্ষিপ্ত বিবরণ
              </label>
              <textarea
                rows={2}
                value={examForm.description}
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                placeholder="পরীক্ষার সংক্ষিপ্ত পরিচিতি ও সিলেবাস বিষয়ক বিবরণ..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                অন্তর্ভুক্ত বিষয় ও টপিকসমূহ (সারসংক্ষেপ)
              </label>
              <input
                type="text"
                value={examForm.subjectsText}
                onChange={(e) => setExamForm({ ...examForm, subjectsText: e.target.value })}
                placeholder="বাংলা, English, গণিত, সাধারণ জ্ঞান"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowExamModal(false)}
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderSubjectModal() {
    if (!showSubjectModal) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              {isEditingSubject ? 'বিষয় এডিট করুন' : 'নতুন বিষয় যোগ করুন'}
            </h3>
            <button
              onClick={() => setShowSubjectModal(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSaveSubjectSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  বিষয়ের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="যেমন: বাংলা"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  বিষয় কোড (English) *
                </label>
                <input
                  type="text"
                  required
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                  placeholder="BANGLA"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                সংক্ষিপ্ত বিবরণ
              </label>
              <textarea
                rows={2}
                value={subjectForm.desc}
                onChange={(e) => setSubjectForm({ ...subjectForm, desc: e.target.value })}
                placeholder="যেমন: ব্যাকরণ, সাহিত্য ও শুদ্ধ প্রয়োগ"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  থিম কালার (Theme Color)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="color"
                    value={subjectForm.color}
                    onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                    style={{ width: '42px', height: '42px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={subjectForm.color}
                    onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  মোট অধ্যায় সংখ্যা
                </label>
                <input
                  type="number"
                  min="1"
                  value={subjectForm.chaptersCount}
                  onChange={(e) => setSubjectForm({ ...subjectForm, chaptersCount: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderChapterModal() {
    if (!showChapterModal) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              {isEditingChapter ? 'অধ্যায় এডিট করুন' : 'নতুন অধ্যায় যোগ করুন'}
            </h3>
            <button
              onClick={() => setShowChapterModal(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSaveChapterSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                অধ্যায়ের নাম / শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                placeholder="যেমন: বাংলা ভাষা ও ব্যাকরণ"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                অধ্যায়ের সারসংক্ষেপ ও বিবরণ
              </label>
              <textarea
                rows={3}
                value={chapterForm.desc}
                onChange={(e) => setChapterForm({ ...chapterForm, desc: e.target.value })}
                placeholder="অধ্যায়ের প্রধান টপিক ও বিষয়বস্তুর বিবরণ..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowChapterModal(false)}
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderTopicModal() {
    if (!showTopicModal) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              টপিক এডিট করুন
            </h3>
            <button
              onClick={() => setShowTopicModal(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSaveTopicSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                টপিকের নাম *
              </label>
              <input
                type="text"
                required
                value={topicModalText}
                onChange={(e) => setTopicModalText(e.target.value)}
                placeholder="যেমন: ধ্বনি ও বর্ণ"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowTopicModal(false)}
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default function AdminSubjectModelCategoriesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '36px', color: '#0284c7', marginBottom: '14px' }}></i>
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>লোড হচ্ছে...</p>
        </div>
      </div>
    }>
      <AdminSubjectModelCategoriesClient />
    </Suspense>
  );
}
