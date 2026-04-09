import React from 'react';
import styles from './Hero.module.scss';

const Hero = ({ settings }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          {settings?.hero_title ? (
            settings.hero_title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < settings.hero_title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))
          ) : (
            <>ESSENTIAL <br /> ELEGANCE</>
          )}
        </h2>
        <p className={styles.subtitle}>{settings?.hero_subtitle || 'HANDMADE LEATHER ARTISTRY FROM BRAZIL'}</p>
        <button className={styles.cta} onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}>
          EXPLORE COLLECTION
        </button>
      </div>
    </section>
  );
};

export default Hero;
