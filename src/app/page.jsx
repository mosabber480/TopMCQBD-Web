'use client';

import React from 'react';

export default function HomePage() {
  return (
    <main className="home-wrapper">
      {/* Background Ambient Elements */}
      <div className="bg-grid-pattern" />
      <div className="glow-orb orb-top-center" />
      <div className="glow-orb orb-bottom-left" />
      <div className="glow-orb orb-bottom-right" />

      {/* Hero Center Section */}
      <section className="hero-center">
        {/* Clean Logo Directly without Box */}
        <div className="logo-direct-container">
          <img
            src="/images/TopMCQ.png"
            alt="TopMCQBD Logo"
            className="logo-direct-img"
          />
        </div>

        {/* Brand Heading */}
        <h1 className="brand-heading">
          TopMCQ<span>BD</span>
        </h1>

        {/* Bangla Subtitle Text */}
        <p className="bangla-tagline">
          বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য একটি আধুনিক ও স্বয়ংসম্পূর্ণ অনলাইন প্রস্তুতি প্ল্যাটফর্ম।
        </p>

        {/* Coming Soon Badge */}
        <div className="coming-soon-pill">
          <span className="live-indicator-light"></span>
          <span className="coming-soon-text">Coming Soon</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
          <span className="coming-soon-bn">শীঘ্রই আসছি</span>
        </div>

        {/* Feature Highlights Grid */}
        <div className="feature-grid">
          <div className="feature-box">
            <span className="feature-icon">🎯</span>
            <span className="feature-title">বিষয়ভিত্তিক MCQ</span>
          </div>
          <div className="feature-box">
            <span className="feature-icon">⏱️</span>
            <span className="feature-title">লাইভ মডেল টেস্ট</span>
          </div>
          <div className="feature-box">
            <span className="feature-icon">📊</span>
            <span className="feature-title">রিয়েলটাইম অ্যানালিটিক্স</span>
          </div>
          <div className="feature-box">
            <span className="feature-icon">🏆</span>
            <span className="feature-title">জাতীয় মেধা তালিকা</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-bar">
        <p>© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </main>
  );
}
