'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper to convert English numbers to Bengali numerals
const toBengaliNumber = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => bnDigits[parseInt(d)] || d).join('');
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
      year: `${bnNum}${suffix} বিসিএস প্রিলিমিনারি`,
      category: "BCS",
      date: bnYear,
      totalQ: 200,
      time: "২ ঘণ্টা",
      subjectStats: i >= 35 ? "বাংলা ৩৫, ইংরেজি ৩৫, গণিত ১৫, সাধারণ জ্ঞান ৫০" : "বাংলা ৪০, ইংরেজি ৪০, সাধারণ জ্ঞান ৮০, গণিত ৪০",
      status: "সম্পূর্ণ সমাধানসহ উপলব্ধ"
    });
  }
  return list;
};

// Generate Primary Teacher Exams from 2024 down to 2020 (1st, 2nd, 3rd steps)
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
        status: "ব্যাখ্যামূলক সমাধান"
      });
    });
  });

  return list;
};

// Generate NTRCA Exams from 18th down to 6th (College, School, School-2 levels)
const generateNtrcaExams = () => {
  const list = [];
  const yearsMap = {
    18: '২০২৪',
    17: '২০২৩',
    16: '২০১৯',
    15: '২০১৮',
    14: '২০১৭',
    13: '২০১৬',
    12: '২০১৫',
    11: '২০১৪',
    10: '২০১৪',
    9: '২০১৩',
    8: '২০১২',
    7: '২০১১',
    6: '২০১০'
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
        status: "ব্যাখ্যামূলক সমাধান"
      });
    });
  }

  return list;
};

// Generate Bank Job Question Banks
const generateBankExams = () => {
  return [
    // 1. বাংলাদেশ ব্যাংক (Bangladesh Bank)
    { id: "bb-ad-2024", year: "বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-off-2024", year: "বাংলাদেশ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-off-2023", year: "বাংলাদেশ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৩", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-sr-2023", year: "বাংলাদেশ ব্যাংক সিনিয়র অফিসার", category: "Bank", date: "২০২৩", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-cash-2022", year: "বাংলাদেশ ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০২২", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-sr-2022", year: "বাংলাদেশ ব্যাংক সিনিয়র অফিসার", category: "Bank", date: "২০২২", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-off-2021", year: "বাংলাদেশ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২১", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-cash-2021", year: "বাংলাদেশ ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০২১", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-sr-2020", year: "বাংলাদেশ ব্যাংক সিনিয়র অফিসার", category: "Bank", date: "২০২০", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-off-2020", year: "বাংলাদেশ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২০", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bb-cash-2019", year: "বাংলাদেশ ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০১৯", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },

    // 2. ব্যাংকার্স সিলেকশন কমিটি (BSC - Combined Banks)
    { id: "bsc-off-2024", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-cash-2024", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-off-2023", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৩", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-cash-2023", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০২৩", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-sr-2022", year: "BSC কম্বাইন্ড ৫ ব্যাংক সিনিয়র অফিসার", category: "Bank", date: "২০২২", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-cash-2022", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০২২", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-off-2021", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২১", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-cash-2021", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০২১", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-sr-2020", year: "BSC কম্বাইন্ড ৫ ব্যাংক সিনিয়র অফিসার", category: "Bank", date: "২০২০", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-off-2020", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (General)", category: "Bank", date: "২০২০", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bsc-cash-2019", year: "BSC কম্বাইন্ড ৮ ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০১৯", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },

    // 3. সরকারি ব্যাংক (Sonali, Janata, Agrani, Rupali, BKB, RAKUB, BDBL)
    { id: "sonali-off-2024", year: "সোনালী ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "sonali-sr-2023", year: "সোনালী ব্যাংক সিনিয়র অফিসার", category: "Bank", date: "২০২৩", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "janata-off-2023", year: "জনতা ব্যাংক অফিসার (General)", category: "Bank", date: "২০২৩", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "agrani-sr-2022", year: "অগ্রণী ব্যাংক সিনিয়র অফিসার", category: "Bank", date: "২০২২", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "rupali-cash-2022", year: "রূপালী ব্যাংক অফিসার (Cash)", category: "Bank", date: "২০২২", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bdbl-off-2020", year: "বাংলাদেশ ডেভেলপমেন্ট ব্যাংক (BDBL) অফিসার", category: "Bank", date: "২০২০", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },

    // 4. বিশেষায়িত ব্যাংক (PKB, Karmasangsthan, BKB, RAKUB)
    { id: "pkb-off-2024", year: "প্রবাসী কল্যাণ ব্যাংক অফিসার", category: "Bank", date: "২০২৪", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "kb-off-2023", year: "কর্মসংস্থান ব্যাংক অফিসার", category: "Bank", date: "২০২৩", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "bkb-sr-2022", year: "বাংলাদেশ কৃষি ব্যাংক সিনিয়র অফিসার", category: "Bank", date: "২০২২", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" },
    { id: "rakub-off-2021", year: "রাজশাহী কৃষি উন্নয়ন ব্যাংক অফিসার", category: "Bank", date: "২০২১", totalQ: 100, time: "১ ঘণ্টা", subjectStats: "English 25, Math 25, Bangla 20, GK 20, ICT 10", status: "ব্যাখ্যামূলক সমাধান" }
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
    { id: 'All', label: 'সকল প্রশ্নব্যাংক' },
    { id: 'BCS', label: 'বিসিএস' },
    { id: 'Bank', label: 'ব্যাংক জব' },
    { id: 'Primary', label: 'প্রাথমিক শিক্ষক' },
    { id: 'NTRCA', label: 'NTRCA' }
  ];

  const filteredData = QUESTION_BANK_DATA.filter(item => {
    const matchTag = currentTag === 'All' || item.category === currentTag;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || item.year.toLowerCase().includes(q) || item.date.toLowerCase().includes(q) || item.subjectStats.toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  return (
    <main style={{ padding: '40px 0 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '12px'
            }}
          >
            <i className="fa-solid fa-book-open"></i>
            <span>প্রশ্নব্যাংক আর্কাইভ</span>
          </span>
          <h1 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            বিগত সালের প্রশ্ন ও নির্ভুল ব্যাখ্যা
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক ও NTRCA শিক্ষক নিবন্ধন পরীক্ষার বিগত প্রশ্ন সমাধান পড়ুন অথবা সরাসরি পরীক্ষা দিন।
          </p>
        </div>

        {/* Filters & Search Box */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '18px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            marginBottom: '35px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filterTags.map(tag => {
              const isActive = currentTag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setCurrentTag(tag.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: isActive ? '#0284c7' : '#ffffff',
                    color: isActive ? '#ffffff' : '#334155',
                    boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
                  }}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>

          {/* Search Input Bar */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '0 1 300px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সাল বা পরীক্ষা দিয়ে সার্চ করুন..."
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.92rem',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        {/* Question Bank List */}
        {filteredData.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1'
            }}
          >
            <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>
              কোনো প্রশ্নব্যাংক পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredData.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  border: '1px solid #e2e8f0',
                  borderLeft: '5px solid #0284c7',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span
                      style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0284c7',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      {item.category}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                      সাল: {item.date}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, marginBottom: '6px' }}>
                    {item.year}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '12px' }}>
                    বন্টন: {item.subjectStats}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#475569', flexWrap: 'wrap' }}>
                    <span><strong>মোট প্রশ্ন:</strong> {item.totalQ} টি</span>
                    <span>•</span>
                    <span><strong>সময়:</strong> {item.time}</span>
                    <span>•</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>{item.status}</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => router.push('/quiz')}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s ease',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                    }}
                  >
                    <span>অনুশীলন করুন</span> <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
                  </button>
                </div>
              </div>
            ))}
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
