import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/common/Icons';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import './ForgotPassword.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      showToast('Por favor, informe um endereço de e-mail válido.', 'error');
      return;
    }

    setLoading(true);
    setIsRateLimited(false);
    try {
      await api.forgotPassword(email.trim());
      setSubmitted(true);
      showToast('Instruções de redefinição enviadas com sucesso!', 'success');
    } catch (err) {
      const errMsg = err.message || 'Falha ao solicitar recuperação de senha.';
      const lowerErr = errMsg.toLowerCase();
      if (lowerErr.includes('muitas tentativas') || lowerErr.includes('muitas requisições')) {
        setIsRateLimited(true);
      } else {
        showToast(errMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-screen-wrapper">
      {/* Header */}
      <header className="forgot-header">
        <div className="forgot-brand">
          <div className="forgot-brand-icon" />
          <span className="forgot-brand-name">Manual de Sobrevivência</span>
        </div>
      </header>

      {/* Main Content */}
      <section className="forgot-body">
        <div className="forgot-intro">
          <div className="forgot-icon-box">
            <Icon name="key-round" size={24} color="var(--green-deep)" />
          </div>
          <h1 className="forgot-heading">Recuperar acesso</h1>
          <p className="forgot-subheading">
            Informe seu e-mail para enviarmos as instruções de redefinição de senha.
          </p>
        </div>

        {submitted ? (
          <div className="forgot-success-card animate-fade">
            <div className="success-icon-badge">
              <Icon name="circle-check-big" size={28} color="var(--green-leaf)" />
            </div>
            <h2 className="success-title">Verifique sua caixa de entrada</h2>
            <p className="success-desc">
              Enviamos um link de recuperação para <strong>{email}</strong>. Siga as instruções no e-mail para cadastrar uma nova senha.
            </p>
            <button
              type="button"
              className="forgot-return-btn pressable"
              onClick={() => navigate('/login')}
            >
              Voltar para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-form">
            {isRateLimited && (
              <div className="login-error-msg" style={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                gap: '8px', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid var(--color-error-foreground)', 
                padding: '16px',
                marginBottom: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="ban" size={20} color="var(--color-error-foreground)" />
                  <strong style={{ color: 'var(--color-error-foreground)' }}>Acesso temporariamente bloqueado</strong>
                </div>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', color: 'var(--color-error-foreground)' }}>
                  Foram solicitadas muitas recuperações de senha recentemente. 
                  Aguarde <strong>15 minutos</strong> antes de tentar novamente.
                </p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">E-mail cadastrado</label>
              <div className="form-input-box">
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  disabled={isRateLimited}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isRateLimited}
              className="forgot-submit-btn pressable"
              style={isRateLimited ? { backgroundColor: 'var(--foreground-muted)', cursor: 'not-allowed' } : {}}
            >
              {loading ? 'Enviando instruções...' : isRateLimited ? 'Bloqueado' : 'Enviar link de redefinição'}
            </button>

            <footer className="forgot-footer">
              <Link to="/login" className="forgot-back-link">
                <Icon name="chevron-left" size={16} /> Voltar para o Login
              </Link>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
};
