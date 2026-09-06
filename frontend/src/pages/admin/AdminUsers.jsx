import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Icon } from '../../components/common/Icons';
import { useToast } from '../../context/ToastContext';
import './AdminUsers.css';

export const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editRole, setEditRole] = useState('MEMBER');
    const [editJobTitle, setEditJobTitle] = useState('');
    const [saving, setSaving] = useState(false);

    const { showToast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getAdminUsers({
                q: searchQuery,
                role: selectedRole,
                status: selectedStatus,
                page,
                limit: 10
            });
            setUsers(data.users || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            showToast('Erro ao listar usuários', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, selectedRole, selectedStatus]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setEditRole(user.role || 'MEMBER');
        setEditJobTitle(user.job_title || '');
    };

    const handleCloseEditModal = () => {
        setEditingUser(null);
    };

    const handleSaveUserRole = async (e) => {
        e.preventDefault();
        if (!editingUser) return;
        setSaving(true);
        try {
            await api.updateAdminUserRole(editingUser.id, editRole, editJobTitle);
            showToast('Perfil do usuário atualizado com sucesso!', 'success');
            handleCloseEditModal();
            fetchUsers();
        } catch (err) {
            showToast(err.message || 'Erro ao salvar alterações', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleBlock = async (user) => {
        const nextBlocked = !user.is_blocked;
        const confirmMsg = nextBlocked 
            ? `Deseja realmente BLOQUEAR o acesso de ${user.name}?` 
            : `Deseja DESBLOQUEAR o acesso de ${user.name}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            await api.updateAdminUserStatus(user.id, { is_blocked: nextBlocked });
            showToast(nextBlocked ? 'Usuário bloqueado com sucesso' : 'Usuário desbloqueado', 'success');
            fetchUsers();
        } catch (err) {
            showToast(err.message || 'Erro ao alterar status', 'error');
        }
    };

    const handleResendVerification = async (user) => {
        try {
            await api.resendAdminUserVerification(user.id);
            showToast(`E-mail de confirmação enviado para ${user.email}`, 'success');
        } catch (err) {
            showToast(err.message || 'Erro ao reenviar e-mail', 'error');
        }
    };

    const formatRoleBadge = (role) => {
        const r = (role || '').toUpperCase();
        if (r.includes('ADMIN')) {
            return <span className="admin-role-badge admin">ADMIN</span>;
        }
        if (r.includes('MODERATOR') || r.includes('TECNICO')) {
            return <span className="admin-role-badge tech">TÉCNICO</span>;
        }
        return <span className="admin-role-badge member">MEMBRO</span>;
    };

    return (
        <div className="admin-users-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Gestão de Usuários</h1>
                    <p className="admin-page-desc">Controle de acessos, papéis (roles), status de verificação e bloqueios.</p>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="admin-filters-bar">
                <form onSubmit={handleSearchSubmit} className="admin-search-input-wrap">
                    <Icon name="search" size={16} className="admin-search-icon" />
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Buscar por nome, e-mail ou cargo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <div className="admin-select-group">
                    <select 
                        className="admin-select"
                        value={selectedRole}
                        onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
                    >
                        <option value="ALL">Todos os Papéis</option>
                        <option value="ADMIN">Administradores</option>
                        <option value="ROLE_TECNICO">Técnicos (N2/N3)</option>
                        <option value="MEMBER">Membros (N1/Geral)</option>
                    </select>

                    <select 
                        className="admin-select"
                        value={selectedStatus}
                        onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="verified">Verificados</option>
                        <option value="pending">Pendentes</option>
                        <option value="blocked">Bloqueados</option>
                    </select>
                </div>
            </div>

            {/* Tabela de Usuários */}
            <div className="admin-table-card">
                <div className="admin-table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Papel</th>
                                <th>Cargo no Suporte</th>
                                <th>Status</th>
                                <th>Publicações</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                        Carregando usuários...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                                        Nenhum usuário encontrado com os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const initials = u.name
                                        ? u.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                                        : 'U';
                                    return (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="admin-user-cell">
                                                    <div className="admin-user-avatar">{initials}</div>
                                                    <div className="admin-user-info">
                                                        <span className="admin-user-name">{u.name}</span>
                                                        <span className="admin-user-email">{u.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{formatRoleBadge(u.role)}</td>
                                            <td><span style={{ fontSize: '13px', color: '#DFF3E4' }}>{u.job_title || 'Não informado'}</span></td>
                                            <td>
                                                {u.is_blocked ? (
                                                    <span className="admin-status-badge blocked">
                                                        <Icon name="lock" size={14} /> Bloqueado
                                                    </span>
                                                ) : u.is_verified ? (
                                                    <span className="admin-status-badge verified">
                                                        <Icon name="check-circle" size={14} /> Ativo
                                                    </span>
                                                ) : (
                                                    <span className="admin-status-badge pending">
                                                        <Icon name="alert-circle" size={14} /> Pendente
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '13px', color: '#A3B899' }}>
                                                    {u.publications_count || 0} posts · {u.solutions_count || 0} soluções
                                                </span>
                                            </td>
                                            <td>
                                                <div className="admin-actions-cell">
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        title="Editar Papel e Cargo"
                                                        onClick={() => handleOpenEditModal(u)}
                                                    >
                                                        <Icon name="edit" size={14} />
                                                        <span>Editar</span>
                                                    </button>

                                                    {!u.is_verified && (
                                                        <button
                                                            type="button"
                                                            className="admin-action-btn"
                                                            title="Reenviar e-mail de ativação"
                                                            onClick={() => handleResendVerification(u)}
                                                        >
                                                            <Icon name="refresh-cw" size={13} />
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className={`admin-action-btn ${u.is_blocked ? '' : 'danger'}`}
                                                        title={u.is_blocked ? 'Desbloquear acesso' : 'Bloquear usuário'}
                                                        onClick={() => handleToggleBlock(u)}
                                                    >
                                                        <Icon name={u.is_blocked ? 'unlock' : 'lock'} size={14} />
                                                        <span>{u.is_blocked ? 'Desbloquear' : 'Bloquear'}</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="admin-pagination-bar">
                    <span>Mostrando {users.length} de {total} usuários</span>
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

            {/* Modal de Edição de Papel / Cargo */}
            {editingUser && (
                <div className="admin-modal-backdrop" onClick={handleCloseEditModal}>
                    <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
                        <h2 className="admin-modal-title">Editar Acesso de {editingUser.name}</h2>
                        
                        <form onSubmit={handleSaveUserRole} className="admin-modal-form">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Papel / Nível de Acesso</label>
                                <select 
                                    className="admin-select"
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                >
                                    <option value="MEMBER">Membro / Analista Comum</option>
                                    <option value="ROLE_TECNICO">Técnico / Especialista N2/N3</option>
                                    <option value="ADMIN">Administrador (Controle Total)</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Título Profissional / Cargo</label>
                                <input
                                    type="text"
                                    className="admin-form-input"
                                    value={editJobTitle}
                                    onChange={(e) => setEditJobTitle(e.target.value)}
                                    placeholder="Ex: Analista de Suporte · Nível 2"
                                />
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

export default AdminUsers;
