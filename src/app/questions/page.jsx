'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  const [isReadMode, setIsReadMode] = useState(false);
  const [showColor, setShowColor] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false); // Default OFF in exam
  const [showExplanation, setShowExplanation] = useState(true); // Default ON
  const [showTime, setShowTime] = useState(false); // Default OFF
  const [showScore, setShowScore] = useState(true); // Default ON

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

  // Tooltip
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  // Load questions from API
  useEffect(() => {
    setLoading(true);
    setError('');

    const url = categoryParam
      ? `/api/questions?category=${encodeURIComponent(categoryParam)}`
      : '/api/questions';

    fetch(url)
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
      setShowAnswer(true); // In Read mode, show answer is active
      setTimerRunning(false);
    } else {
      // Exiting Read Mode: Time and Score switches are ENABLED again
      setShowScore(true);
      setShowAnswer(false); // Reset to default exam mode
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
      <style jsx>{`
        .quiz-section-wrapper {
          position: relative;
          width: 100%;
          max-width: 1300px;
          margin: 30px auto;
          padding: 0 20px;
        }
        .quiz-container {
          width: 100%;
          background: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          position: relative;
        }
        .quiz-container h1, .quiz-container h2 {
          text-align: center;
          color: #2c3e50;
          margin-top: 5px;
          margin-bottom: 5px;
        }

        /* Floating Status Bar */
        .quiz-floating-status-bar {
          position: fixed;
          top: 126px;
          right: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          z-index: 999;
        }
        .quiz-timer-board {
          background: #e74c3c;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          min-width: 90px;
          text-align: center;
        }
        .quiz-score-board {
          background: #2ecc71;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          min-width: 90px;
          text-align: center;
        }

        /* Corner Toast Popup */
        .quiz-corner-popup {
          position: fixed;
          bottom: 25px;
          right: 25px;
          background: #ffffff;
          padding: 20px 25px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          z-index: 9999;
          max-width: 380px;
          border-left: 6px solid #28a745;
          animation: quizSlideIn 0.3s ease forwards;
        }
        .quiz-corner-popup.warning { border-left-color: #f39c12; }
        .quiz-corner-popup.danger { border-left-color: #dc3545; }
        .quiz-corner-popup h4 { margin: 0 0 8px 0; font-size: 17px; color: #2c3e50; }
        .quiz-corner-popup p { margin: 0 0 15px 0; font-size: 14px; color: #555; line-height: 1.5; white-space: pre-line; }
        .quiz-popup-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .quiz-popup-btn {
          padding: 7px 14px;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
        }
        .btn-popup-reset { background: #007bff; color: white; }
        .btn-popup-close { background: #6c757d; color: white; }

        @keyframes quizSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .quiz-header-info-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .quiz-exam-path { color: #7f8c8d; font-size: 14px; font-weight: 600; }
        .quiz-negative-mark-note { color: #e74c3c; font-size: 13px; font-weight: 600; }

        .quiz-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          margin-bottom: 25px;
          background: #f8f9fa;
          padding: 10px 15px;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          flex-wrap: wrap;
          gap: 12px;
        }
        .quiz-nav-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .quiz-btn-reset {
          background-color: #2ecc71;
          color: white;
          border: none;
          padding: 7px 14px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .quiz-btn-reset:hover { background-color: #27ae60; }
        .quiz-right-controls-group { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
        .quiz-select-dropdown {
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid #ced4da;
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
          background-color: #fff;
          cursor: pointer;
          outline: none;
        }
        .quiz-switch-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .quiz-switch-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
          cursor: pointer;
          user-select: none;
          transition: opacity 0.2s ease;
        }
        .quiz-switch-label.disabled-switch {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .quiz-switch { position: relative; display: inline-block; width: 36px; height: 20px; }
        .quiz-switch input { opacity: 0; width: 0; height: 0; }
        .quiz-slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc; transition: .3s; border-radius: 20px;
        }
        .quiz-slider:before {
          position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px;
          background-color: white; transition: .3s; border-radius: 50%;
        }
        input:checked + .quiz-slider { background-color: #007bff; }
        input:checked + .quiz-slider:before { transform: translateX(16px); }
        input:disabled + .quiz-slider { cursor: not-allowed; background-color: #cbd5e1; }

        .quiz-color-dots-icon { display: inline-flex; align-items: center; gap: 3px; }
        .quiz-dot-red { width: 9px; height: 9px; background-color: #e74c3c; border-radius: 50%; }
        .quiz-dot-green { width: 9px; height: 9px; background-color: #2ecc71; border-radius: 50%; }

        /* Questions & Interactive Lock Styles */
        .quiz-question-block {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px dashed #ccc;
        }
        .quiz-question-text {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #2c3e50;
          text-align: left;
        }
        .quiz-options-container {
          margin-bottom: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px 15px;
        }
        .quiz-option-btn {
          background: #f8f9fa;
          border: 1px solid #ced4da;
          padding: 10px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 15px;
          text-align: left;
          transition: all 0.2s ease;
          flex: 1 1 calc(50% - 15px);
          min-width: 250px;
        }
        .quiz-option-btn:hover:not(.disabled) {
          background: #e2e6ea;
          border-color: #dae0e5;
        }
        .quiz-option-btn.disabled {
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
        .quiz-option-btn.correct {
          background-color: #2ecc71 !important;
          color: white !important;
          border-color: #27ae60 !important;
          font-weight: bold;
        }
        .quiz-option-btn.incorrect {
          background-color: #e74c3c !important;
          color: white !important;
          border-color: #c0392b !important;
          font-weight: bold;
        }
        .quiz-option-btn.neutral-selected {
          background-color: #e2e8f0 !important;
          color: #000000 !important;
          border-color: #475569 !important;
          font-weight: 600 !important;
        }
        .quiz-answer-text {
          font-weight: bold;
          color: #27ae60;
          margin-top: 10px;
          text-align: left;
          font-size: 15px;
        }
        .quiz-explanation-text {
          font-size: 14px;
          color: #4a5568;
          margin-top: 8px;
          background: #f8fafc;
          padding: 10px 14px;
          border-left: 4px solid #17a2b8;
          border-radius: 4px;
          line-height: 1.6;
        }

        /* Result Section & Progress Bar */
        .quiz-result-section {
          text-align: center;
          margin-top: 40px;
          padding: 25px;
          background: #f1f5f9;
          border-radius: 8px;
        }
        .quiz-detailed-stats { font-size: 15px; margin-bottom: 12px; color: #475569; }
        .quiz-correct-count { color: #2ecc71; font-weight: bold; }
        .quiz-incorrect-count { color: #e74c3c; font-weight: bold; }
        .quiz-progress-bar-container {
          width: 100%;
          max-width: 600px;
          height: 18px;
          background-color: #e2e8f0;
          border-radius: 12px;
          margin: 15px auto 10px auto;
          display: flex;
          overflow: hidden;
          border: 1px solid #ced4da;
          position: relative;
        }
        .quiz-progress-correct { background-color: #2ecc71; height: 100%; transition: width 0.4s ease; cursor: pointer; }
        .quiz-progress-incorrect { background-color: #e74c3c; height: 100%; transition: width 0.4s ease; cursor: pointer; }
        .quiz-progress-unanswered { background-color: #94a3b8; height: 100%; transition: width 0.4s ease; cursor: pointer; }
        #final-score { font-size: 24px; color: #2c3e50; font-weight: bold; margin-top: 10px; }

        /* Tooltip */
        .progress-tooltip-box {
          position: fixed;
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -130%);
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .quiz-floating-status-bar { top: 80px; right: 10px; gap: 6px; }
          .quiz-timer-board, .quiz-score-board { padding: 6px 10px; font-size: 13px; min-width: 75px; }
          .quiz-option-btn { width: 100%; flex: 1 1 100%; }
        }
      `}</style>

      {/* Hover Tooltip */}
      {tooltip.visible && (
        <div className="progress-tooltip-box" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}

      {/* Floating Status Bar */}
      <div className="quiz-floating-status-bar">
        {showTime && !isReadMode && (
          <div className="quiz-timer-board">
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
          </div>

          <div className="quiz-right-controls-group">
            {/* Range and Limit filters */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="quiz-select-dropdown"
                value={rangeIndex}
                onChange={(e) => setRangeIndex(parseInt(e.target.value))}
              >
                {getRangeOptions().map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                className="quiz-select-dropdown"
                value={limit}
                onChange={(e) => {
                  setLimit(e.target.value);
                  setRangeIndex(0);
                }}
              >
                <option value="all">সকল প্রশ্ন</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
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
                    {qIndex + 1}. {q.q}
                  </div>

                  <div className="quiz-options-container">
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
                          <strong>{getBanglaLetter(optIndex)}.</strong> {opt}
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

            {/* Progress Bar with Interactive Hover Tooltip */}
            <div className="quiz-progress-bar-container">
              <div
                className="quiz-progress-correct"
                style={{ width: `${correctPercent}%` }}
                onMouseMove={(e) => handleProgressBarMouseMove(e, 'correct')}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
              ></div>
              <div
                className="quiz-progress-incorrect"
                style={{ width: `${incorrectPercent}%` }}
                onMouseMove={(e) => handleProgressBarMouseMove(e, 'incorrect')}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
              ></div>
              <div
                className="quiz-progress-unanswered"
                style={{ width: `${unansweredPercent}%` }}
                onMouseMove={(e) => handleProgressBarMouseMove(e, 'unanswered')}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
              ></div>
            </div>

            <div id="final-score">
              আপনার মোট প্রাপ্ত স্কোর: {score.toFixed(1)}
            </div>
          </div>
        )}
      </div>
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
