'use client';

import React, { useState } from 'react';

const faqs = [
  {
    q: 'TopMCQBD কী এবং কীভাবে কাজ করে?',
    a: 'TopMCQBD একটি স্বয়ংসম্পূর্ণ অনলাইন এমসিকিউ ও মডেল টেস্ট প্ল্যাটফর্ম। এখানে বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য অধ্যায়ভিত্তিক ও বিষয়ভিত্তিক নির্ভুল প্রশ্ন ও ব্যাখ্যা অনুশীলন করা যায়।'
  },
  {
    q: 'আমি কীভাবে প্রিমিয়াম প্যাকেজ সাবস্ক্রাইব করব?',
    a: 'প্যাকেজেস পেজে গিয়ে আপনার পছন্দের প্যাকেজের নিচে "এই প্যাকেজটি নিন" বাটনে ক্লিক করুন। এরপর বিকাশ বা নগদ নম্বরে সেন্ড মানি করে ট্রানজেকশন আইডি ও নম্বরটি দিয়ে ফর্ম জমা দিন। অ্যাডমিন যাচাই করে প্যাকেজ চালু করে দেবেন।'
  },
  {
    q: 'কুইজে কি নেগেটিভ মার্কিং আছে?',
    a: 'হ্যাঁ, প্রতিটি ভুল উত্তরের জন্য ০.৫ নম্বর কাটা যাবে। তবে আপনি "আগে পড়ুন" (Read Mode) অপশন চালু করে পরীক্ষা দেওয়ার আগে সব প্রশ্নের সঠিক উত্তর ও ব্যাখ্যা এক নজরে পড়ে নিতে পারবেন।'
  },
  {
    q: 'পাসওয়ার্ড ভুলে গেলে কী করব?',
    a: 'লগইন পেজে "পাসওয়ার্ড ভুলে গেছেন?" লিংকে ক্লিক করে আপনার নিবন্ধিত ইমেইল দিন। আপনার ইমেইলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হবে যার মাধ্যমে নতুন পাসওয়ার্ড সেট করতে পারবেন।'
  },
  {
    q: 'সাবস্ক্রিপশনের মেয়াদ কি একাধিকবার যোগ করা যায়?',
    a: 'হ্যাঁ! আপনার একটি সক্রিয় প্যাকেজ চলাকালীন নতুন কোনো প্যাকেজ রিকোয়েস্ট অনুমোদন পেলে আগের মেয়াদের সাথে নতুন মেয়াদ স্বয়ংক্রিয়ভাবে যুক্ত হয়ে যাবে।'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

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
        .faq-container {
          max-width: 900px;
          margin: 50px auto 70px auto;
          padding: 0 20px;
        }
        .faq-item {
          background: white;
          border-radius: 10px;
          margin-bottom: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }
        .faq-question {
          padding: 20px 25px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-size: 16px;
          color: var(--dark);
          user-select: none;
        }
        .faq-question:hover {
          background: #f8fafc;
        }
        .faq-answer {
          padding: 0 25px 20px 25px;
          color: #4a5568;
          font-size: 14.5px;
          line-height: 1.7;
        }
      `}</style>

      <div className="page-banner">
        <h1>সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</h1>
        <p>TopMCQBD সম্পর্কিত সাধারণ কিছু প্রশ্নের উত্তর জেনে নিন</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={index} className="faq-item">
              <div
                className="faq-question"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>
                  <i className="fa-solid fa-circle-question" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                  {faq.q}
                </span>
                <i className={`fa-solid ${isOpen ? 'fa-angle-up' : 'fa-angle-down'}`} style={{ color: '#888' }}></i>
              </div>

              {isOpen && (
                <div className="faq-answer">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
