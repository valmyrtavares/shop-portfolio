import React from 'react';
import styles from './Hero.module.scss';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h2 className={styles.title}>ESSENTIAL <br /> ELEGANCE</h2>
        <p className={styles.subtitle}>HANDMADE LEATHER ARTISTRY FROM BRAZIL</p>
        <button className={styles.cta} onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}>
          EXPLORE COLLECTION
        </button>
      </div>
    </section>
  );
};

export default Hero;
