'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL } from '@/lib/config';

export default function Header({ headerData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  // Hide Main Website Header completely on all Admin routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

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

  const h = headerData || {
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

  const siteTitle = h.siteTitle || 'TopMCQBD';
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
            <img src={logoUrl} alt={siteTitle} />
            <span>{siteTitle}</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-toggle-btn"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        {/* Main Desktop & Mobile Navigation */}
        <nav className={`site-nav ${mobileMenuOpen ? 'active' : ''}`}>
          <ul>
            {(h.menus || []).map((menu, index) => {
              const connectedMega = megaMenus.find(
                m => m.menuTitle && m.menuTitle.trim() === menu.title.trim()
              );

              if (connectedMega && connectedMega.columns && connectedMega.columns.length > 0) {
                const isDropdownOpen = openDropdownIndex === index;

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
                        if (window.innerWidth <= 768) {
                          e.preventDefault();
                          setOpenDropdownIndex(isDropdownOpen ? null : index);
                        }
                      }}
                    >
                      {menu.title} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', marginLeft: '4px' }}></i>
                    </Link>

                    {/* Mega Menu Dropdown */}
                    <div className="mega-menu">
                      <div className="mega-grid-container">
                        {connectedMega.columns.map((col, cIdx) => (
                          <div key={cIdx} className={col.type === 'info' ? 'mega-col mega-info-col' : 'mega-col mega-links-col'}>
                            <div className="mega-col-title">{col.title || (col.type === 'info' ? 'তথ্য' : 'লিংকসমূহ')}</div>
                            
                            {col.type === 'info' ? (
                              <div>
                                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                                  {col.text || ''}
                                </p>
                                <div className="mega-social">
                                  {col.fb && (
                                    <a href={formatURL(col.fb)} target="_blank" rel="noreferrer" className="fb" title="Facebook">
                                      <i className="fa-brands fa-facebook-f"></i>
                                    </a>
                                  )}
                                  {col.yt && (
                                    <a href={formatURL(col.yt)} target="_blank" rel="noreferrer" className="yt" title="YouTube">
                                      <i className="fa-brands fa-youtube"></i>
                                    </a>
                                  )}
                                  {col.wa && (
                                    <a href={formatURL(col.wa)} target="_blank" rel="noreferrer" className="wa" title="WhatsApp">
                                      <i className="fa-brands fa-whatsapp"></i>
                                    </a>
                                  )}
                                  {col.tg && (
                                    <a href={formatURL(col.tg)} target="_blank" rel="noreferrer" className="tg" title="Telegram">
                                      <i className="fa-brands fa-telegram"></i>
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="mega-col-links">
                                {(col.links || []).map((link, lIdx) => (
                                  <Link key={lIdx} href={formatURL(link.url || '#')}>
                                    <i className="fa-solid fa-angle-right" style={{ marginRight: '6px', color: 'var(--primary)' }}></i>
                                    {link.text}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              }

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
            {h.btnText && (
              <Link href={formatURL(h.btnLink || '/contact')} className="btn-primary-head">
                <i className="fa-solid fa-headset"></i> {h.btnText}
              </Link>
            )}

            <Link href={authLink} className="btn-auth-head">
              <i className={user ? 'fa-solid fa-user-check' : 'fa-solid fa-user-lock'}></i> {authText}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
