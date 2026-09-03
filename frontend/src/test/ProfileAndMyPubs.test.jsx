import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Profile } from '../pages/Profile';
import { MyPublications } from '../pages/MyPublications';

describe('Profile and MyPublications Pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Profile exibe métricas e atalhos de navegação rápida', () => {
    const mockUser = { name: 'Wesley Rangel', role: 'Especialista N2' };

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Wesley Rangel')).toBeInTheDocument();
    expect(screen.getByText('Especialista N2')).toBeInTheDocument();
    expect(screen.getByText('publicações')).toBeInTheDocument();
    expect(screen.getByText('curtidas')).toBeInTheDocument();
    expect(screen.getByText('salvos')).toBeInTheDocument();
    expect(screen.getByText('Minhas publicações')).toBeInTheDocument();
    expect(screen.getByText('Criar publicação')).toBeInTheDocument();
  });

  it('MyPublications filtra publicações entre Todas, Rascunhos e Publicadas', () => {
    render(
      <BrowserRouter>
        <MyPublications />
      </BrowserRouter>
    );

    expect(screen.getByText('Minhas publicações')).toBeInTheDocument();
    expect(screen.getByText('Como desescalar uma conversa difícil')).toBeInTheDocument();
    expect(screen.getByText('Atalhos de teclado mais úteis no Zendesk / Chat')).toBeInTheDocument();

    // Filtra por Rascunhos
    const draftTab = screen.getByRole('button', { name: 'Rascunhos' });
    fireEvent.click(draftTab);

    expect(screen.getByText('Atalhos de teclado mais úteis no Zendesk / Chat')).toBeInTheDocument();
    expect(screen.queryByText('Como desescalar uma conversa difícil')).not.toBeInTheDocument();

    // Filtra por Publicadas
    const publishedTab = screen.getByRole('button', { name: 'Publicadas' });
    fireEvent.click(publishedTab);

    expect(screen.getByText('Como desescalar uma conversa difícil')).toBeInTheDocument();
    expect(screen.queryByText('Atalhos de teclado mais úteis no Zendesk / Chat')).not.toBeInTheDocument();
  });
});
