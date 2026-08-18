'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

// Remaining Time Calculator Helper
function getRemainingTime(endDateStr) {
  if (!endDateStr) return 'Expired';
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

function planLabel(plan) {
  return (plan || '').replace('_', ' ').toUpperCase();
}

function typeLabel(type) {
  if (type === 'renew') return 'Renew';
  if (type === 'add') return 'Add';
  if (type === 'manual') return 'Manual (Admin)';
  return 'New';
}

function methodLabel(method) {
  return method === 'bkash' ? 'বিকাশ' : method === 'nagad' ? 'নগদ' : method || 'N/A';
}

export default function AdminUsersPage() {
  const [usersCache, setUsersCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState({});

  // History Dropdown State
  const [currentOpenUserId, setCurrentOpenUserId] = useState(null);

  // Manual Override Editing State: { [userId]: boolean }
  const [overrideEditing, setOverrideEditing] = useState({});
  const [overrideForm, setOverrideForm] = useState({}); // { [userId]: { plan, customName, years, months, days } }

  // Add Payment Form State in History: { [userId]: { open: boolean, plan, status, phone, transactionId, paymentMethod } }
  const [addPaymentForms, setAddPaymentForms] = useState({});

  // Edit History Entry Form State: { [requestId]: { open: boolean, plan, paymentMethod, phone, transactionId } }
  const [editingEntries, setEditingEntries] = useState({});

  const loadUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    
    if (!token) {
      setLoading(false);
      showTopAlert('ইউজার তালিকা দেখার জন্য অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্টে লগইন করুন।', 'warning');
      return;
    }

    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}');
      setCurrentUser(u);

      const res = await fetch(`/api/users?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data && data.success) {
        setUsersCache(data.users || []);

        // Initialize override plans
        const initialOverrideForms = {};
        (data.users || []).forEach((user) => {
          const sub = user.subscription || {};
          const defaultPlan = sub.plan || 'none';
          const isStandard = ['1_month', '3_months', '6_months', '1_year', '2_years', '3_years', 'none'].includes(defaultPlan);
          initialOverrideForms[user._id] = {
            plan: isStandard ? defaultPlan : 'custom',
            customName: isStandard ? '' : defaultPlan,
            years: '',
            months: '',
            days: ''
          };
        });
        setOverrideForm(initialOverrideForms);
      } else {
        showTopAlert(data.message || 'ইউজার লোড করতে ব্যর্থ হয়েছে', 'danger');
      }
    } catch (err) {
      console.error('Error fetching user list:', err);
      showTopAlert('সার্ভার এরর: ইউজার তালিকা লোড করা সম্ভব হয়নি', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getDisplayPlan = (userObj) => {
    const sub = userObj.subscription || {};
    if (sub.active && sub.endDate && new Date(sub.endDate) > new Date()) {
      return planLabel(sub.plan);
    }
    return 'None';
  };

  // -------------------------------------------------------------
  // Filter Logic
  // -------------------------------------------------------------
  const filteredUsers = usersCache.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (u.name || '').toLowerCase().includes(q);
    const emailMatch = (u.email || '').toLowerCase().includes(q);
    const matchesSearch = nameMatch || emailMatch;

    const sub = u.subscription || {};
    const isActive = sub.active && sub.endDate && new Date(sub.endDate) > new Date();
    const pendingCount = (u.pendingRequests || []).filter((r) => r.status === 'pending').length;
    const isAdmin = u.role === 'owner' || u.role === 'admin';

    let userStatusCategory = 'expired';
    if (isAdmin) userStatusCategory = 'admin';
    else if (pendingCount > 0) userStatusCategory = 'pending';
    else if (isActive) userStatusCategory = 'active';

    const matchesStatus = statusFilter === 'all' || userStatusCategory === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // -------------------------------------------------------------
  // History Accordion Toggle
  // -------------------------------------------------------------
  const toggleHistoryDropdown = (userId) => {
    if (currentOpenUserId === userId) {
      setCurrentOpenUserId(null);
    } else {
      setCurrentOpenUserId(userId);
    }
  };

  // -------------------------------------------------------------
  // Manual Override Actions
  // -------------------------------------------------------------
  const toggleOverrideEdit = (userId) => {
    setOverrideEditing((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const cancelActivePlan = async (userId) => {
    const confirmed = await showTopAlert('এই ইউজারের Active প্ল্যান বাতিল করতে চান?', 'danger', true);
    if (!confirmed) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'none' })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert(`❌ Error updating plan!`, 'danger');
    }
  };

  const updateSubscription = async (userId) => {
    const userForm = overrideForm[userId] || { plan: 'none' };
    const plan = userForm.plan;
    let payload = { plan };

    if (plan === 'custom') {
      payload.customName = userForm.customName;
      payload.years = userForm.years;
      payload.months = userForm.months;
      payload.days = userForm.days;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        setOverrideEditing((prev) => ({ ...prev, [userId]: false }));
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert(`❌ Error updating plan!`, 'danger');
    }
  };

  // -------------------------------------------------------------
  // Request Actions (Approve / Reject)
  // -------------------------------------------------------------
  const approveRequest = async (userId, requestId) => {
    const confirmed = await showTopAlert(
      'এই রিকোয়েস্টটা Approve করলে ইউজারের মেয়াদ যোগ হয়ে যাবে। নিশ্চিত?',
      'success',
      true
    );
    if (!confirmed) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert(`❌ Error approving request!`, 'danger');
    }
  };

  const rejectRequest = async (userId, requestId) => {
    const reason = window.prompt('Reject করার কারণ লিখুন (ইউজার এটা দেখতে পাবে):', 'পেমেন্ট তথ্য সঠিক নয়।');
    if (reason === null) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert(`❌ Error rejecting request!`, 'danger');
    }
  };

  // -------------------------------------------------------------
  // History Entry Edit & Delete & Add
  // -------------------------------------------------------------
  const startEditEntry = (req) => {
    setEditingEntries((prev) => ({
      ...prev,
      [req._id]: {
        open: true,
        plan: req.plan || '',
        paymentMethod: req.paymentMethod || 'bkash',
        phone: req.phone || '',
        transactionId: req.transactionId || ''
      }
    }));
  };

  const cancelEditEntry = (reqId) => {
    setEditingEntries((prev) => ({
      ...prev,
      [reqId]: { ...prev[reqId], open: false }
    }));
  };

  const saveEditEntry = async (userId, requestId) => {
    const entryData = editingEntries[requestId];
    if (!entryData) return;

    const plan = entryData.plan.trim();
    const paymentMethod = entryData.paymentMethod;
    const phone = entryData.phone.trim();
    const transactionId = entryData.transactionId.trim();

    if (!phone || !transactionId || !plan) {
      showTopAlert('প্ল্যান, ফোন নাম্বার ও Transaction ID দিতে হবে।', 'warning');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, paymentMethod, phone, transactionId })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        cancelEditEntry(requestId);
        loadUsers();
      } else {
        showTopAlert(`❌ ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ Error updating record!', 'danger');
    }
  };

  const deleteEntry = async (userId, requestId) => {
    const confirmed = await showTopAlert('এই Payment Record-টা স্থায়ীভাবে মুছে ফেলতে চান?', 'danger', true);
    if (!confirmed) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ Error deleting record!', 'danger');
    }
  };

  const toggleAddPaymentForm = (userId) => {
    setAddPaymentForms((prev) => ({
      ...prev,
      [userId]: {
        open: !prev[userId]?.open,
        plan: prev[userId]?.plan || '1_month',
        status: prev[userId]?.status || 'approved',
        phone: '',
        transactionId: '',
        paymentMethod: 'bkash'
      }
    }));
  };

  const submitAddPayment = async (userId) => {
    const form = addPaymentForms[userId];
    if (!form) return;

    const plan = (form.plan || '').trim();
    const status = form.status;
    const phone = (form.phone || '').trim();
    const transactionId = (form.transactionId || '').trim();
    const paymentMethod = form.paymentMethod;

    if (!phone || !transactionId || !plan) {
      showTopAlert('প্ল্যান, ফোন নাম্বার ও Transaction ID দিতে হবে।', 'warning');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/pending-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, status, phone, transactionId, paymentMethod })
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        toggleAddPaymentForm(userId);
        loadUsers();
      } else {
        showTopAlert(`❌ ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('❌ Error adding record!', 'danger');
    }
  };

  const deleteUser = async (userId, userName) => {
    const confirmed = await showTopAlert(`Are you sure you want to delete user '${userName}'?`, 'danger', true);
    if (!confirmed) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadUsers();
      } else {
        showTopAlert(`❌ Delete failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert(`❌ Error deleting user!`, 'danger');
    }
  };

  return (
    <div className="container" style={{ margin: '30px auto', padding: '0 25px 25px 25px', maxWidth: '1800px' }}>
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

        .form-group { margin-bottom: 12px; }
        label { display: block; font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #555; }
        input, select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
          font-family: inherit;
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;
          flex-wrap: wrap;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .search-box { flex: 1; min-width: 250px; position: relative; }
        .search-box input {
          width: 100%;
          padding: 10px 15px 10px 35px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
        }
        .search-box input:focus { border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1); }
        .search-box i { position: absolute; left: 13px; top: 13px; color: #888; }
        .filter-box { min-width: 220px; }
        .filter-box select {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          background: white;
          font-weight: bold;
          color: #444;
          outline: none;
        }

        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
        th { background-color: #f8f9fa; color: #333; font-weight: bold; }
        tr:hover { background-color: #f1f5f9; }

        .badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; display: inline-block; }
        .badge-active { background-color: #d4edda; color: #155724; }
        .badge-expired { background-color: #f8d7da; color: #721c24; }
        .badge-owner { background-color: #cce5ff; color: #004085; }
        .badge-requested { background-color: #ffc107; color: #212529; }
        .badge-type { background-color: #e2e8f0; color: #333; font-size: 10.5px; }

        .plan-select { padding: 6px 10px; border-radius: 4px; border: 1px solid #ccc; font-size: 13px; }

        .btn-action {
          padding: 6px 12px;
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
        .btn-action:hover { opacity: 0.9; }
        .btn-update { background-color: #28a745; }
        .btn-delete { background-color: #dc3545; }
        .btn-edit { background-color: #007bff; }
        .btn-cancel-small { background-color: #6c757d; }

        .table-responsive { overflow-x: auto; }

        .user-name-link { cursor: pointer; color: #007bff; text-decoration: underline; }
        .user-name-link:hover { color: #0056b3; }
        .btn-view-history { background-color: #17a2b8; margin-top: 6px; font-size: 11px; padding: 4px 10px; }

        .override-plan-text { font-weight: bold; color: #28a745; margin-bottom: 6px; }
        .override-actions { display: flex; gap: 6px; }

        /* Dropdown History Styles */
        .history-row { background-color: #f8f9fa; }
        .history-container-inner {
          padding: 15px 25px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin: 10px;
          background: white;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 10px;
        }

        .add-payment-form {
          background: #f4f8ff;
          border: 1px dashed #007bff;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 18px;
        }
        .add-payment-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }

        .history-entry {
          background: #fff8e1;
          border: 1px solid #ffe58a;
          border-radius: 8px;
          padding: 12px 15px;
          margin-bottom: 12px;
          transition: 0.3s ease;
        }
        .history-entry:hover { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); }
        .history-entry.rejected { background: #fdf2f2; border-color: #f3b8bd; }
        .history-entry.approved { background: #f0faf4; border-color: #a8e6b8; }
        .history-entry .he-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; }
        .history-entry .he-plan { font-weight: bold; font-size: 15px; color: #333; }

        .he-body-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 8px;
        }

        .history-entry .he-info {
          font-size: 13px;
          color: #555;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          line-height: 1.5;
          flex: 1;
        }
        .history-entry .he-actions { display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0; }

        .history-entry .he-edit-form { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px; }
        .history-entry .he-edit-form .full-width { grid-column: 1 / -1; }

        .no-history-text { color: #888; font-size: 13.5px; text-align: center; }
        .empty-state-container { position: relative; display: flex; align-items: center; min-height: 40px; margin-bottom: 5px; }
        .empty-state-btn { position: absolute; left: 0; z-index: 2; }
        .empty-state-text { width: 100%; text-align: center; z-index: 1; }

        @media (max-width: 900px) {
          table { display: block; overflow-x: auto; }
          .add-payment-form .form-row, .history-entry .he-edit-form { grid-template-columns: 1fr; }
          .he-body-wrap { flex-direction: column; align-items: flex-start; gap: 10px; }
          .empty-state-container { flex-direction: column; align-items: flex-start; gap: 10px; }
          .empty-state-btn { position: static; }
        }
      `}</style>

      <div className="box">
        <h3>
          <i className="fa-solid fa-users" style={{ marginRight: '8px', color: '#007bff' }}></i>
          Registered Users & Subscription Plans
        </h3>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
          নতুন রিকোয়েস্ট আসলে তা সরাসরি ইউজারের নামের নিচেই দেখাবে। নিচে ফিল্টার এবং সার্চ ব্যবহার করে ইউজার খুঁজে বের করুন।
        </p>

        {/* Controls Bar: Search & Status Filter */}
        <div className="controls-bar">
          <div className="search-box">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              id="searchInput"
              placeholder="Search by Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Users Status</option>
              <option value="pending">Pending Request</option>
              <option value="active">Active Subscription</option>
              <option value="expired">Expired / Inactive</option>
              <option value="admin">Owner / Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Payment History</th>
                <th>Current Plan</th>
                <th>Expiry Date</th>
                <th>Manual Override</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody id="userTableBody">
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '25px', color: '#888' }}>
                    <b>কোনো ইউজার পাওয়া যায়নি!</b>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => {
                  const sub = u.subscription || {};
                  const isActive = sub.active && sub.endDate && new Date(sub.endDate) > new Date();
                  const pendingCount = (u.pendingRequests || []).filter((r) => r.status === 'pending').length;
                  const totalRecords = (u.pendingRequests || []).length;

                  let statusBadge = null;
                  if (u.role === 'owner' || u.role === 'admin') {
                    statusBadge = <span className="badge badge-owner">{u.role.toUpperCase()}</span>;
                  } else if (pendingCount > 0) {
                    statusBadge = <span className="badge badge-requested">{pendingCount} Requested</span>;
                  } else if (isActive) {
                    statusBadge = <span className="badge badge-active">Active</span>;
                  } else {
                    statusBadge = <span className="badge badge-expired">Expired / Inactive</span>;
                  }

                  const displayPlanText = getDisplayPlan(u);
                  const expiryDate = sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A';

                  let remainingTime = null;
                  if (isActive && u.role !== 'owner' && u.role !== 'admin') {
                    const remainingText = getRemainingTime(sub.endDate);
                    if (remainingText !== 'Expired') {
                      remainingTime = (
                        <>
                          <br />
                          <span
                            style={{
                              color: '#e67e22',
                              fontSize: '12px',
                              fontWeight: 'normal',
                              display: 'inline-block',
                              marginTop: '4px'
                            }}
                          >
                            Remaining Time: {remainingText}
                          </span>
                        </>
                      );
                    }
                  }

                  const userOverride = overrideForm[u._id] || { plan: 'none' };
                  const isCustomActive = userOverride.plan === 'custom';
                  const isEditingOverride = !!overrideEditing[u._id];

                  const pendingReqsForAlert = (u.pendingRequests || []).filter((r) => r.status === 'pending');
                  const isHistoryOpen = currentOpenUserId === u._id;
                  const addFormState = addPaymentForms[u._id] || { open: false };

                  return (
                    <React.Fragment key={u._id}>
                      {/* Main User Row */}
                      <tr>
                        <td>{index + 1}</td>
                        <td>
                          <b className="user-name-link" onClick={() => toggleHistoryDropdown(u._id)}>
                            {u.name}
                          </b>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <small>{u.role}</small>
                        </td>
                        <td>{statusBadge}</td>
                        <td>
                          {totalRecords > 0 ? (
                            <span>
                              {totalRecords} Record{totalRecords > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span style={{ color: '#888' }}>No Record</span>
                          )}
                          <br />
                          <button
                            className="btn-action btn-view-history"
                            id={`btn-history-${u._id}`}
                            onClick={() => toggleHistoryDropdown(u._id)}
                          >
                            {isHistoryOpen ? 'Close History' : 'View History'}
                          </button>
                        </td>
                        <td>
                          <b>{displayPlanText}</b>
                          {remainingTime}
                        </td>
                        <td>{expiryDate}</td>
                        <td>
                          {u.role === 'customer' ? (
                            isActive ? (
                              !isEditingOverride ? (
                                <div className="override-view-box">
                                  <div className="override-plan-text">{displayPlanText}</div>
                                  <div className="override-actions">
                                    <button
                                      className="btn-action btn-edit"
                                      onClick={() => toggleOverrideEdit(u._id)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn-action btn-delete"
                                      onClick={() => cancelActivePlan(u._id)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="override-edit-box">
                                  <select
                                    className="plan-select"
                                    value={userOverride.plan}
                                    onChange={(e) =>
                                      setOverrideForm({
                                        ...overrideForm,
                                        [u._id]: { ...userOverride, plan: e.target.value }
                                      })
                                    }
                                  >
                                    <option value="none">Cancel Plan</option>
                                    <option value="1_month">1 Month</option>
                                    <option value="3_months">3 Months</option>
                                    <option value="6_months">6 Months</option>
                                    <option value="1_year">1 Year</option>
                                    <option value="2_years">2 Years</option>
                                    <option value="3_years">3 Years</option>
                                    <option value="custom">Custom Plan</option>
                                  </select>
                                  {isCustomActive && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                      <input
                                        type="text"
                                        placeholder="Plan Name (e.g. Custom Package)"
                                        value={userOverride.customName || ''}
                                        onChange={(e) =>
                                          setOverrideForm({
                                            ...overrideForm,
                                            [u._id]: { ...userOverride, customName: e.target.value }
                                          })
                                        }
                                        style={{ width: '100%', padding: '5px', fontSize: '12px' }}
                                      />
                                      <input
                                        type="number"
                                        placeholder="Years"
                                        min="0"
                                        value={userOverride.years || ''}
                                        onChange={(e) =>
                                          setOverrideForm({
                                            ...overrideForm,
                                            [u._id]: { ...userOverride, years: e.target.value }
                                          })
                                        }
                                        style={{ width: '30%', flex: 1, padding: '5px', fontSize: '12px' }}
                                      />
                                      <input
                                        type="number"
                                        placeholder="Months"
                                        min="0"
                                        value={userOverride.months || ''}
                                        onChange={(e) =>
                                          setOverrideForm({
                                            ...overrideForm,
                                            [u._id]: { ...userOverride, months: e.target.value }
                                          })
                                        }
                                        style={{ width: '30%', flex: 1, padding: '5px', fontSize: '12px' }}
                                      />
                                      <input
                                        type="number"
                                        placeholder="Days"
                                        min="0"
                                        value={userOverride.days || ''}
                                        onChange={(e) =>
                                          setOverrideForm({
                                            ...overrideForm,
                                            [u._id]: { ...userOverride, days: e.target.value }
                                          })
                                        }
                                        style={{ width: '30%', flex: 1, padding: '5px', fontSize: '12px' }}
                                      />
                                    </div>
                                  )}
                                  <div className="override-actions" style={{ marginTop: '6px' }}>
                                    <button
                                      className="btn-action btn-update"
                                      onClick={() => updateSubscription(u._id)}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="btn-action btn-cancel-small"
                                      onClick={() => toggleOverrideEdit(u._id)}
                                    >
                                      Back
                                    </button>
                                  </div>
                                </div>
                              )
                            ) : (
                              <div>
                                <select
                                  className="plan-select"
                                  value={userOverride.plan}
                                  onChange={(e) =>
                                    setOverrideForm({
                                      ...overrideForm,
                                      [u._id]: { ...userOverride, plan: e.target.value }
                                    })
                                  }
                                >
                                  <option value="none">Select Plan</option>
                                  <option value="1_month">1 Month</option>
                                  <option value="3_months">3 Months</option>
                                  <option value="6_months">6 Months</option>
                                  <option value="1_year">1 Year</option>
                                  <option value="2_years">2 Years</option>
                                  <option value="3_years">3 Years</option>
                                  <option value="custom">Custom Plan</option>
                                </select>
                                {isCustomActive && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                    <input
                                      type="text"
                                      placeholder="Plan Name (e.g. Custom Package)"
                                      value={userOverride.customName || ''}
                                      onChange={(e) =>
                                        setOverrideForm({
                                          ...overrideForm,
                                          [u._id]: { ...userOverride, customName: e.target.value }
                                        })
                                      }
                                      style={{ width: '100%', padding: '5px', fontSize: '12px' }}
                                    />
                                    <input
                                      type="number"
                                      placeholder="Years"
                                      min="0"
                                      value={userOverride.years || ''}
                                      onChange={(e) =>
                                        setOverrideForm({
                                          ...overrideForm,
                                          [u._id]: { ...userOverride, years: e.target.value }
                                        })
                                      }
                                      style={{ width: '30%', flex: 1, padding: '5px', fontSize: '12px' }}
                                    />
                                    <input
                                      type="number"
                                      placeholder="Months"
                                      min="0"
                                      value={userOverride.months || ''}
                                      onChange={(e) =>
                                        setOverrideForm({
                                          ...overrideForm,
                                          [u._id]: { ...userOverride, months: e.target.value }
                                        })
                                      }
                                      style={{ width: '30%', flex: 1, padding: '5px', fontSize: '12px' }}
                                    />
                                    <input
                                      type="number"
                                      placeholder="Days"
                                      min="0"
                                      value={userOverride.days || ''}
                                      onChange={(e) =>
                                        setOverrideForm({
                                          ...overrideForm,
                                          [u._id]: { ...userOverride, days: e.target.value }
                                        })
                                      }
                                      style={{ width: '30%', flex: 1, padding: '5px', fontSize: '12px' }}
                                    />
                                  </div>
                                )}
                                <button
                                  className="btn-action btn-update"
                                  onClick={() => updateSubscription(u._id)}
                                  style={{ marginTop: '6px', display: 'block' }}
                                >
                                  Save Plan
                                </button>
                              </div>
                            )
                          ) : (
                            <small style={{ color: '#888' }}>Full Access</small>
                          )}
                        </td>
                        <td>
                          {currentUser.role === 'owner' && u.role !== 'owner' ? (
                            <button
                              className="btn-action btn-delete"
                              onClick={() => deleteUser(u._id, u.name)}
                            >
                              Delete
                            </button>
                          ) : (
                            <small style={{ color: '#aaa' }}>N/A</small>
                          )}
                        </td>
                      </tr>

                      {/* Pending Requests Alert Rows */}
                      {pendingReqsForAlert.map((pr) => (
                        <tr
                          key={pr._id}
                          style={{ backgroundColor: '#fffaf0', borderBottom: '2px solid #e0e0e0' }}
                        >
                          <td colSpan={10} style={{ padding: '12px 15px', borderLeft: '4px solid #ffc107' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '8px'
                                }}
                              >
                                <span className="badge" style={{ background: '#ffc107', color: '#212529' }}>
                                  <i className="fa-solid fa-bell"></i> New Request
                                </span>
                                <strong style={{ color: '#333', fontSize: '14px' }}>{planLabel(pr.plan)}</strong>
                                <span className="badge badge-type">{typeLabel(pr.type)}</span>
                                <span style={{ color: '#ccc' }}>|</span> ফোন: <b>{pr.phone}</b>
                                <span style={{ color: '#ccc' }}>|</span> Trx: <b>{pr.transactionId}</b>
                                <span style={{ color: '#ccc' }}>|</span> মাধ্যম: <b>{methodLabel(pr.paymentMethod)}</b>
                                <span style={{ color: '#ccc' }}>|</span> তারিখ:{' '}
                                <b>{new Date(pr.requestedAt).toLocaleString()}</b>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="btn-action btn-update"
                                  onClick={() => approveRequest(u._id, pr._id)}
                                >
                                  <i className="fa-solid fa-check"></i> Approve
                                </button>
                                <button
                                  className="btn-action btn-delete"
                                  onClick={() => rejectRequest(u._id, pr._id)}
                                >
                                  <i className="fa-solid fa-xmark"></i> Reject
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Payment History Accordion Row */}
                      {isHistoryOpen && (
                        <tr className="history-row" id={`history-row-${u._id}`}>
                          <td colSpan={10} style={{ padding: 0 }}>
                            <div className="history-container-inner">
                              <div className="history-header">
                                <h4 style={{ margin: 0, color: '#007bff' }}>
                                  <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '6px' }}></i>
                                  Payment History for {u.name}
                                </h4>
                                <button
                                  className="btn-action btn-cancel-small"
                                  onClick={() => toggleHistoryDropdown(u._id)}
                                >
                                  <i className="fa-solid fa-xmark"></i> Close History
                                </button>
                              </div>

                              {/* History Records List */}
                              {(u.pendingRequests || []).length === 0 ? (
                                <div className="empty-state-container">
                                  <div className="empty-state-btn">
                                    <button
                                      className="btn-action btn-update"
                                      onClick={() => toggleAddPaymentForm(u._id)}
                                    >
                                      <i className="fa-solid fa-plus"></i> Add New Payment Record
                                    </button>
                                  </div>
                                  <div className="empty-state-text">
                                    <p className="no-history-text" style={{ margin: 0, padding: 0 }}>
                                      এখনো কোনো Payment Record নেই।
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ marginBottom: '15px' }}>
                                    {[...(u.pendingRequests || [])]
                                      .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
                                      .map((r) => {
                                        const isRejected = r.status === 'rejected';
                                        const isApproved = r.status === 'approved';
                                        const isPending = r.status === 'pending';
                                        const cardClass = isRejected ? 'rejected' : isApproved ? 'approved' : '';
                                        const statusLabel = isRejected ? 'Rejected' : isApproved ? 'Active' : 'Pending';
                                        const badgeClass = isRejected
                                          ? 'badge-expired'
                                          : isApproved
                                          ? 'badge-active'
                                          : 'badge-requested';

                                        const editState = editingEntries[r._id];

                                        return (
                                          <div key={r._id} className={`history-entry ${cardClass}`}>
                                            <div className="he-top">
                                              <span className="he-plan">{planLabel(r.plan)}</span>
                                              <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                                            </div>

                                            {!editState?.open ? (
                                              <div className="he-body-wrap">
                                                <div className="he-info">
                                                  <span className="badge badge-type">{typeLabel(r.type)}</span>
                                                  <span style={{ color: '#ccc' }}>|</span>
                                                  ফোন: <b>{r.phone}</b>
                                                  <span style={{ color: '#ccc' }}>|</span>
                                                  Trx ID: <b>{r.transactionId}</b>
                                                  <span style={{ color: '#ccc' }}>|</span>
                                                  মাধ্যম: <b>{methodLabel(r.paymentMethod)}</b>
                                                  <span style={{ color: '#ccc' }}>|</span>
                                                  তারিখ: <b>{new Date(r.requestedAt).toLocaleString()}</b>
                                                  {isRejected && r.rejectionReason && (
                                                    <>
                                                      <span style={{ color: '#ccc' }}>|</span>
                                                      <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                                        কারণ: {r.rejectionReason}
                                                      </span>
                                                    </>
                                                  )}
                                                </div>
                                                <div className="he-actions">
                                                  {isPending && (
                                                    <>
                                                      <button
                                                        className="btn-action btn-update"
                                                        onClick={() => approveRequest(u._id, r._id)}
                                                      >
                                                        Approve
                                                      </button>
                                                      <button
                                                        className="btn-action btn-delete"
                                                        onClick={() => rejectRequest(u._id, r._id)}
                                                      >
                                                        Reject
                                                      </button>
                                                    </>
                                                  )}
                                                  <button
                                                    className="btn-action btn-edit"
                                                    onClick={() => startEditEntry(r)}
                                                  >
                                                    Edit
                                                  </button>
                                                  <button
                                                    className="btn-action btn-delete"
                                                    onClick={() => deleteEntry(u._id, r._id)}
                                                  >
                                                    Delete
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="he-edit-form" style={{ marginTop: '10px' }}>
                                                <input
                                                  type="text"
                                                  value={editState.plan}
                                                  onChange={(e) =>
                                                    setEditingEntries({
                                                      ...editingEntries,
                                                      [r._id]: { ...editState, plan: e.target.value }
                                                    })
                                                  }
                                                  placeholder="Package Name (e.g. 1_month or Custom Name)"
                                                />
                                                <select
                                                  value={editState.paymentMethod}
                                                  onChange={(e) =>
                                                    setEditingEntries({
                                                      ...editingEntries,
                                                      [r._id]: { ...editState, paymentMethod: e.target.value }
                                                    })
                                                  }
                                                >
                                                  <option value="bkash">বিকাশ</option>
                                                  <option value="nagad">নগদ</option>
                                                </select>
                                                <input
                                                  type="text"
                                                  value={editState.phone}
                                                  onChange={(e) =>
                                                    setEditingEntries({
                                                      ...editingEntries,
                                                      [r._id]: { ...editState, phone: e.target.value }
                                                    })
                                                  }
                                                  placeholder="ফোন নাম্বার"
                                                />
                                                <input
                                                  type="text"
                                                  value={editState.transactionId}
                                                  onChange={(e) =>
                                                    setEditingEntries({
                                                      ...editingEntries,
                                                      [r._id]: { ...editState, transactionId: e.target.value }
                                                    })
                                                  }
                                                  placeholder="Transaction ID"
                                                />
                                                <div className="full-width" style={{ display: 'flex', gap: '6px' }}>
                                                  <button
                                                    className="btn-action btn-update"
                                                    onClick={() => saveEditEntry(u._id, r._id)}
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    className="btn-action btn-cancel-small"
                                                    onClick={() => cancelEditEntry(r._id)}
                                                  >
                                                    বাতিল
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>

                                  <button
                                    className="btn-action btn-update"
                                    onClick={() => toggleAddPaymentForm(u._id)}
                                  >
                                    <i className="fa-solid fa-plus"></i> Add New Payment Record
                                  </button>
                                </div>
                              )}

                              {/* Add Payment Form */}
                              {addFormState.open && (
                                <div className="add-payment-form" style={{ marginTop: '15px' }}>
                                  <div className="form-row">
                                    <div>
                                      <label>প্যাকেজ নাম (যে কোনো কিছু)</label>
                                      <input
                                        type="text"
                                        placeholder="e.g. 3_months বা Custom"
                                        value={addFormState.plan}
                                        onChange={(e) =>
                                          setAddPaymentForms({
                                            ...addPaymentForms,
                                            [u._id]: { ...addFormState, plan: e.target.value }
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label>Status</label>
                                      <select
                                        value={addFormState.status}
                                        onChange={(e) =>
                                          setAddPaymentForms({
                                            ...addPaymentForms,
                                            [u._id]: { ...addFormState, status: e.target.value }
                                          })
                                        }
                                      >
                                        <option value="approved">Active (Approved)</option>
                                        <option value="pending">Pending</option>
                                        <option value="rejected">Rejected</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="form-row">
                                    <div>
                                      <label>ফোন নাম্বার</label>
                                      <input
                                        type="text"
                                        placeholder="017XXXXXXXX"
                                        value={addFormState.phone}
                                        onChange={(e) =>
                                          setAddPaymentForms({
                                            ...addPaymentForms,
                                            [u._id]: { ...addFormState, phone: e.target.value }
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label>Transaction ID</label>
                                      <input
                                        type="text"
                                        placeholder="Transaction ID"
                                        value={addFormState.transactionId}
                                        onChange={(e) =>
                                          setAddPaymentForms({
                                            ...addPaymentForms,
                                            [u._id]: { ...addFormState, transactionId: e.target.value }
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div style={{ marginBottom: '10px' }}>
                                    <label>পেমেন্ট মাধ্যম</label>
                                    <select
                                      value={addFormState.paymentMethod}
                                      onChange={(e) =>
                                        setAddPaymentForms({
                                          ...addPaymentForms,
                                          [u._id]: { ...addFormState, paymentMethod: e.target.value }
                                        })
                                      }
                                    >
                                      <option value="bkash">বিকাশ (Bkash)</option>
                                      <option value="nagad">নগদ (Nagad)</option>
                                    </select>
                                  </div>
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                      type="button"
                                      className="btn-action btn-cancel-small"
                                      style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                                      onClick={() => toggleAddPaymentForm(u._id)}
                                    >
                                      বাতিল
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-action btn-update"
                                      style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                                      onClick={() => submitAddPayment(u._id)}
                                    >
                                      Save Record
                                    </button>
                                  </div>
                                </div>
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
    </div>
  );
}
