import React, { useState, useEffect, useRef } from 'react';
import styles from './Header.module.scss';

const Header = ({ isAdmin, onToggleAdmin, categories, onCategorySelect, onCarouselOpen }) => {
  const menuRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (cat, shouldFilter) => {
    onCategorySelect(cat, shouldFilter);
    setIsDropdownOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>VALERIA MONIS</h1>
          <p>HANDMADE BAGS</p>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li 
              ref={menuRef}
              className={`${styles.hasDropdown} ${isDropdownOpen ? styles.open : ''}`}
              onMouseEnter={() => window.innerWidth > 768 && setIsDropdownOpen(true)}
              onMouseLeave={() => window.innerWidth > 768 && setIsDropdownOpen(false)}
            >
              <a 
                href="#collection" 
                onClick={(e) => { 
                  e.preventDefault();
                  setIsDropdownOpen(!isDropdownOpen); // Toggle on main click for mobile
                  onToggleAdmin(false); 
                  onCategorySelect(null, false); 
                }}
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
            <li><a href="#about" onClick={() => onToggleAdmin(false)}>SOBRE</a></li>
            <li><a href="#contact" onClick={() => onToggleAdmin(false)}>CONTATO</a></li>
            <li>
              <a 
                href="#destaques" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onToggleAdmin(false); 
                  onCarouselOpen(); 
                }}
              >
                DESTAQUES
              </a>
            </li>
            <li>
              <a 
                href="#admin" 
                onClick={(e) => {
                  e.preventDefault();
                  onToggleAdmin(true);
                }}
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
