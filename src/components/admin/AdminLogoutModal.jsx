'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogoutModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('quiz_token');
      localStorage.removeItem('quiz_user');
      localStorage.removeItem('cached_sidebar_menus');
    } catch (e) {}

    router.replace('/login');
  };

  return (
    <div className={`logout-modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="logout-modal">
        <i className="fa-solid fa-right-from-bracket logout-icon"></i>
        <h3>লগআউট নিশ্চিত করুন</h3>
        <p>আপনি কি নিশ্চিত যে আপনি অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?</p>
        <div className="logout-actions">
          <button className="logout-btn-cancel" onClick={onClose}>
            বাতিল করুন
          </button>
          <button className="logout-btn-confirm" onClick={handleConfirm}>
            লগআউট
          </button>
        </div>
      </div>
    </div>
  );
}
