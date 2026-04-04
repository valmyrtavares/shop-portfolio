import React, { useEffect } from 'react';
import styles from './ProductModal.module.scss';

const ProductModal = ({ product, onClose }) => {
  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <button className={styles.closeButton} onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.imageContainer}>
          <img src={product.image} alt={product.name} />
        </div>
        <div className={styles.info}>
          <h2 className={styles.name}>{product.name}</h2>
          <p className={styles.price}>{product.price}</p>
          <div className={styles.divider}></div>
          <p className={styles.description}>
            HANDMADE WITH PRECISION AND CARE. EVERY STITCH TELLS A STORY OF TIMELESS CRAFTSMANSHIP.
            CRAFTED FROM PREMIUM BRAZILIAN LEATHER.
          </p>
          <button 
            className={styles.buyButton}
            onClick={() => {
              const message = encodeURIComponent(`Olá! Gostaria de verificar a disponibilidade da bolsa: ${product.name}`);
              window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
            }}
          >
            CHECK AVAILABILITY
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
