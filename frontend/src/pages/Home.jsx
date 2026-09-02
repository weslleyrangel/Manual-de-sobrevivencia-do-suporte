import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import './Home.css';

export const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const userName = user?.name ? user.name.split(' ')[0] : 'Colega';

  // Current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <AppLayout>
      <div className="home-screen-wrapper">
        {/* Mobile Header */}
        <header className="home-mobile-header">
          <div className="home-brand">
            <div className="home-brand-icon" />
            <span className="home-brand-name">Manual de Sobrevivência</span>
          </div>
          <button
            type="button"
            className="home-notification-btn pressable"
            onClick={() => alert('Nenhuma notificação nova no momento.')}
            aria-label="Notificações"
          >
            <Icon name="bell" size={18} color="var(--ink)" />
          </button>
        </header>

        {/* Content Section */}
        <div className="home-content">
          {/* Greeting */}
          <section className="home-intro">
            <h1 className="home-greeting">{getGreeting()}, {userName}!</h1>
            <p className="home-prompt">Com o que podemos ajudar hoje?</p>
          </section>

          {/* Search Bar Input */}
          <div
            className="home-search-bar pressable"
            onClick={() => navigate('/search')}
            role="button"
            tabIndex={0}
          >
            <Icon name="search" size={20} color="var(--green-deep)" />
            <span className="home-search-placeholder">Pesquisar no manual</span>
          </div>

          {/* Daily Tip Card */}
          <section className="daily-tip-card">
            <div className="daily-tip-icon-box">
              <Icon name="lightbulb" size={22} color="var(--ink)" />
            </div>
            <div className="daily-tip-copy">
              <span className="daily-tip-label">DICA DE SOBREVIVÊNCIA</span>
              <h2 className="daily-tip-text">Comece pelos artigos mais acessados hoje.</h2>
            </div>
          </section>

          {/* Quick Access */}
          <section className="quick-access-section">
            <div className="section-header">
              <h2 className="section-title">Acesso rápido</h2>
              <Link to="/search" className="section-link">VER TODOS</Link>
            </div>

            <div className="quick-access-grid">
              <Link to="/search?category=Primeiros+passos" className="quick-card card-yellow pressable">
                <div className="quick-icon-box">
                  <Icon name="map" size={20} color="var(--green-deep)" />
                </div>
                <div className="quick-card-text">
                  <h3 className="quick-card-title">Primeiros passos</h3>
                  <span className="quick-card-caption">Guia essencial</span>
                </div>
              </Link>

              <Link to="/search?category=Scripts+prontos" className="quick-card card-mint pressable">
                <div className="quick-icon-box">
                  <Icon name="message-square-text" size={20} color="var(--green-deep)" />
                </div>
                <div className="quick-card-text">
                  <h3 className="quick-card-title">Scripts prontos</h3>
                  <span className="quick-card-caption">Respostas rápidas</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Continue Reading / Recent */}
          <section className="recent-section">
            <div className="section-header">
              <h2 className="section-title">Continue de onde parou</h2>
            </div>

            <Link to="/publication/1" className="recent-article-card pressable">
              <div className="recent-article-icon-box">
                <Icon name="headphones" size={20} color="var(--ink)" />
              </div>
              <div className="recent-article-copy">
                <h3 className="recent-article-title">Como lidar com um cliente irritado</h3>
                <span className="recent-article-meta">Lido há 12 min · Atendimento</span>
              </div>
              <Icon name="chevron-right" size={20} color="var(--green-leaf)" />
            </Link>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};
