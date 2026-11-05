import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Icon } from '../common/Icons';
import './AppLayout.css';

export const AppLayout = ({ children, hideDesktopNav = false }) => {
  return (
    <div className="app-viewport desktop-layout">
      {/* Header Limpo: Logo na esquerda + Perfil do usuário na direita */}
      {!hideDesktopNav && (
        <header className="desktop-navbar">
          <div className="desktop-navbar-inner">
            {/* Lado Esquerdo: Logo da Empresa */}
            <Link to="/" className="desktop-brand" title="Manual de Sobrevivência - Início">
              <div className="brand-badge-icon">
                <div className="brand-square" />
              </div>
              <span className="brand-title">Manual de Sobrevivência</span>
            </Link>

            {/* Lado Direito: Apenas o Perfil do Usuário */}
            <div className="desktop-navbar-right">
              <NavLink
                to="/profile"
                className={({ isActive }) => `desktop-profile-btn pressable ${isActive ? 'active' : ''}`}
                title="Meu Perfil"
                aria-label="Meu Perfil"
              >
                <Icon name="circle-user-round" size={22} color="var(--ink)" />
                <span className="desktop-profile-label">Meu Perfil</span>
              </NavLink>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <div className="app-screen-container no-bottom-nav">
        <main className="screen-scroll-body animate-fade">
          {children}
        </main>
      </div>
    </div>
  );
};
