import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CategoryDetail } from '../pages/CategoryDetail';
import { api } from '../services/api';

describe('CategoryDetail Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exibe os casos cadastrados da categoria e link para os detalhes do caso', async () => {
    vi.spyOn(api, 'getProblems').mockResolvedValue([
      {
        id: 10,
        title: 'Mapeamento de impressoras de rede',
        category: 'Ferramentas',
        description: 'Script para mapear filas de impressão corretas por setor',
        status: 'RESOLVIDO',
        views_count: 540,
        author_name: 'Weslley Rangel'
      }
    ]);

    render(
      <MemoryRouter initialEntries={['/category/Ferramentas']}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Carregando casos...')).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Ferramentas' })).toBeInTheDocument();
    expect(screen.getByText('1 caso documentado')).toBeInTheDocument();

    expect(screen.getByText('Mapeamento de impressoras de rede')).toBeInTheDocument();
    expect(screen.getByText(/Script para mapear filas/)).toBeInTheDocument();
    expect(screen.getByText('Por Weslley Rangel')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Mapeamento de impressoras/i });
    expect(link).toHaveAttribute('href', '/publication/10');
  });

  it('permite pesquisar e filtrar casos em tempo real dentro da categoria', async () => {
    vi.spyOn(api, 'getProblems').mockResolvedValue([
      {
        id: 1,
        title: 'Como resetar senha do AD',
        category: 'Atendimento',
        description: 'Procedimento via Active Directory Users and Computers',
        status: 'RESOLVIDO',
        author_name: 'Weslley'
      },
      {
        id: 2,
        title: 'Configurar VPN Cisco AnyConnect',
        category: 'Atendimento',
        description: 'Passo a passo para novos colaboradores em home office',
        status: 'RESOLVIDO',
        author_name: 'Carlos'
      }
    ]);

    render(
      <MemoryRouter initialEntries={['/category/Atendimento']}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Como resetar senha do AD')).toBeInTheDocument();
    expect(screen.getByText('Configurar VPN Cisco AnyConnect')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Pesquisar casos em Atendimento/i);
    expect(searchInput).toBeInTheDocument();

    // Digita 'VPN'
    fireEvent.change(searchInput, { target: { value: 'VPN' } });

    expect(screen.getByText('Configurar VPN Cisco AnyConnect')).toBeInTheDocument();
    expect(screen.queryByText('Como resetar senha do AD')).not.toBeInTheDocument();
    expect(screen.getByText(/1 de 2 casos encontrados/i)).toBeInTheDocument();

    // Limpa a busca
    const clearBtn = screen.getByRole('button', { name: /Limpar busca/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText('Como resetar senha do AD')).toBeInTheDocument();
    expect(screen.getByText('Configurar VPN Cisco AnyConnect')).toBeInTheDocument();
  });

  it('exibe estado vazio quando não há casos na categoria', async () => {
    vi.spyOn(api, 'getProblems').mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/category/Vazia']}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Nenhum caso cadastrado nesta categoria ainda.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Criar primeiro caso/i })).toHaveAttribute('href', '/new-publication');
  });
});
