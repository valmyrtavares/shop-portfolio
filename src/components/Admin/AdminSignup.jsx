import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminLogin.module.scss'; // Reusing login styles

const AdminSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdUserId, setCreatedUserId] = useState('');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setCreatedUserId('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      const userId = data.user?.id || '';
      setCreatedUserId(userId);

      setMessage({ 
        type: 'success', 
        text: 'CONTA CRIADA COM SUCESSO!' 
      });
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: `ERRO: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    if (createdUserId) {
      navigator.clipboard.writeText(createdUserId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(`Olá! Acabei de criar minha conta no Vitrine Artesanal.\nMeu ID de Usuário é:\n${createdUserId}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="No mínimo 6 caracteres"
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
            {loading ? 'CRIANDO CONTA...' : 'CRIAR MEU ACESSO'}
          </button>
          
          {message.text && (
            <div className={`${styles.message} ${styles[message.type]}`} style={{ marginTop: '1.5rem', fontSize: '0.7rem' }}>
              {message.text}
            </div>
          )}

          {createdUserId && (
            <div style={{ marginTop: '1.5rem', padding: '1.2rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '0.5rem' }}>
                SEU ID DE ARTESÃO GERADO:
              </span>
              <div style={{ background: '#fff', padding: '0.6rem', border: '1px dashed #86efac', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1rem', color: '#14532d', fontWeight: 'bold' }}>
                {createdUserId}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={handleCopyId}
                  style={{
                    padding: '0.6rem',
                    background: copied ? '#15803d' : '#222',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copied ? '✓ ID COPIADO COM SUCESSO!' : '📋 COPIAR MEU ID'}
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  style={{
                    padding: '0.6rem',
                    background: '#25D366',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05rem',
                    cursor: 'pointer'
                  }}
                >
                  📲 ENVIAR MEU ID NO WHATSAPP
                </button>
              </div>
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
