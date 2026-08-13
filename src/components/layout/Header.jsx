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
      <div className="header-container">
        {/* Brand Logo & Title */}
        <Link href="/" className="header-brand">
          <img src={logoUrl} alt={siteTitle} className="header-logo" />
          <span className="header-site-title">{siteTitle}</span>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        {/* Desktop & Mobile Navigation Links */}
        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-menu-list">
            {(h.menus || []).map((menu, index) => {
              const connectedMega = megaMenus.find(
                m => m.menuTitle && m.menuTitle.trim() === menu.title.trim()
              );

              if (connectedMega && connectedMega.columns && connectedMega.columns.length > 0) {
                const isDropdownOpen = openDropdownIndex === index;

                return (
                  <li
                    key={index}
                    className={`nav-item has-mega ${isDropdownOpen ? 'dropdown-open' : ''}`}
                    onMouseEnter={() => setOpenDropdownIndex(index)}
                    onMouseLeave={() => setOpenDropdownIndex(null)}
                  >
                    <div className="nav-link-dropdown-wrapper">
                      <Link href={formatURL(menu.url || '#')} className="nav-link">
                        {menu.title} <i className="fa-solid fa-chevron-down nav-arrow"></i>
                      </Link>
                      <button
                        className="mobile-dropdown-toggle"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenDropdownIndex(isDropdownOpen ? null : index);
                        }}
                      >
                        <i className={`fa-solid fa-angle-${isDropdownOpen ? 'up' : 'down'}`}></i>
                      </button>
                    </div>

                    {/* Mega Menu Dropdown */}
                    <div className="mega-menu-panel">
                      <div className="mega-menu-grid">
                        {connectedMega.columns.map((col, cIdx) => (
                          <div key={cIdx} className="mega-col">
                            {col.type === 'info' ? (
                              <div className="mega-info-box">
                                <h4 className="mega-col-title">{col.title || 'তথ্য'}</h4>
                                <p className="mega-info-text">{col.text || ''}</p>
                                <div className="mega-social-links">
                                  {col.fb && (
                                    <a href={col.fb} target="_blank" rel="noreferrer" className="social-icon fb">
                                      <i className="fa-brands fa-facebook-f"></i>
                                    </a>
                                  )}
                                  {col.yt && (
                                    <a href={col.yt} target="_blank" rel="noreferrer" className="social-icon yt">
                                      <i className="fa-brands fa-youtube"></i>
                                    </a>
                                  )}
                                  {col.wa && (
                                    <a href={col.wa} target="_blank" rel="noreferrer" className="social-icon wa">
                                      <i className="fa-brands fa-whatsapp"></i>
                                    </a>
                                  )}
                                  {col.tg && (
                                    <a href={col.tg} target="_blank" rel="noreferrer" className="social-icon tg">
                                      <i className="fa-brands fa-telegram"></i>
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="mega-links-box">
                                <h4 className="mega-col-title">{col.title || 'লিংকসমূহ'}</h4>
                                <ul className="mega-links-list">
                                  {(col.links || []).map((link, lIdx) => (
                                    <li key={lIdx}>
                                      <Link href={formatURL(link.url || '#')} className="mega-link-item">
                                        <i className="fa-solid fa-angle-right"></i> {link.text}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
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
                  <Link href={formatURL(menu.url || '#')} className="nav-link">
                    {menu.title}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Action Buttons */}
          <div className="header-actions">
            {h.btnText && (
              <Link href={formatURL(h.btnLink || '/contact')} className="btn-header-support">
                <i className="fa-solid fa-headset"></i> {h.btnText}
              </Link>
            )}

            <Link href={authLink} className="btn-header-auth">
              <i className={user ? 'fa-solid fa-user-check' : 'fa-solid fa-user-lock'}></i> {authText}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
