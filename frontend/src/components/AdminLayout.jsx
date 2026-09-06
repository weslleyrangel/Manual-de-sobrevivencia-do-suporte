import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { Icon } from './common/Icons';
import './AdminLayout.css';

export const AdminLayout = ({ children }) => {
    return (
        <AppLayout>
            <div className="admin-page-wrapper">
                <div className="admin-page-top-header">
                    <div className="admin-page-heading-group">
                        <div className="admin-title-icon-box">
                            <Icon name="shield-check" size={26} color="#10B981" />
                        </div>
                        <div>
                            <div className="admin-heading-title-row">
                                <h1 className="admin-heading-title">Painel do Administrador</h1>
                                <span className="admin-pill-badge">ADMIN</span>
                            </div>
                            <p className="admin-heading-subtitle">
                                Gestão centralizada de métricas, controle de usuários e moderação de publicações.
                            </p>
                        </div>
                    </div>

                    {/* Sub-Tabs de navegação interna */}
                    <div className="admin-subnav-tabs">
                        <NavLink 
                            to="/admin" 
                            end 
                            className={({ isActive }) => `admin-subnav-btn ${isActive ? 'active' : ''}`}
                        >
                            <Icon name="bar-chart-2" size={16} />
                            <span>Métricas & Dashboard</span>
                        </NavLink>

                        <NavLink 
                            to="/admin/users" 
                            className={({ isActive }) => `admin-subnav-btn ${isActive ? 'active' : ''}`}
                        >
                            <Icon name="users" size={16} />
                            <span>Gestão de Usuários</span>
                        </NavLink>

                        <NavLink 
                            to="/admin/publications" 
                            className={({ isActive }) => `admin-subnav-btn ${isActive ? 'active' : ''}`}
                        >
                            <Icon name="notebook-tabs" size={16} />
                            <span>Publicações & Moderação</span>
                        </NavLink>
                    </div>
                </div>

                <div className="admin-page-body">
                    {children ? children : <Outlet />}
                </div>
            </div>
        </AppLayout>
    );
};

export default AdminLayout;
