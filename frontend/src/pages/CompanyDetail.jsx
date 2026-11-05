import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './CompanyDetail.css';

const getCategoryIcon = (category = '') => {
  const norm = category.toLowerCase();
  if (norm.includes('atendimento')) return 'headphones';
  if (norm.includes('rede')) return 'refresh-cw';
  if (norm.includes('ferramenta')) return 'sliders-horizontal';
  if (norm.includes('processo')) return 'notebook-tabs';
  if (norm.includes('seguran')) return 'shield-check';
  if (norm.includes('sistema')) return 'sliders-horizontal';
  if (norm.includes('hardware')) return 'briefcase-business';
  if (norm.includes('banco') || norm.includes('dados')) return 'notebook-tabs';
  return 'notebook-tabs';
};

export const CompanyDetail = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);
  const { showToast } = useToast();

  const [company, setCompany] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState([]);
  const [selectedSector, setSelectedSector] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Barra de Pesquisa dentro da Empresa/Categorias
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Modais de Criação (Admin)
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    api.getCompanyDetails(companyId)
      .then((data) => {
        setCompany(data.company);
        setSectors(data.sectors || []);
        setCategories(data.categories || []);
        setCounts(data.counts || []);
      })
      .catch((err) => {
        console.error('Erro ao carregar detalhes da empresa', err);
        setError('Não foi possível carregar os dados desta empresa.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Busca instantânea de casos ou categorias dentro da empresa
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSearchResults(null);
      setSearching(false);
      return undefined;
    }

    let ignore = false;
    setSearching(true);
    const timer = setTimeout(() => {
      api.getCompanyProblems(companyId, { q: term })
        .then((data) => {
          if (!ignore) setSearchResults(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (!ignore) setSearchResults([]);
        })
        .finally(() => {
          if (!ignore) setSearching(false);
        });
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, companyId]);

  const handleCreateSector = async (e) => {
    e.preventDefault();
    if (!newSectorName.trim()) return;

    setSubmitting(true);
    try {
      await api.createSector(companyId, newSectorName.trim());
      showToast(`Setor "${newSectorName.trim()}" criado com sucesso!`, 'success');
      setNewSectorName('');
      setIsSectorModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Erro ao criar setor.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSubmitting(true);
    try {
      await api.createCategory(companyId, newCategoryName.trim());
      showToast(`Categoria "${newCategoryName.trim()}" criada com sucesso!`, 'success');
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Erro ao criar categoria.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Calcular contagem de casos por categoria, considerando o setor selecionado
  const getCategoryCount = (categoryName) => {
    return counts
      .filter((c) => {
        const matchCat = c.category?.toLowerCase() === categoryName?.toLowerCase();
        if (!matchCat) return false;
        if (selectedSector === 'all') return true;
        return String(c.sector_id) === String(selectedSector);
      })
      .reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);
  };

  return (
    <AppLayout>
      <div className="compdetail-screen-wrapper">
        <div className="compdetail-content">
          {/* Navegação Voltar Aprimorada */}
          <div className="compdetail-top-nav">
            <button
              type="button"
              className="compdetail-back-btn pressable"
              onClick={() => navigate('/')}
              aria-label="Voltar para Empresas"
            >
              <span className="back-icon-wrapper">
                <Icon name="arrow-left" size={16} />
              </span>
              <span className="back-btn-text">Voltar para Empresas</span>
            </button>
          </div>

          {loading && <p className="home-status">Carregando dados da empresa...</p>}
          {error && !loading && <p className="home-status home-status-error">{error}</p>}

          {!loading && !error && company && (
            <>
              {/* Barra de Pesquisa dentro de Categorias */}
              <div className="home-search-bar">
                <Icon name="search" size={20} color="var(--green-leaf)" />
                <input
                  type="search"
                  className="home-search-input"
                  placeholder={`Pesquisar categorias ou casos em ${company.name}...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Pesquisar em categorias"
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

              {/* MODO 1: Resultados da busca digitada dentro da empresa */}
              {searchResults !== null && (
                <section className="home-search-results-section">
                  <div className="home-results-header">
                    <h2 className="home-results-title">
                      Resultados para "{query.trim()}" em {company.name}
                    </h2>
                    <span className="home-results-count">
                      {searchResults.length} {searchResults.length === 1 ? 'caso' : 'casos'}
                    </span>
                  </div>

                  {searchResults.length === 0 ? (
                    <p className="home-status">
                      Nenhum caso encontrado para "{query.trim()}" nesta empresa.
                    </p>
                  ) : (
                    <div className="home-search-results-list">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="home-search-result-card pressable"
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/publication/${item.id}`)}
                        >
                          <div className="home-result-left">
                            <span className="home-result-category">
                              {item.category || 'GERAL'}
                            </span>
                            <h3 className="home-result-title">{item.title}</h3>
                            {item.description && (
                              <p className="home-result-snippet">
                                {item.description.length > 130
                                  ? `${item.description.slice(0, 130)}...`
                                  : item.description}
                              </p>
                            )}
                          </div>
                          <Icon name="chevron-right" size={20} color="var(--green-leaf)" />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* MODO 2: Visualização Normal de Categorias da Empresa */}
              {searchResults === null && (
                <>
                  {/* Cabeçalho da Empresa */}
                  <header className="compdetail-header">
                    <div className="compdetail-header-left">
                      <span className="compdetail-eyebrow">EMPRESA</span>
                      <h1 className="compdetail-title">{company.name}</h1>
                    </div>

                    {isAdmin && (
                      <div className="compdetail-admin-actions">
                        <button
                          type="button"
                          onClick={() => setIsSectorModalOpen(true)}
                          className="compdetail-action-btn secondary pressable"
                        >
                          <Icon name="plus" size={15} />
                          <span>Novo Setor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(true)}
                          className="compdetail-action-btn primary pressable"
                        >
                          <Icon name="plus" size={15} color="#FFFFFF" />
                          <span>Nova Categoria</span>
                        </button>
                      </div>
                    )}
                  </header>

                  {/* Lista de Setores da Empresa (Sem scroll, responsiva e acessível) */}
                  <section className="compdetail-sectors-section">
                    <div className="sectors-section-header">
                      <div className="sectors-label-group">
                        <Icon name="sliders-horizontal" size={15} color="var(--accent-primary)" />
                        <span className="sectors-section-label">Filtrar por Setor</span>
                      </div>
                      <span className="sectors-count-badge">
                        {sectors.length + 1} opções
                      </span>
                    </div>

                    <div className="sectors-items-list">
                      <button
                        type="button"
                        className={`sector-list-item pressable ${selectedSector === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedSector('all')}
                      >
                        <span className="sector-dot" />
                        <span className="sector-item-text">Todos os setores</span>
                      </button>

                      {sectors.map((sec) => (
                        <button
                          key={sec.id}
                          type="button"
                          className={`sector-list-item pressable ${selectedSector === String(sec.id) ? 'active' : ''}`}
                          onClick={() => setSelectedSector(String(sec.id))}
                        >
                          <span className="sector-dot" />
                          <span className="sector-item-text">{sec.name}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Grid de Cards das Categorias */}
                  <section className="compdetail-categories-section">
                    <div className="category-cards-grid">
                      {categories.map((cat) => {
                        const count = getCategoryCount(cat.name);
                        return (
                          <div
                            key={cat.id || cat.name}
                            className="category-folder-card pressable"
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              const queryParams = selectedSector !== 'all' ? `?sector_id=${selectedSector}` : '';
                              navigate(`/company/${companyId}/category/${encodeURIComponent(cat.name)}${queryParams}`);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                const queryParams = selectedSector !== 'all' ? `?sector_id=${selectedSector}` : '';
                                navigate(`/company/${companyId}/category/${encodeURIComponent(cat.name)}${queryParams}`);
                              }
                            }}
                          >
                            <div className="category-folder-icon-box">
                              <Icon
                                name={getCategoryIcon(cat.name)}
                                size={22}
                                color="var(--accent-primary)"
                              />
                            </div>

                            <div className="category-folder-info">
                              <h2 className="category-folder-name">{cat.name}</h2>
                              <span className="category-folder-count">
                                {count} {count === 1 ? 'caso' : 'casos'}
                              </span>
                            </div>

                            <div className="category-folder-arrow">
                              <Icon name="chevron-right" size={18} color="var(--foreground-muted)" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}
            </>
          )}

          {/* Modal Criar Setor */}
          {isSectorModalOpen && (
            <div className="home-modal-overlay" onClick={() => setIsSectorModalOpen(false)}>
              <div className="home-modal-card animate-fade" onClick={(e) => e.stopPropagation()}>
                <div className="home-modal-header">
                  <h3 className="home-modal-title">Cadastrar Novo Setor</h3>
                  <button
                    type="button"
                    className="home-modal-close-btn"
                    onClick={() => setIsSectorModalOpen(false)}
                    aria-label="Fechar"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>
                <form onSubmit={handleCreateSector} className="home-modal-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="sector-name-input">
                      Nome do Setor
                    </label>
                    <input
                      id="sector-name-input"
                      type="text"
                      className="home-modal-input"
                      placeholder="Ex: Suporte N1, Infraestrutura, RH, Fiscal..."
                      value={newSectorName}
                      onChange={(e) => setNewSectorName(e.target.value)}
                      autoFocus
                      disabled={submitting}
                    />
                  </div>
                  <div className="home-modal-actions">
                    <button
                      type="button"
                      className="home-modal-cancel-btn pressable"
                      onClick={() => setIsSectorModalOpen(false)}
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="home-modal-submit-btn pressable"
                      disabled={submitting || !newSectorName.trim()}
                    >
                      {submitting ? 'Cadastrando...' : 'Salvar Setor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Criar Categoria */}
          {isCategoryModalOpen && (
            <div className="home-modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
              <div className="home-modal-card animate-fade" onClick={(e) => e.stopPropagation()}>
                <div className="home-modal-header">
                  <h3 className="home-modal-title">Cadastrar Nova Categoria</h3>
                  <button
                    type="button"
                    className="home-modal-close-btn"
                    onClick={() => setIsCategoryModalOpen(false)}
                    aria-label="Fechar"
                  >
                    <Icon name="x" size={18} />
                  </button>
                </div>
                <form onSubmit={handleCreateCategory} className="home-modal-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="category-name-input">
                      Nome da Categoria
                    </label>
                    <input
                      id="category-name-input"
                      type="text"
                      className="home-modal-input"
                      placeholder="Ex: Impressoras, Autenticação, Banco de Dados..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      autoFocus
                      disabled={submitting}
                    />
                  </div>
                  <div className="home-modal-actions">
                    <button
                      type="button"
                      className="home-modal-cancel-btn pressable"
                      onClick={() => setIsCategoryModalOpen(false)}
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="home-modal-submit-btn pressable"
                      disabled={submitting || !newCategoryName.trim()}
                    >
                      {submitting ? 'Cadastrando...' : 'Salvar Categoria'}
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

