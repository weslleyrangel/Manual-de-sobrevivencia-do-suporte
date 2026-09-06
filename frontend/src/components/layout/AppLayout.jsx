import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BottomNav } from './BottomNav';
import { Icon } from '../common/Icons';
import './AppLayout.css';

export const AppLayout = ({ children, hideBottomNav = false, hideDesktopNav = false }) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useContext(AuthContext);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US';

  return (
    <div className="app-viewport desktop-layout">
      {/* Desktop Top Header / Navigation Bar for Desktop screens */}
      {!hideDesktopNav && (
        <header className="desktop-navbar">
          <div className="desktop-navbar-inner">
            <Link to="/" className="desktop-brand">
              <div className="brand-badge-icon">
                <div className="brand-square" />
              </div>
              <span className="brand-title">Manual de Sobrevivência</span>
            </Link>

            <nav className="desktop-nav-links">
              <NavLink to="/" end className={({ isActive }) => `desktop-link ${isActive ? 'active' : ''}`}>
                <Icon name="house" size={18} /> Início
              </NavLink>
              <NavLink to="/search" className={({ isActive }) => `desktop-link ${isActive ? 'active' : ''}`}>
                <Icon name="search" size={18} /> Pesquisar
              </NavLink>
              <NavLink to="/my-publications" className={({ isActive }) => `desktop-link ${isActive ? 'active' : ''}`}>
                <Icon name="notebook-tabs" size={18} /> Minhas Publicações
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `desktop-link ${isActive ? 'active' : ''}`}>
                <Icon name="circle-user-round" size={18} /> Meu Perfil
              </NavLink>
              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `desktop-link admin-desktop-tab ${isActive ? 'active' : ''}`}
                >
                  <Icon name="shield-check" size={18} /> Painel Admin
                </NavLink>
              )}
            </nav>

            <div className="desktop-actions">
              <button
                onClick={() => navigate('/new-publication')}
                className="desktop-create-btn pressable"
              >
                <Icon name="plus" size={16} color="#FFFFFF" /> Nova Publicação
              </button>
              <Link to="/menu" className="desktop-avatar-btn pressable" title="Menu & Configurações">
                <span className="avatar-initials">{initials}</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <div className={`app-screen-container ${hideBottomNav ? 'no-bottom-nav' : ''}`}>
        <main className="screen-scroll-body animate-fade">
          {children}
        </main>
        {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  );
};
