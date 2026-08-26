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
            min-height: 100vh;
            min-height: 100dvh;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-family: inherit;
            gap: 16px;
            background-color: #ffffff;
            box-sizing: border-box;
          }
          .auth-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(0, 123, 255, 0.2);
            border-top-color: #007bff;
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

  // Otherwise, display clean white Login Gate Card matching /login page
  return (
    <div className="db-auth-gate-container">
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
              <i className="fa-solid fa-user" /> ইউজারনেম (Username):
            </label>
            <div className="input-wrapper">
              <input
                id="db-suite-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email..."
                className="auth-input"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="db-suite-password">
              <i className="fa-solid fa-key" /> পাসওয়ার্ড (Password):
            </label>
            <div className="input-wrapper">
              <input
                id="db-suite-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
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
                <i className="fa-solid fa-spinner fa-spin" />
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
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 20px;
          background-color: #ffffff;
          box-sizing: border-box;
          font-family: inherit;
        }

        .db-auth-card {
          background: #ffffff;
          padding: 35px 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 440px;
          border: 1px solid #e2e8f0;
          text-align: center;
          box-sizing: border-box;
        }

        .auth-card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 22px;
        }

        .lock-icon-badge {
          width: 56px;
          height: 56px;
          background: rgba(0, 123, 255, 0.08);
          border: 1px solid rgba(0, 123, 255, 0.2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: var(--primary, #007bff);
          margin-bottom: 12px;
        }

        .security-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #0284c7;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 3px 10px;
          border-radius: 20px;
          margin-bottom: 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .auth-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--dark, #2c3e50);
          margin: 0 0 6px 0;
          letter-spacing: -0.2px;
        }

        .auth-subtitle {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        .auth-error-banner {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 13.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          text-align: left;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 14px;
          font-weight: bold;
          color: #555555;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-label i {
          color: var(--primary, #007bff);
          font-size: 13px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 11px 40px 11px 14px;
          color: #1e293b;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .auth-input:focus {
          border-color: var(--primary, #007bff);
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
        }

        .auth-input::placeholder {
          color: #94a3b8;
        }

        .toggle-pw-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #777777;
          font-size: 15px;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .toggle-pw-btn:hover {
          color: var(--primary, #007bff);
        }

        .auth-submit-btn {
          margin-top: 8px;
          width: 100%;
          background-color: var(--primary, #007bff);
          color: #ffffff;
          border: none;
          padding: 12px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.25);
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background-color: var(--primary-dark, #0056b3);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-card-footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #f1f5f9;
        }

        :global(.back-home-link) {
          color: var(--primary, #007bff) !important;
          text-decoration: none !important;
          font-size: 13.5px;
          font-weight: bold;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease;
        }

        :global(.back-home-link:hover) {
          text-decoration: underline !important;
          color: var(--primary-dark, #0056b3) !important;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
