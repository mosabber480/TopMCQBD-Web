import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '404 - পৃষ্ঠাটি খুঁজে পাওয়া যায়নি | TopMCQBD',
  description: 'দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা খুঁজে পাওয়া যায়নি।'
};

export default function NotFound() {
  return (
    <div className="not-found-wrapper">
      <div className="not-found-card">
        {/* 404 Headline */}
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি!</h1>
        <p className="not-found-desc">
          দুঃখিত, আপনি যে পৃষ্ঠা বা লিঙ্কটি খুঁজছেন তা হয়তো সরানো হয়েছে, লিঙ্কটি পরিবর্তন করা হয়েছে বা সাময়িকভাবে অনুপলব্ধ।
        </p>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <Link href="/" className="not-found-btn-primary">
            <i className="fa-solid fa-house"></i> হোম পেজে ফিরে যান
          </Link>
          <Link href="/all-mcq" className="not-found-btn-secondary">
            <i className="fa-solid fa-layer-group"></i> সকল MCQ ক্যাটাগরি
          </Link>
          <Link href="/contact" className="not-found-btn-secondary">
            <i className="fa-solid fa-headset"></i> সাপোর্ট ও যোগাযোগ
          </Link>
        </div>

        {/* Quick Navigation Cards */}
        <div className="not-found-quick-links">
          <div className="not-found-quick-title">প্রয়োজনীয় কিছু লিঙ্ক</div>
          <div className="not-found-grid">
            <Link href="/questions" className="not-found-grid-item">
              <div className="not-found-grid-icon">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <span className="not-found-grid-text">কুইজ প্রস্তুতি</span>
              <span className="not-found-grid-sub">বিষয়ভিত্তিক প্রশ্নব্যাংক</span>
            </Link>

            <Link href="/packages" className="not-found-grid-item">
              <div className="not-found-grid-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <i className="fa-solid fa-crown"></i>
              </div>
              <span className="not-found-grid-text">প্যাকেজসমূহ</span>
              <span className="not-found-grid-sub">প্রিমিয়াম প্ল্যান</span>
            </Link>

            <Link href="/free-mcqs" className="not-found-grid-item">
              <div className="not-found-grid-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <i className="fa-solid fa-gift"></i>
              </div>
              <span className="not-found-grid-text">ফ্রি এমসিকিউ</span>
              <span className="not-found-grid-sub">মডেল টেস্ট প্র্যাকটিস</span>
            </Link>

            <Link href="/faq" className="not-found-grid-item">
              <div className="not-found-grid-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <i className="fa-solid fa-circle-question"></i>
              </div>
              <span className="not-found-grid-text">সহায়িকা ও FAQ</span>
              <span className="not-found-grid-sub">সাধারণ প্রশ্ন ও উত্তর</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
