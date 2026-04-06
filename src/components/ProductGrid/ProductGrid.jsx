import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductGrid.module.scss';

// Import Swiper styles
import 'swiper/css';

const ProductGrid = ({ products, onProductClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className={styles.gridSection}>
      <div className={styles.container}>
        {isMobile ? (
          <Swiper
            spaceBetween={20}
            slidesPerView={1.2}
            centeredSlides={false}
            className={styles.mobileCarousel}
            grabCursor={true}
          >
            {products.map(product => (
              <SwiperSlide key={product.id}>
                <ProductCard 
                  product={product} 
                  onClick={() => onProductClick(product)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className={styles.grid}>
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => onProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
