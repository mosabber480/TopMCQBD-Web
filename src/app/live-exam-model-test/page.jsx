'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLiveExamApiUrl } from '@/lib/config';

export default function LiveExamModelTestPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'সকল টেস্ট' },
    { id: 'bcs', name: 'বিসিএস' },
    { id: 'bank', name: 'ব্যাংক জব' },
    { id: 'primary', name: 'প্রাথমিক শিক্ষক' },
    { id: 'subject', name: 'বিষয়ভিত্তিক' },
  ];

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(getLiveExamApiUrl('/api/live-exam/exams'), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.exams) {
          setExams(data.exams);
        }
      }
    } catch (err) {
      console.error("Failed to load live exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter(exam => {
    const matchesCat = currentCat === 'all' || exam.category === currentCat;
    const matchesSearch = !searchQuery || 
      (exam.title && exam.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exam.categoryName && exam.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getBadgeStyle = (badgeColor) => {
    switch (badgeColor) {
      case 'rose':
        return { bg: '#ffe4e6', color: '#e11d48', border: '#fecdd3' };
      case 'emerald':
        return { bg: '#d1fae5', color: '#059669', border: '#a7f3d0' };
      case 'violet':
        return { bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' };
      case 'amber':
        return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      default:
        return { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' };
    }
  };

  return (
    <main style={{ padding: '40px 0 80px', backgroundColor: '#f8fafc', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '50px',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            ✨ শিডিউলড লাইভ মডেল টেস্ট
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            সকল অনলাইন মডেল টেস্ট ও লাইভ কুইজ
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            আপনার পছন্দের ক্যাটাগরি বাছাই করুন এবং নির্ধারিত সময়ের মধ্যে লাইভ পরীক্ষায় অংশ নিয়ে তাৎক্ষণিক মেধা ও জাতীয় মেরিট অবস্থান যাচাই করুন।
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <Link href="/live-exam-dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '0.92rem',
            border: '1.5px solid #e2e8f0',
            textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            📊 আমার পরীক্ষার ড্যাশবোর্ড
          </Link>
          <Link href="/national-merit-position" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.92rem',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(2,132,199,0.25)'
          }}>
            🏆 জাতীয় মেরিট পজিশন লিডারবোর্ড ➔
          </Link>
        </div>

        {/* Filters & Search Box */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '35px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          
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
                    border: isActive ? '1.5px solid #0284c7' : '1.5px solid #e2e8f0',
                    backgroundColor: isActive ? '#0284c7' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569'
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '380px' }}>
            <input 
              type="text" 
              placeholder="মডেল টেস্ট খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem' }}>
              🔍
            </span>
          </div>

        </div>

        {/* Exams Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>মডেল টেস্ট তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '8px' }}>কোনো মডেল টেস্ট পাওয়া যায়নি</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>অন্য কোনো কীওয়ার্ড দিয়ে সার্চ করুন অথবা ফিল্টার রিসেট করুন।</p>
            <button 
              onClick={() => { setCurrentCat('all'); setSearchQuery(''); }}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              সকল টেস্ট দেখুন
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {filteredExams.map((exam) => {
              const badgeStyle = getBadgeStyle(exam.badgeColor);
              const isUpcoming = exam.status === 'upcoming';
              return (
                <div 
                  key={exam.id} 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <div>
                    {/* Top Meta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '50px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`
                      }}>
                        {isUpcoming ? '⏳ ' : '🔴 '} {exam.badge || 'লাইভ এক্সাম'}
                      </span>

                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}>
                        {exam.categoryName || 'বিসিএস'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.5, marginBottom: '12px' }}>
                      {exam.title}
                    </h3>

                    {/* Description */}
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                      {exam.description || 'সম্পূর্ণ সিলেবাস অনুসারে প্রস্তুতকৃত নির্ধারিত মডেল টেস্ট।'}
                    </p>

                    {/* Meta Specs Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      backgroundColor: '#f8fafc',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #f1f5f9',
                      marginBottom: '20px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>সময়</span>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{exam.durationMinutes} মি.</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>মোট নম্বর</span>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{exam.totalMarks}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>নেগেটিভ</span>
                        <strong style={{ fontSize: '0.95rem', color: '#e11d48' }}>-{exam.negativeMarking}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '0.82rem', color: '#64748b' }}>
                      <span>👥 {exam.participants ? exam.participants.toLocaleString('bn-BD') : '০'} জন পরীক্ষার্থী</span>
                      <Link href={`/national-merit-position?examId=${exam.id}`} style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>
                        মেরিট লিস্ট ➔
                      </Link>
                    </div>

                    <Link 
                      href={`/live-exam-questions?id=${exam.id}`}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        backgroundColor: isUpcoming ? '#f59e0b' : '#0284c7',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s',
                        boxShadow: isUpcoming ? '0 4px 12px rgba(245,158,11,0.25)' : '0 4px 12px rgba(2,132,199,0.25)'
                      }}
                    >
                      {isUpcoming ? '⏳ পরীক্ষা শুরু করুন' : '🔥 পরীক্ষায় অংশ নিন ➔'}
                    </Link>
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
