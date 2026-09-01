'use client';

import React, { useState } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      showTopAlert('আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 800);
  };

  return (
    <>
      <div className="contact-hero">
        <h1>যোগাযোগ করুন (Contact Us)</h1>
        <p>যেকোনো প্রশ্ন, মতামত বা সহায়তার জন্য সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন।</p>
      </div>

      <div className="contact-container">
        {/* Contact Info Cards */}
        <div className="contact-info-wrapper">
          <div className="info-card">
            <div className="info-icon"><i className="fa-solid fa-envelope"></i></div>
            <div className="info-details">
              <h3>ইমেইল সাপোর্ট</h3>
              <p><a href="mailto:support@topmcqbd.com">support@topmcqbd.com</a></p>
            </div>
          </div>

          <div className="info-card wa">
            <div className="info-icon"><i className="fa-brands fa-whatsapp"></i></div>
            <div className="info-details">
              <h3>হোয়াটসঅ্যাপ সাপোর্ট</h3>
              <p><a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer">+880 1700-000000</a></p>
            </div>
          </div>

          <div className="info-card tg">
            <div className="info-icon"><i className="fa-brands fa-telegram"></i></div>
            <div className="info-details">
              <h3>টেলিগ্রাম চ্যানেল</h3>
              <p><a href="https://t.me/topmcqbd" target="_blank" rel="noreferrer">@topmcqbd</a></p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><i className="fa-solid fa-location-dot"></i></div>
            <div className="info-details">
              <h3>ঠিকানা</h3>
              <p>ঢাকা, বাংলাদেশ</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-card">
          <h2 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '20px' }}>
            <i className="fa-solid fa-paper-plane" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            আমাদের সরাসরি বার্তা পাঠান
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>আপনার নাম:</label>
              <input
                type="text"
                placeholder="আপনার নাম লিখুন..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>ইমেইল এড্রেস:</label>
              <input
                type="email"
                placeholder="আপনার ইমেইল লিখুন..."
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>বিষয় (Subject):</label>
              <input
                type="text"
                placeholder="মেসেজের বিষয়..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>আপনার বার্তা (Message):</label>
              <textarea
                rows={4}
                placeholder="বিস্তারিত এখানে লিখুন..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
            </div>

            <button type="submit" disabled={submitting} className="btn-send">
              <i className="fa-solid fa-paper-plane"></i> {submitting ? 'পাঠানো হচ্ছে...' : 'মেসেজ পাঠান'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
