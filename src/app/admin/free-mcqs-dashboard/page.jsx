'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPaidApiUrl } from '@/lib/config';

export default function AdminFreeMcqsDashboardPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getPaidApiUrl('/api/categories'))
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 25px 30px 25px' }}>
      <style jsx>{`
        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .btn {
          padding: 9px 16px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 13.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .btn:hover {
          opacity: 0.9;
        }
        .btn-success {
          background: #28a745;
          color: white;
        }
        .btn-primary {
          background: #007bff;
          color: white;
        }
        .cat-badge {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

      <div className="box" style={{ borderLeft: '6px solid #28a745' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>
              <i className="fa-solid fa-gift" style={{ color: '#28a745', marginRight: '8px' }}></i>
              ফ্রি এমসিকিউ কন্ট্রোল (Free MCQs Dashboard)
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              ফ্রি কুইজ ও ওপেন প্রশ্ন ব্যাংকের কনফিগারেশন এবং ক্যাটাগরি তালিকা।
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/free-mcqs" target="_blank" className="btn btn-success">
              <i className="fa-solid fa-arrow-up-right-from-square"></i> ফ্রি এমসিকিউ পেজ দেখুন
            </Link>
            <Link href="/admin/questions-dashboard" className="btn btn-primary">
              <i className="fa-solid fa-file-circle-question"></i> প্রশ্ন ব্যাংক পরিচালনা
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '12px' }}>
            বর্তমান সক্রিয় ক্যাটাগরিসমূহ ({categories.length}):
          </h3>
          {loading ? (
            <p style={{ color: '#64748b' }}>ক্যাটাগরি লোড হচ্ছে...</p>
          ) : categories.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
          ) : (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {categories.map((c, i) => (
                <div key={i} className="cat-badge">
                  <i className="fa-solid fa-folder" style={{ color: '#28a745' }}></i>
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
