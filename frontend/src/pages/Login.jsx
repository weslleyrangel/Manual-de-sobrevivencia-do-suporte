import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './Login.css';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);
  const { showToast } = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
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
      const data = await api.login(email.trim(), password);
      if (auth?.login) auth.login(data?.user);
      showToast(`Login realizado com sucesso! Bem-vindo(a), ${data?.user?.name || ''}.`, 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-viewport">
      <div className="login-desktop-split">
        {/* Left Hero Showcase (Desktop only >= 1024px) */}
        <section className="login-hero-panel">
          <div className="login-hero-glow-1" />
          <div className="login-hero-glow-2" />

          <div className="login-hero-top">
            <div className="login-hero-brand">
              <div className="login-hero-logo">
                <Icon name="sprout" size={22} color="#FFFFFF" />
              </div>
              <span className="login-hero-brand-name">Manual de Sobrevivência</span>
            </div>
            <span className="login-hero-version-badge">v2.0 • Base de Conhecimento</span>
          </div>

          <div className="login-hero-body">
            <span className="login-hero-eyebrow">
              <Icon name="shield-check" size={15} />
              COMUNIDADE & BASE DE CONHECIMENTO
            </span>

            <h2 className="login-hero-main-title">
              Resolva dúvidas e problemas técnicos com agilidade e colaboração.
            </h2>

            <p className="login-hero-main-desc">
              Consulte procedimentos práticos, tutoriais passo a passo e soluções compartilhadas pela comunidade em um catálogo moderno e offline-first.
            </p>

            <div className="login-feature-cards">
              <div className="login-feature-item">
                <div className="login-feature-icon-box">
                  <Icon name="lightbulb" size={18} />
                </div>
                <span className="login-feature-text">Soluções colaborativas e procedimentos práticos testados no dia a dia</span>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon-box">
                  <Icon name="shield-check" size={18} />
                </div>
                <span className="login-feature-text">Conteúdo organizado por tópicos, categorias e busca instantânea</span>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon-box">
                  <Icon name="briefcase-business" size={18} />
                </div>
                <span className="login-feature-text">Disponível em modo PWA para consultas mesmo sem conexão de rede</span>
              </div>
            </div>
          </div>

          <div className="login-hero-footer">
            <span>© 2026 Manual de Sobrevivência • Conhecimento Aberto</span>
            <span>Comunidade & Autoatendimento</span>
          </div>
        </section>

        {/* Right Form Panel */}
        <main className="login-form-panel">
          <div className="login-form-inner">
            <div className="login-header-row">
              <div className="login-brand-mobile">
                <div className="login-brand-icon" />
                <span className="login-brand-name">Manual de Sobrevivência</span>
              </div>
            </div>

            <div className="login-hero-box">
              <span className="login-eyebrow">PORTAL DO CONHECIMENTO</span>
              <h1 className="login-title">Pronto para mais um turno?</h1>
              <p className="login-description">
                Acesse tutoriais, resolva dúvidas e encontre soluções práticas com a comunidade.
              </p>
            </div>

            {error && (
              <div className="login-error-msg">
                <Icon name="x" size={16} color="var(--color-error-foreground)" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email-input">E-mail de trabalho</label>
                <div className="form-input-box">
                  <Icon name="search" size={18} color="var(--foreground-muted)" />
                  <input
                    id="email-input"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password-input">Senha</label>
                <div className="form-input-box">
                  <Icon name="badge-check" size={18} color="var(--foreground-muted)" />
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
                {loading ? 'Entrando...' : 'Entrar no manual'}
              </button>
            </form>



            <footer className="login-footer">
              <span className="login-footer-prompt">Ainda não tem uma conta?</span>
              <Link to="/register" className="login-create-account-link">
                Cadastre-se gratuitamente
              </Link>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
