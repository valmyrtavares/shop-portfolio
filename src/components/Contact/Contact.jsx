import React from 'react';
import styles from './Contact.module.scss';

const Contact = ({ contactInfo }) => {
  const info = contactInfo || {
    email: 'HELLO@VALERIAMONIS.COM',
    phone: '+55 11 99999-9999',
    whatsapp: '5511999999999',
    address: 'RUA DAS ARTES, 123 - SÃO PAULO, BRASIL',
    formspree_url: ''
  };

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
          <form 
            className={styles.form} 
            action={`https://formsubmit.co/${info.email}`} 
            method="POST"
          >
            {/* FormSubmit Configuration */}
            <input type="hidden" name="_subject" value="Nova mensagem de contato - VALERIA MONIS" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            
            <div className={styles.inputGroup}>
              <input type="text" name="name" placeholder="NAME" required />
            </div>
            <div className={styles.inputGroup}>
              <input type="email" name="email" placeholder="EMAIL" required />
            </div>
            <div className={styles.inputGroup}>
              <textarea name="message" placeholder="MESSAGE" rows="5" required></textarea>
            </div>
            <button type="submit" className={styles.submitButton}>SEND MESSAGE</button>
          </form>
          
          <div className={styles.info}>
            <div className={styles.infoItem}>
              <h3>VISIT US</h3>
              <p>{info.address}</p>
            </div>
            <div className={styles.infoItem}>
              <h3>EMAIL</h3>
              <p><a href={`mailto:${info.email}`}>{info.email}</a></p>
            </div>
            <div className={styles.infoItem}>
              <h3>WHATSAPP</h3>
              <p>
                <a 
                  href={`https://wa.me/${info.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de falar sobre o seu trabalho.')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {info.phone}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
