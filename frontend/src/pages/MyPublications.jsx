import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './MyPublications.css';

export const MyPublications = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [activeTab, setActiveTab] = useState('all');
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackPubs = [
    {
      id: '1',
      title: 'Como desescalar uma conversa difícil',
      category: 'Atendimento',
      is_draft: false,
      likes_count: 24,
      views_count: 1240,
      created_at: 'Hoje'
    },
    {
      id: '2',
      title: 'Atalhos de teclado mais úteis no Zendesk / Chat',
      category: 'Ferramentas',
      is_draft: true,
      likes_count: 0,
      views_count: 1,
      created_at: 'Ontem'
    }
  ];

  useEffect(() => {
    let isMounted = true;
    api.getProblems({ author_id: user?.id || 1, limit: 50 })
      .then((data) => {
        if (isMounted) {
          if (data && data.length > 0) {
            setPublications(data);
          } else {
            setPublications(fallbackPubs);
          }
        }
      })
      .catch(() => {
        if (isMounted) setPublications(fallbackPubs);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [user]);

  const currentList = publications.length > 0 ? publications : fallbackPubs;

  const filteredPubs = currentList.filter((pub) => {
    if (activeTab === 'drafts') return pub.is_draft;
    if (activeTab === 'published') return !pub.is_draft;
    return true;
  });

  return (
    <AppLayout>
      <div className="mypubs-screen-wrapper">
        {/* Mobile Header */}
        <header className="mypubs-mobile-header">
          <div className="mypubs-brand">
            <div className="mypubs-brand-icon" />
            <span className="mypubs-brand-name">Manual de Sobrevivência</span>
          </div>
          <button
            type="button"
            className="mypubs-new-btn pressable"
            onClick={() => navigate('/new-publication')}
            aria-label="Nova publicação"
          >
            <Icon name="plus" size={19} color="var(--badge-yellow-text)" />
          </button>
        </header>

        {/* Content */}
        <div className="mypubs-content">
          <div className="mypubs-intro">
            <div className="mypubs-intro-text">
              <h1 className="mypubs-title">Minhas publicações</h1>
              <p className="mypubs-subtitle">Gerencie os tutoriais e procedimentos registrados por você</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mypubs-filter-row">
            <button
              type="button"
              className={`mypubs-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Todas
            </button>
            <button
              type="button"
              className={`mypubs-tab-btn ${activeTab === 'published' ? 'active' : ''}`}
              onClick={() => setActiveTab('published')}
            >
              Publicadas
            </button>
            <button
              type="button"
              className={`mypubs-tab-btn ${activeTab === 'drafts' ? 'active' : ''}`}
              onClick={() => setActiveTab('drafts')}
            >
              Rascunhos
            </button>
          </div>

          {/* Publications Grid */}
          <div className="mypubs-list">
            {filteredPubs.length > 0 ? (
              filteredPubs.map((pub) => (
                <div
                  key={pub.id}
                  className="mypubs-card pressable"
                  onClick={() => navigate(`/publication/${pub.id}`)}
                >
                  <div className="mypubs-card-header">
                    <span className={`mypubs-tag ${pub.is_draft ? 'tag-draft' : 'tag-mint'}`}>
                      {pub.is_draft ? 'RASCUNHO' : (pub.category?.toUpperCase() || 'ATENDIMENTO')}
                    </span>
                    <button
                      type="button"
                      className="mypubs-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      aria-label="Opções"
                    >
                      <Icon name="ellipsis" size={16} color="var(--foreground-muted)" />
                    </button>
                  </div>
                  <h3 className="mypubs-card-title">{pub.title}</h3>
                  <div className="mypubs-card-footer">
                    <span className="mypubs-card-date">
                      {pub.created_at ? (typeof pub.created_at === 'string' && pub.created_at.length < 10 ? pub.created_at : new Date(pub.created_at).toLocaleDateString('pt-BR')) : 'Hoje'}
                    </span>
                    <div className="mypubs-card-metrics">
                      <span>👍 {pub.likes_count || 0}</span>
                      <span>👁️ {pub.views_count || 1}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results-box" style={{ gridColumn: '1 / -1' }}>
                <p>Nenhuma publicação encontrada nesta aba.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
