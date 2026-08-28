'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatURL, mapLegacyUrl } from '@/lib/config';

import layoutConfigData from '@/data/layout-config.json';

const DEFAULT_HEADER = layoutConfigData?.header || {
  siteTitle: 'TopMCQBD',
  logoUrl: '/images/TopMCQ.png',
  btnText: 'সহায়তা',
  btnLink: '/contact',
  menus: [
    { title: 'হোম', url: '/' },
    { title: 'কুইজ অনুশীলন', url: '/quiz' },
    { title: 'সকল MCQ', url: '/all-mcq' },
    { title: 'প্যাকেজসমূহ', url: '/packages' },
    { title: 'আমাদের সম্পর্কে', url: '/about-us' },
    { title: 'যোগাযোগ', url: '/contact' }
  ],
  megaMenus: []
};

const renderMenuContent = (item) => {
  const iconClass = item?.icon && item.icon.trim() ? item.icon.trim() : null;
  const badgeText = item?.badgeText && item.badgeText.trim() ? item.badgeText.trim() : null;
  const badgeType = item?.badgeType || 'live';

  let badgeBg = '#ff4d6d';
  let badgeColor = '#ffffff';

  if (badgeType === 'free') {
    badgeBg = '#059669';
  } else if (badgeType === 'new') {
    badgeBg = '#7c3aed';
  } else if (badgeType === 'popular') {
    badgeBg = '#d97706';
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      {iconClass && <i className={iconClass} style={{ fontSize: '0.92em' }}></i>}
      <span>{item.title}</span>
      {badgeText && (
        <span className={`menu-badge-pill ${badgeType}`}>
          <span style={{ transform: 'translateY(1px)' }}>{badgeText}</span>
        </span>
      )}
    </span>
  );
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

    const loadLatestConfig = () => {
      fetch('/api/layout-config')
        .then(res => res.json())
        .then(data => {
          if (data?.header) {
            setHeaderData(data.header);
          }
        })
        .catch(() => {});
    };

    loadLatestConfig();

    const handleUpdate = (e) => {
      if (e && e.detail && e.detail.header) {
        setHeaderData(e.detail.header);
      } else {
        loadLatestConfig();
      }
    };
    window.addEventListener('layout-updated', handleUpdate);
    return () => window.removeEventListener('layout-updated', handleUpdate);
  }, [initialHeader, pathname]);

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

  // Prevent website body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdownIndex(null);
  }, [pathname]);

  // Hide Main Website Header on all Admin and Diagnostic routes
  if (pathname && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/db-connection') ||
    pathname.startsWith('/dbpaid') ||
    pathname.startsWith('/dbfree') ||
    pathname.startsWith('/dbd1')
  )) {
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
                    className={`nav-item has-dropdown has-mega-menu ${isDropdownOpen ? 'show-mobile-dropdown' : ''}`}
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
                      {renderMenuContent(menu)} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', marginLeft: '3px' }}></i>
                    </Link>

                    <div className="mega-menu">
                      <div className="mega-grid-container">
                        {targetMega.columns.map((col, cIdx) => {
                          // 1. INFO COLUMN
                          if (col.type === 'info') {
                            return (
                              <div key={cIdx} className="mega-col mega-info-col">
                                  {(col.title || col.iconHtml) ? (
                                    <h4 className="mega-col-title">
                                      {col.url ? (
                                        <Link href={mapLegacyUrl(col.url)} onClick={() => { setMobileMenuOpen(false); setOpenDropdownIndex(null); }} style={{ color: 'inherit', textDecoration: 'none' }}>
                                          {col.iconHtml ? (
                                            col.iconHtml.trim().startsWith('<') ? (
                                              <span dangerouslySetInnerHTML={{ __html: col.iconHtml }} style={{ marginRight: '6px' }} />
                                            ) : (
                                              <i className={col.iconHtml.trim()} style={{ marginRight: '6px', color: 'var(--primary)' }}></i>
                                            )
                                          ) : null}
                                          {col.title || ''}
                                        </Link>
                                      ) : (
                                        <>
                                          {col.iconHtml ? (
                                            col.iconHtml.trim().startsWith('<') ? (
                                              <span dangerouslySetInnerHTML={{ __html: col.iconHtml }} style={{ marginRight: '6px' }} />
                                            ) : (
                                              <i className={col.iconHtml.trim()} style={{ marginRight: '6px', color: 'var(--primary)' }}></i>
                                            )
                                          ) : null}
                                          {col.title || ''}
                                        </>
                                      )}
                                    </h4>
                                  ) : null}
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
                              </div>
                            );
                          }

                          // 2. IMAGE COLUMN
                          if (col.type === 'image') {
                            return (
                              <div key={cIdx} className="mega-col mega-image-col">
                                {col.title && col.title.trim() ? <h4 className="mega-col-title">{col.title}</h4> : null}
                                <div className="mega-image-box">
                                  {col.url ? (
                                    <Link href={mapLegacyUrl(col.url)} onClick={() => { setMobileMenuOpen(false); setOpenDropdownIndex(null); }}>
                                      <img src={formatURL(col.imageUrl || '/images/topmcqbd-book-platform.jpg')} alt={col.title || ''} className="mega-banner-img" />
                                    </Link>
                                  ) : (
                                    <img src={formatURL(col.imageUrl || '/images/topmcqbd-book-platform.jpg')} alt={col.title || ''} className="mega-banner-img" />
                                  )}
                                  {col.text && <p className="mega-banner-desc">{col.text}</p>}
                                </div>
                              </div>
                            );
                          }

                          // 3. ICON COLUMN (Card style with FontAwesome or Flaticon image)
                          if (col.type === 'icon') {
                            return (
                              <div key={cIdx} className="mega-col mega-icon-col">
                                {col.title && col.title.trim() ? <h4 className="mega-col-title">{col.title}</h4> : null}
                                <div className="mega-icon-cards">
                                  {(col.items || []).map((item, iIdx) => (
                                    <Link
                                      key={iIdx}
                                      href={mapLegacyUrl(item.url || '#')}
                                      className="mega-icon-card"
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        setOpenDropdownIndex(null);
                                      }}
                                    >
                                      <div className="mega-link-icon-box">
                                        {item.iconType === 'flaticon' || item.iconValue?.startsWith('http') || item.iconValue?.startsWith('/') ? (
                                          <img src={formatURL(item.iconValue)} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                        ) : (
                                          <i className={item.iconValue || 'fa-solid fa-building-columns'}></i>
                                        )}
                                      </div>
                                      <div className="mega-link-content">
                                        <div className="mega-link-title">{item.title}</div>
                                        {item.desc && <div className="mega-link-desc">{item.desc}</div>}
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // 4. LINKS COLUMN
                          return (
                            <div key={cIdx} className="mega-col mega-links-col">
                              {col.title && col.title.trim() ? <h4 className="mega-col-title">{col.title}</h4> : null}
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
                                    <i className={lk.icon || 'fa-solid fa-angle-right'}></i>
                                    <span>{lk.title || lk.text}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          );
                        })}
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
                    className={`nav-item has-dropdown ${isDropdownOpen ? 'show-mobile-dropdown' : ''}`}
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
                      {renderMenuContent(menu)} <i className="fa-solid fa-chevron-down" style={{ fontSize: '11px', marginLeft: '3px' }}></i>
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
                            {renderMenuContent(sub)}
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
                    {renderMenuContent(menu)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Action Buttons */}
          <div className="header-btn-group">
            {h.btnText && h.btnText.trim() && (
              <Link href={mapLegacyUrl(h.btnLink || '/contact')} className="btn-primary-head">
                {h.btnIcon && h.btnIcon.trim() && <i className={h.btnIcon.trim()}></i>} {h.btnText.trim()}
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
