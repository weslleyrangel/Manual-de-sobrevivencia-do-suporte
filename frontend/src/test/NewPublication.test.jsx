import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import { NewPublication } from '../pages/NewPublication';

describe('NewPublication Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderNewPub = () => {
    return render(
      <ToastProvider>
        <BrowserRouter>
          <NewPublication />
        </BrowserRouter>
      </ToastProvider>
    );
  };

  it('renderiza o formulário de criação com título, categoria e textarea de conteúdo', () => {
    renderNewPub();

    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição e Contexto/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 1\.200/)).toBeInTheDocument();
  });

  it('permite adicionar e remover passos no tutorial', () => {
    renderNewPub();

    expect(screen.getByText('Passo 1')).toBeInTheDocument();
    expect(screen.queryByText('Passo 2')).not.toBeInTheDocument();

    const addStepBtn = screen.getByRole('button', { name: /adicionar outr/i });
    fireEvent.click(addStepBtn);

    expect(screen.getByText('Passo 2')).toBeInTheDocument();

    const removeBtns = screen.getAllByLabelText('Remover passo');
    expect(removeBtns.length).toBeGreaterThan(0);
    fireEvent.click(removeBtns[0]);

    expect(screen.queryByText('Passo 2')).not.toBeInTheDocument();
  });

  it('valida título obrigatório ao clicar em publicar agora sem preencher', () => {
    renderNewPub();

    const publishBtn = screen.getByRole('button', { name: /publicar agora/i });
    fireEvent.click(publishBtn);

    expect(screen.getByText('Por favor, digite um título para a publicação.')).toBeInTheDocument();
  });
});
