'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { showTopAlert } from '@/components/layout/TopAlert';
import { getLiveExamApiUrl } from '@/lib/config';

export default function AdminMeritPositionDashboardPage() {
  const [meritList, setMeritList] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
      console.error(err);
    }
  };

  const fetchMerit = async () => {
    setLoading(true);
    try {
      let url = `/api/live-exam/merit?admin=true&examId=${selectedExam}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(getLiveExamApiUrl(url), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.meritList)) {
          setMeritList(data.meritList);
        }
      }
    } catch (err) {
      console.error(err);
      showTopAlert('মেরিট লিস্ট ডাটাবেজ থেকে লোড করতে সমস্যা হয়েছে।', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchMerit();
  }, [selectedExam, searchQuery]);

  const handleDeleteSubmission = async (id) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই সাবমিশন রেকর্ডটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(getLiveExamApiUrl(`/api/live-exam/merit?id=${id}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        showTopAlert('✅ রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।', 'success');
        fetchMerit();
      } else {
        showTopAlert('❌ রেকর্ড মুছে ফেলা সম্ভব হয়নি।', 'danger');
      }
    } catch (err) {
      showTopAlert('❌ ডাটাবেজ সংযোগ ত্রুটি।', 'danger');
    }
  };

  const exportToCSV = () => {
    if (meritList.length === 0) {
      showTopAlert('এক্সপোর্ট করার জন্য কোনো সাবমিশন ডাটা নেই।', 'warning');
      return;
    }

    const headers = ['Rank,Name,Exam,Score,Accuracy,TimeTaken,Badge,Date'];
    const rows = meritList.map(m => 
      `"${m.rank}","${m.name}","${m.examTitle}","${m.score}","${m.accuracy}","${m.timeTaken}","${m.badge}","${m.date}"`
    );

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `topmcqbd_national_merit_list_${selectedExam}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showTopAlert('✅ মেরিট লিস্ট CSV সফলভাবে ডাউনলোড হয়েছে!', 'success');
  };

  return (
    <main style={{ padding: '30px 20px', backgroundColor: '#f8fafc', minHeight: '90vh' }}>
      <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '25px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.85rem', color: '#64748b' }}>
              <Link href="/admin/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>অ্যাডমিন ড্যাশবোর্ড</Link>
              <span>/</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>জাতীয় মেরিট পজিশন কন্ট্রোল</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>
              🏆 National Merit Positions & Submissions Controller
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link 
              href="/admin/live-exam-model-dashboard"
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              ⚙️ লাইভ মডেল টেস্ট ম্যানেজার
            </Link>
            <button
              onClick={exportToCSV}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
              }}
            >
              📥 CSV এক্সপোর্ট করুন
            </button>
          </div>
        </div>



        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>মোট পরীক্ষার্থী রেকর্ড</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{meritList.length} জন</div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>সর্বোচ্চ স্কোর</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
              {meritList[0]?.score || 'N/A'}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>১ম স্থান অর্জনকারী</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
              {meritList[0]?.name || 'N/A'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          marginBottom: '25px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155' }}>টেস্ট বাছাই:</span>
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
                flex: 1,
                maxWidth: '420px'
              }}
            >
              <option value="all">সকল মডেল টেস্ট একযোগে</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '340px' }}>
            <input 
              type="text" 
              placeholder="শিক্ষার্থী খুঁজুন..." 
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
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              লোড হচ্ছে...
            </div>
          ) : meritList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              কোনো মেরিট রেকর্ড নেই।
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '12px 14px' }}>র‍্যাঙ্ক</th>
                    <th style={{ padding: '12px 14px' }}>শিক্ষার্থী</th>
                    <th style={{ padding: '12px 14px' }}>মডেল টেস্ট</th>
                    <th style={{ padding: '12px 14px' }}>প্রাপ্ত স্কোর</th>
                    <th style={{ padding: '12px 14px' }}>নির্ভুলতা</th>
                    <th style={{ padding: '12px 14px' }}>সময়</th>
                    <th style={{ padding: '12px 14px' }}>স্বীকৃতি ব্যাজ</th>
                    <th style={{ padding: '12px 14px' }}>তারিখ</th>
                    <th style={{ padding: '12px 14px' }}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {meritList.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px', fontWeight: 800, color: '#0284c7' }}>
                        #{item.rank}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '14px', color: '#475569', fontSize: '0.85rem' }}>
                        {item.examTitle}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#16a34a' }}>
                        {item.score}
                      </td>
                      <td style={{ padding: '14px', color: '#334155' }}>
                        {item.accuracy}
                      </td>
                      <td style={{ padding: '14px', color: '#64748b' }}>
                        {item.timeTaken}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.78rem', fontWeight: 700 }}>
                          {item.badge}
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: '#94a3b8', fontSize: '0.82rem' }}>
                        {item.date}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {item.id && (
                          <button
                            onClick={() => handleDeleteSubmission(item.id)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            মুছুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
