'use client';

import React, { useState, useEffect } from 'react';
import { showTopAlert } from '@/components/layout/TopAlert';

export default function AdminProfilePage() {
  const [currentUser, setCurrentUser] = useState({});
  const [loading, setLoading] = useState(true);

  // Password changer
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    active: 0,
    pending: 0,
    cancelled: 0,
    todayLogins: 0,
    sevenDayLogins: 0,
    thirtyDayLogins: 0
  });

  // Pending users
  const [pendingUsers, setPendingUsers] = useState([]);
  const [planSelections, setPlanSelections] = useState({});

  // Create admin (for owner)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState('admin');

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
      if (data && data.success) {
        let active = 0;
        let pending = 0;
        let inactive = 0;
        let totalUsers = 0;
        let todayLogins = 0;
        let last7Days = 0;
        let last30Days = 0;
        const now = new Date();

        data.users.forEach((u) => {
          if (u.role === 'customer') {
            totalUsers++;
            const sub = u.subscription || {};
            const isActive = sub.active && sub.endDate && new Date(sub.endDate) > new Date();
            const pendingReqs = (u.pendingRequests || []).filter(r => r.status === 'pending');

            if (pendingReqs.length > 0) pending++;
            else if (isActive) active++;
            else inactive++;
          }

          if (u.lastLogin) {
            const lastLoginDate = new Date(u.lastLogin);
            if (lastLoginDate.toDateString() === now.toDateString()) {
              todayLogins++;
            }
            const diffTime = Math.abs(now - lastLoginDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) last7Days++;
            if (diffDays <= 30) last30Days++;
          }
        });

        setStats({
          totalUsers,
          active,
          pending,
          cancelled: inactive,
          todayLogins,
          sevenDayLogins: last7Days,
          thirtyDayLogins: last30Days
        });

        const pendingList = data.users.filter(
          (u) =>
            u.role === 'customer' &&
            (!u.subscription || !u.subscription.active || (u.pendingRequests || []).some(r => r.status === 'pending'))
        );
        setPendingUsers(pendingList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showTopAlert('Password updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        showTopAlert(data.message || 'Failed to update password!', 'danger');
      }
    } catch (err) {
      showTopAlert('Server error updating password!', 'danger');
    } finally {
      setPwSaving(false);
    }
  };

  const handleUpdateSubscription = async (userId) => {
    const plan = planSelections[userId] || '1_month';
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
      if (data.success) {
        showTopAlert('Subscription updated successfully!', 'success');
        loadStatsAndUsers();
      } else {
        showTopAlert(data.message || 'Failed to update plan', 'danger');
      }
    } catch (err) {
      showTopAlert('Error updating plan!', 'danger');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirm = await showTopAlert(`Are you sure you want to delete user '${userName}'?`, 'danger', true);
    if (!confirm) return;

    const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showTopAlert('User deleted successfully!', 'success');
        loadStatsAndUsers();
      } else {
        showTopAlert('Failed to delete user!', 'danger');
      }
    } catch (err) {
      showTopAlert('Error deleting user!', 'danger');
    }
  };

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
        showTopAlert('Admin account created successfully!', 'success');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        loadStatsAndUsers();
      } else {
        showTopAlert(data.message || 'Failed to create admin!', 'danger');
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
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: white;
          padding: 18px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        .stat-card h3 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          color: var(--primary, #007bff);
        }
        .stat-card p {
          margin: 4px 0 0 0;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
        }
        .row-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        .form-group { margin-bottom: 12px; }
        label { display: block; font-weight: 600; margin-bottom: 5px; color: #475569; font-size: 13.5px; }
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        input, select {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 5px;
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
        }
        input:focus { border-color: var(--primary, #007bff); }
        .toggle-icon {
          position: absolute;
          right: 12px;
          cursor: pointer;
          color: #777;
        }
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary { background-color: var(--primary, #007bff); color: white; }
        .btn-success { background-color: #28a745; color: white; }
        .btn-danger { background-color: #dc3545; color: white; }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th, td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        th { background: #f8fafc; font-weight: bold; color: #475569; }
        @media (max-width: 900px) {
          .row-split { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #007bff' }}>
          <h3>{stats.totalUsers}</h3>
          <p>Total Customers</p>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #28a745' }}>
          <h3 style={{ color: '#28a745' }}>{stats.active}</h3>
          <p>Active Subscribers</p>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #ffc107' }}>
          <h3 style={{ color: '#ffc107' }}>{stats.pending}</h3>
          <p>Pending Requests</p>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #dc3545' }}>
          <h3 style={{ color: '#dc3545' }}>{stats.cancelled}</h3>
          <p>Expired / Inactive</p>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #6f42c1' }}>
          <h3 style={{ color: '#6f42c1' }}>{stats.todayLogins}</h3>
          <p>Today&apos;s Active Logins</p>
        </div>
      </div>

      <div className="row-split">
        {/* Profile & Password Info */}
        <div className="box" style={{ borderLeft: '6px solid var(--primary)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--dark)' }}>
            <i className="fa-solid fa-user-shield" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
            My Admin Profile
          </h3>
          <p><strong>Name:</strong> {currentUser.name || 'Admin'}</p>
          <p><strong>Email:</strong> {currentUser.email || 'N/A'}</p>
          <p>
            <strong>Role:</strong>{' '}
            <span style={{ background: '#e3f2fd', color: '#007bff', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              {(currentUser.role || 'ADMIN').toUpperCase()}
            </span>
          </p>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

          <h4 style={{ margin: '0 0 15px 0', color: 'var(--dark)' }}>
            <i className="fa-solid fa-key" style={{ color: '#ffc107', marginRight: '8px' }}></i> Change Password
          </h4>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password:</label>
              <div className="password-wrapper">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  required
                />
                <i
                  className={`fa-solid ${showCurrentPw ? 'fa-eye-slash' : 'fa-eye'} toggle-icon`}
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                ></i>
              </div>
            </div>
            <div className="form-group">
              <label>New Password:</label>
              <div className="password-wrapper">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  required
                />
                <i
                  className={`fa-solid ${showNewPw ? 'fa-eye-slash' : 'fa-eye'} toggle-icon`}
                  onClick={() => setShowNewPw(!showNewPw)}
                ></i>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwSaving}>
              <i className="fa-solid fa-floppy-disk"></i> {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Create Admin (Owner only) */}
        {currentUser.role === 'owner' ? (
          <div className="box" style={{ borderLeft: '6px solid #28a745' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--dark)' }}>
              <i className="fa-solid fa-user-plus" style={{ color: '#28a745', marginRight: '8px' }}></i>
              Create New Admin Account
            </h3>
            <form onSubmit={handleCreateAdmin}>
              <div className="form-group">
                <label>Admin Full Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Mosabber Admin"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address:</label>
                <input
                  type="email"
                  placeholder="admin@topmcq.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  placeholder="Set strong password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select value={adminRole} onChange={(e) => setAdminRole(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <button type="submit" className="btn btn-success" style={{ marginTop: '5px' }}>
                <i className="fa-solid fa-user-plus"></i> Create Admin Account
              </button>
            </form>
          </div>
        ) : (
          <div className="box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            <p>Admin user creation is restricted to the Owner.</p>
          </div>
        )}
      </div>

      {/* Pending / Inactive Users Table */}
      <div className="box" style={{ borderTop: '5px solid #dc3545' }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'var(--dark)' }}>
          <i className="fa-solid fa-user-clock" style={{ color: '#dc3545', marginRight: '8px' }}></i>
          Pending & Inactive Users ({pendingUsers.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
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
              {pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#28a745', fontWeight: 'bold' }}>
                    🎉 No pending or inactive users.
                  </td>
                </tr>
              ) : (
                pendingUsers.map((u, idx) => (
                  <tr key={u._id || idx}>
                    <td>{idx + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span style={{ background: '#f8d7da', color: '#721c24', padding: '2px 6px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 'bold' }}>
                        Pending / Expired
                      </span>
                    </td>
                    <td>{u.subscription?.plan || 'None'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <select
                          style={{ padding: '4px 6px', fontSize: '12px' }}
                          value={planSelections[u._id] || '1_month'}
                          onChange={(e) => setPlanSelections({ ...planSelections, [u._id]: e.target.value })}
                        >
                          <option value="1_month">1 Month</option>
                          <option value="3_months">3 Months</option>
                          <option value="6_months">6 Months</option>
                          <option value="1_year">1 Year</option>
                        </select>
                        <button
                          className="btn btn-success"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => handleUpdateSubscription(u._id)}
                        >
                          Save
                        </button>
                      </div>
                    </td>
                    <td>
                      {currentUser.role === 'owner' ? (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => handleDeleteUser(u._id, u.name)}
                        >
                          Delete
                        </button>
                      ) : (
                        <small style={{ color: '#888' }}>N/A</small>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
