'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import TopAlert from './TopAlert';

export default function AppLayoutWrapper({ children, initialLayoutData }) {
  const pathname = usePathname();

  // Admin routes & DB diagnostic route have their own dedicated layouts
  const isAdminOrDiagnostic = pathname && (pathname.startsWith('/admin') || pathname.startsWith('/db-connection-check'));

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
      <AnnouncementBar announcement={initialLayoutData?.announcement} />
      <Header headerData={initialLayoutData?.header} />
      <main className="site-main-content">{children}</main>
      <Footer footerData={initialLayoutData?.footer} copyrightData={initialLayoutData?.copyright} />
    </>
  );
}
