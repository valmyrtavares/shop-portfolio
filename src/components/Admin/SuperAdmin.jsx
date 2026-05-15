import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminDashboard.module.scss'; // Reusing dashboard styles

const MASTER_USER_ID = '9c2648e5-6b43-497b-8ef3-5898d693e128';

const SuperAdmin = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', owner_id: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    checkUser();
    fetchStores();
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

  if (!currentUser || currentUser.id !== MASTER_USER_ID) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem 0' }}>
        <h2>ACESSO NEGADO</h2>
        <p>Apenas o administrador mestre pode acessar esta área.</p>
        <a href="/" style={{ textDecoration: 'underline' }}>Voltar ao início</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.2rem', opacity: 0.5 }}>PLATFORM MANAGEMENT</span>
        <h1 style={{ fontSize: '1.5rem', letterSpacing: '0.3rem', marginTop: '1rem' }}>SUPER ADMIN</h1>
        <div style={{ width: '40px', height: '1px', background: '#000', margin: '2rem auto' }}></div>
      </header>

      <section style={{ marginBottom: '4rem', background: '#f9f9f9', padding: '2rem' }}>
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
              placeholder="Pague o ID do artesão no Supabase"
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {stores.map(store => (
            <div key={store.id} style={{ 
              padding: '1.5rem', 
              border: '1px solid #eee', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              opacity: store.is_active ? 1 : 0.5,
              background: store.is_active ? 'white' : '#f5f5f5'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{store.name}</h3>
                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '1rem' }}>Slug: <strong>/{store.slug}</strong></p>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    defaultValue={store.owner_id || ''} 
                    placeholder="ID do Dono (UUID)"
                    onBlur={(e) => {
                      if (e.target.value !== store.owner_id) {
                        updateOwner(store.id, e.target.value);
                      }
                    }}
                    style={{ fontSize: '0.6rem', padding: '0.3rem', width: '200px', border: '1px solid #ddd' }}
                  />
                  <span style={{ fontSize: '0.5rem', opacity: 0.4 }}>← EDITAR DONO</span>
                </div>

                <p style={{ 
                  fontSize: '0.6rem', 
                  color: store.is_active ? 'green' : 'red', 
                  fontWeight: 'bold',
                  marginTop: '1rem'
                }}>
                  {store.is_active ? '● ATIVA' : '○ INATIVA'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <a 
                  href={`/${store.slug}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '0.6rem', textDecoration: 'underline' }}
                >
                  VER SITE
                </a>
                <button 
                  onClick={() => toggleStoreStatus(store)}
                  style={{ 
                    fontSize: '0.6rem', 
                    padding: '0.4rem 0.8rem', 
                    background: store.is_active ? '#fff5f5' : '#e6fffa',
                    color: store.is_active ? '#c53030' : '#2c7a7b',
                    border: `1px solid ${store.is_active ? '#feb2b2' : '#b2f5ea'}`,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  {store.is_active ? 'BLOQUEAR ACESSO' : 'ATIVAR ACESSO'}
                </button>
                <button 
                  onClick={() => deleteStore(store)}
                  style={{ 
                    fontSize: '0.6rem', 
                    padding: '0.4rem 0.8rem', 
                    background: 'none',
                    color: '#999',
                    border: '1px solid #eee',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  EXCLUIR LOJA
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <a href="/" style={{ fontSize: '0.7rem', opacity: 0.5 }}>&larr; VOLTAR AO SITE</a>
      </div>
    </div>
  );
};

export default SuperAdmin;
