'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminFreeMcqsDashboardPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderLeft: '6px solid #28a745' }}>
        <h2 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '10px' }}>
          <i className="fa-solid fa-gift" style={{ color: '#28a745', marginRight: '8px' }}></i>
          ফ্রি এমসিকিউ কন্ট্রোল (Free MCQs Dashboard)
        </h2>
        <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: '1.7', marginBottom: '20px' }}>
          ফ্রি কুইজ ও প্রশ্ন ব্যাংকের কনফিগারেশন ম্যানেজমেন্ট। পাবলিক ফ্রি কুইজ পেজ দেখতে বা প্রশ্ন যুক্ত করতে নিচের বাটনগুলো ব্যবহার করুন।
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/free-mcqs" target="_blank" className="btn btn-success">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> ফ্রি এমসিকিউ পেজ দেখুন
          </Link>
          <Link href="/admin/quiz-dashboard" className="btn btn-primary">
            <i className="fa-solid fa-file-circle-question"></i> প্রশ্ন ব্যাংকে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
