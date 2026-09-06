import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/common/Icons';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import './ResetPassword.css';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      const msg = 'Token de redefinição não encontrado ou link inválido.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (!password || password.length < 6) {
      const msg = 'A nova senha deve ter no mínimo 6 caracteres.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'As senhas informadas não coincidem.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSubmitted(true);
      showToast('Senha redefinida com sucesso! Acesse sua conta.', 'success');
    } catch (err) {
      const errMsg = err.message || 'Token de redefinição inválido ou expirado.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-screen-wrapper">
      {/* Header */}
      <header className="reset-header">
        <div className="reset-brand">
          <div className="reset-brand-icon" />
          <span className="reset-brand-name">Manual de Sobrevivência</span>
        </div>
      </header>

      {/* Main Content */}
      <section className="reset-body">
        <div className="reset-intro">
          <div className="reset-icon-box">
            <Icon name="lock" size={24} color="var(--green-deep)" />
          </div>
          <h1 className="reset-heading">Criar nova senha</h1>
          <p className="reset-subheading">
            Cadastre uma nova senha segura para restabelecer seu acesso ao manual.
          </p>
        </div>

        {error && <div className="reset-error-msg">{error}</div>}

        {submitted ? (
          <div className="reset-success-card animate-fade">
            <div className="success-icon-badge">
              <Icon name="circle-check-big" size={28} color="var(--green-leaf)" />
            </div>
            <h2 className="success-title">Senha alterada com sucesso! 🎉</h2>
            <p className="success-desc">
              Sua nova credencial já está ativa. Você pode acessar sua conta imediatamente com a nova senha.
            </p>
            <button
              type="button"
              className="reset-return-btn pressable"
              onClick={() => navigate('/login')}
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-new-password">Nova senha</label>
              <div className="form-input-box">
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
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

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-password">Confirme a nova senha</label>
              <div className="form-input-box">
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repita a senha digitada"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="reset-submit-btn pressable"
            >
              {loading ? 'Salvando nova senha...' : 'Redefinir senha e entrar'}
            </button>

            <footer className="reset-footer">
              <Link to="/login" className="reset-back-link">
                <Icon name="chevron-left" size={16} /> Voltar para o Login
              </Link>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
};
