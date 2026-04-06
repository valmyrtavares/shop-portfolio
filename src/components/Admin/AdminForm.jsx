import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminForm.module.scss';

const AdminForm = ({ onProductAdded, productToEdit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    price: productToEdit?.price || '',
    description: productToEdit?.description || '',
    is_out_of_stock: productToEdit?.is_out_of_stock || false,
    category_id: productToEdit?.category_id || ''
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isEditing = !!productToEdit;

  useEffect(() => {
    fetchCategories();
  }, []);

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
    
    if (!isEditing && !imageFile) {
      setMessage({ type: 'error', text: 'POR FAVOR, SELECIONE UMA IMAGEM.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      let imageUrl = productToEdit?.image;

      // 1. Upload new image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      // Clean price (remove R$, replace comma with dot)
      const cleanPrice = String(formData.price)
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(',', '.');

      const productData = {
        ...formData,
        price: cleanPrice,
        image: imageUrl,
        category_id: formData.category_id || null
      };

      if (isEditing) {
        // 2. Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productToEdit.id);

        if (updateError) throw updateError;
        setMessage({ type: 'success', text: 'PRODUTO ATUALIZADO COM SUCESSO!' });
      } else {
        // 3. Insert new product
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);

        if (insertError) throw insertError;
        setMessage({ type: 'success', text: 'PRODUTO ADICIONADO COM SUCESSO!' });
        setFormData({ name: '', price: '', description: '', is_out_of_stock: false, category_id: '' });
        setImageFile(null);
        e.target.reset();
      }
      
      if (onProductAdded) onProductAdded();
      
      if (isEditing && onCancel) {
        setTimeout(() => onCancel(), 1500);
      }

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
        <h2 className={styles.title}>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
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
          <label>CATEGORY</label>
          <select 
            name="category_id" 
            value={formData.category_id} 
            onChange={handleInputChange}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              padding: '0.8rem 0',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">SELECT A CATEGORY</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
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
          <label>PRODUCT IMAGE {isEditing && '(LEAVE EMPTY TO KEEP CURRENT)'}</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            required={!isEditing} 
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

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'SAVING...' : (isEditing ? 'UPDATE PRODUCT' : 'SAVE PRODUCT')}
          </button>
          
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            {isEditing ? 'CLOSE' : 'BACK TO MENU'}
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

export default AdminForm;
