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
  },
  {
    id: 'noto-sans-math',
    name: 'Noto Sans Math',
    sub: 'নোটো সান্স ম্যাথ (ম্যাথ ও টেক্সট)',
    family: "'Noto Sans Math', 'Noto Sans Bengali', sans-serif"
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

const PRESET_LIST = [
  { id: 'practice', name: 'অনুশীলন', icon: 'fa-graduation-cap' },
  { id: 'read', name: 'Read', icon: 'fa-book-open' },
  { id: 'exam', name: 'Live exam', icon: 'fa-stopwatch' },
  { id: 'custom', name: 'My setting', icon: 'fa-sliders' }
];

const BANGLA_LETTERS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
const ENGLISH_LETTERS = ['A', 'B', 'C', 'D', 'E'];

const DEFAULT_PRESET_PROFILES = {
  practice: {
    questionLayout: '2q-col',
    optionLayout: '1',
    middleLine: 'dotted',
    middleGap: 20,
    optionLetter: 'bangla',
    questionStyle: 'dotted',
    highlightMode: 'single',
    highlightColor: 'full-bg',
    explanationMode: 'on-select',
    showExplanation: true,
    cutMark: 0.5,
    cutMarkMode: '0.5',
    customCutMarkInput: '',
    fontSize: 16,
    fontFamily: "'Noto Sans Bengali', sans-serif",
    fontWeight: 'regular',
    customFontSizeInput: '',
    showAnswer: false
  },
  read: {
    questionLayout: '2q-col',
    optionLayout: '1',
    middleLine: 'dotted',
    middleGap: 20,
    optionLetter: 'bangla',
    questionStyle: 'dotted',
    highlightMode: 'both',
    highlightColor: 'full-bg',
    explanationMode: 'on-select',
    showExplanation: true,
    cutMark: 0,
    cutMarkMode: '0',
    customCutMarkInput: '',
    fontSize: 16,
    fontFamily: "'Noto Sans Bengali', sans-serif",
    fontWeight: 'regular',
    customFontSizeInput: '',
    showAnswer: true
  },
  exam: {
    questionLayout: '2q-col',
    optionLayout: '1',
    middleLine: 'dotted',
    middleGap: 20,
    optionLetter: 'bangla',
    questionStyle: 'box',
    highlightMode: 'neutral',
    highlightColor: 'full-bg',
    explanationMode: 'none',
    showExplanation: false,
    cutMark: 0.5,
    cutMarkMode: '0.5',
    customCutMarkInput: '',
    fontSize: 16,
    fontFamily: "'Noto Sans Bengali', sans-serif",
    fontWeight: 'regular',
    customFontSizeInput: '',
    showAnswer: false
  },
  custom: {
    questionLayout: '2q-col',
    optionLayout: '1',
    middleLine: 'dotted',
    middleGap: 20,
    optionLetter: 'bangla',
    questionStyle: 'dotted',
    highlightMode: 'single',
    highlightColor: 'full-bg',
    explanationMode: 'on-select',
    showExplanation: true,
    cutMark: 0.5,
    cutMarkMode: '0.5',
    customCutMarkInput: '',
    fontSize: 16,
    fontFamily: "'Noto Sans Bengali', sans-serif",
    fontWeight: 'regular',
    customFontSizeInput: '',
    showAnswer: false
  }
};

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
  const [activeMode, setActiveMode] = useState('practice'); // 'practice' | 'read' | 'exam'
  const [showAskAi, setShowAskAi] = useState(false); // Default OFF (toggled via switcher next to Read Mode)
  const [showColor, setShowColor] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false); // Default OFF
  const [showExplanation, setShowExplanation] = useState(true); // Default ON
  const [showTime, setShowTime] = useState(false); // Default OFF
  const [showScore, setShowScore] = useState(true); // Default ON
  // Layout states: Question Layout ('2q-col' | '2q-row' | '3q-col' | '1q') & Option Layout ('1' | '2' | '4')
  const [questionLayout, setQuestionLayout] = useState('2q-col'); // Default: '2q-col' (১ লাইনে ২টি প্রশ্ন - উপর-নিচ ক্রম)
  const [optionLayout, setOptionLayout] = useState('1'); // Default: '1' (১ লাইনে ১টি option)
  const [layoutSubAccordion, setLayoutSubAccordion] = useState({ style: true, question: true, option: false, middleLine: false, middleGap: false });
  // Middle Line state: 'dotted' (default) | 'solid' | 'none'
  const [middleLine, setMiddleLine] = useState('dotted');
  // Middle Gap state: 0 (No Gap) | 20 (default) | 30 | custom
  const [middleGap, setMiddleGap] = useState(20);
  const [customMiddleGapInput, setCustomMiddleGapInput] = useState('');
  const [showGlobalSettingsMenu, setShowGlobalSettingsMenu] = useState(false);
  const [showFourOptionConditionHint, setShowFourOptionConditionHint] = useState(false);
  const [resetSettingsSuccess, setResetSettingsSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState('practice');
  const activePresetRef = useRef('practice');
  const globalSettingsRef = useRef(null);
  const conditionHintRef = useRef(null);

  // Preset Profile Helper: Saves setting to active preset profile in localStorage
  function saveActivePresetSetting(key, value) {
    if (typeof window === 'undefined') return;
    try {
      const currentPreset = activePresetRef.current || 'practice';
      const raw = localStorage.getItem('topmcqbd_preset_profiles');
      let profiles = {};
      if (raw) {
        try { profiles = JSON.parse(raw); } catch (e) { profiles = {}; }
      }
      if (!profiles[currentPreset]) {
        profiles[currentPreset] = { ...(DEFAULT_PRESET_PROFILES[currentPreset] || DEFAULT_PRESET_PROFILES.practice) };
      }
      profiles[currentPreset][key] = value;
      localStorage.setItem('topmcqbd_preset_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.warn('Error saving preset setting:', e);
    }
  }

  const toggleLayoutSubAccordion = (sec) => {
    setLayoutSubAccordion((prev) => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  const handleSelectQuestionLayout = (layout) => {
    setQuestionLayout(layout);
    if (layout === '1q') {
      setShowFourOptionConditionHint(false);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_question_layout', layout);
    }
    saveActivePresetSetting('questionLayout', layout);
    // ১ লাইনে ৪টি option: প্রশ্ন Layout >> ১ লাইনে ১টি প্রশ্ন option choose korle sudhu dekhabe ba enable hobe
    if (layout !== '1q' && optionLayout === '4') {
      setOptionLayout('1');
      if (typeof window !== 'undefined') {
        localStorage.setItem('topmcqbd_option_layout', '1');
      }
      saveActivePresetSetting('optionLayout', '1');
    }
  };

  const handleSelectOptionLayout = (layout) => {
    setOptionLayout(layout);
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_option_layout', layout);
    }
    saveActivePresetSetting('optionLayout', layout);
  };

  const handleSelectMiddleLine = (line) => {
    setMiddleLine(line);
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_middle_line', line);
    }
    saveActivePresetSetting('middleLine', line);
  };

  const handleSelectMiddleGap = (gap) => {
    const num = Math.max(0, Math.min(100, parseInt(gap, 10) || 0));
    setMiddleGap(num);
    if (![0, 20, 30].includes(num)) {
      setCustomMiddleGapInput(String(num));
    } else {
      setCustomMiddleGapInput('');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_middle_gap', String(num));
    }
    saveActivePresetSetting('middleGap', num);
  };

  const handleApplyCustomMiddleGap = () => {
    const num = parseInt(customMiddleGapInput, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      handleSelectMiddleGap(num);
    }
  };

  // Question Design Style: 'dotted' (default) | 'box'
  const [questionStyle, setQuestionStyle] = useState('dotted');

  const handleSelectQuestionStyle = (style) => {
    setQuestionStyle(style);
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_question_style', style);
    }
    saveActivePresetSetting('questionStyle', style);
  };

  // Color Answer Style: 1. Highlight Mode (Scope) & 2. Highlight Color (Style)
  // highlightMode: 'single' (শুধু নির্বাচিত অপশন হাইলাইট) | 'both' (সঠিক ও ভুল উভয়টি দেখান) | 'neutral' (সঠিক বা ভুল দেখাবে না)
  const [highlightMode, setHighlightMode] = useState('single');
  // highlightColor: 'full-bg' | 'border-only' | 'label-only' | 'highlight-and-circle' | 'with-icons' | 'bottom-line' | 'soft-highlight'
  const [highlightColor, setHighlightColor] = useState('full-bg');
  const [colorStyleSubAccordion, setColorStyleSubAccordion] = useState({ style: true, color: true });

  const toggleColorStyleSubAccordion = (sec) => {
    setColorStyleSubAccordion((prev) => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  const handleSelectHighlightMode = (mode) => {
    setHighlightMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_highlight_mode', mode);
    }
    saveActivePresetSetting('highlightMode', mode);
  };

  const handleSelectHighlightColor = (color) => {
    setHighlightColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_highlight_color', color);
    }
    saveActivePresetSetting('highlightColor', color);
  };

  // Explanation settings: 'on-select' (default) | 'on-button' | 'on-wrong' | 'none'
  const [explanationMode, setExplanationMode] = useState('on-select');
  const [lastActiveExplanationMode, setLastActiveExplanationMode] = useState('on-select');
  const [expandedExplanations, setExpandedExplanations] = useState({});

  const handleSelectExplanationMode = (mode) => {
    setExplanationMode(mode);
    if (mode !== 'none') {
      setLastActiveExplanationMode(mode);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_explanation_mode', mode);
    }
    if (mode === 'none') {
      setShowExplanation(false);
    } else {
      setShowExplanation(true);
    }
    saveActivePresetSetting('explanationMode', mode);
    saveActivePresetSetting('showExplanation', mode !== 'none');
  };

  const handleToggleExplanationSwitch = (checked) => {
    if (checked) {
      const target = lastActiveExplanationMode && lastActiveExplanationMode !== 'none' ? lastActiveExplanationMode : 'on-select';
      handleSelectExplanationMode(target);
    } else {
      handleSelectExplanationMode('none');
    }
  };

  const getExplanationSwitchLabel = () => {
    if (explanationMode === 'on-select') return 'ব্যাখ্যা (স্বয়ংক্রিয়)';
    if (explanationMode === 'on-button') return 'ব্যাখ্যা (ম্যানুয়াল)';
    if (explanationMode === 'on-wrong') return 'ব্যাখ্যা (ভুল প্রশ্নে)';
    return 'ব্যাখ্যা';
  };

  const toggleQuestionExplanation = (qIndex) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [qIndex]: !prev[qIndex]
    }));
  };

  // Option Letter state: 'bangla' (default: ক, খ, গ, ঘ) | 'english' (A, B, C, D)
  const [optionLetter, setOptionLetter] = useState('bangla');

  const handleSelectOptionLetter = (letter) => {
    setOptionLetter(letter);
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_option_letter', letter);
    }
    saveActivePresetSetting('optionLetter', letter);
  };

  // Explanation & Answer Sub-Accordion states: { answer: true, explanation: true }
  const [explanationSubAccordion, setExplanationSubAccordion] = useState({ answer: true, explanation: true });

  const toggleExplanationSubAccordion = (sec) => {
    setExplanationSubAccordion((prev) => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  const handleSelectShowAnswer = (val) => {
    setShowAnswer(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('topmcqbd_show_answer', val ? 'true' : 'false');
    }
    saveActivePresetSetting('showAnswer', val);
  };

  const [globalAccordion, setGlobalAccordion] = useState({ layout: false, questionStyle: false, colorAnswerStyle: false, explanation: false, optionLetter: false, cutMark: false, font: false });
  const hasAnyOpenAccordion = Object.values(globalAccordion).some(Boolean);

  const toggleGlobalAccordion = (sec) => {
    setGlobalAccordion((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Cut mark / negative marking states
  const [cutMark, setCutMark] = useState(0.5); // Default 0.5 cut mark
  const [cutMarkMode, setCutMarkMode] = useState('0.5'); // '0.5' | '0.25' | '0' | 'custom'
  const [customCutMarkInput, setCustomCutMarkInput] = useState('');

  // Font settings states
  const [fontSize, setFontSize] = useState(16); // Default 16px
  const [fontFamily, setFontFamily] = useState("'Noto Sans Bengali', sans-serif");
  const [fontWeight, setFontWeight] = useState('regular'); // 'thin' | 'regular' | 'medium' | 'bold'
  const [customFontSizeInput, setCustomFontSizeInput] = useState('');
  const [fontAccordion, setFontAccordion] = useState({ size: true, family: false, weight: false });

  const toggleFontAccordion = (sec) => {
    setFontAccordion((prev) => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  const [globalSettingsMaxHeight, setGlobalSettingsMaxHeight] = useState('calc(100vh - 140px)');

  useEffect(() => {
    if (showGlobalSettingsMenu && globalSettingsRef.current) {
      const updateHeight = () => {
        const rect = globalSettingsRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom - 16;
        const targetHeight = Math.max(380, Math.min(740, spaceBelow));
        setGlobalSettingsMaxHeight(`${targetHeight}px`);
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      window.addEventListener('scroll', updateHeight, { passive: true });
      return () => {
        window.removeEventListener('resize', updateHeight);
        window.removeEventListener('scroll', updateHeight);
      };
    }
  }, [showGlobalSettingsMenu]);

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

  const applyPresetProfile = (presetId, profileData) => {
    const merged = {
      ...(DEFAULT_PRESET_PROFILES[presetId] || DEFAULT_PRESET_PROFILES.practice),
      ...(profileData || {})
    };

    // 1. Layout
    if (merged.questionLayout) {
      setQuestionLayout(merged.questionLayout);
      try { localStorage.setItem('topmcqbd_question_layout', merged.questionLayout); } catch (e) {}
    }
    if (merged.optionLayout) {
      setOptionLayout(merged.optionLayout);
      try { localStorage.setItem('topmcqbd_option_layout', merged.optionLayout); } catch (e) {}
    }
    if (merged.middleLine) {
      setMiddleLine(merged.middleLine);
      try { localStorage.setItem('topmcqbd_middle_line', merged.middleLine); } catch (e) {}
    }
    if (typeof merged.middleGap === 'number') {
      setMiddleGap(merged.middleGap);
      setCustomMiddleGapInput(![0, 20, 30].includes(merged.middleGap) ? String(merged.middleGap) : '');
      try { localStorage.setItem('topmcqbd_middle_gap', String(merged.middleGap)); } catch (e) {}
    }

    // 2. Question Style
    if (merged.questionStyle) {
      setQuestionStyle(merged.questionStyle);
      try { localStorage.setItem('topmcqbd_question_style', merged.questionStyle); } catch (e) {}
    }

    // 3. Color Answer Style
    if (merged.highlightMode) {
      setHighlightMode(merged.highlightMode);
      try { localStorage.setItem('topmcqbd_highlight_mode', merged.highlightMode); } catch (e) {}
    }
    if (merged.highlightColor) {
      setHighlightColor(merged.highlightColor);
      try { localStorage.setItem('topmcqbd_highlight_color', merged.highlightColor); } catch (e) {}
    }

    // 4. Explanation Mode
    if (merged.explanationMode) {
      setExplanationMode(merged.explanationMode);
      if (merged.explanationMode !== 'none') {
        setLastActiveExplanationMode(merged.explanationMode);
        setShowExplanation(true);
      } else {
        setShowExplanation(false);
      }
      try { localStorage.setItem('topmcqbd_explanation_mode', merged.explanationMode); } catch (e) {}
    }

    // Option Letter
    if (merged.optionLetter) {
      setOptionLetter(merged.optionLetter);
      try { localStorage.setItem('topmcqbd_option_letter', merged.optionLetter); } catch (e) {}
    }

    // 5. Cut Mark
    if (typeof merged.cutMark === 'number') {
      setCutMark(merged.cutMark);
      setCutMarkMode(merged.cutMarkMode || '0.5');
      setCustomCutMarkInput(merged.customCutMarkInput || '');
      try {
        localStorage.setItem('topmcqbd_cut_mark_pref', JSON.stringify({
          cutMark: merged.cutMark,
          cutMarkMode: merged.cutMarkMode || '0.5',
          customValue: merged.customCutMarkInput || ''
        }));
      } catch (e) {}
      setScore(Math.round((correctCount * 1 - incorrectCount * merged.cutMark) * 100) / 100);
    }

    // 6. Font Settings
    if (merged.fontSize) {
      setFontSize(merged.fontSize);
      setCustomFontSizeInput(merged.customFontSizeInput || (![14, 15, 16, 17, 18, 19, 20].includes(merged.fontSize) ? String(merged.fontSize) : ''));
      try { localStorage.setItem('topmcqbd_font_size', String(merged.fontSize)); } catch (e) {}
    }
    if (merged.fontFamily) {
      setFontFamily(merged.fontFamily);
      try { localStorage.setItem('topmcqbd_font_family', merged.fontFamily); } catch (e) {}
    }
    if (merged.fontWeight) {
      setFontWeight(merged.fontWeight);
      try { localStorage.setItem('topmcqbd_font_weight', merged.fontWeight); } catch (e) {}
    }

    // 7. Switches
    if (typeof merged.showAnswer === 'boolean') {
      setShowAnswer(merged.showAnswer);
    }
  };

  const handleSelectPreset = (presetId) => {
    setActivePreset(presetId);
    activePresetRef.current = presetId;
    try {
      localStorage.setItem('topmcqbd_active_preset', presetId);
      let profiles = {};
      const raw = localStorage.getItem('topmcqbd_preset_profiles');
      if (raw) {
        profiles = JSON.parse(raw);
      }
      const profile = profiles[presetId] || DEFAULT_PRESET_PROFILES[presetId];
      applyPresetProfile(presetId, profile);
    } catch (e) {
      console.warn('Error switching preset:', e);
      applyPresetProfile(presetId, DEFAULT_PRESET_PROFILES[presetId]);
    }
  };

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
    hasReset: false,
    isCompletion: false
  });

  // Review Wrong Answers & Retake Wrong Answers modes
  const [isReviewWrongMode, setIsReviewWrongMode] = useState(false);
  const [isRetakeWrongMode, setIsRetakeWrongMode] = useState(false);
  const [originalQuestionsList, setOriginalQuestionsList] = useState([]);

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

    const activeLetters = optionLetter === 'english' ? ENGLISH_LETTERS : BANGLA_LETTERS;
    const promptText = `প্রশ্ন ${idx + 1}: ${q.q}\nঅপশনসমূহ:\n${(q.options || [])
      .map((opt, i) => `(${activeLetters[i] || i + 1}) ${opt}`)
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
      let savedPreset = 'practice';
      const ap = localStorage.getItem('topmcqbd_active_preset');
      if (ap && ['practice', 'read', 'exam', 'custom'].includes(ap)) {
        savedPreset = ap;
      }
      setActivePreset(savedPreset);
      activePresetRef.current = savedPreset;

      const rawProfiles = localStorage.getItem('topmcqbd_preset_profiles');
      let profiles = null;
      if (rawProfiles) {
        try { profiles = JSON.parse(rawProfiles); } catch (e) { profiles = null; }
      }

      if (profiles && profiles[savedPreset]) {
        applyPresetProfile(savedPreset, profiles[savedPreset]);
      } else {
        // First time initialization / migration from legacy individual keys
        let legacyPractice = { ...DEFAULT_PRESET_PROFILES.practice };

        // Check cut mark
        const savedCutMark = localStorage.getItem('topmcqbd_cut_mark_pref');
        if (savedCutMark) {
          try {
            const parsed = JSON.parse(savedCutMark);
            if (typeof parsed.cutMark === 'number') legacyPractice.cutMark = parsed.cutMark;
            if (parsed.cutMarkMode) legacyPractice.cutMarkMode = parsed.cutMarkMode;
            if (parsed.customValue !== undefined) legacyPractice.customCutMarkInput = parsed.customValue;
          } catch (e) {}
        }

        // Font
        const savedFontSize = localStorage.getItem('topmcqbd_font_size');
        if (savedFontSize) {
          const num = parseInt(savedFontSize, 10);
          if (!isNaN(num) && num >= 10 && num <= 36) {
            legacyPractice.fontSize = num;
            if (![14, 15, 16, 17, 18, 19, 20].includes(num)) {
              legacyPractice.customFontSizeInput = String(num);
            }
          }
        }
        const savedFontFamily = localStorage.getItem('topmcqbd_font_family');
        if (savedFontFamily && FONT_FAMILIES.some((f) => f.family === savedFontFamily)) {
          legacyPractice.fontFamily = savedFontFamily;
        }
        const savedFontWeight = localStorage.getItem('topmcqbd_font_weight');
        if (savedFontWeight && ['thin', 'regular', 'medium', 'bold'].includes(savedFontWeight)) {
          legacyPractice.fontWeight = savedFontWeight;
        }

        // Layout
        const savedQLayout = localStorage.getItem('topmcqbd_question_layout');
        if (savedQLayout && ['2q-col', '2q-row', '3q-col', '3q-row', '1q'].includes(savedQLayout)) {
          legacyPractice.questionLayout = savedQLayout;
        }
        const savedOptLayout = localStorage.getItem('topmcqbd_option_layout');
        if (savedOptLayout && ['1', '2', '4'].includes(savedOptLayout)) {
          legacyPractice.optionLayout = savedOptLayout;
        }
        const savedMiddleLine = localStorage.getItem('topmcqbd_middle_line');
        if (savedMiddleLine && ['dotted', 'solid', 'none', 'none-no-gap', 'gap-space', 'gap-30'].includes(savedMiddleLine)) {
          legacyPractice.middleLine = ['none-no-gap', 'gap-space', 'gap-30'].includes(savedMiddleLine) ? 'none' : savedMiddleLine;
        }
        const savedMiddleGap = localStorage.getItem('topmcqbd_middle_gap');
        if (savedMiddleGap !== null) {
          const num = parseInt(savedMiddleGap, 10);
          if (!isNaN(num) && num >= 0 && num <= 100) {
            legacyPractice.middleGap = num;
          }
        }

        // Style
        const savedStyle = localStorage.getItem('topmcqbd_question_style');
        if (savedStyle && ['box', 'dotted', 'circle', 'nostyle'].includes(savedStyle)) {
          legacyPractice.questionStyle = savedStyle;
        }
        const savedMode = localStorage.getItem('topmcqbd_highlight_mode');
        if (savedMode && ['single', 'both', 'neutral'].includes(savedMode)) {
          legacyPractice.highlightMode = savedMode;
        }
        const savedColor = localStorage.getItem('topmcqbd_highlight_color');
        if (savedColor && ['full-bg', 'border-only', 'label-only', 'highlight-and-circle', 'with-icons', 'bottom-line', 'soft-highlight'].includes(savedColor)) {
          legacyPractice.highlightColor = savedColor;
        }
        const savedExpMode = localStorage.getItem('topmcqbd_explanation_mode');
        if (savedExpMode && ['on-select', 'on-button', 'on-wrong', 'none'].includes(savedExpMode)) {
          legacyPractice.explanationMode = savedExpMode;
          legacyPractice.showExplanation = savedExpMode !== 'none';
        }
        const savedOptionLetter = localStorage.getItem('topmcqbd_option_letter');
        if (savedOptionLetter && ['bangla', 'english'].includes(savedOptionLetter)) {
          legacyPractice.optionLetter = savedOptionLetter;
        }
        const savedShowAnswer = localStorage.getItem('topmcqbd_show_answer');
        if (savedShowAnswer !== null) {
          legacyPractice.showAnswer = savedShowAnswer === 'true';
        }

        const initialProfiles = {
          practice: legacyPractice,
          read: { ...DEFAULT_PRESET_PROFILES.read },
          exam: { ...DEFAULT_PRESET_PROFILES.exam },
          custom: { ...legacyPractice }
        };

        try {
          localStorage.setItem('topmcqbd_preset_profiles', JSON.stringify(initialProfiles));
        } catch (e) {}

        applyPresetProfile(savedPreset, initialProfiles[savedPreset]);
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

  // Close global settings, limit & range menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (globalSettingsRef.current && !globalSettingsRef.current.contains(event.target)) {
        setShowGlobalSettingsMenu(false);
      }
      if (limitDropdownRef.current && !limitDropdownRef.current.contains(event.target)) {
        setShowLimitMenu(false);
      }
      if (rangeDropdownRef.current && !rangeDropdownRef.current.contains(event.target)) {
        setShowRangeMenu(false);
      }
      if (conditionHintRef.current && !conditionHintRef.current.contains(event.target)) {
        setShowFourOptionConditionHint(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load questions from API (Active plan strictly required for Paid API MCQs)
  useEffect(() => {
    const status = checkUserPlanStatus();
    if (!status.isPaid) {
      setAllQuestions([]);
      setDisplayQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const url = categoryParam
      ? `/api/questions?category=${encodeURIComponent(categoryParam)}`
      : '/api/questions';

    fetch(getPaidApiUrl(url))
      .then((res) => res.json())
      .then((data) => {
        const list = data.questions || data.mcqs || [];
        setAllQuestions(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Quiz fetch error:', err);
        setError('ডাটাবেজ থেকে কুইজের প্রশ্ন লোড করতে সমস্যা হয়েছে!');
        setLoading(false);
      });
  }, [categoryParam, planStatus.isPaid]);

  // Update display questions slice
  useEffect(() => {
    if (allQuestions.length === 0) {
      setDisplayQuestions([]);
      return;
    }

    setIsRetakeWrongMode(false);
    setOriginalQuestionsList([]);
    setIsReviewWrongMode(false);

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
    saveActivePresetSetting('cutMark', val);
    saveActivePresetSetting('cutMarkMode', mode);
    saveActivePresetSetting('customCutMarkInput', '');
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
    saveActivePresetSetting('cutMark', val);
    saveActivePresetSetting('cutMarkMode', 'custom');
    saveActivePresetSetting('customCutMarkInput', customCutMarkInput);
  };

  const handleSelectFontSize = (size) => {
    setFontSize(size);
    setCustomFontSizeInput('');
    try {
      localStorage.setItem('topmcqbd_font_size', String(size));
    } catch (e) {}
    saveActivePresetSetting('fontSize', size);
    saveActivePresetSetting('customFontSizeInput', '');
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
    saveActivePresetSetting('fontSize', num);
    saveActivePresetSetting('customFontSizeInput', customFontSizeInput);
  };

  const handleSelectFontFamily = (family) => {
    setFontFamily(family);
    try {
      localStorage.setItem('topmcqbd_font_family', family);
    } catch (e) {}
    saveActivePresetSetting('fontFamily', family);
  };

  const handleSelectFontWeight = (weight) => {
    setFontWeight(weight);
    try {
      localStorage.setItem('topmcqbd_font_weight', weight);
    } catch (e) {}
    saveActivePresetSetting('fontWeight', weight);
  };

  const handleResetGlobalSettings = () => {
    const currentPreset = activePresetRef.current || 'practice';
    const defaultProf = DEFAULT_PRESET_PROFILES[currentPreset] || DEFAULT_PRESET_PROFILES.practice;
    try {
      const raw = localStorage.getItem('topmcqbd_preset_profiles');
      let profiles = raw ? JSON.parse(raw) : {};
      profiles[currentPreset] = { ...defaultProf };
      localStorage.setItem('topmcqbd_preset_profiles', JSON.stringify(profiles));
    } catch (e) {}

    applyPresetProfile(currentPreset, defaultProf);

    setLayoutSubAccordion({ style: true, question: true, option: false, middleLine: false, middleGap: false });
    setColorStyleSubAccordion({ style: true, color: true });
    setExplanationSubAccordion({ answer: true, explanation: true });
    setShowFourOptionConditionHint(false);

    // Show temporary success feedback
    setResetSettingsSuccess(true);
    setTimeout(() => {
      setResetSettingsSuccess(false);
    }, 1200);
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
      hasReset: true,
      isCompletion: true
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
      hasReset: true,
      isCompletion: true
    });
  };

  const resetQuizState = () => {
    setAnsweredQuestions({});
    setExpandedExplanations({});
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setPopup({ visible: false, type: '', title: '', msg: '', hasReset: false, isCompletion: false });

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
      setActiveMode('practice');
    }
    if ((isRetakeWrongMode || isReviewWrongMode) && originalQuestionsList.length > 0) {
      setDisplayQuestions(originalQuestionsList);
      setIsRetakeWrongMode(false);
      setIsReviewWrongMode(false);
    }
    resetQuizState();
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const target = document.querySelector('.quiz-container') || document.querySelector('.quiz-top-bar');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  // View Wrong Answers & Explanations Handler ("ভুল উত্তর দেখুন")
  const handleViewWrongAnswers = () => {
    const sourceQuestions = (originalQuestionsList && originalQuestionsList.length > 0) ? originalQuestionsList : displayQuestions;
    const wrongQuestions = sourceQuestions
      .map((q, idx) => ({
        ...q,
        _originalIdx: idx,
        _chosenAnswer: answeredQuestions[idx]
      }))
      .filter((q) => q._chosenAnswer !== undefined && q._chosenAnswer !== q.ans);

    if (wrongQuestions.length === 0) {
      setPopup({
        visible: true,
        type: 'success',
        title: '🎉 কোনো ভুল উত্তর নেই!',
        msg: 'আপনার কোনো ভুল উত্তর নেই। আপনি দারুণ পরীক্ষা দিয়েছেন!',
        hasReset: false,
        isCompletion: false
      });
      return;
    }

    if (!isRetakeWrongMode && !isReviewWrongMode) {
      setOriginalQuestionsList([...sourceQuestions]);
    }

    setDisplayQuestions(wrongQuestions);
    setIsReviewWrongMode(true);
    setIsRetakeWrongMode(false);
    setShowAnswer(true);
    setShowExplanation(true);
    setShowColor(true);

    setTimeout(() => {
      const target = document.querySelector('.quiz-questions-col-wrapper') || document.querySelector('.quiz-questions-wrapper') || document.querySelector('.quiz-container');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  // Exit Review Wrong Answers Mode and restore original list
  const handleExitReviewMode = () => {
    if (originalQuestionsList.length > 0) {
      setDisplayQuestions(originalQuestionsList);
    }
    setIsReviewWrongMode(false);
    resetQuizState();
  };

  // Retake exam ONLY on wrong answers Handler ("ভুল উত্তরের ওপর পরীক্ষা দিন")
  const handleRetakeWrongAnswers = () => {
    const sourceQuestions = (originalQuestionsList && originalQuestionsList.length > 0) ? originalQuestionsList : displayQuestions;
    const wrongQuestions = sourceQuestions.filter((q, qIndex) => {
      const chosen = q._chosenAnswer !== undefined ? q._chosenAnswer : answeredQuestions[qIndex];
      return chosen !== undefined && chosen !== q.ans;
    });

    if (wrongQuestions.length === 0) {
      setPopup({
        visible: true,
        type: 'success',
        title: '🎉 কোনো ভুল উত্তর নেই!',
        msg: 'আপনার কোনো ভুল উত্তর নেই। আপনি দারুণ পরীক্ষা দিয়েছেন!',
        hasReset: false,
        isCompletion: false
      });
      return;
    }

    if (!isRetakeWrongMode && !isReviewWrongMode) {
      setOriginalQuestionsList([...sourceQuestions]);
    }

    setDisplayQuestions(wrongQuestions);
    setIsRetakeWrongMode(true);
    setIsReviewWrongMode(false);

    setAnsweredQuestions({});
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setPopup({ visible: false, type: '', title: '', msg: '', hasReset: false, isCompletion: false });

    if (showTime && !isReadMode) {
      setTotalSecondsLeft(wrongQuestions.length * 36);
      setTimerRunning(true);
      setWarningTriggered(false);
    }

    setTimeout(() => {
      const target = document.querySelector('.quiz-questions-col-wrapper') || document.querySelector('.quiz-questions-wrapper') || document.querySelector('.quiz-container');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  // Exit wrong questions retake mode and restore original list
  const handleExitRetakeMode = () => {
    if (originalQuestionsList.length > 0) {
      setDisplayQuestions(originalQuestionsList);
    }
    setIsRetakeWrongMode(false);
    setIsReviewWrongMode(false);
    resetQuizState();
  };

  // Mode Switch Handler for the Segmented Pill Box (প্র্যাকটিস মোড | পড়ুন মোড)
  const handleModeChange = (mode) => {
    setActiveMode(mode);

    if (mode === 'practice') {
      setIsReadMode(false);
      setShowScore(true);
      setShowAnswer(false);
      resetQuizState();
    } else if (mode === 'read') {
      setIsReadMode(true);
      setShowTime(false);
      setShowScore(false);
      setShowColor(true);
      setShowExplanation(true);
      setShowAnswer(false);
      setTimerRunning(false);
    }
  };

  // Read Mode Switch Toggle Handler
  const handleReadModeToggle = (checked) => {
    setIsReadMode(checked);
    setActiveMode(checked ? 'read' : 'practice');
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
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const target = document.querySelector('.quiz-container') || document.querySelector('.quiz-top-bar');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getBanglaLetter = (idx) => {
    if (optionLetter === 'english') {
      return ENGLISH_LETTERS[idx] || String.fromCharCode(65 + idx);
    }
    return BANGLA_LETTERS[idx] || idx + 1;
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
  const isAllAnswered = displayQuestions.length > 0 && (Object.keys(answeredQuestions).length >= displayQuestions.length || popup.isCompletion);

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

  const renderQuestionBlock = (q, qIndex, containerLayoutClass) => {
    const chosen = q._chosenAnswer !== undefined ? q._chosenAnswer : answeredQuestions[qIndex];
    const isAnswered = chosen !== undefined;
    const shouldShow = isReadMode || isAnswered || isReviewWrongMode;
    const isAnswerVisible = shouldShow && showAnswer;

    // Determine explanation visibility based on explanationMode
    let isExplanationVisible = false;
    if (showExplanation && q.explanation) {
      if (explanationMode === 'on-select') {
        isExplanationVisible = shouldShow;
      } else if (explanationMode === 'on-button') {
        isExplanationVisible = !!expandedExplanations[qIndex];
      } else if (explanationMode === 'on-wrong') {
        if (isReviewWrongMode || isRetakeWrongMode) {
          isExplanationVisible = true;
        } else if (isAnswered && chosen !== q.ans) {
          isExplanationVisible = true;
        }
      } else if (explanationMode === 'none') {
        isExplanationVisible = false;
      }
    }

    const getOptionLabel = (idx) => {
      return getBanglaLetter(idx);
    };

    return (
      <div key={q._id || qIndex} className={`quiz-question-block ${questionStyle === 'box' ? 'style-box' : questionStyle === 'circle' ? 'style-circle' : questionStyle === 'nostyle' ? 'style-nostyle' : ''}`}>
        {questionStyle === 'box' ? (
          <div className="quiz-q-header">
            <div className="quiz-q-title-area">
              <span className="quiz-qnum-badge font-bn">{qIndex + 1}</span>
              <span className="quiz-q-title-text font-bn">
                {q.q}{' '}
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
              </span>
            </div>
          </div>
        ) : (
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
        )}

        <div className={`quiz-options-container ${containerLayoutClass || `layout-${optionLayout}`} ans-style-${highlightColor}`}>
          {(q.options || []).map((opt, optIndex) => {
            let btnClass = 'quiz-option-btn';
            let isOptionCorrect = false;
            let isOptionIncorrect = false;

            if (isReadMode) {
              btnClass += ' disabled';
              if (optIndex === q.ans) {
                if (showColor) {
                  btnClass += ' correct';
                  isOptionCorrect = true;
                } else {
                  btnClass += ' neutral-selected';
                }
              }
            } else if (isReviewWrongMode) {
              btnClass += ' disabled';
              if (optIndex === q.ans) {
                if (showColor) {
                  btnClass += ' correct';
                  isOptionCorrect = true;
                } else {
                  btnClass += ' neutral-selected';
                }
              } else if (chosen === optIndex) {
                if (showColor) {
                  btnClass += ' incorrect';
                  isOptionIncorrect = true;
                } else {
                  btnClass += ' neutral-selected';
                }
              }
            } else if (isAnswered) {
              btnClass += ' disabled';
              if (showColor) {
                if (highlightMode === 'single') {
                  // শুধু নির্বাচিত অপশন হাইলাইট : শুধুমাত্র নির্বাচিত অপশনে ফলাফল প্রদর্শিত হবে
                  if (chosen === optIndex) {
                    if (chosen === q.ans) {
                      btnClass += ' correct';
                      isOptionCorrect = true;
                    } else {
                      btnClass += ' incorrect';
                      isOptionIncorrect = true;
                    }
                  }
                } else if (highlightMode === 'both') {
                  // সঠিক ও ভুল উভয়টি দেখান : ভুল অপশনটি লাল এবং সঠিক অপশনটি সবুজ রঙে উভয় ফলাফল একসাথে দেখানো হবে
                  if (optIndex === q.ans) {
                    btnClass += ' correct';
                    isOptionCorrect = true;
                  } else if (chosen === optIndex) {
                    btnClass += ' incorrect';
                    isOptionIncorrect = true;
                  }
                } else if (highlightMode === 'neutral') {
                  // সঠিক বা ভুল দেখাবে না (শুধু সিলেকশন) : সবুজ বা লাল দেখাবে না, শুধুমাত্র নির্বাচিত অপশনটি সিলেক্টেড থাকবে
                  if (chosen === optIndex) {
                    btnClass += ' neutral-selected';
                  }
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
                disabled={isReadMode || isAnswered || isReviewWrongMode}
                onClick={() => handleAnswerClick(qIndex, optIndex)}
              >
                <div className="quiz-option-circle font-bn">
                  {getOptionLabel(optIndex)}{questionStyle === 'nostyle' ? '.' : ''}
                </div>
                <div className="quiz-option-text">
                  {opt}
                </div>
                {(highlightColor === 'with-icons' || highlightColor === 'highlight-and-circle') && showColor && (isOptionCorrect || isOptionIncorrect) && (
                  <span className="quiz-option-status-icon">
                    {isOptionCorrect && <i className="fa-solid fa-circle-check text-success"></i>}
                    {isOptionIncorrect && <i className="fa-solid fa-circle-xmark text-danger"></i>}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Case 1: Standalone Correct Answer (Shows when showAnswer is ON, explanation box is NOT visible, AND not in on-button mode) */}
        {isAnswerVisible && (!isExplanationVisible || !q.explanation) && (explanationMode !== 'on-button' || !q.explanation) && (
          <div className="quiz-answer-text">
            <i className="fa-solid fa-circle-check"></i>
            <span>সঠিক উত্তর: {getOptionLabel(q.ans)}. {q.options[q.ans]}</span>
          </div>
        )}

        {/* In Mode 2 ('on-button'): Show explanation button if explanation exists */}
        {showExplanation && explanationMode === 'on-button' && q.explanation && (
          <div className="quiz-explanation-btn-wrap">
            <button
              type="button"
              className={`quiz-explanation-toggle-btn ${expandedExplanations[qIndex] ? 'active' : ''}`}
              onClick={() => toggleQuestionExplanation(qIndex)}
            >
              <i className={`fa-solid ${expandedExplanations[qIndex] ? 'fa-eye-slash' : 'fa-lightbulb'}`}></i>
              <span>{expandedExplanations[qIndex] ? 'ব্যাখ্যা লুকান' : 'ব্যাখ্যা'}</span>
            </button>
          </div>
        )}

        {/* Case 2: Unified Explanation Box (Shows explanation, and if showAnswer is ON, embeds correct answer at the top) */}
        {isExplanationVisible && q.explanation && (
          <div className="quiz-explanation-text">
            {isAnswerVisible && (
              <div className="quiz-exp-answer-row">
                <i className="fa-solid fa-circle-check"></i>
                <span>সঠিক উত্তর: {getOptionLabel(q.ans)}. {q.options[q.ans]}</span>
              </div>
            )}
            <div className="quiz-exp-body-row">
              <strong>ব্যাখ্যা:</strong> {q.explanation}
            </div>
          </div>
        )}
      </div>
    );
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

      {/* Floating Questions Progress Box at Bottom-Left Corner (মোট প্রশ্ন | সম্পন্ন | বাকি) */}
      {displayQuestions.length > 0 && Object.keys(answeredQuestions).length > 0 && !isReadMode && !isAllAnswered && (
        <div className="quiz-floating-progress-left">
          <div className="quiz-progress-pill-badge" title="মোট প্রশ্ন, সম্পন্ন ও বাকি প্রশ্নের লাইভ হিসাব">
            <span>মোট প্রশ্ন: {toBengaliNumber(displayQuestions.length)}</span>
            <span className="quiz-pill-divider">|</span>
            <span>সম্পন্ন: {toBengaliNumber(Object.keys(answeredQuestions).length)}</span>
            <span className="quiz-pill-divider">|</span>
            <span>বাকি: {toBengaliNumber(Math.max(0, displayQuestions.length - Object.keys(answeredQuestions).length))}</span>
          </div>
        </div>
      )}

      {/* Floating Status Bar (Timer & Score at Top-Right) */}
      {displayQuestions.length > 0 && !isReadMode && ((showTime && !isReadMode) || (showScore && !isReadMode)) && (
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
          {/* Top-right close '✖' icon */}
          <button
            type="button"
            className="quiz-popup-close-icon"
            onClick={() => setPopup({ ...popup, visible: false })}
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <h4>{popup.title}</h4>
          <p>{popup.msg}</p>

          {/* Action buttons on top of "পুনরায় শুরু করুন" */}
          {(popup.isCompletion || (popup.hasReset && !popup.isLoginRequired && !popup.isPlanRequired)) && (
            <div className="quiz-popup-extra-actions">
              <button
                type="button"
                className="quiz-popup-btn btn-popup-view-wrong"
                onClick={handleViewWrongAnswers}
              >
                <i className="fa-solid fa-eye"></i> ভুল উত্তর দেখুন
              </button>
              <button
                type="button"
                className="quiz-popup-btn btn-popup-retake-wrong"
                onClick={handleRetakeWrongAnswers}
              >
                <i className="fa-solid fa-pen-to-square"></i> ভুল উত্তরের ওপর পরীক্ষা দিন
              </button>
            </div>
          )}

          <div className="quiz-popup-actions" style={{ flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
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
                <i className="fa-solid fa-rotate-right"></i> পুনরায় সম্পূর্ণ পরীক্ষা দিন
              </button>
            )}
            {!popup.isCompletion && (
              <button className="quiz-popup-btn btn-popup-close" onClick={() => setPopup({ ...popup, visible: false })}>
                {popup.isLoginRequired || popup.isPlanRequired ? 'বাতিল' : 'ঠিক আছে'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Navigation & Mode Switcher Bar matching attached screenshots */}
      <div className="quiz-top-bar">
        <div className="quiz-top-bar-left">
          <div className="quiz-top-breadcrumb">
            <Link href="/all-mcq" className="quiz-top-page-title" title="সকল MCQ">
              <span>সকল MCQ</span>
            </Link>
          </div>

          {!isReadMode && Object.keys(answeredQuestions).length > 0 && Object.keys(answeredQuestions).length < displayQuestions.length && (
            <button
              type="button"
              className="quiz-top-restart-btn"
              onClick={resetQuiz}
              title="পুনরায় সম্পূর্ণ পরীক্ষা / কুইজ শুরু করুন"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span>পুনরায় অনুশীলন শুরু করুন</span>
            </button>
          )}
        </div>

        <div className="quiz-top-bar-right">
          {/* Segmented Mode Switcher Box matching Screenshot 2 */}
          <div className="quiz-mode-switcher-box">
            <button
              type="button"
              className={`quiz-mode-btn ${activeMode === 'practice' ? 'active' : ''}`}
              onClick={() => handleModeChange('practice')}
              title="অনুশীলন মোড"
            >
              <i className="fa-regular fa-circle-check"></i>
              <span>অনুশীলন মোড</span>
            </button>

            <button
              type="button"
              className={`quiz-mode-btn ${activeMode === 'read' ? 'active' : ''}`}
              onClick={() => handleModeChange('read')}
              title="পড়ুন মোড"
            >
              <i className="fa-solid fa-book-open"></i>
              <span>পড়ুন মোড</span>
            </button>
          </div>
        </div>
      </div>

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
        {/* 1. Completion Summary Banner right below top box when all answers are submitted */}
        {displayQuestions.length > 0 && Object.keys(answeredQuestions).length === displayQuestions.length && !isReviewWrongMode && !isRetakeWrongMode && (
          <div className="quiz-completion-banner">
            <div className="quiz-completion-banner-info">
              <div className="quiz-completion-banner-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <div className="quiz-completion-banner-text">
                <span className="quiz-banner-score-text">
                  আপনার মোট প্রাপ্ত স্কোর: <strong>{formatScore(score)}</strong>
                </span>
                <span className="quiz-banner-divider">|</span>
                <span className="quiz-banner-wrong-text">
                  ভুল উত্তর: <strong className={incorrectCount > 0 ? 'text-danger' : 'text-success'}>{toBengaliNumber(incorrectCount)} টি</strong>
                </span>
                {incorrectCount === 0 && (
                  <span className="quiz-banner-perfect-text">🎉 কোনো ভুল নেই, সব উত্তর সঠিক!</span>
                )}
              </div>
            </div>

            <div className="quiz-completion-banner-actions">
              {incorrectCount > 0 && (
                <>
                  <button
                    type="button"
                    className="quiz-banner-btn btn-banner-view-wrong"
                    onClick={handleViewWrongAnswers}
                  >
                    <i className="fa-solid fa-eye"></i> ভুল উত্তর দেখুন
                  </button>
                  <button
                    type="button"
                    className="quiz-banner-btn btn-banner-retake-wrong"
                    onClick={handleRetakeWrongAnswers}
                  >
                    <i className="fa-solid fa-pen-to-square"></i> ভুল উত্তরের ওপর পরীক্ষা দিন
                  </button>
                </>
              )}
              <button
                type="button"
                className="quiz-banner-btn btn-banner-reset-full"
                onClick={resetQuiz}
              >
                <i className="fa-solid fa-rotate-right"></i> পুনরায় সম্পূর্ণ পরীক্ষা দিন
              </button>
            </div>
          </div>
        )}

        {/* 2. Retake Wrong Questions Banner ("ভুল উত্তরের ওপর পরীক্ষা দিন") */}
        {isRetakeWrongMode && (
          <div className="quiz-retake-mode-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#e11d48', fontSize: '18px' }}></i>
              <span>
                ভুল উত্তর দেওয়া <strong>{toBengaliNumber(displayQuestions.length)}</strong>টি প্রশ্নের ওপর পুনরায় পরীক্ষা দিচ্ছেন।
              </span>
            </div>
            <button
              type="button"
              onClick={handleExitRetakeMode}
              className="btn-exit-retake"
            >
              <i className="fa-solid fa-arrow-left"></i> মূল পরীক্ষায় ফিরে যান
            </button>
          </div>
        )}

        {/* 3. View Wrong Answers Banner ("ভুল উত্তর দেখুন") */}
        {isReviewWrongMode && (
          <div className="quiz-review-mode-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ color: '#d97706', fontSize: '18px' }}></i>
              <span>
                ভুল উত্তর দেওয়া <strong>{toBengaliNumber(displayQuestions.length)}</strong>টি প্রশ্নের সঠিক উত্তর ও ব্যাখ্যা নিচে প্রদর্শিত হচ্ছে।
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExitReviewMode}
                className="btn-banner-reset"
                style={{ background: '#d97706' }}
              >
                <i className="fa-solid fa-arrow-left"></i> মূল পরীক্ষায় ফিরুন
              </button>
              <button
                type="button"
                onClick={handleRetakeWrongAnswers}
                className="btn-banner-retake"
              >
                <i className="fa-solid fa-pen-to-square"></i> ভুল উত্তরের ওপর পরীক্ষা দিন
              </button>
            </div>
          </div>
        )}

        <h1>Online Questions & Exam Practice</h1>
        <h2>{categoryParam ? formatCategoryDisplay(categoryParam) : 'সাধারণ জ্ঞান ও বিষয়ভিত্তিক প্রশ্নব্যাংক'}</h2>

        <div className="quiz-header-info-bar">
          <div className="quiz-exam-path">
            <i className="fa-solid fa-square-poll-horizontal" style={{ marginRight: '6px', color: 'var(--primary, #007bff)' }}></i>
            {categoryParam ? formatCategoryDisplay(categoryParam) : 'সকল প্রশ্নব্যাংক'}
          </div>
          <div className="quiz-header-right-actions">
            {/* Negative Marking Note (Display Only) */}
            <div className="quiz-negative-mark-note">
              <i className="fa-solid fa-bell"></i>
              <span>
                {cutMark === 0
                  ? 'কোনো কাট মার্ক নেই'
                  : `প্রতিটি ভুল উত্তরের জন্য ${toBengaliNumber(cutMark)} নম্বর কাটা যাবে`}
              </span>
            </div>
          </div>
        </div>

        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

        {/* Controls Bar */}
        <div className="quiz-controls-bar">
          <div className="quiz-nav-actions">
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

            {/* Range Custom Dropdown Menu shown when limit !== 'all' */}
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

            {/* Switches: Explanation, Time and Score */}
            <div className="quiz-switch-group">
              {/* Explanation Switch (Left of Time Switch) */}
              <label className="quiz-switch-label" title={getExplanationSwitchLabel()}>
                <label className="quiz-switch">
                  <input
                    type="checkbox"
                    checked={explanationMode !== 'none' && showExplanation}
                    onChange={(e) => handleToggleExplanationSwitch(e.target.checked)}
                  />
                  <span className="quiz-slider"></span>
                </label>
                {getExplanationSwitchLabel()}
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

              {/* প্রশ্ন সেটিংস Custom Dropdown Menu */}
              <div className="quiz-layout-dropdown-wrapper" ref={globalSettingsRef}>
              <button
                type="button"
                className="quiz-layout-trigger-btn quiz-global-settings-trigger"
                onClick={() => setShowGlobalSettingsMenu(!showGlobalSettingsMenu)}
                title="প্রশ্ন সেটিংস (লেআউট, কাট মার্ক, ফন্ট, উত্তর ও ব্যাখ্যা)"
              >
                <i className="fa-solid fa-gear" style={{ color: '#007bff' }}></i>
                <span>প্রশ্ন সেটিংস</span>
                <i className={`fa-solid fa-chevron-${showGlobalSettingsMenu ? 'up' : 'down'}`} style={{ fontSize: '11px', color: '#64748b' }}></i>
              </button>

              {showGlobalSettingsMenu && (
                <div
                  className={`quiz-layout-popup-menu quiz-global-settings-popup ${hasAnyOpenAccordion ? 'has-active-accordion' : ''}`}
                  style={{ maxHeight: globalSettingsMaxHeight, padding: '0px' }}
                >
                  <div className="quiz-global-popup-header">
                    <div className="quiz-global-popup-title">
                      <i className="fa-solid fa-gear" style={{ color: '#007bff' }}></i>
                      <span>প্রশ্ন সেটিংস</span>
                    </div>
                    <div className="quiz-global-popup-header-actions">
                      <button
                        type="button"
                        className={`quiz-popup-reset-btn ${resetSettingsSuccess ? 'reset-success' : ''}`}
                        onClick={handleResetGlobalSettings}
                        title="ডিফল্ট সেটিংসে রিসেট করুন"
                      >
                        <i className={`fa-solid ${resetSettingsSuccess ? 'fa-check' : 'fa-rotate-left'}`}></i>
                        <span>{resetSettingsSuccess ? 'রিসেট সম্পন্ন' : 'রিসেট'}</span>
                      </button>
                      <button
                        type="button"
                        className="quiz-popup-close-mini"
                        onClick={() => setShowGlobalSettingsMenu(false)}
                        title="বন্ধ করুন"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  </div>

                  <div className="quiz-global-popup-body">
                    {/* Pre-built Preset Profiles Switcher Header Info */}
                    <div className="quiz-presets-header-box">
                      <div className="quiz-presets-header">
                        <span className="quiz-presets-label">
                          <i className="fa-solid fa-sliders" style={{ color: '#0284c7' }}></i>
                          <span>প্রি-সেট সেটিংস</span>
                        </span>
                        <span className="quiz-preset-current-indicator">
                          সক্রিয়: <strong>{PRESET_LIST.find((p) => p.id === activePreset)?.name}</strong>
                        </span>
                      </div>
                      <div className="quiz-presets-description">
                        <span>যেকোনো প্রি-সেট সিলেক্ট করে নিচের ফিচারগুলো নিজের মতো পরিবর্তন করতে পারবেন, যা এই মোডে সংরক্ষিত থাকবে।</span>
                      </div>
                    </div>

                    {/* Preset Tabs & Features Box Container (Connected directly like Tabs with zero gap) */}
                    <div className={`quiz-preset-tabs-container preset-theme-${activePreset}`}>
                      <div className="quiz-presets-bar">
                        {PRESET_LIST.map((preset, idx) => {
                          const isActive = activePreset === preset.id;
                          const isNextActive = PRESET_LIST[idx + 1]?.id === activePreset;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              className={`quiz-preset-btn ${isActive ? `active preset-${preset.id}` : ''} ${isNextActive ? 'has-active-next' : ''}`}
                              onClick={() => handleSelectPreset(preset.id)}
                              title={`${preset.name} মোড সক্রিয় করুন`}
                            >
                              <i className={`fa-solid ${preset.icon}`}></i>
                              <span>{preset.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Preset Features Container Box (Tab Content) */}
                      <div className={`quiz-preset-features-box preset-theme-${activePreset}`}>
                      <div className="quiz-preset-features-header">
                        <div className="quiz-preset-features-header-left">
                          <span className="quiz-preset-features-icon-badge">
                            <i className={`fa-solid ${PRESET_LIST.find((p) => p.id === activePreset)?.icon || 'fa-sliders'}`}></i>
                          </span>
                          <div className="quiz-preset-features-title-group">
                            <div className="quiz-preset-features-main-title">
                              <span>&lsquo;{PRESET_LIST.find((p) => p.id === activePreset)?.name}&rsquo; মোডের ফিচারসমূহ</span>
                              <span className="quiz-preset-features-tag">
                                {activePreset === 'custom' ? 'ব্যক্তিগত সেটিংস' : 'প্রি-বিল্ট ফিচারস'}
                              </span>
                            </div>
                            <span className="quiz-preset-features-subtitle">
                              {activePreset === 'practice' && 'সাধারণ অনুশীলন ও অপশনভিত্তিক স্বয়ংক্রিয় ব্যাখ্যা'}
                              {activePreset === 'read' && 'সঠিক উত্তর সরাসরি প্রদর্শন ও পড়ার সুবিধাজনক মোড'}
                              {activePreset === 'exam' && 'পরীক্ষার আদলে নিরপেক্ষ ভিউ (কোনো তাত্ক্ষণিক উত্তর নেই)'}
                              {activePreset === 'custom' && 'আপনার সংরক্ষিত নিজস্ব ব্যক্তিগত সেটিংস ও ফিচারসমূহ'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="quiz-preset-features-body">
                        {/* Section 1: Option Layout */}
                        {/* Section 1: Layout */}
                        <div className={`quiz-global-section layout-section ${globalAccordion.layout ? 'active' : ''}`}>
                    <div
                      className="quiz-global-section-header"
                      onClick={() => toggleGlobalAccordion('layout')}
                      title="লেআউট সেটিংস"
                    >
                      <div className="quiz-global-section-header-left">
                        <i className="fa-solid fa-table-cells-large" style={{ color: '#007bff' }}></i>
                        <span>লেআউট (Option Layout):</span>
                      </div>
                      <div className="quiz-global-section-header-right">
                        <span className="quiz-font-accordion-badge">
                          <span className="quiz-font-accordion-badge-text">৪টি অপশন</span>
                        </span>
                        <i className={`fa-solid fa-${globalAccordion.layout ? 'minus' : 'plus'} quiz-font-accordion-plus-minus`}></i>
                      </div>
                    </div>

                    {globalAccordion.layout && (
                      <div className="quiz-global-section-body">
                        {/* Sub-Accordion 1: ডিজাইন স্টাইল (Question Style) */}
                        <div className={`quiz-font-sub-group ${layoutSubAccordion.style ? 'active' : ''}`}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${layoutSubAccordion.style ? 'active' : ''}`}
                            onClick={() => toggleLayoutSubAccordion('style')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-shapes" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>ডিজাইন স্টাইল (Question Style):</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {questionStyle === 'box'
                                    ? 'বক্স কার্ড'
                                    : questionStyle === 'circle'
                                    ? 'সার্কেল অপশন'
                                    : questionStyle === 'nostyle'
                                    ? 'নো স্টাইল'
                                    : 'বর্ডার লাইন'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${layoutSubAccordion.style ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {layoutSubAccordion.style && (
                            <div className="quiz-global-sub-card">
                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionStyle === 'dotted' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionStyle('dotted')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionStyle === 'dotted' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>১. বর্ডার লাইন (Border Line)</span>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionStyle === 'box' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionStyle('box')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionStyle === 'box' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>২. বক্স কার্ড (Box Card)</span>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionStyle === 'circle' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionStyle('circle')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionStyle === 'circle' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>৩. সার্কেল অপশন লেবেল (Circle Option Label)</span>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionStyle === 'nostyle' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionStyle('nostyle')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionStyle === 'nostyle' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>৪. নো স্টাইল (No Style)</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sub-Accordion 2: প্রশ্ন Layout */}
                        <div className={`quiz-font-sub-group ${layoutSubAccordion.question ? 'active' : ''}`} style={{ marginTop: '8px' }}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${layoutSubAccordion.question ? 'active' : ''}`}
                            onClick={() => toggleLayoutSubAccordion('question')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-table-columns" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>প্রশ্ন Layout:</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {questionLayout === '2q-col'
                                    ? '২টি প্রশ্ন (উপর-নিচ)'
                                    : questionLayout === '2q-row'
                                    ? '২টি প্রশ্ন (পাশাপাশি)'
                                    : questionLayout === '3q-col'
                                    ? '৩টি প্রশ্ন (উপর-নিচ)'
                                    : questionLayout === '3q-row'
                                    ? '৩টি প্রশ্ন (পাশাপাশি)'
                                    : '১টি প্রশ্ন'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${layoutSubAccordion.question ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {layoutSubAccordion.question && (
                            <div className="quiz-global-sub-card">
                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionLayout === '2q-col' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionLayout('2q-col')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionLayout === '2q-col' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>১ লাইনে ২টি প্রশ্ন (উপর-নিচ ক্রম)</span>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionLayout === '2q-row' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionLayout('2q-row')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionLayout === '2q-row' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>১ লাইনে ২টি প্রশ্ন (পাশাপাশি ক্রম)</span>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionLayout === '3q-col' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionLayout('3q-col')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionLayout === '3q-col' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>১ লাইনে ৩টি প্রশ্ন (উপর-নিচ ক্রম)</span>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionLayout === '3q-row' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionLayout('3q-row')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionLayout === '3q-row' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>১ লাইনে ৩টি প্রশ্ন (পাশাপাশি ক্রম)</span>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${questionLayout === '1q' ? 'active' : ''}`}
                                onClick={() => handleSelectQuestionLayout('1q')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {questionLayout === '1q' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>১ লাইনে ১টি প্রশ্ন</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sub-Accordion 2: Option Layout */}
                        <div className={`quiz-font-sub-group ${layoutSubAccordion.option ? 'active' : ''}`} style={{ marginTop: '8px' }}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${layoutSubAccordion.option ? 'active' : ''}`}
                            onClick={() => toggleLayoutSubAccordion('option')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-list-ol" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>Option Layout:</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {optionLayout === '4'
                                    ? '১ লাইনে ৪টি'
                                    : optionLayout === '2'
                                    ? '১ লাইনে ২টি'
                                    : '১ লাইনে ১টি'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${layoutSubAccordion.option ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {layoutSubAccordion.option && (
                            <div className="quiz-global-sub-card">
                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${optionLayout === '1' ? 'active' : ''}`}
                                onClick={() => handleSelectOptionLayout('1')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {optionLayout === '1' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>১ লাইনে ১টি option</span>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item ${optionLayout === '2' ? 'active' : ''}`}
                                onClick={() => handleSelectOptionLayout('2')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {optionLayout === '2' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <span>১ লাইনে ২টি option</span>
                              </button>

                              {/* ১ লাইনে ৪টি option: প্রশ্ন Layout থেকে ১ লাইনে ১টি প্রশ্ন choose করলে সক্রিয় হবে */}
                              {questionLayout === '1q' ? (
                                <button
                                  type="button"
                                  className={`quiz-layout-menu-item ${optionLayout === '4' ? 'active' : ''}`}
                                  onClick={() => handleSelectOptionLayout('4')}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                    <div className="quiz-layout-radio-circle">
                                      {optionLayout === '4' && <div className="quiz-layout-radio-inner"></div>}
                                    </div>
                                    <span>১ লাইনে ৪টি option</span>
                                  </div>
                                  <span className="quiz-option-active-badge">
                                    <i className="fa-solid fa-check" style={{ fontSize: '9.5px' }}></i>
                                    সক্রিয়
                                  </span>
                                </button>
                              ) : (
                                <div ref={conditionHintRef} style={{ width: '100%' }}>
                                  <div
                                    className="quiz-layout-menu-item disabled"
                                    style={{
                                      opacity: 0.68,
                                      cursor: 'not-allowed',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div className="quiz-layout-radio-circle"></div>
                                      <span style={{ color: '#64748b' }}>১ লাইনে ৪টি option</span>
                                    </div>
                                    <button
                                      type="button"
                                      className="quiz-sorto-projojjo-btn"
                                      onClick={() => setShowFourOptionConditionHint((prev) => !prev)}
                                      title="শর্ত দেখতে ক্লিক করুন"
                                    >
                                      <span>শর্ত প্রযোজ্য</span>
                                    </button>
                                  </div>

                                  {showFourOptionConditionHint && (
                                    <div className="quiz-sorto-projojjo-hint">
                                      <div className="quiz-sorto-projojjo-hint-text">
                                        <span>
                                          প্রশ্ন Layout: থেকে <strong>১ লাইনে ১টি প্রশ্ন</strong> choose করুন।
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        className="quiz-sorto-projojjo-hint-close"
                                        onClick={() => setShowFourOptionConditionHint(false)}
                                        title="বন্ধ করুন"
                                      >
                                        <i className="fa-solid fa-xmark"></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Sub-Accordion 4: মাঝের লাইন (Middle Line style) */}
                        <div className={`quiz-font-sub-group ${layoutSubAccordion.middleLine ? 'active' : ''}`} style={{ marginTop: '8px' }}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${layoutSubAccordion.middleLine ? 'active' : ''}`}
                            onClick={() => toggleLayoutSubAccordion('middleLine')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-grip-lines-vertical" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>মাঝের লাইন (Middle Line style):</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {middleLine === 'dotted'
                                    ? 'ডটেড লাইন'
                                    : middleLine === 'solid'
                                    ? 'সলিড লাইন'
                                    : 'লাইন ছাড়া'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${layoutSubAccordion.middleLine ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {layoutSubAccordion.middleLine && (
                            <div className="quiz-global-sub-card">
                              {/* 1. Dotted Line */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-middle-line-item ${middleLine === 'dotted' ? 'active' : ''}`}
                                onClick={() => handleSelectMiddleLine('dotted')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {middleLine === 'dotted' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-middle-line-content">
                                  <span className="quiz-middle-line-title">১. ডটেড লাইন (Dotted Line)</span>
                                  <span className="quiz-middle-line-desc">কলামগুলোর মাঝে মার্জিত ডটেড ডিভাইডার লাইন থাকবে।</span>
                                </div>
                              </button>

                              {/* 2. Solid Line */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-middle-line-item ${middleLine === 'solid' ? 'active' : ''}`}
                                onClick={() => handleSelectMiddleLine('solid')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {middleLine === 'solid' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-middle-line-content">
                                  <span className="quiz-middle-line-title">২. সলিড লাইন (Solid Line)</span>
                                  <span className="quiz-middle-line-desc">কলামগুলোর মাঝে পরিষ্কার সলিড ডিভাইডার লাইন থাকবে।</span>
                                </div>
                              </button>

                              {/* 3. No Line */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-middle-line-item ${(middleLine === 'none' || middleLine === 'none-no-gap' || middleLine === 'gap-space' || middleLine === 'gap-30') ? 'active' : ''}`}
                                onClick={() => handleSelectMiddleLine('none')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {(middleLine === 'none' || middleLine === 'none-no-gap' || middleLine === 'gap-space' || middleLine === 'gap-30') && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-middle-line-content">
                                  <span className="quiz-middle-line-title">৩. লাইন ছাড়া (No Line)</span>
                                  <span className="quiz-middle-line-desc">কলামগুলোর মাঝে কোনো ডিভাইডার লাইন থাকবে না।</span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sub-Accordion 5: মাঝের লাইন Gap */}
                        <div className={`quiz-font-sub-group ${layoutSubAccordion.middleGap ? 'active' : ''}`} style={{ marginTop: '8px' }}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${layoutSubAccordion.middleGap ? 'active' : ''}`}
                            onClick={() => toggleLayoutSubAccordion('middleGap')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-arrows-left-right" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>মাঝের লাইন Gap:</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {middleGap === 0
                                    ? 'No Gap'
                                    : middleGap === 20
                                    ? '20px'
                                    : middleGap === 30
                                    ? '30px'
                                    : `${middleGap}px`}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${layoutSubAccordion.middleGap ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {layoutSubAccordion.middleGap && (
                            <div className="quiz-global-sub-card">
                              {/* 1. No Gap */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-middle-line-item ${middleGap === 0 ? 'active' : ''}`}
                                onClick={() => handleSelectMiddleGap(0)}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {middleGap === 0 && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-middle-line-content">
                                  <span className="quiz-middle-line-title">No Gap (০ পিক্সেল)</span>
                                  <span className="quiz-middle-line-desc">কলাম বা ডিভাইডার লাইনের দুই পাশে কোনো ফাঁকা জায়গা থাকবে না।</span>
                                </div>
                              </button>

                              {/* 2. 20px */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-middle-line-item ${middleGap === 20 ? 'active' : ''}`}
                                onClick={() => handleSelectMiddleGap(20)}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {middleGap === 20 && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-middle-line-content">
                                  <span className="quiz-middle-line-title">20px (২০ পিক্সেল - ডিফল্ট)</span>
                                  <span className="quiz-middle-line-desc">মাঝখানে ২০ পিক্সেল গ্যাপ (ডিভাইডার লাইন থাকলে দুই পাশে ১০ পিক্সেল করে)।</span>
                                </div>
                              </button>

                              {/* 3. 30px */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-middle-line-item ${middleGap === 30 ? 'active' : ''}`}
                                onClick={() => handleSelectMiddleGap(30)}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {middleGap === 30 && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-middle-line-content">
                                  <span className="quiz-middle-line-title">30px (৩০ পিক্সেল)</span>
                                  <span className="quiz-middle-line-desc">মাঝখানে ৩০ পিক্সেল গ্যাপ (ডিভাইডার লাইন থাকলে দুই পাশে ১৫ পিক্সেল করে)।</span>
                                </div>
                              </button>

                              {/* 4. Custom Gap */}
                              <div className="quiz-cut-mark-custom-card" style={{ marginTop: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div className="quiz-cut-mark-custom-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>কাস্টম গ্যাপ (Custom Gap):</span>
                                  {![0, 20, 30].includes(middleGap) && (
                                    <span className="quiz-font-accordion-badge" style={{ fontSize: '11px', color: '#0284c7', borderColor: '#bae6fd', background: '#f0f9ff' }}>
                                      সক্রিয়: {middleGap}px
                                    </span>
                                  )}
                                </div>
                                <div className="quiz-font-custom-input-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="পিক্সেল (যেমন: 25)"
                                    value={customMiddleGapInput}
                                    onChange={(e) => setCustomMiddleGapInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleApplyCustomMiddleGap();
                                    }}
                                    className="quiz-font-input"
                                    style={{ flex: 1 }}
                                  />
                                  <button
                                    type="button"
                                    className="quiz-font-apply-btn"
                                    onClick={handleApplyCustomMiddleGap}
                                  >
                                    সেট করুন
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Color Answer Style */}
                  <div className={`quiz-global-section color-style-section ${globalAccordion.colorAnswerStyle ? 'active' : ''}`}>
                    <div
                      className="quiz-global-section-header"
                      onClick={() => toggleGlobalAccordion('colorAnswerStyle')}
                      title="কালার অ্যানসার স্টাইল সেটিংস"
                    >
                      <div className="quiz-global-section-header-left">
                        <i className="fa-solid fa-palette" style={{ color: '#0284c7' }}></i>
                        <span>Color Answer Style:</span>
                      </div>
                      <div className="quiz-global-section-header-right">
                        <span className="quiz-font-accordion-badge">
                          <span className="quiz-font-accordion-badge-text">
                            {highlightMode === 'single' ? 'শুধু নির্বাচিত' : highlightMode === 'both' ? 'উভয়টি' : 'সিলেকশন'}
                            {' · '}
                            {highlightColor === 'full-bg'
                              ? 'সলিড'
                              : highlightColor === 'border-only'
                              ? 'বর্ডার'
                              : highlightColor === 'label-only'
                              ? 'চিহ্ন'
                              : highlightColor === 'highlight-and-circle'
                              ? 'আইকন+চিহ্ন'
                              : highlightColor === 'with-icons'
                              ? 'আইকন'
                              : highlightColor === 'bottom-line'
                              ? 'লাইন'
                              : 'হালকা'}
                          </span>
                        </span>
                        <i className={`fa-solid fa-${globalAccordion.colorAnswerStyle ? 'minus' : 'plus'} quiz-font-accordion-plus-minus`}></i>
                      </div>
                    </div>

                    {globalAccordion.colorAnswerStyle && (
                      <div className="quiz-global-section-body">
                        {/* Sub-Accordion 1: হাইলাইট স্টাইল (১ম অপশন গ্রুপ) */}
                        <div className={`quiz-font-sub-group ${colorStyleSubAccordion.style ? 'active' : ''}`}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${colorStyleSubAccordion.style ? 'active' : ''}`}
                            onClick={() => toggleColorStyleSubAccordion('style')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-highlighter" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>হাইলাইট স্টাইল:</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {highlightMode === 'single' ? 'শুধু নির্বাচিত' : highlightMode === 'both' ? 'উভয়টি দেখান' : 'সঠিক/ভুল ছাড়া'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${colorStyleSubAccordion.style ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {colorStyleSubAccordion.style && (
                            <div className="quiz-global-sub-card">
                              {/* 1. শুধু নির্বাচিত অপশন হাইলাইট */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightMode === 'single' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightMode('single')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightMode === 'single' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">শুধু নির্বাচিত অপশন হাইলাইট</span>
                                  <span className="quiz-color-style-desc">অপশনে ক্লিক করলে শুধুমাত্র নির্বাচিত অপশনের ফলাফল হাইলাইট হবে।</span>
                                </div>
                              </button>

                              {/* 2. সঠিক ও ভুল উভয়টি দেখান */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightMode === 'both' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightMode('both')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightMode === 'both' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">সঠিক ও ভুল উভয়টি দেখান</span>
                                  <span className="quiz-color-style-desc">ভুল অপশনটি লাল এবং সঠিক অপশনটি সবুজ রঙে হাইলাইট করে উভয় ফলাফল একসাথে দেখানো হবে।</span>
                                </div>
                              </button>

                              {/* 3. সঠিক বা ভুল দেখাবে না (শুধু সিলেকশন) */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightMode === 'neutral' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightMode('neutral')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightMode === 'neutral' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">সঠিক বা ভুল দেখাবে না (শুধু সিলেকশন)</span>
                                  <span className="quiz-color-style-desc">সঠিক বা ভুল কোনো ফলাফল প্রকাশ পাবে না, শুধুমাত্র অপশনটি নির্বাচন করা হয়েছে তা প্রকাশ পাবে।</span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sub-Accordion 2: হাইলাইট কালার (২য় অপশন গ্রুপ - ৭টি কালার অপশন) */}
                        <div className={`quiz-font-sub-group ${colorStyleSubAccordion.color ? 'active' : ''}`} style={{ marginTop: '8px' }}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${colorStyleSubAccordion.color ? 'active' : ''}`}
                            onClick={() => toggleColorStyleSubAccordion('color')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-palette" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>হাইলাইট কালার:</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {highlightColor === 'full-bg'
                                    ? 'পূর্ণ ব্যাকগ্রাউন্ড'
                                    : highlightColor === 'border-only'
                                    ? 'শুধু বর্ডার'
                                    : highlightColor === 'label-only'
                                    ? 'শুধু চিহ্ন'
                                    : highlightColor === 'highlight-and-circle'
                                    ? 'আইকন+চিহ্ন'
                                    : highlightColor === 'with-icons'
                                    ? 'আইকন'
                                    : highlightColor === 'bottom-line'
                                    ? 'লাইন'
                                    : 'হালকা হাইলাইট'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${colorStyleSubAccordion.color ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {colorStyleSubAccordion.color && (
                            <div className="quiz-global-sub-card">
                              {/* 1. পূর্ণ ব্যাকগ্রাউন্ড */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightColor === 'full-bg' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightColor('full-bg')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightColor === 'full-bg' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">পূর্ণ ব্যাকগ্রাউন্ড</span>
                                  <span className="quiz-color-style-desc">সঠিক বা ভুল অনুযায়ী পুরো অপশনের ব্যাকগ্রাউন্ড সলিড রঙ পরিবর্তন হবে।</span>
                                </div>
                              </button>

                              {/* 2. শুধু বর্ডার পরিবর্তন */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightColor === 'border-only' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightColor('border-only')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightColor === 'border-only' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">শুধু বর্ডার পরিবর্তন</span>
                                  <span className="quiz-color-style-desc">সঠিক বা ভুল অনুযায়ী শুধু অপশনের বর্ডারের রঙ পরিবর্তন হবে, ব্যাকগ্রাউন্ড অপরিবর্তিত থাকবে।</span>
                                </div>
                              </button>

                              {/* 3. শুধু অপশন চিহ্ন পরিবর্তন */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightColor === 'label-only' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightColor('label-only')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightColor === 'label-only' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">শুধু অপশন চিহ্ন পরিবর্তন</span>
                                  <span className="quiz-color-style-desc">সঠিক বা ভুল অনুযায়ী শুধু ক, খ, গ, ঘ অপশন লেবেলের রঙ পরিবর্তন হবে।</span>
                                </div>
                              </button>

                              {/* 4. আইকন + অপশন চিহ্ন */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightColor === 'highlight-and-circle' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightColor('highlight-and-circle')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightColor === 'highlight-and-circle' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">আইকন + অপশন চিহ্ন</span>
                                  <span className="quiz-color-style-desc">সঠিক উত্তরের পাশে ✓ এবং ভুল উত্তরের পাশে ✕ আইকন দেখানোর সাথে ক, খ, গ, ঘ অপশন লেবেলের রঙ পরিবর্তন হবে।</span>
                                </div>
                              </button>

                              {/* 5. আইকন দিয়ে দেখান */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightColor === 'with-icons' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightColor('with-icons')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightColor === 'with-icons' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">আইকন দিয়ে দেখান</span>
                                  <span className="quiz-color-style-desc">সঠিক উত্তরের পাশে ✓ এবং ভুল উত্তরের পাশে ✕ আইকন দেখিয়ে ফলাফল বোঝানো হবে।</span>
                                </div>
                              </button>

                              {/* 6. লাইন দিয়ে দেখান */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightColor === 'bottom-line' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightColor('bottom-line')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightColor === 'bottom-line' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">লাইন দিয়ে দেখান</span>
                                  <span className="quiz-color-style-desc">সঠিক বা ভুল অনুযায়ী অপশনের নিচে সবুজ বা লাল লাইন দেখানো হবে, তবে অপশনের ব্যাকগ্রাউন্ড অপরিবর্তিত থাকবে।</span>
                                </div>
                              </button>

                              {/* 7. হালকা হাইলাইট */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${highlightColor === 'soft-highlight' ? 'active' : ''}`}
                                onClick={() => handleSelectHighlightColor('soft-highlight')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {highlightColor === 'soft-highlight' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">হালকা হাইলাইট</span>
                                  <span className="quiz-color-style-desc">সঠিক বা ভুল অনুযায়ী অপশনের ব্যাকগ্রাউন্ডে হালকা সবুজ বা লাল রঙের আভা দেখানো হবে।</span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Answer & Explanation Settings */}
                  <div className={`quiz-global-section explanation-section ${globalAccordion.explanation ? 'active' : ''}`}>
                    <div
                      className="quiz-global-section-header"
                      onClick={() => toggleGlobalAccordion('explanation')}
                      title="উত্তর ও ব্যাখ্যা সেটিংস"
                    >
                      <div className="quiz-global-section-header-left">
                        <i className="fa-solid fa-list-check" style={{ color: '#0284c7' }}></i>
                        <span>উত্তর ও ব্যাখ্যা (Answer & Explanation):</span>
                      </div>
                      <div className="quiz-global-section-header-right">
                        <span className="quiz-font-accordion-badge">
                          <span className="quiz-font-accordion-badge-text">
                            {showAnswer ? 'উত্তর: হ্যাঁ' : 'উত্তর: না'}
                            {' · '}
                            {explanationMode === 'on-select'
                              ? 'স্বয়ংক্রিয়'
                              : explanationMode === 'on-button'
                              ? 'বাটনে'
                              : explanationMode === 'on-wrong'
                              ? 'ভুল হলে'
                              : 'বন্ধ'}
                          </span>
                        </span>
                        <i className={`fa-solid fa-${globalAccordion.explanation ? 'minus' : 'plus'} quiz-font-accordion-plus-minus`}></i>
                      </div>
                    </div>

                    {globalAccordion.explanation && (
                      <div className="quiz-global-section-body">
                        {/* Sub-Accordion 1: সঠিক উত্তর (Show Answer) */}
                        <div className={`quiz-font-sub-group ${explanationSubAccordion.answer ? 'active' : ''}`}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${explanationSubAccordion.answer ? 'active' : ''}`}
                            onClick={() => toggleExplanationSubAccordion('answer')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>সঠিক উত্তর (Show Answer):</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {showAnswer ? 'সঠিক উত্তর দেখান (Yes)' : 'সঠিক উত্তর বন্ধ (No)'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${explanationSubAccordion.answer ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {explanationSubAccordion.answer && (
                            <div className="quiz-global-sub-card">
                              {/* 1. Yes - সঠিক উত্তর দেখান */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${showAnswer ? 'active' : ''}`}
                                onClick={() => handleSelectShowAnswer(true)}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {showAnswer && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">১. সঠিক উত্তর দেখান (Yes)</span>
                                  <span className="quiz-color-style-desc">প্রশ্নের নিচে এবং ফলাফল কার্ডে সরাসরি সঠিক উত্তর টেক্সট প্রদর্শন করবে।</span>
                                </div>
                              </button>

                              {/* 2. No - সঠিক উত্তর বন্ধ রাখুন */}
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${!showAnswer ? 'active' : ''}`}
                                onClick={() => handleSelectShowAnswer(false)}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {!showAnswer && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">২. সঠিক উত্তর বন্ধ রাখুন (No)</span>
                                  <span className="quiz-color-style-desc">প্রশ্নের নিচে সঠিক উত্তর টেক্সট প্রদর্শিত হবে না।</span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Sub-Accordion 2: ব্যাখ্যা প্রদর্শন (Explanation Mode) */}
                        <div className={`quiz-font-sub-group ${explanationSubAccordion.explanation ? 'active' : ''}`} style={{ marginTop: '8px' }}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${explanationSubAccordion.explanation ? 'active' : ''}`}
                            onClick={() => toggleExplanationSubAccordion('explanation')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-circle-info" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>ব্যাখ্যা প্রদর্শন (Explanation Mode):</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {explanationMode === 'on-select'
                                    ? 'অপশন নির্বাচনে'
                                    : explanationMode === 'on-button'
                                    ? 'বাটনে ক্লিকে'
                                    : explanationMode === 'on-wrong'
                                    ? 'ভুল উত্তরে'
                                    : 'কোনো ব্যাখ্যা নেই'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${explanationSubAccordion.explanation ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {explanationSubAccordion.explanation && (
                            <div className="quiz-global-sub-card">
                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${explanationMode === 'on-select' ? 'active' : ''}`}
                                onClick={() => handleSelectExplanationMode('on-select')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {explanationMode === 'on-select' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">১. অপশন নির্বাচনে ব্যাখ্যা দেখান</span>
                                  <span className="quiz-color-style-desc">অপশনে ক্লিক করা মাত্রই স্বয়ংক্রিয়ভাবে বিস্তারিত ব্যাখ্যা দেখা যাবে।</span>
                                </div>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${explanationMode === 'on-button' ? 'active' : ''}`}
                                onClick={() => handleSelectExplanationMode('on-button')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {explanationMode === 'on-button' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">২. ব্যাখ্যা বাটনে ক্লিক করলে দেখান</span>
                                  <span className="quiz-color-style-desc">ব্যাখ্যা বাটনে ম্যানুয়ালি ক্লিক করলে তখন ব্যাখ্যা উন্মোচিত হবে।</span>
                                </div>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${explanationMode === 'on-wrong' ? 'active' : ''}`}
                                onClick={() => handleSelectExplanationMode('on-wrong')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {explanationMode === 'on-wrong' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">৩. ভুল উত্তরে ব্যাখ্যা দেখান</span>
                                  <span className="quiz-color-style-desc">শুধুমাত্র ভুল উত্তর নির্বাচন করলে সঠিক সমাধান ও ব্যাখ্যা দেখা যাবে।</span>
                                </div>
                              </button>

                              <button
                                type="button"
                                className={`quiz-layout-menu-item quiz-color-style-item ${explanationMode === 'none' ? 'active' : ''}`}
                                onClick={() => handleSelectExplanationMode('none')}
                              >
                                <div className="quiz-layout-radio-circle">
                                  {explanationMode === 'none' && <div className="quiz-layout-radio-inner"></div>}
                                </div>
                                <div className="quiz-color-style-content">
                                  <span className="quiz-color-style-title">৪. কোনো ব্যাখ্যা দেখাবেন না</span>
                                  <span className="quiz-color-style-desc">প্রশ্নে কোনো প্রকার ব্যাখ্যা বা সমাধানের বাটন প্রদর্শিত হবে না।</span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Option Letter Settings */}
                  <div className={`quiz-global-section option-letter-section ${globalAccordion.optionLetter ? 'active' : ''}`}>
                    <div
                      className="quiz-global-section-header"
                      onClick={() => toggleGlobalAccordion('optionLetter')}
                      title="অপশন অক্ষর সেটিংস"
                    >
                      <div className="quiz-global-section-header-left">
                        <i className="fa-solid fa-arrow-down-a-z" style={{ color: '#0284c7' }}></i>
                        <span>অপশন অক্ষর (Option Letter):</span>
                      </div>
                      <div className="quiz-global-section-header-right">
                        <span className="quiz-font-accordion-badge">
                          <span className="quiz-font-accordion-badge-text">
                            {optionLetter === 'english' ? 'A, B, C, D' : 'ক, খ, গ, ঘ'}
                          </span>
                        </span>
                        <i className={`fa-solid fa-${globalAccordion.optionLetter ? 'minus' : 'plus'} quiz-font-accordion-plus-minus`}></i>
                      </div>
                    </div>

                    {globalAccordion.optionLetter && (
                      <div className="quiz-global-section-body">
                        {/* 1. ক, খ, গ, ঘ (বাংলা অপশন লেবেল) */}
                        <button
                          type="button"
                          className={`quiz-layout-menu-item quiz-middle-line-item ${optionLetter === 'bangla' ? 'active' : ''}`}
                          onClick={() => handleSelectOptionLetter('bangla')}
                        >
                          <div className="quiz-layout-radio-circle">
                            {optionLetter === 'bangla' && <div className="quiz-layout-radio-inner"></div>}
                          </div>
                          <div className="quiz-middle-line-content">
                            <span className="quiz-middle-line-title">ক, খ, গ, ঘ</span>
                            <span className="quiz-middle-line-desc">বাংলা অপশন লেবেল</span>
                          </div>
                        </button>

                        {/* 2. A, B, C, D (ইংরেজি অপশন লেবেল) */}
                        <button
                          type="button"
                          className={`quiz-layout-menu-item quiz-middle-line-item ${optionLetter === 'english' ? 'active' : ''}`}
                          onClick={() => handleSelectOptionLetter('english')}
                        >
                          <div className="quiz-layout-radio-circle">
                            {optionLetter === 'english' && <div className="quiz-layout-radio-inner"></div>}
                          </div>
                          <div className="quiz-middle-line-content">
                            <span className="quiz-middle-line-title">A, B, C, D</span>
                            <span className="quiz-middle-line-desc">ইংরেজি অপশন লেবেল</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Cut Mark (Negative Marking) */}
                  <div className={`quiz-global-section cutmark-section ${globalAccordion.cutMark ? 'active' : ''}`}>
                    <div
                      className="quiz-global-section-header"
                      onClick={() => toggleGlobalAccordion('cutMark')}
                      title="নেগেটিভ মার্কিং / কাট মার্ক সেটিংস"
                    >
                      <div className="quiz-global-section-header-left">
                        <i className="fa-solid fa-pen-ruler" style={{ color: '#ef4444' }}></i>
                        <span>নেগেটিভ মার্কিং (Cut Mark):</span>
                      </div>
                      <div className="quiz-global-section-header-right">
                        <span className="quiz-font-accordion-badge" style={{ color: '#ef4444', borderColor: '#fca5a5', background: '#fef2f2' }}>
                          <span className="quiz-font-accordion-badge-text">
                            {cutMark === 0 ? '০ নম্বর' : `${toBengaliNumber(cutMark)} নম্বর`}
                          </span>
                        </span>
                        <i className={`fa-solid fa-${globalAccordion.cutMark ? 'minus' : 'plus'} quiz-font-accordion-plus-minus`}></i>
                      </div>
                    </div>

                    {globalAccordion.cutMark && (
                      <div className="quiz-global-section-body">
                        <button
                          type="button"
                          className={`quiz-layout-menu-item ${cutMarkMode === '0.5' ? 'active' : ''}`}
                          onClick={() => handleSelectPresetCutMark(0.5, '0.5')}
                        >
                          <div className="quiz-layout-radio-circle">
                            {cutMarkMode === '0.5' && <div className="quiz-layout-radio-inner" ></div>}
                          </div>
                          <span>০.৫ নম্বর কাটা যাবে (ডিফল্ট)</span>
                        </button>

                        <button
                          type="button"
                          className={`quiz-layout-menu-item ${cutMarkMode === '0.25' ? 'active' : ''}`}
                          onClick={() => handleSelectPresetCutMark(0.25, '0.25')}
                        >
                          <div className="quiz-layout-radio-circle">
                            {cutMarkMode === '0.25' && <div className="quiz-layout-radio-inner" ></div>}
                          </div>
                          <span>০.২৫ নম্বর কাটা যাবে</span>
                        </button>

                        <button
                          type="button"
                          className={`quiz-layout-menu-item ${cutMarkMode === '0' ? 'active' : ''}`}
                          onClick={() => handleSelectPresetCutMark(0, '0')}
                        >
                          <div className="quiz-layout-radio-circle">
                            {cutMarkMode === '0' && <div className="quiz-layout-radio-inner" ></div>}
                          </div>
                          <span>No Cut Mark (০ নম্বর)</span>
                        </button>

                        <div className="quiz-cut-mark-custom-card">
                          <div className="quiz-cut-mark-custom-header">
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>কাস্টম কাট মার্ক:</span>
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

                  {/* Section 3: Font Settings */}
                  <div className={`quiz-global-section font-section ${globalAccordion.font ? 'active' : ''}`}>
                    <div
                      className="quiz-global-section-header"
                      onClick={() => toggleGlobalAccordion('font')}
                      title="ফন্ট সেটিংস"
                    >
                      <div className="quiz-global-section-header-left">
                        <i className="fa-solid fa-font" style={{ color: '#0284c7' }}></i>
                        <span>ফন্ট সেটিংস (Font):</span>
                      </div>
                      <div className="quiz-global-section-header-right">
                        <span className="quiz-font-accordion-badge">
                          <span className="quiz-font-accordion-badge-text">৩টি অপশন</span>
                        </span>
                        <i className={`fa-solid fa-${globalAccordion.font ? 'minus' : 'plus'} quiz-font-accordion-plus-minus`}></i>
                      </div>
                    </div>

                    {globalAccordion.font && (
                      <div className="quiz-global-section-body">
                        {/* Section 2.1: Font Size Accordion */}
                        <div className={`quiz-font-sub-group ${fontAccordion.size ? 'active' : ''}`}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${fontAccordion.size ? 'active' : ''}`}
                            onClick={() => toggleFontAccordion('size')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-text-height" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>ফন্ট সাইজ:</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">{fontSize} px</span>
                              </span>
                              <i className={`fa-solid fa-chevron-${fontAccordion.size ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {fontAccordion.size && (
                            <div className="quiz-global-sub-card">
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
                        </div>

                        {/* Section 2.2: Font Family Accordion */}
                        <div className={`quiz-font-sub-group ${fontAccordion.family ? 'active' : ''}`}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${fontAccordion.family ? 'active' : ''}`}
                            onClick={() => toggleFontAccordion('family')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-paragraph" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>ফন্ট ফ্যামিলি:</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontFamily, fontSize: '11px', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {FONT_FAMILIES.find((f) => f.family === fontFamily)?.name || 'Noto Sans'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${fontAccordion.family ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {fontAccordion.family && (
                            <div className="quiz-global-sub-card">
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
                                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{font.name}</span>
                                      <span style={{ fontSize: '11px', color: '#64748b' }}>{font.sub}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Section 2.3: Font Weight Accordion */}
                        <div className={`quiz-font-sub-group ${fontAccordion.weight ? 'active' : ''}`}>
                          <div
                            className={`quiz-font-accordion-header quiz-font-sub-header ${fontAccordion.weight ? 'active' : ''}`}
                            onClick={() => toggleFontAccordion('weight')}
                          >
                            <div className="quiz-font-accordion-header-left">
                              <i className="fa-solid fa-bold" style={{ color: '#0284c7', fontSize: '12px' }}></i>
                              <span style={{ fontSize: '12.5px', fontWeight: 600 }}>ফন্ট ওয়েট:</span>
                            </div>
                            <div className="quiz-font-accordion-header-right">
                              <span className="quiz-font-accordion-badge" style={{ fontSize: '11px' }}>
                                <span className="quiz-font-accordion-badge-text">
                                  {fontWeight === 'thin' ? 'Thin' : fontWeight === 'medium' ? 'Medium' : fontWeight === 'bold' ? 'Bold' : 'Regular'}
                                </span>
                              </span>
                              <i className={`fa-solid fa-chevron-${fontAccordion.weight ? 'up' : 'down'} quiz-font-accordion-chevron`}></i>
                            </div>
                          </div>

                          {fontAccordion.weight && (
                            <div className="quiz-global-sub-card">
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
                                      <span style={{ fontSize: '13px', fontWeight: item.weight }}>{item.name}</span>
                                      <span style={{ fontSize: '11px', color: '#64748b' }}>{item.sub}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>


                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
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
        ) : (
          <>


            {questionLayout === '2q-col' ? (
              <div
                className={`quiz-questions-col-wrapper ${questionStyle === 'box' ? 'style-box-mode' : (questionStyle === 'circle' || questionStyle === 'nostyle') ? 'style-nostyle-mode' : ''} midline-${middleLine}`}
                style={{ '--quiz-midline-gap': `${middleGap}px`, '--quiz-midline-half-gap': `${middleGap / 2}px` }}
              >
                <div className="quiz-questions-column">
                  {displayQuestions
                    .slice(0, Math.ceil(displayQuestions.length / 2))
                    .map((q, idx) => renderQuestionBlock(q, idx, `layout-${optionLayout}`))}
                </div>
                <div className="quiz-questions-column">
                  {displayQuestions
                    .slice(Math.ceil(displayQuestions.length / 2))
                    .map((q, idx) => {
                      const actualIdx = idx + Math.ceil(displayQuestions.length / 2);
                      return renderQuestionBlock(q, actualIdx, `layout-${optionLayout}`);
                    })}
                </div>
              </div>
            ) : questionLayout === '2q-row' ? (
              <div
                className={`quiz-questions-col-wrapper ${questionStyle === 'box' ? 'style-box-mode' : (questionStyle === 'circle' || questionStyle === 'nostyle') ? 'style-nostyle-mode' : ''} midline-${middleLine}`}
                style={{ '--quiz-midline-gap': `${middleGap}px`, '--quiz-midline-half-gap': `${middleGap / 2}px` }}
              >
                <div className="quiz-questions-column">
                  {displayQuestions
                    .filter((_, idx) => idx % 2 === 0)
                    .map((q, i) => renderQuestionBlock(q, i * 2, `layout-${optionLayout}`))}
                </div>
                <div className="quiz-questions-column">
                  {displayQuestions
                    .filter((_, idx) => idx % 2 === 1)
                    .map((q, i) => renderQuestionBlock(q, i * 2 + 1, `layout-${optionLayout}`))}
                </div>
              </div>
            ) : questionLayout === '3q-col' ? (
              <div
                className={`quiz-questions-col-wrapper col-3 ${questionStyle === 'box' ? 'style-box-mode' : (questionStyle === 'circle' || questionStyle === 'nostyle') ? 'style-nostyle-mode' : ''} midline-${middleLine}`}
                style={{ '--quiz-midline-gap': `${middleGap}px`, '--quiz-midline-half-gap': `${middleGap / 2}px` }}
              >
                <div className="quiz-questions-column">
                  {displayQuestions
                    .slice(0, Math.ceil(displayQuestions.length / 3))
                    .map((q, idx) => renderQuestionBlock(q, idx, `layout-${optionLayout}`))}
                </div>
                <div className="quiz-questions-column">
                  {displayQuestions
                    .slice(Math.ceil(displayQuestions.length / 3), Math.ceil(displayQuestions.length / 3) * 2)
                    .map((q, idx) => {
                      const actualIdx = idx + Math.ceil(displayQuestions.length / 3);
                      return renderQuestionBlock(q, actualIdx, `layout-${optionLayout}`);
                    })}
                </div>
                <div className="quiz-questions-column">
                  {displayQuestions
                    .slice(Math.ceil(displayQuestions.length / 3) * 2)
                    .map((q, idx) => {
                      const actualIdx = idx + Math.ceil(displayQuestions.length / 3) * 2;
                      return renderQuestionBlock(q, actualIdx, `layout-${optionLayout}`);
                    })}
                </div>
              </div>
            ) : questionLayout === '3q-row' ? (
              <div
                className={`quiz-questions-col-wrapper col-3 ${questionStyle === 'box' ? 'style-box-mode' : (questionStyle === 'circle' || questionStyle === 'nostyle') ? 'style-nostyle-mode' : ''} midline-${middleLine}`}
                style={{ '--quiz-midline-gap': `${middleGap}px`, '--quiz-midline-half-gap': `${middleGap / 2}px` }}
              >
                <div className="quiz-questions-column">
                  {displayQuestions
                    .filter((_, idx) => idx % 3 === 0)
                    .map((q, i) => renderQuestionBlock(q, i * 3, `layout-${optionLayout}`))}
                </div>
                <div className="quiz-questions-column">
                  {displayQuestions
                    .filter((_, idx) => idx % 3 === 1)
                    .map((q, i) => renderQuestionBlock(q, i * 3 + 1, `layout-${optionLayout}`))}
                </div>
                <div className="quiz-questions-column">
                  {displayQuestions
                    .filter((_, idx) => idx % 3 === 2)
                    .map((q, i) => renderQuestionBlock(q, i * 3 + 2, `layout-${optionLayout}`))}
                </div>
              </div>
            ) : (
              <div className={`quiz-questions-wrapper ${questionStyle === 'box' ? 'style-box-mode' : (questionStyle === 'circle' || questionStyle === 'nostyle') ? 'style-nostyle-mode' : ''}`}>
                {displayQuestions.map((q, qIndex) => renderQuestionBlock(q, qIndex, `layout-${optionLayout}`))}
              </div>
            )}
          </>
        )}

        {/* Result Section: Shown ONLY after all answers are submitted */}
        {!loading && !isReadMode && displayQuestions.length > 0 && Object.keys(answeredQuestions).length === displayQuestions.length && !isReviewWrongMode && (
          <div className="quiz-result-section">
            <h2>পরীক্ষার ফলাফল</h2>
            <div className="quiz-detailed-stats">
              সঠিক উত্তর: <span className="quiz-correct-count">{toBengaliNumber(correctCount)}</span> টি
              &nbsp;&nbsp;|&nbsp;&nbsp;
              ভুল উত্তর: <span className="quiz-incorrect-count">{toBengaliNumber(incorrectCount)}</span> টি
              &nbsp;&nbsp;|&nbsp;&nbsp;
              উত্তর দেওয়া হয়নি: <span>{toBengaliNumber(unansweredCount)}</span> টি
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
              আপনার মোট প্রাপ্ত স্কোর: {formatScore(score)}
            </div>

            {/* User-requested Result Action Buttons */}
            <div className="quiz-result-actions">
              <button
                type="button"
                className="quiz-result-btn btn-view-wrong"
                onClick={handleViewWrongAnswers}
              >
                <i className="fa-solid fa-eye"></i> ভুল উত্তর দেখুন
              </button>
              <button
                type="button"
                className="quiz-result-btn btn-retake-wrong"
                onClick={handleRetakeWrongAnswers}
              >
                <i className="fa-solid fa-pen-to-square"></i> ভুল উত্তরের ওপর পরীক্ষা দিন
              </button>
              <button
                type="button"
                className="quiz-result-btn btn-retake-all"
                onClick={resetQuiz}
              >
                <i className="fa-solid fa-rotate-right"></i> পুনরায় সম্পূর্ণ পরীক্ষা দিন
              </button>
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

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>প্রশ্ন লোড হচ্ছে...</div>}>
      <QuestionsComponent />
    </Suspense>
  );
}
