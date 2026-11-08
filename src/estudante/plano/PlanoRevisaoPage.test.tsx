import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PlanoRevisaoPage from './PlanoRevisaoPage';
import { planoService } from './planoService';
import { ordenarPlano, resumoPlano } from './planoLogic';
import type { PlanoRevisao } from './types';

jest.mock('../../services/apiClient', () => ({ __esModule: true, default: {} }));

const plano: PlanoRevisao = {
  geradoEm: '2026-11-08T12:00:00Z',
  assuntos: [
    { assuntoId: 'a1', nome: 'Funções', disciplina: 'Matemática', motivo: '3 erros nas últimas 2 listas', erros: 3, listas: 2, revisado: true, revisadoEm: '2026-11-07T10:00:00Z' },
    { assuntoId: 'a2', nome: 'Ótica', disciplina: 'Física', motivo: '1 erro na última lista', erros: 1, listas: 1, revisado: false, revisadoEm: null },
  ],
};

const renderPlano = (p: PlanoRevisao = plano) => {
  jest.spyOn(planoService, 'get').mockResolvedValue(p);
  localStorage.setItem('userId', 'u1');
  return render(
    <MemoryRouter initialEntries={['/plano-revisao']}>
      <Routes>
        <Route path="/plano-revisao" element={<PlanoRevisaoPage />} />
      </Routes>
    </MemoryRouter>
  );
};

afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); });

test('lógica: revisados vão para o fim e o resumo conta os pendentes', () => {
  expect(ordenarPlano(plano.assuntos).map((a) => a.nome)).toEqual(['Ótica', 'Funções']);
  expect(resumoPlano(plano.assuntos)).toBe('1 assunto para revisar, 1 já revisado.');
});

test('mostra aviso de IA, motivo e link para as questões erradas', async () => {
  renderPlano();
  expect(await screen.findByText(/gerada por inteligência artificial/i)).toBeInTheDocument();
  expect(screen.getByText('1 erro na última lista')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Ver questões erradas de Ótica/ })).toHaveAttribute('href', '/evolucao/assuntos/a2');
});

test('marca como revisado e desfaz se o salvamento falhar', async () => {
  const marcar = jest.spyOn(planoService, 'marcarRevisado')
    .mockResolvedValueOnce({ revisadoEm: '2026-11-08T13:00:00Z' })
    .mockRejectedValueOnce(new Error('falhou'));
  renderPlano();
  const botao = await screen.findByRole('button', { name: /Marcar como revisado.*Ótica/ });
  userEvent.click(botao);
  await waitFor(() => expect(screen.getByRole('button', { name: /Ótica/ })).toHaveAttribute('aria-pressed', 'true'));
  expect(marcar).toHaveBeenCalledWith('u1', 'a2', true);
  expect(await screen.findByText('Ótica marcado como revisado.')).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /Marcar como revisado.*Ótica/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar');
  expect(screen.getByRole('button', { name: /Ótica/ })).toHaveAttribute('aria-pressed', 'true');
});

test('sem recomendações: mantém o aviso e mostra estado vazio', async () => {
  renderPlano({ geradoEm: plano.geradoEm, assuntos: [] });
  expect(await screen.findByText('Nada para revisar por enquanto')).toBeInTheDocument();
  expect(screen.getByText(/gerada por inteligência artificial/i)).toBeInTheDocument();
});

test('erro de carregamento oferece tentar novamente', async () => {
  jest.spyOn(planoService, 'get').mockRejectedValue(new Error('boom'));
  localStorage.setItem('userId', 'u1');
  render(<MemoryRouter><PlanoRevisaoPage /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('boom');
  expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
});
