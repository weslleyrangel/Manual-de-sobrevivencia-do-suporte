import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import './MyPublications.css';

export const MyPublications = () => {
  const [activeTab, setActiveTab] = useState('Todas');
  const navigate = useNavigate();

  const [publications] = useState([
    {
      id: '1',
      title: 'Como desescalar uma conversa difícil',
      tag: 'Boas práticas',
      tagType: 'mint',
      status: 'published',
      date: 'Publicado há 2 dias',
      likes: 18,
      comments: 2
    },
    {
      id: '2',
      title: 'Checklist: início de turno e conferência de filas',
      tag: 'Rotinas',
      tagType: 'yellow',
      status: 'published',
      date: 'Publicado há 1 semana',
      likes: 14,
      comments: 5
    },
    {
      id: '3',
      title: 'Atalhos de teclado mais úteis no Zendesk / Chat',
      tag: 'Rascunho',
      tagType: 'draft',
      status: 'draft',
      date: 'Salvo ontem às 17:30',
      likes: 0,
      comments: 0
    }
  ]);

  const filtered = publications.filter((p) => {
    if (activeTab === 'Rascunhos') return p.status === 'draft';
    if (activeTab === 'Publicadas') return p.status === 'published';
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
            <Icon name="plus" size={19} color="var(--ink)" />
          </button>
        </header>

        {/* Content */}
        <div className="mypubs-content">
          <div className="mypubs-intro">
            <h1 className="mypubs-title">Minhas publicações</h1>
            <p className="mypubs-subtitle">Seu conhecimento deixa o suporte mais forte.</p>
          </div>

          {/* Filter Pills */}
          <div className="mypubs-filter-row">
            {['Todas', 'Rascunhos', 'Publicadas'].map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`mypubs-tab-btn pressable ${isSelected ? 'active' : ''}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Publications List */}
          <div className="mypubs-list">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="mypubs-card pressable"
                onClick={() => navigate(`/publication/${item.id}`)}
              >
                <div className="mypubs-card-header">
                  <span className={`mypubs-tag tag-${item.tagType}`}>
                    {item.tag}
                  </span>
                  <button
                    type="button"
                    className="mypubs-menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Opções da publicação: Editar, Excluir ou Compartilhar.');
                    }}
                    aria-label="Mais opções"
                  >
                    <Icon name="ellipsis" size={18} color="var(--foreground-muted)" />
                  </button>
                </div>

                <h2 className="mypubs-card-title">{item.title}</h2>

                <div className="mypubs-card-footer">
                  <span className="mypubs-card-date">{item.date}</span>
                  {item.status === 'published' && (
                    <div className="mypubs-card-metrics">
                      <span>👍 {item.likes}</span>
                      <span>💬 {item.comments}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
