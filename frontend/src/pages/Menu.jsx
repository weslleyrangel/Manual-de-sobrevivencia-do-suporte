import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import './Menu.css';

export const Menu = () => {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setDarkMode(true);
    }
  }, []);

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };

  const name = user?.name || 'Ana Martins';
  const role = user?.role || 'Analista de suporte';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'AM';

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
                  <Icon name={darkMode ? 'moon' : 'sun'} size={19} color="var(--green-deep)" />
                </div>
                <div className="menu-item-copy">
                  <span className="menu-item-title">Aparência</span>
                  <span className="menu-item-desc">
                    Modo {darkMode ? 'Escuro (Dark Mode)' : 'Claro'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`theme-toggle-switch pressable ${darkMode ? 'on' : ''}`}
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
