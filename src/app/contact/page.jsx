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
      <style jsx>{`
        .contact-hero {
          background: linear-gradient(135deg, var(--dark, #2c3e50), #1e293b);
          color: white;
          text-align: center;
          padding: 50px 20px;
          margin-bottom: 40px;
        }
        .contact-hero h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 10px;
        }
        .contact-hero p {
          font-size: 16px;
          color: #cbd5e1;
          max-width: 650px;
          margin: 0 auto;
        }
        .contact-container {
          max-width: 1300px;
          margin: 0 auto 60px auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 30px;
        }
        .contact-info-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .info-card {
          background: white;
          padding: 20px 22px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 18px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .info-icon {
          width: 48px;
          height: 48px;
          background: #e0f2fe;
          color: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .info-card.wa .info-icon { background: #dcfce7; color: #25d366; }
        .info-card.tg .info-icon { background: #e0f2fe; color: #0088cc; }
        .info-details h3 {
          font-size: 16px;
          color: var(--dark);
          margin-bottom: 3px;
          font-weight: 700;
        }
        .info-details p, .info-details a {
          font-size: 14px;
          color: #64748b;
          text-decoration: none;
        }
        .contact-form-card {
          background: white;
          padding: 35px 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
        }
        .form-group {
          margin-bottom: 16px;
        }
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #475569;
          font-size: 14px;
        }
        input, textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        input:focus, textarea:focus {
          border-color: var(--primary);
        }
        .btn-send {
          background-color: var(--primary);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s ease;
        }
        .btn-send:hover {
          background-color: var(--primary-dark);
        }
        @media (max-width: 900px) {
          .contact-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

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
