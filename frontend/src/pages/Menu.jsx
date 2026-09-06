import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext, useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import './Menu.css';

export const Menu = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };

  const name = user?.name || 'Usuário';
  const role = user?.role || user?.job_title || 'Membro';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'U';

  return (
    <AppLayout>
      <div className="menu-screen-wrapper">
        {/* Mobile Brand Header */}
        <header className="menu-mobile-header">
          <div className="menu-brand">
            <div className="menu-brand-icon" />
            <span className="menu-brand-name">Manual do Suporte</span>
          </div>
        </header>

        <div className="menu-content">
          <h1 className="menu-title">Menu</h1>

          {/* User Profile Card */}
          <Link to="/profile" className="menu-profile-card pressable">
            <div className="menu-profile-avatar">
              <span className="menu-avatar-initials">{initials}</span>
            </div>
            <div className="menu-profile-copy">
              <h2 className="menu-profile-name">{name}</h2>
              <span className="menu-profile-role">{role}</span>
            </div>
            <Icon name="chevron-right" size={18} color="#DFF3E4" />
          </Link>

          {/* Section: Administração (Exclusivo ROLE_ADMIN) */}
          {isAdmin && (
            <section className="menu-section admin-menu-section">
              <h3 className="menu-section-heading">Administração do Sistema</h3>
              <div className="menu-items-list">
                <Link to="/admin" className="menu-item-card pressable admin-menu-card">
                  <div className="menu-item-icon-box box-admin">
                    <Icon name="shield-check" size={19} color="#FFFFFF" />
                  </div>
                  <div className="menu-item-copy">
                    <span className="menu-item-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Console do Administrador
                      <span className="menu-admin-badge">ADMIN</span>
                    </span>
                    <span className="menu-item-desc">Métricas, gestão de usuários e moderação</span>
                  </div>
                  <Icon name="chevron-right" size={18} color="var(--foreground-muted)" />
                </Link>
              </div>
            </section>
          )}

          {/* Section: Sua Conta */}
          <section className="menu-section">
            <h3 className="menu-section-heading">Sua conta</h3>

            <div className="menu-items-list">
              <Link to="/profile" className="menu-item-card pressable">
                <div className="menu-item-icon-box box-yellow">
                  <Icon name="settings-2" size={19} color="var(--green-deep)" />
                </div>
                <div className="menu-item-copy">
                  <span className="menu-item-title">Configurações de perfil</span>
                  <span className="menu-item-desc">Preferências e dados profissionais</span>
                </div>
                <Icon name="chevron-right" size={18} color="var(--foreground-muted)" />
              </Link>

              <div className="menu-item-card">
                <div className="menu-item-icon-box box-mint">
                  <Icon name={isDarkMode ? 'moon' : 'sun'} size={19} color="var(--green-deep)" />
                </div>
                <div className="menu-item-copy">
                  <span className="menu-item-title">Aparência</span>
                  <span className="menu-item-desc">
                    Modo {isDarkMode ? 'Escuro (Dark Mode)' : 'Claro'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`theme-toggle-switch pressable ${isDarkMode ? 'on' : ''}`}
                  aria-label="Alternar modo escuro"
                >
                  <div className="toggle-handle" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => showToast('Central de Ajuda: Em caso de dúvidas técnicas, consulte seu líder ou canal interno #suporte-ajuda.', 'info')}
                className="menu-item-card pressable"
              >
                <div className="menu-item-icon-box box-yellow">
                  <Icon name="headphones" size={19} color="var(--green-deep)" />
                </div>
                <div className="menu-item-copy">
                  <span className="menu-item-title">Central de Ajuda</span>
                  <span className="menu-item-desc">Dúvidas frequentes e canais de apoio</span>
                </div>
                <Icon name="chevron-right" size={18} color="var(--foreground-muted)" />
              </button>
            </div>
          </section>

          {/* Section: Logout */}
          <section className="menu-logout-section">
            <button
              type="button"
              onClick={handleLogout}
              className="menu-logout-btn pressable"
            >
              <Icon name="log-out" size={18} color="var(--color-error-foreground)" />
              <span>Sair da conta</span>
            </button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};
