'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminPackagesDashboardPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderLeft: '6px solid #fd7e14' }}>
        <h2 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '10px' }}>
          <i className="fa-solid fa-box-open" style={{ color: '#fd7e14', marginRight: '8px' }}></i>
          প্যাকেজসমূহ পেজ কন্ট্রোল (Packages Dashboard)
        </h2>
        <p style={{ color: '#64748b', fontSize: '14.5px', lineHeight: '1.7', marginBottom: '20px' }}>
          সাবস্ক্রিপশন প্যাকেজের মূল্য, মেয়াদ ও অন্যান্য সেটিংস হোম পেজ কন্ট্রোল ও ইউজার ড্যাশবোর্ডের সাথে সমন্বিত রয়েছে। প্যাকেজের মূল্য তালিকা পাবলিক পেজে দেখতে নিচের বাটনে ক্লিক করুন।
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/packages" target="_blank" className="btn btn-primary">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> প্যাকেজ পেজ দেখুন
          </Link>
          <Link href="/admin/home-dashboard" className="btn btn-secondary">
            <i className="fa-solid fa-sliders"></i> হোম প্যাকেজ কার্ড এডিট করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
