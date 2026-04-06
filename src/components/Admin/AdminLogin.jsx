import React, { useState } from 'react';
import styles from './AdminLogin.module.scss';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations (simple for MVP)
    if (!email || !password) {
      setError('POR FAVOR, PREENCHA TODOS OS CAMPOS.');
      return;
    }

    if (!email.includes('@')) {
      setError('POR FAVOR, INSIRA UM E-MAIL VÁLIDO.');
      return;
    }

    if (password === '123456') {
      onLogin();
    } else {
      setError('SENHA INCORRETA.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <span className={styles.label}>ADMINISTRATION AREA</span>
          <h2>Acesso Restrito</h2>
          <div className={styles.divider}></div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>E-MAIL</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com"
              required 
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>SENHA</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="******"
              required 
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            ENTRAR NO PAINEL
          </button>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
