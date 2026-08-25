import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from '../context/AuthContext';

global.fetch = vi.fn();

const mockLogin = vi.fn();

const renderLogin = () => {
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={{ login: mockLogin }}>
                <Login />
            </AuthContext.Provider>
        </MemoryRouter>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
});

test('Renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Email corporativo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});

test('Displays error message on failed login', async () => {
    fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Credenciais inválidas' })
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email corporativo'), { target: { value: 'errado@suporte.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
        expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
});

test('Calls auth context login on successful authentication', async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Login realizado com sucesso' })
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email corporativo'), { target: { value: 'admin@suporte.com' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith();
    });
});
