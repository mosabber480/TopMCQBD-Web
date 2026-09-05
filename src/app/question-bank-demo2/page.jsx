'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper to convert English numbers to Bengali numerals
const toBengaliNumber = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => bnDigits[parseInt(d)] || d).join('');
};

const generateBcsExams = () => {
  const list = [];
  for (let i = 50; i >= 10; i--) {
    const bnNum = toBengaliNumber(i);
    const suffix = (i === 10) ? 'ম' : 'তম';
    let yearAD = 2026 - (48 - i);
    if (i <= 10) yearAD = 1989;
    const bnYear = toBengaliNumber(yearAD);

    list.push({
      id: `bcs-${i}`,
      year: `${bnNum}${suffix} বিসিএস প্রিলিমিনারি পরীক্ষা`,
      category: "BCS",
      date: bnYear,
      totalQ: 200,
      time: "২ ঘণ্টা",
      subjectStats: i >= 35 ? "বাংলা ৩৫ | ইংরেজি ৩৫ | গণিত ১৫ | সাধারণ জ্ঞান ৫০ | বিজ্ঞান ও প্রযুক্তি ৩০" : "বাংলা ৪০ | ইংরেজি ৪০ | সাধারণ জ্ঞান ৮০ | গণিত ৪০",
      status: "সম্পূর্ণ সমাধানসহ উপলব্ধ"
    });
  }
  return list;
};

const generatePrimaryExams = () => {
  const list = [];
  const years = [2024, 2023, 2022, 2021, 2020];
  const steps = [
    { num: 3, text: '৩য় ধাপ (ঢাকা-চট্টগ্রাম বিভাগ)' },
    { num: 2, text: '২য় ধাপ (রাজশাহী-খুলনা-ময়মনসিংহ)' },
    { num: 1, text: '১ম ধাপ (বরিশাল-সিলেট-রংপুর)' }
  ];

  years.forEach(year => {
    const bnYear = toBengaliNumber(year);
    steps.forEach(step => {
      list.push({
        id: `primary-${year}-step${step.num}`,
        year: `প্রাথমিক সহকারী শিক্ষক নিয়োগ (${bnYear} - ${step.text})`,
        category: "Primary",
        date: bnYear,
        totalQ: 80,
        time: "১ ঘণ্টা",
        subjectStats: "বাংলা ২০ | ইংরেজি ২০ | গণিত ২০ | সাধারণ জ্ঞান ২০",
        status: "ব্যাখ্যামূলক সমাধান"
      });
    });
  });

  return list;
};

const generateNtrcaExams = () => {
  const list = [];
  const yearsMap = { 18: '২০২৪', 17: '২০২৩', 16: '২০১৯', 15: '২০১৮', 14: '২০১৭', 13: '২০১৬' };
  const levels = ['কলেজ পর্যায়', 'স্কুল পর্যায়', 'স্কুল-২ পর্যায়'];

  for (let i = 18; i >= 13; i--) {
    const bnNum = toBengaliNumber(i);
    const dateStr = yearsMap[i] || toBengaliNumber(2024 - (18 - i));

    levels.forEach((level, lIdx) => {
      list.push({
        id: `ntrca-${i}-level-${lIdx + 1}`,
        year: `${bnNum}তম শিক্ষক নিবন্ধন প্রিলিমিনারি (${level})`,
        category: "NTRCA",
        date: dateStr,
        totalQ: 100,
        time: "১ ঘণ্টা",
        subjectStats: "বাংলা ২৫ | ইংরেজি ২৫ | গণিত ২৫ | সাধারণ জ্ঞান ২৫",
        status: "ব্যাখ্যামূলক সমাধান"
      });
    });
  }

  return list;
};

const generateBankExams = () => {
  return [
    { id: "bb-ad-2024", year: "বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25 | Math 25 | Bangla 20 | GK 20 | ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-off-2024", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25 | Math 25 | Bangla 20 | GK 20 | ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "sonali-off-2024", year: "সোনালী ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25 | Math 25 | Bangla 20 | GK 20 | ICT 10", status: "ব্যাখ্যামূলক সমাধান" }
  ];
};

const QUESTION_BANK_DATA = [
  ...generateBcsExams(),
  ...generatePrimaryExams(),
  ...generateNtrcaExams(),
  ...generateBankExams()
];

function Demo2Content() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'All', label: 'সকল', count: QUESTION_BANK_DATA.length },
    { id: 'BCS', label: 'বিসিএস প্রিলি', count: QUESTION_BANK_DATA.filter(i => i.category === 'BCS').length },
    { id: 'Bank', label: 'ব্যাংক জবস', count: QUESTION_BANK_DATA.filter(i => i.category === 'Bank').length },
    { id: 'Primary', label: 'প্রাথমিক শিক্ষক', count: QUESTION_BANK_DATA.filter(i => i.category === 'Primary').length },
    { id: 'NTRCA', label: 'শিক্ষক নিবন্ধন', count: QUESTION_BANK_DATA.filter(i => i.category === 'NTRCA').length }
  ];

  const filteredData = QUESTION_BANK_DATA.filter(item => {
    const matchTab = activeTab === 'All' || item.category === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || item.year.toLowerCase().includes(q) || item.date.toLowerCase().includes(q) || item.subjectStats.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <main className="demo2-wrapper">
      <style jsx>{`
        .demo2-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          color: #1e293b;
          padding-bottom: 80px;
          font-family: inherit;
        }

        .demo2-header-notice {
          background: #0284c7;
          color: #ffffff;
          padding: 8px 15px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
        }

        .demo2-hero-banner {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          color: #ffffff;
          padding: 50px 20px 40px;
          border-bottom: 3px solid #6366f1;
        }

        .hero-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 30px;
        }

        .hero-title-group h1 {
          font-size: 2.2rem;
          font-weight: 800;
          margin: 0 0 10px 0;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .hero-title-group p {
          color: #cbd5e1;
          font-size: 1rem;
          margin: 0;
          max-width: 550px;
          line-height: 1.5;
        }

        .metrics-strip {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 12px 18px;
          border-radius: 12px;
          backdrop-filter: blur(8px);
          text-align: center;
          min-width: 100px;
        }

        .metric-val {
          font-size: 1.4rem;
          font-weight: 800;
          color: #38bdf8;
        }

        .metric-lbl {
          font-size: 11.5px;
          color: #94a3b8;
          font-weight: 600;
          margin-top: 2px;
        }

        .demo2-content-container {
          max-width: 1300px;
          margin: 30px auto 0 auto;
          padding: 0 20px;
        }

        .control-bar {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 25px;
        }

        .tabs-group {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tab-button {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tab-button:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .tab-button.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }

        .tab-count-badge {
          background: rgba(0, 0, 0, 0.12);
          padding: 1px 7px;
          border-radius: 10px;
          font-size: 11px;
        }

        .search-box-clean {
          position: relative;
          min-width: 260px;
        }

        .search-box-clean input {
          width: 100%;
          padding: 9px 14px 9px 36px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13.5px;
          outline: none;
          background: #ffffff;
          transition: border-color 0.2s ease;
        }

        .search-box-clean input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        }

        .search-box-clean i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .list-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .list-row-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }

        .list-row-card:hover {
          border-color: #818cf8;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
          transform: translateX(4px);
        }

        .row-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .row-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #e0e7ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .row-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .row-subject-info {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 6px 0;
        }

        .row-tags {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #64748b;
          align-items: center;
        }

        .tag-pill-sm {
          background: #f1f5f9;
          color: #334155;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .row-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .btn-read-mode {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-read-mode:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-quiz-mode {
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
          transition: all 0.2s ease;
        }

        .btn-quiz-mode:hover {
          background: #4338ca;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
        }

        @media (max-width: 768px) {
          .list-row-card { flex-direction: column; align-items: flex-start; }
          .row-actions { width: 100%; justify-content: flex-end; margin-top: 10px; }
        }
      `}</style>

      <div className="demo2-header-notice">
        <i className="fa-solid fa-palette" style={{ marginRight: '6px' }}></i>
        ডিজাইন ডেমো ২: <strong>Sleek Minimalist Dashboard & Metric Strip</strong>
      </div>

      {/* Hero Banner with Metrics */}
      <div className="demo2-hero-banner">
        <div className="hero-inner">
          <div className="hero-title-group">
            <h1>বিগত বছরের সকল বিসিএস ও চাকরির প্রশ্ন</h1>
            <p>বিগত সালের শতভাগ নির্ভুল উত্তর ও ব্যাখ্যা সহ প্রশ্ন ব্যাংক এক্সপ্লোর করুন।</p>
          </div>

          <div className="metrics-strip">
            <div className="metric-card">
              <div className="metric-val">৪০+</div>
              <div className="metric-lbl">বিসিএস সেট</div>
            </div>
            <div className="metric-card">
              <div className="metric-val">২৫+</div>
              <div className="metric-lbl">ব্যাংক পরীক্ষা</div>
            </div>
            <div className="metric-card">
              <div className="metric-val">১৫+</div>
              <div className="metric-lbl">শিক্ষক নিয়োগ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="demo2-content-container">
        {/* Control Bar */}
        <div className="control-bar">
          <div className="tabs-group">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span>{tab.label}</span>
                <span className="tab-count-badge">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="search-box-clean">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সাল বা বিষয় অনুসন্ধান করুন..."
            />
          </div>
        </div>

        {/* List View */}
        <div className="list-container">
          {filteredData.map(item => (
            <div key={item.id} className="list-row-card">
              <div className="row-left">
                <div className="row-icon-badge">
                  <i className="fa-solid fa-book-bookmark"></i>
                </div>
                <div>
                  <h3 className="row-title">{item.year}</h3>
                  <p className="row-subject-info">{item.subjectStats}</p>
                  <div className="row-tags">
                    <span className="tag-pill-sm">সাল: {item.date}</span>
                    <span>•</span>
                    <span>প্রশ্ন: {item.totalQ} টি</span>
                    <span>•</span>
                    <span>সময়: {item.time}</span>
                  </div>
                </div>
              </div>

              <div className="row-actions">
                <button onClick={() => router.push('/questions')} className="btn-read-mode">
                  <i className="fa-solid fa-book-open"></i> <span>পড়ুন</span>
                </button>
                <button onClick={() => router.push('/quiz')} className="btn-quiz-mode">
                  <i className="fa-solid fa-play"></i> <span>পরীক্ষা দিন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function QuestionBankDemo2Page() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Loading Demo 2...</div>}>
      <Demo2Content />
    </Suspense>
  );
}
