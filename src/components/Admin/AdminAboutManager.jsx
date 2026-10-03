import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { resizeImage } from '../../lib/imageUtils';
import styles from './AdminAboutManager.module.scss';

const AdminAboutManager = ({ onBack, currentStoreId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    instagram: '',
    pinterest: ''
  });
  const [existingId, setExistingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAboutContent();
  }, [currentStoreId]);

  const fetchAboutContent = async () => {
    try {
      if (!currentStoreId) return;
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .eq('store_id', currentStoreId)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        setExistingId(data.id);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          image_url: data.image_url || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          whatsapp: data.whatsapp || '',
          instagram: data.instagram || '',
          pinterest: data.pinterest || ''
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
        // Resize and compress image
        const compressedFile = await compressImage(imageFile, 800);
        
        const fileName = `about_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        currentImageUrl = publicUrl;
      }

      // 2. Update existing about_content or insert if not existing
      let saveError = null;

      if (existingId) {
        const { error } = await supabase
          .from('about_content')
          .update({
            ...formData,
            image_url: currentImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId);
        saveError = error;
      } else {
        const { data: updatedData, error: updateErr } = await supabase
          .from('about_content')
          .update({
            ...formData,
            image_url: currentImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('store_id', currentStoreId)
          .select();

        if (updateErr) {
          saveError = updateErr;
        } else if (updatedData && updatedData.length > 0) {
          setExistingId(updatedData[0].id);
        } else {
          const { data: insertedData, error: insertErr } = await supabase
            .from('about_content')
            .insert([{
              ...formData,
              store_id: currentStoreId,
              image_url: currentImageUrl,
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();
          if (insertErr) saveError = insertErr;
          if (insertedData) setExistingId(insertedData.id);
        }
      }

      if (saveError) throw saveError;

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
        <h2 className={styles.title}>Manage About & Contact</h2>
        <div className={styles.divider}></div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.sectionSubtitle}>ABOUT SECTION</h3>
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
        </div>

        <div className={styles.inputGroup}>
          <label>ABOUT IMAGE</label>
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

        <div className={styles.dividerFull}></div>
        <h3 className={styles.sectionSubtitle}>CONTACT INFORMATION</h3>

        <div className={styles.gridFields}>
          <div className={styles.inputGroup}>
            <label>PHONE (DISPLAY)</label>
            <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+55 11 99999-9999" />
          </div>
          <div className={styles.inputGroup}>
            <label>WHATSAPP NUMBER (ONLY NUMBERS)</label>
            <input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="5511999999999" />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>EMAIL ADDRESS</label>
          <input name="email" value={formData.email} onChange={handleInputChange} placeholder="HELLO@VALERIAMONIS.COM" />
        </div>

        <div className={styles.inputGroup}>
          <label>ADDRESS (DISPLAY)</label>
          <input name="address" value={formData.address} onChange={handleInputChange} placeholder="RUA DAS ARTES, 123 - SP" />
        </div>

        <div className={styles.dividerFull}></div>
        <h3 className={styles.sectionSubtitle}>SOCIAL & FORMSPREE</h3>

        <div className={styles.gridFields}>
          <div className={styles.inputGroup}>
            <label>INSTAGRAM ID</label>
            <input name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="valeriamonis" />
          </div>
          <div className={styles.inputGroup}>
            <label>PINTEREST ID</label>
            <input name="pinterest" value={formData.pinterest} onChange={handleInputChange} placeholder="valeriamonis" />
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'SAVING...' : 'SAVE ALL CHANGES'}
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
