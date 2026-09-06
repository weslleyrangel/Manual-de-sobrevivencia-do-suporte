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
  const [isUnverified, setIsUnverified] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setIsRateLimited(false);

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
      const errMsg = err.message || 'E-mail ou senha incorretos';
      setError(errMsg);
      
      const lowerErr = errMsg.toLowerCase();
      if (lowerErr.includes('não verificada') || lowerErr.includes('verifique seu e-mail')) {
        setIsUnverified(true);
      }
      if (lowerErr.includes('muitas tentativas') || lowerErr.includes('muitas requisições')) {
        setIsRateLimited(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      showToast('Informe o seu e-mail para reenviar o link de ativação.', 'error');
      return;
    }
    setResending(true);
    try {
      await api.resendVerification(email.trim());
      showToast('Novo link de ativação enviado! Verifique sua caixa de entrada.', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao reenviar e-mail.', 'error');
    } finally {
      setResending(false);
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

            {location.state?.verifiedSuccess && (
              <div className="login-verified-banner animate-fade">
                <div className="login-verified-icon">
                  <Icon name="badge-check" size={22} color="var(--green-leaf)" />
                </div>
                <div className="login-verified-content">
                  <strong>E-mail verificado com sucesso! 🎉</strong>
                  <p>Sua conta está ativa. Digite sua senha abaixo para acessar o manual.</p>
                </div>
              </div>
            )}

            {location.state?.verifiedError && (
              <div className="login-error-msg">
                <Icon name="x" size={16} color="var(--color-error-foreground)" />
                <span>{location.state.verifiedError}</span>
              </div>
            )}

            {error && (
              <div className="login-error-msg" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="x" size={16} color="var(--color-error-foreground)" />
                  <span>{error}</span>
                </div>
                {isUnverified && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '4px'
                    }}
                  >
                    {resending ? 'Reenviando e-mail...' : '📨 Clique aqui para reenviar o e-mail de ativação'}
                  </button>
                )}
              </div>
            )}

            {isRateLimited && (
              <div className="login-error-msg" style={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                gap: '8px', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid var(--color-error-foreground)', 
                padding: '16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="ban" size={20} color="var(--color-error-foreground)" />
                  <strong style={{ color: 'var(--color-error-foreground)' }}>Acesso temporariamente bloqueado</strong>
                </div>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', color: 'var(--color-error-foreground)' }}>
                  Detectamos muitas tentativas recentes originadas deste dispositivo. 
                  Para a sua segurança, aguarde <strong>15 minutos</strong> antes de tentar novamente.
                </p>
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
                    disabled={isRateLimited}
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
                    disabled={isRateLimited}
                  />
                  <button
                    type="button"
                    className="input-visibility-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Alternar visibilidade da senha"
                    disabled={isRateLimited}
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
                    disabled={isRateLimited}
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
                disabled={loading || isRateLimited}
                className="login-submit-btn pressable"
                style={isRateLimited ? { backgroundColor: 'var(--foreground-muted)', cursor: 'not-allowed' } : {}}
              >
                {loading ? 'Entrando...' : isRateLimited ? 'Bloqueado temporariamente' : 'Entrar no manual'}
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
