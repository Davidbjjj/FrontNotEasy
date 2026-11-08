import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EvolucaoPage from './EvolucaoPage';
import ErradasAssuntoPage from './ErradasAssuntoPage';
import { evolucaoService } from './evolucaoService';
import { filtrarNotas, notaNormalizada, ordenarAssuntos, percentual } from './evolucaoLogic';
import type { ErradasAssunto, Evolucao } from './types';

jest.mock('../../services/apiClient', () => ({ __esModule: true, default: {} }));

const data: Evolucao = {
  disciplinas: [{ id: 'd1', nome: 'Matemática' }, { id: 'd2', nome: 'Física' }],
  notas: [
    { listaId: 'n2', titulo: 'Lista B', disciplinaId: 'd2', data: '2026-02-01T10:00:00Z', nota: 12, notaMaxima: 20 },
    { listaId: 'n1', titulo: 'Lista A', disciplinaId: 'd1', data: '2026-01-01T10:00:00Z', nota: 5, notaMaxima: 10 },
    { listaId: 'n3', titulo: 'Lista C', disciplinaId: 'd1', data: '2026-03-01T10:00:00Z', nota: 8, notaMaxima: 10 },
  ],
  assuntos: [
    { id: 'a1', nome: 'Forte', disciplinaId: 'd1', acertos: 9, total: 10 },
    { id: 'a2', nome: 'Fraco', disciplinaId: 'd1', acertos: 2, total: 8 },
    { id: 'a3', nome: 'Médio', disciplinaId: 'd2', acertos: 5, total: 10 },
    { id: 'a4', nome: 'Sem dados', disciplinaId: 'd1', acertos: 0, total: 0 },
  ],
};

const LocationProbe: React.FC = () => <div>ERRADAS</div>;

const renderEvolucao = (d: Evolucao = data) => {
  jest.spyOn(evolucaoService, 'get').mockResolvedValue(d);
  localStorage.setItem('userId', 'u1');
  return render(
    <MemoryRouter initialEntries={['/evolucao']}>
      <Routes>
        <Route path="/evolucao" element={<EvolucaoPage />} />
        <Route path="/evolucao/assuntos/:assuntoId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
};

afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); });

test('lógica: normaliza para 0–10, ordena no tempo e filtra por disciplina', () => {
  expect(notaNormalizada(data.notas[0])).toBe(6);
  expect(filtrarNotas(data.notas, '').map((n) => n.listaId)).toEqual(['n1', 'n2', 'n3']);
  expect(filtrarNotas(data.notas, 'd1').map((n) => n.listaId)).toEqual(['n1', 'n3']);
});

test('lógica: assuntos do mais fraco ao mais forte, sem os sem questões', () => {
  expect(ordenarAssuntos(data.assuntos, '').map((a) => a.nome)).toEqual(['Fraco', 'Médio', 'Forte']);
  expect(ordenarAssuntos(data.assuntos, 'd1').map((a) => a.nome)).toEqual(['Fraco', 'Forte']);
  expect(percentual(data.assuntos[1])).toBe(25);
});

test('tabelas alternativas trazem os mesmos dados dos gráficos', async () => {
  renderEvolucao();
  const notas = await screen.findByRole('table', { name: /Notas por lista/ });
  const rows = within(notas).getAllByRole('row').slice(1);
  expect(rows.map((r) => within(r).getAllByRole('cell')[1].textContent)).toEqual(['Lista A', 'Lista B', 'Lista C']);

  const assuntos = screen.getByRole('table', { name: /Desempenho por assunto/ });
  const links = within(assuntos).getAllByRole('link');
  expect(links.map((l) => l.textContent)).toEqual([
    'Fraco: ver questões erradas', 'Médio: ver questões erradas', 'Forte: ver questões erradas',
  ]);
  expect(within(assuntos).getByText('25% (2 de 8)')).toBeInTheDocument();
});

test('filtro por disciplina atualiza notas e assuntos', async () => {
  renderEvolucao();
  await screen.findByRole('table', { name: /Notas por lista/ });
  await userEvent.selectOptions(screen.getByLabelText('Disciplina'), 'd2');
  const notas = screen.getByRole('table', { name: /Notas por lista/ });
  expect(within(notas).getAllByRole('row')).toHaveLength(2);
  const assuntos = screen.getByRole('table', { name: /Desempenho por assunto/ });
  expect(within(assuntos).getAllByRole('link')).toHaveLength(1);
  expect(within(assuntos).getByText(/Médio/)).toBeInTheDocument();
});

test('clicar em um assunto leva às questões erradas dele', async () => {
  renderEvolucao();
  const assuntos = await screen.findByRole('table', { name: /Desempenho por assunto/ });
  await userEvent.click(within(assuntos).getByRole('link', { name: /Fraco/ }));
  expect(screen.getByText('ERRADAS')).toBeInTheDocument();
});

test('sem nenhuma nota nem assunto mostra estado vazio', async () => {
  renderEvolucao({ disciplinas: [], notas: [], assuntos: [] });
  expect(await screen.findByText('Sua evolução aparece aqui')).toBeInTheDocument();
});

test('erro de carregamento permite tentar de novo', async () => {
  jest.spyOn(evolucaoService, 'get').mockRejectedValue(new Error('falhou'));
  localStorage.setItem('userId', 'u1');
  render(<MemoryRouter><EvolucaoPage /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('falhou');
  expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
});

test('questões erradas do assunto: resposta, gabarito e explicação', async () => {
  const erradas: ErradasAssunto = {
    assunto: { id: 'a2', nome: 'Fraco' }, disciplina: 'Matemática',
    questoes: [
      { questaoId: 'q1', listaId: 'l1', listaTitulo: 'Lista 1', numero: 2, enunciado: 'Enunciado?',
        alternativas: ['x', 'y'], minhaResposta: null, respostaCerta: 1, explicacao: null },
    ],
  };
  const spy = jest.spyOn(evolucaoService, 'erradas').mockResolvedValue(erradas);
  localStorage.setItem('userId', 'u1');
  render(
    <MemoryRouter initialEntries={['/evolucao/assuntos/a2']}>
      <Routes><Route path="/evolucao/assuntos/:assuntoId" element={<ErradasAssuntoPage />} /></Routes>
    </MemoryRouter>
  );
  expect(await screen.findByRole('heading', { name: 'Questões erradas: Fraco' })).toBeInTheDocument();
  expect(spy).toHaveBeenCalledWith('u1', 'a2', expect.anything());
  expect(screen.getByText('Em branco')).toBeInTheDocument();
  expect(screen.getByText('B) y')).toBeInTheDocument();
  expect(screen.getByText(/ainda não cadastrou uma explicação/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Abrir a revisão completa/ })).toHaveAttribute('href', '/listas/l1/revisao');
});
