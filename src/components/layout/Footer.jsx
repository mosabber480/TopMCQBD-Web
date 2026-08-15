'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL } from '@/lib/config';

export default function Footer({ footerData, copyrightData }) {
  const pathname = usePathname();

  // Hide Main Website Footer on all Admin routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const footer = footerData || { columns: [] };
  const copyright = copyrightData || {
    text: '© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।',
    links: [
      { title: 'FAQ', url: '/faq' },
      { title: 'Privacy & Refund Policy', url: '/privacy-and-refund-policy' },
      { title: 'System Status', url: '/status' }
    ]
  };

  const columns = footer.columns || [];

  return (
    <footer id="global-footer">
      <div className="footer-container">
        {columns.length > 0 && (
          <div className="footer-grid">
            {columns.map((col, idx) => {
              if (col.type === 'text') {
                return (
                  <div key={idx} className="footer-col info-col">
                    <h4>{col.title || 'TopMCQBD'}</h4>
                    <p>{col.content || col.text || ''}</p>
                    {col.showSocial && (
                      <div className="footer-social">
                        {col.fb && <a href={formatURL(col.fb)} target="_blank" rel="noreferrer" className="social-btn fb"><i className="fa-brands fa-facebook-f"></i></a>}
                        {col.yt && <a href={formatURL(col.yt)} target="_blank" rel="noreferrer" className="social-btn yt"><i className="fa-brands fa-youtube"></i></a>}
                        {col.wa && <a href={formatURL(col.wa)} target="_blank" rel="noreferrer" className="social-btn wa"><i className="fa-brands fa-whatsapp"></i></a>}
                        {col.tg && <a href={formatURL(col.tg)} target="_blank" rel="noreferrer" className="social-btn tg"><i className="fa-brands fa-telegram"></i></a>}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={idx} className="footer-col">
                  <h4>{col.title || 'লিংক'}</h4>
                  <ul className="footer-links-list">
                    {(col.links || []).map((l, lIdx) => (
                      <li key={lIdx}>
                        <Link href={formatURL(l.url || '#')}>
                          <i className="fa-solid fa-chevron-right link-bullet"></i> {l.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-container bottom-flex">
          <p className="copyright-text">{copyright.text}</p>
          <div className="bottom-links">
            {(copyright.links || []).map((cLink, cIdx) => (
              <Link key={cIdx} href={formatURL(cLink.url || '#')} className="legal-link">
                {cLink.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
