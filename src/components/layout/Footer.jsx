'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL, mapLegacyUrl } from '@/lib/config';

const DEFAULT_FOOTER = {
  columns: []
};

const DEFAULT_COPYRIGHT = {
  text: "",
  links: []
};

export default function Footer({ footerData: initialFooter, copyrightData: initialCopyright }) {
  const pathname = usePathname();
  const [footerData, setFooterData] = useState(initialFooter || DEFAULT_FOOTER);
  const [copyrightData, setCopyrightData] = useState(initialCopyright || DEFAULT_COPYRIGHT);

  useEffect(() => {
    if (initialFooter) setFooterData(initialFooter);
    if (initialCopyright) setCopyrightData(initialCopyright);

    const fetchConfig = () => {
      fetch('/api/layout-config')
        .then(r => r.json())
        .then(data => {
          if (data) {
            if (data.footer) setFooterData(data.footer);
            if (data.copyright) setCopyrightData(data.copyright);
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
  }, [initialFooter, initialCopyright]);

  // Hide Main Website Footer on all Admin and Diagnostic routes
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/db-connection-check'))) {
    return null;
  }

  const f = footerData || DEFAULT_FOOTER;
  const c = copyrightData || DEFAULT_COPYRIGHT;
  const columns = f.columns || DEFAULT_FOOTER.columns;
  const hasLinks = c.links && c.links.length > 0;
  const copyTextValue = c.text !== undefined ? c.text : '© " + new Date().getFullYear() + " TopMCQBD. All rights reserved.';

  return (
    <footer id="global-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {columns.map((col, idx) => {
            if (col.type === 'info') {
              return (
                <div key={idx} className="footer-col info-col">
                  <h4>{col.title || 'আমাদের সম্পর্কে'}</h4>
                  <p>{col.text || ''}</p>
                  <div className="footer-social">
                    {col.fb && <a href={formatURL(col.fb)} target="_blank" rel="noreferrer" title="Facebook" className="social-btn fb"><i className="fa-brands fa-facebook-f"></i></a>}
                    {col.yt && <a href={formatURL(col.yt)} target="_blank" rel="noreferrer" title="YouTube" className="social-btn yt"><i className="fa-brands fa-youtube"></i></a>}
                    {col.wa && <a href={formatURL(col.wa)} target="_blank" rel="noreferrer" title="WhatsApp" className="social-btn wa"><i className="fa-brands fa-whatsapp"></i></a>}
                    {col.tw && <a href={formatURL(col.tw)} target="_blank" rel="noreferrer" title="Twitter / X" className="social-btn tw"><i className="fa-brands fa-x-twitter"></i></a>}
                    {col.tg && <a href={formatURL(col.tg)} target="_blank" rel="noreferrer" title="Telegram" className="social-btn tg"><i className="fa-brands fa-telegram"></i></a>}
                    {col.ln && <a href={formatURL(col.ln)} target="_blank" rel="noreferrer" title="LinkedIn" className="social-btn ln"><i className="fa-brands fa-linkedin-in"></i></a>}
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="footer-col">
                <h4>{col.title || 'প্রয়োজনীয় লিংক'}</h4>
                <ul>
                  {(col.links || []).map((l, lIdx) => (
                    <li key={lIdx}>
                      <Link href={mapLegacyUrl(l.url || '#')}>
                        <i className="fa-solid fa-angle-right"></i> {l.title || l.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="footer-bottom">
          {copyTextValue && (
            <div className={`footer-copy-text ${hasLinks ? 'text-left' : 'text-center'}`}>
              {copyTextValue}
            </div>
          )}

          {hasLinks && (
            <div className="footer-copy-links">
              {c.links.map((l, lIdx) => (
                <React.Fragment key={lIdx}>
                  {lIdx > 0 && <span className="sep"> | </span>}
                  <Link href={mapLegacyUrl(l.url || '#')}>
                    {l.title}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
