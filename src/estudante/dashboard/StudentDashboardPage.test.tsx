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

const entrega = (eventoId: string, titulo: string, prazo: string) => ({
  eventoId, titulo, disciplinaId: 'd1', disciplinaNome: 'Física', prazo,
});

const base: StudentDashboard = {
  estudanteId: 'u1',
  nome: 'Ana',
  fusoHorario: 'America/Sao_Paulo',
  totalDisciplinas: 2,
  proximasEntregas: [
    entrega('c', 'Atividade C', iso(120)),
    entrega('a', 'Atividade A', iso(10)),
    entrega('b', 'Atividade B', iso(47)),
  ],
  ultimasNotas: [
    { listaId: 'x', titulo: 'Lista X', disciplinaId: 'd1', disciplinaNome: 'Física', nota: 8, notaMaxima: 10, corrigidaEm: iso(-24) },
  ],
  sequencia: { diasConsecutivos: 3, ultimaAtividadeEm: iso(-48) },
  emAndamento: [
    { listaId: 'a', titulo: 'Lista A', disciplinaId: 'd1', disciplinaNome: 'Matemática', questoesRespondidas: 1, totalQuestoes: 5, ultimaAtividadeEm: iso(-2) },
    { listaId: 'z', titulo: 'Lista Z', disciplinaId: 'd1', disciplinaNome: 'Física', questoesRespondidas: 2, totalQuestoes: 4, ultimaAtividadeEm: iso(-30) },
  ],
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

test('próximas entregas: ordenadas por prazo, destaque até 48 h, link para a atividade', async () => {
  renderPage(base);
  const region = await screen.findByRole('region', { name: 'Próximas entregas' });
  const items = within(region).getAllByRole('listitem');
  expect(items.map((li) => within(li).getAllByRole('link')[0].textContent)).toEqual([
    'Atividade A', 'Atividade B', 'Atividade C',
  ]);
  expect(within(items[0]).getByRole('link')).toHaveAttribute('href', '/atividades/a');
  expect(within(items[0]).getByText('Urgente')).toBeInTheDocument();
  expect(within(items[1]).getByText('Urgente')).toBeInTheDocument();
  expect(within(items[2]).queryByText('Urgente')).not.toBeInTheDocument();
});

test('últimas notas com link para a revisão de cada lista', async () => {
  renderPage(base);
  const region = await screen.findByRole('region', { name: 'Últimas notas' });
  expect(within(region).getByText('8 / 10')).toBeInTheDocument();
  expect(within(region).getByRole('link', { name: /Revisar Lista X/ })).toHaveAttribute('href', '/listas/x/revisao');
});

test('sem notas mostra mensagem vazia', async () => {
  renderPage({ ...base, ultimasNotas: [] });
  const region = await screen.findByRole('region', { name: 'Últimas notas' });
  expect(within(region).getByText(/ainda não tem notas/)).toBeInTheDocument();
});

test('sequência em risco e atalho continuar com a lista mais recente', async () => {
  renderPage(base);
  const streak = await screen.findByRole('region', { name: 'Sequência de estudo' });
  expect(within(streak).getByText(/3 dias/)).toBeInTheDocument();
  expect(within(streak).getByText(/não perder sua sequência/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Continuar\s*:\s*Lista A/ })).toHaveAttribute('href', '/listas/a/questoes');
  expect(screen.getByRole('link', { name: 'Lista Z' })).toHaveAttribute('href', '/listas/z/questoes');
});

test('atividade hoje garante a sequência', async () => {
  renderPage({ ...base, sequencia: { diasConsecutivos: 1, ultimaAtividadeEm: new Date().toISOString() } });
  const streak = await screen.findByRole('region', { name: 'Sequência de estudo' });
  expect(within(streak).getByText(/1 dia/)).toBeInTheDocument();
  expect(within(streak).getByText(/garantida por hoje/)).toBeInTheDocument();
});

test('sem lista em andamento, não mostra o atalho continuar', async () => {
  renderPage({ ...base, emAndamento: [] });
  await screen.findByRole('region', { name: 'Próximas entregas' });
  expect(screen.queryByRole('link', { name: /Continuar/ })).not.toBeInTheDocument();
});

test('estado vazio para aluno sem disciplinas', async () => {
  renderPage({ ...base, totalDisciplinas: 0, proximasEntregas: [], ultimasNotas: [], emAndamento: [] });
  expect(await screen.findByText('Você ainda não está em nenhuma disciplina')).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Próximas entregas' })).not.toBeInTheDocument();
});

test('erro permite tentar novamente', async () => {
  jest.spyOn(studentDashboardService, 'get').mockRejectedValueOnce(new Error('falhou')).mockResolvedValue(base);
  localStorage.setItem('userId', 'u1');
  render(<MemoryRouter><StudentDashboardPage /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('falhou');
  (await screen.findByRole('button', { name: 'Tentar novamente' })).click();
  expect(await screen.findByRole('region', { name: 'Próximas entregas' })).toBeInTheDocument();
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
    const input = base.proximasEntregas;
    const copy = [...input];
    sortByDeadline(input);
    expect(input).toEqual(copy);
  });
});
