import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CompanyDetail } from '../pages/CompanyDetail';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';

describe('CompanyDetail Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exibe os setores e categorias da empresa, permitindo alternar setores', async () => {
    vi.spyOn(api, 'getCompanyDetails').mockResolvedValue({
      company: { id: 1, name: 'MEJC' },
      sectors: [
        { id: 1, name: 'Suporte N1' },
        { id: 2, name: 'Redes' }
      ],
      categories: [
        { id: 10, name: 'Atendimento' },
        { id: 11, name: 'Ferramentas' }
      ],
      counts: [
        { category: 'Atendimento', sector_id: 1, count: 5 },
        { category: 'Ferramentas', sector_id: 2, count: 3 }
      ]
    });

    render(
      <AuthContext.Provider value={{ isAdmin: true }}>
        <MemoryRouter initialEntries={['/company/1']}>
          <Routes>
            <Route path="/company/:companyId" element={<CompanyDetail />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(await screen.findByRole('heading', { name: 'MEJC' })).toBeInTheDocument();
    expect(screen.getByText('Suporte N1')).toBeInTheDocument();
    expect(screen.getByText('Redes')).toBeInTheDocument();
    expect(screen.getByText('Atendimento')).toBeInTheDocument();
    expect(screen.getByText('Ferramentas')).toBeInTheDocument();

    // Ações de Admin disponíveis
    expect(screen.getByRole('button', { name: /Novo Setor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nova Categoria/i })).toBeInTheDocument();
  });
});

