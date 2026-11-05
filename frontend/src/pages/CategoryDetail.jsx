import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Icon } from '../components/common/Icons';
import { api } from '../services/api';
import './CategoryDetail.css';

export const CategoryDetail = () => {
  const { companyId, categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const sectorId = searchParams.get('sector_id');

  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);
  const { showToast } = useToast();

  const decodedCategory = decodeURIComponent(categoryName || '');

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Barra de Pesquisa dentro dos casos da Categoria
  const [query, setQuery] = useState('');

  // Estado para exclusão (Admin)
  const [deletingId, setDeletingId] = useState(null);

  const loadProblems = () => {
    setLoading(true);
    const params = { category: decodedCategory, limit: 100 };
    if (sectorId) params.sector_id = sectorId;

    const request = companyId
      ? api.getCompanyProblems(companyId, params)
      : api.getProblems(params);

    request
      .then((data) => {
        setProblems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Erro ao carregar casos da categoria', err);
        setError('Não foi possível carregar os casos desta categoria.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProblems();
  }, [companyId, decodedCategory, sectorId]);

  // Filtragem dos casos em tempo real pela barra de pesquisa
  const filteredProblems = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return problems;
    return problems.filter((prob) => {
      const title = (prob.title || '').toLowerCase();
      const desc = (prob.description || '').toLowerCase();
      const author = (prob.author_name || '').toLowerCase();
      const sector = (prob.sector_name || '').toLowerCase();
      return (
        title.includes(term) ||
        desc.includes(term) ||
        author.includes(term) ||
        sector.includes(term)
      );
    });
  }, [problems, query]);

  const handleDelete = async (e, id, title) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmMsg = `Tem certeza que deseja apagar o caso "${title}"? Esta ação não pode ser desfeita.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(id);
    try {
      await api.deleteProblem(id);
      showToast('Caso apagado com sucesso!', 'success');
      setProblems((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      showToast(err.message || 'Erro ao apagar caso.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBack = () => {
    if (companyId) {
      navigate(`/company/${companyId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <AppLayout>
      <div className="catdetail-screen-wrapper">
        <div className="catdetail-content">
          {/* Navegação de Retorno Aprimorada */}
          <div className="catdetail-top-nav">
            <button
              type="button"
              className="catdetail-back-btn pressable"
              onClick={handleBack}
              aria-label={companyId ? 'Voltar para Empresa' : 'Voltar para Categorias'}
            >
              <span className="back-icon-wrapper">
                <Icon name="arrow-left" size={16} />
              </span>
              <span className="back-btn-text">
                {companyId ? 'Voltar para Empresa' : 'Voltar para Categorias'}
              </span>
            </button>
          </div>

          {/* Barra de Pesquisa dentro dos Casos da Categoria */}
          <div className="home-search-bar catdetail-search-bar">
            <Icon name="search" size={20} color="var(--green-leaf)" />
            <input
              type="search"
              className="home-search-input"
              placeholder={`Pesquisar casos em ${decodedCategory}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Pesquisar casos em ${decodedCategory}`}
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
          </div>

          {/* Cabeçalho da Categoria */}
          <header className="catdetail-header">
            <span className="catdetail-eyebrow">CATEGORIA</span>
            <h1 className="catdetail-title">{decodedCategory}</h1>
            <p className="catdetail-subtitle">
              {loading
                ? 'Buscando casos cadastrados...'
                : query.trim().length > 0
                  ? `${filteredProblems.length} de ${problems.length} ${problems.length === 1 ? 'caso encontrado' : 'casos encontrados'}`
                  : `${problems.length} ${problems.length === 1 ? 'caso documentado' : 'casos documentados'}`}
            </p>
          </header>

          {/* Lista de Casos */}
          <main className="catdetail-list-wrapper">
            {loading && <p className="catdetail-status">Carregando casos...</p>}
            {error && !loading && <p className="catdetail-status catdetail-status-error">{error}</p>}

            {!loading && !error && problems.length === 0 && (
              <div className="catdetail-empty-box">
                <p className="catdetail-status">Nenhum caso cadastrado nesta categoria ainda.</p>
                <Link to="/new-publication" className="catdetail-create-link pressable">
                  <Icon name="plus" size={16} color="#FFFFFF" />
                  <span>Criar primeiro caso</span>
                </Link>
              </div>
            )}

            {!loading && !error && problems.length > 0 && filteredProblems.length === 0 && (
              <div className="catdetail-empty-box">
                <p className="catdetail-status">
                  Nenhum caso encontrado para "<strong>{query.trim()}</strong>" nesta categoria.
                </p>
                <button
                  type="button"
                  className="catdetail-back-btn pressable"
                  onClick={() => setQuery('')}
                >
                  Limpar pesquisa
                </button>
              </div>
            )}

            {!loading && filteredProblems.length > 0 && (
              <div className="catdetail-items-list">
                {filteredProblems.map((prob) => (
                  <div key={prob.id} className="catdetail-item-row">
                    <Link
                      to={`/publication/${prob.id}`}
                      className="catdetail-item-card pressable"
                    >
                      <div className="catdetail-item-left">
                        <div className="catdetail-item-header">
                          <span className="catdetail-item-status">{prob.status || 'RESOLVIDO'}</span>
                          {prob.sector_name && (
                            <span className="catdetail-item-sector">{prob.sector_name}</span>
                          )}
                          {prob.views_count !== undefined && (
                            <span className="catdetail-item-views">
                              {prob.views_count} visualizações
                            </span>
                          )}
                        </div>
                        <h2 className="catdetail-item-title">{prob.title}</h2>
                        {prob.description && (
                          <p className="catdetail-item-desc">
                            {prob.description.length > 130
                              ? `${prob.description.slice(0, 130)}...`
                              : prob.description}
                          </p>
                        )}
                        <span className="catdetail-item-author">
                          Por {prob.author_name || 'Especialista de TI'}
                        </span>
                      </div>
                      <div className="catdetail-item-arrow">
                        <Icon name="chevron-right" size={20} color="var(--green-leaf)" />
                      </div>
                    </Link>

                    {/* Botão de Excluir para ADMIN */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, prob.id, prob.title)}
                        disabled={deletingId === prob.id}
                        className="catdetail-delete-btn pressable"
                        title="Apagar este caso"
                        aria-label={`Apagar caso ${prob.title}`}
                      >
                        <Icon name="trash-2" size={18} color="#EF4444" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </AppLayout>
  );
};
