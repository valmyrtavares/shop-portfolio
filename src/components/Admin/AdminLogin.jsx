import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminLogin.module.scss';

const AdminLogin = ({ onDevBypass }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError('E-MAIL NÃO CONFIRMADO. SE USOU UM E-MAIL FICTÍCIO, DESATIVE "CONFIRM EMAIL" NO PAINEL DO SUPABASE (AUTH > SETTINGS).');
      } else if (err.message === 'Invalid login credentials') {
        setError('E-MAIL OU SENHA INCORRETOS.');
      } else {
        setError(err.message ? err.message.toUpperCase() : 'ERRO AO EFETUAR LOGIN.');
      }
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
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="******"
                required 
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar senha" : "Ver senha"}
                aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
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
        
        {onDevBypass && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #ccc', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onDevBypass}
              style={{
                background: '#222',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.2rem',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                letterSpacing: '0.05rem',
                cursor: 'pointer',
                borderRadius: '4px',
                width: '100%'
              }}
            >
              ⚡ ENTRAR EM MODO DESENVOLVEDOR (SEM SENHA)
            </button>
            <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.6rem', opacity: 0.6 }}>
              Acesso emergencial local ativado para testes
            </span>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', fontSize: '0.65rem', opacity: 0.5, textAlign: 'center', lineHeight: '1.4' }}>
          CASO NÃO TENHA ACESSO, ENTRE EM CONTATO COM O ADMINISTRADOR DO SISTEMA.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

