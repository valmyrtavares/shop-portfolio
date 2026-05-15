import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminProductList.module.scss';
import AdminForm from './AdminForm';

const AdminProductList = ({ products, onRefresh, onBack }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deletingProduct) return;
    
    try {
      setLoading(true);
      // 1. Delete the image from storage if it exists
      if (deletingProduct.image) {
        try {
          const imagePath = deletingProduct.image.split('/').pop();
          if (imagePath && !imagePath.includes('placeholder')) {
            await supabase.storage
              .from('product-images')
              .remove([imagePath]);
          }
        } catch (storageError) {
          console.warn('Could not delete image from storage:', storageError.message);
        }
      }

      // 2. Delete the product from the database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw error;
      
      setDeletingProduct(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting product:', error.message);
      alert('Erro ao excluir produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.listContainer}>
      <div className={styles.header}>
        <span className={styles.label}>ADMINISTRATION</span>
        <h2 className={styles.title}>Manage Products</h2>
        <div className={styles.divider}></div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>PRODUTO</th>
              <th>PREÇO</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className={styles.productName}>{product.name}</td>
                <td className={styles.productPrice}>R$ {product.price}</td>
                <td className={styles.actions}>
                  <button 
                    className={styles.editBtn} 
                    onClick={() => setEditingProduct(product)}
                  >
                    EDITAR
                  </button>
                  <button 
                    className={styles.deleteBtn} 
                    onClick={() => setDeletingProduct(product)}
                  >
                    EXCLUIR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onBack}>
          &larr; VOLTAR AO MENU
        </button>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <AdminForm 
              productToEdit={editingProduct} 
              onProductAdded={() => {
                onRefresh();
              }}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>CONFIRMAR EXCLUSÃO</h3>
            <p>Você tem certeza que deseja excluir <strong>{deletingProduct.name}</strong>? Esta ação não pode ser desfeita.</p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.confirmYes} 
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'EXCLUINDO...' : 'SIM, EXCLUIR'}
              </button>
              <button 
                className={styles.confirmNo} 
                onClick={() => setDeletingProduct(null)}
                disabled={loading}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductList;
