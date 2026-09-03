import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Search } from '../pages/Search';

describe('Search Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderSearch = () => {
    return render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );
  };

  it('renderiza o campo de busca, temas e sugestões iniciais', () => {
    renderSearch();

    expect(screen.getByPlaceholderText('Como acalmar um cliente?')).toBeInTheDocument();
    expect(screen.getByText('Pesquisas recentes')).toBeInTheDocument();
    expect(screen.getByText('Explore por tema')).toBeInTheDocument();
    expect(screen.getByText('Atendimento')).toBeInTheDocument();
    expect(screen.getByText('Processos')).toBeInTheDocument();
    expect(screen.getByText('Ferramentas')).toBeInTheDocument();
  });

  it('filtra os artigos dinamicamente ao digitar termo de busca', () => {
    renderSearch();

    const input = screen.getByPlaceholderText('Como acalmar um cliente?');
    fireEvent.change(input, { target: { value: 'redefinição' } });

    // Se não encontrar artigos com esse termo exato
    expect(screen.getByText(/Nenhum artigo encontrado para/i)).toBeInTheDocument();

    // Busca por termo existente
    fireEvent.change(input, { target: { value: 'irritado' } });
    expect(screen.getByText('Como lidar com um cliente irritado')).toBeInTheDocument();
    expect(screen.getByText(/Resultados \(1\)/i)).toBeInTheDocument();
  });

  it('permite limpar a busca digitada com o botão de limpar', () => {
    renderSearch();

    const input = screen.getByPlaceholderText('Como acalmar um cliente?');
    fireEvent.change(input, { target: { value: 'irritado' } });
    expect(input.value).toBe('irritado');

    const clearBtn = screen.getByLabelText('Limpar texto');
    fireEvent.click(clearBtn);

    expect(input.value).toBe('');
    expect(screen.getByText('Pesquisas recentes')).toBeInTheDocument();
  });

  it('permite limpar o histórico de buscas recentes', () => {
    renderSearch();

    expect(screen.getByText('Política de reembolso')).toBeInTheDocument();
    const clearHistoryBtn = screen.getByRole('button', { name: /limpar/i });

    fireEvent.click(clearHistoryBtn);

    expect(screen.queryByText('Pesquisas recentes')).not.toBeInTheDocument();
  });
});
