'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL } from '@/lib/config';

export default function AnnouncementBar({ announcement }) {
  const pathname = usePathname();

  // Hide Announcement Bar on all Admin routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  if (!announcement || !announcement.text) return null;

  return (
    <div id="global-announce-bar">
      <div className="announce-content">
        <span>{announcement.text}</span>
        {announcement.link && (
          <Link href={formatURL(announcement.link)} className="announce-link">
            বিস্তারিত দেখুন
          </Link>
        )}
      </div>
    </div>
  );
}
