'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Expanded Payment History user ID
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Manual Override plan select state per user: { [userId]: '1_month' }
  const [overridePlans, setOverridePlans] = useState({});

  // Create admin modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState('admin');

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

    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }

    const parts = [];
    if (years > 0) parts.push(`${years} Year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} Month${months > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} Day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(' ') : 'Less than 1 Hour';
  };

  const loadUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.success) {
        setUsers(data.users || []);
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

  // Filter users
  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
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

  // Approve Request
  const handleApproveRequest = async (userId, requestId) => {
    const confirm = await showTopAlert('Are you sure you want to approve this subscription request?', 'warning', true);
    if (!confirm) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('✅ Subscription request approved successfully!', 'success');
        loadUsers();
      } else {
        showTopAlert('❌ ' + (data.message || 'Approval failed!'), 'danger');
      }
    } catch (err) {
      showTopAlert('Server error during approval!', 'danger');
    }
  };

  // Reject Request
  const handleRejectRequest = async (userId, requestId) => {
    const reason = prompt('Please enter the rejection reason for the user:');
    if (reason === null) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/pending-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reason.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('Request rejected successfully.', 'warning');
        loadUsers();
      } else {
        showTopAlert('❌ ' + (data.message || 'Rejection failed!'), 'danger');
      }
    } catch (err) {
      showTopAlert('Server error during rejection!', 'danger');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, userName) => {
    const confirm = await showTopAlert(`Are you sure you want to delete user '${userName}'? This cannot be undone.`, 'danger', true);
    if (!confirm) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('User deleted successfully!', 'success');
        loadUsers();
      } else {
        showTopAlert('❌ ' + (data.message || 'Failed to delete user!'), 'danger');
      }
    } catch (err) {
      showTopAlert('Server error deleting user!', 'danger');
    }
  };

  // Manual Override Subscription
  const handleManualOverride = async (userId) => {
    const plan = overridePlans[userId];
    if (!plan) {
      showTopAlert('Please select a plan to assign!', 'warning');
      return;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('Subscription plan assigned successfully!', 'success');
        loadUsers();
      } else {
        showTopAlert('❌ ' + (data.message || 'Override failed!'), 'danger');
      }
    } catch (err) {
      showTopAlert('Server error assigning plan!', 'danger');
    }
  };

  // Create Admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch('/api/users/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: adminName.trim(),
          email: adminEmail.trim(),
          password: adminPassword,
          role: adminRole
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('Admin user created successfully!', 'success');
        setShowAdminModal(false);
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        loadUsers();
      } else {
        showTopAlert('❌ ' + (data.message || 'Failed to create admin!'), 'danger');
      }
    } catch (err) {
      showTopAlert('Server error creating admin!', 'danger');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 25px 25px' }}>
      <style jsx>{`
        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
        }
        h3 {
          margin-top: 0;
          color: var(--dark, #2c3e50);
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .controls-bar {
          display: flex;
          gap: 15px;
          margin: 20px 0;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
        }
        .search-box {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 14px;
          width: 320px;
          gap: 10px;
        }
        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 14px;
        }
        .filter-box select {
          padding: 9px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          font-size: 14px;
          background: white;
        }
        .table-responsive {
          overflow-x: auto;
          margin-top: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th, td {
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13.5px;
        }
        th {
          background: #f8fafc;
          font-weight: bold;
          color: #475569;
          white-space: nowrap;
        }
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: bold;
        }
        .badge-active { background: #d4edda; color: #155724; }
        .badge-expired { background: #f8d7da; color: #721c24; }
        .badge-pending { background: #fff3cd; color: #856404; }
        .badge-owner { background: #e2e3e5; color: #383d41; }
        .badge-admin { background: #cce5ff; color: #004085; }

        .btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12.5px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .btn-primary { background-color: var(--primary, #007bff); color: white; }
        .btn-success { background-color: #28a745; color: white; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-warning { background-color: #ffc107; color: #212529; }
        .btn-secondary { background-color: #6c757d; color: white; }

        .history-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 12px;
          margin-top: 8px;
        }
      `}</style>

      <div className="box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h3><i className="fa-solid fa-users"></i> Registered Users & Subscription Plans</h3>
            <p style={{ color: '#666', fontSize: '13.5px', margin: '4px 0 0 0' }}>
              নতুন রিকোয়েস্ট আসলে তা সরাসরি ইউজারের নামের নিচেই দেখাবে। নিচে ফিল্টার এবং সার্চ ব্যবহার করে ইউজার খুঁজে বের করুন।
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdminModal(true)}>
            <i className="fa-solid fa-user-shield"></i> + নতুন অ্যাডমিন যোগ করুন
          </button>
        </div>

        <div className="controls-bar">
          <div className="search-box">
            <i className="fa-solid fa-search" style={{ color: '#888' }}></i>
            <input
              type="text"
              placeholder="Search by Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Users Status</option>
              <option value="pending">Pending Request</option>
              <option value="active">Active Subscription</option>
              <option value="expired">Expired / Inactive</option>
              <option value="admin">Owner / Admin</option>
            </select>
          </div>
        </div>

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
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                    <b>কোনো ইউজার পাওয়া যায়নি!</b>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const sub = u.subscription || {};
                  const isActive = sub.active && sub.endDate && new Date(sub.endDate) > new Date();
                  const pendingRequests = (u.pendingRequests || []).filter(r => r.status === 'pending');
                  const totalRequests = (u.pendingRequests || []).length;
                  const isExpanded = expandedUserId === u._id;

                  return (
                    <React.Fragment key={u._id || idx}>
                      <tr>
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{u.name}</strong>
                          {pendingRequests.length > 0 && (
                            <div style={{ marginTop: '3px' }}>
                              <span className="badge badge-pending">
                                🔔 {pendingRequests.length} Pending Request
                              </span>
                            </div>
                          )}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'owner' ? 'badge-owner' : u.role === 'admin' ? 'badge-admin' : 'badge-secondary'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {u.role === 'owner' || u.role === 'admin' ? (
                            <span className="badge badge-owner">ADMIN</span>
                          ) : isActive ? (
                            <span className="badge badge-active">ACTIVE</span>
                          ) : (
                            <span className="badge badge-expired">EXPIRED</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '11.5px' }}
                            onClick={() => setExpandedUserId(isExpanded ? null : u._id)}
                          >
                            <i className="fa-solid fa-clock-rotate-left"></i> History ({totalRequests})
                          </button>
                        </td>
                        <td>
                          <strong>{sub.active && sub.plan ? sub.plan.replace('_', ' ').toUpperCase() : 'None'}</strong>
                        </td>
                        <td>
                          {sub.endDate ? (
                            <div>
                              <div>{new Date(sub.endDate).toLocaleDateString('bn-BD')}</div>
                              <small style={{ color: isActive ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                ({getRemainingTime(sub.endDate)})
                              </small>
                            </div>
                          ) : (
                            <span style={{ color: '#888' }}>-</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <select
                              style={{ padding: '4px', fontSize: '12px' }}
                              value={overridePlans[u._id] || ''}
                              onChange={(e) => setOverridePlans({ ...overridePlans, [u._id]: e.target.value })}
                            >
                              <option value="">-- Plan --</option>
                              <option value="1_month">1 Month</option>
                              <option value="3_months">3 Months</option>
                              <option value="6_months">6 Months</option>
                              <option value="1_year">1 Year</option>
                              <option value="2_years">2 Years</option>
                              <option value="3_years">3 Years</option>
                            </select>
                            <button
                              className="btn btn-success"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleManualOverride(u._id)}
                            >
                              Apply
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleDeleteUser(u._id, u.name)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>

                      {/* Accordion History details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="10" style={{ background: '#f8fafc', padding: '15px 20px' }}>
                            <div className="history-box">
                              <h5 style={{ margin: '0 0 10px 0', color: 'var(--dark)' }}>
                                <i className="fa-solid fa-receipt"></i> Payment & Subscription Requests for {u.name}:
                              </h5>

                              {(u.pendingRequests || []).length === 0 ? (
                                <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>কোনো রিকোয়েস্ট হিস্টোরি পাওয়া যায়নি।</p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {(u.pendingRequests || []).map((req, rIdx) => (
                                    <div
                                      key={req._id || rIdx}
                                      style={{
                                        background: 'white',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '5px',
                                        padding: '10px 14px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '10px'
                                      }}
                                    >
                                      <div>
                                        <div>
                                          <strong>Plan:</strong> {(req.plan || '').replace('_', ' ').toUpperCase()} |{' '}
                                          <strong>Method:</strong> {req.paymentMethod === 'bkash' ? 'বিকাশ' : req.paymentMethod === 'nagad' ? 'নগদ' : req.paymentMethod} |{' '}
                                          <strong>Sender Phone:</strong> <code>{req.phoneNumber}</code>
                                        </div>
                                        <div style={{ fontSize: '12.5px', color: '#666', marginTop: '4px' }}>
                                          <strong>TrxID:</strong> <code style={{ color: '#007bff' }}>{req.trxId}</code> |{' '}
                                          <strong>Date:</strong> {req.requestDate ? new Date(req.requestDate).toLocaleString('bn-BD') : 'N/A'} |{' '}
                                          <strong>Status:</strong>{' '}
                                          <span className={`badge ${req.status === 'approved' ? 'badge-active' : req.status === 'rejected' ? 'badge-expired' : 'badge-pending'}`}>
                                            {req.status.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>

                                      {req.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                          <button
                                            className="btn btn-success"
                                            style={{ padding: '5px 12px' }}
                                            onClick={() => handleApproveRequest(u._id, req._id)}
                                          >
                                            <i className="fa-solid fa-check"></i> Approve
                                          </button>
                                          <button
                                            className="btn btn-danger"
                                            style={{ padding: '5px 12px' }}
                                            onClick={() => handleRejectRequest(u._id, req._id)}
                                          >
                                            <i className="fa-solid fa-xmark"></i> Reject
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
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

      {/* CREATE ADMIN MODAL */}
      {showAdminModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{ background: 'white', borderRadius: '8px', maxWidth: '450px', width: '100%', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>নতুন অ্যাডমিন তৈরি করুন</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }} onClick={() => setShowAdminModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13.5px', marginBottom: '4px' }}>Admin Name:</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13.5px', marginBottom: '4px' }}>Admin Email:</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13.5px', marginBottom: '4px' }}>Password:</label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '5px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13.5px', marginBottom: '4px' }}>Role:</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '5px' }}
                >
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdminModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
