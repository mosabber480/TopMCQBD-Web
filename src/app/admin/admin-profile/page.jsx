'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminProfilePage() {
  const [currentUser, setCurrentUser] = useState({});
  const [loading, setLoading] = useState(true);

  // Password changer form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  // Create admin form state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [todayLogins, setTodayLogins] = useState(0);
  const [sevenDayLogins, setSevenDayLogins] = useState(0);
  const [thirtyDayLogins, setThirtyDayLogins] = useState(0);

  // Pending & Cancelled Users list
  const [pendingUsers, setPendingUsers] = useState([]);
  const [planSelections, setPlanSelections] = useState({});

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('quiz_user') || '{}');
      setCurrentUser(u);
    } catch (e) {}

    loadStatsAndUsers();
  }, []);

  const loadStatsAndUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) {
        setLoading(false);
        return;
      }

      let active = 0;
      let pending = 0;
      let inactive = 0;
      let total = 0;
      let today = 0;
      let last7 = 0;
      let last30 = 0;
      const now = new Date();

      data.users.forEach(u => {
        if (u.role === 'customer') {
          total++;
          const sub = u.subscription || {};
          const isActive = sub.active && sub.endDate && new Date(sub.endDate) > new Date();
          const pendingReqs = (u.pendingRequests || []).filter(r => r.status === 'pending');
          const isRequested = pendingReqs.length > 0;

          if (isRequested) pending++;
          else if (isActive) active++;
          else inactive++;
        }

        if (u.lastLogin) {
          const lastLoginDate = new Date(u.lastLogin);
          if (lastLoginDate.toDateString() === now.toDateString()) {
            today++;
          }
          const diffTime = Math.abs(now - lastLoginDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) last7++;
          if (diffDays <= 30) last30++;
        }
      });

      setTotalUsers(total);
      setActiveCount(active);
      setPendingCount(pending);
      setCancelledCount(inactive);
      setTodayLogins(today);
      setSevenDayLogins(last7);
      setThirtyDayLogins(last30);

      // Pending & Cancelled Users
      const filtered = data.users.filter(
        u =>
          u.role === 'customer' &&
          (!u.subscription ||
            u.subscription.plan === 'none' ||
            u.subscription.active === false ||
            (u.pendingRequests && u.pendingRequests.some(r => r.status === 'pending')))
      );

      setPendingUsers(filtered);

      // Initialize default plan selections
      const initialPlans = {};
      filtered.forEach(u => {
        const pendingReq = (u.pendingRequests || []).find(r => r.status === 'pending');
        initialPlans[u._id] = pendingReq ? pendingReq.plan : u.subscription?.plan || 'none';
      });
      setPlanSelections(initialPlans);
    } catch (err) {
      console.error('Stats loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showTopAlert('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!', 'warning');
      return;
    }

    setPwSubmitting(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
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
        showTopAlert('✅ ' + data.message, 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        showTopAlert('❌ ' + (data.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে'), 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার যোগাযোগে সমস্যা হয়েছে!', 'danger');
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e) => {
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
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        loadStatsAndUsers();
      } else {
        showTopAlert('❌ ' + (data.message || 'এডমিন অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে'), 'danger');
      }
    } catch (err) {
      showTopAlert('সার্ভার যোগাযোগে সমস্যা হয়েছে!', 'danger');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleUpdateSubscription = async (userId) => {
    const selectedPlan = planSelections[userId] || 'none';
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch(`/api/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: selectedPlan })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert(`✅ ${data.message}`, 'success');
        loadStatsAndUsers();
      } else {
        showTopAlert(`❌ Failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('Failed to update subscription', 'danger');
    }
  };

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
        loadStatsAndUsers();
      } else {
        showTopAlert(`❌ Delete failed: ${data.message}`, 'danger');
      }
    } catch (err) {
      showTopAlert('Error deleting user', 'danger');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('quiz_token');
      localStorage.removeItem('user');
      localStorage.removeItem('quiz_user');
      window.location.href = '/login';
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 25px 30px 25px' }}>
      <style jsx>{`
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .box {
          background: white;
          padding: 25px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
        }
        .form-group {
          margin-bottom: 14px;
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
          padding: 9px 35px 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }
        input:focus {
          border-color: #007bff;
        }
        .toggle-password {
          position: absolute;
          right: 12px;
          top: 34px;
          cursor: pointer;
          color: #888;
        }
        .btn-submit {
          background-color: #007bff;
          width: 100%;
          padding: 10px;
          font-size: 14px;
          border: none;
          border-radius: 5px;
          color: white;
          cursor: pointer;
          font-weight: bold;
          transition: opacity 0.2s;
        }
        .btn-submit:hover {
          opacity: 0.9;
        }
        .profile-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: #64748b;
          margin: 0 auto 15px;
        }
        .info-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .stat-box-container {
          display: flex;
          gap: 15px;
          justify-content: space-around;
        }
        .stat-item {
          text-align: center;
        }
        .stat-item h4 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }
        .stat-item p {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th,
        td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
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
        }
        .badge-active {
          background-color: #d4edda;
          color: #155724;
        }
        .badge-expired {
          background-color: #f8d7da;
          color: #721c24;
        }
        .badge-requested {
          background-color: #ffc107;
          color: #212529;
        }
        .plan-select {
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid #cbd5e1;
          font-size: 13px;
          margin-right: 6px;
          outline: none;
        }
        .btn-action {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
          color: white;
          transition: opacity 0.2s;
        }
        .btn-update {
          background-color: #28a745;
        }
        .btn-delete {
          background-color: #dc3545;
        }
        .table-responsive {
          overflow-x: auto;
        }

        @media (max-width: 900px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="grid-2">
        {/* Left Column */}
        <div>
          {/* Profile Card */}
          <div className="box">
            <div className="profile-header">
              <div className="profile-avatar">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <h2 style={{ marginBottom: '5px', fontSize: '22px', color: '#1e293b' }}>
                {currentUser.name || 'Admin User'}
              </h2>
              <p style={{ color: '#64748b', margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
                {currentUser.role ? currentUser.role.toUpperCase() : 'ADMIN'}
              </p>
            </div>
            <div className="info-row">
              <span style={{ fontWeight: 'bold', color: '#475569' }}>Email:</span>
              <span>{currentUser.email || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span style={{ fontWeight: 'bold', color: '#475569' }}>Joined:</span>
              <span>{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <button
              type="button"
              className="btn-submit"
              style={{ background: '#dc3545', marginTop: '20px' }}
              onClick={handleLogout}
            >
              <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '6px' }}></i> Logout
            </button>
          </div>

          {/* Change Password Card */}
          <div className="box" style={{ borderLeft: '5px solid #ffc107' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '15px' }}>
              <i className="fa-solid fa-lock" style={{ color: '#ffc107', marginRight: '8px' }}></i>
              Change Password
            </h3>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password:</label>
                <input
                  type={showOldPw ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                />
                <i
                  className={`fa-solid ${showOldPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowOldPw(!showOldPw)}
                ></i>
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                />
                <i
                  className={`fa-solid ${showNewPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowNewPw(!showNewPw)}
                ></i>
              </div>
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
                <i
                  className={`fa-solid ${showConfirmPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                ></i>
              </div>
              <button
                type="submit"
                className="btn-submit"
                style={{ backgroundColor: '#ffc107', color: '#212529' }}
                disabled={pwSubmitting}
              >
                {pwSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Platform Overview */}
          <div className="box" style={{ borderLeft: '5px solid #28a745' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                <i className="fa-solid fa-chart-line" style={{ color: '#28a745', marginRight: '8px' }}></i>
                Platform Overview
              </h3>
              <span style={{ fontSize: '13px', fontWeight: 'bold', background: '#e2e8f0', padding: '5px 12px', borderRadius: '15px', color: '#555' }}>
                Total Users:{' '}
                <span style={{ color: '#007bff', fontSize: '15px', marginLeft: '2px' }}>{totalUsers}</span>
              </span>
            </div>

            <div className="stat-box-container" style={{ marginTop: '20px' }}>
              <div className="stat-item">
                <h4 style={{ color: '#28a745' }}>{activeCount}</h4>
                <p>Active Users</p>
              </div>
              <div className="stat-item">
                <h4 style={{ color: '#ffc107' }}>{pendingCount}</h4>
                <p>Requests</p>
              </div>
              <div className="stat-item">
                <h4 style={{ color: '#dc3545' }}>{cancelledCount}</h4>
                <p>Inactive</p>
              </div>
            </div>
          </div>

          {/* Login Analytics */}
          <div className="box" style={{ borderLeft: '5px solid #6f42c1' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1e293b' }}>
              <i className="fa-solid fa-chart-pie" style={{ color: '#6f42c1', marginRight: '8px' }}></i>
              Login Analytics
            </h3>
            <div className="stat-box-container">
              <div className="stat-item">
                <h4 style={{ color: '#6f42c1' }}>{todayLogins}</h4>
                <p>Today&apos;s Logins</p>
              </div>
              <div className="stat-item">
                <h4 style={{ color: '#6f42c1' }}>{sevenDayLogins}</h4>
                <p>Last 7 Days</p>
              </div>
              <div className="stat-item">
                <h4 style={{ color: '#6f42c1' }}>{thirtyDayLogins}</h4>
                <p>Last 1 Month</p>
              </div>
            </div>
          </div>

          {/* Create New Admin (Owner only) */}
          {currentUser.role === 'owner' && (
            <div className="box" style={{ borderLeft: '5px solid #007bff' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#1e293b' }}>
                <i className="fa-solid fa-user-plus" style={{ color: '#007bff', marginRight: '8px' }}></i>
                Create New Admin
              </h3>
              <form onSubmit={handleCreateAdmin}>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                    placeholder="Enter Admin Name"
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    placeholder="Enter Admin Email"
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type={showAdminPw ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    placeholder="Enter Temporary Password"
                  />
                  <i
                    className={`fa-solid ${showAdminPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                    onClick={() => setShowAdminPw(!showAdminPw)}
                  ></i>
                </div>
                <button type="submit" className="btn-submit" disabled={adminSubmitting}>
                  {adminSubmitting ? 'Creating...' : 'Create Admin Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Pending & Inactive Users Table */}
      <div className="box" style={{ marginTop: '25px', borderTop: '5px solid #dc3545' }}>
        <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '15px' }}>
          <i className="fa-solid fa-user-clock" style={{ color: '#dc3545', marginRight: '8px' }}></i>
          Pending & Cancelled Users
        </h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Requested Plan</th>
                <th>Action</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading users...
                  </td>
                </tr>
              ) : pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#28a745', fontWeight: 'bold', padding: '20px' }}>
                    🎉 No pending or inactive users found.
                  </td>
                </tr>
              ) : (
                pendingUsers.map((u, index) => {
                  const pendingReq = (u.pendingRequests || []).find(r => r.status === 'pending');
                  const isRequested = !!pendingReq;
                  const reqPlan = pendingReq ? pendingReq.plan : 'None';

                  return (
                    <tr key={u._id}>
                      <td>{index + 1}</td>
                      <td>
                        <b>{u.name}</b>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {isRequested ? (
                          <span className="badge badge-requested">Requested</span>
                        ) : (
                          <span className="badge badge-expired">Pending / Inactive</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', color: isRequested ? '#d97706' : '#64748b' }}>
                          {reqPlan}
                        </span>
                      </td>
                      <td>
                        <select
                          className="plan-select"
                          value={planSelections[u._id] || 'none'}
                          onChange={(e) =>
                            setPlanSelections({
                              ...planSelections,
                              [u._id]: e.target.value
                            })
                          }
                        >
                          <option value="none">Cancel / Inactive</option>
                          <option value="1_month">1 Month</option>
                          <option value="3_months">3 Months</option>
                          <option value="6_months">6 Months</option>
                          <option value="1_year">1 Year</option>
                        </select>
                        <button
                          type="button"
                          className="btn-action btn-update"
                          onClick={() => handleUpdateSubscription(u._id)}
                        >
                          Save
                        </button>
                      </td>
                      <td>
                        {currentUser.role === 'owner' ? (
                          <button
                            type="button"
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteUser(u._id, u.name)}
                          >
                            Delete
                          </button>
                        ) : (
                          <small style={{ color: '#94a3b8' }}>N/A</small>
                        )}
                      </td>
                    </tr>
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
