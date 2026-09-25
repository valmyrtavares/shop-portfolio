import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductGrid.module.scss';

// Import Swiper styles
import 'swiper/css';

const CategoryCarousel = ({ categoryTitle, categoryId, products, onProductClick }) => {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    if (swiperRef.current) {
      setIsBeginning(swiperRef.current.isBeginning);
      setIsEnd(swiperRef.current.isEnd);
      setCanScroll(!swiperRef.current.isBeginning || !swiperRef.current.isEnd);
    }
  }, [products]);

  return (
    <div className={styles.categoryBlock} id={categoryId ? `category-${categoryId}` : undefined}>
      <div className={styles.categoryHeader}>
        <h2 className={styles.categoryTitle}>{categoryTitle.toUpperCase()}</h2>
        <div className={styles.categoryDivider}></div>
      </div>

      <div className={styles.carouselWrapper}>
        <button 
          className={`${styles.navButton} ${styles.prevButton} ${isBeginning ? styles.disabled : ''}`} 
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Produtos anteriores"
          disabled={isBeginning}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className={styles.swiperContainer}>
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
              setCanScroll(!swiper.isBeginning || !swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onResize={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
              setCanScroll(!swiper.isBeginning || !swiper.isEnd);
            }}
            spaceBetween={24}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
            }}
            className={styles.swiper}
            grabCursor={true}
          >
            {products.map(product => (
              <SwiperSlide key={product.id} className={styles.slide}>
                <ProductCard 
                  product={product} 
                  onClick={() => onProductClick(product)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <button 
          className={`${styles.navButton} ${styles.nextButton} ${isEnd ? styles.disabled : ''}`} 
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Próximos produtos"
          disabled={isEnd}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

const ProductGrid = ({ products = [], categories = [], onProductClick }) => {
  if (!products || products.length === 0) {
    return (
      <section className={styles.gridSection}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
            NENHUM PRODUTO ENCONTRADO
          </div>
        </div>
      </section>
    );
  }

  // Group products by category
  const categoryGroups = [];
  const categorizedProductIds = new Set();

  if (categories && categories.length > 0) {
    categories.forEach(cat => {
      const catProducts = products.filter(p => p.category_id === cat.id);
      if (catProducts.length > 0) {
        categoryGroups.push({
          id: cat.id,
          name: cat.name,
          products: catProducts,
        });
        catProducts.forEach(p => categorizedProductIds.add(p.id));
      }
    });
  }

  // Uncategorized products or products not matching active categories
  const uncategorizedProducts = products.filter(p => !categorizedProductIds.has(p.id));
  if (uncategorizedProducts.length > 0) {
    categoryGroups.push({
      id: null,
      name: categoryGroups.length > 0 ? 'Outros Produtos' : 'Coleção Geral',
      products: uncategorizedProducts,
    });
  }

  return (
    <section className={styles.gridSection}>
      <div className={styles.container}>
        {categoryGroups.map(group => (
          <CategoryCarousel
            key={group.id || 'uncategorized'}
            categoryId={group.id}
            categoryTitle={group.name}
            products={group.products}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
