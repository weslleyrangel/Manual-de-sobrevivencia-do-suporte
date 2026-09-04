import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '../components/common/Icons';
import './CheckEmail.css';

export const CheckEmail = () => {
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <div className="check-email-screen-wrapper">
      {/* Header */}
      <header className="check-email-header">
        <div className="check-email-brand">
          <div className="check-email-brand-icon" />
          <span className="check-email-brand-name">Manual de Sobrevivência</span>
        </div>
      </header>

      {/* Body */}
      <section className="check-email-body">
        <div className="check-email-card animate-fade">
          <div className="check-email-icon-badge">
            <Icon name="mail" size={28} color="var(--green-leaf)" />
          </div>

          <h1 className="check-email-title">Verifique sua caixa de entrada</h1>

          <p className="check-email-desc">
            Enviamos um link de confirmação para{' '}
            {email ? <strong>{email}</strong> : 'o seu e-mail'}.
            Clique no link para ativar sua conta.
          </p>

          <div className="check-email-tips">
            <div className="check-email-tip-item">
              <Icon name="inbox" size={16} color="var(--foreground-muted)" />
              <span>Verifique a pasta de <strong>spam</strong> ou <strong>lixo eletrônico</strong></span>
            </div>
            <div className="check-email-tip-item">
              <Icon name="clock" size={16} color="var(--foreground-muted)" />
              <span>O link expira em <strong>24 horas</strong></span>
            </div>
          </div>

          <Link to="/login" className="check-email-login-btn pressable">
            Ir para o Login
          </Link>
        </div>
      </section>
    </div>
  );
};
