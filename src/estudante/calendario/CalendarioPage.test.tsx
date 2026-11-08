import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CalendarioPage, { Calendario } from './CalendarioPage';
import { studentDashboardService } from '../dashboard/dashboardService';
import { agruparPorDia, corPorDisciplina, semanasDoMes } from './calendarioLogic';
import type { ProximaLista, StudentDashboard } from '../dashboard/types';

jest.mock('../../services/apiClient', () => ({ __esModule: true, default: {} }));

const hoje = new Date(2026, 10, 8, 10, 0); // domingo, 8/nov/2026
const L = (id: string, disciplina: string, prazo: string | null): ProximaLista =>
  ({ id, titulo: `Lista ${id}`, disciplina, prazo, respondidas: 1, total: 4 });

const listas = [
  L('a', 'Matemática', new Date(2026, 10, 10, 20, 0).toISOString()),
  L('b', 'Física', new Date(2026, 10, 10, 8, 0).toISOString()),
  L('c', 'Física', new Date(2026, 11, 2, 12, 0).toISOString()),
  L('d', 'Química', null),
];

const renderCal = () => render(<MemoryRouter><Calendario listas={listas} hoje={hoje} /></MemoryRouter>);

afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); });

test('lógica: agrupa por dia em ordem de horário e separa sem prazo', () => {
  const { porDia, semPrazo } = agruparPorDia(listas);
  expect(porDia.get('2026-11-10')!.map((l) => l.id)).toEqual(['b', 'a']);
  expect(semPrazo.map((l) => l.id)).toEqual(['d']);
});

test('lógica: cores distintas por disciplina e semanas do mês cobrem o mês', () => {
  expect(new Set(corPorDisciplina(listas).values()).size).toBe(3);
  const semanas = semanasDoMes(hoje);
  expect(semanas[0][0].getDay()).toBe(0);
  expect(semanas.flat().some((d) => d.getDate() === 30 && d.getMonth() === 10)).toBe(true);
});

test('mês: selecionar um dia mostra a lista dele com link para responder', () => {
  renderCal();
  userEvent.click(screen.getByRole('button', { name: /10 de novembro, 2 listas/ }));
  const secao = screen.getByRole('region', { name: /terça-feira, 10 de novembro/i });
  const links = within(secao).getAllByRole('link');
  expect(links.map((a) => a.textContent)).toEqual(['Lista b', 'Lista a']);
  expect(links[0]).toHaveAttribute('href', '/listas/b/questoes');
});

test('legenda por disciplina e seção sem prazo', () => {
  renderCal();
  const legenda = screen.getByRole('region', { name: 'Legenda de disciplinas' });
  expect(within(legenda).getAllByRole('listitem').map((i) => i.textContent)).toEqual(['Física', 'Matemática', 'Química']);
  const sem = screen.getByRole('region', { name: 'Sem prazo' });
  expect(within(sem).getByRole('link', { name: 'Lista d' })).toBeInTheDocument();
});

test('semana: mostra os 7 dias e navega entre semanas', () => {
  renderCal();
  userEvent.click(screen.getByRole('button', { name: 'Semana' }));
  const dias = screen.getAllByRole('heading', { level: 2 }).filter((h) => /feira|sábado|domingo/i.test(h.textContent || ''));
  expect(dias).toHaveLength(7);
  expect(screen.getByRole('link', { name: 'Lista a' })).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Próxima semana' }));
  expect(screen.queryByRole('link', { name: 'Lista a' })).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Hoje' }));
  expect(screen.getByRole('link', { name: 'Lista a' })).toBeInTheDocument();
});

test('página: erro de carregamento oferece tentar novamente e depois mostra estado vazio', async () => {
  localStorage.setItem('userId', 'u1');
  const spy = jest.spyOn(studentDashboardService, 'get').mockRejectedValueOnce(new Error('boom'));
  render(<MemoryRouter><CalendarioPage /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('boom');
  spy.mockResolvedValueOnce({
    totalDisciplinas: 1, proximasListas: [], ultimasNotas: [],
    sequencia: { atual: 0, recorde: 0, ativoHoje: false }, emAndamento: null,
  } as StudentDashboard);
  userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByText('Nenhuma lista pendente')).toBeInTheDocument();
});
