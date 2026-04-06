import React from 'react';
import styles from './Header.module.scss';

const Header = ({ isAdmin, onToggleAdmin }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>VALERIA MONIS</h1>
          <p>HANDMADE BAGS</p>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li><a href="#collection" onClick={() => onToggleAdmin(false)}>COLEÇÃO</a></li>
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
