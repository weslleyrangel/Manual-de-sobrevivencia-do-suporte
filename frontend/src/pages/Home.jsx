import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './Home.css';

const SEARCH_DEBOUNCE_MS = 250;
const MIN_SEARCH_LENGTH = 2;

export const Home = () => {
  const navigate = useNavigate();
  const { isAdmin, isGuest } = useContext(AuthContext);
  const { showToast } = useToast();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca global
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Modal para criar nova empresa (Admin)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadCompanies = () => {
    setLoading(true);
    api.getCompanies()
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Erro ao carregar empresas', err);
        setError('Não foi possível carregar a lista de empresas.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Busca instantânea
  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_SEARCH_LENGTH) {
      setSearchResults(null);
      setSearching(false);
      return undefined;
    }

    let ignore = false;
    setSearching(true);
    const timer = setTimeout(() => {
      api.search(term)
        .then((data) => {
          if (!ignore) setSearchResults(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!ignore) setSearchResults([]);
        })
        .finally(() => {
          if (!ignore) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      showToast('Por favor, informe o nome da empresa.', 'error');
      return;
    }

    setCreating(true);
    try {
      const created = await api.createCompany(newCompanyName.trim());
      showToast(`Empresa "${created.name}" criada com sucesso!`, 'success');
      setNewCompanyName('');
      setIsModalOpen(false);
      loadCompanies();
    } catch (err) {
      showToast(err.message || 'Erro ao criar empresa.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const isSearchActive = searchResults !== null;

  return (
    <AppLayout>
      <div className="home-screen-wrapper">
        <div className="home-content">
          {/* Campo de Busca Superior */}
          <div className="home-search-bar">
            <Icon name="search" size={20} color="var(--green-leaf)" />
            <input
              type="search"
              className="home-search-input"
              placeholder="Pesquisar por caso, solução, comando ou erro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Pesquisar casos"
              autoFocus
            />
            {query.trim().length > 0 && (
              <button
                type="button"
                className="home-search-clear-btn"
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
              >
                <Icon name="x" size={16} />
              </button>
            )}
            {searching && <span className="home-search-hint">Buscando...</span>}
          </div>

          {/* MODO 1: Resultados diretos da pesquisa quando houver termo digitado */}
          {isSearchActive && (
            <section className="home-search-results-section">
              <div className="home-results-header">
                <h2 className="home-results-title">
                  Resultados para "{query.trim()}"
                </h2>
                <span className="home-results-count">
                  {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
                </span>
              </div>

              {searchResults.length === 0 ? (
                <p className="home-status">
                  Nenhum caso encontrado para "{query.trim()}". Tente outros termos.
                </p>
              ) : (
                <div className="home-search-results-list">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={`/publication/${item.id}`}
                      className="home-search-result-card pressable"
                    >
                      <div className="home-result-left">
                        <span className="home-result-category">
                          {item.category || 'GERAL'}
                        </span>
                        <h3 className="home-result-title">{item.title}</h3>
                        {item.snippet && (
                          <p className="home-result-snippet">{item.snippet}</p>
                        )}
                      </div>
                      <Icon name="chevron-right" size={20} color="var(--green-leaf)" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MODO 2: Grid de Empresas */}
          {!isSearchActive && (
            <section className="home-companies-section">
              <div className="home-section-header">
                <div>
                  <h1 className="home-section-title">Empresas</h1>
                  <p className="home-section-subtitle">
                    Selecione uma empresa para acessar as categorias e casos de suporte.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="home-add-company-btn pressable"
                  >
                    <Icon name="plus" size={16} color="#FFFFFF" />
                    <span>Nova Empresa</span>
                  </button>
                )}
              </div>

              {loading && <p className="home-status">Carregando empresas...</p>}
              {error && !loading && <p className="home-status home-status-error">{error}</p>}

              {!loading && !error && (
                <div className="company-cards-grid">
                  {companies.map((comp) => (
                    <div
                      key={comp.id}
                      className="company-card pressable"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/company/${comp.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/company/${comp.id}`);
                        }
                      }}
                    >
                      <div className="company-card-top">
                        <div className="company-icon-box">
                          <Icon name="briefcase-business" size={24} color="var(--accent-primary)" />
                        </div>
                        <div className="company-arrow-box">
                          <Icon name="chevron-right" size={18} color="var(--foreground-muted)" />
                        </div>
                      </div>

                      <div className="company-card-info">
                        <h2 className="company-card-name">{comp.name}</h2>
                        <div className="company-card-badges">
                          <span className="company-badge-item">
                            {comp.problems_count || 0} {(comp.problems_count === 1) ? 'caso' : 'casos'}
                          </span>
                          <span className="company-badge-separator">•</span>
                          <span className="company-badge-item">
                            {comp.categories_count || 0} categorias
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Card Atalho para criar empresa (apenas Admin) */}
                  {isAdmin && (
                    <div
                      className="company-card company-card-add pressable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsModalOpen(true)}
                    >
                      <div className="company-add-icon-circle">
                        <Icon name="plus" size={24} color="var(--accent-primary)" />
                      </div>
                      <span className="company-add-label">Cadastrar Nova Empresa</span>
                      <span className="company-add-desc">Adicione uma nova base técnica</span>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Modal Criar Empresa */}
          {isModalOpen && (
            <div className="home-modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="home-modal-card animate-fade" onClick={(e) => e.stopPropagation()}>
                <div className="home-modal-header">
                  <h3 className="home-modal-title">Cadastrar Empresa</h3>
                  <button
                    type="button"
                    className="home-modal-close-btn"
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Fechar"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateCompany} className="home-modal-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="company-name-input">
                      Nome da Empresa
                    </label>
                    <input
                      id="company-name-input"
                      type="text"
                      className="home-modal-input"
                      placeholder="Ex: MEJC, Filial Norte, Matriz..."
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      autoFocus
                      disabled={creating}
                    />
                  </div>

                  <div className="home-modal-actions">
                    <button
                      type="button"
                      className="home-modal-cancel-btn pressable"
                      onClick={() => setIsModalOpen(false)}
                      disabled={creating}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="home-modal-submit-btn pressable"
                      disabled={creating || !newCompanyName.trim()}
                    >
                      {creating ? 'Cadastrando...' : 'Salvar Empresa'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
