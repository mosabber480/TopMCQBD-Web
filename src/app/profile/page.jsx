'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const res = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        try {
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (e) {}
      } else {
        router.replace('/login');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showTopAlert('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি!', 'warning');
      return;
    }

    setPwSubmitting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showTopAlert(data.message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।', 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার এরর হয়েছে। পরে চেষ্টা করুন।', 'danger');
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('quiz_token');
      localStorage.removeItem('quiz_user');
    } catch (e) {}
    router.replace('/login');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1300px', margin: '60px auto', textAlign: 'center', padding: '40px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '15px', color: '#64748b' }}>প্রোফাইল লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) return null;

  const isSubActive = user.subscription && user.subscription.active &&
    user.subscription.endDate && new Date(user.subscription.endDate) > new Date();

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '40px auto', padding: '0 20px' }}>
      <style jsx>{`
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .form-group {
          margin-bottom: 15px;
          position: relative;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
          font-size: 13px;
          color: #555;
        }
        input {
          width: 100%;
          padding: 10px 35px 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus {
          border-color: var(--primary);
        }
        .toggle-password {
          position: absolute;
          right: 12px;
          top: 34px;
          cursor: pointer;
          color: #888;
        }
        .sub-box {
          background-color: white;
          padding: 18px 20px;
          border-radius: 6px;
          margin-bottom: 15px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          border-left: 5px solid #17a2b8;
        }
        .pending-request-card {
          margin: 10px 0;
          padding: 12px 15px;
          background: #fff8e1;
          border: 1px dashed #ffc107;
          border-radius: 6px;
        }
        .pending-request-card.rejected {
          background: #fdf2f2;
          border: 1px dashed #dc3545;
        }
        .pending-request-card.approved {
          background: #f0faf4;
          border: 1px dashed #28a745;
        }
        .pending-request-card .prc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 6px;
        }
        @media (max-width: 900px) {
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="grid-2">
        {/* Left Column */}
        <div>
          {/* User Basic Info Box */}
          <div className="box">
            <h2 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--dark)' }}>
              <i className="fa-solid fa-user-circle" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
              {user.name}
            </h2>
            <p style={{ margin: '8px 0', fontSize: '14.5px' }}>
              <strong>নাম:</strong> {user.name}
            </p>
            <p style={{ margin: '8px 0', fontSize: '14.5px' }}>
              <strong>ইমেইল:</strong> {user.email}
            </p>
            <p style={{ margin: '8px 0', fontSize: '14.5px' }}>
              <strong>রোল:</strong> <span className="badge badge-type" style={{ textTransform: 'capitalize' }}>{user.role}</span>
            </p>
            <p style={{ margin: '8px 0', fontSize: '14.5px' }}>
              <strong>স্ট্যাটাস:</strong>{' '}
              {isSubActive ? (
                <span className="badge badge-active">Active Member</span>
              ) : (
                <span className="badge badge-expired">Inactive / Free</span>
              )}
            </p>
          </div>

          {/* Subscription Info Box */}
          <div className="box" style={{ borderLeft: '5px solid #17a2b8' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#17a2b8' }}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '8px' }}></i>
              সাবস্ক্রিপশন বিবরণ
            </h3>

            {isSubActive ? (
              <div>
                <p style={{ margin: '8px 0' }}>
                  <strong>বর্তমান প্যাকেজ:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user.subscription?.plan}</span>
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>শুরুর তারিখ:</strong> {user.subscription?.startDate ? new Date(user.subscription.startDate).toLocaleDateString('bn-BD') : 'N/A'}
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>মেয়াদ শেষ হবে:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{new Date(user.subscription.endDate).toLocaleDateString('bn-BD')}</span>
                </p>
                <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                  <Link href="/questions" className="btn btn-success">
                    <i className="fa-solid fa-play"></i> প্রশ্নব্যাংক শুরু করুন
                  </Link>
                  <Link href="/packages" className="btn btn-primary">
                    <i className="fa-solid fa-rotate"></i> মেয়াদ বাড়ান (Renew)
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>
                  আপনার বর্তমানে কোনো সক্রিয় প্রিমিয়াম প্যাকেজ নেই। সকল কুইজের সম্পূর্ণ সমাধান এবং মডেল টেস্ট অ্যাক্সেস পেতে সাবস্ক্রাইব করুন।
                </p>
                <Link href="/packages" className="btn btn-primary">
                  <i className="fa-solid fa-cart-shopping"></i> প্যাকেজ কিনুন
                </Link>
              </div>
            )}
          </div>

          {/* Pending Payment Requests Box */}
          <div className="box" style={{ borderLeft: '5px solid #ffc107' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#b45309' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '8px' }}></i>
              প্যাকেজ রিকোয়েস্ট হিস্ট্রি
            </h3>

            {(!user.pendingRequests || user.pendingRequests.length === 0) ? (
              <p style={{ color: '#888', fontSize: '13.5px' }}>কোনো রিকোয়েস্ট হিস্ট্রি পাওয়া যায়নি।</p>
            ) : (
              <div>
                {user.pendingRequests.map((req, idx) => {
                  let cardClass = 'pending-request-card';
                  let statusBadge = <span className="badge badge-pending">Pending</span>;

                  if (req.status === 'approved') {
                    cardClass += ' approved';
                    statusBadge = <span className="badge badge-active">Approved</span>;
                  } else if (req.status === 'rejected') {
                    cardClass += ' rejected';
                    statusBadge = <span className="badge badge-rejected">Rejected</span>;
                  }

                  return (
                    <div key={req._id || idx} className={cardClass}>
                      <div className="prc-top">
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {req.plan} ({req.paymentMethod})
                        </span>
                        {statusBadge}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#555', lineHeight: '1.7' }}>
                        <div><strong>Phone:</strong> {req.phone} | <strong>TrxID:</strong> {req.transactionId}</div>
                        <div><strong>তারিখ:</strong> {req.requestedAt ? new Date(req.requestedAt).toLocaleString('bn-BD') : ''}</div>
                        {req.rejectionReason && (
                          <div style={{ color: 'var(--danger)', marginTop: '4px' }}>
                            <strong>কারন:</strong> {req.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Change Password & Actions */}
        <div>
          <div className="box" style={{ borderLeft: '5px solid var(--primary)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--dark)' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
              পাসওয়ার্ড পরিবর্তন করুন
            </h3>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>বর্তমান পাসওয়ার্ড:</label>
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন..."
                  required
                />
                <i
                  className={`fa-solid ${showOld ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowOld(!showOld)}
                ></i>
              </div>

              <div className="form-group">
                <label>নতুন পাসওয়ার্ড:</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড দিন..."
                  required
                />
                <i
                  className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowNew(!showNew)}
                ></i>
              </div>

              <div className="form-group">
                <label>কনফার্ম নতুন পাসওয়ার্ড:</label>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="আবার নতুন পাসওয়ার্ড দিন..."
                  required
                />
                <i
                  className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowConfirm(!showConfirm)}
                ></i>
              </div>

              <button
                type="submit"
                disabled={pwSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                {pwSubmitting ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
              </button>
            </form>
          </div>

          <div className="box">
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--dark)' }}>
              <i className="fa-solid fa-gear" style={{ marginRight: '8px' }}></i>
              অ্যাকাউন্ট কন্ট্রোল
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              আপনার অ্যাকাউন্ট থেকে নিরাপদভাবে লগআউট করার জন্য নিচের বাটনে ক্লিক করুন।
            </p>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              <i className="fa-solid fa-right-from-bracket"></i> লগআউট করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
