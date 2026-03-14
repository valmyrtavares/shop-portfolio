import React from 'react';
import styles from './About.module.scss';

const About = () => {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.label}>OUR STORY</span>
          <h2 className={styles.title}>Valeria Monis Handmade</h2>
          <div className={styles.divider}></div>
          <p className={styles.text}>
            BORN FROM A PASSION FOR TRADITIONAL CRAFTSMANSHIP, EACH VALERIA MONIS PIECE IS 
            METICULOUSLY HAND-STITCHED USING THE FINEST BRIDLE LEATHER. WE BELIEVE IN 
            SLOW FASHION, CREATING HEIRLOOMS THAT GAIN CHARACTER WITH EVERY PASSING YEAR.
          </p>
          <p className={styles.text}>
            EVERY BAG IS A UNIQUE TESTAMENT TO PATIENCE AND ARTISTRY, HANDCRAFTED IN OUR 
            BOUTIQUE WORKSHOP WHERE QUALITY ALWAYS TRANSCENDS QUANTITY.
          </p>
        </div>
        <div className={styles.imageSide}>
          <img src="https://images.unsplash.com/photo-1544411047-c491574abb36?auto=format&fit=crop&q=80&w=1200" alt="Handmade Leather Process" />
        </div>
      </div>
    </section>
  );
};

export default About;
