import React, { useEffect } from 'react';
import styles from './ProductModal.module.scss';

const ProductModal = ({ product, onClose, artisanInfo }) => {
  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product) return null;

  const handleWhatsAppClick = () => {
    const whatsappNumber = artisanInfo?.whatsapp || '5511999999999';
    const message = encodeURIComponent(
      `Olá! Eu quero a bolsa: ${product.name.toUpperCase()}\n` +
      `Valor: ${product.price}\n\n` +
      `Tenho algumas dúvidas sobre este modelo:`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

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
            {product.description?.toUpperCase() || 'HANDMADE WITH PRECISION AND CARE. EVERY STITCH TELLS A STORY OF TIMELESS CRAFTSMANSHIP.'}
          </p>
          <button 
            className={styles.buyButton}
            onClick={handleWhatsAppClick}
          >
            EU QUERO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
