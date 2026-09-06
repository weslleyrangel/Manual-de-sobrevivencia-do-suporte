import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import { PublicationDetail } from '../pages/PublicationDetail';
import { api } from '../services/api';

const mockProblem = {
  id: 1,
  author_id: 1,
  title: 'Falha na autenticação VPN WireGuard',
  category: 'Redes',
  status: 'RESOLVIDO',
  description: 'Usuários não conseguiam conectar devido a conflito de rotas.',
  likes_count: 24,
  author_name: 'Weslley Rangel',
  author_role: 'Especialista em Redes',
  created_at: new Date().toISOString(),
  solutions: [
    {
      id: 101,
      author_id: 2,
      author_name: 'Ana Martins',
      author_role: 'Analista de Suporte',
      content: 'Reiniciar o serviço de roteamento resolveu o problema.',
      steps: ['1. Reinicie o serviço Wireguard'],
      is_primary: true
    }
  ]
};

vi.mock('../services/api', () => ({
  api: {
    getProblemById: vi.fn(() => Promise.resolve(mockProblem)),
    addSolution: vi.fn(() => Promise.resolve({ id: 102 })),
    acceptSolution: vi.fn(() => Promise.resolve({ message: 'OK' })),
    unacceptSolution: vi.fn(() => Promise.resolve({ message: 'OK' })),
    editSolution: vi.fn(() => Promise.resolve({ message: 'OK' })),
    closeProblemAdmin: vi.fn(() => Promise.resolve({ message: 'OK' }))
  }
}));

describe('PublicationDetail Page', () => {
  beforeEach(() => {
    api.getProblemById.mockImplementation(() => Promise.resolve(mockProblem));
    api.addSolution.mockImplementation(() => Promise.resolve({ id: 102 }));
  });

  const renderDetail = (id = '1') => {
    return render(
      <ToastProvider>
        <AuthContext.Provider value={{
          user: { id: 1, name: 'Weslley Rangel', role: 'ADMIN' },
          isAuthenticated: true,
          isVerified: true,
          isAdmin: true,
          isAuthor: (authorId) => String(authorId) === '1'
        }}>
          <MemoryRouter initialEntries={[`/publication/${id}`]}>
            <Routes>
              <Route path="/publication/:id" element={<PublicationDetail />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    );
  };

  it('renderiza os detalhes do artigo real da API', async () => {
    renderDetail('1');

    await waitFor(() => {
      expect(screen.getByText('Falha na autenticação VPN WireGuard')).toBeInTheDocument();
      expect(screen.getByText('DESCRIÇÃO DO PROCEDIMENTO / PROBLEMA')).toBeInTheDocument();
      expect(screen.getAllByText('Ana Martins').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Reiniciar o serviço de roteamento resolveu o problema.').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('alterna o botão de Útil/Like incrementando e decrementando a contagem', async () => {
    renderDetail('1');

    await waitFor(() => {
      expect(screen.getByText(/24 útil/i)).toBeInTheDocument();
    });

    const likeBtn = screen.getByRole('button', { name: /24 útil/i });
    fireEvent.click(likeBtn);
    expect(screen.getByText(/25 Útil/i)).toBeInTheDocument();

    fireEvent.click(likeBtn);
    expect(screen.getByText(/24 Útil/i)).toBeInTheDocument();
  });

  it('alterna o botão de Salvo/Salvar', async () => {
    renderDetail('1');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveBtn);
    expect(screen.getByText(/salvo/i)).toBeInTheDocument();
  });

  it('permite adicionar uma nova solução/resposta real à lista', async () => {
    renderDetail('1');

    await waitFor(() => {
      expect(screen.getAllByText('Ana Martins').length).toBeGreaterThanOrEqual(1);
    });

    const input = screen.getByPlaceholderText(/escreva uma resposta ou solução/i);
    const submitBtn = screen.getByRole('button', { name: /enviar/i });

    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Procedimento validado com sucesso pela equipe.' } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Procedimento validado com sucesso pela equipe.')).toBeInTheDocument();
      expect(input.value).toBe('');
    });
  });
});
