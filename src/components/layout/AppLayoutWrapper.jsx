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
    // Skip layout fetch completely for DB diagnostic pages
    if (pathname && (pathname.startsWith('/db-connection') || pathname.startsWith('/DB'))) {
      return;
    }

    // Clean up any legacy localStorage cached layout data
    try {
      localStorage.removeItem('layout_config_data');
    } catch (e) {}

    // Fetch fresh live D1/Cloudflare CDN config on mount
    fetch('/api/layout-config')
      .then(res => res.json())
      .then(data => {
        if (data && (data.header || data.footer)) {
          setLayoutData(data);
        }
      })
      .catch(() => {});

    // Listen for real-time in-memory updates from admin dashboards
    const handleUpdate = (e) => {
      if (e && e.detail) {
        setLayoutData(e.detail);
      }
    };

    window.addEventListener('layout-updated', handleUpdate);
    return () => window.removeEventListener('layout-updated', handleUpdate);
  }, []);

  // Global URL space cleaner: across the entire website, automatically replace %20 and whitespace in URLs with hyphens '-'
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = window.location.search;
    if (search && (search.includes('%20') || search.includes(' '))) {
      const cleanSearch = search.replace(/(%20|\s)+/g, '-');
      const cleanUrl = window.location.pathname + cleanSearch + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [pathname]);

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
