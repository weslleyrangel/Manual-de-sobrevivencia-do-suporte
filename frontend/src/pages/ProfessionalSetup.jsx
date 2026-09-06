import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const [isRateLimited, setIsRateLimited] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFinish = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsRateLimited(false);

    const draft = location.state || {};
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

      showToast('Cadastro realizado! Verifique seu e-mail para ativar a conta.', 'success');
      navigate('/check-email', { state: { email: result?.email || payload.email } });
    } catch (err) {
      const errMsg = err.message || 'Falha ao concluir cadastro. Tente novamente.';
      setError(errMsg);
      
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
        {isRateLimited && (
          <div className="pro-setup-error-msg" style={{ 
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
              <strong style={{ color: 'var(--color-error-foreground)' }}>Criação de conta temporariamente bloqueada</strong>
            </div>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', color: 'var(--color-error-foreground)' }}>
              Muitas contas ou requisições foram criadas/feitas recentemente por você. 
              Para evitar abusos, aguarde <strong>15 minutos</strong> antes de finalizar o cadastro.
            </p>
          </div>
        )}

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
                  disabled={isRateLimited}
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
                <Icon name="users" size={20} color="var(--green-leaf)" />
              </div>
              <div className="pro-field-content">
                <label className="pro-field-label" htmlFor="pro-role-select">Sua função principal</label>
                <select
                  id="pro-role-select"
                  className="pro-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isRateLimited}
                >
                  <option value="Analista de suporte">Analista de suporte</option>
                  <option value="Técnico de infraestrutura">Técnico de infraestrutura</option>
                  <option value="Especialista de sistemas">Especialista de sistemas</option>
                  <option value="Líder de equipe / Coordenador">Líder de equipe / Coordenador</option>
                </select>
              </div>
              <Icon name="chevron-down" size={18} color="var(--foreground-muted)" />
            </div>

            {/* Level selection */}
            <div className="pro-field-item">
              <div className="pro-field-icon">
                <Icon name="award" size={20} color="var(--green-leaf)" />
              </div>
              <div className="pro-field-content">
                <label className="pro-field-label" htmlFor="pro-level-select">Seu nível de senioridade</label>
                <select
                  id="pro-level-select"
                  className="pro-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={isRateLimited}
                >
                  <option value="Nível 1 (Júnior)">Nível 1 (Júnior)</option>
                  <option value="Nível 2 (Pleno)">Nível 2 (Pleno)</option>
                  <option value="Nível 3 (Sênior)">Nível 3 (Sênior)</option>
                  <option value="Especialista">Especialista</option>
                </select>
              </div>
              <Icon name="chevron-down" size={18} color="var(--foreground-muted)" />
            </div>
          </div>

          <div className="pro-setup-actions">
            <Link to="/register" className="pro-setup-back-btn pressable">
              <Icon name="arrow-left" size={18} />
              Voltar
            </Link>
            <button
              type="submit"
              disabled={loading || isRateLimited}
              className="pro-setup-submit-btn pressable"
              style={isRateLimited ? { backgroundColor: 'var(--foreground-muted)', cursor: 'not-allowed' } : {}}
            >
              {loading ? 'Finalizando...' : isRateLimited ? 'Bloqueado' : 'Finalizar cadastro'}
              {!loading && !isRateLimited && <Icon name="arrow-right" size={18} />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
