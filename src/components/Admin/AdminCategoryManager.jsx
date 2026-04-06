import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminCategoryManager.module.scss';

const AdminCategoryManager = ({ onBack }) => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update({ name: categoryName.trim() })
          .eq('id', editingId);
        if (error) throw error;
        setMessage({ type: 'success', text: 'CATEGORIA ATUALIZADA!' });
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert([{ name: categoryName.trim() }]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'CATEGORIA CRIADA!' });
      }

      setCategoryName('');
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      setMessage({ type: 'error', text: `ERRO: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingId(category.id);
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.header}>
        <span className={styles.label}>ADMINISTRATION</span>
        <h2 className={styles.title}>Manage Categories</h2>
        <div className={styles.divider}></div>
      </div>

      <div className={styles.content}>
        <form className={styles.inputSection} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>CATEGORY NAME</label>
            <input 
              type="text" 
              value={categoryName} 
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ex: HANDBAGS, CLUTCHES..."
              required
            />
          </div>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'SAVING...' : (editingId ? 'UPDATE' : 'CREATE')}
          </button>
          {editingId && (
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={() => { setEditingId(null); setCategoryName(''); }}
            >
              CANCEL
            </button>
          )}
        </form>

        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NAME</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => handleEdit(cat)}>
                      EDITAR
                    </button>
                    <button className={styles.deleteBtn}>
                      EXCLUIR
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>
                    NO CATEGORIES FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={onBack}>
            &larr; VOLTAR AO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryManager;
