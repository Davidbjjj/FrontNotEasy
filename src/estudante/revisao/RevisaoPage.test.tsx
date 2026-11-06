import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RevisaoPage from './RevisaoPage';
import { revisaoService } from './revisaoService';
import { contarErradas, errou, filtrarQuestoes } from './revisaoLogic';
import type { RevisaoLista } from './types';

jest.mock('../../services/apiClient', () => ({ __esModule: true, default: {} }));

const base: RevisaoLista = {
  listaId: 'l1', titulo: 'Lista 1', disciplina: 'Matemática',
  regraGabarito: 'APOS_ENTREGA', gabaritoLiberado: true, liberadoEm: null,
  nota: 6, notaMaxima: 10,
  questoes: [
    { tipo: 'OBJETIVA', questaoId: 'a', numero: 1, enunciado: 'Q um', assunto: { id: 's1', nome: 'Funções' },
      alternativas: ['x', 'y'], minhaResposta: 0, respostaCerta: 0, explicacao: 'porque sim' },
    { tipo: 'OBJETIVA', questaoId: 'b', numero: 2, enunciado: 'Q dois', assunto: { id: 's2', nome: 'Geometria' },
      alternativas: ['x', 'y'], minhaResposta: 0, respostaCerta: 1, explicacao: 'porque y' },
    { tipo: 'OBJETIVA', questaoId: 'c', numero: 3, enunciado: 'Q três', assunto: null,
      alternativas: ['x', 'y'], minhaResposta: null, respostaCerta: 1, explicacao: null },
    { tipo: 'ABERTA', questaoId: 'd', numero: 4, enunciado: 'Q quatro', assunto: null,
      minhaResposta: 'texto', nota: 1.5, notaMaxima: 2, feedback: 'bom trabalho' },
    { tipo: 'ABERTA', questaoId: 'e', numero: 5, enunciado: 'Q cinco', assunto: null,
      minhaResposta: 'texto', nota: null, notaMaxima: 2, feedback: null },
  ],
};

const renderPage = (data: RevisaoLista) => {
  jest.spyOn(revisaoService, 'get').mockResolvedValue(data);
  localStorage.setItem('userId', 'u1');
  return render(
    <MemoryRouter initialEntries={['/listas/l1/revisao']}>
      <Routes><Route path="/listas/:listaId/revisao" element={<RevisaoPage />} /></Routes>
    </MemoryRouter>
  );
};

afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); });

test('lógica: errada = objetiva errada ou em branco; aberta nunca', () => {
  expect(base.questoes.map(errou)).toEqual([false, true, true, false, false]);
  expect(contarErradas(base.questoes)).toBe(2);
  expect(filtrarQuestoes(base.questoes, true).map((q) => q.questaoId)).toEqual(['b', 'c']);
  expect(filtrarQuestoes(base.questoes, false)).toHaveLength(5);
});

test('mostra minha resposta, resposta certa, explicação e assunto', async () => {
  renderPage(base);
  const q2 = (await screen.findByRole('heading', { name: 'Questão 2' })).closest('li')!;
  expect(within(q2).getByText('Minha resposta').nextElementSibling).toHaveTextContent('A) x');
  expect(within(q2).getByText('Resposta certa').nextElementSibling).toHaveTextContent('B) y');
  expect(within(q2).getByText('porque y')).toBeInTheDocument();
  expect(within(q2).getByText('Assunto: Geometria')).toBeInTheDocument();
  expect(within(q2).getByText('✗ Errou')).toBeInTheDocument();
});

test('questão em branco aparece como errada', async () => {
  renderPage(base);
  const q3 = (await screen.findByRole('heading', { name: 'Questão 3' })).closest('li')!;
  expect(within(q3).getByText('Em branco')).toBeInTheDocument();
  expect(within(q3).getByText(/ainda não cadastrou uma explicação/)).toBeInTheDocument();
});

test('filtro "só as que errei"', async () => {
  renderPage(base);
  await screen.findByRole('heading', { name: 'Questão 1' });
  await userEvent.click(screen.getByLabelText('Só as que errei'));
  expect(screen.queryByRole('heading', { name: 'Questão 1' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Questão 2' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Questão 3' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Questão 4' })).not.toBeInTheDocument();
});

test('abertas: nota e feedback quando corrigidas, aviso quando não', async () => {
  renderPage(base);
  const q4 = (await screen.findByRole('heading', { name: 'Questão 4' })).closest('li')!;
  expect(within(q4).getByText('1,5 / 2')).toBeInTheDocument();
  expect(within(q4).getByText('bom trabalho')).toBeInTheDocument();
  const q5 = screen.getByRole('heading', { name: 'Questão 5' }).closest('li')!;
  expect(within(q5).getByText('Aguardando correção do professor')).toBeInTheDocument();
  expect(within(q5).queryByText('Feedback do professor')).not.toBeInTheDocument();
});

test('gabarito bloqueado: mostra aviso e nenhuma questão', async () => {
  renderPage({ ...base, gabaritoLiberado: false, regraGabarito: 'APOS_PRAZO', liberadoEm: '2026-01-12T20:00:00Z', questoes: [] });
  expect(await screen.findByText(/liberado depois do prazo/)).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /Questão/ })).not.toBeInTheDocument();
});

test('erro de carregamento permite tentar de novo', async () => {
  jest.spyOn(revisaoService, 'get').mockRejectedValue(new Error('falhou'));
  localStorage.setItem('userId', 'u1');
  render(
    <MemoryRouter initialEntries={['/listas/l1/revisao']}>
      <Routes><Route path="/listas/:listaId/revisao" element={<RevisaoPage />} /></Routes>
    </MemoryRouter>
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('falhou');
  expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
});
