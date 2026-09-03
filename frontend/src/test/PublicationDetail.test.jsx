import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import { PublicationDetail } from '../pages/PublicationDetail';

describe('PublicationDetail Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderDetail = (id = '1') => {
    return render(
      <ToastProvider>
        <MemoryRouter initialEntries={[`/publication/${id}`]}>
          <Routes>
            <Route path="/publication/:id" element={<PublicationDetail />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renderiza os detalhes do artigo, autor e passos da solução', () => {
    renderDetail('1');

    expect(screen.getByText(/RESOLVIDO/i)).toBeInTheDocument();
    expect(screen.getByText('COMO FOI SOLUCIONADO')).toBeInTheDocument();
    expect(screen.getByText(/Confirmamos o e-mail cadastrado no painel administrativo/i)).toBeInTheDocument();
  });

  it('alterna o botão de Útil/Like incrementando e decrementando a contagem', () => {
    renderDetail('1');

    const likeBtn = screen.getByRole('button', { name: /24 útil/i });
    expect(likeBtn).toBeInTheDocument();

    fireEvent.click(likeBtn);
    expect(screen.getByText(/25 Útil/i)).toBeInTheDocument();

    fireEvent.click(likeBtn);
    expect(screen.getByText(/24 Útil/i)).toBeInTheDocument();
  });

  it('alterna o botão de Salvo/Salvar', () => {
    renderDetail('1');

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);
    expect(screen.getByText(/salvo/i)).toBeInTheDocument();
  });

  it('permite adicionar um novo comentário à lista', () => {
    renderDetail('1');

    expect(screen.getByText('Rafael Costa')).toBeInTheDocument();
    expect(screen.getByText('Mariana Silva')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/escreva um comentário/i);
    const submitBtn = screen.getByRole('button', { name: /enviar/i });

    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Excelente documentação, ajudou muito!' } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    expect(screen.getByText('Excelente documentação, ajudou muito!')).toBeInTheDocument();
    expect(input.value).toBe('');
  });
});
