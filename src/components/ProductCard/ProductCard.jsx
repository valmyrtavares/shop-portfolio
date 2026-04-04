import React from 'react';
import styles from './ProductCard.module.scss';

const ProductCard = ({ product, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageWrapper}>
        <img src={product.image} alt={product.name} />
        {product.is_out_of_stock && <span className={styles.badge}>OUT OF STOCK</span>}
        <div className={styles.quickView}>QUICK VIEW</div>
      </div>
      <div className={styles.details}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
