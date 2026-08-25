import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import ProblemList from './ProblemList';
import * as offlineStore from '../utils/offlineStore';

// Mock global fetch
global.fetch = vi.fn();

// Mock do módulo offline
vi.mock('../utils/offlineStore', () => ({
    saveProblemsOffline: vi.fn(),
    getOfflineProblems: vi.fn()
}));

beforeEach(() => {
    vi.clearAllMocks();
});

test('ProblemList renders a list of problems fetched from API', async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
            { id: 1, title: 'VPN Caindo', description: 'Cai a cada 5 min' },
            { id: 2, title: 'Impressora Quebrada', description: 'Não liga' }
        ]
    });

    render(<ProblemList />);

    expect(screen.getByText('Carregando catálogo...')).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('VPN Caindo')).toBeInTheDocument();
        expect(screen.getByText('Impressora Quebrada')).toBeInTheDocument();
    });
});

test('ProblemList loads from offline store if fetch fails (Offline Mode)', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch')); // Simula falta de internet
    
    // Simula que o banco local IndexedDB tem um registro antigo salvo
    offlineStore.getOfflineProblems.mockResolvedValueOnce([
        { id: 99, title: 'Cached Problem', description: 'This was saved offline' }
    ]);

    render(<ProblemList />);
    
    await waitFor(() => {
        expect(screen.getByText('Cached Problem')).toBeInTheDocument();
        expect(screen.getByText('⚠️ Você está visualizando o modo Offline.')).toBeInTheDocument();
    });
});
