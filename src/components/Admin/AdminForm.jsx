import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminForm.module.scss';

const AdminForm = ({ onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    is_out_of_stock: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage({ type: 'error', text: 'POR FAVOR, SELECIONE UMA IMAGEM.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // 1. Upload image to Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Clean price (remove R$, replace comma with dot)
      const cleanPrice = formData.price
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(',', '.');

      // 3. Insert into Database
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            ...formData,
            price: cleanPrice,
            image: publicUrl
          }
        ]);

      if (insertError) throw insertError;

      setMessage({ type: 'success', text: 'PRODUTO ADICIONADO COM SUCESSO!' });
      setFormData({ name: '', price: '', description: '', is_out_of_stock: false });
      setImageFile(null);
      e.target.reset();
      
      if (onProductAdded) onProductAdded();

    } catch (error) {
      console.error('Error:', error.message);
      setMessage({ type: 'error', text: `ERRO: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminFormContainer}>
      <div className={styles.header}>
        <span className={styles.label}>ADMINISTRATION</span>
        <h2 className={styles.title}>Add New Product</h2>
        <div className={styles.divider}></div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>PRODUCT NAME</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            placeholder="Ex: AMARA CLUTCH" 
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <label>PRICE</label>
          <input 
            type="text" 
            name="price" 
            value={formData.price} 
            onChange={handleInputChange} 
            placeholder="Ex: R$ 890,00" 
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <label>DESCRIPTION</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            placeholder="DETAILS ABOUT CRAFTSMANSHIP..." 
            rows="3"
          ></textarea>
        </div>

        <div className={styles.inputGroup}>
          <label>PRODUCT IMAGE</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            required 
          />
        </div>

        <div className={styles.checkboxGroup}>
          <input 
            type="checkbox" 
            id="is_out_of_stock" 
            name="is_out_of_stock" 
            checked={formData.is_out_of_stock} 
            onChange={handleInputChange} 
          />
          <label htmlFor="is_out_of_stock">OUT OF STOCK</label>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'UPLOADING...' : 'SAVE PRODUCT'}
        </button>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminForm;
