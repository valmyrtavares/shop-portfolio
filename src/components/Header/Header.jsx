import React from 'react';
import styles from './Header.module.scss';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>VALERIA MONIS</h1>
          <p>HANDMADE BAGS</p>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li><a href="#collection">COLEÇÃO</a></li>
            <li><a href="#about">SOBRE</a></li>
            <li><a href="#contact">CONTATO</a></li>
            <li><a href="#shop">SHOP</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
