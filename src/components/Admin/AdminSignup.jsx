import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminLogin.module.scss'; // Reusing login styles

const AdminSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      setMessage({ 
        type: 'success', 
        text: 'CONTA CRIADA! Verifique seu e-mail para confirmar o cadastro (ou peça ao administrador para ativar sua conta).' 
      });
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: `ERRO: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <span className={styles.label}>CADASTRO DE ARTESÃO</span>
          <h2>Criar Nova Conta</h2>
          <div className={styles.divider}></div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>E-MAIL PESSOAL</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemplo@gmail.com"
              required 
              disabled={loading}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>CRIE UMA SENHA SEGURA</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="No mínimo 6 caracteres"
              required 
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'CRIANDO CONTA...' : 'CRIAR MEU ACESSO'}
          </button>
          
          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`} style={{ marginTop: '1.5rem', fontSize: '0.7rem' }}>
              {message.text}
            </div>
          )}
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.65rem', opacity: 0.5, textAlign: 'center' }}>
          <a href="/" style={{ textDecoration: 'underline' }}>VOLTAR AO SITE</a>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
