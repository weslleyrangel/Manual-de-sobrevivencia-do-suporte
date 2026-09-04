import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './Home.css';

export const Home = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  // Current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  useEffect(() => {
    let isMounted = true;
    api.getProblems({ limit: 4 })
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setArticles(data);
        }
      })
      .catch((e) => console.error('Erro ao carregar artigos da Home', e))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <AppLayout>
      <div className="home-screen-wrapper">
        {/* Mobile Header */}
        <header className="home-mobile-header">
          <div className="home-brand">
            <div className="home-brand-icon" />
            <span className="home-brand-name">Manual do Suporte</span>
          </div>
          <button
            type="button"
            className="home-notification-btn pressable"
            onClick={() => showToast('Nenhuma notificação nova no momento.', 'info')}
            aria-label="Notificações"
          >
            <Icon name="bell" size={18} color="var(--ink)" />
          </button>
        </header>

        {/* Content Section */}
        <div className="home-content">
          {/* Hero Banner Desktop */}
          <section className="home-hero-banner">
            <div className="home-intro">
              <span className="home-eyebrow">PORTAL DO AGENTE · BASE DE CONHECIMENTO</span>
              <h1 className="home-greeting">{getGreeting()}, {userName}!</h1>
              <p className="home-prompt">Com o que podemos ajudar no seu turno de hoje?</p>
            </div>

            {/* Spotlight Search Bar */}
            <div
              className="home-search-bar pressable"
              onClick={() => navigate('/search')}
              role="button"
              tabIndex={0}
            >
              <Icon name="search" size={20} color="var(--green-leaf)" />
              <span className="home-search-placeholder">Pesquisar soluções, erros, scripts e procedimentos...</span>
              <span className="search-shortcut-badge">Buscar</span>
            </div>
          </section>

          {/* Desktop 2-Column Split */}
          <div className="home-main-grid">
            {/* Left Column (Primary Content) */}
            <div className="home-left-col">
              {/* Quick Access */}
              <section className="quick-access-section">
                <div className="section-header">
                  <h2 className="section-title">Acesso rápido</h2>
                  <Link to="/search" className="section-link">VER TODOS OS TEMAS</Link>
                </div>

                <div className="quick-access-grid">
                  <Link to="/search?category=Primeiros+passos" className="quick-card card-yellow pressable">
                    <div className="quick-icon-box">
                      <Icon name="map" size={20} color="var(--green-leaf)" />
                    </div>
                    <div className="quick-card-text">
                      <h3 className="quick-card-title">Primeiros passos</h3>
                      <span className="quick-card-caption">Guia essencial de integração</span>
                    </div>
                  </Link>

                  <Link to="/search?category=Scripts+prontos" className="quick-card card-mint pressable">
                    <div className="quick-icon-box">
                      <Icon name="message-square-text" size={20} color="var(--green-leaf)" />
                    </div>
                    <div className="quick-card-text">
                      <h3 className="quick-card-title">Scripts prontos</h3>
                      <span className="quick-card-caption">Respostas rápidas e empáticas</span>
                    </div>
                  </Link>

                  <Link to="/search?category=Ferramentas" className="quick-card card-cream pressable">
                    <div className="quick-icon-box">
                      <Icon name="sliders-horizontal" size={20} color="var(--green-leaf)" />
                    </div>
                    <div className="quick-card-text">
                      <h3 className="quick-card-title">Ferramentas & SSO</h3>
                      <span className="quick-card-caption">Resolução de acessos e logins</span>
                    </div>
                  </Link>

                  <Link to="/search?category=Processos" className="quick-card card-white pressable">
                    <div className="quick-icon-box">
                      <Icon name="notebook-tabs" size={20} color="var(--green-leaf)" />
                    </div>
                    <div className="quick-card-text">
                      <h3 className="quick-card-title">Rotinas e Filas</h3>
                      <span className="quick-card-caption">Checklists e prioridades</span>
                    </div>
                  </Link>
                </div>
              </section>

              {/* Continue Reading / Recent Articles */}
              <section className="recent-section">
                <div className="section-header">
                  <h2 className="section-title">Mais acessados e recentes</h2>
                </div>

                <div className="recent-articles-list">
                  {articles.length > 0 ? (
                    articles.map((art) => (
                      <Link key={art.id} to={`/publication/${art.id}`} className="recent-article-card pressable">
                        <div className="recent-article-icon-box">
                          <Icon name="headphones" size={20} color="var(--ink)" />
                        </div>
                        <div className="recent-article-copy">
                          <div className="article-badge-row">
                            <span className="badge-category">{art.category?.toUpperCase() || 'SUPORTE'}</span>
                            <span className="badge-resolved">{art.status || 'RESOLVIDO'}</span>
                          </div>
                          <h3 className="recent-article-title">{art.title}</h3>
                          <span className="recent-article-meta">
                            Por {art.author_name || 'Especialista'} · {art.views_count || 0} visualizações
                          </span>
                        </div>
                        <Icon name="chevron-right" size={20} color="var(--green-leaf)" />
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link to="/publication/1" className="recent-article-card pressable">
                        <div className="recent-article-icon-box">
                          <Icon name="headphones" size={20} color="var(--ink)" />
                        </div>
                        <div className="recent-article-copy">
                          <div className="article-badge-row">
                            <span className="badge-category">ATENDIMENTO</span>
                            <span className="badge-resolved">RESOLVIDO</span>
                          </div>
                          <h3 className="recent-article-title">Como desescalonar chamados críticos e lidar com clientes irritados</h3>
                          <span className="recent-article-meta">Por Especialista · 1.2k visualizações</span>
                        </div>
                        <Icon name="chevron-right" size={20} color="var(--green-leaf)" />
                      </Link>

                      <Link to="/publication/2" className="recent-article-card pressable">
                        <div className="recent-article-icon-box box-mint">
                          <Icon name="message-circle-heart" size={20} color="var(--green-leaf)" />
                        </div>
                        <div className="recent-article-copy">
                          <div className="article-badge-row">
                            <span className="badge-category">FERRAMENTAS</span>
                            <span className="badge-resolved">RESOLVIDO</span>
                          </div>
                          <h3 className="recent-article-title">Guia de troubleshooting para falha no login / SSO corporativo</h3>
                          <span className="recent-article-meta">Por Especialista · 890 visualizações</span>
                        </div>
                        <Icon name="chevron-right" size={20} color="var(--green-leaf)" />
                      </Link>
                    </>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column (Sidebar Widgets) */}
            <aside className="home-right-col">
              {/* Daily Tip Card */}
              <section className="daily-tip-card">
                <div className="daily-tip-header">
                  <div className="daily-tip-icon-box">
                    <Icon name="lightbulb" size={22} color="var(--ink)" />
                  </div>
                  <span className="daily-tip-label">DICA DE SOBREVIVÊNCIA</span>
                </div>
                <h2 className="daily-tip-text">Comece o turno conferindo os alertas prioritários na fila de atendimento.</h2>
                <p className="daily-tip-desc">
                  Identificar chamados reabertos logo no início evita estouro de SLA e melhora o índice de satisfação (CSAT).
                </p>
              </section>

              {/* Quick Actions Panel */}
              <section className="home-actions-panel">
                <h3 className="panel-title">Ações do Agente</h3>
                <div className="actions-panel-list">
                  <button
                    type="button"
                    onClick={() => navigate('/new-publication')}
                    className="panel-action-btn pressable"
                  >
                    <Icon name="plus" size={18} color="var(--green-leaf)" />
                    <span>Compartilhar uma nova solução</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/my-publications')}
                    className="panel-action-btn pressable"
                  >
                    <Icon name="notebook-tabs" size={18} color="var(--green-leaf)" />
                    <span>Gerenciar meus tutoriais ({articles.length > 0 ? '20' : '12'})</span>
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
