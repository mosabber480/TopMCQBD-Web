'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPaidApiUrl } from '@/lib/config';
import AiChatDrawer from '@/components/common/AiChatDrawer';

const FONT_FAMILIES = [
  {
    id: 'noto-sans',
    name: 'Noto Sans Bengali',
    sub: 'ক্লিন ও আধুনিক (ডিফল্ট)',
    family: "'Noto Sans Bengali', sans-serif"
  },
  {
    id: 'hind-siliguri',
    name: 'Hind Siliguri',
    sub: 'হিন্দ শিলিগুড়ি (জনপ্রিয় ও সুস্পষ্ট)',
    family: "'Hind Siliguri', sans-serif"
  },
  {
    id: 'kalpurush',
    name: 'Kalpurush / Noto Serif',
    sub: 'কালপুরুষ (বই ও পত্রিকার ক্লাসিক ফন্ট)',
    family: "'Kalpurush', 'Noto Serif Bengali', serif"
  },
  {
    id: 'tiro-bangla',
    name: 'Tiro Bangla',
    sub: 'তিরো বাংলা (মার্জিত ও ফরমাল সেরিফ)',
    family: "'Tiro Bangla', serif"
  },
  {
    id: 'anek-bangla',
    name: 'Anek Bangla',
    sub: 'অনেক বাংলা (বোল্ড ও আধুনিক)',
    family: "'Anek Bangla', sans-serif"
  },
  {
    id: 'poppins',
    name: 'Poppins',
    sub: 'পপিন্স (জ্যামিতিক ও আকর্ষণীয় স্যান-সেরিফ)',
    family: "'Poppins', 'Noto Sans Bengali', sans-serif"
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    sub: 'মন্টসেরাট (স্টাইলিশ ও প্রিমিয়াম)',
    family: "'Montserrat', 'Noto Sans Bengali', sans-serif"
  },
  {
    id: 'arial',
    name: 'Arial',
    sub: 'অ্যারিয়াল (ইউনিভার্সাল ও স্ট্যান্ডার্ড)',
    family: "Arial, 'Noto Sans Bengali', sans-serif"
  }
];

const FONT_WEIGHTS = [
  {
    id: 'thin',
    value: 'thin',
    name: 'Thin',
    sub: 'পাতলা ও হালকা ফন্ট (৩০০)',
    weight: 300
  },
  {
    id: 'regular',
    value: 'regular',
    name: 'Regular',
    sub: 'স্বাভাবিক ও স্পষ্ট (ডিফল্ট - ৪০০)',
    weight: 400
  },
  {
    id: 'medium',
    value: 'medium',
    name: 'Medium',
    sub: 'মাঝারি গাঢ় ও পরিচ্ছন্ন (৬০০)',
    weight: 600
  },
  {
    id: 'bold',
    value: 'bold',
    name: 'Bold',
    sub: 'সম্পূর্ণ গাঢ় ও আকর্ষণীয় (৮০০)',
    weight: 800
  }
];

function QuestionsComponentInternal() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  // Helper to format category for clean UI display (replace hyphens back to readable text and > separators)
  const formatCategoryDisplay = (cat) => {
    if (!cat) return '';
    try {
      const decoded = decodeURIComponent(cat);
      const segments = decoded.replace(/->-|---|–>–/g, ' > ').split(/\s*>\s*/);
      return segments.map((seg) => seg.replace(/-/g, ' ').trim()).join(' > ');
    } catch (e) {
      return cat.replace(/-/g, ' ');
    }
  };

  // Automatically ensure URL in address bar has hyphens instead of %20 / spaces
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search && (search.includes('%20') || search.includes(' '))) {
        const cleanSearch = search.replace(/(%20|\s)+/g, '-');
        window.history.replaceState(null, '', window.location.pathname + cleanSearch + window.location.hash);
      }
    }
  }, [categoryParam]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allQuestions, setAllQuestions] = useState([]);
  const [displayQuestions, setDisplayQuestions] = useState([]);

  // User answers map: { [questionIndex]: selectedOptionIndex }
  const [answeredQuestions, setAnsweredQuestions] = useState({});

  // Toggles (Exact Defaults from quiz.html)
  const [isReadMode, setIsReadMode] = useState(false); // Default OFF
  const [showAskAi, setShowAskAi] = useState(false); // Default OFF (toggled via switcher next to Read Mode)
  const [showColor, setShowColor] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false); // Default OFF
  const [showExplanation, setShowExplanation] = useState(true); // Default ON
  const [showTime, setShowTime] = useState(false); // Default OFF
  const [showScore, setShowScore] = useState(true); // Default ON
  const [optionLayout, setOptionLayout] = useState('2q-col'); // Default: '2q-col' (১ লাইনে ২টি প্রশ্ন - উপর-নিচ ক্রম)
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const layoutDropdownRef = useRef(null);

  // Cut mark / negative marking states
  const [cutMark, setCutMark] = useState(0.5); // Default 0.5 cut mark
  const [cutMarkMode, setCutMarkMode] = useState('0.5'); // '0.5' | '0.25' | '0' | 'custom'
  const [customCutMarkInput, setCustomCutMarkInput] = useState('');
  const [showCutMarkMenu, setShowCutMarkMenu] = useState(false);
  const cutMarkDropdownRef = useRef(null);

  // Font settings states
  const [fontSize, setFontSize] = useState(16); // Default 16px
  const [fontFamily, setFontFamily] = useState("'Noto Sans Bengali', sans-serif");
  const [fontWeight, setFontWeight] = useState('regular'); // 'thin' | 'regular' | 'medium' | 'bold'
  const [customFontSizeInput, setCustomFontSizeInput] = useState('');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [fontAccordion, setFontAccordion] = useState({ size: true, family: false, weight: false });
  const fontDropdownRef = useRef(null);

  const toggleFontAccordion = (sec) => {
    setFontAccordion((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [showLimitMenu, setShowLimitMenu] = useState(false);
  const limitDropdownRef = useRef(null);

  const [showRangeMenu, setShowRangeMenu] = useState(false);
  const rangeDropdownRef = useRef(null);

  // Range and limit filters
  const [limit, setLimit] = useState('all');
  const [rangeIndex, setRangeIndex] = useState(0);

  // Scores
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  // Timer
  const [totalSecondsLeft, setTotalSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [warningTriggered, setWarningTriggered] = useState(false);

  // Popups
  const [popup, setPopup] = useState({
    visible: false,
    type: '', // 'warning' | 'danger' | 'success'
    title: '',
    msg: '',
    hasReset: false
  });

  // AI Assistant States
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeAiPrompt, setActiveAiPrompt] = useState('');
  const [activeAiContext, setActiveAiContext] = useState(null);

  // Helper to check user authentication and subscription / paid status
  const checkUserPlanStatus = () => {
    if (typeof window === 'undefined') return { isLoggedIn: false, isPaid: false, user: null };
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');
      
      let u = null;
      if (userStr) {
        try {
          u = JSON.parse(userStr);
        } catch (e) {}
      }

      // User is considered logged in if token exists or valid user object is found
      const isLoggedIn = !!(token || (u && (u._id || u.phone || u.email || u.name)));
      if (!isLoggedIn) {
        return { isLoggedIn: false, isPaid: false, user: null };
      }

      if (!u) {
        // Token exists but user details not cached yet
        return { isLoggedIn: true, isPaid: false, user: null };
      }

      // 1. Admin and owner roles have complete paid access
      if (u.role === 'admin' || u.role === 'owner') {
        return { isLoggedIn: true, isPaid: true, user: u };
      }

      // 2. Check subscription active status and valid end date
      const sub = u.subscription;
      if (sub && sub.active && sub.plan && sub.plan !== 'none') {
        if (!sub.endDate || new Date(sub.endDate) > new Date()) {
          return { isLoggedIn: true, isPaid: true, user: u };
        }
      }

      // 3. Check alternative flags
      if (u.isPaid || u.hasActivePlan || u.plan === 'paid') {
        return { isLoggedIn: true, isPaid: true, user: u };
      }

      // Logged in, but free / no active subscription plan
      return { isLoggedIn: true, isPaid: false, user: u };
    } catch (e) {
      return { isLoggedIn: false, isPaid: false, user: null };
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  // Plan status state
  const [planStatus, setPlanStatus] = useState({
    checked: false,
    isLoggedIn: false,
    isPaid: false,
    user: null
  });

  // Sync user profile from backend on mount to detect active plans in real-time
  useEffect(() => {
    setIsMounted(true);
    const s = checkUserPlanStatus();
    setPlanStatus({ checked: true, isLoggedIn: s.isLoggedIn, isPaid: s.isPaid, user: s.user });

    const syncUser = async () => {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('quiz_token')) : null;
      if (token) {
        try {
          const res = await fetch(getPaidApiUrl('/api/users/me'), {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
              localStorage.setItem('quiz_user', JSON.stringify(data.user));
              const updated = checkUserPlanStatus();
              setPlanStatus({ checked: true, isLoggedIn: updated.isLoggedIn, isPaid: updated.isPaid, user: updated.user });
            }
          }
        } catch (e) {}
      }
    };

    syncUser();

    // Listen to storage events across tabs or auth changes
    const handleStorageChange = () => {
      const updated = checkUserPlanStatus();
      setPlanStatus({ checked: true, isLoggedIn: updated.isLoggedIn, isPaid: updated.isPaid, user: updated.user });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleAskAI = (q, idx) => {
    const status = checkUserPlanStatus();

    // 1. Not logged in -> Prompt login
    if (!status.isLoggedIn) {
      setPopup({
        visible: true,
        type: 'warning',
        title: 'লগইন ও সক্রিয় প্ল্যান প্রয়োজন',
        msg: 'আপনার কোনো সক্রিয় প্ল্যান নেই। Ask AI দেখার জন্য সক্রিয় প্ল্যান লাগবে, অনুগ্রহ করে লগইন করে একটি প্ল্যান পারচেজ করুন।',
        hasReset: false,
        isLoginRequired: true,
        isPlanRequired: false
      });
      return;
    }

    // 2. Logged in, but not paid / no active plan -> Prompt package purchase
    if (!status.isPaid) {
      setPopup({
        visible: true,
        type: 'warning',
        title: 'সক্রিয় প্ল্যান প্রয়োজন',
        msg: 'আপনার কোনো সক্রিয় প্ল্যান নেই। Ask AI দেখার জন্য সক্রিয় প্ল্যান লাগবে, অনুগ্রহ করে একটি প্ল্যান পারচেজ করুন।',
        hasReset: false,
        isLoginRequired: false,
        isPlanRequired: true
      });
      return;
    }

    const bengaliLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    const promptText = `প্রশ্ন ${idx + 1}: ${q.q}\nঅপশনসমূহ:\n${(q.options || [])
      .map((opt, i) => `(${bengaliLetters[i] || i + 1}) ${opt}`)
      .join('\n')}\nদয়া করে এই MCQ টির সঠিক উত্তর নির্ণয় করে প্রতিটি অপশন বিশ্লেষণসহ বিস্তারিত সহজ বাংলায় বুঝিয়ে দিন।`;

    setActiveAiPrompt(promptText);
    setActiveAiContext({
      question: `${idx + 1}. ${q.q}`,
      options: q.options,
      answer: q.ans,
      explanation: q.explanation
    });
    setIsAiOpen(true);
  };

  // Tooltip
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  // Dynamic header offset so floating score/timer is NEVER hidden behind Announcement bar or Header
  const [headerOffset, setHeaderOffset] = useState(null);

  useEffect(() => {
    const updateHeaderOffset = () => {
      const header = document.getElementById('global-header');
      if (header) {
        const rect = header.getBoundingClientRect();
        // Position exactly 8px below the current bottom of the header in viewport
        setHeaderOffset(Math.round(rect.bottom + 8));
      }
    };

    updateHeaderOffset();
    window.addEventListener('scroll', updateHeaderOffset, { passive: true });
    window.addEventListener('resize', updateHeaderOffset, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateHeaderOffset);
      window.removeEventListener('resize', updateHeaderOffset);
    };
  }, []);

  // Load saved preferences from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('topmcqbd_cut_mark_pref');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.cutMark === 'number') {
          setCutMark(parsed.cutMark);
        }
        if (parsed.cutMarkMode) {
          setCutMarkMode(parsed.cutMarkMode);
        }
        if (parsed.customValue !== undefined) {
          setCustomCutMarkInput(parsed.customValue);
        }
      }

      // Load font settings
      const savedFontSize = localStorage.getItem('topmcqbd_font_size');
      if (savedFontSize) {
        const num = parseInt(savedFontSize, 10);
        if (!isNaN(num) && num >= 10 && num <= 36) {
          setFontSize(num);
          if (![14, 15, 16, 17, 18, 19, 20].includes(num)) {
            setCustomFontSizeInput(String(num));
          }
        }
      }
      const savedFontFamily = localStorage.getItem('topmcqbd_font_family');
      if (savedFontFamily) {
        setFontFamily(savedFontFamily);
      }
      const savedFontWeight = localStorage.getItem('topmcqbd_font_weight');
      if (savedFontWeight && ['thin', 'regular', 'medium', 'bold'].includes(savedFontWeight)) {
        setFontWeight(savedFontWeight);
      }

      // Load saved Ask AI toggle preference
      const savedAskAi = localStorage.getItem('topmcqbd_show_ask_ai');
      if (savedAskAi === 'true') {
        setShowAskAi(true);
      }
    } catch (e) {
      console.warn('Error reading preferences from localStorage:', e);
    }
  }, []);

  // Close layout, limit, range, font & cut mark menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutDropdownRef.current && !layoutDropdownRef.current.contains(event.target)) {
        setShowLayoutMenu(false);
      }
      if (cutMarkDropdownRef.current && !cutMarkDropdownRef.current.contains(event.target)) {
        setShowCutMarkMenu(false);
      }
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) {
        setShowFontMenu(false);
      }
      if (limitDropdownRef.current && !limitDropdownRef.current.contains(event.target)) {
        setShowLimitMenu(false);
      }
      if (rangeDropdownRef.current && !rangeDropdownRef.current.contains(event.target)) {
        setShowRangeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load questions from Full Model Test API with fallback to general questions API
  useEffect(() => {
    setLoading(true);
    setError('');

    const fmtUrl = categoryParam
      ? `/api/subjective/questions?category=${encodeURIComponent(categoryParam)}`
      : '/api/subjective/questions';

    fetch(fmtUrl)
      .then((res) => res.json())
      .then(async (data) => {
        let list = data.questions || data.mcqs || [];
        // If full model test DB has no questions for this category yet, fallback to general API
        if (list.length === 0) {
          try {
            const fallbackUrl = categoryParam
              ? `/api/questions?category=${encodeURIComponent(categoryParam)}`
              : '/api/questions';
            const fallbackRes = await fetch(getPaidApiUrl(fallbackUrl));
            const fallbackData = await fallbackRes.json();
            if (fallbackData.questions && fallbackData.questions.length > 0) {
              list = fallbackData.questions;
            }
          } catch (fbErr) {}
        }
        setAllQuestions(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Full model test questions fetch error:', err);
        setError('ডাটাবেজ থেকে বিষয়ভিত্তিক প্রশ্ন লোড করতে সমস্যা হয়েছে!');
        setLoading(false);
      });
  }, [categoryParam]);

  // Update display questions slice
  useEffect(() => {
    if (allQuestions.length === 0) {
      setDisplayQuestions([]);
      return;
    }

    if (limit === 'all') {
      setDisplayQuestions(allQuestions);
    } else {
      const numLimit = parseInt(limit, 10);
      const start = rangeIndex * numLimit;
      const end = start + numLimit;
      setDisplayQuestions(allQuestions.slice(start, end));
    }

    resetQuizState();
  }, [allQuestions, limit, rangeIndex]);

  // Timer Initialization
  useEffect(() => {
    if (showTime && !isReadMode && displayQuestions.length > 0) {
      const initialSecs = displayQuestions.length * 36; // 36 seconds per question
      setTotalSecondsLeft(initialSecs);
      setTimerRunning(true);
      setWarningTriggered(false);
    } else {
      setTimerRunning(false);
    }
  }, [showTime, isReadMode, displayQuestions.length]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (timerRunning && totalSecondsLeft > 0) {
      interval = setInterval(() => {
        setTotalSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerRunning(false);
            handleTimeOut();
            return 0;
          }

          // 10% warning
          const warningThreshold = Math.floor(displayQuestions.length * 36 * 0.1);
          if (prev <= warningThreshold && !warningTriggered) {
            setWarningTriggered(true);
            show10PercentWarning();
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, totalSecondsLeft, warningTriggered, displayQuestions.length]);

  const show10PercentWarning = () => {
    if (!showTime || isReadMode) return;
    setPopup({
      visible: true,
      type: 'warning',
      title: '⚠️ সময় প্রায় শেষ!',
      msg: `আর মাত্র অল্প কিছু সময় বাকি আছে। দ্রুত উত্তর সম্পন্ন করুন!`,
      hasReset: false
    });
  };

  const toBengaliNumber = (num) => {
    if (num === undefined || num === null) return '০';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (d) => bengaliDigits[d]);
  };

  const formatScore = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    const rounded = Math.round(val * 100) / 100;
    if (Number.isInteger(rounded)) return rounded.toString();
    return rounded.toFixed(rounded % 0.1 === 0 ? 1 : 2);
  };

  const handleSelectPresetCutMark = (val, mode) => {
    setCutMark(val);
    setCutMarkMode(mode);
    setCustomCutMarkInput('');
    setShowCutMarkMenu(false);
    try {
      localStorage.setItem('topmcqbd_cut_mark_pref', JSON.stringify({
        cutMark: val,
        cutMarkMode: mode,
        customValue: ''
      }));
    } catch (e) {
      console.warn('Error saving cut mark preference to localStorage:', e);
    }
    const newScore = Math.round((correctCount * 1 - incorrectCount * val) * 100) / 100;
    setScore(newScore);
  };

  const handleApplyCustomCutMark = () => {
    const parsed = parseFloat(customCutMarkInput);
    if (isNaN(parsed) || parsed < 0) {
      alert('অনুগ্রহ করে একটি সঠিক ধনাত্মক নম্বর লিখুন (যেমন: 0.20, 0.75, 1)');
      return;
    }
    const val = Math.round(parsed * 100) / 100;
    setCutMark(val);
    setCutMarkMode('custom');
    setShowCutMarkMenu(false);
    try {
      localStorage.setItem('topmcqbd_cut_mark_pref', JSON.stringify({
        cutMark: val,
        cutMarkMode: 'custom',
        customValue: customCutMarkInput
      }));
    } catch (e) {
      console.warn('Error saving custom cut mark preference to localStorage:', e);
    }
    const newScore = Math.round((correctCount * 1 - incorrectCount * val) * 100) / 100;
    setScore(newScore);
  };

  const handleSelectFontSize = (size) => {
    setFontSize(size);
    setCustomFontSizeInput('');
    try {
      localStorage.setItem('topmcqbd_font_size', String(size));
    } catch (e) {}
  };

  const handleApplyCustomFontSize = () => {
    const num = parseInt(customFontSizeInput, 10);
    if (isNaN(num) || num < 10 || num > 36) {
      alert('অনুগ্রহ করে ১০ থেকে ৩৬ এর মধ্যে একটি সঠিক সাইজ লিখুন (যেমন: ১৮)');
      return;
    }
    setFontSize(num);
    try {
      localStorage.setItem('topmcqbd_font_size', String(num));
    } catch (e) {}
  };

  const handleSelectFontFamily = (family) => {
    setFontFamily(family);
    try {
      localStorage.setItem('topmcqbd_font_family', family);
    } catch (e) {}
  };

  const handleSelectFontWeight = (weight) => {
    setFontWeight(weight);
    try {
      localStorage.setItem('topmcqbd_font_weight', weight);
    } catch (e) {}
  };

  const handleTimeOut = () => {
    const totalCount = displayQuestions.length || 1;
    const unanswered = totalCount - (correctCount + incorrectCount);
    const pct = ((correctCount / totalCount) * 100).toFixed(0);

    setPopup({
      visible: true,
      type: 'danger',
      title: '⏰ সময় শেষ!',
      msg: `সঠিক: ${correctCount} টি | ভুল: ${incorrectCount} টি | বাকি: ${unanswered} টি\nসঠিক উত্তরের হার: ${pct}%\nমোট স্কোর: ${formatScore(score)}`,
      hasReset: true
    });
  };

  const showCompletionPopup = (finalScore, finalCorrect, finalIncorrect) => {
    setTimerRunning(false);
    const totalCount = displayQuestions.length || 1;
    const pct = ((finalCorrect / totalCount) * 100).toFixed(0);

    setPopup({
      visible: true,
      type: 'success',
      title: '🏆 অভিনন্দন! পরীক্ষা সম্পন্ন হয়েছে',
      msg: `সঠিক উত্তর: ${finalCorrect} টি | ভুল উত্তর: ${finalIncorrect} টি\nসঠিক উত্তরের হার: ${pct}%\nমোট প্রাপ্ত স্কোর: ${formatScore(finalScore)}`,
      hasReset: true
    });
  };

  const resetQuizState = () => {
    setAnsweredQuestions({});
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setPopup({ visible: false, type: '', title: '', msg: '', hasReset: false });

    if (showTime && !isReadMode && displayQuestions.length > 0) {
      setTotalSecondsLeft(displayQuestions.length * 36);
      setTimerRunning(true);
      setWarningTriggered(false);
    }
  };

  const resetQuiz = () => {
    if (isReadMode) {
      setIsReadMode(false);
      setShowScore(true);
    }
    resetQuizState();
  };

  // Read Mode Switch Toggle Handler
  const handleReadModeToggle = (checked) => {
    setIsReadMode(checked);
    if (checked) {
      // In Read Mode: Time and Score switches are DISABLED with opacity, NOT hidden
      setShowTime(false);
      setShowScore(false);
      setShowColor(true);
      setShowExplanation(true);
      setShowAnswer(false); // Default OFF as requested
      setTimerRunning(false);
    } else {
      // Exiting Read Mode: Time and Score switches are ENABLED again
      setShowScore(true);
      setShowAnswer(false);
      resetQuizState();
    }
  };

  // Ask AI Switch Toggle Handler (Toggles display of Ask AI buttons next to questions)
  const handleAskAiToggle = (checked) => {
    setShowAskAi(checked);
    try {
      localStorage.setItem('topmcqbd_show_ask_ai', checked ? 'true' : 'false');
    } catch (e) {}
  };

  // Option Click Handler (Single Attempt Lock)
  const handleAnswerClick = (qIndex, optIndex) => {
    if (isReadMode) return;
    if (showTime && totalSecondsLeft <= 0) return;
    if (answeredQuestions[qIndex] !== undefined) return; // Locked: no second click allowed!

    const q = displayQuestions[qIndex];
    const correctAns = q.ans;

    const newAnswered = { ...answeredQuestions, [qIndex]: optIndex };
    setAnsweredQuestions(newAnswered);

    let newCorrect = correctCount;
    let newIncorrect = incorrectCount;

    if (optIndex === correctAns) {
      newCorrect += 1;
    } else {
      newIncorrect += 1;
    }

    const newScore = Math.round((newCorrect * 1 - newIncorrect * cutMark) * 100) / 100;

    setScore(newScore);
    setCorrectCount(newCorrect);
    setIncorrectCount(newIncorrect);

    if (Object.keys(newAnswered).length === displayQuestions.length) {
      showCompletionPopup(newScore, newCorrect, newIncorrect);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getBanglaLetter = (idx) => {
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    return letters[idx] || idx + 1;
  };

  const getRangeOptions = () => {
    if (limit === 'all') return [{ label: 'সকল প্রশ্ন', value: 0 }];
    const numLimit = parseInt(limit, 10);
    const totalChunks = Math.ceil(allQuestions.length / numLimit);
    const options = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * numLimit + 1;
      const end = Math.min((i + 1) * numLimit, allQuestions.length);
      options.push({ label: `${start} - ${end}`, value: i });
    }
    return options;
  };

  // Progress calculations
  const totalDisplay = displayQuestions.length || 1;
  const unansweredCount = totalDisplay - (correctCount + incorrectCount);
  const correctPercent = (correctCount / totalDisplay) * 100;
  const incorrectPercent = (incorrectCount / totalDisplay) * 100;
  const unansweredPercent = (unansweredCount / totalDisplay) * 100;

  const handleProgressBarMouseMove = (e, type) => {
    let text = '';
    if (type === 'correct') text = `সঠিক উত্তর: ${Math.round(correctPercent)}%`;
    if (type === 'incorrect') text = `ভুল উত্তর: ${Math.round(incorrectPercent)}%`;
    if (type === 'unanswered') text = `উত্তর দেওয়া হয়নি: ${Math.round(unansweredPercent)}%`;

    setTooltip({
      visible: true,
      text,
      x: e.clientX,
      y: e.clientY
    });
  };

  if (!isMounted) {
    return (
      <div className="quiz-section-wrapper font-bn" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <p style={{ marginTop: '16px', color: '#64748b', fontSize: '15px' }}>
            প্রশ্নব্যাংক লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-section-wrapper">
      {/* Hover Tooltip */}
      {tooltip.visible && (
        <div className="progress-tooltip-box" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}

      {/* Floating Status Bar (Visible only when paid plan is active) */}
      {planStatus.isPaid && (
        <div
          className="quiz-floating-status-bar"
          style={headerOffset !== null ? { top: `${headerOffset}px` } : undefined}
        >
          {showTime && !isReadMode && (
            <div className="quiz-timer-board">
              <i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i>
              <span>{formatTimer(totalSecondsLeft)}</span>
            </div>
          )}
          {showScore && !isReadMode && (
            <div className="quiz-score-board">
              স্কোর: <span>{formatScore(score)}</span>
            </div>
          )}
        </div>
      )}

      {/* Corner Toast Popup */}
      {popup.visible && (
        <div className={`quiz-corner-popup ${popup.type}`}>
          <h4>{popup.title}</h4>
          <p>{popup.msg}</p>
          <div className="quiz-popup-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
            {popup.isLoginRequired && (
              <Link
                href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/questions')}`}
                className="quiz-popup-btn btn-popup-reset"
                style={{
                  textDecoration: 'none',
                  background: '#007bff',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600
                }}
                onClick={() => setPopup({ ...popup, visible: false })}
              >
                <i className="fa-solid fa-right-to-bracket"></i> লগইন করুন
              </Link>
            )}
            {popup.isPlanRequired && (
              <Link
                href="/packages"
                className="quiz-popup-btn btn-popup-reset"
                style={{
                  textDecoration: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600
                }}
                onClick={() => setPopup({ ...popup, visible: false })}
              >
                <i className="fa-solid fa-cart-shopping"></i> প্যাকেজ কিনুন
              </Link>
            )}
            {popup.hasReset && (
              <button className="quiz-popup-btn btn-popup-reset" onClick={resetQuiz}>
                <i className="fa-solid fa-rotate-right"></i> পুনরায় শুরু করুন
              </button>
            )}
            <button className="quiz-popup-btn btn-popup-close" onClick={() => setPopup({ ...popup, visible: false })}>
              {popup.isLoginRequired || popup.isPlanRequired ? 'বাতিল' : 'ঠিক আছে'}
            </button>
          </div>
        </div>
      )}

      <div
        className="quiz-container"
        style={{
          '--quiz-font-size': `${fontSize}px`,
          '--quiz-font-family': fontFamily,
          '--quiz-font-weight': fontWeight === 'thin' ? '300' : fontWeight === 'medium' ? '500' : fontWeight === 'bold' ? '700' : '400',
          '--quiz-question-weight': fontWeight === 'thin' ? '400' : fontWeight === 'medium' ? '700' : fontWeight === 'bold' ? '800' : '600',
          '--quiz-circle-weight': fontWeight === 'thin' ? '500' : fontWeight === 'medium' ? '700' : fontWeight === 'bold' ? '800' : '700'
        }}
      >
        <h1>বিষয়ভিত্তিক সকল MCQ অনুশীলন ও সমাধান</h1>
        <h2>{categoryParam ? formatCategoryDisplay(categoryParam) : 'বিষয়ভিত্তিক সকল MCQ অনুশীলন ও সমাধান'}</h2>

        <div className="quiz-header-info-bar">
          <div className="quiz-exam-path">
            <Link href="/subjective-all-mcqs-Practice-success" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--primary, #007bff)' }}></i>
              <span style={{ textDecoration: 'underline' }}>বিষয়ভিত্তিক সকল MCQ অনুশীলন</span>
            </Link>
            <span style={{ margin: '0 6px', color: '#94a3b8' }}>/</span>
            <span>{categoryParam ? formatCategoryDisplay(categoryParam) : 'বিষয়ভিত্তিক সকল MCQ অনুশীলন'}</span>
          </div>
          <div className="quiz-header-right-actions">
            {/* Cut Mark (Negative Marking) Custom Dropdown */}
            <div className="quiz-layout-dropdown-wrapper" ref={cutMarkDropdownRef}>
              <button
                type="button"
                className="quiz-cut-mark-trigger-btn"
                onClick={() => setShowCutMarkMenu(!showCutMarkMenu)}
                title="ভুল উত্তরের জন্য কাট মার্ক পরিবর্তন করুন"
              >
                <span>
                  {cutMark === 0
                    ? '[ কোনো কাট মার্ক নেই ]'
                    : `[ প্রতিটি ভুল উত্তরের জন্য ${toBengaliNumber(cutMark)} নম্বর কাটা যাবে ]`}
                </span>
                <i className={`fa-solid fa-chevron-${showCutMarkMenu ? 'up' : 'down'}`} style={{ fontSize: '11px', color: '#e74c3c' }}></i>
              </button>

              {showCutMarkMenu && (
                <div className="quiz-layout-popup-menu quiz-cut-mark-popup">
                  <div className="quiz-cut-mark-popup-title">
                    <i className="fa-solid fa-pen-ruler" style={{ color: '#e74c3c', marginRight: '6px' }}></i>
                    নেগেটিভ মার্কিং (কাট মার্ক)
                  </div>

                  <button
                    type="button"
                    className={`quiz-layout-menu-item ${cutMarkMode === '0.5' ? 'active' : ''}`}
                    onClick={() => handleSelectPresetCutMark(0.5, '0.5')}
                  >
                    <div className="quiz-layout-radio-circle">
                      {cutMarkMode === '0.5' && <div className="quiz-layout-radio-inner"></div>}
                    </div>
                    <span>০.৫ নম্বর কাটা যাবে (ডিফল্ট)</span>
                  </button>

                  <button
                    type="button"
                    className={`quiz-layout-menu-item ${cutMarkMode === '0.25' ? 'active' : ''}`}
                    onClick={() => handleSelectPresetCutMark(0.25, '0.25')}
                  >
                    <div className="quiz-layout-radio-circle">
                      {cutMarkMode === '0.25' && <div className="quiz-layout-radio-inner"></div>}
                    </div>
                    <span>০.২৫ নম্বর কাটা যাবে</span>
                  </button>

                  <button
                    type="button"
                    className={`quiz-layout-menu-item ${cutMarkMode === '0' ? 'active' : ''}`}
                    onClick={() => handleSelectPresetCutMark(0, '0')}
                  >
                    <div className="quiz-layout-radio-circle">
                      {cutMarkMode === '0' && <div className="quiz-layout-radio-inner"></div>}
                    </div>
                    <span>No Cut Mark (০ নম্বর)</span>
                  </button>

                  <div className="quiz-cut-mark-divider"></div>

                  <div className="quiz-cut-mark-custom-section">
                    <div className="quiz-cut-mark-custom-header">
                      <span>কাস্টম কাট মার্ক:</span>
                      {cutMarkMode === 'custom' && (
                        <span className="quiz-cut-mark-badge">সক্রিয়: {toBengaliNumber(cutMark)}</span>
                      )}
                    </div>
                    <div className="quiz-cut-mark-input-row">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        placeholder="যেমন: 0.20 বা 1"
                        value={customCutMarkInput}
                        onChange={(e) => setCustomCutMarkInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCustomCutMark();
                          }
                        }}
                        className="quiz-cut-mark-input"
                      />
                      <button
                        type="button"
                        className="quiz-cut-mark-apply-btn"
                        onClick={handleApplyCustomCutMark}
                      >
                        সেট করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Option Layout Custom Dropdown Menu */}
            <div className="quiz-layout-dropdown-wrapper hide-on-mobile" ref={layoutDropdownRef}>
              <button
                type="button"
                className="quiz-layout-trigger-btn"
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                title="অপশন লেআউট পরিবর্তন করুন"
              >
                <i className="fa-solid fa-table-cells-large" style={{ color: '#007bff' }}></i>
                <span>লেআউট</span>
                <i className={`fa-solid fa-chevron-${showLayoutMenu ? 'up' : 'down'}`} style={{ fontSize: '11px', color: '#64748b' }}></i>
              </button>

              {showLayoutMenu && (
                <div className="quiz-layout-popup-menu">
                  <button
                    type="button"
                    className={`quiz-layout-menu-item ${optionLayout === '2q-col' ? 'active' : ''}`}
                    onClick={() => { setOptionLayout('2q-col'); setShowLayoutMenu(false); }}
                  >
                    <div className="quiz-layout-radio-circle">
                      {optionLayout === '2q-col' && <div className="quiz-layout-radio-inner"></div>}
                    </div>
                    <span>১ লাইনে ২টি প্রশ্ন (উপর-নিচ ক্রম)</span>
                  </button>

                  <button
                    type="button"
                    className={`quiz-layout-menu-item ${optionLayout === '2q-row' ? 'active' : ''}`}
                    onClick={() => { setOptionLayout('2q-row'); setShowLayoutMenu(false); }}
                  >
                    <div className="quiz-layout-radio-circle">
                      {optionLayout === '2q-row' && <div className="quiz-layout-radio-inner"></div>}
                    </div>
                    <span>১ লাইনে ২টি প্রশ্ন (পাশাপাশি ক্রম)</span>
                  </button>

                  <button
                    type="button"
                    className={`quiz-layout-menu-item ${optionLayout === '4' ? 'active' : ''}`}
                    onClick={() => { setOptionLayout('4'); setShowLayoutMenu(false); }}
                  >
                    <div className="quiz-layout-radio-circle">
                      {optionLayout === '4' && <div className="quiz-layout-radio-inner"></div>}
                    </div>
                    <span>১ লাইনে ৪টি অপশন</span>
                  </button>

                  <button
                    type="button"
                    className={`quiz-layout-menu-item ${optionLayout === '2' ? 'active' : ''}`}
                    onClick={() => { setOptionLayout('2'); setShowLayoutMenu(false); }}
                  >
                    <div className="quiz-layout-radio-circle">
                      {optionLayout === '2' && <div className="quiz-layout-radio-inner"></div>}
                    </div>
                    <span>১ লাইনে ২টি অপশন</span>
                  </button>

                  <button
                    type="button"
                    className={`quiz-layout-menu-item ${optionLayout === '1' ? 'active' : ''}`}
                    onClick={() => { setOptionLayout('1'); setShowLayoutMenu(false); }}
                  >
                    <div className="quiz-layout-radio-circle">
                      {optionLayout === '1' && <div className="quiz-layout-radio-inner"></div>}
                    </div>
                    <span>১ লাইনে ১টি অপশন</span>
                  </button>
                </div>
              )}
            </div>

            {/* Font Settings Custom Dropdown Menu */}
            <div className="quiz-layout-dropdown-wrapper" ref={fontDropdownRef}>
              <button
                type="button"
                className="quiz-layout-trigger-btn"
                onClick={() => setShowFontMenu(!showFontMenu)}
                title="ফন্ট সাইজ ও ফন্ট ফ্যামিলি পরিবর্তন করুন"
              >
                <i className="fa-solid fa-font" style={{ color: '#007bff' }}></i>
                <span>ফন্ট</span>
                <i className={`fa-solid fa-chevron-${showFontMenu ? 'up' : 'down'}`} style={{ fontSize: '11px', color: '#64748b' }}></i>
              </button>

              {showFontMenu && (
                <div className="quiz-layout-popup-menu quiz-font-popup">
                  <div className="quiz-font-popup-title">
                    <i className="fa-solid fa-sliders" style={{ color: '#007bff', marginRight: '6px' }}></i>
                    ফন্ট সেটিংস (Font Settings)
                  </div>

                  {/* Section 1: Font Size Accordion */}
                  <div
                    className={`quiz-font-accordion-header ${fontAccordion.size ? 'active' : ''}`}
                    onClick={() => toggleFontAccordion('size')}
                    title="ফন্ট সাইজ অপশন খুলতে বা বন্ধ করতে ক্লিক করুন"
                  >
                    <div className="quiz-font-accordion-header-left">
                      <i className="fa-solid fa-text-height" style={{ color: '#007bff' }}></i>
                      <span>ফন্ট সাইজ:</span>
                    </div>
                    <div className="quiz-font-accordion-header-right">
                      <span className="quiz-font-accordion-badge">
                        <span className="quiz-font-accordion-badge-text">{fontSize} px</span>
                      </span>
                      <i className={`fa-solid fa-chevron-${fontAccordion.size ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                    </div>
                  </div>

                  {fontAccordion.size && (
                    <div className="quiz-font-accordion-body">
                      <div className="quiz-font-size-pills">
                        <button
                          type="button"
                          className={`quiz-font-size-pill ${fontSize === 14 ? 'active' : ''}`}
                          onClick={() => handleSelectFontSize(14)}
                        >
                          14 px
                        </button>
                        <button
                          type="button"
                          className={`quiz-font-size-pill ${fontSize === 15 ? 'active' : ''}`}
                          onClick={() => handleSelectFontSize(15)}
                        >
                          15 px
                        </button>
                        <button
                          type="button"
                          className={`quiz-font-size-pill ${fontSize === 16 ? 'active' : ''}`}
                          onClick={() => handleSelectFontSize(16)}
                        >
                          16 px (ডিফল্ট)
                        </button>
                      </div>

                      <div className="quiz-font-size-pills">
                        <button
                          type="button"
                          className={`quiz-font-size-pill ${fontSize === 17 ? 'active' : ''}`}
                          onClick={() => handleSelectFontSize(17)}
                        >
                          17 px
                        </button>
                        <button
                          type="button"
                          className={`quiz-font-size-pill ${fontSize === 18 ? 'active' : ''}`}
                          onClick={() => handleSelectFontSize(18)}
                        >
                          18 px
                        </button>
                        <button
                          type="button"
                          className={`quiz-font-size-pill ${fontSize === 19 ? 'active' : ''}`}
                          onClick={() => handleSelectFontSize(19)}
                        >
                          19 px
                        </button>
                        <button
                          type="button"
                          className={`quiz-font-size-pill ${fontSize === 20 ? 'active' : ''}`}
                          onClick={() => handleSelectFontSize(20)}
                        >
                          20 px
                        </button>
                      </div>

                      <div className="quiz-font-custom-section">
                        <div className="quiz-font-custom-header">
                          <span>কাস্টম সাইজ (১০ - ৩৬ px):</span>
                          {![14, 15, 16, 17, 18, 19, 20].includes(fontSize) && (
                            <span className="quiz-font-badge">সক্রিয়: {toBengaliNumber(fontSize)} px</span>
                          )}
                        </div>
                        <div className="quiz-font-custom-size-row">
                          <input
                            type="number"
                            min="10"
                            max="36"
                            placeholder="যেমন: 22"
                            value={customFontSizeInput}
                            onChange={(e) => setCustomFontSizeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyCustomFontSize();
                              }
                            }}
                            className="quiz-font-input"
                          />
                          <button
                            type="button"
                            className="quiz-font-apply-btn"
                            onClick={handleApplyCustomFontSize}
                          >
                            সেট করুন
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="quiz-cut-mark-divider"></div>

                  {/* Section 2: Font Family Accordion */}
                  <div
                    className={`quiz-font-accordion-header ${fontAccordion.family ? 'active' : ''}`}
                    onClick={() => toggleFontAccordion('family')}
                    title="ফন্ট ফ্যামিলি অপশন খুলতে বা বন্ধ করতে ক্লিক করুন"
                  >
                    <div className="quiz-font-accordion-header-left">
                      <i className="fa-solid fa-paragraph" style={{ color: '#007bff' }}></i>
                      <span>ফন্ট ফ্যামিলি:</span>
                    </div>
                    <div className="quiz-font-accordion-header-right">
                      <span className="quiz-font-accordion-badge" style={{ fontFamily }}>
                        <span className="quiz-font-accordion-badge-text">
                          {FONT_FAMILIES.find((f) => f.family === fontFamily)?.name || 'Noto Sans Bengali'}
                        </span>
                      </span>
                      <i className={`fa-solid fa-chevron-${fontAccordion.family ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                    </div>
                  </div>

                  {fontAccordion.family && (
                    <div className="quiz-font-accordion-body">
                      <div className="quiz-font-family-list">
                        {FONT_FAMILIES.map((font) => (
                          <button
                            key={font.id}
                            type="button"
                            className={`quiz-layout-menu-item ${fontFamily === font.family ? 'active' : ''}`}
                            onClick={() => handleSelectFontFamily(font.family)}
                            style={{ fontFamily: font.family }}
                          >
                            <div className="quiz-layout-radio-circle">
                              {fontFamily === font.family && <div className="quiz-layout-radio-inner"></div>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{font.name}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>{font.sub}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="quiz-cut-mark-divider"></div>

                  {/* Section 3: Font Weight Accordion */}
                  <div
                    className={`quiz-font-accordion-header ${fontAccordion.weight ? 'active' : ''}`}
                    onClick={() => toggleFontAccordion('weight')}
                    title="ফন্ট ওয়েট অপশন খুলতে বা বন্ধ করতে ক্লিক করুন"
                  >
                    <div className="quiz-font-accordion-header-left">
                      <i className="fa-solid fa-bold" style={{ color: '#007bff' }}></i>
                      <span>ফন্ট ওয়েট:</span>
                    </div>
                    <div className="quiz-font-accordion-header-right">
                      <span className="quiz-font-accordion-badge">
                        <span className="quiz-font-accordion-badge-text">
                          {fontWeight === 'thin' ? 'Thin' : fontWeight === 'medium' ? 'Medium' : fontWeight === 'bold' ? 'Bold' : 'Regular'}
                        </span>
                      </span>
                      <i className={`fa-solid fa-chevron-${fontAccordion.weight ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                    </div>
                  </div>

                  {fontAccordion.weight && (
                    <div className="quiz-font-accordion-body">
                      <div className="quiz-font-family-list">
                        {FONT_WEIGHTS.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`quiz-layout-menu-item ${fontWeight === item.value ? 'active' : ''}`}
                            onClick={() => handleSelectFontWeight(item.value)}
                          >
                            <div className="quiz-layout-radio-circle">
                              {fontWeight === item.value && <div className="quiz-layout-radio-inner"></div>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: item.weight }}>{item.name}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>{item.sub}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

        {/* Controls Bar */}
        <div className="quiz-controls-bar">
          <div className="quiz-nav-actions">
            <button className="quiz-btn-reset" onClick={resetQuiz}>
              <i className="fa-solid fa-rotate-right"></i> পুনরায় শুরু করুন
            </button>

            {/* Read Mode Switch */}
            <label className="quiz-switch-label" style={{ background: '#e2e8f0', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
              <label className="quiz-switch">
                <input
                  type="checkbox"
                  checked={isReadMode}
                  onChange={(e) => handleReadModeToggle(e.target.checked)}
                />
                <span className="quiz-slider"></span>
              </label>
              আগে পড়ুন
            </label>

            {/* Ask AI Switcher */}
            <label
              className="quiz-switch-label quiz-ask-ai-switcher"
              style={{
                background: showAskAi ? '#e0f2fe' : '#e2e8f0',
                color: showAskAi ? '#0284c7' : '#2c3e50',
                border: showAskAi ? '1px solid #7dd3fc' : '1px solid transparent',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              title={showAskAi ? 'Ask AI বাটন বন্ধ করুন' : 'Ask AI বাটন চালু করুন'}
            >
              <label className="quiz-switch">
                <input
                  type="checkbox"
                  checked={showAskAi}
                  onChange={(e) => handleAskAiToggle(e.target.checked)}
                />
                <span className="quiz-slider" style={showAskAi ? { backgroundColor: '#0284c7' } : {}}></span>
              </label>
              Ask AI
            </label>
          </div>

          <div className="quiz-right-controls-group">
            {/* Range and Limit filters */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Questions Count Custom Dropdown Menu */}
              <div className="quiz-layout-dropdown-wrapper" ref={limitDropdownRef}>
                <button
                  type="button"
                  className="quiz-layout-trigger-btn"
                  onClick={() => setShowLimitMenu(!showLimitMenu)}
                  title="প্রশ্নের সংখ্যা নির্ধারণ করুন"
                >
                  <i className="fa-solid fa-list-ol" style={{ color: '#007bff' }}></i>
                  <span>
                    {limit === 'all'
                      ? 'সকল প্রশ্ন'
                      : limit === '20'
                      ? '২০ টি প্রশ্ন'
                      : limit === '25'
                      ? '২৫ টি প্রশ্ন'
                      : limit === '50'
                      ? '৫০ টি প্রশ্ন'
                      : limit === '100'
                      ? '১০০ টি প্রশ্ন'
                      : 'সকল প্রশ্ন'}
                  </span>
                  <i className={`fa-solid fa-chevron-${showLimitMenu ? 'up' : 'down'}`} style={{ fontSize: '11px', color: '#64748b' }}></i>
                </button>

                {showLimitMenu && (
                  <div className="quiz-layout-popup-menu">
                    <button
                      type="button"
                      className={`quiz-layout-menu-item ${limit === 'all' ? 'active' : ''}`}
                      onClick={() => { setLimit('all'); setRangeIndex(0); setShowLimitMenu(false); }}
                    >
                      <div className="quiz-layout-radio-circle">
                        {limit === 'all' && <div className="quiz-layout-radio-inner"></div>}
                      </div>
                      <span>সকল প্রশ্ন</span>
                    </button>

                    <button
                      type="button"
                      className={`quiz-layout-menu-item ${limit === '20' ? 'active' : ''}`}
                      onClick={() => { setLimit('20'); setRangeIndex(0); setShowLimitMenu(false); }}
                    >
                      <div className="quiz-layout-radio-circle">
                        {limit === '20' && <div className="quiz-layout-radio-inner"></div>}
                      </div>
                      <span>২০ টি প্রশ্ন</span>
                    </button>

                    <button
                      type="button"
                      className={`quiz-layout-menu-item ${limit === '25' ? 'active' : ''}`}
                      onClick={() => { setLimit('25'); setRangeIndex(0); setShowLimitMenu(false); }}
                    >
                      <div className="quiz-layout-radio-circle">
                        {limit === '25' && <div className="quiz-layout-radio-inner"></div>}
                      </div>
                      <span>২৫ টি প্রশ্ন</span>
                    </button>

                    <button
                      type="button"
                      className={`quiz-layout-menu-item ${limit === '50' ? 'active' : ''}`}
                      onClick={() => { setLimit('50'); setRangeIndex(0); setShowLimitMenu(false); }}
                    >
                      <div className="quiz-layout-radio-circle">
                        {limit === '50' && <div className="quiz-layout-radio-inner"></div>}
                      </div>
                      <span>৫০ টি প্রশ্ন</span>
                    </button>

                    <button
                      type="button"
                      className={`quiz-layout-menu-item ${limit === '100' ? 'active' : ''}`}
                      onClick={() => { setLimit('100'); setRangeIndex(0); setShowLimitMenu(false); }}
                    >
                      <div className="quiz-layout-radio-circle">
                        {limit === '100' && <div className="quiz-layout-radio-inner"></div>}
                      </div>
                      <span>১০০ টি প্রশ্ন</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Range Custom Dropdown Menu shown to the RIGHT when limit !== 'all' */}
              {limit !== 'all' && (
                <div className="quiz-layout-dropdown-wrapper" ref={rangeDropdownRef}>
                  <button
                    type="button"
                    className="quiz-layout-trigger-btn"
                    onClick={() => setShowRangeMenu(!showRangeMenu)}
                    title="প্রশ্নের রেঞ্জ নির্ধারণ করুন"
                  >
                    <span>{getRangeOptions().find((o) => o.value === rangeIndex)?.label || '১ - ২০'}</span>
                    <i className={`fa-solid fa-chevron-${showRangeMenu ? 'up' : 'down'}`} style={{ fontSize: '11px', color: '#64748b' }}></i>
                  </button>

                  {showRangeMenu && (
                    <div className="quiz-layout-popup-menu" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                      {getRangeOptions().map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`quiz-layout-menu-item ${rangeIndex === opt.value ? 'active' : ''}`}
                          onClick={() => { setRangeIndex(opt.value); setShowRangeMenu(false); }}
                        >
                          <div className="quiz-layout-radio-circle">
                            {rangeIndex === opt.value && <div className="quiz-layout-radio-inner"></div>}
                          </div>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Switches (Never Removed, Disabled when Read Mode is ON) */}
            <div className="quiz-switch-group">
              {/* Color Switch */}
              <label className="quiz-switch-label">
                <label className="quiz-switch">
                  <input
                    type="checkbox"
                    checked={showColor}
                    onChange={(e) => setShowColor(e.target.checked)}
                  />
                  <span className="quiz-slider"></span>
                </label>
                <span className="quiz-color-dots-icon">
                  <span className="quiz-dot-red"></span>
                  <span className="quiz-dot-green"></span>
                </span>
              </label>

              {/* Answer Switch */}
              <label className="quiz-switch-label">
                <label className="quiz-switch">
                  <input
                    type="checkbox"
                    checked={showAnswer}
                    onChange={(e) => setShowAnswer(e.target.checked)}
                  />
                  <span className="quiz-slider"></span>
                </label>
                সঠিক উত্তর
              </label>

              {/* Explanation Switch */}
              <label className="quiz-switch-label">
                <label className="quiz-switch">
                  <input
                    type="checkbox"
                    checked={showExplanation}
                    onChange={(e) => setShowExplanation(e.target.checked)}
                  />
                  <span className="quiz-slider"></span>
                </label>
                ব্যাখ্যা
              </label>

              {/* Time Switch (Disabled in Read Mode, never removed) */}
              <label className={`quiz-switch-label ${isReadMode ? 'disabled-switch' : ''}`}>
                <label className="quiz-switch">
                  <input
                    type="checkbox"
                    checked={showTime}
                    disabled={isReadMode}
                    onChange={(e) => {
                      if (!isReadMode) {
                        setShowTime(e.target.checked);
                        if (e.target.checked) resetQuizState();
                      }
                    }}
                  />
                  <span className="quiz-slider"></span>
                </label>
                সময়
              </label>

              {/* Score Switch (Disabled in Read Mode, never removed) */}
              <label className={`quiz-switch-label ${isReadMode ? 'disabled-switch' : ''}`}>
                <label className="quiz-switch">
                  <input
                    type="checkbox"
                    checked={showScore}
                    disabled={isReadMode}
                    onChange={(e) => {
                      if (!isReadMode) setShowScore(e.target.checked);
                    }}
                  />
                  <span className="quiz-slider"></span>
                </label>
                স্কোর
              </label>
            </div>
          </div>
        </div>

        {/* Questions Display */}
        {!planStatus.isPaid ? (
          <div className="quiz-paywall-card">
            <div className={`quiz-paywall-icon-box ${planStatus.isLoggedIn ? 'crown-icon' : 'lock-icon'}`}>
              <i className={planStatus.isLoggedIn ? 'fa-solid fa-crown' : 'fa-solid fa-lock'}></i>
            </div>
            <h3 className="quiz-paywall-title">
              {planStatus.isLoggedIn ? 'অ্যাক্টিভ প্ল্যান লাগবে' : 'লগইন করে প্ল্যান পারচেজ করতে হবে'}
            </h3>
            {planStatus.isLoggedIn ? (
              <>
                <div className="quiz-paywall-plan-badge">
                  ইউজার: <strong>{planStatus.user?.name || planStatus.user?.phone || 'ব্যবহারকারী'}</strong> &nbsp;|&nbsp; স্ট্যাটাস: <span className="badge-inactive">কোনো সক্রিয় প্ল্যান নেই</span>
                </div>
                <p className="quiz-paywall-desc">
                  আপনার অ্যাকাউন্টে কোনো সক্রিয় প্ল্যান নেই। এই বিষয়ের সকল প্রশ্ন ও মডেল টেস্ট অনুশীলন করার জন্য একটি অ্যাক্টিভ প্ল্যান লাগবে, অনুগ্রহ করে একটি প্ল্যান পারচেজ করুন।
                </p>
                <div className="quiz-paywall-actions">
                  <Link href="/packages" className="btn btn-primary quiz-paywall-btn">
                    <i className="fa-solid fa-bolt"></i> প্ল্যান পারচেজ করুন
                  </Link>
                  <Link href="/profile" className="quiz-paywall-btn-outline">
                    <i className="fa-solid fa-user-gear"></i> প্রোফাইল ও সাবস্ক্রিপশন
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="quiz-paywall-desc">
                  এই বিষয়ের সকল পেইড প্রশ্ন ও পূর্ণাঙ্গ মডেল টেস্ট অনুশীলন করার জন্য আপনাকে প্রথমে লগইন করে একটি প্ল্যান পারচেজ করতে হবে।
                </p>
                <div className="quiz-paywall-actions">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/questions${categoryParam ? `?category=${encodeURIComponent(categoryParam)}` : ''}`)}`}
                    className="btn btn-primary quiz-paywall-btn"
                  >
                    <i className="fa-solid fa-right-to-bracket"></i> লগইন করুন
                  </Link>
                  <Link href="/packages" className="quiz-paywall-btn-outline">
                    <i className="fa-solid fa-gem"></i> প্যাকেজসমূহ দেখুন
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
            ডাটাবেজ থেকে প্রশ্ন লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
          </p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: 'var(--danger)', padding: '30px 0' }}>
            {error}
          </p>
        ) : displayQuestions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            কোনো প্রশ্ন পাওয়া যায়নি।
          </p>
        ) : optionLayout === '2q-col' ? (
          <div className="quiz-questions-col-wrapper">
            <div className="quiz-questions-column">
              {displayQuestions
                .slice(0, Math.ceil(displayQuestions.length / 2))
                .map((q, idx) => {
                  const chosen = answeredQuestions[idx];
                  const isAnswered = chosen !== undefined;
                  const shouldShow = isReadMode || isAnswered;
                  const isAnswerVisible = shouldShow && showAnswer;
                  const isExplanationVisible = shouldShow && showExplanation;

                  return (
                    <div key={q._id || idx} className="quiz-question-block">
                      <div className="quiz-question-text">
                        {idx + 1}. {q.q}{' '}
                        {showAskAi && (
                          <button
                            type="button"
                            className="quiz-ask-ai-btn"
                            onClick={() => handleAskAI(q, idx)}
                            title="Ask AI"
                          >
                            Ask AI
                          </button>
                        )}
                      </div>

                      <div className="quiz-options-container layout-1">
                        {(q.options || []).map((opt, optIndex) => {
                          let btnClass = 'quiz-option-btn';

                          if (isReadMode) {
                            btnClass += ' disabled';
                            if (optIndex === q.ans) {
                              btnClass += showColor ? ' correct' : ' neutral-selected';
                            }
                          } else if (isAnswered) {
                            btnClass += ' disabled';
                            if (showColor) {
                              if (optIndex === q.ans) {
                                btnClass += ' correct';
                              } else if (chosen === optIndex) {
                                btnClass += ' incorrect';
                              }
                            } else {
                              if (chosen === optIndex) {
                                btnClass += ' neutral-selected';
                              }
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              className={btnClass}
                              disabled={isReadMode || isAnswered}
                              onClick={() => handleAnswerClick(idx, optIndex)}
                            >
                              <div className="quiz-option-circle font-bn">
                                {getBanglaLetter(optIndex)}
                              </div>
                              <div className="quiz-option-text">
                                {opt}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {isAnswerVisible && (
                        <div className="quiz-answer-text" style={{ display: 'block' }}>
                          <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                          সঠিক উত্তর: {getBanglaLetter(q.ans)}. {q.options[q.ans]}
                        </div>
                      )}

                      {isExplanationVisible && q.explanation && (
                        <div className="quiz-explanation-text" style={{ display: 'block' }}>
                          <strong>ব্যাখ্যা:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="quiz-questions-column">
              {displayQuestions
                .slice(Math.ceil(displayQuestions.length / 2))
                .map((q, idx) => {
                  const actualIdx = idx + Math.ceil(displayQuestions.length / 2);
                  const chosen = answeredQuestions[actualIdx];
                  const isAnswered = chosen !== undefined;
                  const shouldShow = isReadMode || isAnswered;
                  const isAnswerVisible = shouldShow && showAnswer;
                  const isExplanationVisible = shouldShow && showExplanation;

                  return (
                    <div key={q._id || actualIdx} className="quiz-question-block">
                      <div className="quiz-question-text">
                        {actualIdx + 1}. {q.q}{' '}
                        {showAskAi && (
                          <button
                            type="button"
                            className="quiz-ask-ai-btn"
                            onClick={() => handleAskAI(q, actualIdx)}
                            title="Ask AI"
                          >
                            Ask AI
                          </button>
                        )}
                      </div>

                      <div className="quiz-options-container layout-1">
                        {(q.options || []).map((opt, optIndex) => {
                          let btnClass = 'quiz-option-btn';

                          if (isReadMode) {
                            btnClass += ' disabled';
                            if (optIndex === q.ans) {
                              btnClass += showColor ? ' correct' : ' neutral-selected';
                            }
                          } else if (isAnswered) {
                            btnClass += ' disabled';
                            if (showColor) {
                              if (optIndex === q.ans) {
                                btnClass += ' correct';
                              } else if (chosen === optIndex) {
                                btnClass += ' incorrect';
                              }
                            } else {
                              if (chosen === optIndex) {
                                btnClass += ' neutral-selected';
                              }
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              className={btnClass}
                              disabled={isReadMode || isAnswered}
                              onClick={() => handleAnswerClick(actualIdx, optIndex)}
                            >
                              <div className="quiz-option-circle font-bn">
                                {getBanglaLetter(optIndex)}
                              </div>
                              <div className="quiz-option-text">
                                {opt}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {isAnswerVisible && (
                        <div className="quiz-answer-text" style={{ display: 'block' }}>
                          <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                          সঠিক উত্তর: {getBanglaLetter(q.ans)}. {q.options[q.ans]}
                        </div>
                      )}

                      {isExplanationVisible && q.explanation && (
                        <div className="quiz-explanation-text" style={{ display: 'block' }}>
                          <strong>ব্যাখ্যা:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ) : optionLayout === '2q-row' ? (
          <div className="quiz-questions-col-wrapper">
            <div className="quiz-questions-column">
              {displayQuestions
                .filter((_, idx) => idx % 2 === 0)
                .map((q, i) => {
                  const actualIdx = i * 2;
                  const chosen = answeredQuestions[actualIdx];
                  const isAnswered = chosen !== undefined;
                  const shouldShow = isReadMode || isAnswered;
                  const isAnswerVisible = shouldShow && showAnswer;
                  const isExplanationVisible = shouldShow && showExplanation;

                  return (
                    <div key={q._id || actualIdx} className="quiz-question-block">
                      <div className="quiz-question-text">
                        {actualIdx + 1}. {q.q}{' '}
                        {showAskAi && (
                          <button
                            type="button"
                            className="quiz-ask-ai-btn"
                            onClick={() => handleAskAI(q, actualIdx)}
                            title="Ask AI"
                          >
                            Ask AI
                          </button>
                        )}
                      </div>

                      <div className="quiz-options-container layout-1">
                        {(q.options || []).map((opt, optIndex) => {
                          let btnClass = 'quiz-option-btn';

                          if (isReadMode) {
                            btnClass += ' disabled';
                            if (optIndex === q.ans) {
                              btnClass += showColor ? ' correct' : ' neutral-selected';
                            }
                          } else if (isAnswered) {
                            btnClass += ' disabled';
                            if (showColor) {
                              if (optIndex === q.ans) {
                                btnClass += ' correct';
                              } else if (chosen === optIndex) {
                                btnClass += ' incorrect';
                              }
                            } else {
                              if (chosen === optIndex) {
                                btnClass += ' neutral-selected';
                              }
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              className={btnClass}
                              disabled={isReadMode || isAnswered}
                              onClick={() => handleAnswerClick(actualIdx, optIndex)}
                            >
                              <div className="quiz-option-circle font-bn">
                                {getBanglaLetter(optIndex)}
                              </div>
                              <div className="quiz-option-text">
                                {opt}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {isAnswerVisible && (
                        <div className="quiz-answer-text" style={{ display: 'block' }}>
                          <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                          সঠিক উত্তর: {getBanglaLetter(q.ans)}. {q.options[q.ans]}
                        </div>
                      )}

                      {isExplanationVisible && q.explanation && (
                        <div className="quiz-explanation-text" style={{ display: 'block' }}>
                          <strong>ব্যাখ্যা:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="quiz-questions-column">
              {displayQuestions
                .filter((_, idx) => idx % 2 === 1)
                .map((q, i) => {
                  const actualIdx = i * 2 + 1;
                  const chosen = answeredQuestions[actualIdx];
                  const isAnswered = chosen !== undefined;
                  const shouldShow = isReadMode || isAnswered;
                  const isAnswerVisible = shouldShow && showAnswer;
                  const isExplanationVisible = shouldShow && showExplanation;

                  return (
                    <div key={q._id || actualIdx} className="quiz-question-block">
                      <div className="quiz-question-text">
                        {actualIdx + 1}. {q.q}{' '}
                        {showAskAi && (
                          <button
                            type="button"
                            className="quiz-ask-ai-btn"
                            onClick={() => handleAskAI(q, actualIdx)}
                            title="Ask AI"
                          >
                            Ask AI
                          </button>
                        )}
                      </div>

                      <div className="quiz-options-container layout-1">
                        {(q.options || []).map((opt, optIndex) => {
                          let btnClass = 'quiz-option-btn';

                          if (isReadMode) {
                            btnClass += ' disabled';
                            if (optIndex === q.ans) {
                              btnClass += showColor ? ' correct' : ' neutral-selected';
                            }
                          } else if (isAnswered) {
                            btnClass += ' disabled';
                            if (showColor) {
                              if (optIndex === q.ans) {
                                btnClass += ' correct';
                              } else if (chosen === optIndex) {
                                btnClass += ' incorrect';
                              }
                            } else {
                              if (chosen === optIndex) {
                                btnClass += ' neutral-selected';
                              }
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              className={btnClass}
                              disabled={isReadMode || isAnswered}
                              onClick={() => handleAnswerClick(actualIdx, optIndex)}
                            >
                              <div className="quiz-option-circle font-bn">
                                {getBanglaLetter(optIndex)}
                              </div>
                              <div className="quiz-option-text">
                                {opt}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {isAnswerVisible && (
                        <div className="quiz-answer-text" style={{ display: 'block' }}>
                          <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                          সঠিক উত্তর: {getBanglaLetter(q.ans)}. {q.options[q.ans]}
                        </div>
                      )}

                      {isExplanationVisible && q.explanation && (
                        <div className="quiz-explanation-text" style={{ display: 'block' }}>
                          <strong>ব্যাখ্যা:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="quiz-questions-wrapper">
            {displayQuestions.map((q, qIndex) => {
              const chosen = answeredQuestions[qIndex];
              const isAnswered = chosen !== undefined;

              // Exact quiz.html updateVisibility logic:
              // const shouldShow = isReadMode || answeredQuestions[qIndex] !== undefined;
              const shouldShow = isReadMode || isAnswered;

              // Only show 'সঠিক উত্তর' if shouldShow is TRUE and 'showAnswer' switch is ON!
              const isAnswerVisible = shouldShow && showAnswer;

              // Only show 'ব্যাখ্যা' if shouldShow is TRUE and 'showExplanation' switch is ON!
              const isExplanationVisible = shouldShow && showExplanation;

              return (
                <div key={q._id || qIndex} className="quiz-question-block">
                  <div className="quiz-question-text">
                    {qIndex + 1}. {q.q}{' '}
                    {showAskAi && (
                      <button
                        type="button"
                        className="quiz-ask-ai-btn"
                        onClick={() => handleAskAI(q, qIndex)}
                        title="Ask AI"
                      >
                        Ask AI
                      </button>
                    )}
                  </div>

                  <div className={`quiz-options-container layout-${optionLayout}`}>
                    {(q.options || []).map((opt, optIndex) => {
                      let btnClass = 'quiz-option-btn';

                      if (isReadMode) {
                        // Read Mode: Options are non-clickable, correct answer is green (if showColor)
                        btnClass += ' disabled';
                        if (optIndex === q.ans) {
                          btnClass += showColor ? ' correct' : ' neutral-selected';
                        }
                      } else if (isAnswered) {
                        // Locked after 1 click!
                        btnClass += ' disabled';
                        if (showColor) {
                          if (optIndex === q.ans) {
                            btnClass += ' correct';
                          } else if (chosen === optIndex) {
                            btnClass += ' incorrect';
                          }
                        } else {
                          if (chosen === optIndex) {
                            btnClass += ' neutral-selected';
                          }
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          className={btnClass}
                          disabled={isReadMode || isAnswered}
                          onClick={() => handleAnswerClick(qIndex, optIndex)}
                        >
                          <div className="quiz-option-circle font-bn">
                            {getBanglaLetter(optIndex)}
                          </div>
                          <div className="quiz-option-text">
                            {opt}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Correct Answer reveal: Only shows after clicking/readMode AND when showAnswer switch is ON */}
                  {isAnswerVisible && (
                    <div className="quiz-answer-text" style={{ display: 'block' }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i>
                      সঠিক উত্তর: {getBanglaLetter(q.ans)}. {q.options[q.ans]}
                    </div>
                  )}

                  {/* Explanation reveal: Only shows after clicking/readMode AND when showExplanation switch is ON */}
                  {isExplanationVisible && q.explanation && (
                    <div className="quiz-explanation-text" style={{ display: 'block' }}>
                      <strong>ব্যাখ্যা:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Result Section */}
        {!loading && displayQuestions.length > 0 && (
          <div className="quiz-result-section">
            <h2>পরীক্ষার ফলাফল</h2>
            <div className="quiz-detailed-stats">
              সঠিক উত্তর: <span className="quiz-correct-count">{correctCount}</span> টি
              &nbsp;&nbsp;|&nbsp;&nbsp;
              ভুল উত্তর: <span className="quiz-incorrect-count">{incorrectCount}</span> টি
              &nbsp;&nbsp;|&nbsp;&nbsp;
              উত্তর দেওয়া হয়নি: <span>{unansweredCount}</span> টি
            </div>

            {/* Progress Bar with Interactive Percentage & Hover Tooltip */}
            <div className="quiz-progress-bar-container">
              <div
                className="quiz-progress-correct"
                style={{ width: `${correctPercent}%` }}
                onMouseMove={(e) => handleProgressBarMouseMove(e, 'correct')}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
              >
                {correctPercent >= 8 ? `${Math.round(correctPercent)}%` : ''}
              </div>
              <div
                className="quiz-progress-incorrect"
                style={{ width: `${incorrectPercent}%` }}
                onMouseMove={(e) => handleProgressBarMouseMove(e, 'incorrect')}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
              >
                {incorrectPercent >= 8 ? `${Math.round(incorrectPercent)}%` : ''}
              </div>
              <div
                className="quiz-progress-unanswered"
                style={{ width: `${unansweredPercent}%` }}
                onMouseMove={(e) => handleProgressBarMouseMove(e, 'unanswered')}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
              >
                {unansweredPercent >= 8 ? `${Math.round(unansweredPercent)}%` : ''}
              </div>
            </div>

            <div id="final-score">
              আপনার মোট প্রাপ্ত স্কোর: {score.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Launcher Trigger Button (Bottom Right) */}
      <button
        type="button"
        className="ai-floating-trigger-btn"
        onClick={() => {
          const status = checkUserPlanStatus();
          if (!status.isLoggedIn) {
            setPopup({
              visible: true,
              type: 'warning',
              title: 'লগইন ও সক্রিয় প্ল্যান প্রয়োজন',
              msg: 'আপনার কোনো সক্রিয় প্ল্যান নেই। Ask AI দেখার জন্য সক্রিয় প্ল্যান লাগবে, অনুগ্রহ করে লগইন করে একটি প্ল্যান পারচেজ করুন।',
              hasReset: false,
              isLoginRequired: true,
              isPlanRequired: false
            });
            return;
          }
          if (!status.isPaid) {
            setPopup({
              visible: true,
              type: 'warning',
              title: 'সক্রিয় প্ল্যান প্রয়োজন',
              msg: 'আপনার কোনো সক্রিয় প্ল্যান নেই। Ask AI দেখার জন্য সক্রিয় প্ল্যান লাগবে, অনুগ্রহ করে একটি প্ল্যান পারচেজ করুন।',
              hasReset: false,
              isLoginRequired: false,
              isPlanRequired: true
            });
            return;
          }
          setIsAiOpen(!isAiOpen);
        }}
        title="TopMCQBD AI শিক্ষক"
      >
        <img src="/images/logo-white-icon.png" alt="AI" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        <span className="ai-floating-pulse"></span>
      </button>

      {/* AI Chat Drawer Component */}
      <AiChatDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        activePrompt={activeAiPrompt}
        questionContext={activeAiContext}
        onPromptProcessed={() => setActiveAiPrompt('')}
      />
    </div>
  );
}

const QuestionsComponent = dynamic(() => Promise.resolve(QuestionsComponentInternal), {
  ssr: false,
  loading: () => (
    <div className="quiz-section-wrapper font-bn" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
          <span className="visually-hidden">লোড হচ্ছে...</span>
        </div>
        <p style={{ marginTop: '16px', color: '#64748b', fontSize: '15px' }}>
          প্রশ্নব্যাংক লোড হচ্ছে...
        </p>
      </div>
    </div>
  )
});

export default function SubjectiveAllMcqsPracticeQuestionsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>প্রশ্ন লোড হচ্ছে...</div>}>
      <QuestionsComponent />
    </Suspense>
  );
}
