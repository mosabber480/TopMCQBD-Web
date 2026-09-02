'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPaidApiUrl } from '@/lib/config';
import AiChatDrawer from '@/components/common/AiChatDrawer';

function QuestionsComponent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allQuestions, setAllQuestions] = useState([]);
  const [displayQuestions, setDisplayQuestions] = useState([]);

  // User answers map: { [questionIndex]: selectedOptionIndex }
  const [answeredQuestions, setAnsweredQuestions] = useState({});

  // Toggles (Exact Defaults from quiz.html)
  const [isReadMode, setIsReadMode] = useState(false); // Default OFF
  const [showColor, setShowColor] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false); // Default OFF
  const [showExplanation, setShowExplanation] = useState(true); // Default ON
  const [showTime, setShowTime] = useState(false); // Default OFF
  const [showScore, setShowScore] = useState(true); // Default ON
  const [optionLayout, setOptionLayout] = useState('2q-col'); // Default: '2q-col' (১ লাইনে ২টি প্রশ্ন - উপর-নিচ ক্রম)
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const layoutDropdownRef = useRef(null);

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

  const handleAskAI = (q, idx) => {
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

  // Close layout, limit & range menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (layoutDropdownRef.current && !layoutDropdownRef.current.contains(event.target)) {
        setShowLayoutMenu(false);
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

  // Load questions from API
  useEffect(() => {
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

  const handleTimeOut = () => {
    const totalCount = displayQuestions.length || 1;
    const unanswered = totalCount - (correctCount + incorrectCount);
    const pct = ((correctCount / totalCount) * 100).toFixed(0);

    setPopup({
      visible: true,
      type: 'danger',
      title: '⏰ সময় শেষ!',
      msg: `সঠিক: ${correctCount} টি | ভুল: ${incorrectCount} টি | বাকি: ${unanswered} টি\nসঠিক উত্তরের হার: ${pct}%\nমোট স্কোর: ${score.toFixed(1)}`,
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
      msg: `সঠিক উত্তর: ${finalCorrect} টি | ভুল উত্তর: ${finalIncorrect} টি\nসঠিক উত্তরের হার: ${pct}%\nমোট প্রাপ্ত স্কোর: ${finalScore.toFixed(1)}`,
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

  // Option Click Handler (Single Attempt Lock)
  const handleAnswerClick = (qIndex, optIndex) => {
    if (isReadMode) return;
    if (showTime && totalSecondsLeft <= 0) return;
    if (answeredQuestions[qIndex] !== undefined) return; // Locked: no second click allowed!

    const q = displayQuestions[qIndex];
    const correctAns = q.ans;

    const newAnswered = { ...answeredQuestions, [qIndex]: optIndex };
    setAnsweredQuestions(newAnswered);

    let newScore = score;
    let newCorrect = correctCount;
    let newIncorrect = incorrectCount;

    if (optIndex === correctAns) {
      newScore += 1;
      newCorrect += 1;
    } else {
      newScore -= 0.5;
      newIncorrect += 1;
    }

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

  return (
    <div className="quiz-section-wrapper">
      {/* Hover Tooltip */}
      {tooltip.visible && (
        <div className="progress-tooltip-box" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}

      {/* Floating Status Bar */}
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
            স্কোর: <span>{score.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Corner Toast Popup */}
      {popup.visible && (
        <div className={`quiz-corner-popup ${popup.type}`}>
          <h4>{popup.title}</h4>
          <p>{popup.msg}</p>
          <div className="quiz-popup-actions">
            {popup.hasReset && (
              <button className="quiz-popup-btn btn-popup-reset" onClick={resetQuiz}>
                <i className="fa-solid fa-rotate-right"></i> পুনরায় শুরু করুন
              </button>
            )}
            <button className="quiz-popup-btn btn-popup-close" onClick={() => setPopup({ ...popup, visible: false })}>
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

      <div className="quiz-container">
        <h1>Online Questions & Exam Practice</h1>
        <h2>{categoryParam ? categoryParam : 'সাধারণ জ্ঞান ও বিষয়ভিত্তিক প্রশ্নব্যাংক'}</h2>

        <div className="quiz-header-info-bar">
          <div className="quiz-exam-path">
            <i className="fa-solid fa-folder-tree" style={{ marginRight: '6px', color: 'var(--primary, #007bff)' }}></i>
            {categoryParam || 'সকল প্রশ্নব্যাংক'}
          </div>
          <div className="quiz-negative-mark-note">
            [ প্রতিটি ভুল উত্তরের জন্য ০.৫ নম্বর কাটা যাবে ]
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
        {loading ? (
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
                        <button
                          type="button"
                          className="quiz-ask-ai-btn"
                          onClick={() => handleAskAI(q, idx)}
                          title="Ask AI"
                        >
                          Ask AI
                        </button>
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
                        <button
                          type="button"
                          className="quiz-ask-ai-btn"
                          onClick={() => handleAskAI(q, actualIdx)}
                          title="Ask AI"
                        >
                          Ask AI
                        </button>
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
                        <button
                          type="button"
                          className="quiz-ask-ai-btn"
                          onClick={() => handleAskAI(q, actualIdx)}
                          title="Ask AI"
                        >
                          Ask AI
                        </button>
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
                        <button
                          type="button"
                          className="quiz-ask-ai-btn"
                          onClick={() => handleAskAI(q, actualIdx)}
                          title="Ask AI"
                        >
                          Ask AI
                        </button>
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
                    <button
                      type="button"
                      className="quiz-ask-ai-btn"
                      onClick={() => handleAskAI(q, qIndex)}
                      title="Ask AI"
                    >
                      Ask AI
                    </button>
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
        onClick={() => setIsAiOpen(!isAiOpen)}
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

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>প্রশ্ন লোড হচ্ছে...</div>}>
      <QuestionsComponent />
    </Suspense>
  );
}
