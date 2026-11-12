import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../ui';
import ImportacaoView from './ImportacaoView';
import ConvitesView from './ConvitesView';
import PapeisView from './PapeisView';
import AceiteConvitePage from './AceiteConvitePage';
import { gestaoService } from './gestaoService';

jest.mock('../../services/apiClient', () => ({ __esModule: true, default: {}, API_BASE: 'http://api.test' }));
jest.mock('../../professor/professorService', () => ({
  mensagemErro: (e: any, padrao: string) => (typeof e?.response?.data === 'string' ? e.response.data : padrao),
}));
jest.mock('./gestaoService', () => ({
  gestaoService: {
    previaImportacao: jest.fn(), confirmarImportacao: jest.fn(),
    convites: jest.fn(), disciplinasGestao: jest.fn(), convidar: jest.fn(), reenviarConvite: jest.fn(), cancelarConvite: jest.fn(),
    matriz: jest.fn(), usuarios: jest.fn(), salvarPapel: jest.fn(), definirPapel: jest.fn(),
    infoConvite: jest.fn(), aceitarConvite: jest.fn(),
  },
}));

const svc = gestaoService as jest.Mocked<typeof gestaoService>;
const envolver = (ui: React.ReactElement) => render(<MemoryRouter><ToastProvider>{ui}</ToastProvider></MemoryRouter>);

beforeEach(() => jest.resetAllMocks());

describe('FE-301 · importação', () => {
  const previa = {
    tipo: 'ALUNOS' as const, colunas: ['nome', 'email'],
    linhas: [
      { numero: 2, dados: { nome: 'Ana', email: 'ana@x.com' }, status: 'NOVO' as const, erros: [] },
      { numero: 3, dados: { nome: '', email: 'ruim' }, status: 'ERRO' as const, erros: ['Nome obrigatório', 'E-mail inválido'] },
    ],
    resumo: { total: 2, novos: 1, atualizados: 0, ignorados: 0, erros: 1 },
  };

  it('mostra a prévia com os erros por linha e só grava depois de confirmar', async () => {
    svc.previaImportacao.mockResolvedValue(previa);
    svc.confirmarImportacao.mockResolvedValue({
      resumo: { total: 2, novos: 1, atualizados: 0, ignorados: 0, erros: 1 }, comErro: [previa.linhas[1]], convitesGerados: 1,
    });
    envolver(<ImportacaoView />);

    const arquivo = new File(['nome;email\nAna;ana@x.com'], 'alunos.csv', { type: 'text/csv' });
    fireEvent.change(screen.getByLabelText(/Arquivo CSV/), { target: { files: [arquivo] } });

    expect(await screen.findByText('Nome obrigatório')).toBeInTheDocument();
    expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Baixar relatório de erros' })).toBeInTheDocument();
    expect(svc.confirmarImportacao).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Confirmar importação \(1 linha\)/ }));
    await waitFor(() => expect(svc.confirmarImportacao).toHaveBeenCalledWith('ALUNOS', arquivo));
    const resumo = await screen.findByRole('region', { name: 'Resumo da importação' });
    expect(within(resumo).getByText(/criados/)).toHaveTextContent('1 criados');
    expect(within(resumo).getByText(/com erro e não importados/)).toHaveTextContent('1 com erro');
  });

  it('não deixa confirmar quando nenhuma linha é aproveitável', async () => {
    svc.previaImportacao.mockResolvedValue({ ...previa, linhas: [previa.linhas[1]], resumo: { total: 1, novos: 0, atualizados: 0, ignorados: 0, erros: 1 } });
    envolver(<ImportacaoView />);
    fireEvent.change(screen.getByLabelText(/Arquivo CSV/), { target: { files: [new File(['x'], 'a.csv', { type: 'text/csv' })] } });
    expect(await screen.findByRole('button', { name: /Confirmar importação/ })).toBeDisabled();
  });

  it('mostra o erro de arquivo inválido vindo da API', async () => {
    svc.previaImportacao.mockRejectedValue({ response: { data: 'Falta a coluna "email" no cabeçalho.' } });
    envolver(<ImportacaoView />);
    fireEvent.change(screen.getByLabelText(/Arquivo CSV/), { target: { files: [new File(['x'], 'a.csv', { type: 'text/csv' })] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Falta a coluna "email"');
  });
});

describe('FE-302 · convites', () => {
  const base = { nome: null, disciplinas: [], criadoEm: '2026-11-01T12:00:00Z', expiraEm: '2026-11-08T12:00:00Z', aceitoEm: null, link: null };

  it('oferece reenviar/cancelar conforme o status e confirma antes de cancelar', async () => {
    svc.convites.mockResolvedValue([
      { ...base, id: '1', email: 'pendente@x.com', papel: 'PROFESSOR', status: 'PENDENTE' },
      { ...base, id: '2', email: 'aceito@x.com', papel: 'ALUNO', status: 'ACEITO' },
      { ...base, id: '3', email: 'vencido@x.com', papel: 'COORDENADOR', status: 'EXPIRADO' },
    ]);
    svc.disciplinasGestao.mockResolvedValue([]);
    svc.cancelarConvite.mockResolvedValue({ ...base, id: '1', email: 'pendente@x.com', papel: 'PROFESSOR', status: 'CANCELADO' });
    const confirmar = jest.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    envolver(<ConvitesView />);

    expect(await screen.findByText('pendente@x.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reenviar convite para pendente@x.com' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reenviar convite para vencido@x.com' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Reenviar convite para aceito@x.com/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Cancelar convite de aceito@x.com/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar convite de pendente@x.com' }));
    expect(svc.cancelarConvite).not.toHaveBeenCalled(); // o usuário recusou a confirmação
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar convite de pendente@x.com' }));
    await waitFor(() => expect(svc.cancelarConvite).toHaveBeenCalledWith('1'));
    confirmar.mockRestore();
  });

  it('valida o e-mail antes de enviar o convite', async () => {
    svc.convites.mockResolvedValue([]);
    svc.disciplinasGestao.mockResolvedValue([]);
    envolver(<ConvitesView />);
    fireEvent.change(await screen.findByLabelText('E-mail'), { target: { value: 'sem-arroba' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar convite' }));
    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument();
    expect(svc.convidar).not.toHaveBeenCalled();
  });
});

describe('FE-302 · aceite do convite', () => {
  const info = { instituicao: 'Escola Modelo', email: 'nova@x.com', nome: 'Nova Pessoa', papel: 'PROFESSOR' as const, disciplinas: ['Matemática'], status: 'PENDENTE' as const, contaPreCriada: false };
  const renderAceite = () => render(
    <MemoryRouter initialEntries={['/convite/abc']}>
      <Routes><Route path="/convite/:token" element={<AceiteConvitePage />} /></Routes>
    </MemoryRouter>
  );

  it('exige senha forte e confirmação, e depois leva ao login', async () => {
    svc.infoConvite.mockResolvedValue(info);
    svc.aceitarConvite.mockResolvedValue({ email: 'nova@x.com', papel: 'PROFESSOR' });
    renderAceite();

    expect(await screen.findByText(/Escola Modelo/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Crie uma senha'), { target: { value: 'fraca' } });
    fireEvent.change(screen.getByLabelText('Repita a senha'), { target: { value: 'fraca' } });
    fireEvent.click(screen.getByRole('button', { name: /Aceitar convite/ }));
    expect(await screen.findByText(/A senha precisa ter 8 ou mais caracteres/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Crie uma senha'), { target: { value: 'Senha1234' } });
    fireEvent.change(screen.getByLabelText('Repita a senha'), { target: { value: 'Outra1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Aceitar convite/ }));
    expect(await screen.findByText('As senhas não conferem.')).toBeInTheDocument();
    expect(svc.aceitarConvite).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Repita a senha'), { target: { value: 'Senha1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Aceitar convite/ }));
    await waitFor(() => expect(svc.aceitarConvite).toHaveBeenCalledWith('abc', { nome: undefined, senha: 'Senha1234', dataNascimento: undefined }));
    expect(await screen.findByText('Tudo certo!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir para o login/ })).toHaveAttribute('href', '/login');
  });

  it('pede data de nascimento de aluno e avisa de convite expirado', async () => {
    svc.infoConvite.mockResolvedValueOnce({ ...info, papel: 'ALUNO', nome: null });
    const { unmount } = renderAceite();
    expect(await screen.findByLabelText('Data de nascimento')).toBeInTheDocument();
    expect(screen.getByLabelText('Seu nome')).toBeInTheDocument();
    unmount();

    svc.infoConvite.mockResolvedValueOnce({ ...info, status: 'EXPIRADO' });
    renderAceite();
    expect(await screen.findByRole('alert')).toHaveTextContent('expirou');
    expect(screen.queryByLabelText('Crie uma senha')).toBeNull();
  });

  it('convite inexistente mostra erro claro', async () => {
    svc.infoConvite.mockRejectedValue({ response: { status: 404 } });
    renderAceite();
    expect(await screen.findByRole('alert')).toHaveTextContent('Convite não encontrado');
  });
});

describe('FE-306 · matriz de permissões', () => {
  it('trava a coluna do admin e as permissões reservadas, e salva só o papel alterado', async () => {
    svc.matriz.mockResolvedValue({
      papeis: ['ADMIN', 'COORDENADOR', 'PROFESSOR'],
      permissoes: [
        { chave: 'CORRIGIR', titulo: 'Corrigir respostas abertas', somenteAdmin: false },
        { chave: 'VER_AUDITORIA', titulo: 'Ver o log de auditoria', somenteAdmin: true },
      ],
      matriz: { ADMIN: ['CORRIGIR', 'VER_AUDITORIA'], COORDENADOR: ['CORRIGIR'], PROFESSOR: [] },
    });
    svc.usuarios.mockResolvedValue([{ id: 'p1', nome: 'Prof Um', email: 'p1@x.com', papel: 'PROFESSOR' }]);
    svc.salvarPapel.mockResolvedValue({
      papeis: ['ADMIN', 'COORDENADOR', 'PROFESSOR'], permissoes: [], matriz: { ADMIN: [], COORDENADOR: ['CORRIGIR'], PROFESSOR: ['CORRIGIR'] },
    });
    envolver(<PapeisView />);

    const admin = await screen.findByLabelText('Corrigir respostas abertas para Administrador (fixo)');
    expect(admin).toBeDisabled();
    expect(admin).toBeChecked();
    expect(screen.getByLabelText('Ver o log de auditoria para Professor (fixo)')).toBeDisabled();

    expect(screen.getByRole('button', { name: 'Salvar professor' })).toBeDisabled();
    const marcar = screen.getByLabelText('Corrigir respostas abertas para Professor');
    expect(marcar).not.toBeChecked();
    fireEvent.click(marcar);
    expect(marcar).toBeChecked();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar professor' })).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: 'Salvar professor' }));
    await waitFor(() => expect(svc.salvarPapel).toHaveBeenCalledWith('PROFESSOR', ['CORRIGIR']));
    expect(svc.salvarPapel).toHaveBeenCalledTimes(1);
  });
});
