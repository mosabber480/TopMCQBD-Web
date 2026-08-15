'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL } from '@/lib/config';

const DEFAULT_HEADER = {
  siteTitle: 'TopMCQBD',
  logoUrl: '/images/TopMCQ.png',
  btnText: 'সহায়তা',
  btnLink: '/contact',
  menus: [
    { title: 'হোম', url: '/' },
    { title: 'প্রশ্ন অনুশীলন', url: '/questions' },
    { title: 'সকল MCQ', url: '/all-mcq' },
    { title: 'প্যাকেজসমূহ', url: '/packages' },
    { title: 'আমাদের সম্পর্কে', url: '/about-us' },
    { title: 'যোগাযোগ', url: '/contact' }
  ],
  megaMenus: []
};

export default function Header({ headerData: initialHeader }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [user, setUser] = useState(null);
  const [headerData, setHeaderData] = useState(initialHeader || DEFAULT_HEADER);
  const pathname = usePathname();

  // Load layout data from localStorage immediately & fetch fresh from API
  useEffect(() => {
    try {
      const cached = localStorage.getItem('layout_config_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.header) setHeaderData(parsed.header);
      }
    } catch (e) {}

    const fetchConfig = () => {
      fetch('/api/layout-config')
        .then(r => r.json())
        .then(data => {
          if (data && data.header) {
            setHeaderData(data.header);
            try {
              const prev = JSON.parse(localStorage.getItem('layout_config_data') || '{}');
              localStorage.setItem('layout_config_data', JSON.stringify({ ...prev, ...data }));
            } catch (e) {}

            // Dynamic Favicon Update
            if (data.header.faviconUrl) {
              let favicon = document.querySelector("link[rel*='icon']");
              if (favicon) {
                favicon.href = formatURL(data.header.faviconUrl);
              }
            }
          }
        })
        .catch(() => {});
    };

    fetchConfig();
    window.addEventListener('layout-updated', fetchConfig);
    return () => window.removeEventListener('layout-updated', fetchConfig);
  }, []);

  // Check login state
  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('quiz_token');
      const userStr = localStorage.getItem('user') || localStorage.getItem('quiz_user');
      if (token && userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdownIndex(null);
  }, [pathname]);

  // Hide Main Website Header on all Admin and Diagnostic routes
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/db-connection-check'))) {
    return null;
  }

  const h = headerData || DEFAULT_HEADER;
  const siteTitle = (h.siteTitle && h.siteTitle.trim()) ? h.siteTitle.trim() : 'TopMCQBD';
  const logoUrl = h.logoUrl ? formatURL(h.logoUrl) : '/images/TopMCQ.png';

  // Auth Button Link & Text
  let authLink = '/login';
  let authText = 'লগইন';

  if (user) {
    if (user.role === 'owner' || user.role === 'admin') {
      authLink = '/admin/dashboard';
      authText = user.name ? user.name.split(' ')[0] : 'ড্যাশবোর্ড';
    } else {
      authLink = '/profile';
      authText = user.name ? user.name.split(' ')[0] : 'প্রোফাইল';
    }
  }

  const megaMenus = h.megaMenus || [];

  return (
    <header id="global-header">
      <div className="header-wrapper">
        {/* Brand Logo & Title */}
        <div className="site-logo">
          <Link href="/">
            {logoUrl ? (
              <img src={logoUrl} alt={siteTitle} />
            ) : (
              <i className="fa-solid fa-book-open" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
            )}
            <span>{siteTitle}</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-toggle-btn"
          id="mobile-toggle-btn"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        {/* Main Desktop & Mobile Navigation */}
        <nav className={`site-nav ${mobileMenuOpen ? 'active' : ''}`} id="site-nav">
          <ul>
            {(h.menus || []).map((menu, index) => {
              const isMega = menu.isMegaMenu === true;
              const hasRegularSub = !isMega && menu.subMenus && menu.subMenus.length > 0;
              const isDropdownOpen = openDropdownIndex === index;

              // 1. MEGA MENU
              if (isMega) {
                const targetMega = megaMenus.find(
                  m => (m.id && m.id === menu.megaMenuId) || (m.menuTitle && m.menuTitle.trim() === menu.title.trim())
                );

                return (
                  <li
                    key={index}
                    className={`nav-item has-mega-menu ${isDropdownOpen ? 'show-mobile-dropdown' : ''}`}
                    onMouseEnter={() => setOpenDropdownIndex(index)}
                    onMouseLeave={() => setOpenDropdownIndex(null)}
                  >
                    <Link
                      href={formatURL(menu.url || '#')}
                      onClick={(e) => {
                        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                          e.preventDefault();
                          setOpenDropdownIndex(isDropdownOpen ? null : index);
                        }
                      }}
                    >
                      {menu.title} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', marginLeft: '3px' }}></i>
                    </Link>

                    {targetMega && targetMega.columns && targetMega.columns.length > 0 && (
                      <div className="mega-menu">
                        <div className="mega-grid-container">
                          {targetMega.columns.map((col, cIdx) => (
                            <div key={cIdx} className={col.type === 'info' ? 'mega-col mega-info-col' : 'mega-col mega-links-col'}>
                              <h4 className="mega-col-title">{col.title || (col.type === 'info' ? 'তথ্য' : 'লিংক')}</h4>

                              {col.type === 'info' ? (
                                <div>
                                  <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
                                    {col.text || ''}
                                  </p>
                                  <div className="mega-social">
                                    {col.fb && <a href={formatURL(col.fb)} target="_blank" rel="noreferrer" className="fb" title="Facebook"><i className="fa-brands fa-facebook-f"></i></a>}
                                    {col.yt && <a href={formatURL(col.yt)} target="_blank" rel="noreferrer" className="yt" title="YouTube"><i className="fa-brands fa-youtube"></i></a>}
                                    {col.wa && <a href={formatURL(col.wa)} target="_blank" rel="noreferrer" className="wa" title="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>}
                                    {col.tw && <a href={formatURL(col.tw)} target="_blank" rel="noreferrer" className="tw" title="Twitter / X"><i className="fa-brands fa-x-twitter"></i></a>}
                                    {col.tg && <a href={formatURL(col.tg)} target="_blank" rel="noreferrer" className="tg" title="Telegram"><i className="fa-brands fa-telegram"></i></a>}
                                    {col.ln && <a href={formatURL(col.ln)} target="_blank" rel="noreferrer" className="ln" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>}
                                  </div>
                                </div>
                              ) : (
                                <div className="mega-col-links">
                                  {(col.links || []).map((lk, lIdx) => (
                                    <Link key={lIdx} href={formatURL(lk.url || '#')}>
                                      <i className="fa-solid fa-angle-right" style={{ fontSize: '10px', marginRight: '5px', color: 'var(--primary)' }}></i>
                                      {lk.title || lk.text}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              }

              // 2. REGULAR DROPDOWN SUBMENU
              if (hasRegularSub) {
                return (
                  <li
                    key={index}
                    className={`nav-item has-dropdown ${isDropdownOpen ? 'show-mobile-dropdown' : ''}`}
                    onMouseEnter={() => setOpenDropdownIndex(index)}
                    onMouseLeave={() => setOpenDropdownIndex(null)}
                  >
                    <Link
                      href={formatURL(menu.url || '#')}
                      onClick={(e) => {
                        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                          e.preventDefault();
                          setOpenDropdownIndex(isDropdownOpen ? null : index);
                        }
                      }}
                    >
                      {menu.title} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', marginLeft: '3px' }}></i>
                    </Link>

                    <ul className="dropdown-menu">
                      {menu.subMenus.map((sub, sIdx) => (
                        <li key={sIdx}>
                          <Link href={formatURL(sub.url || '#')}>
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }

              // 3. REGULAR MENU LINK
              return (
                <li key={index} className="nav-item">
                  <Link href={formatURL(menu.url || '#')}>
                    {menu.title}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Buttons */}
          <div className="header-btn-group">
            {h.btnText && h.btnText.trim() && (
              <Link href={formatURL(h.btnLink || '/contact')} className="btn-primary-head">
                <i className="fa-solid fa-headset"></i> {h.btnText.trim()}
              </Link>
            )}

            <Link
              href={authLink}
              className="btn-auth-head"
              style={{ backgroundColor: '#1d283a', color: '#ffffff', border: '1px solid #1d283a' }}
            >
              <i className="fa-solid fa-circle-user"></i> {authText}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
