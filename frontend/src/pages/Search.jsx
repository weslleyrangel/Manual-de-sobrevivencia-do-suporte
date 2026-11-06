import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './Search.css';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState(initialCategory || 'Todos');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const topics = [
    { name: 'Todos', type: 'all' },
    { name: 'Impressoras', type: 'mint' },
    { name: 'Rede', type: 'yellow' },
    { name: 'Sistemas', type: 'tool' },
    { name: 'Atendimento', type: 'mint' }
  ];

  useEffect(() => {
    let isMounted = true;
    if (query.trim().length >= 2) {
      setLoading(true);
      api.search(query.trim())
        .then((res) => {
          if (isMounted) setResults(res || []);
        })
        .catch(() => {
          if (isMounted) setResults([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [query]);

  // Filtro por categoria caso o usuário selecione uma tag
  const filteredResults = results.filter((item) => {
    if (activeTopic === 'Todos') return true;
    return item.category?.toLowerCase() === activeTopic.toLowerCase();
  });

  return (
    <AppLayout>
      <div className="search-screen-wrapper">
        <header className="search-mobile-header">
          <div className="search-brand">
            <div className="search-brand-icon" />
            <span className="search-brand-name">Manual do Suporte</span>
          </div>
        </header>

        <div className="search-content">
          <h1 className="search-title">Pesquisa Rápida</h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '14px', marginBottom: '16px' }}>
            Digite o erro, modelo de impressora ou insumo (Ex: Elgin, Spooler, Bobina...)
          </p>

          {/* Campo de Busca com Foco Automático */}
          <div className="search-input-wrapper">
            <Icon name="search" size={20} color="var(--green-leaf)" />
            <input
              type="text"
              className="search-input-field"
              placeholder="O que o usuário está enfrentando?"
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

          {/* Pílulas de Tópicos / Categorias */}
          <div className="topic-tags-row" style={{ marginTop: '16px', marginBottom: '24px' }}>
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

          {/* Resultados da Busca */}
          {query.trim().length >= 2 ? (
            <section className="search-results-section animate-fade">
              <div className="search-section-header">
                <h2 className="search-section-title">
                  {loading ? 'Buscando...' : `Resultados (${filteredResults.length})`}
                </h2>
              </div>

              <div className="search-results-list">
                {filteredResults.length > 0 ? (
                  filteredResults.map((article) => (
                    <Link
                      key={article.id}
                      to={`/publication/${article.id}`}
                      className="search-result-card pressable"
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span className="result-category-tag">{article.category}</span>
                        {article.equipment_model && (
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                            🖨️ {article.equipment_model}
                          </span>
                        )}
                        {article.supplies_info && (
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#92400e' }}>
                            🏷️ {article.supplies_info}
                          </span>
                        )}
                        {article.has_steps && (
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                            📷 Passo a passo com fotos
                          </span>
                        )}
                      </div>

                      <h3 className="result-title" style={{ fontSize: '17px', color: 'var(--ink)', marginBottom: '6px' }}>
                        {article.title}
                      </h3>
                      <p className="result-snippet" style={{ color: 'var(--foreground-secondary)', fontSize: '14px', lineHeight: '1.4' }}>
                        {article.snippet}
                      </p>
                    </Link>
                  ))
                ) : (
                  !loading && (
                    <div className="no-results-box" style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <p style={{ fontSize: '16px', color: 'var(--ink)' }}>Nenhum procedimento encontrado para "<strong>{query}</strong>".</p>
                      <span style={{ fontSize: '13px', color: 'var(--foreground-muted)' }}>
                        Dica: Tente palavras-chave como o modelo da impressora ou o código do erro.
                      </span>
                    </div>
                  )
                )}
              </div>
            </section>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--foreground-muted)' }}>
              <Icon name="search" size={40} color="var(--border-subtle)" />
              <p style={{ marginTop: '12px', fontSize: '15px' }}>Comece a digitar para ver os procedimentos em tempo real.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};