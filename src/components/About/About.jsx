import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './About.module.scss';

const About = ({ content }) => {
  const defaultContent = {
    title: 'VALERIA MONIS',
    description: '<p>BORN FROM A PASSION FOR TRADITIONAL CRAFTSMANSHIP, EACH VALERIA MONIS PIECE IS METICULOUSLY HAND-STITCHED USING THE FINEST BRIDLE LEATHER. WE BELIEVE IN SLOW FASHION, CREATING HEIRLOOMS THAT GAIN CHARACTER WITH EVERY PASSING YEAR.</p>',
    image_url: 'https://images.unsplash.com/photo-1544411047-c491574abb36?auto=format&fit=crop&q=80&w=1200'
  };

  const displayContent = content || defaultContent;

  return (
    <section id="about" className={styles.about}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.label}>OUR STORY</span>
          <h2 className={styles.title}>{displayContent.title}</h2>
          <div className={styles.divider}></div>
          <div 
            className={styles.richText} 
            dangerouslySetInnerHTML={{ __html: displayContent.description }}
          />
        </div>
        <div className={styles.imageSide}>
          <img src={displayContent.image_url} alt={displayContent.title} />
        </div>
      </div>
    </section>
  );
};

export default About;
