import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import ProductGrid from './components/ProductGrid/ProductGrid';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import ProductModal from './components/ProductModal/ProductModal';
import AdminForm from './components/Admin/AdminForm';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminProductList from './components/Admin/AdminProductList';
import { supabase } from './lib/supabase';

function App() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminView, setAdminView] = useState('menu'); // 'menu', 'add', 'list'

  useEffect(() => {
    // Check if URL has ?admin=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    }

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Header isAdmin={isAdmin} onToggleAdmin={(val) => setIsAdmin(val)} />
      <main>
        {isAdmin ? (
          <section id="admin">
            <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
              <button 
                onClick={() => {
                  setIsAdmin(false);
                  window.history.pushState({}, '', window.location.pathname);
                }}
                style={{ 
                  background: 'none', 
                  border: '1px solid #ddd', 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.6rem', 
                  letterSpacing: '0.1rem',
                  cursor: 'pointer'
                }}
              >
                &larr; VOLTAR AO SITE
              </button>
            </div>
            
            {adminView === 'menu' && (
              <AdminDashboard onViewChange={setAdminView} />
            )}

            {adminView === 'add' && (
              <AdminForm 
                onProductAdded={fetchProducts} 
                onCancel={() => setAdminView('menu')} 
              />
            )}

            {adminView === 'list' && (
              <AdminProductList 
                products={products} 
                onRefresh={fetchProducts} 
                onBack={() => setAdminView('menu')}
              />
            )}
          </section>
        ) : (
          <>
            <Hero />
            <section id="collection">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '10rem 0', letterSpacing: '0.2rem', fontSize: '0.8rem', opacity: 0.5 }}>
                  LOADING COLLECTION...
                </div>
              ) : (
                <ProductGrid products={products} onProductClick={setSelectedProduct} />
              )}
            </section>
            <About />
            <Contact />
          </>
        )}
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
