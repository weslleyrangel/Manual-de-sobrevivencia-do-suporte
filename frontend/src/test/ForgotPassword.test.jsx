import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ForgotPassword } from '../pages/ForgotPassword';

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderForgotPassword = () => {
    return render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };

  it('renderiza o formulário de recuperação de senha com título e campo de email', () => {
    renderForgotPassword();

    expect(screen.getByText('Recuperar acesso')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail cadastrado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar link de redefinição/i })).toBeInTheDocument();
  });

  it('envia link e exibe mensagem de sucesso com instruções', async () => {
    renderForgotPassword();

    const emailInput = screen.getByLabelText('E-mail cadastrado');
    fireEvent.change(emailInput, { target: { value: 'agente@empresa.com' } });

    const submitBtn = screen.getByRole('button', { name: /enviar link de redefinição/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Enviando instruções...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Verifique sua caixa de entrada')).toBeInTheDocument();
      expect(screen.getByText(/agente@empresa\.com/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /voltar para o login/i })).toBeInTheDocument();
    });
  });
});
