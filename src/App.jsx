import React, { useState } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import ProductGrid from './components/ProductGrid/ProductGrid';
import About from './components/About/About';
import ProductModal from './components/ProductModal/ProductModal';

const BAGS_DATA = [
  {
    id: 1,
    name: 'AMARA CLUTCH',
    price: 'R$ 890,00',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    isOutOfStock: false
  },
  {
    id: 2,
    name: 'SOPHIA TOTE',
    price: 'R$ 1.250,00',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800',
    isOutOfStock: false
  },
  {
    id: 3,
    name: 'LUNA BUCKET',
    price: 'R$ 740,00',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800',
    isOutOfStock: true
  },
  {
    id: 4,
    name: 'ELARA SHOULDER',
    price: 'R$ 980,00',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
    isOutOfStock: false
  },
  {
    id: 5,
    name: 'GAIA HOBO',
    price: 'R$ 1.100,00',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&q=80&w=800',
    isOutOfStock: false
  },
  {
    id: 6,
    name: 'IRIS MINAUDIÈRE',
    price: 'R$ 620,00',
    image: 'https://images.unsplash.com/photo-1566150902887-9679ecc155ba?auto=format&fit=crop&q=80&w=800',
    isOutOfStock: false
  }
];

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <section id="collection">
          <ProductGrid products={BAGS_DATA} onProductClick={setSelectedProduct} />
        </section>
        <About />
      </main>
      <footer style={{ textAlign: 'center', padding: '6rem 0', background: '#f9f9f9', letterSpacing: '0.1rem' }}>
        <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>&copy; 2026 VALERIA MONIS HANDMADE. ALL RIGHTS RESERVED.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.6rem', fontWeight: 500 }}>
          <a href="#instagram">INSTAGRAM</a>
          <a href="#pinterest">PINTEREST</a>
          <a href="#contact">CONTACT</a>
        </div>
      </footer>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}

export default App;
