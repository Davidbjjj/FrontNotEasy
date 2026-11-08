import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RevisaoPage from '../revisao/RevisaoPage';
import { revisaoService } from '../revisao/revisaoService';
import { duvidaService } from './duvidaService';
import { validarDuvida } from './duvidaLogic';
import type { RevisaoLista } from '../revisao/types';
import type { Duvida } from './types';

jest.mock('../../services/apiClient', () => ({ __esModule: true, default: {} }));

const data: RevisaoLista = {
  listaId: 'l1', titulo: 'Lista 1', disciplina: 'Matemática',
  regraGabarito: 'APOS_ENTREGA', gabaritoLiberado: true, liberadoEm: null,
  nota: 6, notaMaxima: 10,
  questoes: [
    { tipo: 'OBJETIVA', questaoId: 'a', numero: 1, enunciado: 'Q um', assunto: null,
      alternativas: ['x', 'y'], minhaResposta: 0, respostaCerta: 1, explicacao: null },
    { tipo: 'OBJETIVA', questaoId: 'b', numero: 2, enunciado: 'Q dois', assunto: null,
      alternativas: ['x', 'y'], minhaResposta: 0, respostaCerta: 0, explicacao: null },
  ],
};

const existente: Duvida = {
  id: 'd1', listaId: 'l1', questaoId: 'b', tipo: 'CONTESTACAO', texto: 'Errado!', anexoNome: null,
  status: 'RECUSADA', criadaEm: '2026-11-08T12:00:00Z', resposta: 'Correção mantida.', respondidaEm: '2026-11-08T13:00:00Z',
};

afterEach(() => { jest.restoreAllMocks(); localStorage.clear(); });

test('validação: texto curto e anexo inválido', () => {
  expect(validarDuvida('abc', null)).toMatch(/pelo menos/);
  expect(validarDuvida('texto válido', new File(['x'], 'a.exe', { type: 'application/x-msdownload' }))).toMatch(/PNG/);
  expect(validarDuvida('texto válido', null)).toBeNull();
});

test('mostra status e resposta; envia dúvida com anexo', async () => {
  jest.spyOn(revisaoService, 'get').mockResolvedValue(data);
  jest.spyOn(duvidaService, 'listar').mockResolvedValue([existente]);
  const criar = jest.spyOn(duvidaService, 'criar').mockResolvedValue({
    ...existente, id: 'd2', questaoId: 'a', tipo: 'DUVIDA', status: 'ENVIADA', resposta: null, texto: 'Por quê?? sim',
  });
  localStorage.setItem('userId', 'u1');
  render(
    <MemoryRouter initialEntries={['/listas/l1/revisao']}>
      <Routes><Route path="/listas/:listaId/revisao" element={<RevisaoPage />} /></Routes>
    </MemoryRouter>
  );

  const q2 = (await screen.findByRole('heading', { name: 'Questão 2' })).closest('li')!;
  expect(await within(q2).findByText('Status: Recusada')).toBeInTheDocument();
  expect(within(q2).getByText('Correção mantida.')).toBeInTheDocument();

  const q1 = screen.getByRole('heading', { name: 'Questão 1' }).closest('li')!;
  userEvent.click(within(q1).getByRole('button', { name: 'Tenho uma dúvida' }));
  const dialog = await screen.findByRole('dialog');
  userEvent.type(within(dialog).getByLabelText('Dúvida'), 'Por quê?? sim');
  const file = new File(['x'], 'caderno.png', { type: 'image/png' });
  userEvent.upload(within(dialog).getByLabelText(/Anexo/), file);
  userEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }));

  await waitFor(() => expect(criar).toHaveBeenCalledWith(
    expect.objectContaining({ listaId: 'l1', questaoId: 'a', tipo: 'DUVIDA', texto: 'Por quê?? sim', anexo: file })
  ));
  expect(await within(q1).findByText('Status: Enviada')).toBeInTheDocument();
});
