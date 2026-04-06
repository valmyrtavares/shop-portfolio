import React from 'react';
import styles from './AdminDashboard.module.scss';

const AdminDashboard = ({ onViewChange }) => {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <span className={styles.label}>ADMINISTRATION</span>
        <h2 className={styles.title}>Welcome, Back</h2>
        <div className={styles.divider}></div>
      </div>

      <div className={styles.menuGrid}>
        <button 
          className={styles.menuButton} 
          onClick={() => onViewChange('add')}
        >
          <span className={styles.buttonIcon}>+</span>
          <span className={styles.buttonText}>ADICIONAR NOVO PRODUTO</span>
        </button>

        <button 
          className={styles.menuButton} 
          onClick={() => onViewChange('list')}
        >
          <span className={styles.buttonIcon}>✎</span>
          <span className={styles.buttonText}>EDITAR / EXCLUIR PRODUTO</span>
        </button>

        <button 
          className={styles.menuButton} 
          onClick={() => onViewChange('categories')}
        >
          <span className={styles.buttonIcon}>🗂</span>
          <span className={styles.buttonText}>GERENCIAR CATEGORIAS</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
