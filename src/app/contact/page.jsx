'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showTopAlert('অনুগ্রহ করে নাম, ইমেইল ও বার্তার বিবরণ পূরণ করুন।', 'warning');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      showTopAlert('✅ আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! আমাদের সাপোর্ট টিম শীঘ্রই যোগাযোগ করবে।', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'general',
        subject: '',
        message: ''
      });
      setSubmitting(false);
    }, 900);
  };

  const faqs = [
    {
      q: 'পেমেন্ট সম্পন্ন করার কতক্ষণ পর কোর্স/মডেল টেস্ট অ্যাক্টিভ হবে?',
      a: 'বিকাশ বা নগদ-এর মাধ্যমে পেমেন্ট করে TrxID সাবমিট করার ৫ থেকে ১৫ মিনিটের মধ্যে স্বয়ংক্রিয়ভাবে বা অ্যাডমিন যাচাইকরণের মাধ্যমে আপনার প্যাকেজ অ্যাক্টিভ হয়ে যাবে।'
    },
    {
      q: 'লাইভ মডেল টেস্টে কোনো কারিগরি ত্রুটি দেখা দিলে কার সাথে যোগাযোগ করব?',
      a: 'আমাদের অফিশিয়াল হোয়াটসঅ্যাপ হটলাইনে (+880 1700-000000) অথবা সাপোর্ট ইমেইলে স্ক্রিনশট সহ মেসেজ দিলে তাৎক্ষণিক সহায়তা পাবেন।'
    },
    {
      q: 'সাপোর্ট সেন্টারের কার্যকাল কখন?',
      a: 'আমাদের হেল্পডেস্ক ও অনলাইন সাপোর্ট প্রতিদিন সকাল ৯:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত সরাসরি সক্রিয় থাকে।'
    }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* 1. Hero Header Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
        color: '#ffffff',
        padding: '50px 20px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        {/* Subtle decorative glow circles */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '10%',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.12)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          right: '10%',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}></div>

        <div style={{ maxWidth: '1300px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: '#e2e8f0',
            marginBottom: '18px',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <Link href="/" style={{ color: '#93c5fd', textDecoration: 'none' }}>হোম</Link>
            <span>/</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>যোগাযোগ</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            আমাদের সাথে যোগাযোগ করুন
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto 20px auto' }}>
            বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক বা যেকোনো মডেল টেস্ট প্রস্তুতি সংক্রান্ত যেকোনো জিজ্ঞাসা, পরামর্শ বা সহায়তায় আমাদের টিম সার্বক্ষণিক প্রস্তুত।
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '8px 18px',
            borderRadius: '30px',
            fontSize: '0.88rem',
            color: '#34d399',
            fontWeight: 700
          }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981' }}></span>
            হেল্পডেস্ক ও অনলাইন সাপোর্ট টিম সক্রিয়
          </div>
        </div>
      </section>

      {/* 2. Top Fast Contact Highlights */}
      <div style={{ maxWidth: '1300px', margin: '-30px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 3 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: Fast Email */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              <i className="fa-solid fa-envelope-open-text"></i>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>অফিশিয়াল ইমেইল</div>
              <a href="mailto:support@topmcqbd.com" style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, textDecoration: 'none', display: 'block', marginTop: '2px' }}>
                support@topmcqbd.com
              </a>
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '3px', fontWeight: 600 }}>⚡ দ্রুত রেসপন্স গ্যারান্টি</div>
            </div>
          </div>

          {/* Card 2: WhatsApp */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              <i className="fa-brands fa-whatsapp"></i>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>হোয়াটসঅ্যাপ হটলাইন</div>
              <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer" style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, textDecoration: 'none', display: 'block', marginTop: '2px' }}>
                +880 1700-000000
              </a>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '3px', fontWeight: 600 }}>💬 লাইভ চ্যাট সাপোর্ট</div>
            </div>
          </div>

          {/* Card 3: Support Hours */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              <i className="fa-regular fa-clock"></i>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>অফিস ও সেবা সময়</div>
              <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800, marginTop: '2px' }}>
                সকাল ৯:০০ - রাত ১০:০০
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>প্রতিদিন (সপ্তাহে ৭ দিন)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Form & Details Two-Column Grid */}
      <div style={{ maxWidth: '1300px', margin: '0 auto 50px auto', padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '30px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Direct Connect & Location Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{
              backgroundColor: '#ffffff',
              padding: '30px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)'
            }}>
              <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}>
                আমাদের সাপোর্ট চ্যানেলসমূহ
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
                আপনার সুবিধাজনক যেকোনো মাধ্যমে আমাদের টিমকে বার্তা পাঠাতে পারেন।
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Channel 1 */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    <i className="fa-solid fa-headset"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>কাস্টমার কেয়ার</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>টোল ফ্রি হেল্পলাইন: +880 1700-000000</p>
                  </div>
                </div>

                {/* Channel 2 */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    <i className="fa-brands fa-telegram"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>টেলিগ্রাম কমিউনিটি</h4>
                    <a href="https://t.me/topmcqbd" target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                      t.me/topmcqbd ↗
                    </a>
                  </div>
                </div>

                {/* Channel 3 */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>প্রধান কার্যালয়</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>ধানমন্ডি, ঢাকা - ১২০৯, বাংলাদেশ</p>
                  </div>
                </div>

              </div>

              {/* Social Links */}
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700, marginBottom: '12px' }}>
                  সোশ্যাল মিডিয়ায় যুক্ত থাকুন:
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                    <i className="fa-brands fa-youtube"></i>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                    <i className="fa-brands fa-linkedin-in"></i>
                  </a>
                  <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer" style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                    <i className="fa-brands fa-whatsapp"></i>
                  </a>
                </div>
              </div>

            </div>

            {/* Quick Policy Notice Box */}
            <div style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '24px',
              borderRadius: '20px',
              boxShadow: '0 4px 15px rgba(15, 23, 42, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>নিরাপদ সেবা ও রিফান্ড নীতি</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '14px' }}>
                আমাদের যেকোনো সেবা বা প্যাকেজে কোনো অসঙ্গতি দেখা দিলে আমাদের নীতিমালা অনুযায়ী দ্রুত সমাধানের নিশ্চয়তা রয়েছে।
              </p>
              <Link href="/privacy-and-refund-policy" style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                রিফান্ড ও প্রাইভেসি পলিসি পড়ুন →
              </Link>
            </div>

          </div>

          {/* Right Column: Premium Interactive Contact Form */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '36px 30px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                সরাসরি মেসেজ পাঠান
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '24px' }}>
              ফর্মটি পূরণ করে আপনার প্রশ্নটি পাঠান, আমরা দ্রুততম সময়ে আপনার সাথে যোগাযোগ করব।
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Row 1: Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    আপনার নাম <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Email & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    ইমেইল এড্রেস <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    জিজ্ঞাসার বিষয়/বিভাগ
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="general">সাধারণ তথ্য ও পরামর্শ</option>
                    <option value="package">প্যাকেজ ও সাবস্ক্রিপশন</option>
                    <option value="payment">পেমেন্ট / বিকাশ / TrxID সংক্রান্ত</option>
                    <option value="live-exam">লাইভ মডেল টেস্ট সহায়তা</option>
                    <option value="technical">টেকনিক্যাল বা একাউন্ট সমস্যা</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  বিষয় (Subject)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ৪৬তম বিসিএস লাইভ মডেল টেস্ট এক্সেস সমস্যা..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  আপনার বার্তা / বিস্তারিত বিবরণ <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="আপনার জিজ্ঞাসা বা সমস্যার বিস্তারিত এখানে লিখুন..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    backgroundColor: '#ffffff'
                  }}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '13px 26px',
                  borderRadius: '10px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  transition: 'background-color 0.2s, transform 0.1s',
                  marginTop: '6px'
                }}
              >
                <i className="fa-solid fa-paper-plane"></i>
                {submitting ? 'বার্তা পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
              </button>

            </form>
          </div>

        </div>
      </div>

      {/* 4. Mini FAQ Accordion Section */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            সাধারণ কিছু প্রশ্নোত্তর (FAQ)
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            যোগাযোগের পূর্বে সাধারণ বিষয়গুলোর উত্তর এখানে পেতে পারেন
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '1.2rem', color: '#0284c7', fontWeight: 800, marginLeft: '12px' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 18px 20px', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
