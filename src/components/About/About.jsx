import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './About.module.scss';

const About = () => {
  const [content, setContent] = useState({
    title: 'VALERIA MONIS',
    description: '<p>BORN FROM A PASSION FOR TRADITIONAL CRAFTSMANSHIP, EACH VALERIA MONIS PIECE IS METICULOUSLY HAND-STITCHED USING THE FINEST BRIDLE LEATHER. WE BELIEVE IN SLOW FASHION, CREATING HEIRLOOMS THAT GAIN CHARACTER WITH EVERY PASSING YEAR.</p>',
    image_url: 'https://images.unsplash.com/photo-1544411047-c491574abb36?auto=format&fit=crop&q=80&w=1200'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setContent({
          title: data.title,
          description: data.description,
          image_url: data.image_url
        });
      }
    } catch (error) {
      console.error('Error fetching about content:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="about" className={styles.about}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.label}>OUR STORY</span>
          <h2 className={styles.title}>{content.title}</h2>
          <div className={styles.divider}></div>
          <div 
            className={styles.richText} 
            dangerouslySetInnerHTML={{ __html: content.description }}
          />
        </div>
        <div className={styles.imageSide}>
          <img src={content.image_url} alt={content.title} />
        </div>
      </div>
    </section>
  );
};

export default About;
