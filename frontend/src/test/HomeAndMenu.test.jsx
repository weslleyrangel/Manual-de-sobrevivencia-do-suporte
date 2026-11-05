import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home } from '../pages/Home';
import { Menu } from '../pages/Menu';
import { api } from '../services/api';

describe('Home and Menu Pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('Home exibe os cards das empresas e botão de nova empresa para Admin', async () => {
    vi.spyOn(api, 'getCompanies').mockResolvedValue([
      { id: 1, name: 'MEJC', problems_count: 33, categories_count: 8, sectors_count: 4 }
    ]);

    render(
      <AuthContext.Provider value={{ user: { name: 'Weslley Rangel', role: 'ADMIN' }, isAdmin: true }}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByRole('heading', { name: 'MEJC' })).toBeInTheDocument();
    expect(screen.getByText(/33 casos/i)).toBeInTheDocument();
    expect(screen.getByText(/8 categorias/i)).toBeInTheDocument();

    // Botão de cadastrar empresa exclusivo para Admin
    expect(screen.getByRole('button', { name: /^Nova Empresa$/i })).toBeInTheDocument();

    // Ações principais do topo
    expect(screen.getByLabelText('Pesquisar casos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Meu Perfil/i })).toHaveAttribute('href', '/profile');
  });

  it('Home exibe resultados diretos ao pesquisar por termo', async () => {
    vi.spyOn(api, 'getCompanies').mockResolvedValue([
      { id: 1, name: 'MEJC', problems_count: 33, categories_count: 8 }
    ]);
    const searchSpy = vi.spyOn(api, 'search').mockResolvedValue([
      { id: 2, title: 'VPN com MFA', category: 'Redes', snippet: 'Configuração Wireguard' },
    ]);

    render(
      <AuthContext.Provider value={{ user: null }}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    await screen.findByRole('heading', { name: 'MEJC' });
    fireEvent.change(screen.getByLabelText('Pesquisar casos'), { target: { value: 'vpn' } });

    await waitFor(() => expect(searchSpy).toHaveBeenCalledWith('vpn'));
    expect(await screen.findByText('VPN com MFA')).toBeInTheDocument();
    expect(screen.getByText('Configuração Wireguard')).toBeInTheDocument();
  });

  it('Menu exibe perfil do usuário e permite alternar o tema Dark Mode', () => {
    const mockUser = { name: 'Ana Martins', role: 'Analista de suporte' };

    render(
      <AuthContext.Provider value={{ user: mockUser, logout: vi.fn() }}>
        <BrowserRouter>
          <Menu />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Ana Martins')).toBeInTheDocument();
    expect(screen.getByText('Analista de suporte')).toBeInTheDocument();

    const toggleBtn = screen.getByLabelText('Alternar modo escuro');
    expect(toggleBtn).toBeInTheDocument();

    // Liga dark mode
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByText(/Modo Escuro/i)).toBeInTheDocument();

    // Desliga dark mode
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('Menu dispara logout ao clicar em sair da conta', async () => {
    const mockLogout = vi.fn().mockResolvedValue();
    render(
      <AuthContext.Provider value={{ user: null, logout: mockLogout }}>
        <BrowserRouter>
          <Menu />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const logoutBtn = screen.getByRole('button', { name: /sair da conta/i });
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
  });
});
