import React from 'react';
import styles from './Contact.module.scss';

const Contact = () => {
  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>GET IN TOUCH</span>
          <h2 className={styles.title}>Contact Us</h2>
          <div className={styles.divider}></div>
          <p className={styles.subtitle}>
            FOR INQUIRIES, CUSTOM ORDERS, OR COLLABORATIONS.
          </p>
        </div>
        
        <div className={styles.content}>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.inputGroup}>
              <input type="text" placeholder="NAME" required />
            </div>
            <div className={styles.inputGroup}>
              <input type="email" placeholder="EMAIL" required />
            </div>
            <div className={styles.inputGroup}>
              <textarea placeholder="MESSAGE" rows="5" required></textarea>
            </div>
            <button type="submit" className={styles.submitButton}>SEND MESSAGE</button>
          </form>
          
          <div className={styles.info}>
            <div className={styles.infoItem}>
              <h3>VISIT US</h3>
              <p>RUA DAS ARTES, 123<br />SÃO PAULO, BRASIL</p>
            </div>
            <div className={styles.infoItem}>
              <h3>EMAIL</h3>
              <p>HELLO@VALERIAMONIS.COM</p>
            </div>
            <div className={styles.infoItem}>
              <h3>WHATSAPP</h3>
              <p>+55 11 99999-9999</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
