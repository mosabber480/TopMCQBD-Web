'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

// Helper for Remaining Time Calculation
const getRemainingTime = (endDateStr) => {
  if (!endDateStr) return 'No Active Plan';
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
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState({});

  // Expanded Payment History user IDs
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Manual Override plan select state per user: { [userId]: { plan: '1_month', customName: '', years: 0, months: 0, days: 0 } }
  const [overridePlans, setOverridePlans] = useState({});

  // Payment Record inline editing state: { [requestId]: { plan, paymentMethod, phone, transactionId } }
  const [editingPaymentReq, setEditingPaymentReq] = useState(null);

  // Reject Reason Prompt state
  const [rejectModal, setRejectModal] = useState(null); // { userId, requestId, reason: '' }

  // Create Admin Modal (for Owner)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // Add Offline Payment form state: { [userId]: { plan: '1_month', phone: '', transactionId: '', paymentMethod: 'bkash', action: 'new' } }
  const [offlinePaymentForm, setOfflinePaymentForm] = useState({});

  const loadUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const uStr = localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}';
      setCurrentUser(JSON.parse(uStr));

      const res = await fetch(`/api/users?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setUsers(data.users || []);

        // Initialize override plans map
        const initialOverrides = {};
        (data.users || []).forEach((u) => {
          initialOverrides[u._id] = {
            plan: u.subscription?.plan || 'none',
            customName: '',
            years: 0,
            months: 0,
            days: 0
          };
        });
        setOverridePlans(initialOverrides);
      } else {
        showTopAlert(data.message || 'Failed to load users', 'danger');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      showTopAlert('Error fetching user list!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users by search & status
  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;

    const sub = u.subscription || {};
    const isActive = sub.active && sub.endDate && new Date(sub.endDate) > new Date();
    const pendingCount = (u.pendingRequests || []).filter((r) => r.status === 'pending').length;
    const isAdmin = u.role === 'owner' || u.role === 'admin';

    let userCategory = 'expired';
    if (isAdmin) userCategory = 'admin';
    else if (pendingCount > 0) userCategory = 'pending';
    else if (isActive) userCategory = 'active';

    const matchesStatus = statusFilter === 'all' || userCategory === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Approve Request
  const handleApproveRequest = async (userId, requestId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('Error approving request', 'danger');
    }
  };

  // Submit Reject Request
  const handleConfirmReject = async () => {
    if (!rejectModal) return;
    const { userId, requestId, reason } = rejectModal;
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reason || 'পেমেন্ট তথ্য সঠিক নয়।' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        setRejectModal(null);
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('Error rejecting request', 'danger');
    }
  };

  // Edit Payment Record
  const handleSavePaymentRecord = async (userId, requestId) => {
    const editData = editingPaymentReq;
    if (!editData) return;
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        setEditingPaymentReq(null);
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('Error updating payment record', 'danger');
    }
  };

  // Delete Payment Record
  const handleDeletePaymentRecord = async (userId, requestId) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('Error deleting payment record', 'danger');
    }
  };

  // Save Subscription Override
  const handleSaveSubscriptionOverride = async (userId) => {
    const override = overridePlans[userId] || { plan: 'none' };
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch(`/api/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(override)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('Error updating subscription', 'danger');
    }
  };

  // Delete User (Owner only)
  const handleDeleteUser = async (userId, uName) => {
    if (!window.confirm(`Are you sure you want to delete user '${uName}'?`)) return;
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('Error deleting user', 'danger');
    }
  };

  // Create Admin Form Submit
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminSubmitting(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch('/api/users/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ ' + data.message, 'success');
        setShowAdminModal(false);
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        loadUsers();
      } else {
        showTopAlert('❌ ' + (data.message || 'এডমিন তৈরিতে ব্যর্থ'), 'danger');
      }
    } catch (err) {
      showTopAlert('Server error', 'danger');
    } finally {
      setAdminSubmitting(false);
    }
  };

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
        }

        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;
          flex-wrap: wrap;
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
        }
        .search-box input {
          width: 100%;
          padding: 9px 15px 9px 35px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }
        .search-box input:focus {
          border-color: #007bff;
        }
        .search-box i {
          position: absolute;
          left: 12px;
          top: 12px;
          color: #888;
        }
        .filter-box {
          min-width: 220px;
        }
        .filter-box select {
          width: 100%;
          padding: 9px 15px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          background: white;
          font-weight: bold;
          color: #444;
          outline: none;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 5px;
        }
        th,
        td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
          vertical-align: top;
          font-size: 13.5px;
        }
        th {
          background-color: #f8f9fa;
          color: #333;
          font-weight: bold;
        }
        tr:hover {
          background-color: #f8fafc;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11.5px;
          font-weight: bold;
          display: inline-block;
        }
        .badge-active {
          background-color: #d4edda;
          color: #155724;
        }
        .badge-expired {
          background-color: #f8d7da;
          color: #721c24;
        }
        .badge-owner {
          background-color: #cce5ff;
          color: #004085;
        }
        .badge-admin {
          background-color: #e2e3e5;
          color: #383d41;
        }
        .badge-requested {
          background-color: #ffc107;
          color: #212529;
        }

        .btn-action {
          padding: 5px 10px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
          color: white;
          transition: opacity 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .btn-action:hover {
          opacity: 0.9;
        }
        .btn-update {
          background-color: #28a745;
        }
        .btn-delete {
          background-color: #dc3545;
        }
        .btn-edit {
          background-color: #007bff;
        }
        .btn-view-history {
          background-color: #17a2b8;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          border: none;
          cursor: pointer;
          font-weight: bold;
          margin-top: 5px;
        }

        .history-row {
          background-color: #f8fafc !important;
        }
        .history-container-inner {
          padding: 15px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin: 6px 0;
          background: white;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.03);
        }
        .history-entry {
          background: #fff8e1;
          border: 1px solid #ffe58a;
          border-radius: 8px;
          padding: 12px 15px;
          margin-bottom: 10px;
        }
        .history-entry.rejected {
          background: #fdf2f2;
          border-color: #f3b8bd;
        }
        .history-entry.approved {
          background: #f0faf4;
          border-color: #a8e6b8;
        }

        .plan-select {
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          font-size: 13px;
          outline: none;
          margin-bottom: 4px;
        }
        .custom-override-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 6px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-box {
          background: white;
          width: 100%;
          max-width: 440px;
          border-radius: 10px;
          padding: 24px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
        }
      `}</style>

      <div className="box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px' }}>
              <i className="fa-solid fa-users" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
              ইউজার ও সাবস্ক্রিপশন ব্যবস্থাপনা (User Management)
            </h3>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              সকল রেজিস্টার্ড ইউজার, তাদের প্যাকেজ রিকোয়েস্ট অনুমোদন ও ম্যানুয়াল সাবস্ক্রিপশন পরিচালনা করুন।
            </p>
          </div>

          {currentUser.role === 'owner' && (
            <button
              className="btn-action"
              style={{ backgroundColor: '#007bff', padding: '8px 16px', fontSize: '13.5px' }}
              onClick={() => setShowAdminModal(true)}
            >
              <i className="fa-solid fa-user-plus"></i> নতুন অ্যাডমিন তৈরি করুন
            </button>
          )}
        </div>

        {/* Controls Bar: Search & Status Filter */}
        <div className="controls-bar">
          <div className="search-box">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              placeholder="Search by Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">সকল ইউজার (All Status)</option>
              <option value="pending">পেন্ডিং রিকোয়েস্ট (Pending Requests)</option>
              <option value="active">একটিভ সাবস্ক্রিপশন (Active Subscription)</option>
              <option value="expired">মেয়াদোত্তীর্ণ / নিস্ক্রিয় (Expired/Inactive)</option>
              <option value="admin">ওনার ও অ্যাডমিন (Owner / Admin)</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User Details</th>
                <th>Role</th>
                <th>Active Plan & Expiry</th>
                <th>Payment History & Requests</th>
                <th>Manual Override</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> ইউজারদের তালিকা লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                    কোনো ইউজার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => {
                  const sub = u.subscription || {};
                  const isActive = sub.active && sub.endDate && new Date(sub.endDate) > new Date();
                  const pendingReqs = (u.pendingRequests || []).filter((r) => r.status === 'pending');
                  const isExpanded = expandedUserId === u._id;
                  const override = overridePlans[u._id] || { plan: 'none' };

                  return (
                    <React.Fragment key={u._id}>
                      <tr>
                        <td>{index + 1}</td>

                        {/* User Details */}
                        <td>
                          <b style={{ color: '#1e293b' }}>{u.name}</b>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                          {pendingReqs.length > 0 && (
                            <span className="badge badge-requested" style={{ marginTop: '4px' }}>
                              {pendingReqs.length} Pending Request{pendingReqs.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </td>

                        {/* Role Badge */}
                        <td>
                          {u.role === 'owner' ? (
                            <span className="badge badge-owner">Owner</span>
                          ) : u.role === 'admin' ? (
                            <span className="badge badge-admin">Admin</span>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Customer</span>
                          )}
                        </td>

                        {/* Active Plan & Expiry */}
                        <td>
                          {isActive ? (
                            <div>
                              <span className="badge badge-active">{sub.plan}</span>
                              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', marginTop: '3px' }}>
                                Remaining: {getRemainingTime(sub.endDate)}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Expires: {new Date(sub.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-expired">Inactive / Expired</span>
                          )}
                        </td>

                        {/* Payment History & Requests */}
                        <td>
                          <button
                            type="button"
                            className="btn-view-history"
                            onClick={() => setExpandedUserId(isExpanded ? null : u._id)}
                          >
                            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-clock-rotate-left'}`}></i>{' '}
                            হিস্ট্রি ({u.pendingRequests ? u.pendingRequests.length : 0})
                          </button>
                        </td>

                        {/* Manual Subscription Override */}
                        <td>
                          <select
                            className="plan-select"
                            value={override.plan}
                            onChange={(e) =>
                              setOverridePlans({
                                ...overridePlans,
                                [u._id]: { ...override, plan: e.target.value }
                              })
                            }
                          >
                            <option value="none">None / Cancel</option>
                            <option value="1_month">1 Month</option>
                            <option value="3_months">3 Months</option>
                            <option value="6_months">6 Months</option>
                            <option value="1_year">1 Year</option>
                            <option value="2_years">2 Years</option>
                            <option value="3_years">3 Years</option>
                            <option value="custom">Custom Package...</option>
                          </select>

                          {override.plan === 'custom' && (
                            <div className="custom-override-box">
                              <input
                                type="text"
                                placeholder="Package Name"
                                value={override.customName || ''}
                                onChange={(e) =>
                                  setOverridePlans({
                                    ...overridePlans,
                                    [u._id]: { ...override, customName: e.target.value }
                                  })
                                }
                                style={{ gridColumn: '1 / -1', padding: '4px 6px', fontSize: '12px' }}
                              />
                              <input
                                type="number"
                                placeholder="Years"
                                value={override.years || 0}
                                onChange={(e) =>
                                  setOverridePlans({
                                    ...overridePlans,
                                    [u._id]: { ...override, years: e.target.value }
                                  })
                                }
                                style={{ padding: '4px 6px', fontSize: '12px' }}
                              />
                              <input
                                type="number"
                                placeholder="Months"
                                value={override.months || 0}
                                onChange={(e) =>
                                  setOverridePlans({
                                    ...overridePlans,
                                    [u._id]: { ...override, months: e.target.value }
                                  })
                                }
                                style={{ padding: '4px 6px', fontSize: '12px' }}
                              />
                              <input
                                type="number"
                                placeholder="Days"
                                value={override.days || 0}
                                onChange={(e) =>
                                  setOverridePlans({
                                    ...overridePlans,
                                    [u._id]: { ...override, days: e.target.value }
                                  })
                                }
                                style={{ gridColumn: '1 / -1', padding: '4px 6px', fontSize: '12px' }}
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            className="btn-action btn-update"
                            style={{ marginTop: '4px' }}
                            onClick={() => handleSaveSubscriptionOverride(u._id)}
                          >
                            <i className="fa-solid fa-floppy-disk"></i> Save Plan
                          </button>
                        </td>

                        {/* Remove User (Owner only) */}
                        <td>
                          {currentUser.role === 'owner' && u.role !== 'owner' ? (
                            <button
                              type="button"
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteUser(u._id, u.name)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          ) : (
                            <small style={{ color: '#94a3b8' }}>N/A</small>
                          )}
                        </td>
                      </tr>

                      {/* Expandable History Container */}
                      {isExpanded && (
                        <tr className="history-row">
                          <td colSpan="7">
                            <div className="history-container-inner">
                              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1e293b' }}>
                                <i className="fa-solid fa-clock-rotate-left" style={{ color: '#17a2b8', marginRight: '6px' }}></i>
                                {u.name}-এর পেমেন্ট ও প্যাকেজ রিকোয়েস্ট হিস্ট্রি
                              </h4>

                              {(!u.pendingRequests || u.pendingRequests.length === 0) ? (
                                <p style={{ color: '#888', fontStyle: 'italic', margin: 0, fontSize: '13px' }}>
                                  কোনো পেমেন্ট রিকোয়েস্ট নেই।
                                </p>
                              ) : (
                                u.pendingRequests.map((req) => {
                                  const isPending = req.status === 'pending';
                                  const isEditing = editingPaymentReq?.requestId === req._id;

                                  return (
                                    <div
                                      key={req._id}
                                      className={`history-entry ${req.status === 'approved' ? 'approved' : req.status === 'rejected' ? 'rejected' : ''}`}
                                    >
                                      {isEditing ? (
                                        /* EDIT PAYMENT RECORD FORM */
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                          <input
                                            type="text"
                                            value={editingPaymentReq.plan}
                                            onChange={(e) =>
                                              setEditingPaymentReq({ ...editingPaymentReq, plan: e.target.value })
                                            }
                                            placeholder="Plan (e.g. 1_month)"
                                            style={{ padding: '6px', fontSize: '12px' }}
                                          />
                                          <select
                                            value={editingPaymentReq.paymentMethod}
                                            onChange={(e) =>
                                              setEditingPaymentReq({ ...editingPaymentReq, paymentMethod: e.target.value })
                                            }
                                            style={{ padding: '6px', fontSize: '12px' }}
                                          >
                                            <option value="bkash">bKash</option>
                                            <option value="nagad">Nagad</option>
                                          </select>
                                          <input
                                            type="text"
                                            value={editingPaymentReq.phone}
                                            onChange={(e) =>
                                              setEditingPaymentReq({ ...editingPaymentReq, phone: e.target.value })
                                            }
                                            placeholder="Phone number"
                                            style={{ padding: '6px', fontSize: '12px' }}
                                          />
                                          <input
                                            type="text"
                                            value={editingPaymentReq.transactionId}
                                            onChange={(e) =>
                                              setEditingPaymentReq({ ...editingPaymentReq, transactionId: e.target.value })
                                            }
                                            placeholder="Trx ID"
                                            style={{ padding: '6px', fontSize: '12px' }}
                                          />
                                          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '6px' }}>
                                            <button
                                              className="btn-action btn-update"
                                              onClick={() => handleSavePaymentRecord(u._id, req._id)}
                                            >
                                              Save Record
                                            </button>
                                            <button
                                              className="btn-action btn-delete"
                                              onClick={() => setEditingPaymentReq(null)}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        /* READ VIEW */
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                          <div>
                                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>
                                              {req.plan} ({req.type || 'new'})
                                            </span>
                                            <span
                                              className={`badge ${req.status === 'approved' ? 'badge-active' : req.status === 'rejected' ? 'badge-expired' : 'badge-requested'}`}
                                              style={{ marginLeft: '8px' }}
                                            >
                                              {req.status.toUpperCase()}
                                            </span>
                                            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                                              <b>Method:</b> {req.paymentMethod?.toUpperCase()} | <b>Phone:</b>{' '}
                                              {req.phone} | <b>TrxID:</b> <code>{req.transactionId}</code> |{' '}
                                              <b>Date:</b> {new Date(req.requestedAt).toLocaleString()}
                                            </div>
                                            {req.rejectionReason && (
                                              <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '2px' }}>
                                                <b>কারণ:</b> {req.rejectionReason}
                                              </div>
                                            )}
                                          </div>

                                          <div style={{ display: 'flex', gap: '6px' }}>
                                            {isPending && (
                                              <>
                                                <button
                                                  className="btn-action btn-update"
                                                  onClick={() => handleApproveRequest(u._id, req._id)}
                                                >
                                                  <i className="fa-solid fa-check"></i> Approve
                                                </button>
                                                <button
                                                  className="btn-action btn-delete"
                                                  onClick={() =>
                                                    setRejectModal({
                                                      userId: u._id,
                                                      requestId: req._id,
                                                      reason: ''
                                                    })
                                                  }
                                                >
                                                  <i className="fa-solid fa-xmark"></i> Reject
                                                </button>
                                              </>
                                            )}
                                            <button
                                              className="btn-action btn-edit"
                                              onClick={() =>
                                                setEditingPaymentReq({
                                                  requestId: req._id,
                                                  plan: req.plan,
                                                  paymentMethod: req.paymentMethod,
                                                  phone: req.phone,
                                                  transactionId: req.transactionId
                                                })
                                              }
                                            >
                                              Edit
                                            </button>
                                            <button
                                              className="btn-action btn-delete"
                                              onClick={() => handleDeletePaymentRecord(u._id, req._id)}
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECT REASON MODAL */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#dc3545' }}>
              <i className="fa-solid fa-triangle-exclamation"></i> রিকোয়েস্ট বাতিল করুন
            </h3>
            <p style={{ color: '#475569', fontSize: '13.5px', marginBottom: '12px' }}>
              বাতিল করার কারণ উল্লেখ করুন (ইউজার এই কারণটি দেখতে পাবে):
            </p>
            <textarea
              rows={3}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '13.5px', boxSizing: 'border-box' }}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              placeholder="যেমন: পেমেন্ট বা ট্রানজেকশন আইডি সঠিক নয়।"
            ></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
              <button className="btn-action btn-delete" onClick={handleConfirmReject}>
                Reject করুন
              </button>
              <button
                className="btn-action"
                style={{ background: '#64748b' }}
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ADMIN MODAL (For Owner) */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#007bff' }}>
              <i className="fa-solid fa-user-plus"></i> নতুন অ্যাডমিন তৈরি করুন
            </h3>
            <form onSubmit={handleCreateAdminSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  নাম:
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  placeholder="Admin Name"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  ইমেইল:
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  পাসওয়ার্ড:
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  placeholder="Temporary Password"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '5px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-action"
                  style={{ background: '#64748b' }}
                  onClick={() => setShowAdminModal(false)}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="btn-action btn-update"
                  disabled={adminSubmitting}
                >
                  {adminSubmitting ? 'তৈরি হচ্ছে...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
