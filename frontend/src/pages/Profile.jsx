import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './Profile.css';

export const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pubCount, setPubCount] = useState(20);

  const name = user?.name || 'Wesley Rangel';
  const role = user?.role || 'Especialista N2';
  
  // Extract initials
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'WR';

  useEffect(() => {
    let isMounted = true;
    api.getProblems({ author_id: user?.id || 1 })
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setPubCount(data.length);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [user]);

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
          <h1 className="profile-page-title">Meu Perfil</h1>

          {/* 2-Column Split for Desktop */}
          <div className="profile-grid-layout">
            {/* Left Column (User Card & Metrics) */}
            <div className="profile-left-col">
              <section className="profile-summary-card">
                <div className="profile-avatar-circle">
                  <span className="profile-avatar-initials">{initials}</span>
                </div>
                <h2 className="profile-user-name">{name}</h2>
                <p className="profile-user-role">{role}</p>

                {/* Indicators Inside Card */}
                <div className="profile-stats-card">
                  <div className="stat-item">
                    <span className="stat-number">{pubCount}</span>
                    <span className="stat-label">publicações</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <span className="stat-number">620</span>
                    <span className="stat-label">curtidas</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <span className="stat-number">18.4k</span>
                    <span className="stat-label">salvos</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column (Actions Grid) */}
            <div className="profile-right-col">
              <section className="profile-actions-list">
                <Link to="/my-publications" className="profile-action-card card-mint pressable">
                  <div className="action-icon-box">
                    <Icon name="notebook-tabs" size={22} color="var(--badge-mint-text)" />
                  </div>
                  <div className="action-copy">
                    <h3 className="action-title">Minhas publicações</h3>
                    <p className="action-desc">Veja e organize todos os tutoriais e procedimentos registrados por você</p>
                  </div>
                  <Icon name="chevron-right" size={20} color="var(--foreground-muted)" />
                </Link>

                <Link to="/new-publication" className="profile-action-card card-yellow pressable">
                  <div className="action-icon-box">
                    <Icon name="plus" size={22} color="var(--badge-yellow-text)" />
                  </div>
                  <div className="action-copy">
                    <h3 className="action-title">Criar publicação</h3>
                    <p className="action-desc">Compartilhe uma nova solução rápida ou checklist com o time</p>
                  </div>
                  <Icon name="chevron-right" size={20} color="var(--foreground-muted)" />
                </Link>

                <Link to="/professional-setup" className="profile-action-card card-white pressable">
                  <div className="action-icon-box">
                    <Icon name="briefcase-business" size={22} color="var(--accent-primary)" />
                  </div>
                  <div className="action-copy">
                    <h3 className="action-title">Configurar área e função</h3>
                    <p className="action-desc">Personalize atalhos, sua fila principal e nível de experiência</p>
                  </div>
                  <Icon name="chevron-right" size={20} color="var(--foreground-muted)" />
                </Link>

                <Link to="/menu" className="profile-action-card card-white pressable">
                  <div className="action-icon-box">
                    <Icon name="settings-2" size={22} color="var(--accent-primary)" />
                  </div>
                  <div className="action-copy">
                    <h3 className="action-title">Aparência & Preferências</h3>
                    <p className="action-desc">Modo escuro, notificações de turno e central de ajuda</p>
                  </div>
                  <Icon name="chevron-right" size={20} color="var(--foreground-muted)" />
                </Link>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
