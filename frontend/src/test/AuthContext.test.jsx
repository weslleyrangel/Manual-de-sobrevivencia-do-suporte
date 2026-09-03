import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthContext, AuthProvider } from '../context/AuthContext';

const TestConsumer = () => {
  const { isAuthenticated, user, login, logout, loading } = useContext(AuthContext);
  if (loading) return <div>Carregando sessão...</div>;
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'Autenticado' : 'Desconectado'}</span>
      <span data-testid="user-name">{user?.name || 'Sem usuário'}</span>
      <button onClick={login}>Fazer Login</button>
      <button onClick={logout}>Fazer Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('inicia carregando e busca sessão em /api/v1/auth/me', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 1, name: 'Ana Martins' } })
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText('Carregando sessão...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Ana Martins');
    });
  });

  it('trata falha de autenticação quando /me retorna não autorizado', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Desconectado');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Sem usuário');
    });
  });

  it('permite login manual e logout com limpeza de estado', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/v1/auth/me') {
        return Promise.resolve({ ok: false });
      }
      if (url === '/api/v1/auth/logout') {
        return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error('URL não mapeada'));
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Desconectado');
    });

    // Clica em login
    act(() => {
      screen.getByText('Fazer Login').click();
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');

    // Clica em logout
    await act(async () => {
      screen.getByText('Fazer Logout').click();
    });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Desconectado');
  });
});
