import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './ProfessionalSetup.css';

export const ProfessionalSetup = () => {
  const [area, setArea] = useState('Atendimento ao cliente');
  const [role, setRole] = useState('Analista de suporte');
  const [level, setLevel] = useState('Nível 2 (Pleno)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleFinish = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const draft = JSON.parse(sessionStorage.getItem('register_draft') || '{}');
    if (!draft.fullName?.trim() || !draft.email?.trim() || !draft.password) {
      const msg = 'Dados cadastrais incompletos. Por favor, retorne à etapa anterior.';
      setError(msg);
      showToast(msg, 'error');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: draft.fullName.trim(),
        email: draft.email.trim(),
        password: draft.password,
        area,
        role,
        level
      };

      const result = await api.register(payload);
      sessionStorage.removeItem('register_draft');

      // Tentativa de login automático para obter a sessão JWT real do novo usuário
      let loggedUser = null;
      try {
        const loginData = await api.login(payload.email, payload.password);
        if (loginData?.user) {
          loggedUser = loginData.user;
        }
      } catch (loginErr) {
        console.warn('Auto-login pós-cadastro não completado:', loginErr);
      }

      if (!loggedUser && result?.user) {
        loggedUser = result.user;
      }

      if (loggedUser && login) {
        login(loggedUser);
        showToast(`Cadastro realizado com sucesso! Bem-vindo(a), ${loggedUser.name}.`, 'success');
        navigate('/');
      } else {
        showToast('Cadastro realizado com sucesso! Faça login para continuar.', 'success');
        navigate('/login', { state: { email: payload.email } });
      }
    } catch (err) {
      const errMsg = err.message || 'Falha ao concluir cadastro. Tente novamente.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pro-setup-screen-wrapper">
      {/* Header */}
      <header className="pro-setup-header">
        <div className="pro-setup-brand">
          <div className="pro-setup-brand-icon" />
          <span className="pro-setup-brand-name">Manual de Sobrevivência</span>
        </div>
        <div className="pro-setup-step-badge">
          <span>ETAPA 2 DE 2</span>
        </div>
      </header>

      {/* Body */}
      <section className="pro-setup-body">
        <h1 className="pro-setup-title">Agora, fale do seu trabalho.</h1>
        <p className="pro-setup-subtitle">
          Vamos adaptar conteúdos e atalhos para a sua realidade.
        </p>

        {error && <div className="pro-setup-error-msg">{error}</div>}

        <form onSubmit={handleFinish} className="pro-setup-form">
          <div className="pro-info-card">
            {/* Area selection */}
            <div className="pro-field-item">
              <div className="pro-field-icon">
                <Icon name="briefcase-business" size={20} color="var(--green-leaf)" />
              </div>
              <div className="pro-field-content">
                <label className="pro-field-label" htmlFor="pro-area-select">Sua área</label>
                <select
                  id="pro-area-select"
                  className="pro-select"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option value="Atendimento ao cliente">Atendimento ao cliente</option>
                  <option value="Suporte Técnico N1/N2">Suporte Técnico N1/N2</option>
                  <option value="Suporte a Sistemas / TI">Suporte a Sistemas / TI</option>
                  <option value="Customer Success (CS)">Customer Success (CS)</option>
                  <option value="Operações & NOC">Operações & NOC</option>
                </select>
              </div>
              <Icon name="chevron-down" size={18} color="var(--foreground-muted)" />
            </div>

            {/* Role selection */}
            <div className="pro-field-item">
              <div className="pro-field-icon">
                <Icon name="badge-check" size={20} color="var(--green-leaf)" />
              </div>
              <div className="pro-field-content">
                <label className="pro-field-label" htmlFor="pro-role-select">Sua função</label>
                <select
                  id="pro-role-select"
                  className="pro-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Analista de suporte">Analista de suporte</option>
                  <option value="Agente de atendimento">Agente de atendimento</option>
                  <option value="Especialista técnico">Especialista técnico</option>
                  <option value="Líder de equipe / Team Leader">Líder de equipe / Team Leader</option>
                </select>
              </div>
              <Icon name="chevron-down" size={18} color="var(--foreground-muted)" />
            </div>

            {/* Level selection */}
            <div className="pro-field-item">
              <div className="pro-field-icon">
                <Icon name="sprout" size={20} color="var(--green-leaf)" />
              </div>
              <div className="pro-field-content">
                <label className="pro-field-label" htmlFor="pro-level-select">Nível de experiência</label>
                <select
                  id="pro-level-select"
                  className="pro-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="Nível 1 (Júnior)">Nível 1 (Júnior / Iniciante)</option>
                  <option value="Nível 2 (Pleno)">Nível 2 (Pleno)</option>
                  <option value="Nível 3 (Sênior)">Nível 3 (Sênior / Especialista)</option>
                </select>
              </div>
              <Icon name="chevron-down" size={18} color="var(--foreground-muted)" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pro-submit-btn pressable"
          >
            {loading ? 'Finalizando...' : 'Concluir e entrar no manual'}
          </button>

          <footer className="pro-footer">
            <Link to="/register" className="pro-back-link">
              <Icon name="chevron-left" size={16} /> Voltar para a etapa anterior
            </Link>
          </footer>
        </form>
      </section>
    </div>
  );
};
