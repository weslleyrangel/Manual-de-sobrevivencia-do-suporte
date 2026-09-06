import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Icon } from '../../components/common/Icons';
import { useToast } from '../../context/ToastContext';
import './AdminDashboard.css';

export const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await api.getAdminStats();
            setStats(data);
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
            showToast('Erro ao carregar métricas administrativas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const totalUsers = stats?.users?.total_users || 0;
    const verifiedUsers = stats?.users?.verified_users || 0;
    const totalProblems = stats?.problems?.total_problems || 0;
    const solvedProblems = stats?.problems?.solved_problems || 0;
    const openProblems = stats?.problems?.open_problems || 0;
    const totalSolutions = stats?.solutions?.total_solutions || 0;

    const resolutionRate = totalProblems > 0 
        ? Math.round((solvedProblems / totalProblems) * 100) 
        : 0;

    const maxCategoryCount = stats?.categories?.length > 0 
        ? Math.max(...stats.categories.map(c => c.count)) 
        : 1;

    return (
        <div className="admin-dashboard">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Visão Geral & Métricas</h1>
                    <p className="admin-page-desc">Painel de controle e saúde da base de conhecimento de TI.</p>
                </div>
                <button 
                    type="button" 
                    className="admin-refresh-btn" 
                    onClick={fetchStats}
                    disabled={loading}
                >
                    <Icon name="refresh-cw" size={16} />
                    <span>{loading ? 'Atualizando...' : 'Atualizar Dados'}</span>
                </button>
            </div>

            {/* Cards de Métricas Rápidas */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card emerald">
                    <div className="admin-stat-top">
                        <span className="admin-stat-label">Usuários Cadastrados</span>
                        <div className="admin-stat-icon-wrap">
                            <Icon name="users" size={18} color="#10B981" />
                        </div>
                    </div>
                    <div className="admin-stat-value">{totalUsers}</div>
                    <div className="admin-stat-sub">
                        <span className="admin-stat-badge">{verifiedUsers} verificados</span>
                        <span className="admin-stat-badge">{stats?.users?.admin_users || 0} admins</span>
                        <span className="admin-stat-badge">{stats?.users?.tech_users || 0} técnicos</span>
                    </div>
                </div>

                <div className="admin-stat-card blue">
                    <div className="admin-stat-top">
                        <span className="admin-stat-label">Taxa de Resolução</span>
                        <div className="admin-stat-icon-wrap">
                            <Icon name="check-circle" size={18} color="#38BDF8" />
                        </div>
                    </div>
                    <div className="admin-stat-value">{resolutionRate}%</div>
                    <div className="admin-stat-sub">
                        <span className="admin-stat-badge">{solvedProblems} resolvidas</span>
                        <span className="admin-stat-badge">{openProblems} abertas</span>
                    </div>
                </div>

                <div className="admin-stat-card amber">
                    <div className="admin-stat-top">
                        <span className="admin-stat-label">Total de Publicações</span>
                        <div className="admin-stat-icon-wrap">
                            <Icon name="notebook-tabs" size={18} color="#F59E0B" />
                        </div>
                    </div>
                    <div className="admin-stat-value">{totalProblems}</div>
                    <div className="admin-stat-sub">
                        <span className="admin-stat-badge">{stats?.problems?.closed_admin_problems || 0} fechadas admin</span>
                        <span className="admin-stat-badge">{totalSolutions} soluções postadas</span>
                    </div>
                </div>
            </div>

            {/* Widgets de Distribuição e Ações Rápidas */}
            <div className="admin-widgets-row">
                {/* Categorias mais frequentes */}
                <div className="admin-widget-card">
                    <h2 className="admin-widget-title">
                        <Icon name="bar-chart-2" size={18} color="#EBF875" />
                        <span>Publicações por Categoria</span>
                    </h2>

                    <div className="admin-category-list">
                        {stats?.categories && stats.categories.length > 0 ? (
                            stats.categories.map((cat, idx) => {
                                const pct = Math.round((cat.count / maxCategoryCount) * 100);
                                return (
                                    <div key={idx} className="admin-cat-item">
                                        <div className="admin-cat-meta">
                                            <span>{cat.category || 'Sem Categoria'}</span>
                                            <span>{cat.count} posts</span>
                                        </div>
                                        <div className="admin-cat-bar-bg">
                                            <div 
                                                className="admin-cat-bar-fill" 
                                                style={{ width: `${pct}%` }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="admin-empty-state">Nenhuma publicação registrada.</div>
                        )}
                    </div>
                </div>

                {/* Chamados Abertos / Aguardando Solução */}
                <div className="admin-widget-card">
                    <h2 className="admin-widget-title">
                        <Icon name="alert-circle" size={18} color="#F59E0B" />
                        <span>Aguardando Solução Oficial</span>
                    </h2>

                    <div className="admin-pending-list">
                        {stats?.pendingProblems && stats.pendingProblems.length > 0 ? (
                            stats.pendingProblems.map((p) => (
                                <Link 
                                    key={p.id} 
                                    to={`/publication/${p.id}`}
                                    className="admin-pending-item"
                                    title="Clique para inspecionar ou validar solução"
                                >
                                    <div className="admin-pending-info">
                                        <span className="admin-pending-title">{p.title}</span>
                                        <div className="admin-pending-sub">
                                            <span className="admin-tag-pill">{p.category}</span>
                                            <span>Por {p.author_name || 'Usuário'}</span>
                                            <span>· {p.solutions_count} {p.solutions_count === 1 ? 'resposta' : 'respostas'}</span>
                                        </div>
                                    </div>
                                    <Icon name="chevron-right" size={18} color="#A3B899" />
                                </Link>
                            ))
                        ) : (
                            <div className="admin-empty-state">
                                Parabéns! Todos os tópicos recentes possuem solução ou estão resolvidos.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
