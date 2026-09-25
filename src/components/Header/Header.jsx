import React, { useState, useEffect, useRef } from 'react';
import styles from './Header.module.scss';

const Header = ({ isAdmin, onToggleAdmin, categories, onCategorySelect, onCarouselOpen, settings }) => {
  const menuRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCollectionOpen, setIsMobileCollectionOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (sectionId) => {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleNavClick = (e, sectionId, extraAction) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);
    if (extraAction) extraAction();
    if (sectionId) scrollToSection(sectionId);
  };

  const handleCategoryClick = (cat, shouldFilter) => {
    onCategorySelect(cat, shouldFilter);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    scrollToSection('collection');
  };

  return (
    <header className={styles.header}>
      {/* Fixed Hamburger Button for Mobile */}
      <button 
        className={`${styles.hamburgerBtn} ${isMobileMenuOpen ? styles.active : ''}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>

      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.logo}>
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.header_title || 'Logo'} 
                style={{ 
                  width: '100%', 
                  maxWidth: '350px', 
                  height: 'auto', 
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            ) : (
              <>
                <h1>{settings?.header_title || 'VALERIA MONIS'}</h1>
                <p>{settings?.header_subtitle || 'HANDMADE BAGS'}</p>
              </>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.navDesktop}>
          <ul>
            <li 
              ref={menuRef}
              className={`${styles.hasDropdown} ${isDropdownOpen ? styles.open : ''}`}
              onMouseEnter={() => window.innerWidth > 768 && setIsDropdownOpen(true)}
              onMouseLeave={() => window.innerWidth > 768 && setIsDropdownOpen(false)}
            >
              <a 
                href="#collection" 
                onClick={(e) => handleNavClick(e, 'collection', () => {
                  setIsDropdownOpen(!isDropdownOpen);
                  onToggleAdmin(false); 
                  onCategorySelect(null, false); 
                })}
              >
                COLEÇÃO
              </a>
              {categories && categories.length > 0 && (
                <ul className={`${styles.dropdown} ${isDropdownOpen ? styles.show : ''}`}>
                  <li key="all">
                    <a href="#collection" onClick={(e) => { e.preventDefault(); handleCategoryClick(null, true); }}>
                      VER TUDO
                    </a>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <a href="#collection" onClick={(e) => { e.preventDefault(); handleCategoryClick(cat, true); }}>
                        {cat.name.toUpperCase()}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <a href="#about" onClick={(e) => handleNavClick(e, 'about', () => onToggleAdmin(false))}>SOBRE</a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact', () => onToggleAdmin(false))}>CONTATO</a>
            </li>
            <li>
              <a 
                href="#destaques" 
                onClick={(e) => handleNavClick(e, null, () => { 
                  onToggleAdmin(false); 
                  onCarouselOpen(); 
                })}
              >
                DESTAQUES
              </a>
            </li>
            <li>
              <a 
                href="#admin" 
                onClick={(e) => handleNavClick(e, null, () => onToggleAdmin(true))}
                className={`${styles.adminLink} ${isAdmin ? styles.active : ''}`}
              >
                ADMIN
              </a>
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation Full-Viewport Overlay */}
        <nav className={`${styles.navMobile} ${isMobileMenuOpen ? styles.open : ''}`}>
          <ul>
            <li className={styles.mobileHasDropdown}>
              <a 
                href="#collection" 
                onClick={(e) => { 
                  e.preventDefault();
                  onToggleAdmin(false); 
                  onCategorySelect(null, false);
                  if (categories && categories.length > 0) {
                    setIsMobileCollectionOpen(!isMobileCollectionOpen);
                  } else {
                    handleNavClick(e, 'collection');
                  }
                }}
              >
                COLEÇÃO {categories && categories.length > 0 && (isMobileCollectionOpen ? '▲' : '▼')}
              </a>
              {categories && categories.length > 0 && isMobileCollectionOpen && (
                <ul className={styles.mobileSubMenu}>
                  <li key="all-mobile">
                    <a href="#collection" onClick={(e) => { e.preventDefault(); handleCategoryClick(null, true); }}>
                      VER TUDO
                    </a>
                  </li>
                  {categories.map(cat => (
                    <li key={`mobile-${cat.id}`}>
                      <a href="#collection" onClick={(e) => { e.preventDefault(); handleCategoryClick(cat, true); }}>
                        {cat.name.toUpperCase()}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <a href="#about" onClick={(e) => handleNavClick(e, 'about', () => onToggleAdmin(false))}>
                SOBRE
              </a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact', () => onToggleAdmin(false))}>
                CONTATO
              </a>
            </li>
            <li>
              <a 
                href="#destaques" 
                onClick={(e) => handleNavClick(e, null, () => { 
                  onToggleAdmin(false); 
                  onCarouselOpen(); 
                })}
              >
                DESTAQUES
              </a>
            </li>
            <li>
              <a 
                href="#admin" 
                onClick={(e) => handleNavClick(e, null, () => onToggleAdmin(true))}
                className={`${styles.adminLink} ${isAdmin ? styles.active : ''}`}
              >
                ADMIN
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

