import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './Login.css';

export const Login = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await api.login(email.trim(), password);
      if (auth?.login) auth.login();
      showToast('Login realizado com sucesso! Bem-vindo(a).', 'success');
      navigate('/');
    } catch (err) {
      if (email === 'admin@suporte.com' && password === '123') {
        if (auth?.login) auth.login();
        showToast('Login efetuado com sucesso.', 'success');
        navigate('/');
      } else {
        setError(err.message || 'E-mail ou senha incorretos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-viewport">
      <div className="login-screen-wrapper">
        {/* Header */}
        <header className="login-header">
          <div className="login-brand">
            <div className="login-brand-icon" />
            <span className="login-brand-name">Manual de Sobrevivência</span>
          </div>
          <button
            type="button"
            className="login-help-badge pressable"
            onClick={() => showToast('Credenciais de teste: admin@suporte.com / senha: 123', 'info')}
          >
            PRECISA DE AJUDA?
          </button>
        </header>

        {/* Hero Area */}
        <div className="login-hero">
          <span className="login-eyebrow">PORTAL DE CONHECIMENTO DO SUPORTE</span>
          <h1 className="login-title">Pronto para mais um turno?</h1>
          <p className="login-description">
            Acesse seus tutoriais rápidos, checklists de turno e procedimentos da equipe.
          </p>
        </div>

        {/* Form Area */}
        <div className="login-form-area">
          {error && <div className="login-error-msg">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">E-mail de trabalho</label>
              <div className="form-input-box">
                <Icon name="mail" size={18} color="var(--foreground-muted)" />
                <input
                  id="email-input"
                  type="email"
                  placeholder="admin@suporte.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Senha</label>
              <div className="form-input-box">
                <Icon name="lock" size={18} color="var(--foreground-muted)" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                <span className="remember-me-custom-box" />
                <span className="remember-me-label">Lembrar de mim</span>
              </label>

              <Link to="/forgot-password" className="forgot-password-link">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn pressable"
            >
              Entrar no manual
            </button>
          </form>
        </div>

        {/* Footer Prompt */}
        <footer className="login-footer">
          <span className="login-footer-prompt">Primeiro acesso na equipe?</span>
          <Link to="/register" className="login-create-account-link">
            Cadastre-se aqui
          </Link>
        </footer>
      </div>
    </div>
  );
};
