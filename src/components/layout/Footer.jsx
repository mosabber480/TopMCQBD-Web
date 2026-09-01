'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL, mapLegacyUrl } from '@/lib/config';

import layoutConfigData from '@/data/layout-config.json';

const DEFAULT_FOOTER = layoutConfigData?.footer || {
  columns: [
    {
      type: "info",
      title: "সাইট তথ্য ও সোশাল লিংক",
      text: "বিসিএস, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ এবং বিশ্ববিদ্যালয়ের ভর্তি পরীক্ষার জন্য একটি আধুনিক ও স্বয়ংসম্পূর্ণ অনলাইন প্রস্তুতি প্ল্যাটফর্ম।",
      fb: "",
      yt: "",
      wa: "",
      tw: "",
      tg: "",
      ln: ""
    },
    {
      type: "links",
      title: "প্রয়োজনীয় লিংক",
      links: [
        { title: "হোম পেজ", url: "/" },
        { title: "কুইজ অনুশীলন", url: "/questions" },
        { title: "সকল প্রশ্ন ক্যাটাগরি", url: "/all-mcq" },
        { title: "প্যাকেজ ও মূল্য তালিকা", url: "/packages" }
      ]
    },
    {
      type: "links",
      title: "ক্যাটাগরি",
      links: [
        { title: "বিসিএস প্রস্তুতি", url: "/questions?category=bcs" },
        { title: "ব্যাংক জব", url: "/questions?category=bank" },
        { title: "প্রাথমিক শিক্ষক", url: "/questions?category=primary" }
      ]
    },
    {
      type: "links",
      title: "যোগাযোগ",
      links: [
        { title: "আমাদের সম্পর্কে", url: "/about-us" },
        { title: "যোগাযোগ করুন", url: "/contact" },
        { title: "সচরাচর জিজ্ঞাসা (FAQ)", url: "/faq" },
        { title: "রিফান্ড ও পেমেন্ট পলিসি", url: "/privacy-and-refund-policy" }
      ]
    }
  ]
};

const DEFAULT_COPYRIGHT = layoutConfigData?.copyright || {
  text: "© 2026 TopMCQBD. সর্বস্বত্ব সংরক্ষিত।",
  links: [
    { title: "FAQ", url: "/faq" },
    { title: "Privacy & Refund Policy", url: "/privacy-and-refund-policy" },
    { title: "System Status", url: "/status" }
  ]
};

export default function Footer({ footerData: initialFooter, copyrightData: initialCopyright }) {
  const pathname = usePathname();
  const [footerData, setFooterData] = useState(initialFooter || DEFAULT_FOOTER);
  const [copyrightData, setCopyrightData] = useState(initialCopyright || DEFAULT_COPYRIGHT);

  useEffect(() => {
    if (initialFooter) setFooterData(initialFooter);
  }, [initialFooter]);

  useEffect(() => {
    if (initialCopyright) setCopyrightData(initialCopyright);
  }, [initialCopyright]);

  // Hide Main Website Footer on all Admin and Diagnostic routes
  if (pathname && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/db-connection') ||
    pathname.startsWith('/dbpaid') ||
    pathname.startsWith('/dbfree') ||
    pathname.startsWith('/dbd1')
  )) {
    return null;
  }

  const f = footerData || DEFAULT_FOOTER;
  const c = copyrightData || DEFAULT_COPYRIGHT;
  const columns = f.columns || DEFAULT_FOOTER.columns;
  const hasLinks = c.links && c.links.length > 0;
  const copyTextValue = c.text !== undefined ? c.text : `© ${new Date().getFullYear()} TopMCQBD. All rights reserved.`;

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

            if (col.type === 'icon_links' || col.type === 'icon-links') {
              return (
                <div key={idx} className="footer-col icon-links-col">
                  <h4>{col.title || 'যোগাযোগ ও সাপোর্ট'}</h4>
                  <ul>
                    {(col.links || []).map((l, lIdx) => (
                      <li key={lIdx}>
                        <Link href={mapLegacyUrl(l.url || '#')}>
                          {l.icon ? (
                            <i className={l.icon} style={{ marginRight: '8px', fontSize: '13px', width: '16px', textAlign: 'center' }}></i>
                          ) : (
                            <i className="fa-solid fa-angle-right"></i>
                          )}
                          <span>{l.title || l.text}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
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
