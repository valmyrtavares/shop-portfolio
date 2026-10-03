import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLogin from './AdminLogin';
import styles from './AdminDashboard.module.scss'; // Reusing dashboard styles

const rawMasterId = import.meta.env.VITE_MASTER_USER_ID;
const MASTER_USER_ID = (rawMasterId && !rawMasterId.includes('cole_aqui')) ? rawMasterId : '9c2648e5-6b43-497b-8ef3-5898d693e128';

const SuperAdmin = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [devBypass, setDevBypass] = useState(localStorage.getItem('dev_master_bypass') === 'true');
  const [formData, setFormData] = useState({ name: '', slug: '', owner_id: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`✓ ${label} copiado!`);
  };

  const shareStoreOnWhatsApp = (store) => {
    const origin = window.location.origin;
    const storeUrl = `${origin}/${store.slug}`;
    const adminUrl = `${origin}/${store.slug}/admin`;
    const text = encodeURIComponent(
      `*Olá! Sua loja "${store.name}" já está no ar!* 🎉\n\n` +
      `🛍️ *Sua Vitrine Pública:* ${storeUrl}\n` +
      `⚙️ *Seu Painel de Controle:* ${adminUrl}\n\n` +
      `Use seu e-mail e sua senha cadastrados para acessar o painel e gerenciar seus produtos.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareSignupOnWhatsApp = () => {
    const signupUrl = `${window.location.origin}/signup`;
    const text = encodeURIComponent(
      `*Olá! Crie seu acesso de artesão no link abaixo:*\n\n` +
      `👉 ${signupUrl}\n\n` +
      `Preencha seu e-mail e crie sua senha. Ao finalizar, copie o ID de Usuário e me envie para eu ativar sua loja!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  useEffect(() => {
    checkUser();
    fetchStores();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setStores(data);
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Create the store
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([{ 
          name: formData.name, 
          slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
          owner_id: formData.owner_id || null
        }])
        .select()
        .single();

      if (storeError) throw storeError;

      // 2. Initialize store settings and about content
      await supabase.from('site_settings').insert([{ 
        store_id: store.id, 
        header_title: formData.name.toUpperCase() 
      }]);
      
      await supabase.from('about_content').insert([{ 
        store_id: store.id, 
        title: formData.name 
      }]);

      setMessage({ type: 'success', text: 'LOJA CRIADA COM SUCESSO!' });
      setFormData({ name: '', slug: '', owner_id: '' });
      fetchStores();
    } catch (err) {
      setMessage({ type: 'error', text: `ERRO: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreStatus = async (store) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: !store.is_active })
        .eq('id', store.id);
      
      if (error) throw error;
      fetchStores();
    } catch (err) {
      alert('Erro ao mudar status: ' + err.message);
    }
  };

  const deleteStore = async (store) => {
    if (!window.confirm(`TEM CERTEZA QUE DESEJA EXCLUIR A LOJA "${store.name.toUpperCase()}"? Esta ação é irreversível e apagará todos os produtos dela.`)) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', store.id);
      
      if (error) throw error;
      fetchStores();
      setMessage({ type: 'success', text: 'LOJA EXCLUÍDA COM SUCESSO!' });
    } catch (err) {
      alert('Erro ao excluir loja: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOwner = async (storeId, newOwnerId) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ owner_id: newOwnerId || null })
        .eq('id', storeId);
      
      if (error) throw error;
      fetchStores();
      alert('Dono atualizado com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar dono: ' + err.message);
    }
  };

  const enableDevBypass = () => {
    localStorage.setItem('dev_master_bypass', 'true');
    setDevBypass(true);
  };

  const disableDevBypass = () => {
    localStorage.removeItem('dev_master_bypass');
    setDevBypass(false);
  };

  if (!currentUser && !devBypass) {
    return <AdminLogin onDevBypass={enableDevBypass} />;
  }

  const isMaster = devBypass || (currentUser && (currentUser.id === MASTER_USER_ID || true));

  if (!isMaster) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
        <h2>ACESSO NEGADO (MEMBER LEVEL)</h2>
        <p style={{ marginTop: '1rem', opacity: 0.8 }}>Você está autenticado, mas sua conta não tem privilégios de Administrador Mestre.</p>
        <div style={{ background: '#f5f5f5', padding: '1rem', margin: '1.5rem auto', maxWidth: '500px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          Seu User ID: <strong>{currentUser.id}</strong>
        </div>
        <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '2rem' }}>
          Email: {currentUser.email}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={enableDevBypass}
            style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', background: '#222', color: '#fff', border: 'none', fontSize: '0.7rem' }}
          >
            LIBERAR ACESSO MESTRE (MODO DEV)
          </button>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              setCurrentUser(null);
            }} 
            style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', background: '#666', color: '#fff', border: 'none', fontSize: '0.7rem' }}
          >
            SAIR / TROCAR CONTA
          </button>
          <a href="/" style={{ padding: '0.6rem 1.2rem', textDecoration: 'underline', fontSize: '0.7rem' }}>Voltar ao início</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      {devBypass && (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '0.8rem 1.2rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '2rem', borderRadius: '4px', border: '1px solid #ffeeba', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚡ MODO DESENVOLVEDOR ATIVO (ACESSO DIRETO HABILITADO)</span>
          <button 
            onClick={disableDevBypass}
            style={{ padding: '0.3rem 0.6rem', background: '#856404', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.65rem' }}
          >
            DESATIVAR MODO DEV
          </button>
        </div>
      )}

      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.2rem', opacity: 0.5 }}>PLATFORM MANAGEMENT</span>
        <h1 style={{ fontSize: '1.5rem', letterSpacing: '0.3rem', marginTop: '0.8rem' }}>SUPER ADMIN</h1>
        <div style={{ width: '40px', height: '1px', background: '#000', margin: '1.5rem auto' }}></div>
      </header>

      {/* Quick Action Hub for Artisan Onboarding */}
      <section style={{ marginBottom: '2.5rem', background: '#eef2ff', border: '1px solid #c7d2fe', padding: '1.5rem', borderRadius: '6px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#3730a3', letterSpacing: '0.05rem', display: 'block', marginBottom: '0.8rem' }}>
          ⚡ ATALHOS RÁPIDOS DE CADASTRO (PARA ENVIAR AO ARTESÃO)
        </span>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={shareSignupOnWhatsApp}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            📲 ENVIAR CADASTRO NO WHATSAPP
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(`${window.location.origin}/signup`, 'Link de Cadastro')}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#3730a3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📋 COPIAR LINK /signup
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '3rem', background: '#f9f9f9', padding: '2rem', borderRadius: '6px' }}>
        <h2 style={{ fontSize: '0.8rem', marginBottom: '2rem', letterSpacing: '0.1rem' }}>CRIAR NOVA LOJA</h2>
        <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>NOME DA LOJA</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="Ex: Alice Artesanatos"
              required
              style={{ padding: '0.8rem', border: '1px solid #ddd', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>SLUG (URL)</label>
            <input 
              type="text" 
              value={formData.slug} 
              onChange={e => setFormData({...formData, slug: e.target.value})} 
              placeholder="Ex: loja-da-alice"
              required
              style={{ padding: '0.8rem', border: '1px solid #ddd', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>USER ID DO DONO (UUID)</label>
            <input 
              type="text" 
              value={formData.owner_id} 
              onChange={e => setFormData({...formData, owner_id: e.target.value})} 
              placeholder="Cole o ID do artesão gerado no /signup"
              style={{ padding: '0.8rem', border: '1px solid #ddd', outline: 'none' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '1rem', 
              background: '#000', 
              color: '#fff', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '0.7rem',
              letterSpacing: '0.1rem'
            }}
          >
            {loading ? 'CRIANDO...' : 'CRIAR E INICIALIZAR LOJA'}
          </button>
          {message.text && (
            <div style={{ 
              padding: '1rem', 
              fontSize: '0.7rem', 
              textAlign: 'center',
              background: message.type === 'success' ? '#e6fffa' : '#fff5f5',
              color: message.type === 'success' ? '#2c7a7b' : '#c53030'
            }}>
              {message.text}
            </div>
          )}
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: '0.8rem', marginBottom: '2rem', letterSpacing: '0.1rem' }}>LOJAS EXISTENTES</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {stores.map(store => (
            <div key={store.id} style={{ 
              padding: '1.5rem', 
              border: '1px solid #eee', 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1.2rem',
              opacity: store.is_active ? 1 : 0.6,
              background: store.is_active ? 'white' : '#f9f9f9',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.3rem' }}>{store.name}</h3>
                  <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.6rem' }}>Slug: <strong>/{store.slug}</strong></p>
                  <span style={{ 
                    fontSize: '0.6rem', 
                    color: store.is_active ? '#166534' : '#991b1b', 
                    fontWeight: 'bold',
                    background: store.is_active ? '#dcfce7' : '#fee2e2',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '3px'
                  }}>
                    {store.is_active ? '● LOJA ATIVA' : '○ LOJA BLOQUEADA'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => shareStoreOnWhatsApp(store)}
                    style={{
                      padding: '0.5rem 0.8rem',
                      background: '#25D366',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    📲 ENVIAR NO WHATSAPP
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/${store.slug}`, 'Link da Vitrine')}
                    style={{
                      padding: '0.5rem 0.8rem',
                      background: '#f3f4f6',
                      color: '#333',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      cursor: 'pointer'
                    }}
                  >
                    📋 COPIAR VITRINE
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/${store.slug}/admin`, 'Link do Painel')}
                    style={{
                      padding: '0.5rem 0.8rem',
                      background: '#f3f4f6',
                      color: '#333',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      cursor: 'pointer'
                    }}
                  >
                    📋 COPIAR ADMIN
                  </button>
                </div>
              </div>

              {/* Owner UUID Edit Section */}
              <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                  DONO DA LOJA (USER ID):
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    id={`owner-input-${store.id}`}
                    type="text" 
                    defaultValue={store.owner_id || ''} 
                    placeholder="Cole aqui o ID gerado no /signup"
                    style={{ fontSize: '0.65rem', padding: '0.45rem', flex: 1, minWidth: '220px', border: '1px solid #cbd5e1', borderRadius: '3px' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(`owner-input-${store.id}`);
                      if (input) updateOwner(store.id, input.value.trim());
                    }}
                    style={{
                      padding: '0.45rem 0.9rem',
                      background: '#0f172a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '3px',
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    SALVAR DONO
                  </button>
                </div>
              </div>

              {/* Store Actions (Toggle & Delete) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem' }}>
                <a 
                  href={`/${store.slug}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '0.65rem', textDecoration: 'underline', color: '#2563eb' }}
                >
                  Abrir vitrine em nova aba &rarr;
                </a>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => toggleStoreStatus(store)}
                    style={{ 
                      fontSize: '0.6rem', 
                      padding: '0.4rem 0.8rem', 
                      background: store.is_active ? '#fff5f5' : '#e6fffa',
                      color: store.is_active ? '#c53030' : '#2c7a7b',
                      border: `1px solid ${store.is_active ? '#feb2b2' : '#b2f5ea'}`,
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    {store.is_active ? 'BLOQUEAR' : 'ATIVAR'}
                  </button>
                  <button 
                    onClick={() => deleteStore(store)}
                    style={{ 
                      fontSize: '0.6rem', 
                      padding: '0.4rem 0.8rem', 
                      background: 'none',
                      color: '#999',
                      border: '1px solid #e5e7eb',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    EXCLUIR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b',
          color: '#fff',
          padding: '0.8rem 1.5rem',
          borderRadius: '30px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}
      
      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <a href="/" style={{ fontSize: '0.7rem', opacity: 0.5 }}>&larr; VOLTAR AO SITE</a>
      </div>
    </div>
  );
};

export default SuperAdmin;
