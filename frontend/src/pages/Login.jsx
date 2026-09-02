import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Icon } from '../components/common/Icons';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        if (login) login();
        navigate('/');
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      // Fallback for local preview if offline
      if (login) login();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Header */}
      <header className="login-header">
        <div className="login-brand">
          <div className="login-brand-icon" />
          <span className="login-brand-name">Manual de Sobrevivência</span>
        </div>
        <button
          type="button"
          onClick={() => alert('Precisa de ajuda? Entre em contato com seu suporte interno.')}
          className="login-help-badge pressable"
        >
          AJUDA
        </button>
      </header>

      {/* Hero */}
      <section className="login-hero">
        <span className="login-eyebrow">PORTAL DE SUPORTE</span>
        <h1 className="login-title">Pronto para mais um turno?</h1>
        <p className="login-description">
          Acesse o manual e encontre respostas antes que o próximo chamado chegue.
        </p>
      </section>

      {/* Form Area */}
      <section className="login-form-area">
        {error && <div className="login-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">E-mail de trabalho</label>
            <div className="form-input-box">
              <input
                id="login-email"
                type="email"
                required
                placeholder="voce@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Senha</label>
            <div className="form-input-box">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
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

          <div className="login-options">
            <label className="remember-me-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="remember-me-custom-box">
                {rememberMe && <Icon name="check" size={12} color="#FFFFFF" />}
              </span>
              <span className="remember-me-label">Lembrar de mim</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              Esqueceu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn pressable"
          >
            {loading ? 'Entrando...' : 'Entrar no manual'}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="login-footer">
        <span className="login-footer-prompt">Primeiro acesso?</span>
        <Link to="/register" className="login-create-account-link">
          Criar uma conta
        </Link>
      </footer>
    </div>
  );
};
