'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';

const packageList = [
  {
    id: '1_month',
    title: '১ মাসের প্যাকেজ',
    price: '৳ ৩০০',
    duration: '১ মাস',
    badge: 'Starter',
    color: '#007bff',
    features: [
      'সকল প্রিমিয়াম বিষয়ের প্রশ্ন অ্যাক্সেস',
      'প্রতিটি প্রশ্নের নির্ভুল ব্যাখ্যা',
      'রিয়েল-টাইম টাইমার টেস্ট',
      'আনলিমিটেড প্র্যাকটিস টেস্ট',
      '২৪/৭ কাস্টমার সাপোর্ট'
    ]
  },
  {
    id: '3_months',
    title: '৩ মাসের প্যাকেজ',
    price: '৳ ৬০০',
    duration: '৩ মাস',
    badge: 'Popular',
    color: '#28a745',
    features: [
      'সকল প্রিমিয়াম বিষয়ের প্রশ্ন অ্যাক্সেস',
      'প্রতিটি প্রশ্নের নির্ভুল ব্যাখ্যা',
      'রিয়েল-টাইম টাইমার টেস্ট',
      'টপিকভিত্তিক মডেল টেস্ট',
      'দ্রুত রিভিশন সুবিধা',
      '২৪/৭ কাস্টমার সাপোর্ট'
    ]
  },
  {
    id: '6_months',
    title: '৬ মাসের প্যাকেজ',
    price: '৳ ১০০০',
    duration: '৬ মাস',
    badge: 'Most Value',
    color: '#ff9f43',
    features: [
      'সকল প্রিমিয়াম প্রশ্ন ও নতুন আপডেট',
      'বিসিএস ও ব্যাংক স্পেশাল প্রশ্ন',
      'রিয়েল-টাইম টাইমার টেস্ট',
      'রেজাল্ট ও পারফরম্যান্স ট্র্যাকিং',
      'পূর্ণাঙ্গ প্রশ্নব্যাংক অ্যাক্সেস',
      '২৪/৭ কাস্টমার সাপোর্ট'
    ]
  },
  {
    id: '1_year',
    title: '১ বছরের প্যাকেজ',
    price: '৳ ১৫০০',
    duration: '১ বছর',
    badge: 'Best Deal',
    color: '#6f42c1',
    features: [
      '১ বছর মেয়াদে সম্পূর্ণ অ্যাক্সেস',
      'সকল প্রতিযোগিতামূলক পরীক্ষার প্রস্তুতি',
      'নিয়মিত নতুন প্রশ্ন সংযোজন',
      'ব্যাখ্যামূলক সমাধান শিট',
      'প্রিমিয়াম প্রায়োরিটি সাপোর্ট'
    ]
  },
  {
    id: '2_years',
    title: '২ বছরের প্যাকেজ',
    price: '৳ ২৫০০',
    duration: '২ বছর',
    badge: 'Pro Long-term',
    color: '#17a2b8',
    features: [
      '২ বছর আনলিমিটেড অ্যাক্সেস',
      'সকল বিষয় ও বিভাগের প্রশ্ন ব্যাংক',
      'মডেল টেস্ট ও লাইভ স্কোরবোর্ড',
      'প্রিমিয়াম মেম্বারশিপ সুবিধা',
      '২৪/৭ সাপোর্ট'
    ]
  },
  {
    id: '3_years',
    title: '৩ বছরের প্যাকেজ',
    price: '৳ ৩৫০০',
    duration: '৩ বছর',
    badge: 'Ultimate',
    color: '#e83e8c',
    features: [
      '৩ বছরের আজীবন সমতুল্য প্রিপারেশন',
      'ভবিষ্যতের সকল নতুন ফিচার অন্তর্ভুক্ত',
      'সর্বোচ্চ সাশ্রয়ী প্যাকেজ',
      'ভিআইপি কাস্টমার সার্ভিস',
      'সার্বক্ষণিক প্রশ্নব্যাংক অ্যাক্সেস'
    ]
  }
];

export default function PackagesPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [phone, setPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSelectPackage = (pkg) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      if (!token) {
        router.push('/login');
        return;
      }
    } catch (e) {}

    setSelectedPlan(pkg);
    setModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!phone || !transactionId) {
      showTopAlert('ফোন নম্বর এবং ট্রানজেকশন আইডি দিন!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch('/api/users/request-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: selectedPlan.id,
          action: 'new',
          paymentMethod,
          phone: phone.trim(),
          transactionId: transactionId.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('প্যাকেজ রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাই করে অনুমোদন করবেন।', 'success');
        setModalOpen(false);
        setPhone('');
        setTransactionId('');
        router.push('/profile');
      } else {
        showTopAlert(data.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।', 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার এরর হয়েছে। পরে চেষ্টা করুন।', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style jsx>{`
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
        .page-banner h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
        .page-banner p { font-size: 16px; color: #cbd5e1; }

        .packages-container {
          max-width: 1300px;
          margin: 60px auto; 
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 35px 30px;
        }

        .package-card {
          background: white;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          padding: 35px 25px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .package-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }

        .popular-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          padding: 4px 16px;
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

        .pkg-features {
          list-style: none;
          padding: 0;
          margin: 0 0 25px 0;
          text-align: left;
          flex-grow: 1;
        }

        .pkg-features li {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pkg-features li i {
          font-size: 14px;
        }

        .btn-select-pkg {
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 15px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s ease;
          width: 100%;
        }
        .btn-select-pkg:hover {
          opacity: 0.9;
        }

        .payment-instructions-box {
          max-width: 1300px;
          margin: 0 auto 60px auto;
          padding: 30px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 480px;
          width: 90%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }

        @media (max-width: 992px) {
          .packages-container { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .packages-container { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-banner">
        <div className="banner-content">
          <h1>প্রিপারেশন প্যাকেজসমূহ</h1>
          <p>আপনার প্রয়োজন অনুযায়ী সেরা প্যাকেজটি বেছে নিয়ে এখনই প্রস্তুতি শুরু করুন</p>
        </div>
      </div>

      <div className="packages-container">
        {packageList.map((pkg) => (
          <div
            key={pkg.id}
            className="package-card"
            style={{ borderColor: pkg.color }}
          >
            {pkg.badge && (
              <span className="popular-badge" style={{ backgroundColor: pkg.color }}>
                {pkg.badge}
              </span>
            )}
            <div>
              <h3 className="pkg-title">{pkg.title}</h3>
              <div className="pkg-price" style={{ color: pkg.color }}>
                {pkg.price} <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 'normal' }}>/ {pkg.duration}</span>
              </div>
              <ul className="pkg-features">
                {pkg.features.map((feat, fIdx) => (
                  <li key={fIdx}>
                    <i className="fa-solid fa-circle-check" style={{ color: pkg.color }}></i>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn-select-pkg"
              style={{ backgroundColor: pkg.color }}
              onClick={() => handleSelectPackage(pkg)}
            >
              <i className="fa-solid fa-cart-shopping"></i> এই প্যাকেজটি নিন
            </button>
          </div>
        ))}
      </div>

      {/* Payment Instructions */}
      <div style={{ maxWidth: '1300px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div className="payment-instructions-box">
          <h2 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '15px' }}>
            <i className="fa-solid fa-money-check-dollar" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            পেমেন্ট করার নিয়মাবলী
          </h2>
          <p style={{ color: '#555', marginBottom: '15px', lineHeight: '1.7' }}>
            যেকোনো প্যাকেজ সাবস্ক্রাইব করতে নিচের বিকাশ বা নগদ নম্বরে প্যাকেজের নির্দিষ্ট টাকা <strong>Send Money</strong> করুন। পেমেন্ট সম্পন্ন হলে সংশ্লিষ্ট নম্বর ও <strong>TrxID</strong> ফর্মটিতে দিয়ে সাবমিট করুন।
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', padding: '15px 20px', borderRadius: '8px', flex: '1 1 220px' }}>
              <h4 style={{ color: '#db2777', margin: '0 0 5px 0' }}><i className="fa-solid fa-mobile-screen-button"></i> বিকাশ (Personal)</h4>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#333' }}>01700000000</p>
            </div>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '15px 20px', borderRadius: '8px', flex: '1 1 220px' }}>
              <h4 style={{ color: '#ea580c', margin: '0 0 5px 0' }}><i className="fa-solid fa-mobile-screen-button"></i> নগদ (Personal)</h4>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#333' }}>01700000000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {modalOpen && selectedPlan && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', color: 'var(--dark)', marginBottom: '10px' }}>
              <i className="fa-solid fa-box-open" style={{ color: selectedPlan.color, marginRight: '8px' }}></i>
              {selectedPlan.title} ({selectedPlan.price})
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px' }}>
              Send Money সম্পন্ন করে নিচের তথ্যগুলো পূরণ করুন।
            </p>

            <form onSubmit={handleSubmitRequest}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: '#555' }}>
                  পেমেন্ট মেথড:
                </label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="method"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                    />
                    বিকাশ
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="method"
                      value="nagad"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                    />
                    নগদ
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: '#555' }}>
                  যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Phone):
                </label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', color: '#555' }}>
                  ট্রানজেকশন আইডি (Transaction ID / TrxID):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9J8A2BC7"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '10px 18px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 22px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {submitting ? 'সাবমিট হচ্ছে...' : 'রিকোয়েস্ট জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
