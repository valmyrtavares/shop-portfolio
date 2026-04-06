import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './FeaturedCarousel.module.scss';

const FeaturedCarousel = ({ products, onClose, onProductClick }) => {
  // Only show products marked as featured, or all if none are marked
  const featuredProducts = products.filter(p => p.is_featured);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products;

  return (
    <div className={styles.overlay}>
      <button className={styles.closeButton} onClick={onClose} aria-label="Close highlights">
        ×
      </button>

      <div className={styles.carouselContainer}>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          navigation={true}
          pagination={{ clickable: true }}
          loop={displayProducts.length > 1}
          className={styles.swiper}
        >
          {displayProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <div 
                className={styles.slideItem} 
                onClick={() => {
                  onProductClick(product);
                  onClose();
                }}
              >
                <img src={product.image} alt={product.name} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default FeaturedCarousel;
