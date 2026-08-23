'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FreeMcqsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isReadMode, setIsReadMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const FREE_API = process.env.NEXT_PUBLIC_FREE_API_URL || 'https://topmcqbd-web-free.pages.dev/api';

  useEffect(() => {
    // Fetch categories directly from 2nd Cloudflare Account
    fetch(`${FREE_API}/categories`)
      .then(res => res.json())
      .then(data => {
        const cats = data.categories || data.data || [];
        setCategories(cats);
      })
      .catch(() => {});
  }, [FREE_API]);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory && selectedCategory !== 'all'
      ? `${FREE_API}/questions?category=${encodeURIComponent(selectedCategory)}`
      : `${FREE_API}/questions`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        let list = data.questions || data.mcqs || [];
        setQuestions(list);
        setLoading(false);
      })
      .catch(() => {
        setQuestions([]);
        setLoading(false);
      });
  }, [selectedCategory, FREE_API]);

  const handleAnswerClick = (qIndex, optIndex) => {
    if (isReadMode) return;
    if (answeredQuestions[qIndex] !== undefined) return;

    const q = questions[qIndex];
    const isCorrect = optIndex === q.ans;
    setAnsweredQuestions({ ...answeredQuestions, [qIndex]: optIndex });

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
    } else {
      setScore(prev => prev - 0.5);
      setIncorrectCount(prev => prev + 1);
    }
  };

  const resetQuiz = () => {
    setAnsweredQuestions({});
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  const getBanglaLetter = (idx) => {
    const letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    return letters[idx] || idx + 1;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '12px',
          padding: '30px 25px',
          color: 'white',
          marginBottom: '25px',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', color: 'white' }}>
            <i className="fa-solid fa-gift" style={{ marginRight: '10px' }}></i>
            ফ্রি কুইজ ও প্রশ্নব্যাংক অনুশীলন
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
            যেকোনো রেজিস্ট্রেশন ছাড়াই ফ্রিতে মডেল টেস্ট দিন এবং আপনার মেধা যাচাই করুন।
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/packages"
            style={{
              background: 'white',
              color: '#059669',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-crown"></i> প্রিমিয়াম প্যাকেজ
          </Link>
          <Link
            href="/quiz"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '13px',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-play"></i> পূর্ণাঙ্গ কুইজ
          </Link>
        </div>
      </div>

      {/* Controls & Filter */}
      <div
        style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>ক্যাটেগরি:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1e293b',
              background: '#f8fafc',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">সকল ক্যাটেগরি</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={resetQuiz}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fa-solid fa-rotate-right"></i> রিসেট করুন
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isReadMode}
              onChange={(e) => {
                setIsReadMode(e.target.checked);
                if (e.target.checked) setShowAnswer(true);
              }}
            />
            আগে পড়ুন (Read Mode)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showAnswer}
              onChange={(e) => setShowAnswer(e.target.checked)}
            />
            সঠিক উত্তর
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showExplanation}
              onChange={(e) => setShowExplanation(e.target.checked)}
            />
            ব্যাখ্যা
          </label>

          <div style={{ background: '#f1f5f9', padding: '5px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>
            স্কোর: <span style={{ color: score >= 0 ? '#059669' : '#dc2626' }}>{score.toFixed(1)}</span> (সঠিক: {correctCount} | ভুল: {incorrectCount})
          </div>
        </div>
      </div>

      {/* Question List */}
      <div
        style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
            প্রশ্ন লোড হচ্ছে...
          </p>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fa-regular fa-folder-open" style={{ fontSize: '40px', color: '#94a3b8', marginBottom: '12px' }}></i>
            <p style={{ color: '#64748b', fontSize: '15px' }}>এই ক্যাটেগরিতে কোনো প্রশ্ন পাওয়া যায়নি।</p>
          </div>
        ) : (
          questions.map((q, qIndex) => {
            const isAnswered = answeredQuestions[qIndex] !== undefined;
            const selectedOpt = answeredQuestions[qIndex];
            const correctOpt = q.ans;

            return (
              <div
                key={q._id || qIndex}
                style={{
                  marginBottom: '30px',
                  paddingBottom: '25px',
                  borderBottom: qIndex !== questions.length - 1 ? '1px dashed #e2e8f0' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '15px' }}>
                  <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '16px' }}>{qIndex + 1}.</span>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>
                    {q.q}
                  </div>
                  {q.category && (
                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', marginLeft: 'auto' }}>
                      {q.category}
                    </span>
                  )}
                </div>

                {/* Options */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                  {(q.options || []).map((opt, optIndex) => {
                    let btnStyle = {
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: isReadMode || isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 500
                    };

                    if (isReadMode || showAnswer) {
                      if (optIndex === correctOpt) {
                        btnStyle.background = '#d1fae5';
                        btnStyle.borderColor = '#10b981';
                        btnStyle.color = '#065f46';
                        btnStyle.fontWeight = 700;
                      }
                    } else if (isAnswered) {
                      if (optIndex === correctOpt) {
                        btnStyle.background = '#d1fae5';
                        btnStyle.borderColor = '#10b981';
                        btnStyle.color = '#065f46';
                        btnStyle.fontWeight = 700;
                      } else if (optIndex === selectedOpt) {
                        btnStyle.background = '#fee2e2';
                        btnStyle.borderColor = '#ef4444';
                        btnStyle.color = '#991b1b';
                        btnStyle.fontWeight = 700;
                      }
                    }

                    return (
                      <button
                        key={optIndex}
                        style={btnStyle}
                        onClick={() => handleAnswerClick(qIndex, optIndex)}
                        disabled={isReadMode || isAnswered}
                      >
                        <span style={{ fontWeight: 'bold', minWidth: '18px' }}>({getBanglaLetter(optIndex)})</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Correct Answer Text */}
                {(isAnswered || isReadMode || showAnswer) && (
                  <div style={{ fontSize: '14px', color: '#059669', fontWeight: 700, marginTop: '8px' }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }}></i>
                    সঠিক উত্তর: ({getBanglaLetter(correctOpt)}) {q.options?.[correctOpt]}
                  </div>
                )}

                {/* Explanation */}
                {showExplanation && q.explanation && (isAnswered || isReadMode || showAnswer) && (
                  <div
                    style={{
                      background: '#f8fafc',
                      borderLeft: '4px solid #0284c7',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      marginTop: '10px',
                      fontSize: '13px',
                      color: '#334155',
                      lineHeight: 1.6
                    }}
                  >
                    <strong>ব্যাখ্যা:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
