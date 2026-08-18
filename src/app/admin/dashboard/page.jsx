'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOverviewDashboard() {
  const [userName, setUserName] = useState('অ্যাডমিন');

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}');
      if (u && u.name) {
        setUserName(u.name);
      }
    } catch (e) {}
  }, []);

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 30px 25px' }}>
      <style jsx>{`
        :root {
          --primary: #007bff;
          --primary-dark: #0056b3;
          --secondary: #17a2b8;
          --warning: #ff9f43;
          --danger: #dc3545;
          --dark: #2c3e50;
          --light: #f4f7f6;
          --gray-btn: #6c757d;
          --main-dash-btn: #28a745;
          --purple-btn: #6f42c1;
        }

        .welcome-card {
          background: white;
          padding: 25px 30px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 15px;
        }
        .welcome-text h2 {
          margin: 0 0 5px 0;
          color: var(--dark, #2c3e50);
          font-size: 22px;
          font-weight: 700;
        }
        .welcome-text p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .card {
          background: white;
          border-radius: 10px;
          padding: 25px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          min-height: 220px;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .card-icon {
          font-size: 34px;
          margin-bottom: 14px;
        }
        .card h3 {
          margin: 0 0 8px 0;
          color: var(--dark, #2c3e50);
          font-size: 18px;
          font-weight: 700;
        }
        .card p {
          color: #64748b;
          font-size: 13.5px;
          line-height: 1.55;
          margin-bottom: 20px;
        }
        .btn {
          padding: 10px 15px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13.5px;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
          transition: opacity 0.2s ease;
          border: none;
        }
        .btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 992px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Welcome Banner */}
      <div className="welcome-card">
        <div className="welcome-text">
          <h2>
            স্বাগতম, <span style={{ color: 'var(--primary, #007bff)' }}>{userName}</span>! 👋
          </h2>
          <p>TopMCQBD-এর সেন্ট্রাল অ্যাডমিন কন্ট্রোল প্যানেলে আপনাকে স্বাগতম। কন্টেন্ট ও ডেটা এক জায়গা থেকেই নিয়ন্ত্রণ করুন।</p>
        </div>
        <div>
          <Link href="/admin/admin-profile" className="btn" style={{ background: 'var(--dark, #2c3e50)', color: 'white' }}>
            <i className="fa-solid fa-user-shield"></i> অ্যাডমিন প্রোফাইল
          </Link>
        </div>
      </div>

      {/* Feature Grid - STRICTLY 3 CARDS PER ROW ON DESKTOP */}
      <div className="grid">
        {/* ১. হেডার কন্ট্রোল */}
        <div className="card" style={{ border: '2px solid var(--purple-btn, #6f42c1)', background: '#fcfaff' }}>
          <div>
            <div className="card-icon" style={{ color: 'var(--purple-btn, #6f42c1)' }}>
              <i className="fa-solid fa-window-restore"></i>
            </div>
            <h3>হেডার কন্ট্রোল</h3>
            <p>ওয়েবসাইটের টপ অ্যানাউন্সমেন্ট বার, লোগো, টাইটেল, হেডার বাটন এবং নেভিগেশন মেনু পরিচালনা করুন।</p>
          </div>
          <Link href="/admin/header-dashboard" className="btn" style={{ backgroundColor: 'var(--purple-btn, #6f42c1)', color: 'white' }}>
            <i className="fa-solid fa-gear"></i> হেডার এডিট
          </Link>
        </div>

        {/* ২. ফুটার কন্ট্রোল */}
        <div className="card" style={{ border: '2px solid var(--secondary, #17a2b8)', background: '#f2fafb' }}>
          <div>
            <div className="card-icon" style={{ color: 'var(--secondary, #17a2b8)' }}>
              <i className="fa-solid fa-table-columns"></i>
            </div>
            <h3>ফুটার কন্ট্রোল</h3>
            <p>ওয়েবসাইটের ফুটারের ৪টি কলাম, সোশ্যাল লিংক এবং কপিরাইট টেক্সট পরিচালনা করুন।</p>
          </div>
          <Link href="/admin/footer-dashboard" className="btn" style={{ backgroundColor: 'var(--secondary, #17a2b8)', color: 'white' }}>
            <i className="fa-solid fa-gear"></i> ফুটার এডিট
          </Link>
        </div>

        {/* ৩. হোম পেজ কন্ট্রোল */}
        <div className="card" style={{ border: '2px solid var(--warning, #ff9f43)', background: '#fffdfa' }}>
          <div>
            <div className="card-icon" style={{ color: 'var(--warning, #ff9f43)' }}>
              <i className="fa-solid fa-sliders"></i>
            </div>
            <h3>হোম পেজ কন্ট্রোল</h3>
            <p>হোম পেজের স্লাইডার, ফ্রি ডেমো কুইজ লিংক এবং প্রিপারেশন প্যাকেজগুলো ডাটাবেজ থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <Link href="/admin/home-dashboard" className="btn" style={{ backgroundColor: 'var(--warning, #ff9f43)', color: 'white' }}>
            <i className="fa-solid fa-pen-to-square"></i> কন্টেন্ট এডিট করুন
          </Link>
        </div>

        {/* ৪. আমাদের সম্পর্কে */}
        <div className="card" style={{ border: '2px solid #20c997', background: '#f4fbf8' }}>
          <div>
            <div className="card-icon" style={{ color: '#20c997' }}>
              <i className="fa-solid fa-address-card"></i>
            </div>
            <h3>আমাদের সম্পর্কে</h3>
            <p>আমাদের প্রতিষ্ঠানের লক্ষ্য, উদ্দেশ্য এবং বিশেষ সুবিধাসমূহ কাস্টমাইজ করুন।</p>
          </div>
          <Link href="/admin/about-dashboard" className="btn" style={{ backgroundColor: '#20c997', color: 'white' }}>
            <i className="fa-solid fa-pen-to-square"></i> পেজটি এডিট করুন
          </Link>
        </div>

        {/* ৫. প্রশ্ন ব্যাংক ও কুইজ */}
        <div className="card" style={{ border: '2px solid var(--primary, #007bff)', background: '#f4f8ff' }}>
          <div>
            <div className="card-icon" style={{ color: 'var(--primary, #007bff)' }}>
              <i className="fa-solid fa-file-circle-question"></i>
            </div>
            <h3>প্রশ্ন ব্যাংক ও কুইজ</h3>
            <p>নতুন কুইজের প্রশ্ন যোগ করুন, সংশোধন করুন বা CSV ফাইল আপলোড করে এক ক্লিকে ডাটাবেজে সেভ করুন।</p>
          </div>
          <Link href="/admin/questions-dashboard" className="btn" style={{ backgroundColor: 'var(--primary, #007bff)', color: 'white' }}>
            <i className="fa-solid fa-gear"></i> প্রশ্ন ম্যানেজ করুন
          </Link>
        </div>

        {/* ৬. প্যাকেজসমূহ পেজ */}
        <div className="card" style={{ border: '2px solid #6366f1', background: '#f5f5fe' }}>
          <div>
            <div className="card-icon" style={{ color: '#6366f1' }}>
              <i className="fa-solid fa-box-open"></i>
            </div>
            <h3>প্যাকেজসমূহ পেজ</h3>
            <p>সকল প্রিপারেশন প্যাকেজের তথ্য ও মূল্য এডিট ও কাস্টমাইজ করুন।</p>
          </div>
          <Link href="/admin/packages-dashboard" className="btn" style={{ backgroundColor: '#6366f1', color: 'white' }}>
            <i className="fa-solid fa-pen-to-square"></i> পেজটি এডিট করুন
          </Link>
        </div>

        {/* ৭. ইউজার ও সাবস্ক্রিপশন */}
        <div className="card" style={{ border: '2px solid var(--secondary, #17a2b8)', background: '#f2fafb' }}>
          <div>
            <div className="card-icon" style={{ color: 'var(--secondary, #17a2b8)' }}>
              <i className="fa-solid fa-users-gear"></i>
            </div>
            <h3>ইউজার ও সাবস্ক্রিপশন</h3>
            <p>সকল রেজিস্টার্ড ব্যবহারকারীদের দেখুন, তাদের সাবস্ক্রিপশন অনুমোদন ও প্ল্যান ম্যানেজ করুন।</p>
          </div>
          <Link href="/admin/users" className="btn" style={{ backgroundColor: 'var(--secondary, #17a2b8)', color: 'white' }}>
            <i className="fa-solid fa-users"></i> ইউজারদের তালিকা
          </Link>
        </div>

        {/* ৮. রিফান্ড ও পেমেন্ট পলিসি */}
        <div className="card" style={{ border: '2px solid #e83e8c', background: '#fff9fc' }}>
          <div>
            <div className="card-icon" style={{ color: '#e83e8c' }}>
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <h3>রিফান্ড ও পেমেন্ট পলিসি</h3>
            <p>পেমেন্ট ও রিফান্ড সংক্রান্ত নিয়মাবলী পরিবর্তন ও সংরক্ষণ করুন।</p>
          </div>
          <Link href="/admin/policy-dashboard" className="btn" style={{ backgroundColor: '#e83e8c', color: 'white' }}>
            <i className="fa-solid fa-pen-to-square"></i> পেজটি এডিট করুন
          </Link>
        </div>

        {/* ৯. সাইডবার মেনু কন্ট্রোল */}
        <div className="card" style={{ border: '2px solid #475569', background: '#f8fafc' }}>
          <div>
            <div className="card-icon" style={{ color: '#475569' }}>
              <i className="fa-solid fa-list-check"></i>
            </div>
            <h3>সাইডবার মেনু কন্ট্রোল</h3>
            <p>অ্যাডমিন প্যানেলের বামপাশের সাইডবার মেনু ও লিংকগুলো সাজান ও কাস্টমাইজ করুন।</p>
          </div>
          <Link href="/admin/admin-menu-dashboard" className="btn" style={{ backgroundColor: '#475569', color: 'white' }}>
            <i className="fa-solid fa-sliders"></i> মেনু এডিট করুন
          </Link>
        </div>

        {/* ১০. ফ্রি এমসিকিউ কন্ট্রোল */}
        <div className="card" style={{ border: '2px solid #28a745', background: '#f4fbf8' }}>
          <div>
            <div className="card-icon" style={{ color: '#28a745' }}>
              <i className="fa-solid fa-gift"></i>
            </div>
            <h3>ফ্রি এমসিকিউ কন্ট্রোল</h3>
            <p>ফ্রি ডেমো কুইজ ও ফ্রি এমসিকিউ ডেটাবেজ কনফিগারেশন ম্যানেজ করুন।</p>
          </div>
          <Link href="/admin/free-mcqs-dashboard" className="btn" style={{ backgroundColor: '#28a745', color: 'white' }}>
            <i className="fa-solid fa-gear"></i> ফ্রি কুইজ ম্যানেজ
          </Link>
        </div>
      </div>
    </div>
  );
}
