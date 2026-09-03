import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Login } from '../pages/Login';

const renderLogin = (loginFn = vi.fn()) => {
  return render(
    <AuthContext.Provider value={{ login: loginFn }}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza os campos de formulário, títulos e botão de entrar', () => {
    renderLogin();

    expect(screen.getByText('Pronto para mais um turno?')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail de trabalho')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar no manual/i })).toBeInTheDocument();
    expect(screen.getByText('Lembrar de mim')).toBeInTheDocument();
  });

  it('permite alternar visibilidade da senha no botão do olho', () => {
    renderLogin();

    const passwordInput = screen.getByLabelText('Senha');
    const toggleBtn = screen.getByLabelText('Alternar visibilidade da senha');

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submete credenciais e chama login() em caso de sucesso', async () => {
    const mockLogin = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 1, email: 'teste@empresa.com' } })
    });

    renderLogin(mockLogin);

    fireEvent.change(screen.getByLabelText('E-mail de trabalho'), {
      target: { value: 'suporte@empresa.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar no manual/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'suporte@empresa.com', password: 'senha123' })
      }));
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('exibe mensagem de erro quando a API rejeita as credenciais', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'E-mail ou senha incorretos' })
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText('E-mail de trabalho'), {
      target: { value: 'errado@empresa.com' }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'errada' }
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar no manual/i }));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha incorretos')).toBeInTheDocument();
    });
  });
});
