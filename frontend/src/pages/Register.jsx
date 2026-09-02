import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/common/Icons';
import './Register.css';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!termsAgreed) {
      setError('Você deve concordar com os Termos e a Política de Privacidade para continuar.');
      return;
    }
    // Save draft data in sessionStorage for step 2
    sessionStorage.setItem('register_draft', JSON.stringify({ fullName, email, password }));
    navigate('/register/professional');
  };

  return (
    <div className="register-screen-wrapper">
      {/* Header */}
      <header className="register-header">
        <div className="register-brand">
          <div className="register-brand-icon" />
          <span className="register-brand-name">Manual de Sobrevivência</span>
        </div>
        <div className="register-step-badge">
          <span>ETAPA 1 DE 2</span>
        </div>
      </header>

      {/* Body */}
      <section className="register-body">
        <div className="register-intro">
          <h1 className="register-heading">Vamos te conhecer</h1>
          <p className="register-subheading">
            Comece com o básico. Depois personalizamos seu manual.
          </p>
        </div>

        {error && <div className="register-error-msg">{error}</div>}

        <form onSubmit={handleNextStep} className="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Nome completo</label>
            <div className="form-input-box">
              <input
                id="register-name"
                type="text"
                required
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">E-mail de trabalho</label>
            <div className="form-input-box">
              <input
                id="register-email"
                type="email"
                required
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Crie uma senha</label>
            <div className="form-input-box">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="input-visibility-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Alternar visibilidade da senha"
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} color="var(--foreground-muted)" />
              </button>
            </div>
          </div>

          <div className="register-terms-consent">
            <label className="terms-checkbox-label">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
              />
              <div className="terms-custom-checkbox">
                {termsAgreed && <Icon name="check" size={13} color="#FFFFFF" />}
              </div>
              <span className="terms-text">
                Concordo com os Termos e a Política de Privacidade
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-submit-btn pressable"
          >
            Continuar
          </button>

          <footer className="register-footer">
            <span className="register-footer-prompt">Já tem acesso?</span>
            <Link to="/login" className="register-signin-link">
              Entrar
            </Link>
          </footer>
        </form>
      </section>
    </div>
  );
};
