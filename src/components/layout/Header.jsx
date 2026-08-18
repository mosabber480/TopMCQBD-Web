'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL, mapLegacyUrl } from '@/lib/config';

const DEFAULT_HEADER = {
  siteTitle: 'TopMCQBD',
  logoUrl: '/images/TopMCQ.png',
  btnText: 'সহায়তা',
  btnLink: '/contact',
  menus: [
    { title: 'হোম', url: '/' },
    {
      title: 'কুইজ অনুশীলন',
      url: '/quiz',
      isMegaMenu: false,
      subMenus: [
        { title: 'বিসিএস প্রস্তুতি', url: '/quiz?category=bcs' },
        { title: 'ব্যাংক জব প্রস্তুতি', url: '/quiz?category=bank' },
        { title: 'প্রাথমিক শিক্ষক নিয়োগ', url: '/quiz?category=primary' },
        { title: 'সকল MCQ', url: '/all-mcq' }
      ]
    },
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

  useEffect(() => {
    if (initialHeader) {
      setHeaderData(initialHeader);
    }

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
  }, [initialHeader]);

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
  const hasLogo = Boolean(h.logoUrl && h.logoUrl.trim());
  const logoUrl = hasLogo ? formatURL(h.logoUrl.trim()) : '';

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
        {/* Brand Logo or Title */}
        <div className="site-logo">
          <Link href="/" title={siteTitle}>
            {hasLogo ? (
              <img src={logoUrl} alt={siteTitle} />
            ) : (
              <span>{siteTitle}</span>
            )}
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
              const isMega = menu.isMegaMenu === true || menu.isMegaMenu === 'true' || Boolean(menu.megaMenuId);
              const targetMega = isMega ? megaMenus.find(
                m => (m.id && m.id === menu.megaMenuId) || (m.menuTitle && m.menuTitle.trim() === menu.title?.trim())
              ) : null;
              const hasMegaCols = Boolean(targetMega && targetMega.columns && targetMega.columns.length > 0);
              const hasRegularSub = Boolean(menu.subMenus && menu.subMenus.length > 0 && !hasMegaCols);
              const isDropdownOpen = openDropdownIndex === index;

              // 1. MEGA MENU
              if (hasMegaCols) {
                return (
                  <li
                    key={index}
                    className={`nav-item has-dropdown has-mega-menu ${isDropdownOpen ? 'show-desktop-dropdown show-mobile-dropdown' : ''}`}
                    onMouseEnter={() => {
                      if (typeof window !== 'undefined' && window.innerWidth > 768) {
                        setOpenDropdownIndex(index);
                      }
                    }}
                    onMouseLeave={() => {
                      if (typeof window !== 'undefined' && window.innerWidth > 768) {
                        setOpenDropdownIndex(null);
                      }
                    }}
                  >
                    <Link
                      href={mapLegacyUrl(menu.url || '#')}
                      className="dropdown-toggle-link"
                      onClick={(e) => {
                        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                          e.preventDefault();
                          setOpenDropdownIndex(isDropdownOpen ? null : index);
                        }
                      }}
                    >
                      {menu.title} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', marginLeft: '3px' }}></i>
                    </Link>

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
                                  <Link
                                    key={lIdx}
                                    href={mapLegacyUrl(lk.url || '#')}
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setOpenDropdownIndex(null);
                                    }}
                                  >
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
                  </li>
                );
              }

              // 2. REGULAR DROPDOWN SUBMENU
              if (hasRegularSub) {
                return (
                  <li
                    key={index}
                    className={`nav-item has-dropdown ${isDropdownOpen ? 'show-desktop-dropdown show-mobile-dropdown' : ''}`}
                    onMouseEnter={() => {
                      if (typeof window !== 'undefined' && window.innerWidth > 768) {
                        setOpenDropdownIndex(index);
                      }
                    }}
                    onMouseLeave={() => {
                      if (typeof window !== 'undefined' && window.innerWidth > 768) {
                        setOpenDropdownIndex(null);
                      }
                    }}
                  >
                    <Link
                      href={mapLegacyUrl(menu.url || '#')}
                      className="dropdown-toggle-link"
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
                          <Link
                            href={mapLegacyUrl(sub.url || '#')}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setOpenDropdownIndex(null);
                            }}
                          >
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
                  <Link
                    href={mapLegacyUrl(menu.url || '#')}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setOpenDropdownIndex(null);
                    }}
                  >
                    {menu.title}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Buttons */}
          <div className="header-btn-group">
            {h.btnText && h.btnText.trim() && (
              <Link href={mapLegacyUrl(h.btnLink || '/contact')} className="btn-primary-head">
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
