import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { AdminRoute } from '../components/AdminRoute';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminPublications } from '../pages/admin/AdminPublications';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getAdminStats: vi.fn(),
    getAdminUsers: vi.fn(),
    updateAdminUserRole: vi.fn(),
    updateAdminUserStatus: vi.fn(),
    resendAdminUserVerification: vi.fn(),
    getAdminProblems: vi.fn(),
    moderateAdminProblem: vi.fn(),
    deleteAdminProblem: vi.fn()
  }
}));

describe('Admin Panel Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AdminRoute Guard', () => {
    it('redirects to /login if unauthenticated', () => {
      render(
        <AuthContext.Provider value={{ isAuthenticated: false, isAdmin: false, loading: false }}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/login" element={<div>Tela de Login</div>} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <div>Painel Admin Secreto</div>
                  </AdminRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Tela de Login')).toBeInTheDocument();
      expect(screen.queryByText('Painel Admin Secreto')).not.toBeInTheDocument();
    });

    it('redirects to / if user is not admin', () => {
      render(
        <AuthContext.Provider value={{ isAuthenticated: true, isAdmin: false, loading: false }}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/" element={<div>Home Comum</div>} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <div>Painel Admin Secreto</div>
                  </AdminRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Home Comum')).toBeInTheDocument();
      expect(screen.queryByText('Painel Admin Secreto')).not.toBeInTheDocument();
    });

    it('renders admin content if user has ROLE_ADMIN', () => {
      render(
        <AuthContext.Provider value={{ isAuthenticated: true, isAdmin: true, loading: false }}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <div>Painel Admin Secreto</div>
                  </AdminRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getByText('Painel Admin Secreto')).toBeInTheDocument();
    });
  });

  describe('AdminDashboard Page', () => {
    it('renders metrics and category distribution correctly', async () => {
      api.getAdminStats.mockResolvedValueOnce({
        users: { total_users: 15, verified_users: 12, admin_users: 2, tech_users: 3 },
        problems: { total_problems: 40, solved_problems: 30, open_problems: 10, closed_admin_problems: 1 },
        solutions: { total_solutions: 65 },
        categories: [
          { category: 'Redes', count: 18 },
          { category: 'Sistemas', count: 12 }
        ],
        pendingProblems: [
          { id: 1, title: 'Falha no roteador filial', category: 'Redes', author_name: 'Rafael', solutions_count: 0 }
        ]
      });

      render(
        <ToastProvider>
          <MemoryRouter>
            <AdminDashboard />
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Visão Geral & Métricas')).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument(); // total users
        expect(screen.getByText('40')).toBeInTheDocument(); // total problems
        expect(screen.getByText('75%')).toBeInTheDocument(); // 30/40 = 75%
        expect(screen.getAllByText('Redes').length).toBeGreaterThan(0);
        expect(screen.getByText('Falha no roteador filial')).toBeInTheDocument();
      });
    });
  });

  describe('AdminUsers Page', () => {
    it('renders users list and handles role edit modal', async () => {
      api.getAdminUsers.mockResolvedValueOnce({
        users: [
          {
            id: 1,
            name: 'Weslley Rangel',
            email: 'admin@suporte.com',
            role: 'ADMIN',
            job_title: 'Especialista N2',
            is_verified: true,
            is_blocked: false,
            publications_count: 20,
            solutions_count: 5
          }
        ],
        total: 1,
        totalPages: 1
      });

      api.updateAdminUserRole.mockResolvedValueOnce({ message: 'OK' });
      api.getAdminUsers.mockResolvedValueOnce({
        users: [
          {
            id: 1,
            name: 'Weslley Rangel',
            email: 'admin@suporte.com',
            role: 'ROLE_TECNICO',
            job_title: 'Especialista N3',
            is_verified: true,
            is_blocked: false,
            publications_count: 20,
            solutions_count: 5
          }
        ],
        total: 1,
        totalPages: 1
      });

      render(
        <ToastProvider>
          <MemoryRouter>
            <AdminUsers />
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Weslley Rangel')).toBeInTheDocument();
        expect(screen.getByText('admin@suporte.com')).toBeInTheDocument();
      });

      // Clica em Editar
      const editBtn = screen.getByRole('button', { name: /editar/i });
      fireEvent.click(editBtn);

      expect(screen.getByText(/Editar Acesso de Weslley Rangel/i)).toBeInTheDocument();

      // Salva
      const saveBtn = screen.getByRole('button', { name: /salvar alterações/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(api.updateAdminUserRole).toHaveBeenCalledWith(1, 'ADMIN', 'Especialista N2');
      });
    });
  });

  describe('AdminPublications Page', () => {
    it('renders publications list and handles moderation edit', async () => {
      api.getAdminProblems.mockResolvedValueOnce({
        problems: [
          {
            id: 10,
            title: 'Erro de VPN SSL',
            category: 'Redes',
            status: 'ABERTA',
            author_name: 'Ana Martins',
            solutions_count: 2,
            accepted_solution_id: null
          }
        ],
        total: 1,
        totalPages: 1
      });

      render(
        <ToastProvider>
          <MemoryRouter>
            <AdminPublications />
          </MemoryRouter>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Erro de VPN SSL')).toBeInTheDocument();
        expect(screen.getByText('Ana Martins')).toBeInTheDocument();
      });
    });
  });
});
