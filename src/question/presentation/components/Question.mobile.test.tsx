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
  expect(screen.getByRole('button', { name: 'Questão 2, respondida' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Questão 1, não respondida, atual' })).toBeInTheDocument();
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
