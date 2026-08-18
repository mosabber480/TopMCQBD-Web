'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';

const DEFAULT_PACKAGES = [
  {
    id: '1_month',
    title: '১ মাস মেয়াদী',
    price: '৳১০',
    duration: '/ ৩০ দিন',
    badge: 'শুরু',
    themeColor: '#6f42c1',
    themeBg: '#fcfaff',
    features: [
      'সকল বিষয়ের পূর্ণ অ্যাক্সেস',
      'সকল মডেল টেস্ট',
      'ব্যাখ্যাসহ সঠিক উত্তর',
      'নতুন প্রশ্ন নিয়মিত আপডেট',
      'পারফরম্যান্স রিপোর্ট',
      'মোবাইল ও কম্পিউটার থেকে ব্যবহার'
    ],
    note: 'পার্থক্য শুধুমাত্র সাবস্ক্রিপশনের মেয়াদে। সকল প্ল্যানে একই সুবিধা পাওয়া যাবে।'
  },
  {
    id: '3_months',
    title: '৩ মাস মেয়াদী',
    price: '৳২০',
    duration: '/ ৯০ দিন',
    badge: 'জনপ্রিয়',
    themeColor: '#fd7e14',
    themeBg: '#fffdfa',
    features: [
      'সকল বিষয়ের পূর্ণ অ্যাক্সেস',
      'সকল মডেল টেস্ট',
      'ব্যাখ্যাসহ সঠিক উত্তর',
      'নতুন প্রশ্ন নিয়মিত আপডেট',
      'পারফরম্যান্স রিপোর্ট',
      'মোবাইল ও কম্পিউটার থেকে ব্যবহার'
    ],
    note: 'পার্থক্য শুধুমাত্র সাবস্ক্রিপশনের মেয়াদে। সকল প্ল্যানে একই সুবিধা পাওয়া যাবে।'
  },
  {
    id: '6_months',
    title: '৬ মাস মেয়াদী',
    price: '৳৩০',
    duration: '/ ১৮০ দিন',
    badge: 'সবচেয়ে জনপ্রিয়',
    themeColor: '#20c997',
    themeBg: '#f4fbf8',
    features: [
      'সকল বিষয়ের পূর্ণ অ্যাক্সেস',
      'সকল মডেল টেস্ট',
      'ব্যাখ্যাসহ সঠিক উত্তর',
      'নতুন প্রশ্ন নিয়মিত আপডেট',
      'পারফরম্যান্স রিপোর্ট',
      'মোবাইল ও কম্পিউটার থেকে ব্যবহার'
    ],
    note: 'পার্থক্য শুধুমাত্র সাবক্রিপশনের মেয়াদে। সকল প্ল্যানে একই সুবিধা পাওয়া যাবে।'
  },
  {
    id: '1_year',
    title: '১ বছর মেয়াদী',
    price: '৳৫০',
    duration: '/ ৩৬৫ দিন',
    badge: 'সাশ্রয়ী',
    themeColor: '#007bff',
    themeBg: '#f4f8ff',
    features: [
      'সকল বিষয়ের পূর্ণ অ্যাক্সেস',
      'সকল মডেল টেস্ট',
      'ব্যাখ্যাসহ সঠিক উত্তর',
      'নতুন প্রশ্ন নিয়মিত আপডেট',
      'পারফরম্যান্স রিপোর্ট',
      'মোবাইল ও কম্পিউটার থেকে ব্যবহার'
    ],
    note: 'পার্থক্য শুধুমাত্র সাবস্ক্রিপশনের মেয়াদে। সকল প্ল্যানে একই সুবিধা পাওয়া যাবে।'
  },
  {
    id: '2_years',
    title: '২ বছর মেয়াদী',
    price: '৳৮০',
    duration: '/ ৭৩০ দিন',
    badge: 'বেশি সাশ্রয়',
    themeColor: '#6366f1',
    themeBg: '#f5f5fe',
    features: [
      'সকল বিষয়ের পূর্ণ অ্যাক্সেস',
      'সকল মডেল টেস্ট',
      'ব্যাখ্যাসহ সঠিক উত্তর',
      'নতুন প্রশ্ন নিয়মিত আপডেট',
      'পারফরম্যান্স রিপোর্ট',
      'মোবাইল ও কম্পিউটার থেকে ব্যবহার'
    ],
    note: 'পার্থক্য শুধুমাত্র সাবস্ক্রিপশনের মেয়াদে। সকল প্ল্যানে একই সুবিধা পাওয়া যাবে।'
  },
  {
    id: '3_years',
    title: '৩ বছর মেয়াদী',
    price: '৳১০০',
    duration: '/ ১০৯৫ দিন',
    badge: 'সর্বোচ্চ সাশ্রয়',
    themeColor: '#17a2b8',
    themeBg: '#f2fafb',
    features: [
      'সকল বিষয়ের পূর্ণ অ্যাক্সেস',
      'সকল মডেল টেস্ট',
      'ব্যাখ্যাসহ সঠিক উত্তর',
      'নতুন প্রশ্ন নিয়মিত আপডেট',
      'পারফরম্যান্স রিপোর্ট',
      'মোবাইল ও কম্পিউটার থেকে ব্যবহার'
    ],
    note: 'পার্থক্য শুধুমাত্র সাবস্ক্রিপশনের মেয়াদে। সকল প্ল্যানে একই সুবিধা পাওয়া যাবে।'
  }
];

export default function PackagesPage() {
  const router = useRouter();

  // Modals state
  const [activeConfirmModal, setActiveConfirmModal] = useState({
    open: false,
    desc: '',
    planType: ''
  });

  const [choiceModal, setChoiceModal] = useState({
    open: false,
    desc: '',
    planType: '',
    lastPendingId: null
  });

  const [paymentModal, setPaymentModal] = useState({
    open: false,
    planType: '',
    action: 'new', // 'new' | 'add' | 'change' | 'renew'
    requestId: null,
    phone: '',
    transactionId: '',
    paymentMethod: 'bkash'
  });

  const [loadingBtnId, setLoadingBtnId] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const planLabelBn = (plan) => (plan || '').replace('_', ' ').toUpperCase();

  const fetchCurrentUserState = async () => {
    const token = localStorage.getItem('quiz_token') || localStorage.getItem('token');
    const res = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch user state');
    return data.user;
  };

  const handlePackageBuy = async (planType) => {
    const token = localStorage.getItem('quiz_token') || localStorage.getItem('token');

    if (!token) {
      await showTopAlert('প্যাকেজটি কিনতে আপনাকে প্রথমে লগইন করতে হবে।', 'warning');
      router.push('/login');
      return;
    }

    setLoadingBtnId(planType);

    try {
      const user = await fetchCurrentUserState();
      const sub = user.subscription || {};
      const isSubActive = sub.active && sub.endDate && new Date(sub.endDate) > new Date();
      const pending = (user.pendingRequests || []).filter((r) => r.status === 'pending');

      if (isSubActive) {
        setActiveConfirmModal({
          open: true,
          planType,
          desc: `আপনার বর্তমানে ${planLabelBn(sub.plan)} প্ল্যান একটিভ আছে, যার মেয়াদ শেষ হবে ${new Date(
            sub.endDate
          ).toLocaleDateString('bn-BD')} তারিখে। আপনি কি এই মেয়াদের উপর ${planLabelBn(
            planType
          )} প্ল্যান যোগ করার (মেয়াদ বাড়ানোর) রিকোয়েস্ট পাঠাতে চান?`
        });
      } else if (pending.length > 0) {
        const lastPending = pending[pending.length - 1];
        setChoiceModal({
          open: true,
          planType,
          lastPendingId: lastPending._id,
          desc: `আপনার সর্বশেষ Pending রিকোয়েস্ট: <b>${planLabelBn(lastPending.plan)}</b>। এখন <b>${planLabelBn(
            planType
          )}</b> প্যাকেজের জন্য আপনি কী করতে চান?`
        });
      } else {
        setPaymentModal({
          open: true,
          planType,
          action: 'new',
          requestId: null,
          phone: '',
          transactionId: '',
          paymentMethod: 'bkash'
        });
      }
    } catch (err) {
      showTopAlert('ইউজার ডাটা যাচাই করতে সমস্যা হয়েছে!', 'danger');
    } finally {
      setLoadingBtnId(null);
    }
  };

  const handleSubmitPaymentForm = async (e) => {
    e.preventDefault();
    if (!paymentModal.phone || !paymentModal.transactionId || !paymentModal.paymentMethod) {
      showTopAlert('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন!', 'warning');
      return;
    }

    setSubmittingPayment(true);
    const token = localStorage.getItem('quiz_token') || localStorage.getItem('token');

    try {
      const res = await fetch('/api/users/request-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: paymentModal.planType,
          action: paymentModal.action,
          requestId: paymentModal.requestId,
          paymentMethod: paymentModal.paymentMethod,
          phone: paymentModal.phone.trim(),
          transactionId: paymentModal.transactionId.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('🎉 আপনার পেমেন্ট রিকোয়েস্ট জমা হয়েছে! অ্যাডমিন দ্রুত যাচাই করে একটিভ করে দেবেন।', 'success');
        setPaymentModal({ ...paymentModal, open: false });
        router.push('/profile');
      } else {
        showTopAlert(`❌ ${data.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে!'}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে!', 'danger');
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <>
      <style jsx>{`
        /* Banner Container Adjustment */
        .page-banner {
          background: linear-gradient(135deg, var(--dark, #2c3e50), #1a252f);
          color: white;
          padding: 60px 20px;
          text-align: center;
        }
        .banner-content {
          max-width: 1300px;
          margin: 0 auto;
        }
        .page-banner h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 10px;
        }
        .page-banner p {
          font-size: 16px;
          color: #cbd5e1;
        }

        /* Packages Container Adjustment - Exactly 3 columns on Desktop */
        .packages-container {
          max-width: 1300px;
          margin: 60px auto 90px auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 46px 42px;
        }

        /* Responsive Settings for Tablet & Mobile */
        @media (max-width: 992px) {
          .packages-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .packages-container {
            grid-template-columns: 1fr;
          }
        }

        /* Dynamic Color Integration */
        .package-card {
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          padding: 30px 25px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .package-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .pkg-title {
          font-size: 22px;
          color: var(--dark, #2c3e50);
          font-weight: 700;
          margin-bottom: 15px;
        }

        .pkg-price {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .pkg-price span {
          font-size: 14px;
          color: #718096;
          font-weight: normal;
        }

        .pkg-features {
          list-style: none;
          padding: 0;
          margin: 0 0 15px 0;
          text-align: left;
        }

        .pkg-features li {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pkg-note {
          font-size: 12.5px;
          color: #64748b;
          text-align: left;
          margin-bottom: 25px;
          padding-top: 12px;
          border-top: 1px dashed #cbd5e1;
          line-height: 1.5;
        }

        .btn-buy {
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          transition: opacity 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-buy:hover {
          opacity: 0.85;
        }

        .loading-text {
          opacity: 0.7;
          pointer-events: none;
        }

        /* ===================== MODALS ===================== */
        .pkg-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(3px);
          padding: 15px;
          animation: fadeIn 0.2s ease;
        }

        .pkg-modal {
          background: white;
          padding: 30px 28px;
          border-radius: 12px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          transform: translateY(0);
          animation: slideUp 0.25s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .pkg-modal h3 {
          font-size: 19px;
          color: #2c3e50;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pkg-modal p.desc {
          font-size: 13.5px;
          color: #555;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .pkg-modal .choice-btns {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pkg-modal .choice-btn {
          padding: 12px 15px;
          border-radius: 6px;
          border: 1px solid #ccc;
          background: #f8f9fa;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          text-align: left;
          color: #2c3e50;
          transition: 0.2s;
        }
        .pkg-modal .choice-btn:hover {
          background: #eef2f7;
        }
        .pkg-modal .choice-btn.primary {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }
        .pkg-modal .choice-btn.primary:hover {
          background: #0056b3;
        }
        .pkg-modal .choice-btn small {
          display: block;
          font-weight: normal;
          margin-top: 3px;
          opacity: 0.85;
        }
        .pkg-modal .choice-btn.cancel {
          background: none;
          border: none;
          color: #888;
          text-align: center;
          font-weight: normal;
        }

        .pkg-modal .form-group {
          margin-bottom: 14px;
          text-align: left;
        }
        .pkg-modal label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13px;
          color: #444;
        }
        .pkg-modal input,
        .pkg-modal select {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .pkg-modal .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }
        .pkg-modal .modal-actions button {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          border: none;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
        }
        .pkg-modal .btn-cancel-modal {
          background: #e2e8f0;
          color: #475569;
        }
        .pkg-modal .btn-submit-modal {
          background: #28a745;
          color: white;
        }
        .selected-plan-note {
          background: #f4f8ff;
          border: 1px dashed #007bff;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          margin-bottom: 16px;
          color: #2c3e50;
        }
      `}</style>

      <div className="page-banner">
        <div className="banner-content">
          <h1>আমাদের প্রিপারেশন প্যাকেজসমূহ</h1>
          <p>আপনার সুবিধামত প্যাকেজ বেছে নিয়ে আজই শুরু করুন সেরা কুইজ প্রস্তুতি</p>
        </div>
      </div>

      <main className="packages-container" id="packagesWrapper">
        {DEFAULT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="package-card"
            style={{
              backgroundColor: pkg.themeBg,
              border: `2px solid ${pkg.themeColor}`
            }}
          >
            <span className="popular-badge" style={{ backgroundColor: pkg.themeColor }}>
              {pkg.badge}
            </span>

            <div>
              <h3 className="pkg-title">{pkg.title}</h3>
              <div className="pkg-price" style={{ color: pkg.themeColor }}>
                {pkg.price} <span>{pkg.duration}</span>
              </div>
              <ul className="pkg-features">
                {pkg.features.map((feat, fIdx) => (
                  <li key={fIdx}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#28a745' }}></i>
                    {feat}
                  </li>
                ))}
              </ul>
              <p className="pkg-note">{pkg.note}</p>
            </div>

            <button
              className={`btn-buy ${loadingBtnId === pkg.id ? 'loading-text' : ''}`}
              style={{ backgroundColor: pkg.themeColor }}
              onClick={() => handlePackageBuy(pkg.id)}
            >
              {loadingBtnId === pkg.id ? 'যাচাই করা হচ্ছে...' : 'সাবস্ক্রাইব করুন'}
            </button>
          </div>
        ))}
      </main>

      {/* Choice Modal (Change vs Add, শুধু pending থাকলে দেখাবে) */}
      {choiceModal.open && (
        <div className="pkg-modal-overlay" onClick={() => setChoiceModal({ ...choiceModal, open: false })}>
          <div className="pkg-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <i className="fa-solid fa-circle-info" style={{ color: '#ffc107' }}></i>
              আপনার একটা রিকোয়েস্ট Pending আছে
            </h3>
            <p className="desc" dangerouslySetInnerHTML={{ __html: choiceModal.desc }}></p>
            <div className="choice-btns">
              <button
                className="choice-btn primary"
                onClick={() => {
                  setChoiceModal({ ...choiceModal, open: false });
                  setPaymentModal({
                    open: true,
                    planType: choiceModal.planType,
                    action: 'add',
                    requestId: null,
                    phone: '',
                    transactionId: '',
                    paymentMethod: 'bkash'
                  });
                }}
              >
                এই প্যাকেজটাও Add করুন
                <small>আগের রিকোয়েস্টের সাথে এটাও যোগ হবে (অ্যাপ্রুভ হলে মেয়াদ একসাথে যোগ হবে)</small>
              </button>

              <button
                className="choice-btn"
                onClick={() => {
                  setChoiceModal({ ...choiceModal, open: false });
                  setPaymentModal({
                    open: true,
                    planType: choiceModal.planType,
                    action: 'change',
                    requestId: choiceModal.lastPendingId,
                    phone: '',
                    transactionId: '',
                    paymentMethod: 'bkash'
                  });
                }}
              >
                সর্বশেষ রিকোয়েস্ট পরিবর্তন করুন
                <small>আগের সর্বশেষ রিকোয়েস্টটা মুছে এই প্যাকেজ দিয়ে বদলে যাবে</small>
              </button>

              <button
                className="choice-btn cancel"
                onClick={() => setChoiceModal({ ...choiceModal, open: false })}
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Plan Confirm Modal */}
      {activeConfirmModal.open && (
        <div
          className="pkg-modal-overlay"
          onClick={() => setActiveConfirmModal({ ...activeConfirmModal, open: false })}
        >
          <div className="pkg-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <i className="fa-solid fa-gem" style={{ color: '#28a745' }}></i>
              আপনার প্যাকেজ ইতিমধ্যে Active আছে
            </h3>
            <p className="desc">{activeConfirmModal.desc}</p>
            <div className="choice-btns">
              <button
                className="choice-btn primary"
                onClick={() => {
                  setActiveConfirmModal({ ...activeConfirmModal, open: false });
                  setPaymentModal({
                    open: true,
                    planType: activeConfirmModal.planType,
                    action: 'renew',
                    requestId: null,
                    phone: '',
                    transactionId: '',
                    paymentMethod: 'bkash'
                  });
                }}
              >
                হ্যাঁ, মেয়াদ বাড়ানোর রিকোয়েস্ট পাঠান
              </button>
              <button
                className="choice-btn cancel"
                onClick={() => setActiveConfirmModal({ ...activeConfirmModal, open: false })}
              >
                না, থাক
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Info Modal */}
      {paymentModal.open && (
        <div className="pkg-modal-overlay" onClick={() => setPaymentModal({ ...paymentModal, open: false })}>
          <div className="pkg-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              <i className="fa-solid fa-money-bill-wave" style={{ color: '#007bff' }}></i>
              পেমেন্ট তথ্য দিন
            </h3>
            <div className="selected-plan-note">
              নির্বাচিত প্যাকেজ: <b>{planLabelBn(paymentModal.planType)}</b>
            </div>

            <form onSubmit={handleSubmitPaymentForm}>
              <div className="form-group">
                <label>যে নাম্বার থেকে পেমেন্ট করেছেন:</label>
                <input
                  type="text"
                  placeholder="যেমনঃ 017XXXXXXXX"
                  value={paymentModal.phone}
                  onChange={(e) => setPaymentModal({ ...paymentModal, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Transaction ID:</label>
                <input
                  type="text"
                  placeholder="যেমনঃ 8N7A2K1XYZ"
                  value={paymentModal.transactionId}
                  onChange={(e) => setPaymentModal({ ...paymentModal, transactionId: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>পেমেন্ট মাধ্যম:</label>
                <select
                  value={paymentModal.paymentMethod}
                  onChange={(e) => setPaymentModal({ ...paymentModal, paymentMethod: e.target.value })}
                  required
                >
                  <option value="bkash">বিকাশ (Bkash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setPaymentModal({ ...paymentModal, open: false })}
                >
                  বাতিল
                </button>
                <button type="submit" className="btn-submit-modal" disabled={submittingPayment}>
                  {submittingPayment ? 'পাঠানো হচ্ছে...' : 'রিকোয়েস্ট পাঠান'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
