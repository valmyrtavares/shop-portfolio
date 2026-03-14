import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductGrid.module.scss';

const ProductGrid = ({ products, onProductClick }) => {
  return (
    <section className={styles.gridSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
