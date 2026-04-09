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
import AdminCategoryManager from './components/Admin/AdminCategoryManager';
import AdminAboutManager from './components/Admin/AdminAboutManager';
import AdminLogin from './components/Admin/AdminLogin';
import FeaturedCarousel from './components/FeaturedCarousel/FeaturedCarousel';
import { supabase } from './lib/supabase';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aboutContent, setAboutContent] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('admin_authenticated') === 'true'
  );
  const [adminView, setAdminView] = useState('menu'); // 'menu', 'add', 'list', 'categories', 'about'
  const [activeCategory, setActiveCategory] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Initial deep link check once products are loaded
  useEffect(() => {
    if (products.length > 0 && !initialCheckDone) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      if (productId) {
        const product = products.find(p => String(p.id) === String(productId));
        if (product) {
          setSelectedProduct(product);
        }
      }
      setInitialCheckDone(true);
    }
  }, [products, initialCheckDone]);

  // Sync URL with selectedProduct state
  useEffect(() => {
    if (!initialCheckDone) return;

    const params = new URLSearchParams(window.location.search);
    const currentIdInUrl = params.get('product');
    
    if (selectedProduct) {
      // If product selected and NOT in URL, push state
      if (currentIdInUrl !== String(selectedProduct.id)) {
        params.set('product', selectedProduct.id);
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.pushState({ type: 'product', id: selectedProduct.id }, '', newUrl);
      }
    } else {
      // If NO product selected but ID IS in URL, remove it
      if (currentIdInUrl) {
        params.delete('product');
        const search = params.toString();
        const newUrl = `${window.location.pathname}${search ? '?' + search : ''}${window.location.hash}`;
        window.history.pushState({ type: 'product', id: null }, '', newUrl);
      }
    }
  }, [selectedProduct, initialCheckDone]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      
      if (productId) {
        const product = products.find(p => String(p.id) === String(productId));
        setSelectedProduct(product || null);
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  useEffect(() => {
    // Check if URL has ?admin=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    }

    fetchInitialData();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setIsAdmin(false);
    window.history.pushState({}, '', window.location.pathname);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchCategories(), fetchAboutContent()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setAboutContent(data);
    } catch (error) {
      console.error('Error fetching about content:', error.message);
    }
  };

  const filteredProducts = activeCategory 
    ? products.filter(p => p.category_id === activeCategory.id)
    : products;

  return (
    <div className="app">
      <Header 
        isAdmin={isAdmin && isAuthenticated} 
        onToggleAdmin={(val) => setIsAdmin(val)} 
        categories={categories}
        onCategorySelect={(cat, shouldScroll = true) => {
          setActiveCategory(cat);
          setAdminView('menu');
          // Scroll to collection only if required
          if (shouldScroll) {
            const el = document.getElementById('collection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onCarouselOpen={() => setIsCarouselOpen(true)}
      />
      <main>
        {isAdmin ? (
          <section id="admin">
            {!isAuthenticated ? (
              <AdminLogin onLogin={handleLogin} />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingTop: '4rem' }}>
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

                  <button 
                    onClick={handleLogout}
                    style={{ 
                      background: 'none', 
                      border: '1px solid #ff4d4d', 
                      color: '#ff4d4d',
                      padding: '0.5rem 1rem', 
                      fontSize: '0.6rem', 
                      letterSpacing: '0.1rem',
                      cursor: 'pointer'
                    }}
                  >
                    SAIR (LOGOUT)
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

                {adminView === 'categories' && (
                  <AdminCategoryManager 
                    onBack={() => {
                      setAdminView('menu');
                      fetchCategories(); // Refresh categories in case they changed
                    }} 
                  />
                )}

                {adminView === 'about' && (
                  <AdminAboutManager 
                    onBack={() => {
                      setAdminView('menu');
                      fetchInitialData();
                    }}
                  />
                )}
              </>
            )}
          </section>
        ) : (
          <>
            <Hero />
            <section id="collection">
              {activeCategory && (
                <div style={{ textAlign: 'center', padding: '4rem 0 0', fontFamily: 'serif' }}>
                  <h2 style={{ fontSize: '1.2rem', letterSpacing: '0.2rem', opacity: 0.6 }}>{activeCategory.name.toUpperCase()}</h2>
                  <button 
                    onClick={() => setActiveCategory(null)}
                    style={{ background: 'none', border: 'none', fontSize: '0.6rem', letterSpacing: '0.1rem', cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline' }}
                  >
                    VER TODA A COLEÇÃO
                  </button>
                </div>
              )}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '10rem 0', letterSpacing: '0.2rem', fontSize: '0.8rem', opacity: 0.5 }}>
                  LOADING...
                </div>
              ) : (
                <ProductGrid products={filteredProducts} onProductClick={setSelectedProduct} />
              )}
            </section>
            <About content={aboutContent} />
            <Contact contactInfo={aboutContent} />
          </>
        )}
      </main>
      <footer style={{ textAlign: 'center', padding: '6rem 0', background: '#f9f9f9', letterSpacing: '0.1rem' }}>
        <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>&copy; 2026 {aboutContent?.title?.toUpperCase() || 'VALERIA MONIS'} HANDMADE. ALL RIGHTS RESERVED.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.6rem', fontWeight: 500 }}>
          {aboutContent?.instagram && (
            <a 
              href={aboutContent.instagram.startsWith('http') ? aboutContent.instagram : `https://instagram.com/${aboutContent.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              INSTAGRAM
            </a>
          )}
          {aboutContent?.pinterest && (
            <a 
              href={aboutContent.pinterest.startsWith('http') ? aboutContent.pinterest : `https://pinterest.com/${aboutContent.pinterest}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              PINTEREST
            </a>
          )}
          <a href="#contact" onClick={() => setActiveCategory(null)}>CONTACT</a>
        </div>
      </footer>

      {isCarouselOpen && (
        <FeaturedCarousel 
          products={products}
          onClose={() => setIsCarouselOpen(false)}
          onProductClick={(product) => {
            setSelectedProduct(product);
          }}
        />
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          artisanInfo={aboutContent}
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}

export default App;
