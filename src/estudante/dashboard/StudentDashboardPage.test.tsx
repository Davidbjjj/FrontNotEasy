import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentDashboardPage from './StudentDashboardPage';
import { studentDashboardService } from './dashboardService';
import { deadlineStatus, describeDeadline, sortByDeadline } from './dashboardLogic';
import type { StudentDashboard } from './types';

jest.mock('../../services/apiClient', () => ({ __esModule: true, default: {} }));

const HOUR = 3_600_000;
const iso = (h: number) => new Date(Date.now() + h * HOUR).toISOString();

const base: StudentDashboard = {
  totalDisciplinas: 2,
  proximasListas: [
    { id: 'c', titulo: 'Lista C', disciplina: 'Física', prazo: iso(120), respondidas: 0, total: 5 },
    { id: 'a', titulo: 'Lista A', disciplina: 'Matemática', prazo: iso(10), respondidas: 1, total: 5 },
    { id: 'n', titulo: 'Lista N', disciplina: 'Química', prazo: null, respondidas: 0, total: 5 },
    { id: 'b', titulo: 'Lista B', disciplina: 'Física', prazo: iso(47), respondidas: 0, total: 5 },
  ],
  ultimasNotas: [
    { listaId: 'x', titulo: 'Lista X', disciplina: 'Física', nota: 8, notaMaxima: 10, corrigidaEm: iso(-24) },
  ],
  sequencia: { atual: 3, recorde: 7, ativoHoje: false },
  emAndamento: { listaId: 'a', titulo: 'Lista A', disciplina: 'Matemática', respondidas: 1, total: 5 },
};

const renderPage = (data: StudentDashboard) => {
  jest.spyOn(studentDashboardService, 'get').mockResolvedValue(data);
  localStorage.setItem('userId', 'u1');
  return render(
    <MemoryRouter>
      <StudentDashboardPage />
    </MemoryRouter>
  );
};

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

test('próximas listas: ordenadas por prazo, sem prazo por último, destaque até 48 h', async () => {
  renderPage(base);
  const region = await screen.findByRole('region', { name: 'Próximas listas' });
  const items = within(region).getAllByRole('listitem');
  expect(items.map((li) => within(li).getAllByRole('link')[0].textContent)).toEqual([
    'Lista A', 'Lista B', 'Lista C', 'Lista N',
  ]);
  expect(within(items[0]).getByText('Urgente')).toBeInTheDocument();
  expect(within(items[1]).getByText('Urgente')).toBeInTheDocument();
  expect(within(items[2]).queryByText('Urgente')).not.toBeInTheDocument();
});

test('últimas notas com link de revisão', async () => {
  renderPage(base);
  const region = await screen.findByRole('region', { name: 'Últimas notas' });
  expect(within(region).getByText('8 / 10')).toBeInTheDocument();
  expect(within(region).getByRole('link', { name: /Revisar Lista X/ })).toHaveAttribute('href', '/listas/x/revisao');
});

test('sequência e atalho continuar', async () => {
  renderPage(base);
  const streak = await screen.findByRole('region', { name: 'Sequência de estudo' });
  expect(within(streak).getByText(/3 dias/)).toBeInTheDocument();
  expect(within(streak).getByText(/não perder sua sequência/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Continuar\s*:\s*Lista A/ })).toHaveAttribute('href', '/listas/a/questoes');
});

test('sem lista em andamento, não mostra o atalho continuar', async () => {
  renderPage({ ...base, emAndamento: null });
  await screen.findByRole('region', { name: 'Próximas listas' });
  expect(screen.queryByRole('link', { name: /Continuar/ })).not.toBeInTheDocument();
});

test('estado vazio para aluno sem disciplinas', async () => {
  renderPage({ ...base, totalDisciplinas: 0, proximasListas: [], ultimasNotas: [], emAndamento: null });
  expect(await screen.findByText('Você ainda não está em nenhuma disciplina')).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Próximas listas' })).not.toBeInTheDocument();
});

test('erro permite tentar novamente', async () => {
  jest.spyOn(studentDashboardService, 'get').mockRejectedValueOnce(new Error('falhou')).mockResolvedValue(base);
  localStorage.setItem('userId', 'u1');
  render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('falhou');
  (await screen.findByRole('button', { name: 'Tentar novamente' })).click();
  expect(await screen.findByRole('region', { name: 'Próximas listas' })).toBeInTheDocument();
});

describe('dashboardLogic', () => {
  const now = new Date('2026-01-10T12:00:00Z');
  test('deadlineStatus', () => {
    expect(deadlineStatus(null, now)).toBe('sem-prazo');
    expect(deadlineStatus('2026-01-10T11:00:00Z', now)).toBe('atrasada');
    expect(deadlineStatus('2026-01-12T12:00:00Z', now)).toBe('urgente'); // exatamente 48 h
    expect(deadlineStatus('2026-01-12T12:00:01Z', now)).toBe('normal');
  });
  test('describeDeadline', () => {
    expect(describeDeadline('2026-01-10T17:00:00Z', now)).toBe('Vence em 5 h');
    expect(describeDeadline('2026-01-11T12:00:00Z', now)).toBe('Vence amanhã');
    expect(describeDeadline('2026-01-08T12:00:00Z', now)).toBe('Venceu há 2 dias');
  });
  test('sortByDeadline não altera a entrada', () => {
    const input = base.proximasListas;
    const copy = [...input];
    sortByDeadline(input);
    expect(input).toEqual(copy);
  });
});
