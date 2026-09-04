import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/common/Icons';
import { useToast } from '../context/ToastContext';
import './ForgotPassword.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      showToast('Por favor, informe um endereço de e-mail válido.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Link de recuperação enviado com sucesso!', 'success');
    }, 600);
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
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="forgot-submit-btn pressable"
            >
              {loading ? 'Enviando instruções...' : 'Enviar link de redefinição'}
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
