'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLiveExamApiUrl } from '@/lib/config';

function LiveExamPlayerContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('id') || 'bcs-46-live';

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [index]: optionIndex }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [index]: boolean }
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [results, setResults] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'wrong', 'correct'

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await fetch(getLiveExamApiUrl(`/api/live-exam/exams?id=${examId}`), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.exam) {
            setExam(data.exam);
            const durationSecs = (data.exam.durationMinutes || 15) * 60;
            setTimeLeft(durationSecs);
            startTimeRef.current = Date.now();
          } else {
            setError('মডেল টেস্ট ডাটা পাওয়া যায়নি।');
          }
        } else {
          setError('সার্ভার থেকে ডাটা লোড ব্যর্থ হয়েছে।');
        }
      } catch (err) {
        setError('ডাটাবেজ সংযোগে সমস্যা দেখা দিয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // Timer countdown
  useEffect(() => {
    if (loading || isSubmitted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, isSubmitted, timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQIndex]: optIndex
    }));
  };

  const handleClearAnswer = () => {
    if (isSubmitted) return;
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQIndex];
      return copy;
    });
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQIndex]: !prev[currentQIndex]
    }));
  };

  const handleAutoSubmit = () => {
    submitQuiz();
  };

  const submitQuiz = async () => {
    if (isSubmitting || isSubmitted || !exam) return;
    setIsSubmitting(true);
    setShowSubmitModal(false);

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await fetch(getLiveExamApiUrl('/api/live-exam/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          examTitle: exam.title,
          userAnswers,
          timeTakenSeconds: timeTaken,
          negativeMarking: exam.negativeMarking || 0.5,
          totalMarks: exam.totalMarks || 20,
          questions: exam.questions || []
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result) {
          setResults(data.result);
          setIsSubmitted(true);
        }
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = exam?.questions || [];
  const currentQ = questions[currentQIndex] || null;

  const answeredCount = Object.keys(userAnswers).length;
  const skippedCount = Math.max(0, questions.length - answeredCount);
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  const retakeExam = () => {
    setIsSubmitted(false);
    setResults(null);
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentQIndex(0);
    const durationSecs = (exam?.durationMinutes || 15) * 60;
    setTimeLeft(durationSecs);
    startTimeRef.current = Date.now();
  };

  if (loading) {
    return (
      <main style={{ padding: '60px 0', backgroundColor: '#f8fafc', minHeight: '85vh', textAlign: 'center' }}>
        <div style={{ fontSize: '2.2rem', marginBottom: '16px' }}>⏳</div>
        <h2 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 700 }}>লাইভ মডেল টেস্ট লোড হচ্ছে...</h2>
        <p style={{ color: '#64748b' }}>অনুগ্রহ করে অপেক্ষা করুন</p>
      </main>
    );
  }

  if (error || !exam) {
    return (
      <main style={{ padding: '60px 0', backgroundColor: '#f8fafc', minHeight: '85vh', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#e11d48', fontSize: '1.4rem', fontWeight: 700 }}>{error || 'পরীক্ষা লোড করা যায়নি'}</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>মডেল টেস্টটি হয়তো সরানো হয়েছে অথবা সার্ভারে সমস্যা হয়েছে।</p>
        <Link href="/live-exam-model-test" style={{
          padding: '10px 24px',
          borderRadius: '8px',
          backgroundColor: '#0284c7',
          color: '#ffffff',
          fontWeight: 700,
          textDecoration: 'none'
        }}>
          সকল মডেল টেস্ট দেখুন ➔
        </Link>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '30px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1150px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Top Exam Header Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '18px 24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Link href="/live-exam-model-test" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
                ⬅ মডেল টেস্ট তালিকা
              </Link>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                {exam.categoryName || 'বিসিএস'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
              {exam.title}
            </h1>
          </div>

          {!isSubmitted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '50px',
                backgroundColor: timeLeft < 60 ? '#ffe4e6' : '#f0f9ff',
                border: timeLeft < 60 ? '1.5px solid #e11d48' : '1.5px solid #0284c7',
                color: timeLeft < 60 ? '#e11d48' : '#0284c7',
                fontWeight: 800,
                fontSize: '1.15rem'
              }}>
                <span>⏱️</span>
                <span>{formatTime(timeLeft)}</span>
              </div>

              <button 
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                }}
              >
                {isSubmitting ? 'সাবমিট হচ্ছে...' : '✓ সাবমিট করুন'}
              </button>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* QUIZ ACTIVE PLAYER VIEW */}
        {/* ==================================================== */}
        {!isSubmitted && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px' }}>
            
            {/* Left: Question Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '30px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '480px'
            }}>
              {currentQ ? (
                <div>
                  {/* Question Top Meta */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}>
                        প্রশ্ন {currentQIndex + 1} / {questions.length}
                      </span>
                      <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
                        বিষয়: {currentQ.subject || 'সাধারণ'}
                      </span>
                    </div>

                    <button 
                      onClick={toggleFlag}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: flaggedQuestions[currentQIndex] ? '#f59e0b' : '#94a3b8',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🏷️ {flaggedQuestions[currentQIndex] ? 'রিভিউ মার্ক করা' : 'রিভিউ রাখুন'}
                    </button>
                  </div>

                  {/* Question Text */}
                  <h2 style={{ fontSize: '1.35rem', color: '#0f172a', lineHeight: 1.6, marginBottom: '28px', fontWeight: 700 }}>
                    {currentQ.question}
                  </h2>

                  {/* Options List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                    {(currentQ.options || []).map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQIndex] === optIdx;
                      const banglaLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
                      const optText = typeof opt === 'object' ? opt.text : opt;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                            backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#475569'
                          }}>
                            {banglaLetters[optIdx] || optIdx + 1}
                          </span>
                          <span style={{ fontSize: '1.02rem', color: isSelected ? '#0369a1' : '#1e293b', fontWeight: isSelected ? 600 : 500 }}>
                            {optText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p>কোনো প্রশ্ন পাওয়া যায়নি।</p>
              )}

              {/* Question Footer Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '20px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <button 
                  onClick={handleClearAnswer}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e11d48',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  উত্তর মুছে ফেলুন
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: currentQIndex === 0 ? '#94a3b8' : '#334155',
                      fontWeight: 600,
                      cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ⬅ পূর্ববর্তী
                  </button>

                  <button 
                    onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentQIndex === questions.length - 1}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: currentQIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: currentQIndex === questions.length - 1 ? 0.6 : 1
                    }}
                  >
                    পরবর্তী ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Question Palette */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              height: 'fit-content'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '16px', fontWeight: 700 }}>
                প্রশ্ন প্যালেট
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.82rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0284c7' }}></div>
                  <span>উত্তর দেওয়া ({answeredCount})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#e2e8f0' }}></div>
                  <span>বাকি আছে ({skippedCount})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f59e0b' }}></div>
                  <span>রিভিউ ({flaggedCount})</span>
                </div>
              </div>

              {/* Palette Grid Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
                {questions.map((_, idx) => {
                  const isCurrent = currentQIndex === idx;
                  const isAnswered = userAnswers[idx] !== undefined;
                  const isFlagged = flaggedQuestions[idx];

                  let bg = '#f1f5f9';
                  let color = '#475569';
                  let border = '1px solid #e2e8f0';

                  if (isAnswered) {
                    bg = '#0284c7';
                    color = '#ffffff';
                    border = '1px solid #0284c7';
                  }
                  if (isFlagged) {
                    bg = '#f59e0b';
                    color = '#ffffff';
                    border = '1px solid #f59e0b';
                  }
                  if (isCurrent) {
                    border = '2px solid #0f172a';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        backgroundColor: bg,
                        color,
                        border,
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setShowSubmitModal(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                ফলাফল দেখুন
              </button>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* RESULTS & SOLUTIONS VIEW */}
        {/* ==================================================== */}
        {isSubmitted && results && (
          <div>
            {/* Score Card Banner */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              marginBottom: '35px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '16px'
              }}>
                🏆
              </div>

              <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, marginBottom: '6px' }}>
                পরীক্ষা সম্পন্ন হয়েছে!
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '30px' }}>
                আপনার প্রাপ্ত নম্বর এবং ব্যাখ্যামূলক সমাধান নিচে পর্যালোচনা করুন
              </p>

              {/* Score Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                maxWidth: '900px',
                margin: '0 auto 30px'
              }}>
                <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{results.netScore}</div>
                  <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>প্রাপ্ত মোট নম্বর</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>{results.correctCount}</div>
                  <div style={{ fontSize: '0.85rem', color: '#075985', fontWeight: 600 }}>সঠিক উত্তর</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e11d48' }}>{results.wrongCount}</div>
                  <div style={{ fontSize: '0.85rem', color: '#9f1239', fontWeight: 600 }}>ভুল উত্তর (-{results.penalty})</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#64748b' }}>{results.skippedCount}</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>উত্তরহীন</div>
                </div>

                <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9333ea' }}>{results.accuracy}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b21a8', fontWeight: 600 }}>নির্ভুলতার হার</div>
                </div>
              </div>

              {/* Merit Rank Banner */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 28px',
                borderRadius: '50px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '26px'
              }}>
                <span>✨ সম্ভাব্য লাইভ মেরিট পজিশন: <strong style={{ color: '#0284c7' }}>#{results.rank}</strong> / {results.totalParticipants.toLocaleString('bn-BD')} জন পরীক্ষার্থীর মধ্যে</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button 
                  onClick={retakeExam}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔄 পুনরায় পরীক্ষা দিন
                </button>
                <Link 
                  href={`/national-merit-position?examId=${exam.id}`}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  🏆 জাতীয় মেরিট তালিকা দেখুন ➔
                </Link>
              </div>
            </div>

            {/* Detailed Solutions Section */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '30px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                    সকল প্রশ্নের ব্যাখ্যামূলক সমাধান
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                    ভুল ত্রুটিগুলো বিশ্লেষণ করে আপনার প্রস্তুতিকে আরও মজবুত করুন
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {['all', 'wrong', 'correct'].map(filterKey => {
                    const isActive = reviewFilter === filterKey;
                    const labels = { all: 'সকল প্রশ্ন', wrong: 'ভুল উত্তর', correct: 'সঠিক উত্তর' };
                    return (
                      <button
                        key={filterKey}
                        onClick={() => setReviewFilter(filterKey)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: isActive ? '1.5px solid #0284c7' : '1.5px solid #e2e8f0',
                          backgroundColor: isActive ? '#0284c7' : '#ffffff',
                          color: isActive ? '#ffffff' : '#475569'
                        }}
                      >
                        {labels[filterKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanations List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {(results.evaluatedQuestions || [])
                  .filter(q => {
                    if (reviewFilter === 'wrong') return q.isWrong;
                    if (reviewFilter === 'correct') return q.isCorrect;
                    return true;
                  })
                  .map((q, idx) => {
                    const banglaLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
                    return (
                      <div 
                        key={idx}
                        style={{
                          padding: '24px',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: q.isCorrect ? '#fafffd' : (q.isWrong ? '#fffafa' : '#ffffff')
                        }}
                      >
                        {/* Question Meta */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            backgroundColor: q.isCorrect ? '#d1fae5' : (q.isWrong ? '#ffe4e6' : '#f1f5f9'),
                            color: q.isCorrect ? '#059669' : (q.isWrong ? '#e11d48' : '#475569')
                          }}>
                            {q.isCorrect ? '✓ সঠিক' : (q.isWrong ? '✗ ভুল উত্তর' : '⚪ উত্তরহীন')}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>বিষয়: {q.subject}</span>
                        </div>

                        {/* Question Title */}
                        <h4 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 700, marginBottom: '16px' }}>
                          {idx + 1}. {q.question}
                        </h4>

                        {/* Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                          {(q.options || []).map((opt, optIdx) => {
                            const optText = typeof opt === 'object' ? opt.text : opt;
                            const isUserAns = Number(q.userSelected) === optIdx;
                            const isCorrectAns = Number(q.correctAns) === optIdx;

                            let optBg = '#f8fafc';
                            let optBorder = '1px solid #e2e8f0';
                            let optColor = '#334155';

                            if (isCorrectAns) {
                              optBg = '#d1fae5';
                              optBorder = '1.5px solid #10b981';
                              optColor = '#065f46';
                            } else if (isUserAns && !isCorrectAns) {
                              optBg = '#ffe4e6';
                              optBorder = '1.5px solid #f43f5e';
                              optColor = '#9f1239';
                            }

                            return (
                              <div
                                key={optIdx}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: optBg,
                                  border: optBorder,
                                  color: optColor,
                                  fontSize: '0.92rem',
                                  fontWeight: (isCorrectAns || isUserAns) ? 700 : 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <span>{banglaLetters[optIdx]}.</span>
                                <span>{optText}</span>
                                {isCorrectAns && <span style={{ marginLeft: 'auto' }}>✓</span>}
                                {isUserAns && !isCorrectAns && <span style={{ marginLeft: 'auto' }}>✗</span>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div style={{
                            padding: '14px 18px',
                            borderRadius: '10px',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            fontSize: '0.92rem',
                            color: '#0369a1',
                            lineHeight: 1.6
                          }}>
                            <strong>💡 বিস্তারিত সমাধান:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              marginBottom: '16px'
            }}>
              ⚠️
            </div>

            <h3 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 800, marginBottom: '10px' }}>
              পরীক্ষা সাবমিট করতে চান?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
              আপনি মোট <strong style={{ color: '#0284c7' }}>{answeredCount}</strong> টির উত্তর দিয়েছেন এবং <strong style={{ color: '#e11d48' }}>{skippedCount}</strong> টি ফাঁকা রয়েছে।
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowSubmitModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1.5px solid #0f1629',
                  backgroundColor: '#0f1629',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                বাতিল করুন
              </button>
              <button 
                onClick={submitQuiz}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSubmitting ? 'সাবমিট হচ্ছে...' : 'হ্যাঁ, সাবমিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default function LiveExamPlayerPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>লোড হচ্ছে...</div>}>
      <LiveExamPlayerContent />
    </Suspense>
  );
}
