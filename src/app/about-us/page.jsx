'use client';

import React from 'react';

export default function AboutUsPage() {
  return (
    <>
      <style jsx>{`
        .page-banner {
          background: linear-gradient(135deg, var(--dark, #2c3e50), #1a252f);
          color: white;
          padding: 60px 20px;
          text-align: center;
        }
        .page-banner h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
        .page-banner p { font-size: 16px; color: #cbd5e1; }
        
        .content-container { max-width: 1000px; margin: 40px auto; padding: 0 20px; }
        .card-box { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 30px; }
        .card-box h2 { font-size: 22px; color: var(--dark); margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
        .card-box p { font-size: 15px; color: #4a5568; line-height: 1.8; margin-bottom: 15px; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { font-size: 15px; color: #2d3748; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
        .feature-list li i { color: var(--main-dash-btn, #28a745); font-size: 18px; }
      `}</style>

      <div className="page-banner">
        <h1>আমাদের সম্পর্কে (About Us)</h1>
        <p>TopMCQBD - আপনার অনলাইন প্রস্তুতিকে সহজ ও নিখুঁত করতে আমরা সবসময় পাশে আছি</p>
      </div>

      <div className="content-container">
        <div className="card-box">
          <h2><i className="fa-solid fa-graduation-cap" style={{ color: 'var(--primary)' }}></i> TopMCQBD কী?</h2>
          <p>
            TopMCQBD একটি আধুনিক, সহজ এবং বিষয়ভিত্তিক অনলাইন কুইজ ও প্রস্তুতিমূলক প্ল্যাটফর্ম। বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ, বিশ্ববিদ্যালয় ভর্তি পরীক্ষাসহ যেকোনো প্রতিযোগিতামূলক পরীক্ষার জন্য নিজেকে সঠিকভাবে প্রস্তুত করতে TopMCQBD সাহায্য করে।
          </p>
        </div>

        <div className="card-box">
          <h2><i className="fa-solid fa-star" style={{ color: 'var(--warning)' }}></i> কেন TopMCQBD সেরা?</h2>
          <ul className="feature-list">
            <li><i className="fa-solid fa-circle-check"></i> টপিকভিত্তিক মডেল টেস্ট এবং লাইভ টাইমার রিয়েল এক্সাম এক্সপেরিয়েন্স দেয়।</li>
            <li><i className="fa-solid fa-circle-check"></i> প্রতিটি প্রশ্নের সাথে রয়েছে নির্ভুল ও বিস্তৃত ব্যাখ্যামূলক সমাধান।</li>
            <li><i className="fa-solid fa-circle-check"></i> তাত্ক্ষণিক রেজাল্ট এবং নিজের অবস্থান যাচাই করার সুবিধা।</li>
            <li><i className="fa-solid fa-circle-check"></i> নতুন নতুন কুইজ ও প্রশ্ন নিয়মিত আপডেট করা হয়।</li>
          </ul>
        </div>
      </div>
    </>
  );
}
