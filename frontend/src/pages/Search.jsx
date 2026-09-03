import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './Search.css';

const DEFAULT_ARTICLES = [
  {
    id: '1',
    title: 'Como lidar com um cliente irritado',
    category: 'Atendimento',
    snippet: 'Dicas práticas de empatia e desescalonamento para atendimentos de alta tensão.',
    views_count: 1240
  },
  {
    id: '2',
    title: '5 frases para desarmar uma conversa difícil',
    category: 'Atendimento',
    snippet: 'Substitua termos reativos por acordos claros e mantenha o controle do chamado.',
    views_count: 850
  },
  {
    id: '3',
    title: 'Checklist: início de turno e conferência de filas',
    category: 'Processos',
    snippet: 'Passo a passo matinal para organizar seus chamados e priorizar chamados críticos.',
    views_count: 670
  },
  {
    id: '4',
    title: 'Guia de troubleshooting para falha no login / SSO',
    category: 'Ferramentas',
    snippet: 'Como diagnosticar rapidamente problemas de autenticação e cookies.',
    views_count: 890
  }
];

export const Search = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState(initialCategory || 'Todos');
  const [recentSearches, setRecentSearches] = useState([
    'Política de reembolso',
    'Acesso bloqueado',
    'Resposta para atraso'
  ]);
  const [remoteResults, setRemoteResults] = useState(null);

  const topics = [
    { name: 'Todos', type: 'all' },
    { name: 'Atendimento', type: 'mint' },
    { name: 'Processos', type: 'yellow' },
    { name: 'Ferramentas', type: 'tool' }
  ];

  useEffect(() => {
    let isMounted = true;
    if (query.trim()) {
      api.search(query.trim())
        .then((res) => {
          if (isMounted && res && res.length > 0) {
            setRemoteResults(res);
          }
        })
        .catch(() => {});
    } else {
      setRemoteResults(null);
    }

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  const handleSelectRecent = (term) => {
    setQuery(term);
  };

  // Resultados combinados: API real ou filtro local imediato
  const localFiltered = DEFAULT_ARTICLES.filter((item) => {
    const matchesTopic = activeTopic === 'Todos' || item.category.toLowerCase() === activeTopic.toLowerCase();
    const matchesQuery = query.trim() === '' || 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.snippet.toLowerCase().includes(query.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  const displayArticles = remoteResults && remoteResults.length > 0 ? remoteResults : localFiltered;

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
            <Icon name="search" size={20} color="var(--green-leaf)" />
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
                  Resultados ({displayArticles.length})
                </h2>
              </div>
              <div className="search-results-list">
                {displayArticles.length > 0 ? (
                  displayArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/publication/${article.id}`}
                      className="search-result-card pressable"
                    >
                      <div className="result-category-tag">{article.category}</div>
                      <h3 className="result-title">{article.title}</h3>
                      <p className="result-snippet">{article.snippet || article.description}</p>
                      <span className="result-meta">
                        Por {article.author_name || 'Weslley Rangel'} · {article.views_count || 120} visualizações
                      </span>
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
                        className={`topic-pill pill-${topic.type} pressable ${isSelected ? 'selected' : ''}`}
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
                    <Icon name="message-circle-heart" size={24} color="var(--badge-yellow-text)" />
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
