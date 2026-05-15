import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminLogin.module.scss';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      // onLogin is no longer needed as App.jsx will listen to auth state changes
    } catch (err) {
      console.error('Login error:', err.message);
      setError('E-MAIL OU SENHA INCORRETOS.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Por favor, digite seu e-mail primeiro para recuperar a senha.');
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      });
      if (error) throw error;
      alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (err) {
      alert('Erro: ' + err.message);
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO PAINEL'}
          </button>

          <button 
            type="button" 
            onClick={handleForgotPassword}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '0.6rem', 
              marginTop: '1.5rem', 
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: 0.6,
              width: '100%',
              textAlign: 'center'
            }}
          >
            ESQUECI MINHA SENHA
          </button>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
        </form>
        
        <div style={{ marginTop: '2rem', fontSize: '0.65rem', opacity: 0.5, textAlign: 'center', lineHeight: '1.4' }}>
          CASO NÃO TENHA ACESSO, ENTRE EM CONTATO COM O ADMINISTRADOR DO SISTEMA.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

