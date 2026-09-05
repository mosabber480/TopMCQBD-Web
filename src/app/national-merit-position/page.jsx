'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLiveExamApiUrl } from '@/lib/config';
import LiveExamNavBox from '@/components/common/LiveExamNavBox';

function NationalMeritContent() {
  const searchParams = useSearchParams();
  const initialExamId = searchParams.get('examId') || 'all';

  const [meritList, setMeritList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState(initialExamId);
  const [exams, setExams] = useState([]);

  const categories = [
    { id: 'all', name: 'সকল' },
    { id: 'bcs', name: 'বিসিএস (BCS)' },
    { id: 'bank', name: 'ব্যাংক জব (Bank)' },
    { id: 'primary', name: 'প্রাথমিক (Primary)' },
    { id: 'ntrca', name: 'শিক্ষক নিবন্ধন (NTRCA)' },
    { id: 'subject', name: 'বিষয়ভিত্তিক' },
  ];

  // Fetch available exams for the dropdown/categories
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch(getLiveExamApiUrl('/api/live-exam/exams'), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.exams) {
            setExams(data.exams);
          }
        }
      } catch (err) {
        console.error("Exams fetch failed:", err);
      }
    };
    fetchExams();
  }, []);

  // Fetch merit list
  const fetchMeritList = async () => {
    setLoading(true);
    try {
      let url = `/api/live-exam/merit?examId=${selectedExam}`;
      const res = await fetch(getLiveExamApiUrl(url), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.meritList) {
          setMeritList(data.meritList);
        }
      }
    } catch (err) {
      console.error("Merit list fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeritList();
  }, [selectedExam]);

  // Client-side filtering by category & search query (matching /live-exam-model-test)
  const filteredMeritList = meritList.filter(item => {
    // 1. Category filter matching
    let matchesCat = currentCat === 'all';
    if (!matchesCat) {
      const titleLower = (item.examTitle || '').toLowerCase();
      const examIdLower = (item.examId || '').toLowerCase();
      if (currentCat === 'bcs') {
        matchesCat = titleLower.includes('বিসিএস') || titleLower.includes('bcs') || examIdLower.includes('bcs');
      } else if (currentCat === 'bank') {
        matchesCat = titleLower.includes('ব্যাংক') || titleLower.includes('bank') || examIdLower.includes('bank');
      } else if (currentCat === 'primary') {
        matchesCat = titleLower.includes('প্রাথমিক') || titleLower.includes('primary') || examIdLower.includes('primary');
      } else if (currentCat === 'ntrca') {
        matchesCat = titleLower.includes('নিবন্ধন') || titleLower.includes('ntrca') || examIdLower.includes('ntrca');
      } else if (currentCat === 'subject') {
        matchesCat = titleLower.includes('বিষয়ভিত্তিক') || titleLower.includes('subject') || titleLower.includes('math') || titleLower.includes('ম্যাথ');
      }
    }

    // 2. Search query matching
    const cleanSearch = searchQuery.trim().replace(/^#+/, '').toLowerCase();
    if (!cleanSearch) return matchesCat;

    const nameMatch = (item.name || '').toLowerCase().includes(cleanSearch);
    const titleMatch = (item.examTitle || '').toLowerCase().includes(cleanSearch);
    const rankMatch = String(item.rank).includes(cleanSearch) || `rank ${item.rank}`.includes(cleanSearch) || `#${item.rank}`.includes(cleanSearch);
    const scoreMatch = (item.score || '').includes(cleanSearch);
    const badgeMatch = (item.badge || '').toLowerCase().includes(cleanSearch);

    // Cross-language synonyms
    const synonymMatch = 
      (cleanSearch === 'bcs' && ((item.examTitle || '').includes('বিসিএস') || (item.examId || '').includes('bcs'))) ||
      (cleanSearch === 'বিসিএস' && ((item.examTitle || '').includes('বিসিএস') || (item.examId || '').includes('bcs'))) ||
      (cleanSearch === 'bank' && ((item.examTitle || '').includes('ব্যাংক') || (item.examId || '').includes('bank'))) ||
      (cleanSearch === 'ব্যাংক' && ((item.examTitle || '').includes('ব্যাংক') || (item.examId || '').includes('bank'))) ||
      (cleanSearch === 'primary' && ((item.examTitle || '').includes('প্রাথমিক') || (item.examId || '').includes('primary'))) ||
      (cleanSearch === 'প্রাথমিক' && ((item.examTitle || '').includes('প্রাথমিক') || (item.examId || '').includes('primary'))) ||
      (cleanSearch === 'ntrca' && ((item.examTitle || '').includes('নিবন্ধন') || (item.examId || '').includes('ntrca'))) ||
      (cleanSearch === 'নিবন্ধন' && ((item.examTitle || '').includes('নিবন্ধন') || (item.examId || '').includes('ntrca')));

    return matchesCat && (nameMatch || titleMatch || rankMatch || scoreMatch || badgeMatch || synonymMatch);
  });

  const top3 = filteredMeritList.slice(0, 3);

  return (
    <div style={{ padding: '16px 0 45px', backgroundColor: '#f8fafc', minHeight: 'auto' }}>
      <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Navigation Action Box */}
        <LiveExamNavBox activeRoute="/national-merit-position" />

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '50px',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <i className="fa-solid fa-trophy" style={{ marginRight: '6px' }}></i>
            রিয়েল-টাইম লিডারবোর্ড
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            জাতীয় মেধা তালিকা ও মেরিট পজিশন
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            সমগ্র দেশের হাজার হাজার পরীক্ষার্থীর মধ্যে আপনার মেধা ও র‍্যাঙ্কিং অবস্থান যাচাই করুন।
          </p>
        </div>

        {/* Top 3 Podium Cards (Pure FontAwesome Icons, No Emojis) */}
        {top3.length >= 3 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '35px',
            alignItems: 'flex-end'
          }}>
            
            {/* Rank 2 - Silver */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '26px 20px',
              textAlign: 'center',
              border: '2px solid #cbd5e1',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 14px',
                borderRadius: '50px',
                backgroundColor: '#94a3b8',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="fa-solid fa-medal"></i>
                <span>২য় স্থান</span>
              </div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', margin: '10px auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-user-graduate" style={{ color: '#64748b', fontSize: '1.8rem' }}></i>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, marginBottom: '4px' }}>{top3[1]?.name}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>{top3[1]?.examTitle}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.9rem' }}>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>নম্বর</span><strong style={{ color: '#16a34a' }}>{top3[1]?.score}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>নির্ভুলতা</span><strong>{top3[1]?.accuracy}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>সময়</span><strong>{top3[1]?.timeTaken}</strong></div>
              </div>
            </div>

            {/* Rank 1 - Gold (Elevated Champion) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '34px 20px',
              textAlign: 'center',
              border: '2.5px solid #f59e0b',
              boxShadow: '0 12px 25px -5px rgba(245,158,11,0.15)',
              position: 'relative',
              transform: 'scale(1.04)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '6px 18px',
                borderRadius: '50px',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.88rem',
                boxShadow: '0 4px 10px rgba(245,158,11,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fa-solid fa-crown"></i>
                <span>১ম স্থান (চ্যাম্পিয়ন)</span>
              </div>
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', margin: '10px auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #f59e0b' }}>
                <i className="fa-solid fa-trophy" style={{ color: '#d97706', fontSize: '2.2rem' }}></i>
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 800, marginBottom: '4px' }}>{top3[0]?.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>{top3[0]?.examTitle}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.95rem' }}>
                <div><span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>নম্বর</span><strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>{top3[0]?.score}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>নির্ভুলতা</span><strong style={{ fontSize: '1.1rem' }}>{top3[0]?.accuracy}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>সময়</span><strong style={{ fontSize: '1.1rem' }}>{top3[0]?.timeTaken}</strong></div>
              </div>
            </div>

            {/* Rank 3 - Bronze */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '26px 20px',
              textAlign: 'center',
              border: '2px solid #fed7aa',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px 14px',
                borderRadius: '50px',
                backgroundColor: '#ea580c',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="fa-solid fa-award"></i>
                <span>৩য় স্থান</span>
              </div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ffedd5', margin: '10px auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-user" style={{ color: '#ea580c', fontSize: '1.8rem' }}></i>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, marginBottom: '4px' }}>{top3[2]?.name}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>{top3[2]?.examTitle}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.9rem' }}>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>নম্বর</span><strong style={{ color: '#16a34a' }}>{top3[2]?.score}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>নির্ভুলতা</span><strong>{top3[2]?.accuracy}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>সময়</span><strong>{top3[2]?.timeTaken}</strong></div>
              </div>
            </div>

          </div>
        )}

        {/* Filters & Search Box (Exact design from /live-exam-model-test) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '30px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          
          {/* Category Filter Buttons */}
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

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '380px' }}>
            <input 
              type="text" 
              placeholder="মডেল টেস্ট, ট্যাগ বা শিক্ষার্থী খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.replace(/^#+/, ''))}
              style={{
                width: '100%',
                padding: '10px 36px 10px 38px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: '#f8fafc'
              }}
            />
            <i 
              className="fa-solid fa-magnifying-glass" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}
            ></i>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="সার্চ ক্লিয়ার করুন"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Master Merit Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-list-ol" style={{ color: '#0284c7' }}></i>
              জাতীয় মেরিট র‍্যাঙ্কিং তালিকা
            </h3>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
              মোট পরীক্ষার্থী: <strong>{filteredMeritList.length}</strong> জন
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
              <div style={{ marginBottom: '10px' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.2rem', color: '#0284c7' }}></i>
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 600 }}>মেরিট তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredMeritList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
              <div style={{ marginBottom: '10px' }}>
                <i className="fa-solid fa-magnifying-glass-chart" style={{ fontSize: '2.5rem', color: '#94a3b8' }}></i>
              </div>
              <h4 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '6px' }}>কোনো মেরিট রেকর্ড পাওয়া যায়নি</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>অন্য কোনো কীওয়ার্ড দিয়ে সার্চ করুন অথবা ক্যাটাগরি ফিল্টার রিসেট করুন।</p>
              <button 
                onClick={() => { setCurrentCat('all'); setSearchQuery(''); setSelectedExam('all'); }}
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
                সকল মেরিট দেখুন
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 16px' }}>র‍্যাঙ্ক</th>
                    <th style={{ padding: '12px 16px' }}>শিক্ষার্থীর নাম</th>
                    <th style={{ padding: '12px 16px' }}>পরীক্ষার নাম</th>
                    <th style={{ padding: '12px 16px' }}>প্রাপ্ত স্কোর</th>
                    <th style={{ padding: '12px 16px' }}>নির্ভুলতা</th>
                    <th style={{ padding: '12px 16px' }}>সময়</th>
                    <th style={{ padding: '12px 16px' }}>স্বীকৃতি ও অবস্থান</th>
                    <th style={{ padding: '12px 16px' }}>তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeritList.map((item, idx) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isTop1 ? '#fffbeb' : (isTop2 ? '#f8fafc' : (isTop3 ? '#fff7ed' : 'transparent')),
                        transition: 'background-color 0.15s ease'
                      }}>
                        <td style={{ padding: '14px 16px', fontWeight: 800 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isTop1 ? '#f59e0b' : (isTop2 ? '#94a3b8' : (isTop3 ? '#ea580c' : '#e0f2fe')),
                            color: (isTop1 || isTop2 || isTop3) ? '#ffffff' : '#0369a1',
                            fontSize: '0.88rem'
                          }}>
                            #{item.rank}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-circle-user" style={{ color: isTop1 ? '#d97706' : '#0284c7', fontSize: '1.25rem' }}></i>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: '0.88rem' }}>
                          {item.examTitle}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#16a34a' }}>
                          {item.score}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                          {item.accuracy}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>
                          {item.timeTaken}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 12px',
                            borderRadius: '50px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: isTop1 ? '#fef3c7' : (isTop2 ? '#f1f5f9' : (isTop3 ? '#ffedd5' : '#f0f9ff')),
                            color: isTop1 ? '#d97706' : (isTop2 ? '#475569' : (isTop3 ? '#ea580c' : '#0369a1')),
                            border: isTop1 ? '1px solid #fde68a' : (isTop2 ? '1px solid #e2e8f0' : (isTop3 ? '1px solid #fed7aa' : '1px solid #bae6fd'))
                          }}>
                            {isTop1 ? (
                              <i className="fa-solid fa-crown" style={{ color: '#d97706' }}></i>
                            ) : isTop2 ? (
                              <i className="fa-solid fa-medal" style={{ color: '#64748b' }}></i>
                            ) : isTop3 ? (
                              <i className="fa-solid fa-award" style={{ color: '#ea580c' }}></i>
                            ) : (
                              <i className="fa-solid fa-shield-halved" style={{ color: '#0284c7', fontSize: '0.75rem' }}></i>
                            )}
                            <span>{item.badge}</span>
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.82rem' }}>
                          {item.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function NationalMeritPositionPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>লোড হচ্ছে...</div>}>
      <NationalMeritContent />
    </Suspense>
  );
}
