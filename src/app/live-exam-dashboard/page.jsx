'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLiveExamApiUrl } from '@/lib/config';

export default function LiveExamDashboardPage() {
  const [stats, setStats] = useState({
    totalExams: 28,
    avgScore: '৭৮.৫%',
    accuracyRate: '৮৬.২%',
    nationalRank: '#৪৮',
    totalParticipants: '১,২০,০০০+',
  });

  const [examHistory, setExamHistory] = useState([
    {
      id: 'bcs-46-live',
      title: '৪৬তম বিসিএস প্রিলিমিনারি লাইভ গ্র্যান্ড মডেল টেস্ট - ০১',
      date: '১৪ আগস্ট, ২০২৬',
      score: '১৬.৫০ / ২০',
      accuracy: '৮৮%',
      rank: '#১২২',
      duration: '১২ মি. ১৫ সে.'
    },
    {
      id: 'bank-officer-daily',
      title: 'কম্বাইন্ড ৮ ব্যাংক অফিসার ডেইলি প্র্যাকটিস টেস্ট',
      date: '১২ আগস্ট, ২০২৬',
      score: '৮.৫০ / ১০',
      accuracy: '৮৫%',
      rank: '#৮৪',
      duration: '০৭ মি. ৪০ সে.'
    },
    {
      id: 'primary-teacher-2026',
      title: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ স্পেশাল মডেল টেস্ট - ০৩',
      date: '০৮ আগস্ট, ২০২৬',
      score: '১৮.০০ / ২০',
      accuracy: '৯০%',
      rank: '#৫২',
      duration: '১৩ মি. ১০ সে.'
    },
    {
      id: 'math-shortcut-mastery',
      title: 'বিসিএস ও ব্যাংক ম্যাথ শর্টকাট স্পেশাল টেস্ট',
      date: '০৫ আগস্ট, ২০২৬',
      score: '৭.০০ / ১০',
      accuracy: '৭০%',
      rank: '#২৪০',
      duration: '১১ মি. ৫০ সে.'
    }
  ]);

  const subjectPerformance = [
    { subject: 'বাংলা ভাষা ও সাহিত্য', scorePercent: 92, label: '৯২% (অত্যন্ত ভালো)', color: '#16a34a' },
    { subject: 'বাংলাদেশ বিষয়াবলি', scorePercent: 88, label: '৮৮% (ভালো)', color: '#0284c7' },
    { subject: 'ইংরেজি ভাষা ও সাহিত্য', scorePercent: 78, label: '৭৮% (মধ্যম)', color: '#8b5cf6' },
    { subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা', scorePercent: 62, label: '৬২% (চর্চা প্রয়োজন)', color: '#e11d48' },
    { subject: 'সাধারণ বিজ্ঞান ও আইসিটি', scorePercent: 85, label: '৮৫% (ভালো)', color: '#059669' }
  ];

  return (
    <div style={{ padding: '40px 0 50px', backgroundColor: '#f8fafc', minHeight: 'auto' }}>
      <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* User Profile Header Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 700
            }}>
              👤
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
                  মোসাব্বের হোসেন
                </h1>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '50px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  🛡️ প্রো মেম্বার
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                mosabber@topmcqbd.com | টার্গেট: ৪৭তম বিসিএস ক্যাডার ও বাংলাদেশ ব্যাংক
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link 
              href="/live-exam-model-test"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(2,132,199,0.25)'
              }}
            >
              🔥 নতুন এক্সাম দিন ➔
            </Link>
            <Link 
              href="/national-merit-position"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.92rem',
                textDecoration: 'none'
              }}
            >
              🏆 জাতীয় মেরিট পজিশন
            </Link>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>মোট মডেল টেস্ট</span>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '1.2rem' }}>📖</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{stats.totalExams} টি</div>
            <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>+৪টি এই সপ্তাহে</span>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>গড় স্কোর</span>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#10b981', fontSize: '1.2rem' }}>🏆</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{stats.avgScore}</div>
            <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>টপ ৫% শিক্ষার্থীর মধ্যে</span>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>নির্ভুলতার হার</span>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#ede9fe', color: '#8b5cf6', fontSize: '1.2rem' }}>📈</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{stats.accuracyRate}</div>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>নেগেটিভ মার্ক কম হয়েছে</span>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>জাতীয় মেরিট পজিশন</span>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '1.2rem' }}>✨</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{stats.nationalRank}</div>
            <span style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>{stats.totalParticipants} জনের মধ্যে</span>
          </div>
        </div>

        {/* Performance Breakdown & Weak Subjects */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '35px'
        }}>
          
          {/* Strength & Weakness */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '26px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '20px', fontWeight: 700 }}>
              বিষয়ভিত্তিক পারফরম্যান্স বিশ্লেষণ
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {subjectPerformance.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{item.subject}</span>
                    <span style={{ fontWeight: 700, color: item.color }}>{item.label}</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: `${item.scorePercent}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Personalized Tips */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '26px',
            border: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.3rem' }}>✨</span>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
                  এআই পারসোনালাইজড পরামর্শ
                </h3>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.7, marginBottom: '16px' }}>
                আপনার সাম্প্রতিক পরীক্ষার ডাটা অনুযায়ী, <strong>গণিতের জ্যামিতি ও ধারার প্রশ্নে</strong> নেগেটিভ মার্ক বেশি হচ্ছে। প্রতিদিন অন্তত ২০টি গণিত শর্টকাট প্রশ্ন অনুশীলন করার পরামর্শ দেওয়া হচ্ছে।
              </p>

              <div style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e0f2fe',
                marginBottom: '18px',
                fontSize: '0.88rem',
                color: '#0369a1'
              }}>
                📌 <strong>টার্গেট:</strong> আগামী পরীক্ষার মধ্যে গণিতের নির্ভুলতার হার ৬০% থেকে ৮০%-এ উন্নীত করা।
              </div>
            </div>

            <Link 
              href="/live-exam-questions?id=math-shortcut-mastery"
              style={{
                display: 'inline-block',
                textAlign: 'center',
                padding: '10px 18px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              গণিত স্পেশাল টেস্ট দিন ➔
            </Link>
          </div>

        </div>

        {/* Recent Exam History Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700 }}>
              সাম্প্রতিক পরীক্ষার ইতিহাস
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>সর্বশেষ ৪টি পরীক্ষা</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 16px' }}>পরীক্ষার নাম</th>
                  <th style={{ padding: '12px 16px' }}>তারিখ</th>
                  <th style={{ padding: '12px 16px' }}>প্রাপ্ত নম্বর</th>
                  <th style={{ padding: '12px 16px' }}>নির্ভুলতা</th>
                  <th style={{ padding: '12px 16px' }}>মেরিট পজিশন</th>
                  <th style={{ padding: '12px 16px' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {examHistory.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{item.date}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#16a34a' }}>{item.score}</td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>{item.accuracy}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0284c7' }}>{item.rank}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link 
                        href={`/live-exam-questions?id=${item.id}`}
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          color: '#0284c7',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          textDecoration: 'none'
                        }}
                      >
                        ব্যাখ্যা দেখুন
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
