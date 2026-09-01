'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper to convert English numbers to Bengali numerals
const toBengaliNumber = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => bnDigits[parseInt(d)] || d).join('');
};

// Helper to convert English digits in string to Bengali digits
const toBengaliNumberStr = (str) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(str).replace(/[0-9]/g, (d) => bnDigits[parseInt(d)]);
};

// Helper to convert Bengali digits in string to English digits
const toEnglishNumberStr = (str) => {
  const enDigits = {'০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'};
  return String(str).replace(/[০-৯]/g, (d) => enDigits[d] || d);
};

// Generate BCS Exams from 50th down to 10th
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
      subjectStats: i >= 35 ? "বাংলা ৩৫, ইংরেজি ৩৫, গণিত ১৫, বিজ্ঞান ১৫, কম্পিউটার ১৫, সাধারণ জ্ঞান ৫০" : "বাংলা ৪০, ইংরেজি ৪০, সাধারণ জ্ঞান ৮০, গণিত ৪০",
      status: "সম্পূর্ণ সমাধানসহ উপলব্ধ",
      tags: ['BCS', `${i}th BCS`, `${i}th`, 'BCS Preliminary', 'Prelims', `${i}`, `${yearAD}`, 'bcs exam'],
      displayTag: `${i}th`
    });
  }
  return list;
};

// Generate Primary Teacher Exams
const generatePrimaryExams = () => {
  const list = [];
  const years = [2024, 2023, 2022, 2021, 2020];
  const steps = [
    { num: 3, text: '৩য় ধাপ' },
    { num: 2, text: '২য় ধাপ' },
    { num: 1, text: '১ম ধাপ' }
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
        subjectStats: "বাংলা ২০, ইংরেজি ২০, গণিত ২০, সাধারণ জ্ঞান ২০",
        status: "ব্যাখ্যামূলক সমাধান",
        tags: ['Primary', 'Primary Teacher', 'Assistant Teacher', `Primary ${year}`, `Step ${step.num}`, `Step-${step.num}`, `Step${step.num}`, `${step.num}rd Step`, `${step.num}nd Step`, `${step.num}st Step`, `${year}`, 'primary school'],
        displayTag: `Step-${step.num}`
      });
    });
  });

  return list;
};

// Generate NTRCA Exams
const generateNtrcaExams = () => {
  const list = [];
  const yearsMap = {
    18: '২০২৪', 17: '২০২৩', 16: '২০১৯', 15: '২০১৮', 14: '২০১৭',
    13: '২০১৬', 12: '২০১৫', 11: '২০১৪', 10: '২০১৪', 9: '২০১৩', 8: '২০১২', 7: '২০১১', 6: '২০১০'
  };

  const levels = ['কলেজ পর্যায়', 'স্কুল পর্যায়', 'স্কুল-২ পর্যায়'];

  for (let i = 18; i >= 6; i--) {
    const bnNum = toBengaliNumber(i);
    const dateStr = yearsMap[i] || toBengaliNumber(2024 - (18 - i));

    levels.forEach((level, lIdx) => {
      list.push({
        id: `ntrca-${i}-level-${lIdx + 1}`,
        year: `${bnNum}তম শিক্ষক নিবন্ধন (${level})`,
        category: "NTRCA",
        date: dateStr,
        totalQ: 100,
        time: "১ ঘণ্টা",
        subjectStats: "বাংলা ২৫, ইংরেজি ২৫, গণিত ২৫, সাধারণ জ্ঞান ২৫",
        status: "ব্যাখ্যামূলক সমাধান",
        tags: ['NTRCA', 'Teacher Registration', `${i}th NTRCA`, `${i}th`, level, 'school', 'college'],
        displayTag: `${i}th`
      });
    });
  }

  return list;
};

// Generate Bank Job Question Banks
const generateBankExams = () => {
  return [
    { id: "bb-ad-2024", year: "বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান", tags: ['Bank', 'Bank Job', 'Bangladesh Bank', 'AD', 'Assistant Director', '2024'], displayTag: 'AD' },
    { id: "bb-off-2024", year: "বাংলাদেশ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান", tags: ['Bank', 'Bank Job', 'Bangladesh Bank', 'Officer', 'General Officer', '2024'], displayTag: 'Officer' },
    { id: "bsc-off-2024", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান", tags: ['Bank', 'Bank Job', 'BSC Bank', 'Combined Bank', '8 Bank', '2024'], displayTag: 'Combined' },
    { id: "sonali-off-2024", year: "সোনালী ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান", tags: ['Bank', 'Bank Job', 'Sonali Bank', 'Officer', '2024'], displayTag: 'Sonali Officer' }
  ];
};

const QUESTION_BANK_DATA = [
  ...generateBcsExams(),
  ...generatePrimaryExams(),
  ...generateNtrcaExams(),
  ...generateBankExams()
];

function QuestionBankContent() {
  const router = useRouter();
  const [currentTag, setCurrentTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTags = [
    { id: 'All', label: 'সকল ক্যাটাগরি', count: QUESTION_BANK_DATA.length },
    { id: 'BCS', label: 'বিসিএস প্রিলি', count: QUESTION_BANK_DATA.filter(i => i.category === 'BCS').length },
    { id: 'Bank', label: 'ব্যাংক জবস', count: QUESTION_BANK_DATA.filter(i => i.category === 'Bank').length },
    { id: 'Primary', label: 'প্রাথমিক শিক্ষক', count: QUESTION_BANK_DATA.filter(i => i.category === 'Primary').length },
    { id: 'NTRCA', label: 'শিক্ষক নিবন্ধন', count: QUESTION_BANK_DATA.filter(i => i.category === 'NTRCA').length }
  ];

  const filteredData = QUESTION_BANK_DATA.filter(item => {
    const matchTag = currentTag === 'All' || item.category === currentTag;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchTag;

    const qBn = toBengaliNumberStr(q);
    const qClean = q.replace(/[-_\s]/g, '');
    const qSpaced = q.replace(/[-_]/g, ' ');
    const itemYearEn = toEnglishNumberStr(item.year).toLowerCase();
    const itemDateEn = toEnglishNumberStr(item.date).toLowerCase();

    // Remove 'th', 'st', 'nd', 'rd' or special characters from query if searching numbers e.g. 50th -> 50
    const cleanNumQuery = q.replace(/(st|nd|rd|th)/g, '');
    const cleanNumQueryNoSymbol = cleanNumQuery.replace(/[-_\s]/g, '');

    const checkMatch = (targetStr) => {
      if (!targetStr) return false;
      const str = String(targetStr).toLowerCase();
      const strClean = str.replace(/[-_\s]/g, '');
      const strSpaced = str.replace(/[-_]/g, ' ');

      return (
        str.includes(q) ||
        str.includes(qBn) ||
        str.includes(qSpaced) ||
        strClean.includes(qClean) ||
        (cleanNumQuery && strClean.includes(cleanNumQueryNoSymbol))
      );
    };

    const textMatch = 
      checkMatch(item.year) ||
      checkMatch(itemYearEn) ||
      checkMatch(item.date) ||
      checkMatch(itemDateEn) ||
      checkMatch(item.category) ||
      checkMatch(item.displayTag) ||
      checkMatch(item.subjectStats) ||
      (item.tags && item.tags.some(t => checkMatch(t)));

    return matchTag && textMatch;
  });

  return (
    <main className="qb-demo-wrapper">
      <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header Section */}
        <div className="header-section">
          <span className="badge-archive">
            <i className="fa-solid fa-book-open"></i>
            <span>প্রশ্নব্যাংক আর্কাইভ</span>
          </span>
          <h1 className="title-main">
            বিগত সালের প্রশ্ন ও নির্ভুল ব্যাখ্যা
          </h1>
          <p className="desc-sub">
            বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক ও NTRCA শিক্ষক নিবন্ধন পরীক্ষার বিগত প্রশ্ন সমাধান পড়ুন অথবা সরাসরি পরীক্ষা দিন।
          </p>
        </div>

        {/* Filters & Search Control Card */}
        <div className="filter-control-card">
          <div className="pills-group">
            {filterTags.map(tag => {
              const isActive = currentTag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setCurrentTag(tag.id)}
                  className={`filter-btn ${isActive ? 'active' : 'inactive'}`}
                >
                  <span>{tag.label}</span>
                  <span className="count-badge">{toBengaliNumber(tag.count)}</span>
                </button>
              );
            })}
          </div>

          <div className="search-box-wrapper">
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="খুঁজুন (যেমন: 50th, BCS)..."
            />
            <i className="fa-solid fa-magnifying-glass search-icon" />
          </div>
        </div>

        {/* Question Bank Cards Grid */}
        {filteredData.length === 0 ? (
          <div className="no-data-box">
            <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
              কোনো প্রশ্নব্যাংক পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          <div className="cards-grid-layout">
            {filteredData.map(item => {
              return (
                <div key={item.id} className="hub-card-item">
                  <div>
                    {/* Header Chips with Search Tags */}
                    <div className="card-header-badges">
                      <span 
                        className="category-chip"
                        onClick={() => setSearchQuery(item.category)}
                        style={{ cursor: 'pointer' }}
                        title="ক্লিক করে এই ক্যাটাগরিতে সার্চ করুন"
                      >
                        {item.category}
                      </span>
                      
                      {item.displayTag && (
                        <span 
                          className="tag-chip"
                          onClick={() => setSearchQuery(item.displayTag)}
                          style={{ cursor: 'pointer' }}
                          title="ক্লিক করে এই পদ/ব্যাচে সার্চ করুন"
                        >
                          {item.displayTag}
                        </span>
                      )}

                      <span 
                        className="tag-chip"
                        onClick={() => setSearchQuery(toEnglishNumberStr(item.date))}
                        style={{ cursor: 'pointer' }}
                        title="ক্লিক করে এই সালে সার্চ করুন"
                      >
                        {toEnglishNumberStr(item.date)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="card-exam-title">{item.year}</h3>

                    {/* Subject Breakdown Box */}
                    <div className="subject-breakdown-box">
                      {item.subjectStats}
                    </div>
                  </div>

                  <div>
                    {/* Meta Stats Row */}
                    <div className="meta-stats-row">
                      <span><strong>প্রশ্ন:</strong> {item.totalQ} টি</span>
                      <span><strong>সময়:</strong> {item.time}</span>
                      <span><strong>সাল:</strong> {item.date}</span>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="card-buttons-flex">
                      <button onClick={() => router.push('/questions')} className="btn-read-solution">
                        <i className="fa-regular fa-folder-open"></i> <span>ব্যাখ্যা পড়ুন</span>
                      </button>
                      <button onClick={() => router.push('/quiz')} className="btn-start-exam">
                        <span>পরীক্ষা দিন</span> <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
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

export default function QuestionBankDemoPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
        প্রশ্নব্যাংক পেজ লোড হচ্ছে...
      </div>
    }>
      <QuestionBankContent />
    </Suspense>
  );
}
