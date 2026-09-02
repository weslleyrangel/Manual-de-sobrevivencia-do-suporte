import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import './Search.css';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState(initialCategory || 'Todos');
  const [recentSearches, setRecentSearches] = useState([
    'Política de reembolso',
    'Acesso bloqueado',
    'Resposta para atraso'
  ]);

  const topics = [
    { name: 'Todos', bg: 'var(--surface-primary)' },
    { name: 'Atendimento', bg: 'var(--green-mint)', text: 'var(--green-deep)' },
    { name: 'Processos', bg: 'var(--yellow-pale)', text: 'var(--green-deep)' },
    { name: 'Ferramentas', bg: '#FFFFFF', text: 'var(--green-deep)', border: true }
  ];

  const allArticles = [
    {
      id: '1',
      title: 'Como lidar com um cliente irritado',
      category: 'Atendimento',
      snippet: 'Dicas práticas de empatia e desescalonamento para atendimentos de alta tensão.',
      reads: '1.2k visualizações'
    },
    {
      id: '2',
      title: '5 frases para desarmar uma conversa difícil',
      category: 'Atendimento',
      snippet: 'Substitua termos reativos por acordos claros e mantenha o controle do chamado.',
      reads: '850 visualizações'
    },
    {
      id: '3',
      title: 'Checklist: início de turno e conferência de filas',
      category: 'Processos',
      snippet: 'Passo a passo matinal para organizar seus chamados e priorizar chamados críticos.',
      reads: '640 visualizações'
    },
    {
      id: '4',
      title: 'Guia de troubleshooting para falha no login / SSO',
      category: 'Ferramentas',
      snippet: 'Como diagnosticar rapidamente problemas de autenticação e cookies.',
      reads: '490 visualizações'
    }
  ];

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  const handleSelectRecent = (term) => {
    setQuery(term);
  };

  const filteredArticles = allArticles.filter((item) => {
    const matchesTopic = activeTopic === 'Todos' || item.category.toLowerCase() === activeTopic.toLowerCase();
    const matchesQuery = query.trim() === '' || 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.snippet.toLowerCase().includes(query.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  return (
    <AppLayout>
      <div className="search-screen-wrapper">
        {/* Mobile Header */}
        <header className="search-mobile-header">
          <div className="search-brand">
            <div className="search-brand-icon" />
            <span className="search-brand-name">Manual de Sobrevivência</span>
          </div>
          <button
            type="button"
            className="search-filter-btn pressable"
            onClick={() => setActiveTopic(activeTopic === 'Todos' ? 'Atendimento' : 'Todos')}
            aria-label="Filtrar tópicos"
          >
            <Icon name="sliders-horizontal" size={18} color="var(--ink)" />
          </button>
        </header>

        {/* Content */}
        <div className="search-content">
          <h1 className="search-title">Pesquisar</h1>

          {/* Search Query Input */}
          <div className="search-input-wrapper">
            <Icon name="search" size={20} color="var(--green-deep)" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Como acalmar um cliente?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                className="clear-query-btn"
                onClick={() => setQuery('')}
                aria-label="Limpar texto"
              >
                ✕
              </button>
            )}
          </div>

          {/* If there is active search query */}
          {query.trim().length > 0 ? (
            <section className="search-results-section animate-fade">
              <div className="search-section-header">
                <h2 className="search-section-title">
                  Resultados ({filteredArticles.length})
                </h2>
              </div>
              <div className="search-results-list">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/publication/${article.id}`}
                      className="search-result-card pressable"
                    >
                      <div className="result-category-tag">{article.category}</div>
                      <h3 className="result-title">{article.title}</h3>
                      <p className="result-snippet">{article.snippet}</p>
                      <span className="result-meta">{article.reads}</span>
                    </Link>
                  ))
                ) : (
                  <div className="no-results-box">
                    <p>Nenhum artigo encontrado para "<strong>{query}</strong>".</p>
                    <span>Tente outras palavras-chave ou navegue pelos temas abaixo.</span>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <section className="recent-searches-section">
                  <div className="search-section-header">
                    <h2 className="search-section-title">Pesquisas recentes</h2>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="clear-searches-link pressable"
                    >
                      LIMPAR
                    </button>
                  </div>

                  <div className="recent-searches-list">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        type="button"
                        className="recent-search-item pressable"
                        onClick={() => handleSelectRecent(term)}
                      >
                        <Icon name="history" size={17} color="var(--foreground-muted)" />
                        <span className="recent-search-text">{term}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Explore by topic */}
              <section className="explore-topics-section">
                <div className="search-section-header">
                  <h2 className="search-section-title">Explore por tema</h2>
                </div>

                <div className="topic-tags-row">
                  {topics.map((topic) => {
                    const isSelected = activeTopic === topic.name;
                    return (
                      <button
                        key={topic.name}
                        type="button"
                        onClick={() => setActiveTopic(isSelected ? 'Todos' : topic.name)}
                        className={`topic-pill pressable ${isSelected ? 'selected' : ''}`}
                        style={{
                          backgroundColor: isSelected ? 'var(--green-deep)' : topic.bg,
                          color: isSelected ? '#FFFFFF' : topic.text || 'var(--ink)',
                          border: topic.border ? '1px solid var(--border-subtle)' : 'none'
                        }}
                      >
                        {topic.name}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Suggested Article */}
              <section className="suggested-article-section">
                <div className="search-section-header">
                  <h2 className="search-section-title">Sugestão para você</h2>
                </div>

                <Link to="/publication/2" className="suggested-card pressable">
                  <div className="suggested-icon-box">
                    <Icon name="message-circle-heart" size={22} color="var(--ink)" />
                  </div>
                  <div className="suggested-copy">
                    <span className="suggested-category">ATENDIMENTO</span>
                    <h3 className="suggested-title">
                      5 frases para desarmar uma conversa difícil
                    </h3>
                  </div>
                </Link>
              </section>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
