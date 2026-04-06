import React from 'react';
import styles from './Header.module.scss';

const Header = ({ isAdmin, onToggleAdmin, categories, onCategorySelect }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>VALERIA MONIS</h1>
          <p>HANDMADE BAGS</p>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li className={styles.hasDropdown}>
              <a href="#collection" onClick={() => { onToggleAdmin(false); onCategorySelect(null); }}>
                COLEÇÃO
              </a>
              {categories && categories.length > 0 && (
                <ul className={styles.dropdown}>
                  <li key="all">
                    <a href="#collection" onClick={(e) => { e.preventDefault(); onCategorySelect(null); }}>
                      VER TUDO
                    </a>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <a href="#collection" onClick={(e) => { e.preventDefault(); onCategorySelect(cat); }}>
                        {cat.name.toUpperCase()}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li><a href="#about" onClick={() => onToggleAdmin(false)}>SOBRE</a></li>
            <li><a href="#contact" onClick={() => onToggleAdmin(false)}>CONTATO</a></li>
            <li><a href="#shop" onClick={() => onToggleAdmin(false)}>SHOP</a></li>
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
