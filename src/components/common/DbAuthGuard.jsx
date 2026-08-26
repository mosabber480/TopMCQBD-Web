'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPaidApiUrl } from '@/lib/config';

export const AUTH_STORAGE_KEY = 'topmcqbd_db_suite_authenticated_v1';
export const AUTH_USER_KEY = 'topmcqbd_db_suite_user_name';

export default function DbAuthGuard({ children, activeRoute = '' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check auth state on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.warn('Storage check error:', e);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(getPaidApiUrl('/api/db-suite-auth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store auth status locally so user stays logged in across all 5 pages
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
        localStorage.setItem(AUTH_USER_KEY, data.user || 'Mosabber');
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
        setIsAuthenticated(true);
      } else {
        setErrorMsg(data.error || 'ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে!');
      }
    } catch (err) {
      console.error('Auth request error:', err);
      setErrorMsg('নেটওয়ার্ক সমস্যা: পুনরায় চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  };

  // Show quick smooth loading spinner while initial storage check completes
  if (isChecking) {
    return (
      <div className="db-auth-loading-screen">
        <div className="auth-spinner" />
        <p>কানেকশন ভেরিফাই করা হচ্ছে...</p>
        <style jsx>{`
          .db-auth-loading-screen {
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-family: inherit;
            gap: 16px;
          }
          .auth-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(56, 189, 248, 0.2);
            border-top-color: #38bdf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If already authenticated, show the page content directly
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, display high-end Login Gate Card
  return (
    <div className="db-auth-gate-container">
      {/* Background ambient orbs */}
      <div className="gate-orb gate-orb-1" />
      <div className="gate-orb gate-orb-2" />

      <div className="db-auth-card">
        {/* Card Header Icon & Titles */}
        <div className="auth-card-header">
          <div className="lock-icon-badge">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div className="security-tag">
            <i className="fa-solid fa-lock" /> RESTRICTED ACCESS
          </div>
          <h2 className="auth-title">Database Suite Authentication</h2>
          <p className="auth-subtitle">
            ডাটাবেজ কানেকশন চেক ও অ্যাডমিন টুলস দেখার জন্য ভেরিফিকেশন প্রয়োজন
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="auth-error-banner">
            <i className="fa-solid fa-triangle-exclamation" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="auth-form">
          {/* Username Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="db-suite-username">
              <i className="fa-solid fa-user" /> ইউজারনেম (Username)
            </label>
            <div className="input-wrapper">
              <input
                id="db-suite-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ইউজারনেম লিখুন..."
                className="auth-input"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="db-suite-password">
              <i className="fa-solid fa-key" /> পাসওয়ার্ড (Password)
            </label>
            <div className="input-wrapper">
              <input
                id="db-suite-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন..."
                className="auth-input"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pw-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                aria-label="Toggle password visibility"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? (
              <>
                <span className="btn-spinner" />
                ভেরিফাই করা হচ্ছে...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket" />
                ভেরিফাই করুন ও পেজে প্রবেশ করুন
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Back to Home */}
        <div className="auth-card-footer">
          <Link href="/" className="back-home-link">
            <i className="fa-solid fa-arrow-left" /> মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </div>

      <style jsx>{`
        .db-auth-gate-container {
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 16px;
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }

        .gate-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }

        .gate-orb-1 {
          width: 320px;
          height: 320px;
          background: #4f46e5;
          top: 10%;
          left: 15%;
        }

        .gate-orb-2 {
          width: 280px;
          height: 280px;
          background: #0284c7;
          bottom: 10%;
          right: 15%;
        }

        .db-auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(15, 23, 42, 0.82);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 36px 30px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(79, 70, 229, 0.15);
          text-align: center;
        }

        .auth-card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }

        .lock-icon-badge {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(2, 132, 199, 0.3));
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #38bdf8;
          margin-bottom: 16px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .security-tag {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .auth-title {
          font-size: 20px;
          font-weight: 800;
          color: #f8fafc;
          margin: 0 0 8px 0;
          letter-spacing: -0.3px;
        }

        .auth-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }

        .auth-error-banner {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          text-align: left;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-align: left;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 12px 42px 12px 14px;
          color: #f8fafc;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .auth-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
          background: rgba(30, 41, 59, 0.95);
        }

        .auth-input::placeholder {
          color: #64748b;
        }

        .toggle-pw-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .toggle-pw-btn:hover {
          color: #38bdf8;
        }

        .auth-submit-btn {
          margin-top: 6px;
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #0284c7);
          color: #ffffff;
          border: none;
          padding: 13px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
          transition: all 0.2s ease;
        }

        .auth-submit-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .auth-card-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        :global(.back-home-link) {
          color: #94a3b8 !important;
          text-decoration: none !important;
          font-size: 12.5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease;
        }

        :global(.back-home-link:hover) {
          color: #38bdf8 !important;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
