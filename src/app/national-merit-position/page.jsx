'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLiveExamApiUrl } from '@/lib/config';

function NationalMeritContent() {
  const searchParams = useSearchParams();
  const initialExamId = searchParams.get('examId') || 'all';

  const [meritList, setMeritList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(initialExamId);
  const [searchQuery, setSearchQuery] = useState('');
  const [exams, setExams] = useState([]);

  // Fetch available exams for the filter dropdown
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

  // Fetch merit list based on selected exam & search
  const fetchMeritList = async () => {
    setLoading(true);
    try {
      let url = `/api/live-exam/merit?examId=${selectedExam}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
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
  }, [selectedExam, searchQuery]);

  const top3 = meritList.slice(0, 3);
  const restMerit = meritList.slice(3);

  return (
    <div style={{ padding: '40px 0 50px', backgroundColor: '#f8fafc', minHeight: 'auto' }}>
      <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
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
            🏆 রিয়েল-টাইম লিডারবোর্ড
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px' }}>
            জাতীয় মেধা তালিকা ও মেরিট পজিশন
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            সমগ্র দেশের হাজার হাজার পরীক্ষার্থীর মধ্যে আপনার মেধা ও র‍্যাঙ্কিং অবস্থান যাচাই করুন।
          </p>
        </div>

        {/* Top 3 Podium Cards */}
        {top3.length >= 3 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
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
                fontSize: '0.82rem'
              }}>
                🥈 ২য় স্থান
              </div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', margin: '10px auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                👤
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, marginBottom: '4px' }}>{top3[1]?.name}</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>{top3[1]?.examTitle}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.9rem' }}>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>নম্বর</span><strong style={{ color: '#16a34a' }}>{top3[1]?.score}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>নির্ভুলতা</span><strong>{top3[1]?.accuracy}</strong></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>সময়</span><strong>{top3[1]?.timeTaken}</strong></div>
              </div>
            </div>

            {/* Rank 1 - Gold (Elevated) */}
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
                boxShadow: '0 4px 10px rgba(245,158,11,0.3)'
              }}>
                👑 ১ম স্থান (চ্যাম্পিয়ন)
              </div>
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', margin: '10px auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', border: '3px solid #f59e0b' }}>
                🥇
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
                fontSize: '0.82rem'
              }}>
                🥉 ৩য় স্থান
              </div>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ffedd5', margin: '10px auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                👤
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

        {/* Filter & Search Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '30px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155' }}>পরীক্ষা ফিল্টার:</span>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                flex: 1,
                maxWidth: '400px'
              }}
            >
              <option value="all">সকল মডেল টেস্ট একযোগে</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', minWidth: '260px', maxWidth: '340px', flex: 1 }}>
            <input 
              type="text" 
              placeholder="শিক্ষার্থী বা র‍্যাঙ্ক খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              জাতীয় মেরিট র‍্যাঙ্কিং তালিকা
            </h3>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
              মোট পরীক্ষার্থী: <strong>{meritList.length}</strong> জন
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⏳</div>
              মেরিট তালিকা লোড হচ্ছে...
            </div>
          ) : meritList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              কোনো মেরিট রেকর্ড পাওয়া যায়নি।
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
                    <th style={{ padding: '12px 16px' }}>ব্যাজ ও স্বীকৃতি</th>
                    <th style={{ padding: '12px 16px' }}>তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {meritList.map((item, idx) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isTop1 ? '#fffbeb' : (isTop2 ? '#f8fafc' : (isTop3 ? '#fff7ed' : 'transparent'))
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
                            <span>{item.avatar || '👤'}</span>
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
                            padding: '4px 10px',
                            borderRadius: '50px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            backgroundColor: isTop1 ? '#fef3c7' : '#f1f5f9',
                            color: isTop1 ? '#d97706' : '#475569'
                          }}>
                            {item.badge}
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
