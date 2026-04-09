import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { resizeImage } from '../../lib/imageUtils';
import styles from './AdminAboutManager.module.scss'; // Reusing styles from AboutManager for consistency

const AdminSiteSettings = ({ onBack }) => {
  const [formData, setFormData] = useState({
    header_title: '',
    header_subtitle: '',
    hero_title: '',
    hero_subtitle: '',
    logo_url: '',
    bg_color: '#ffffff'
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setFormData({
          header_title: data.header_title || '',
          header_subtitle: data.header_subtitle || '',
          hero_title: data.hero_title || '',
          hero_subtitle: data.hero_subtitle || '',
          logo_url: data.logo_url || '',
          bg_color: data.bg_color || '#ffffff'
        });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      let currentLogoUrl = formData.logo_url;

      // 1. Upload new logo if provided
      if (imageFile) {
        // Resize image to max 500px before uploading
        const compressedFile = await resizeImage(imageFile, 500, 0.8);

        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `logo_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        currentLogoUrl = publicUrl;
      }

      // 2. Update site_settings (ID is always 1)
      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert({
          id: 1,
          ...formData,
          logo_url: currentLogoUrl,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      setMessage({ type: 'success', text: 'CONFIGURAÇÕES SALVAS COM SUCESSO!' });
      setFormData(prev => ({ ...prev, logo_url: currentLogoUrl }));
      setImageFile(null);
    } catch (error) {
      console.error('Error:', error.message);
      setMessage({ type: 'error', text: `ERRO: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.header}>
        <span className={styles.label}>ADMINISTRATION</span>
        <h2 className={styles.title}>Configurações do Site</h2>
        <div className={styles.divider}></div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.sectionSubtitle}>IDENTIDADE VISUAL (HEADER)</h3>
        
        <div className={styles.inputGroup}>
          <label>LOGOTIPO EM IMAGEM (OPCIONAL)</label>
          {formData.logo_url && (
            <div className={styles.currentImage} style={{ background: '#eee', padding: '1rem', marginBottom: '1rem' }}>
              <img src={formData.logo_url} alt="Logo Atual" style={{ maxHeight: '80px', objectFit: 'contain' }} />
              <button 
                type="button" 
                onClick={() => setFormData(p => ({ ...p, logo_url: '' }))}
                style={{ fontSize: '0.6rem', marginTop: '0.5rem', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                REMOVER IMAGEM E USAR TEXTO
              </button>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        {!formData.logo_url && (
          <div className={styles.gridFields}>
            <div className={styles.inputGroup}>
              <label>TÍTULO DO LOGOTIPO (TEXTO)</label>
              <input 
                type="text" 
                name="header_title" 
                value={formData.header_title} 
                onChange={handleInputChange} 
                placeholder="Ex: VALERIA MONIS" 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>SUBTÍTULO DO LOGOTIPO (TEXTO)</label>
              <input 
                type="text" 
                name="header_subtitle" 
                value={formData.header_subtitle} 
                onChange={handleInputChange} 
                placeholder="Ex: HANDMADE BAGS" 
              />
            </div>
          </div>
        )}

        <div className={styles.dividerFull}></div>
        <h3 className={styles.sectionSubtitle}>TEXTOS DO BANNER (HERO)</h3>

        <div className={styles.inputGroup}>
          <label>TÍTULO PRINCIPAL (BANNER)</label>
          <input 
            name="hero_title" 
            value={formData.hero_title} 
            onChange={handleInputChange} 
            placeholder="Ex: ESSENTIAL ELEGANCE" 
          />
        </div>

        <div className={styles.inputGroup}>
          <label>SUBTÍTULO (BANNER)</label>
          <input 
            name="hero_subtitle" 
            value={formData.hero_subtitle} 
            onChange={handleInputChange} 
            placeholder="Ex: HANDMADE LEATHER ARTISTRY FROM BRAZIL" 
          />
        </div>

        <div className={styles.dividerFull}></div>
        <h3 className={styles.sectionSubtitle}>CORES E ESTILO</h3>

        <div className={styles.inputGroup}>
          <label>COR DE FUNDO DO SITE</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="color" 
              name="bg_color" 
              value={formData.bg_color} 
              onChange={handleInputChange} 
              style={{ width: '100px', height: '50px', border: 'none', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{formData.bg_color.toUpperCase()}</span>
          </div>
          <p style={{ fontSize: '0.6rem', marginTop: '0.5rem', opacity: 0.5 }}>DICA: AS CORES DOS TEXTOS SERÃO AJUSTADAS AUTOMATICAMENTE PARA GARANTIR CONTRASTE.</p>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
          </button>
          
          <button type="button" className={styles.cancelButton} onClick={onBack}>
            VOLTAR AO MENU
          </button>
        </div>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminSiteSettings;
