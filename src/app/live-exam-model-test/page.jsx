'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLiveExamApiUrl } from '@/lib/config';
import LiveExamNavBox from '@/components/common/LiveExamNavBox';

export default function LiveExamModelTestPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCat, setCurrentCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingModal, setUpcomingModal] = useState(null);

  const categories = [
    { id: 'all', name: 'সকল' },
    { id: 'bcs', name: 'বিসিএস (BCS)' },
    { id: 'bank', name: 'ব্যাংক জব (Bank)' },
    { id: 'primary', name: 'প্রাথমিক (Primary)' },
    { id: 'ntrca', name: 'শিক্ষক নিবন্ধন (NTRCA)' },
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

  // Helper to dynamically calculate exam status in real-time based on scheduled dates
  const getExamDynamicStatus = (exam) => {
    if (!exam) return 'live';
    const currentTime = Date.now();

    const startTime = exam.scheduledStart ? new Date(exam.scheduledStart).getTime() : null;
    let endTime = exam.scheduledEnd ? new Date(exam.scheduledEnd).getTime() : null;

    // 3 days validity default if end time is missing or before/equal to start
    if (startTime && (!endTime || isNaN(endTime) || endTime <= startTime)) {
      endTime = startTime + (3 * 24 * 60 * 60 * 1000);
    }

    // 1. Before scheduled start date -> automatically 'upcoming'
    if (startTime && !isNaN(startTime) && currentTime < startTime) {
      return 'upcoming';
    }

    // 2. After scheduled end date -> automatically 'past' / 'ended'
    if (endTime && !isNaN(endTime) && currentTime > endTime) {
      return 'past';
    }

    // 3. During scheduled window -> automatically 'live'
    if (startTime && !isNaN(startTime)) {
      return 'live';
    }

    return exam.status || 'live';
  };

  const filteredExams = exams.filter(exam => {
    const matchesCat = currentCat === 'all' || exam.category === currentCat || (currentCat === 'ntrca' && (exam.category === 'ntrca' || exam.categoryName?.includes('নিবন্ধন') || exam.badge?.toLowerCase() === 'ntrca'));
    const cleanSearch = searchQuery.trim().replace(/^#+/, '').toLowerCase();
    
    if (!cleanSearch) return matchesCat;

    const dynamicStatus = getExamDynamicStatus(exam);
    const titleMatch = (exam.title || '').toLowerCase().includes(cleanSearch);
    const descMatch = (exam.description || '').toLowerCase().includes(cleanSearch);
    const catMatch = (exam.category || '').toLowerCase().includes(cleanSearch);
    const catNameMatch = (exam.categoryName || '').toLowerCase().replace(/^#+/, '').includes(cleanSearch);
    const badgeMatch = (exam.badge || '').toLowerCase().replace(/^#+/, '').includes(cleanSearch);
    const tagMatch = Array.isArray(exam.tags) 
      ? exam.tags.some(t => String(t).toLowerCase().replace(/^#+/, '').includes(cleanSearch))
      : (typeof exam.tags === 'string' && exam.tags.toLowerCase().replace(/^#+/, '').includes(cleanSearch));
    const statusMatch = dynamicStatus.toLowerCase().includes(cleanSearch) || (exam.status || '').toLowerCase().includes(cleanSearch);
    const qCountMatch = String(exam.questions?.length || exam.questionsCount || '').includes(cleanSearch);
    const durationMatch = String(exam.durationMinutes || '').includes(cleanSearch);

    // Cross-language synonyms (e.g., 'bcs' <-> 'বিসিএস', 'ntrca' <-> 'নিবন্ধন', 'primary' <-> 'প্রাথমিক', 'bank' <-> 'ব্যাংক')
    const synonymMatch = 
      (cleanSearch === 'bcs' && ((exam.title || '').includes('বিসিএস') || (exam.categoryName || '').includes('বিসিএস') || (exam.category || '') === 'bcs')) ||
      (cleanSearch === 'বিসিএস' && ((exam.badge || '').toLowerCase() === 'bcs' || (exam.category || '') === 'bcs')) ||
      (cleanSearch === 'ntrca' && ((exam.title || '').includes('নিবন্ধন') || (exam.categoryName || '').includes('নিবন্ধন') || (exam.category || '') === 'ntrca')) ||
      (cleanSearch === 'নিবন্ধন' && ((exam.badge || '').toLowerCase() === 'ntrca' || (exam.category || '') === 'ntrca')) ||
      (cleanSearch === 'primary' && ((exam.title || '').includes('প্রাথমিক') || (exam.categoryName || '').includes('প্রাথমিক') || (exam.category || '') === 'primary')) ||
      (cleanSearch === 'প্রাথমিক' && ((exam.badge || '').toLowerCase() === 'primary' || (exam.category || '') === 'primary')) ||
      (cleanSearch === 'bank' && ((exam.title || '').includes('ব্যাংক') || (exam.categoryName || '').includes('ব্যাংক') || (exam.category || '') === 'bank')) ||
      (cleanSearch === 'ব্যাংক' && ((exam.badge || '').toLowerCase() === 'bank' || (exam.category || '') === 'bank'));

    return matchesCat && (titleMatch || descMatch || catMatch || catNameMatch || badgeMatch || tagMatch || statusMatch || qCountMatch || durationMatch || synonymMatch);
  });

  const getScheduleStatusBadge = (exam) => {
    const status = getExamDynamicStatus(exam);

    const formatDateShort = (dateStr) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = d.getUTCDate();
        const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const month = months[d.getUTCMonth()];
        const year = d.getUTCFullYear();
        return `${day} ${month} ${year}`;
      } catch (e) {
        return dateStr;
      }
    };

    if (status === 'upcoming') {
      const dateText = formatDateShort(exam.scheduledStart) || '6 Sep 2026';
      return {
        text: `Upcoming: ${dateText}`,
        bg: '#fffbeb',
        color: '#b45309',
        border: '#fde68a',
        type: 'upcoming',
        dateText
      };
    } else if (status === 'ended' || status === 'past') {
      const dateText = formatDateShort(exam.scheduledEnd || exam.scheduledStart) || '2 Sep 2026';
      return {
        text: `Past Exam: ${dateText}`,
        bg: '#f8fafc',
        color: '#64748b',
        border: '#cbd5e1',
        type: 'ended',
        dateText
      };
    } else {
      // Live
      return {
        text: 'Live',
        bg: '#dc2626',
        color: '#ffffff',
        border: '#dc2626',
        isLive: true,
        type: 'live'
      };
    }
  };

  const getBadgeStyle = (badgeColor, badgeText = '') => {
    const text = (badgeText || '').toLowerCase();
    if (badgeColor === 'rose' || text.includes('bcs') || text.includes('বিসিএস')) {
      return { bg: '#ffe4e6', color: '#e11d48', border: '#fecdd3' };
    }
    if (badgeColor === 'emerald' || text.includes('bank') || text.includes('ব্যাংক')) {
      return { bg: '#d1fae5', color: '#059669', border: '#a7f3d0' };
    }
    if (badgeColor === 'violet' || text.includes('primary') || text.includes('প্রাথমিক')) {
      return { bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' };
    }
    if (badgeColor === 'amber' || text.includes('ntrca') || text.includes('নিবন্ধন')) {
      return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
    }
    if (badgeColor === 'cyan' || badgeColor === 'primary' || text.includes('subject') || text.includes('বিষয়ভিত্তিক') || text.includes('math')) {
      return { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' };
    }
    return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  };

  const formatExamScheduleWindow = (startStr, endStr) => {
    try {
      const sDate = startStr ? new Date(startStr) : new Date();
      let eDate = endStr ? new Date(endStr) : null;
      if (!eDate || isNaN(eDate.getTime()) || eDate <= sDate) {
        eDate = new Date(sDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days validity
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const formatSingle = (d) => {
        if (!d || isNaN(d.getTime())) return '';
        const day = d.getUTCDate();
        const month = months[d.getUTCMonth()];
        const year = d.getUTCFullYear();
        let hours = d.getUTCHours();
        const minutes = String(d.getUTCMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, '0');
        return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
      };

      return {
        startFormatted: formatSingle(sDate),
        endFormatted: formatSingle(eDate)
      };
    } catch (e) {
      return {
        startFormatted: '4 Sep 2026, 12:00 AM',
        endFormatted: '7 Sep 2026, 12:00 AM'
      };
    }
  };

  return (
    <div style={{ padding: '16px 0 45px', backgroundColor: '#f8fafc', minHeight: 'auto' }}>
      <style>{`
        @keyframes livePillPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          60% {
            transform: scale(1.03);
            box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Navigation Action Box */}
        <LiveExamNavBox activeRoute="/live-exam-model-test" />

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
            <i className="fa-solid fa-bolt" style={{ marginRight: '6px' }}></i>
            শিডিউলড লাইভ মডেল টেস্ট
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            সকল অনলাইন মডেল টেস্ট ও লাইভ কুইজ
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            আপনার পছন্দের ক্যাটাগরি বাছাই করুন এবং নির্ধারিত সময়ের মধ্যে লাইভ পরীক্ষায় অংশ নিয়ে তাৎক্ষণিক মেধা ও জাতীয় মেরিট অবস্থান যাচাই করুন।
          </p>
        </div>

        {/* Filters & Search Box */}
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
              placeholder="মডেল টেস্ট, ট্যাগ বা বিষয় খুঁজুন..." 
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

        {/* Exams Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ marginBottom: '12px' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            </div>
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>মডেল টেস্ট তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: '12px' }}>
              <i className="fa-solid fa-magnifying-glass-chart" style={{ fontSize: '2.5rem', color: '#94a3b8' }}></i>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '8px' }}>কোনো মডেল টেস্ট পাওয়া যায়নি</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>অন্য কোনো কীওয়ার্ড বা ট্যাগ দিয়ে সার্চ করুন অথবা ফিল্টার রিসেট করুন।</p>
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
              const cleanBadge = (exam.badge || exam.categoryName || 'General').replace(/^#+/, '');
              const badgeStyle = getBadgeStyle(exam.badgeColor, cleanBadge || exam.category);
              const dynamicStatus = getExamDynamicStatus(exam);
              const scheduleBadge = getScheduleStatusBadge(exam);
              const scheduleWindow = formatExamScheduleWindow(exam.scheduledStart, exam.scheduledEnd);
              const isUpcoming = dynamicStatus === 'upcoming';
              const isEnded = dynamicStatus === 'ended' || dynamicStatus === 'past';
              const isLive = dynamicStatus === 'live';
              const qCount = exam.questions?.length || exam.questionsCount || 10;
              // 100 MCQs = 60 minutes => 0.6 min per question (e.g. 10 MCQs = 6 min, 5 MCQs = 3 min)
              const durationMin = Math.max(1, Math.round(qCount * 0.6));

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
                    {/* Top Meta / Tags */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSearchQuery(cleanBadge)}
                        title={`ট্যাগ '${cleanBadge}' দিয়ে ফিল্টার করুন`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '28px',
                          padding: '0 14px',
                          borderRadius: '50px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          lineHeight: 1,
                          boxSizing: 'border-box',
                          backgroundColor: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(1.5px)', lineHeight: 1 }}>
                          {cleanBadge}
                        </span>
                      </button>

                      {/* Schedule Timeline Status Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '28px',
                          padding: scheduleBadge.isLive ? '0 16px' : '0 14px',
                          borderRadius: '50px',
                          boxSizing: 'border-box',
                          backgroundColor: scheduleBadge.bg,
                          color: scheduleBadge.color,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          lineHeight: 1,
                          border: `1px solid ${scheduleBadge.border}`,
                          whiteSpace: 'nowrap',
                          letterSpacing: scheduleBadge.isLive ? '0.5px' : 'normal',
                          animation: scheduleBadge.isLive ? 'livePillPulse 1.8s ease-in-out infinite' : 'none'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(1.5px)', lineHeight: 1 }}>
                          {scheduleBadge.text}
                        </span>
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

                    {/* Meta Specs Grid: 1st প্রশ্ন সংখ্যা, 2nd সময়সীমা, 3rd নেগেটিভ মার্ক */}
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
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>প্রশ্ন সংখ্যা</span>
                        <strong style={{ fontSize: '0.95rem', color: '#0284c7' }}>{qCount} টি</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>সময়সীমা</span>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{durationMin} মিনিট</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>নেগেটিভ মার্ক</span>
                        <strong style={{ fontSize: '0.95rem', color: '#e11d48' }}>-{exam.negativeMarking || 0.5}</strong>
                      </div>
                    </div>

                    {/* Exam Schedule Window Box (Red Box area: Start & End Date/Time with 3-day window) */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      marginBottom: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa-regular fa-calendar-plus" style={{ color: '#0284c7', fontSize: '0.85rem' }}></i>
                          পরীক্ষা শুরু:
                        </span>
                        <strong style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.83rem' }}>
                          {scheduleWindow.startFormatted}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fa-regular fa-calendar-check" style={{ color: isEnded ? '#64748b' : '#16a34a', fontSize: '0.85rem' }}></i>
                          পরীক্ষা শেষ:
                        </span>
                        <strong style={{ color: isEnded ? '#64748b' : '#dc2626', fontWeight: 700, fontSize: '0.83rem' }}>
                          {scheduleWindow.endFormatted}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {isUpcoming ? (
                      <button
                        type="button"
                        onClick={() => {
                          const dateStr = scheduleBadge.dateText || '6 Sep 2026';
                          setUpcomingModal({ title: exam.title, date: dateStr });
                        }}
                        title={`পরীক্ষা শুরু হবে ${scheduleBadge.dateText || '6 Sep 2026'} এ`}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '46px',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          border: 'none',
                          cursor: 'not-allowed',
                          boxShadow: '0 4px 12px rgba(245,158,11,0.2)',
                          userSelect: 'none',
                          opacity: 0.95
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(1px)' }}>
                          Upcoming : {scheduleBadge.dateText || '6 Sep 2026'}
                        </span>
                      </button>
                    ) : (
                      <Link 
                        href={`/live-exam-questions?id=${exam.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '46px',
                          padding: '12px 20px',
                          borderRadius: '10px',
                          backgroundColor: isEnded ? '#475569' : '#16a34a',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          boxShadow: isEnded
                            ? '0 4px 12px rgba(71,85,105,0.2)'
                            : '0 4px 12px rgba(22,163,74,0.28)'
                        }}
                      >
                        {isEnded ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(1px)' }}>
                            সমাধান ও ফলাফল দেখুন
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transform: 'translateY(1px)' }}>
                            <i className="fa-solid fa-fire" style={{ marginRight: '6px' }}></i>
                            পরীক্ষায় অংশ নিন <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }}></i>
                          </span>
                        )}
                      </Link>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Upcoming Exam Info Modal Popup */}
      {upcomingModal && (
        <div 
          onClick={() => setUpcomingModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '30px 24px',
              maxWidth: '430px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #fed7aa'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              margin: '0 auto 16px',
              border: '2px solid #fde68a'
            }}>
              <i className="fa-regular fa-clock"></i>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              পরীক্ষাটি শীঘ্রই শুরু হবে
            </h3>

            <p style={{ fontSize: '0.93rem', color: '#64748b', lineHeight: 1.6, marginBottom: '22px' }}>
              <strong style={{ color: '#1e293b' }}>{upcomingModal.title}</strong>
              <br />
              নির্ধারিত সময়সূচী অনুযায়ী পরীক্ষা শুরু হবে <span style={{ color: '#d97706', fontWeight: 700 }}>{upcomingModal.date}</span> এ।
            </p>

            <button
              type="button"
              onClick={() => setUpcomingModal(null)}
              style={{
                width: '100%',
                padding: '11px 20px',
                borderRadius: '10px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
