'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: 'login' | 'register' | 'forgot' | 'reset'
  const [currentMode, setCurrentMode] = useState('login');

  // Form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  // Password visibility
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw] = useState(false);
  const [showResetNewPw, setShowResetNewPw] = useState(false);
  const [showResetConfirmPw, setShowResetConfirmPw] = useState(false);

  // Alert Box State
  const [alertInfo, setAlertInfo] = useState({ show: false, msg: '', isSuccess: false });
  const [btnLoading, setBtnLoading] = useState(false);

  // Helper to show alert
  const showAlert = (msg, isSuccess = false) => {
    setAlertInfo({ show: true, msg, isSuccess });
    if (!isSuccess) {
      setTimeout(() => {
        setAlertInfo(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (token) {
      setResetToken(token);
      if (emailParam) setResetEmail(decodeURIComponent(emailParam));
      setCurrentMode('reset');
    }
  }, [searchParams]);

  // Check if logged in already
  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');
      if (token && userStr && currentMode !== 'reset') {
        const u = JSON.parse(userStr);
        if (u.role === 'owner' || u.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/profile');
        }
      }
    } catch (e) {}
  }, [currentMode, router]);

  // 1. LOGIN SUBMIT
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      });

      const data = await res.json();

      if (res.ok && (data.success || data.token)) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('quiz_token', data.token);
        localStorage.setItem('quiz_user', JSON.stringify(data.user));

        showAlert('Login Successful! Redirecting...', true);

        setTimeout(() => {
          if (data.user && (data.user.role === 'owner' || data.user.role === 'admin')) {
            router.replace('/admin/dashboard');
          } else {
            router.replace('/profile');
          }
        }, 1000);
      } else {
        showAlert(data.message || 'Invalid login credentials!');
      }
    } catch (err) {
      console.error('Login Fetch Error:', err);
      showAlert('Server connection error! Check console for details.');
    } finally {
      setBtnLoading(false);
    }
  };

  // 2. REGISTER SUBMIT
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (regPassword !== regConfirmPassword) {
      showAlert('Passwords do not match! Please re-check.');
      return;
    }

    setBtnLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName.trim(), email: regEmail.trim(), password: regPassword })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('quiz_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('quiz_user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('auth-change'));
          showAlert('Registration successful! Logging you in...', true);
          setRegName('');
          setRegEmail('');
          setRegPassword('');
          setRegConfirmPassword('');
          setTimeout(() => {
            router.push('/profile');
          }, 1000);
        } else {
          showAlert('Registration successful! Please login below.', true);
          setRegName('');
          setRegEmail('');
          setRegPassword('');
          setRegConfirmPassword('');
          setTimeout(() => setCurrentMode('login'), 1500);
        }
      } else {
        showAlert(data.message || 'Registration failed!');
      }
    } catch (err) {
      console.error('Register Fetch Error:', err);
      showAlert('Server connection error! Check console for details.');
    } finally {
      setBtnLoading(false);
    }
  };

  // 3. FORGOT PASSWORD SUBMIT
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showAlert(data.message || 'Reset link sent to your email!', true);
        setForgotEmail('');
      } else {
        showAlert(data.message || 'Something went wrong!');
      }
    } catch (err) {
      console.error('Forgot Password Fetch Error:', err);
      showAlert('Server connection error! Check console for details.');
    } finally {
      setBtnLoading(false);
    }
  };

  // 4. RESET PASSWORD SUBMIT
  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (resetNewPassword !== resetConfirmPassword) {
      showAlert('Passwords do not match!');
      return;
    }

    setBtnLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, token: resetToken, newPassword: resetNewPassword })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showAlert('Password reset successful! Redirecting to login...', true);
        setTimeout(() => {
          setCurrentMode('login');
        }, 2000);
      } else {
        showAlert(data.message || 'Invalid or expired token!');
      }
    } catch (err) {
      console.error('Reset Password Fetch Error:', err);
      showAlert('Server connection error! Check console for details.');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="main-content">
      <style jsx>{`
        .main-content {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 50px 20px;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          min-height: calc(100vh - 200px);
        }

        .auth-card {
          background: white;
          padding: 35px 30px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 440px;
          border: 1px solid #e2e8f0;
        }

        h2 { margin-top: 0; color: var(--dark, #2c3e50); text-align: center; margin-bottom: 20px; font-weight: 700; font-size: 24px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 6px; font-weight: bold; color: #555; font-size: 14px; }
        
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-wrapper input {
          padding-right: 40px;
        }

        .toggle-password-icon {
          position: absolute;
          right: 12px;
          cursor: pointer;
          color: #777;
          font-size: 15px;
          transition: color 0.2s ease;
          user-select: none;
        }

        .toggle-password-icon:hover {
          color: var(--primary, #007bff);
        }

        input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        input:focus { border-color: var(--primary, #007bff); }

        .btn {
          width: 100%;
          padding: 12px;
          background-color: var(--primary, #007bff);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn:hover { background-color: var(--primary-dark, #0056b3); }

        .toggle-text {
          text-align: center;
          margin-top: 18px;
          font-size: 14px;
          color: #666;
        }
        .toggle-link {
          color: var(--primary, #007bff);
          cursor: pointer;
          font-weight: bold;
          text-decoration: underline;
        }

        .alert {
          padding: 10px 14px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 14px;
        }
        .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
      `}</style>

      <div className="auth-card">
        {/* Title */}
        <h2>
          {currentMode === 'login' && <><i className="fa-solid fa-lock" style={{ color: 'var(--primary, #007bff)', marginRight: '6px' }}></i> Login to Account</>}
          {currentMode === 'register' && <><i className="fa-solid fa-user-plus" style={{ color: 'var(--primary, #007bff)', marginRight: '6px' }}></i> Register an Account</>}
          {currentMode === 'forgot' && <><i className="fa-solid fa-key" style={{ color: 'var(--primary, #007bff)', marginRight: '6px' }}></i> Forgot Password</>}
          {currentMode === 'reset' && <><i className="fa-solid fa-lock-open" style={{ color: 'var(--primary, #007bff)', marginRight: '6px' }}></i> Set New Password</>}
        </h2>

        {/* Alert box */}
        {alertInfo.show && (
          <div className={`alert ${alertInfo.isSuccess ? 'alert-success' : 'alert-danger'}`}>
            {alertInfo.msg}
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {currentMode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email Address:</label>
              <input
                type="email"
                placeholder="Enter your email..."
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <div className="password-wrapper">
                <input
                  type={showLoginPw ? 'text' : 'password'}
                  placeholder="Enter password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <i
                  className={`fa-solid ${showLoginPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password-icon`}
                  onClick={() => setShowLoginPw(!showLoginPw)}
                ></i>
              </div>
              <div style={{ textAlign: 'right', margin: '8px 0 0 0' }}>
                <span
                  onClick={() => { setCurrentMode('forgot'); setAlertInfo({ show: false, msg: '', isSuccess: false }); }}
                  style={{ fontSize: '13px', color: 'var(--primary, #007bff)', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Forgot Password?
                </span>
              </div>
            </div>
            <button type="submit" className="btn" disabled={btnLoading}>
              {btnLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Authenticating...</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket"></i> Login</>
              )}
            </button>

            <div className="toggle-text">
              Don&apos;t have an account?{' '}
              <span className="toggle-link" onClick={() => { setCurrentMode('register'); setAlertInfo({ show: false, msg: '', isSuccess: false }); }}>
                Register here
              </span>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {currentMode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                placeholder="Enter full name..."
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address:</label>
              <input
                type="email"
                placeholder="Enter email address..."
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <div className="password-wrapper">
                <input
                  type={showRegPw ? 'text' : 'password'}
                  placeholder="Create a password..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <i
                  className={`fa-solid ${showRegPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password-icon`}
                  onClick={() => setShowRegPw(!showRegPw)}
                ></i>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password:</label>
              <div className="password-wrapper">
                <input
                  type={showRegConfirmPw ? 'text' : 'password'}
                  placeholder="Re-enter password to confirm..."
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                />
                <i
                  className={`fa-solid ${showRegConfirmPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password-icon`}
                  onClick={() => setShowRegConfirmPw(!showRegConfirmPw)}
                ></i>
              </div>
            </div>
            <button type="submit" className="btn" style={{ backgroundColor: '#28a745' }} disabled={btnLoading}>
              {btnLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Creating Account...</>
              ) : (
                <><i className="fa-solid fa-user-plus"></i> Register Account</>
              )}
            </button>

            <div className="toggle-text">
              Already have an account?{' '}
              <span className="toggle-link" onClick={() => { setCurrentMode('login'); setAlertInfo({ show: false, msg: '', isSuccess: false }); }}>
                Login here
              </span>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {currentMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit}>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Enter your registered email address to receive a password reset link.
            </p>
            <div className="form-group">
              <label>Email Address:</label>
              <input
                type="email"
                placeholder="Enter your email..."
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn" disabled={btnLoading}>
              {btnLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</>
              ) : (
                <><i className="fa-solid fa-paper-plane"></i> Send Reset Link</>
              )}
            </button>

            <div className="toggle-text">
              Remember your password?{' '}
              <span className="toggle-link" onClick={() => { setCurrentMode('login'); setAlertInfo({ show: false, msg: '', isSuccess: false }); }}>
                Back to Login
              </span>
            </div>
          </form>
        )}

        {/* 4. RESET PASSWORD FORM */}
        {currentMode === 'reset' && (
          <form onSubmit={handleResetSubmit}>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Please enter your new password below.
            </p>
            <div className="form-group">
              <label>New Password:</label>
              <div className="password-wrapper">
                <input
                  type={showResetNewPw ? 'text' : 'password'}
                  placeholder="Enter new password..."
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  required
                />
                <i
                  className={`fa-solid ${showResetNewPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password-icon`}
                  onClick={() => setShowResetNewPw(!showResetNewPw)}
                ></i>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password:</label>
              <div className="password-wrapper">
                <input
                  type={showResetConfirmPw ? 'text' : 'password'}
                  placeholder="Re-enter new password..."
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  required
                />
                <i
                  className={`fa-solid ${showResetConfirmPw ? 'fa-eye-slash' : 'fa-eye'} toggle-password-icon`}
                  onClick={() => setShowResetConfirmPw(!showResetConfirmPw)}
                ></i>
              </div>
            </div>
            <button type="submit" className="btn" disabled={btnLoading}>
              {btnLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fa-solid fa-floppy-disk"></i> Save New Password</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>Loading Login...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
