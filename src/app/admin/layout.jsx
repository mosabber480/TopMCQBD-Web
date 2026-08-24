'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeaderBar from '@/components/admin/AdminHeaderBar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');

      if (!token) {
        router.replace('/login');
        return;
      }

      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'owner' && user.role !== 'admin') {
          router.replace('/profile');
          return;
        }
      }

      setAuthorized(true);
    } catch (e) {
      router.replace('/login');
    }
  }, [router]);

  if (!authorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
      </div>
    );
  }

  return (
    <div className="admin-root-layout" style={{ minHeight: '100vh', backgroundColor: 'var(--light, #f4f7f6)' }}>
      {/* Top 100vw Full Width Admin Header */}
      <AdminHeaderBar />

      {/* Underneath: Left Sidebar + Right Page Content */}
      <div className="admin-body-wrapper" style={{ display: 'flex' }}>
        <AdminSidebar />
        <main className="admin-main-content" style={{ flexGrow: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
