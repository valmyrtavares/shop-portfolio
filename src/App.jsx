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
import AdminSiteSettings from './components/Admin/AdminSiteSettings';
import FeaturedCarousel from './components/FeaturedCarousel/FeaturedCarousel';
import { supabase } from './lib/supabase';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aboutContent, setAboutContent] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);

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

  const fetchSiteSettings = async (storeId) => {
    try {
      if (!storeId) return;
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('store_id', storeId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSiteSettings(data);
    } catch (error) {
      console.error('Error fetching site settings:', error.message);
    }
  };

  // Apply site settings (colors)
  useEffect(() => {
    if (siteSettings?.bg_color) {
      // Main BG
      const hex = siteSettings.bg_color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      
      const isLight = luminance > 0.5;
      const textColor = isLight ? '#1a1a1a' : '#ffffff';
      const mutedColor = isLight ? '#666666' : 'rgba(255, 255, 255, 0.7)';
      const borderColor = isLight ? '#eeeeee' : 'rgba(255, 255, 255, 0.1)';

      document.documentElement.style.setProperty('--bg-color', siteSettings.bg_color);
      document.documentElement.style.setProperty('--text-color', textColor);
      document.documentElement.style.setProperty('--text-muted-color', mutedColor);
      document.documentElement.style.setProperty('--border-color', borderColor);
    }

    if (siteSettings?.secondary_bg_color) {
      // Secondary BG
      const hex = siteSettings.secondary_bg_color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      
      const isLight = luminance > 0.5;
      const textColor = isLight ? '#1a1a1a' : '#ffffff';
      const mutedColor = isLight ? '#666666' : 'rgba(255, 255, 255, 0.7)';
      const borderColor = isLight ? '#eeeeee' : 'rgba(255, 255, 255, 0.1)';

      document.documentElement.style.setProperty('--secondary-bg-color', siteSettings.secondary_bg_color);
      document.documentElement.style.setProperty('--secondary-text-color', textColor);
      document.documentElement.style.setProperty('--secondary-text-muted-color', mutedColor);
      document.documentElement.style.setProperty('--secondary-border-color', borderColor);
    }
  }, [siteSettings]);

  useEffect(() => {
    // Check if URL has ?admin=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
    }

    // Initialize Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    initializeStore();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeStore = async (slug) => {
    try {
      setLoading(true);
      // 1. Fetch store info by slug
      const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setCurrentStore(store);

      // 2. Fetch all data for this store
      await Promise.all([
        fetchProducts(store.id), 
        fetchCategories(store.id), 
        fetchAboutContent(store.id),
        fetchSiteSettings(store.id)
      ]);
    } catch (err) {
      console.error('Failed to initialize store:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // Wrapper component to handle the dynamic slug
  const ShopContent = ({ isForAdmin = false }) => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [adminView, setAdminView] = useState('menu');

    useEffect(() => {
      if (slug) {
        initializeStore(slug);
      }
    }, [slug]);

    useEffect(() => {
      if (isForAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }, [isForAdmin]);

    if (loading && !currentStore) {
      return (
        <div style={{ textAlign: 'center', padding: '10rem 0', letterSpacing: '0.2rem', fontSize: '0.8rem', opacity: 0.5 }}>
          INITIALIZING SHOP...
        </div>
      );
    }

    if (!currentStore && !loading) {
      return (
        <div style={{ textAlign: 'center', padding: '10rem 0' }}>
          <h2>LOJA NÃO ENCONTRADA</h2>
          <p>Verifique se o endereço está correto.</p>
        </div>
      );
    }

    return (
      <>
        <Header 
          isAdmin={isAdmin && isAuthenticated} 
          onToggleAdmin={(val) => navigate(val ? `/${slug}/admin` : `/${slug}`)} 
          categories={categories}
          settings={siteSettings}
          onCategorySelect={(cat, shouldScroll = true) => {
            setActiveCategory(cat);
            setAdminView('menu');
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
                <AdminLogin />
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingTop: '4rem' }}>
                    <button 
                      onClick={() => navigate(`/${slug}`)}
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
                      onProductAdded={() => fetchProducts(currentStore.id)} 
                      onCancel={() => setAdminView('menu')} 
                      currentStoreId={currentStore?.id}
                    />
                  )}

                  {adminView === 'list' && (
                    <AdminProductList 
                      products={products} 
                      onRefresh={() => fetchProducts(currentStore.id)} 
                      onBack={() => setAdminView('menu')}
                    />
                  )}

                  {adminView === 'categories' && (
                    <AdminCategoryManager 
                      currentStoreId={currentStore?.id}
                      onBack={() => {
                        setAdminView('menu');
                        fetchCategories(currentStore.id);
                      }} 
                    />
                  )}

                  {adminView === 'about' && (
                    <AdminAboutManager 
                      currentStoreId={currentStore?.id}
                      onBack={() => {
                        setAdminView('menu');
                        initializeStore(slug);
                      }}
                    />
                  )}

                  {adminView === 'settings' && (
                    <AdminSiteSettings 
                      currentStoreId={currentStore?.id}
                      onBack={() => {
                        setAdminView('menu');
                        fetchSiteSettings(currentStore.id);
                      }}
                    />
                  )}
                </>
              )}
            </section>
          ) : (
            <>
              <Hero settings={siteSettings} />
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
      </>
    );
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/:slug" element={<ShopContent isForAdmin={false} />} />
        <Route path="/:slug/admin" element={<ShopContent isForAdmin={true} />} />
        {/* Landing page for the root domain could go here */}
        <Route path="/" element={
          <div style={{ textAlign: 'center', padding: '10rem 0' }}>
            <h1>BEM-VINDO À VITRINE ARTESANAL</h1>
            <p>Selecione uma loja para visitar.</p>
            <a href="/loja-principal" style={{ textDecoration: 'underline' }}>Ir para Loja Principal</a>
          </div>
        } />
      </Routes>
      <footer style={{ 
        textAlign: 'center', 
        padding: '6rem 0', 
        background: 'var(--secondary-bg-color, #f9f9f9)', 
        color: 'var(--secondary-text-color, #1a1a1a)',
        letterSpacing: '0.1rem' 
      }}>
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
