'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL } from '@/lib/config';

import layoutConfigData from '@/data/layout-config.json';

const DEFAULT_ANNOUNCEMENT = layoutConfigData?.announcement || {
  text: "বিশেষ বিজ্ঞপ্তি: সার্ভার থেকে প্রথমবার কুইজের তথ্য লোড হতে ৩০ সেকেন্ড পর্যন্ত সময় লাগতে পারে। অনুগ্রহ করে ধৈর্য ধরুন!",
  link: ""
};

export default function AnnouncementBar({ announcement: initialAnnouncement }) {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState(initialAnnouncement || DEFAULT_ANNOUNCEMENT);

  useEffect(() => {
    if (initialAnnouncement) setAnnouncement(initialAnnouncement);

    const loadLatestConfig = () => {
      fetch('/api/layout-config')
        .then(res => res.json())
        .then(data => {
          if (data?.announcement) setAnnouncement(data.announcement);
        })
        .catch(() => {});
    };

    loadLatestConfig();

    const handleUpdate = (e) => {
      if (e && e.detail && e.detail.announcement) {
        setAnnouncement(e.detail.announcement);
      } else {
        loadLatestConfig();
      }
    };

    window.addEventListener('layout-updated', handleUpdate);
    return () => window.removeEventListener('layout-updated', handleUpdate);
  }, [initialAnnouncement, pathname]);

  // Hide Announcement Bar on all Admin and Diagnostic routes
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/db-connection-check'))) {
    return null;
  }

  if (!announcement || !announcement.text) return null;

  return (
    <div id="global-announce-bar">
      <div className="announce-content">
        <span>{announcement.text}</span>
        {announcement.link && (
          <Link href={formatURL(announcement.link)} className="announce-link" style={{ color: '#fff', marginLeft: '10px', textDecoration: 'underline', fontWeight: 'bold' }}>
            বিস্তারিত দেখুন
          </Link>
        )}
      </div>
    </div>
  );
}
