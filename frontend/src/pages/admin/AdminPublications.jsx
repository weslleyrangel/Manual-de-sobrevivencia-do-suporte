import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Icon } from '../../components/common/Icons';
import { useToast } from '../../context/ToastContext';
import './AdminUsers.css';
import './AdminPublications.css';

const CATEGORIES = [
    'ALL',
    'Atendimento',
    'Ferramentas',
    'Processos',
    'Redes',
    'Sistemas',
    'Segurança',
    'Hardware',
    'Banco de Dados'
];

export const AdminPublications = () => {
    const [problems, setProblems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [hasSolutionFilter, setHasSolutionFilter] = useState('ALL');

    // Moderate Modal State
    const [editingProblem, setEditingProblem] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editCategory, setEditCategory] = useState('Atendimento');
    const [saving, setSaving] = useState(false);

    const { showToast } = useToast();

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const data = await api.getAdminProblems({
                q: searchQuery,
                category: selectedCategory,
                status: selectedStatus,
                has_solution: hasSolutionFilter === 'ALL' ? undefined : hasSolutionFilter,
                page,
                limit: 10
            });
            setProblems(data.problems || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error('Erro ao buscar publicações:', err);
            showToast('Erro ao carregar publicações', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, [page, selectedCategory, selectedStatus, hasSolutionFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProblems();
    };

    const handleOpenEditModal = (problem) => {
        setEditingProblem(problem);
        setEditTitle(problem.title || '');
        setEditCategory(problem.category || 'Atendimento');
    };

    const handleCloseEditModal = () => {
        setEditingProblem(null);
    };

    const handleSaveProblemModeration = async (e) => {
        e.preventDefault();
        if (!editingProblem) return;
        setSaving(true);
        try {
            await api.moderateAdminProblem(editingProblem.id, {
                title: editTitle,
                category: editCategory
            });
            showToast('Publicação atualizada com sucesso!', 'success');
            handleCloseEditModal();
            fetchProblems();
        } catch (err) {
            showToast(err.message || 'Erro ao moderar publicação', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReopenProblem = async (problem) => {
        if (!window.confirm(`Deseja realmente reabrir a publicação "${problem.title}"?`)) return;

        try {
            await api.moderateAdminProblem(problem.id, { action: 'reopen' });
            showToast('Tópico reaberto com sucesso!', 'success');
            fetchProblems();
        } catch (err) {
            showToast(err.message || 'Erro ao reabrir tópico', 'error');
        }
    };

    const handleDeleteProblem = async (problem) => {
        const confirmMsg = `ATENÇÃO: Deseja realmente excluir a publicação "${problem.title}" e todas as suas soluções associadas? Esta ação é irreversível.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.deleteAdminProblem(problem.id);
            showToast('Publicação excluída com sucesso', 'success');
            fetchProblems();
        } catch (err) {
            showToast(err.message || 'Erro ao excluir publicação', 'error');
        }
    };

    const formatStatusBadge = (p) => {
        const s = (p.status || '').toUpperCase();
        if (s.includes('RESOLVID')) {
            return <span className="admin-status-pill resolved"><Icon name="check-circle" size={12} /> Resolvido</span>;
        }
        if (s.includes('FECHAD') || s.includes('ENCERRAD')) {
            return <span className="admin-status-pill closed-admin"><Icon name="lock" size={12} /> Fechado Admin</span>;
        }
        return <span className="admin-status-pill open"><Icon name="alert-circle" size={12} /> Aberto</span>;
    };

    return (
        <div className="admin-publications-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Gestão de Publicações & Moderação</h1>
                    <p className="admin-page-desc">Supervisão de tópicos, edição rápida, reabertura de chamados e curadoria.</p>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="admin-filters-bar">
                <form onSubmit={handleSearchSubmit} className="admin-search-input-wrap">
                    <Icon name="search" size={16} className="admin-search-icon" />
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Buscar por título ou descrição..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <div className="admin-select-group">
                    <select 
                        className="admin-select"
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                    >
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c === 'ALL' ? 'Todas as Categorias' : c}</option>
                        ))}
                    </select>

                    <select 
                        className="admin-select"
                        value={selectedStatus}
                        onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="RESOLVIDO">Resolvidos</option>
                        <option value="ABERTA">Abertos</option>
                        <option value="FECHADA_ADMINISTRATIVAMENTE">Fechados Admin</option>
                    </select>

                    <select 
                        className="admin-select"
                        value={hasSolutionFilter}
                        onChange={(e) => { setHasSolutionFilter(e.target.value); setPage(1); }}
                    >
                        <option value="ALL">Solução Oficial (Todas)</option>
                        <option value="true">Com Solução Aceita</option>
                        <option value="false">Sem Solução Aceita</option>
                    </select>
                </div>
            </div>

            {/* Tabela de Publicações */}
            <div className="admin-table-card">
                <div className="admin-table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Título & Conteúdo</th>
                                <th>Categoria</th>
                                <th>Autor</th>
                                <th>Status</th>
                                <th>Respostas</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                        Carregando publicações...
                                    </td>
                                </tr>
                            ) : problems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                        Nenhuma publicação encontrada com os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                problems.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ maxWidth: '340px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <Link to={`/publication/${p.id}`} className="admin-problem-link">
                                                    {p.title}
                                                </Link>
                                                {p.closing_reason && (
                                                    <span style={{ fontSize: '11px', color: '#F87171' }}>
                                                        Motivo encerramento: {p.closing_reason}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="admin-tag-pill">{p.category}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: '#DFF3E4' }}>
                                                {p.author_name || 'Usuário'}
                                            </div>
                                        </td>
                                        <td>{formatStatusBadge(p)}</td>
                                        <td>
                                            <div style={{ fontSize: '13px' }}>
                                                {p.accepted_solution_id ? (
                                                    <span className="admin-solution-badge">
                                                        <Icon name="badge-check" size={14} /> {p.solutions_count} (Aceita)
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#8EAA90' }}>
                                                        {p.solutions_count || 0}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-actions-cell">
                                                <Link 
                                                    to={`/publication/${p.id}`}
                                                    className="admin-action-btn"
                                                    title="Ver detalhes da publicação"
                                                >
                                                    <Icon name="eye" size={14} />
                                                    <span>Ver</span>
                                                </Link>

                                                <button
                                                    type="button"
                                                    className="admin-action-btn"
                                                    title="Moderar Título e Categoria"
                                                    onClick={() => handleOpenEditModal(p)}
                                                >
                                                    <Icon name="edit" size={14} />
                                                </button>

                                                {(p.status === 'FECHADA_ADMINISTRATIVAMENTE' || p.status === 'ENCERRADO') && (
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        title="Reabrir tópico"
                                                        onClick={() => handleReopenProblem(p)}
                                                    >
                                                        <Icon name="refresh-cw" size={13} />
                                                        <span>Reabrir</span>
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="admin-action-btn danger"
                                                    title="Excluir publicação"
                                                    onClick={() => handleDeleteProblem(p)}
                                                >
                                                    <Icon name="trash-2" size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="admin-pagination-bar">
                    <span>Mostrando {problems.length} de {total} publicações</span>
                    <div className="admin-page-nav-btns">
                        <button
                            type="button"
                            className="admin-action-btn"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            <Icon name="chevron-left" size={14} /> Anterior
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 600 }}>
                            {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            className="admin-action-btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            Próximo <Icon name="chevron-right" size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Moderação */}
            {editingProblem && (
                <div className="admin-modal-backdrop" onClick={handleCloseEditModal}>
                    <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
                        <h2 className="admin-modal-title">Moderar Publicação #{editingProblem.id}</h2>
                        
                        <form onSubmit={handleSaveProblemModeration} className="admin-modal-form">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Título da Publicação</label>
                                <input
                                    type="text"
                                    className="admin-form-input"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Título claro e descritivo"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Categoria</label>
                                <select 
                                    className="admin-select"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                >
                                    {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn-cancel" onClick={handleCloseEditModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="admin-btn-save" disabled={saving}>
                                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPublications;
