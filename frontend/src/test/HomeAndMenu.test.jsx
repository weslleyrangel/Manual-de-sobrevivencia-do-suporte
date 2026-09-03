import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home } from '../pages/Home';
import { Menu } from '../pages/Menu';

describe('Home and Menu Pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('Home exibe saudação contextual com o primeiro nome do usuário', () => {
    const mockUser = { name: 'Mariana Ferreira Silva', role: 'Analista Pleno' };

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Mariana!/i)).toBeInTheDocument();
    expect(screen.getByText('DICA DE SOBREVIVÊNCIA')).toBeInTheDocument();
    expect(screen.getByText('Acesso rápido')).toBeInTheDocument();
    expect(screen.getByText('Primeiros passos')).toBeInTheDocument();
    expect(screen.getByText('Scripts prontos')).toBeInTheDocument();
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
