import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../ui';
import CorrecaoPage from './correcao/CorrecaoPage';
import { ReabrirListaModal } from './acoes/AcoesModais';
import { TextoFormatado } from '../mural/MuralAvisos';
import { professorService } from './professorService';
import type { DetalheCorrecao, FilaCorrecao } from './types';

jest.mock('../services/apiClient', () => ({ __esModule: true, default: {}, API_BASE: 'http://api.test' }));

// O módulo real importa axios (ESM), que o Jest do CRA não transforma; os testes só precisam do contrato.
jest.mock('./professorService', () => {
  return {
    mensagemErro: (e: any, padrao: string) => (typeof e?.response?.data === 'string' ? e.response.data : padrao),
    professorService: {
      fila: jest.fn(),
      detalheResposta: jest.fn(),
      corrigir: jest.fn(),
      reabrir: jest.fn(),
    },
  };
});

const svc = professorService as jest.Mocked<typeof professorService>;

const item = (id: number, nome: string) => ({
  respostaId: id, listaId: 'l1', listaTitulo: 'Lista 1', disciplinaId: 'd1', disciplinaNome: 'Português',
  questaoId: 10 + id, enunciado: `Enunciado ${id}`, estudanteId: `e${id}`, estudanteNome: nome, enviadaEm: '2026-11-10T12:00:00Z',
});

const fila = (...itens: ReturnType<typeof item>[]): FilaCorrecao => ({
  total: itens.length, items: itens,
  listas: [{ id: 'l1', nome: 'Lista 1' }], disciplinas: [{ id: 'd1', nome: 'Português' }],
});

const detalhe = (id: number, nome: string, restantes: number): DetalheCorrecao => ({
  respostaId: id, listaId: 'l1', listaTitulo: 'Lista 1', disciplinaId: 'd1', disciplinaNome: 'Português',
  questaoId: 10 + id, cabecalho: null, enunciado: `Enunciado ${id}`, imagens: [], assunto: null,
  rubrica: 'Cita aposto e vocativo', estudanteId: `e${id}`, estudanteNome: nome,
  textoResposta: `Resposta de ${nome}`, notaQuestao: null, feedback: null, corrigida: false,
  enviadaEm: '2026-11-10T12:00:00Z', restantes,
});

const renderPagina = () => render(
  <MemoryRouter initialEntries={['/correcao']}>
    <ToastProvider><CorrecaoPage /></ToastProvider>
  </MemoryRouter>
);

describe('FE-201 · fila de correção', () => {
  beforeEach(() => jest.resetAllMocks());

  it('mostra a resposta ao lado da rubrica, valida a nota e corrige em sequência', async () => {
    svc.fila
      .mockResolvedValueOnce(fila(item(1, 'Ana'), item(2, 'Bruno')))
      .mockResolvedValue(fila(item(2, 'Bruno')));
    svc.detalheResposta.mockImplementation(async (id) => (id === 1 ? detalhe(1, 'Ana', 2) : detalhe(2, 'Bruno', 1)));
    svc.corrigir.mockResolvedValue({ respostaId: 1, restantes: 1, notaLancada: true });

    renderPagina();

    // abre a primeira pendente sozinha; resposta e rubrica lado a lado; contador visível
    expect(await screen.findByText('Resposta de Ana')).toBeInTheDocument();
    expect(screen.getByText('Cita aposto e vocativo')).toBeInTheDocument();
    expect(screen.getByText('2 pendentes')).toBeInTheDocument();

    // nota inválida não envia
    fireEvent.change(screen.getByLabelText('Nota (0 a 10)'), { target: { value: '11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e próxima' }));
    expect(await screen.findByText(/Informe uma nota de 0 a 10/)).toBeInTheDocument();
    expect(svc.corrigir).not.toHaveBeenCalled();

    // nota com vírgula + feedback → salva e vai para a próxima
    fireEvent.change(screen.getByLabelText('Nota (0 a 10)'), { target: { value: '7,5' } });
    fireEvent.change(screen.getByLabelText(/Feedback escrito/), { target: { value: 'Bom trabalho' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e próxima' }));

    await waitFor(() => expect(svc.corrigir).toHaveBeenCalledWith(1, 7.5, 'Bom trabalho'));
    expect(await screen.findByText('Resposta de Bruno')).toBeInTheDocument();
    expect(screen.getByText(/Ana foi avisado/)).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há nada pendente', async () => {
    svc.fila.mockResolvedValue(fila());
    renderPagina();
    expect(await screen.findByText('Nenhuma resposta aguardando correção')).toBeInTheDocument();
  });

  it('mostra erro com nova tentativa quando a fila falha', async () => {
    svc.fila.mockRejectedValueOnce({ response: { data: 'Falha no servidor' } }).mockResolvedValue(fila());
    renderPagina();
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha no servidor');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Nenhuma resposta aguardando correção')).toBeInTheDocument();
  });
});

describe('FE-203 · confirmação antes da ação', () => {
  beforeEach(() => jest.resetAllMocks());

  it('só reabre a lista depois de confirmar e mostra o toast de sucesso', async () => {
    svc.reabrir.mockResolvedValue({ lista: {} as any, notificados: 12 });
    const onClose = jest.fn();
    render(
      <ToastProvider>
        <ReabrirListaModal open lista={{ id: 'l1', titulo: 'Lista 1' }} onClose={onClose} />
      </ToastProvider>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Continuar' }));
    // etapa de confirmação descreve o que vai acontecer e ainda NÃO chamou a API
    expect(within(dialog).getByText(/será reaberta até/)).toBeInTheDocument();
    expect(svc.reabrir).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reabrir lista' }));
    await waitFor(() => expect(svc.reabrir).toHaveBeenCalledTimes(1));
    expect(svc.reabrir.mock.calls[0][0]).toBe('l1');
    expect(svc.reabrir.mock.calls[0][2]).toBe(true);
    expect(await screen.findByText(/12 alunos avisados/)).toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });

  it('não deixa continuar com prazo no passado', () => {
    render(
      <ToastProvider>
        <ReabrirListaModal open lista={{ id: 'l1', titulo: 'Lista 1' }} onClose={() => undefined} />
      </ToastProvider>
    );
    fireEvent.change(screen.getByLabelText('Novo prazo'), { target: { value: '2020-01-01T10:00' } });
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/futuro/);
  });
});

describe('FE-209 · texto formatado do mural', () => {
  it('renderiza formatação sem executar HTML', () => {
    render(<TextoFormatado texto={'**Prova** sexta\n- caneta\n- <img src=x onerror=alert(1)>'} />);
    expect(screen.getByText('Prova').tagName).toBe('STRONG');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  });
});
