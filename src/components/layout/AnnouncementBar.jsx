'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL } from '@/lib/config';

const DEFAULT_ANNOUNCEMENT = {
  text: "বিশেষ বিজ্ঞপ্তি: সার্ভার থেকে প্রথমবার কুইজের তথ্য লোড হতে ৩০ সেকেন্ড পর্যন্ত সময় লাগতে পারে। অনুগ্রহ করে ধৈর্য ধরুন!",
  link: ""
};

export default function AnnouncementBar({ announcement: initialAnnouncement }) {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState(initialAnnouncement || DEFAULT_ANNOUNCEMENT);

  useEffect(() => {
    if (initialAnnouncement) setAnnouncement(initialAnnouncement);

    const fetchConfig = () => {
      fetch('/api/layout-config?t=' + Date.now(), { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (data && data.announcement) {
            setAnnouncement(data.announcement);
            try {
              const prev = JSON.parse(localStorage.getItem('layout_config_data') || '{}');
              localStorage.setItem('layout_config_data', JSON.stringify({ ...prev, ...data }));
            } catch (e) {}
          }
        })
        .catch(() => {});
    };

    fetchConfig();
    window.addEventListener('layout-updated', fetchConfig);
    return () => window.removeEventListener('layout-updated', fetchConfig);
  }, [initialAnnouncement]);

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
