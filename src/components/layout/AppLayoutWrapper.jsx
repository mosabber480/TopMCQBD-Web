'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import TopAlert from './TopAlert';

export default function AppLayoutWrapper({ children, initialLayoutData }) {
  const pathname = usePathname();
  const [layoutData, setLayoutData] = useState(initialLayoutData || {});

  useEffect(() => {
    // 1. Check if localStorage has cached data
    try {
      const cached = localStorage.getItem('layout_config_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.header || parsed.footer)) {
          setLayoutData(parsed);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh live D1 config once on mount
    fetch('/api/layout-config')
      .then(res => res.json())
      .then(data => {
        if (data && (data.header || data.footer)) {
          setLayoutData(data);
          try {
            localStorage.setItem('layout_config_data', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // 3. Listen for real-time updates from admin dashboards
    const handleUpdate = (e) => {
      if (e && e.detail) {
        setLayoutData(e.detail);
        try {
          localStorage.setItem('layout_config_data', JSON.stringify(e.detail));
        } catch (err) {}
      }
    };

    window.addEventListener('layout-updated', handleUpdate);
    return () => window.removeEventListener('layout-updated', handleUpdate);
  }, []);

  // Admin routes & DB diagnostic/manager routes have their own dedicated layouts
  const isAdminOrDiagnostic = pathname && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/db-connection') ||
    pathname.startsWith('/dbpaid') ||
    pathname.startsWith('/dbfree') ||
    pathname.startsWith('/dbd1')
  );

  if (isAdminOrDiagnostic) {
    return (
      <>
        <TopAlert />
        {children}
      </>
    );
  }

  return (
    <>
      <TopAlert />
      <AnnouncementBar announcement={layoutData?.announcement} />
      <Header headerData={layoutData?.header} />
      <main className="site-main-content">{children}</main>
      <Footer footerData={layoutData?.footer} copyrightData={layoutData?.copyright} />
    </>
  );
}
