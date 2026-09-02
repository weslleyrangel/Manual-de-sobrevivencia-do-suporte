import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import './Profile.css';

export const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const name = user?.name || 'Ana Souza';
  const role = user?.role || 'Analista de suporte · Nível 2';
  
  // Extract initials
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'AS';

  return (
    <AppLayout>
      <div className="profile-screen-wrapper">
        {/* Mobile Header */}
        <header className="profile-mobile-header">
          <div className="profile-brand">
            <div className="profile-brand-icon" />
            <span className="profile-brand-name">Manual de Sobrevivência</span>
          </div>
          <button
            type="button"
            className="profile-edit-btn pressable"
            onClick={() => navigate('/menu')}
            aria-label="Configurações do perfil"
          >
            <Icon name="settings-2" size={19} color="var(--ink)" />
          </button>
        </header>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Avatar & Summary */}
          <section className="profile-summary">
            <div className="profile-avatar-circle">
              <span className="profile-avatar-initials">{initials}</span>
            </div>
            <h1 className="profile-user-name">{name}</h1>
            <p className="profile-user-role">{role}</p>
          </section>

          {/* Indicators Card */}
          <section className="profile-stats-card">
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">publicações</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">38</span>
              <span className="stat-label">curtidas</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">4</span>
              <span className="stat-label">salvos</span>
            </div>
          </section>

          {/* Profile Actions */}
          <section className="profile-actions-list">
            <Link to="/my-publications" className="profile-action-card card-mint pressable">
              <div className="action-icon-box">
                <Icon name="notebook-tabs" size={20} color="var(--green-deep)" />
              </div>
              <div className="action-copy">
                <h2 className="action-title">Minhas publicações</h2>
                <p className="action-desc">Veja e organize tudo o que você compartilhou</p>
              </div>
              <Icon name="chevron-right" size={18} color="var(--green-deep)" />
            </Link>

            <Link to="/new-publication" className="profile-action-card card-yellow pressable">
              <div className="action-icon-box">
                <Icon name="plus" size={20} color="var(--green-deep)" />
              </div>
              <div className="action-copy">
                <h2 className="action-title">Criar publicação</h2>
                <p className="action-desc">Compartilhe uma solução ou dica com a equipe</p>
              </div>
              <Icon name="chevron-right" size={18} color="var(--green-deep)" />
            </Link>

            <Link to="/register/professional" className="profile-action-card card-white pressable">
              <div className="action-icon-box">
                <Icon name="briefcase-business" size={20} color="var(--green-deep)" />
              </div>
              <div className="action-copy">
                <h2 className="action-title">Configurar área e função</h2>
                <p className="action-desc">Personalize atalhos e seu nível de atendimento</p>
              </div>
              <Icon name="chevron-right" size={18} color="var(--foreground-muted)" />
            </Link>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};
