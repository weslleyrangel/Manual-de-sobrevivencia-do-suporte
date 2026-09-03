import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Register } from '../pages/Register';
import { ProfessionalSetup } from '../pages/ProfessionalSetup';

describe('Register Flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('renderiza os campos da etapa 1 de cadastro', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByText('Vamos te conhecer')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail de trabalho')).toBeInTheDocument();
    expect(screen.getByLabelText('Crie uma senha')).toBeInTheDocument();
    expect(screen.getByText(/ETAPA 1 DE 2/i)).toBeInTheDocument();
  });

  it('salva draft no sessionStorage e avança ao submeter etapa 1 válida', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Carlos Silva' } });
    fireEvent.change(screen.getByLabelText('E-mail de trabalho'), { target: { value: 'carlos@empresa.com' } });
    fireEvent.change(screen.getByLabelText('Crie uma senha'), { target: { value: 'senhaForte123' } });

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    const savedDraft = JSON.parse(sessionStorage.getItem('register_draft') || '{}');
    expect(savedDraft.fullName).toBe('Carlos Silva');
    expect(savedDraft.email).toBe('carlos@empresa.com');
  });

  it('submete etapa 2 (ProfessionalSetup) combinando com o draft e chamando a API', async () => {
    sessionStorage.setItem('register_draft', JSON.stringify({
      fullName: 'Carlos Silva',
      email: 'carlos@empresa.com',
      password: 'senhaForte123'
    }));

    const mockLogin = vi.fn();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 2, name: 'Carlos Silva' } })
    });

    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <BrowserRouter>
          <ProfessionalSetup />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Agora, fale do seu trabalho.')).toBeInTheDocument();
    expect(screen.getByLabelText('Sua área')).toBeInTheDocument();
    expect(screen.getByLabelText('Sua função')).toBeInTheDocument();
    expect(screen.getByLabelText('Nível de experiência')).toBeInTheDocument();

    // Altera opções
    fireEvent.change(screen.getByLabelText('Sua área'), { target: { value: 'Suporte Técnico N1/N2' } });

    fireEvent.click(screen.getByRole('button', { name: /concluir e entrar no manual/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/auth/register', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Carlos Silva',
          email: 'carlos@empresa.com',
          password: 'senhaForte123',
          area: 'Suporte Técnico N1/N2',
          role: 'Analista de suporte',
          level: 'Nível 2 (Pleno)'
        })
      }));
      expect(mockLogin).toHaveBeenCalled();
      expect(sessionStorage.getItem('register_draft')).toBeNull();
    });
  });
});
