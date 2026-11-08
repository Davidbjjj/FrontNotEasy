import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Question from './Question';
import { respostaService } from '../../service/api/respostaService';

jest.mock('../../../services/apiClient', () => ({ __esModule: true, default: { defaults: { baseURL: '' } } }));

const mk = (id: string, n: number) => ({
  id, title: 'Lista', subject: 'Mat', tags: [], difficulty: 'easy' as const, progress: 0,
  currentQuestion: n, totalQuestions: 3, correctAnswer: 'A', explanation: '',
  content: `Enunciado ${n}`,
  options: [
    { id: 'A', label: 'A', value: 'A', text: 'um' },
    { id: 'B', label: 'B', value: 'B', text: 'dois' },
  ],
});
const questions = [mk('1', 1), mk('2', 2), mk('3', 3)];

const setup = (initialAnswers?: Record<string, string>) =>
  render(<Question questions={questions} listaId="l" estudanteId="u" initialAnswers={initialAnswers} />);

test('mapa marca respondidas (do servidor) e permite pular para uma questão', async () => {
  setup({ '2': 'B' });
  const map = screen.getByRole('navigation', { name: 'Mapa de questões' });
  expect(map).toHaveTextContent('1 de 3 respondidas');
  expect(screen.getByRole('button', { name: 'Questão 2, respondida, atual' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Questão 1, não respondida' })).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Questão 3, não respondida' }));
  expect(await screen.findByText('Enunciado 3')).toBeInTheDocument();
});

test('resposta enviada continua marcada ao navegar e voltar', async () => {
  jest.spyOn(respostaService, 'enviarResposta').mockResolvedValue(undefined as any);
  setup();
  userEvent.click(screen.getByText('um'));
  userEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }));
  expect(await screen.findByRole('button', { name: 'Questão 1, respondida, atual' })).toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Próxima →' }));
  await screen.findByText('Enunciado 2');
  userEvent.click(screen.getByRole('button', { name: 'Questão 1, respondida' }));
  expect(await screen.findByRole('button', { name: 'Respondida' })).toBeDisabled();
});

describe('FE-104 retomar de onde parou', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  test('reabrir volta na última questão respondida', async () => {
    setup({ '1': 'A', '2': 'B' });
    expect(await screen.findByText('Enunciado 2')).toBeInTheDocument();
  });

  test('mostra "Salvo" depois de enviar a resposta', async () => {
    jest.spyOn(respostaService, 'enviarResposta').mockResolvedValue(undefined as any);
    setup();
    userEvent.click(screen.getByText('um'));
    userEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }));
    expect(await screen.findByText(/Salvo agora mesmo/)).toBeInTheDocument();
  });

  test('sem rede: guarda localmente, conta como respondida e sincroniza ao reconectar', async () => {
    const send = jest.spyOn(respostaService, 'enviarResposta').mockRejectedValueOnce({ request: {} });
    setup();
    userEvent.click(screen.getByText('um'));
    userEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }));
    expect(await screen.findByText(/1 resposta guardada neste aparelho/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('attempt:v1:u:l') as string).pending).toEqual({ '1': 'A' });
    expect(screen.getByRole('button', { name: 'Questão 1, respondida, atual' })).toBeInTheDocument();

    send.mockResolvedValue(undefined as any);
    window.dispatchEvent(new Event('online'));
    expect(await screen.findByText(/Salvo/)).toBeInTheDocument();
    expect(send).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem('attempt:v1:u:l')).toBeNull();
  });

  test('respostas pendentes de outra sessão são enviadas ao abrir e a lista volta nelas', async () => {
    localStorage.setItem('attempt:v1:u:l', JSON.stringify({ pending: { '2': 'B' }, drafts: {} }));
    const send = jest.spyOn(respostaService, 'enviarResposta').mockResolvedValue(undefined as any);
    setup();
    expect(await screen.findByText('Enunciado 2')).toBeInTheDocument();
    await screen.findByText(/Salvo/);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ questaoId: 2, alternativa: 1 }));
  });

  test('avisa ao sair com alternativa marcada e não enviada', () => {
    setup();
    userEvent.click(screen.getByText('um'));
    const ev = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });
});
