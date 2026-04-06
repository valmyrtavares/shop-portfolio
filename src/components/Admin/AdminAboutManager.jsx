import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminAboutManager.module.scss';

const AdminAboutManager = ({ onBack }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          image_url: data.image_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching about content:', error.message);
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

      let currentImageUrl = formData.image_url;

      // 1. Upload new image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `about_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        currentImageUrl = publicUrl;
      }

      // 2. Update about_content (ID is always 1)
      const { error: upsertError } = await supabase
        .from('about_content')
        .upsert({
          id: 1,
          title: formData.title,
          description: formData.description,
          image_url: currentImageUrl,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      setMessage({ type: 'success', text: 'CONTEÚDO ATUALIZADO COM SUCESSO!' });
      setFormData(prev => ({ ...prev, image_url: currentImageUrl }));
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
        <h2 className={styles.title}>Manage About Section</h2>
        <div className={styles.divider}></div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>ARTISAN NAME / TITLE</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleInputChange} 
            placeholder="Ex: VALERIA MONIS" 
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <label>ABOUT THE WORK (DESCRIPTION)</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            placeholder="TELL THE ARTISAN STORY..." 
            rows="10"
            className={styles.textarea}
          />
          <small style={{ opacity: 0.5 }}>Atualmente apenas texto simples é suportado para garantir compatibilidade.</small>
        </div>

        <div className={styles.inputGroup}>
          <label>ABOUT IMAGE {formData.image_url && '(CURRENT IMAGE EXISTS)'}</label>
          {formData.image_url && (
            <div className={styles.currentImage}>
              <img src={formData.image_url} alt="Current About" />
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
          
          <button type="button" className={styles.cancelButton} onClick={onBack}>
            BACK TO MENU
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

export default AdminAboutManager;
