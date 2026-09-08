'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showTopAlert } from '@/components/layout/TopAlert';
import { getPaidApiUrl } from '@/lib/config';

// Remaining Time Calculator Helper
function getRemainingTime(endDateStr) {
  if (!endDateStr) return 'N/A';
  const now = new Date();
  const end = new Date(endDateStr);
  if (end <= now) return 'Expired';

  let years = end.getFullYear() - now.getFullYear();
  let months = end.getMonth() - now.getMonth();
  let days = end.getDate() - now.getDate();
  let hours = end.getHours() - now.getHours();

  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} Year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} Month${months > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} Day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? 's' : ''}`);

  return parts.length > 0 ? parts.join(' ') : 'Less than 1 Hour';
}

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

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const res = await fetch(getPaidApiUrl('/api/users/me'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userObj = {
          ...data.user,
          username: data.user.username || existingUser.username || (data.user.name ? data.user.name.split(' ')[0] : '')
        };
        setUser(userObj);
        try {
          localStorage.setItem('user', JSON.stringify(userObj));
          window.dispatchEvent(new Event('auth-change'));
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

  const startEditing = () => {
    if (!user) return;
    setEditName(user.name || '');
    setEditUsername(user.username || (user.name ? user.name.split(' ')[0] : ''));
    setEditPhone(user.phone || '');
    setIsEditing(true);
  };

  const handleProfileEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showTopAlert('পুরো নাম পূরণ করা আবশ্যক!', 'warning');
      return;
    }

    setEditSubmitting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          username: (editUsername ? editUsername.replace(/\s+/g, '') : editName.trim().split(' ')[0]),
          phone: editPhone.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const updatedUser = {
          ...user,
          ...data.user
        };
        setUser(updatedUser);
        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('quiz_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new Event('auth-change'));
        } catch (e) {}

        setIsEditing(false);
        showTopAlert('প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!', 'success');
      } else {
        showTopAlert(data.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।', 'danger');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      showTopAlert('সার্ভার এরর হয়েছে। পরে চেষ্টা করুন।', 'danger');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showTopAlert('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি!', 'warning');
      return;
    }

    setPwSubmitting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const res = await fetch(getPaidApiUrl('/api/auth/change-password'), {
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
      window.dispatchEvent(new Event('auth-change'));
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
    <div className="profile-wrapper">
      {/* Header Banner */}
      <div className="profile-header-banner">
        <div className="profile-header-left">
          <div className="profile-avatar-circle">
            {(user.name || user.username) ? (
              <span>{(user.name || user.username).charAt(0).toUpperCase()}</span>
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{user.name || user.username}</h1>
            <p>
              <span>
                <i className="fa-regular fa-envelope" style={{ marginRight: '6px', color: '#60a5fa' }}></i>
                {user.email || 'ইমেইল দেওয়া হয়নি'}
              </span>
              <span>
                <i className="fa-solid fa-phone" style={{ marginRight: '6px', color: '#34d399' }}></i>
                {user.phone || 'ফোন নাম্বার নেই'}
              </span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          {isSubActive ? (
            <>
              <span className="profile-status-pill active">
                সক্রিয় প্রিমিয়াম সদস্য
              </span>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#065f46', display: 'inline-flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.95)', padding: '6px 14px', borderRadius: '20px', border: '1px solid #a7f3d0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', fontFamily: 'var(--font-ui)', lineHeight: '1.25' }}>
                <span>Remaining Time: <strong>{getRemainingTime(user.subscription.endDate)}</strong></span>
              </div>
            </>
          ) : (
            <span className="profile-status-pill inactive">
              ফ্রি মেম্বার / কোনো সক্রিয় প্ল্যান নেই
            </span>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column */}
        <div>
          {/* User Basic Info Box */}
          <div className="box">
            <div className="box-header">
              <h2>
                <i className="fa-solid fa-id-card" style={{ marginRight: '10px', color: '#135fd6' }}></i>
                ব্যক্তিগত তথ্য
              </h2>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="btn-edit-profile"
                  title="প্রোফাইল তথ্য পরিবর্তন করুন"
                >
                  <i className="fa-solid fa-pen-to-square"></i> এডিট করুন
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-edit-profile cancel"
                  title="এডিট বাতিল করুন"
                >
                  <i className="fa-solid fa-xmark"></i> বাতিল
                </button>
              )}
            </div>

            <form onSubmit={isEditing ? handleProfileEditSubmit : (e) => e.preventDefault()}>
              <div className="profile-info-list">
                {/* 1. Username */}
                <div className="profile-info-row">
                  <strong><i className="fa-solid fa-user-tag" style={{ color: '#135fd6' }}></i> ইউজারনেম / Nickname:</strong>
                  {!isEditing ? (
                    <span style={{ color: '#135fd6', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-circle-user" style={{ fontSize: '13.5px' }}></i>
                      {user.username || (user.name ? user.name.split(' ')[0] : 'user')}
                    </span>
                  ) : (
                    <div className="profile-edit-input-wrapper">
                      <input
                        type="text"
                        className="profile-inline-input"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value.replace(/\s+/g, ''))}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.code === 'Space') {
                            e.preventDefault();
                          }
                        }}
                        placeholder="একটি শব্দে ইউজারনেম লিখুন..."
                        autoFocus
                        required
                      />
                    </div>
                  )}
                </div>

                {/* 2. Full Name */}
                <div className="profile-info-row">
                  <strong><i className="fa-solid fa-user" style={{ color: '#135fd6' }}></i> পুরো নাম:</strong>
                  {!isEditing ? (
                    <span>{user.name}</span>
                  ) : (
                    <div className="profile-edit-input-wrapper">
                      <input
                        type="text"
                        className="profile-inline-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="আপনার পুরো নাম দিন..."
                        required
                      />
                    </div>
                  )}
                </div>

                {/* 3. Email Address (Locked / Not Editable) */}
                <div className="profile-info-row">
                  <strong><i className="fa-solid fa-envelope" style={{ color: '#135fd6' }}></i> ইমেইল অ্যাড্রেস:</strong>
                  {!isEditing ? (
                    <span style={{ color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {user.email || 'N/A'}
                    </span>
                  ) : (
                    <div className="profile-edit-input-wrapper">
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          cursor: 'not-allowed',
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '7px 14px',
                          borderRadius: '7px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13.5px',
                          fontWeight: '600',
                          userSelect: 'none',
                          width: '100%',
                          justifyContent: 'space-between'
                        }}
                        title="ইমেইল অ্যাড্রেস পরিবর্তনযোগ্য নয়"
                      >
                        <span style={{ cursor: 'not-allowed' }}>{user.email || 'N/A'}</span>
                        <i className="fa-solid fa-lock" style={{ fontSize: '11px', color: '#94a3b8', cursor: 'not-allowed' }}></i>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Phone Number */}
                <div className="profile-info-row">
                  <strong><i className="fa-solid fa-phone" style={{ color: '#135fd6' }}></i> মোবাইল নম্বর:</strong>
                  {!isEditing ? (
                    <span>{user.phone || 'N/A'}</span>
                  ) : (
                    <div className="profile-edit-input-wrapper">
                      <input
                        type="text"
                        className="profile-inline-input"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="ফোন নম্বর (যেমন: 017xxxxxxxx)..."
                      />
                    </div>
                  )}
                </div>

                {/* 5. Role */}
                <div className="profile-info-row">
                  <strong><i className="fa-solid fa-user-shield" style={{ color: '#135fd6' }}></i> অ্যাকাউন্টের ভূমিকা:</strong>
                  <span className="badge badge-type" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                </div>

                {/* 6. Membership Status */}
                <div className="profile-info-row">
                  <strong><i className="fa-solid fa-circle-check" style={{ color: '#135fd6' }}></i> মেম্বারশিপ স্ট্যাটাস:</strong>
                  <span>
                    {isSubActive ? (
                      <span className="badge badge-active">Premium Member</span>
                    ) : (
                      <span className="badge badge-type">Free / Inactive</span>
                    )}
                  </span>
                </div>
              </div>

              {isEditing && (
                <div className="profile-edit-actions">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn"
                    style={{ background: '#f1f5f9', color: '#475569', padding: '8px 18px', fontSize: '13.5px', borderRadius: '7px', fontWeight: '600', border: '1px solid #cbd5e1' }}
                  >
                    <i className="fa-solid fa-xmark"></i> বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="btn btn-primary"
                    style={{ padding: '8px 22px', fontSize: '13.5px', borderRadius: '7px', fontWeight: '600' }}
                  >
                    {editSubmitting ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> সেভ হচ্ছে...</>
                    ) : (
                      <><i className="fa-solid fa-check"></i> তথ্য সংরক্ষণ করুন</>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Subscription Info Box */}
          <div className="box" style={{ borderLeft: '4px solid #10b981' }}>
            <h3 style={{ color: '#047857' }}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '10px', color: '#10b981' }}></i>
              সাবস্ক্রিপশন বিবরণ
            </h3>

            {isSubActive ? (
              <div>
                <div className="sub-active-banner">
                  <div className="plan-title">
                    <i className="fa-solid fa-crown" style={{ color: '#059669', marginRight: '6px' }}></i>
                    বর্তমান প্যাকেজ: {user.subscription?.plan}
                  </div>
                  <div className="sub-date-info">
                    <div>
                      <strong>শুরুর তারিখ:</strong> {user.subscription?.startDate ? new Date(user.subscription.startDate).toLocaleDateString('bn-BD') : 'N/A'}
                    </div>
                    <div>
                      <strong>মেয়াদ শেষ হবে:</strong> <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{new Date(user.subscription.endDate).toLocaleDateString('bn-BD')}</span>
                    </div>
                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontFamily: 'var(--font-ui)', fontSize: '13.5px' }}>Remaining Time:</strong>{' '}
                      <span className="sub-remaining-badge">
                        {getRemainingTime(user.subscription.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link href="/questions" className="btn btn-success" style={{ flex: '1', minWidth: '150px' }}>
                    <i className="fa-solid fa-play"></i> প্রশ্নব্যাংক শুরু করুন
                  </Link>
                  <Link href="/packages" className="btn btn-primary" style={{ flex: '1', minWidth: '150px' }}>
                    <i className="fa-solid fa-rotate"></i> মেয়াদ বাড়ান (Renew)
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                  আপনার বর্তমানে কোনো সক্রিয় প্রিমিয়াম প্যাকেজ নেই। সকল বিষয়ের কুইজের সম্পূর্ণ সমাধান এবং মডেল টেস্ট অ্যাক্সেস পেতে প্যাকেজ সাবস্ক্রাইব করুন।
                </p>
                <Link href="/packages" className="btn btn-primary" style={{ width: '100%', padding: '10px 16px' }}>
                  <i className="fa-solid fa-cart-shopping"></i> প্রিমিয়াম প্যাকেজ কিনুন
                </Link>
              </div>
            )}
          </div>

          {/* Pending Payment Requests Box */}
          <div className="box" style={{ borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ color: '#b45309' }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '10px', color: '#f59e0b' }}></i>
              প্যাকেজ রিকোয়েস্ট হিস্ট্রি
            </h3>

            {(!user.pendingRequests || user.pendingRequests.length === 0) ? (
              <p style={{ color: '#888', fontSize: '13.5px', margin: '10px 0' }}>কোনো রিকোয়েস্ট হিস্ট্রি পাওয়া যায়নি।</p>
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
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>
                          {req.plan} ({req.paymentMethod})
                        </span>
                        {statusBadge}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.7' }}>
                        <div><strong>Phone:</strong> {req.phone} | <strong>TrxID:</strong> {req.transactionId}</div>
                        <div><strong>তারিখ:</strong> {req.requestedAt ? new Date(req.requestedAt).toLocaleString('bn-BD') : ''}</div>
                        {req.rejectionReason && (
                          <div style={{ color: 'var(--danger)', marginTop: '4px', fontWeight: 500 }}>
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
          <div className="box" style={{ borderLeft: '4px solid #135fd6' }}>
            <h3 style={{ color: '#1e293b' }}>
              <i className="fa-solid fa-lock" style={{ marginRight: '10px', color: '#135fd6' }}></i>
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
                  title={showOld ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                ></i>
              </div>

              <div className="form-group">
                <label>নতুন পাসওয়ার্ড:</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)..."
                  required
                />
                <i
                  className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowNew(!showNew)}
                  title={showNew ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
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
                  title={showConfirm ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                ></i>
              </div>

              <button
                type="submit"
                disabled={pwSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px', padding: '12px', fontSize: '15px' }}
              >
                {pwSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i> পাসওয়ার্ড আপডেট করুন
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="box" style={{ borderLeft: '4px solid #ef4444' }}>
            <h3 style={{ color: '#dc2626' }}>
              <i className="fa-solid fa-gear" style={{ marginRight: '10px', color: '#dc2626' }}></i>
              অ্যাকাউন্ট কন্ট্রোল
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '18px', lineHeight: '1.6' }}>
              আপনার অ্যাকাউন্ট থেকে নিরাপদভাবে লগআউট করার জন্য নিচের বাটনে ক্লিক করুন।
            </p>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ width: '100%', padding: '12px', fontSize: '14.5px' }}
            >
              <i className="fa-solid fa-right-from-bracket"></i> লগআউট করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
