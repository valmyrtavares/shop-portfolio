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
import AdminSignup from './components/Admin/AdminSignup';
import AdminSiteSettings from './components/Admin/AdminSiteSettings';
import SuperAdmin from './components/Admin/SuperAdmin';
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
  const [currentUser, setCurrentUser] = useState(null);

  // Initial deep link check once products are loaded
  useEffect(() => {
    if (products.length > 0 && !initialCheckDone) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      if (productId) {
        const product = products.find(p => String(p.id) === String(productId));
        if (product) setSelectedProduct(product);
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
      if (currentIdInUrl !== String(selectedProduct.id)) {
        params.set('product', selectedProduct.id);
        const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
        window.history.pushState({ type: 'product', id: selectedProduct.id }, '', newUrl);
      }
    } else if (currentIdInUrl) {
      params.delete('product');
      const search = params.toString();
      const newUrl = `${window.location.pathname}${search ? '?' + search : ''}${window.location.hash}`;
      window.history.pushState({ type: 'product', id: null }, '', newUrl);
    }
  }, [selectedProduct, initialCheckDone]);

  const fetchSiteSettings = async (storeId) => {
    try {
      if (!storeId) return;
      const { data, error } = await supabase.from('site_settings').select('*').eq('store_id', storeId).maybeSingle();
      if (data) setSiteSettings(data);
    } catch (error) { console.error('Error fetching site settings:', error.message); }
  };

  const fetchProducts = async (storeId) => {
    try {
      if (!storeId) return;
      const { data, error } = await supabase.from('products').select('*').eq('store_id', storeId).order('id', { ascending: true });
      setProducts(data || []);
    } catch (error) { console.error('Error fetching products:', error.message); }
  };

  const fetchCategories = async (storeId) => {
    try {
      if (!storeId) return;
      const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId).order('name');
      setCategories(data || []);
    } catch (error) { console.error('Error fetching categories:', error.message); }
  };

  const fetchAboutContent = async (storeId) => {
    try {
      if (!storeId) return;
      const { data, error } = await supabase.from('about_content').select('*').eq('store_id', storeId).maybeSingle();
      if (data) setAboutContent(data);
    } catch (error) { console.error('Error fetching about content:', error.message); }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setCurrentUser(session?.user || null);
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setIsAuthenticated(true); setCurrentUser(user); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const initializeStore = async (slug) => {
    try {
      setLoading(true);
      const { data: store, error } = await supabase.from('stores').select('*').eq('slug', slug).maybeSingle();
      if (error) throw error;
      setCurrentStore(store);
      if (store) {
        await Promise.all([
          fetchProducts(store.id), 
          fetchCategories(store.id), 
          fetchAboutContent(store.id),
          fetchSiteSettings(store.id)
        ]);
      } else {
        setProducts([]); setCategories([]); setAboutContent(null); setSiteSettings(null);
      }
    } catch (err) { console.error('Failed to initialize store:', err.message);
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
  };

  const filteredProducts = activeCategory ? products.filter(p => p.category_id === activeCategory.id) : products;

  // CSS Variables sync
  useEffect(() => {
    if (siteSettings?.bg_color) {
      document.documentElement.style.setProperty('--bg-color', siteSettings.bg_color);
    }
    if (siteSettings?.secondary_bg_color) {
      document.documentElement.style.setProperty('--secondary-bg-color', siteSettings.secondary_bg_color);
    }
  }, [siteSettings]);

  return (
    <div className="app">
      <Routes>
        <Route path="/master-admin" element={<SuperAdmin />} />
        <Route path="/signup" element={<AdminSignup />} />
        <Route path="/:slug" element={
          <ShopContent 
            isForAdmin={false} loading={loading} currentStore={currentStore}
            isAuthenticated={isAuthenticated} currentUser={currentUser}
            categories={categories} siteSettings={siteSettings} products={products}
            aboutContent={aboutContent} activeCategory={activeCategory}
            setActiveCategory={setActiveCategory} setSelectedProduct={setSelectedProduct}
            filteredProducts={filteredProducts} initializeStore={initializeStore}
            handleLogout={handleLogout} fetchProducts={fetchProducts}
            fetchCategories={fetchCategories} fetchSiteSettings={fetchSiteSettings}
            setIsCarouselOpen={setIsCarouselOpen}
          />
        } />
        <Route path="/:slug/admin" element={
          <ShopContent 
            isForAdmin={true} loading={loading} currentStore={currentStore}
            isAuthenticated={isAuthenticated} currentUser={currentUser}
            categories={categories} siteSettings={siteSettings} products={products}
            aboutContent={aboutContent} activeCategory={activeCategory}
            setActiveCategory={setActiveCategory} setSelectedProduct={setSelectedProduct}
            filteredProducts={filteredProducts} initializeStore={initializeStore}
            handleLogout={handleLogout} fetchProducts={fetchProducts}
            fetchCategories={fetchCategories} fetchSiteSettings={fetchSiteSettings}
            setIsCarouselOpen={setIsCarouselOpen}
          />
        } />
        <Route path="/" element={
          <div style={{ textAlign: 'center', padding: '10rem 0' }}>
            <h1>BEM-VINDO À VITRINE ARTESANAL</h1>
            <p>Selecione uma loja para visitar.</p>
            <a href="/loja-principal" style={{ textDecoration: 'underline' }}>Ir para Loja Principal</a>
          </div>
        } />
      </Routes>

      <footer style={{ textAlign: 'center', padding: '6rem 0', background: 'var(--secondary-bg-color, #f9f9f9)', letterSpacing: '0.1rem' }}>
        <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>&copy; 2026 {aboutContent?.title?.toUpperCase() || 'VITRINE ARTESANAL'}. ALL RIGHTS RESERVED.</p>
      </footer>

      {isCarouselOpen && (
        <FeaturedCarousel products={products} onClose={() => setIsCarouselOpen(false)} onProductClick={setSelectedProduct} />
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} artisanInfo={aboutContent} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

export default App;

const ShopContent = ({ 
  isForAdmin, loading, currentStore, isAuthenticated, currentUser, 
  categories, siteSettings, products, aboutContent, activeCategory, 
  setActiveCategory, setSelectedProduct, filteredProducts, initializeStore,
  handleLogout, fetchProducts, fetchCategories, fetchSiteSettings, setIsCarouselOpen
}) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [adminView, setAdminView] = useState('menu');

  useEffect(() => { if (slug) initializeStore(slug); }, [slug]);

  if (loading && !currentStore) return <div style={{ textAlign: 'center', padding: '10rem 0', opacity: 0.5 }}>INITIALIZING SHOP...</div>;
  if (!currentStore && !loading) return <div style={{ textAlign: 'center', padding: '10rem 0' }}><h2>LOJA NÃO ENCONTRADA</h2></div>;
  if (currentStore && !currentStore.is_active && !isForAdmin) return <div style={{ textAlign: 'center', padding: '10rem 0' }}><h2>LOJA TEMPORARIAMENTE INDISPONÍVEL</h2></div>;

  const isOwner = isAuthenticated && currentUser && currentStore && currentUser.id === currentStore.owner_id;
  const isMaster = isAuthenticated && currentUser && currentUser.id === '9c2648e5-6b43-497b-8ef3-5898d693e128';

  return (
    <>
      <Header 
        isAdmin={(isOwner || isMaster) && isAuthenticated} 
        onToggleAdmin={(val) => navigate(val ? `/${slug}/admin` : `/${slug}`)} 
        categories={categories} settings={siteSettings}
        onCategorySelect={(cat, scroll = true) => {
          setActiveCategory(cat); setAdminView('menu');
          if (scroll) document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onCarouselOpen={() => setIsCarouselOpen(true)}
      />
      <main>
        {isForAdmin ? (
          <section id="admin">
            {!isAuthenticated ? <AdminLogin /> : (!isOwner && !isMaster) ? (
              <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                <h2>ACESSO NEGADO</h2>
                <button onClick={handleLogout} style={{ marginTop: '1rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>SAIR</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingTop: '4rem' }}>
                  <button onClick={() => navigate(`/${slug}`)} style={{ background: 'none', border: '1px solid #ddd', padding: '0.5rem 1rem', fontSize: '0.6rem', cursor: 'pointer' }}>&larr; VOLTAR AO SITE</button>
                  <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '0.5rem 1rem', fontSize: '0.6rem', cursor: 'pointer' }}>SAIR</button>
                </div>
                {adminView === 'menu' && <AdminDashboard onViewChange={setAdminView} />}
                {adminView === 'add' && <AdminForm onProductAdded={() => fetchProducts(currentStore.id)} onCancel={() => setAdminView('menu')} currentStoreId={currentStore?.id} />}
                {adminView === 'list' && <AdminProductList products={products} onRefresh={() => fetchProducts(currentStore.id)} onBack={() => setAdminView('menu')} />}
                {adminView === 'categories' && <AdminCategoryManager currentStoreId={currentStore?.id} onBack={() => { setAdminView('menu'); fetchCategories(currentStore.id); }} />}
                {adminView === 'about' && <AdminAboutManager currentStoreId={currentStore?.id} onBack={() => { setAdminView('menu'); initializeStore(slug); }} />}
                {adminView === 'settings' && <AdminSiteSettings currentStoreId={currentStore?.id} onBack={() => { setAdminView('menu'); fetchSiteSettings(currentStore.id); }} />}
              </>
            )}
          </section>
        ) : (
          <>
            <Hero settings={siteSettings} />
            <section id="collection">
              {activeCategory && (
                <div style={{ textAlign: 'center', padding: '4rem 0 0' }}>
                  <h2>{activeCategory.name.toUpperCase()}</h2>
                  <button onClick={() => setActiveCategory(null)} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>VER TUDO</button>
                </div>
              )}
              <ProductGrid products={filteredProducts} onProductClick={setSelectedProduct} />
            </section>
            <About content={aboutContent} />
            <Contact contactInfo={aboutContent} />
          </>
        )}
      </main>
    </>
  );
};
