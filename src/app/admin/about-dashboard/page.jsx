'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminAboutDashboardPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderLeft: '6px solid var(--primary)' }}>
        <h2 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '10px' }}>
          <i className="fa-solid fa-address-card" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
          আমাদের সম্পর্কে (About Page Controls)
        </h2>
        <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: '1.7', marginBottom: '20px' }}>
          &apos;আমাদের সম্পর্কে&apos; পেজের বিস্তারিত তথ্য ও কনটেন্ট পরিচালিত হয়। পাবলিক পেজ দেখতে নিচের বাটনে ক্লিক করুন।
        </p>
        <Link href="/about-us" target="_blank" className="btn btn-primary">
          <i className="fa-solid fa-arrow-up-right-from-square"></i> আমাদের সম্পর্কে পেজ দেখুন
        </Link>
      </div>
    </div>
  );
}
