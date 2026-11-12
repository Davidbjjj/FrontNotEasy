import api from '../../services/apiClient';

/** Contrato: docs/instituicao-api.md. Todas as rotas valem para a instituição de quem está logado. */
const enc = encodeURIComponent;

const limpar = (p: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ''));

// ---------------------------------------------------------------- tipos

export interface Opcao { id: string; nome: string }

export type TipoImportacao = 'ALUNOS' | 'PROFESSORES';
export type StatusLinha = 'NOVO' | 'ATUALIZAR' | 'IGNORAR' | 'ERRO';

export interface LinhaImportacao {
  numero: number;
  dados: Record<string, string>;
  status: StatusLinha;
  erros: string[];
}
export interface ResumoImportacao { total: number; novos: number; atualizados: number; ignorados: number; erros: number }
export interface PreviaImportacao { tipo: TipoImportacao; colunas: string[]; linhas: LinhaImportacao[]; resumo: ResumoImportacao }
export interface ResultadoImportacao { resumo: ResumoImportacao; comErro: LinhaImportacao[]; convitesGerados: number }

export type PapelConvite = 'PROFESSOR' | 'COORDENADOR' | 'ALUNO';
export type StatusConvite = 'PENDENTE' | 'ACEITO' | 'EXPIRADO' | 'CANCELADO';
export interface Convite {
  id: string; email: string; nome: string | null; papel: PapelConvite;
  disciplinas: Opcao[]; status: StatusConvite;
  criadoEm: string; expiraEm: string; aceitoEm: string | null;
  /** Só vem ao criar e ao reenviar. */
  link: string | null;
}
export interface InfoConvite {
  instituicao: string; email: string; nome: string | null; papel: PapelConvite;
  disciplinas: string[]; status: StatusConvite; contaPreCriada: boolean;
}

export interface Periodo { inicio: string; fim: string; inicioAnterior: string; fimAnterior: string }
export interface Kpi { chave: 'ALUNOS_ATIVOS' | 'MEDIA_GERAL' | 'ENTREGAS_NO_PRAZO'; titulo: string; unidade: string; valor: number | null; anterior: number | null; variacaoPct: number | null }
export interface Dashboard { periodo: Periodo; disciplinaId: string | null; kpis: Kpi[]; disciplinas: Opcao[] }
export interface LinhaDetalhe {
  id: string; nome: string; professor: string | null; alunos: number; alunosAtivos: number;
  mediaGeral: number | null; entregas: number; pctNoPrazo: number | null;
}
export interface DetalheKpi { kpi: Kpi['chave']; titulo: string; periodo: Periodo; linhas: LinhaDetalhe[] }
export type Comparar = 'TURMA' | 'DISCIPLINA' | 'PROFESSOR';
export interface Comparativo { por: Comparar; periodo: Periodo; linhas: LinhaDetalhe[] }

export interface PeriodoLetivo { id: string; nome: string; inicio: string; fim: string; turmas: number; vigente: boolean }
export interface AlunoRef { id: string; nome: string; email: string }
export interface Turma { id: string; nome: string; periodoId: string; periodoNome: string; alunos: AlunoRef[]; disciplinas: Opcao[] }
export interface DisciplinaGestao { id: string; nome: string; professor: string | null; alunos: number; arquivada: boolean }
export interface Rematricula { criadas: Turma[]; ignoradas: string[]; alunosMatriculados: number }

export interface Permissao { chave: string; titulo: string; somenteAdmin: boolean }
export interface Matriz { papeis: string[]; permissoes: Permissao[]; matriz: Record<string, string[]> }
export interface MinhasPermissoes { papel: 'ADMIN' | 'COORDENADOR' | 'PROFESSOR'; instituicaoId: string | null; permissoes: string[] }
export interface UsuarioPapel { id: string; nome: string; email: string; papel: 'COORDENADOR' | 'PROFESSOR' }

export interface EventoAuditoria {
  id: string; criadoEm: string; usuarioId: string | null; usuarioNome: string | null; acao: string;
  entidade: string | null; entidadeId: string | null; descricao: string | null; valorAnterior: string | null; valorNovo: string | null;
}
export interface PaginaAuditoria {
  items: EventoAuditoria[]; page: number; size: number; totalElements: number; totalPages: number;
  acoes: string[]; usuarios: { id: string; nome: string }[];
}

export interface Integracao { chave: string; nome: string; situacao: string }
export interface ConfigInstituicao {
  corPrincipal: string | null; temLogo: boolean; logoUrl: string | null; tentativasPadrao: number | null;
  tempoLimitePadraoMinutos: number | null; gabaritoLiberadoPadrao: boolean; integracoes: Integracao[];
}
export interface Branding { corPrincipal: string | null; logoUrl: string | null }

// ---------------------------------------------------------------- serviço

function salvarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function baixar(url: string, params: Record<string, unknown>, nomePadrao: string) {
  const res = await api.get<Blob>(url, { params: limpar(params), responseType: 'blob' });
  const cd = String(res.headers?.['content-disposition'] ?? '');
  const m = /filename\*=UTF-8''([^;]+)/i.exec(cd) || /filename="?([^";]+)"?/i.exec(cd);
  salvarBlob(res.data, m ? decodeURIComponent(m[1]) : nomePadrao);
}

export const gestaoService = {
  // permissões (FE-306)
  async minhasPermissoes(signal?: AbortSignal) { return (await api.get<MinhasPermissoes>('/instituicao/minhas-permissoes', { signal })).data; },
  async matriz(signal?: AbortSignal) { return (await api.get<Matriz>('/instituicao/permissoes', { signal })).data; },
  async salvarPapel(papel: string, permissoes: string[]) { return (await api.put<Matriz>('/instituicao/permissoes', { papel, permissoes })).data; },
  async usuarios(signal?: AbortSignal) { return (await api.get<UsuarioPapel[]>('/instituicao/usuarios', { signal })).data; },
  async definirPapel(id: string, papel: UsuarioPapel['papel']) { return (await api.put<UsuarioPapel>(`/instituicao/usuarios/${enc(id)}/papel`, { papel })).data; },

  // auditoria (FE-307)
  async auditoria(f: { usuarioId?: string; acao?: string; inicio?: string; fim?: string; page?: number }, signal?: AbortSignal) {
    return (await api.get<PaginaAuditoria>('/instituicao/auditoria', { params: limpar({ ...f, size: 20 }), signal })).data;
  },

  // importação (FE-301)
  async previaImportacao(tipo: TipoImportacao, arquivo: File) {
    const form = new FormData();
    form.append('tipo', tipo);
    form.append('arquivo', arquivo);
    return (await api.post<PreviaImportacao>('/instituicao/importacao/previa', form)).data;
  },
  async confirmarImportacao(tipo: TipoImportacao, arquivo: File) {
    const form = new FormData();
    form.append('tipo', tipo);
    form.append('arquivo', arquivo);
    return (await api.post<ResultadoImportacao>('/instituicao/importacao/confirmar', form)).data;
  },

  // convites (FE-302)
  async convites(signal?: AbortSignal) { return (await api.get<Convite[]>('/instituicao/convites', { signal })).data; },
  async convidar(c: { email: string; nome?: string; papel: PapelConvite; disciplinaIds: string[] }) {
    return (await api.post<Convite>('/instituicao/convites', c)).data;
  },
  async reenviarConvite(id: string) { return (await api.post<Convite>(`/instituicao/convites/${enc(id)}/reenviar`)).data; },
  async cancelarConvite(id: string) { return (await api.delete<Convite>(`/instituicao/convites/${enc(id)}`)).data; },
  async infoConvite(token: string, signal?: AbortSignal) { return (await api.get<InfoConvite>(`/convites/${enc(token)}`, { signal })).data; },
  async aceitarConvite(token: string, d: { nome?: string; senha: string; dataNascimento?: string }) {
    return (await api.post<{ email: string; papel: string }>(`/convites/${enc(token)}/aceitar`, d)).data;
  },

  // dashboard e comparativos (FE-303 / FE-305)
  async dashboard(f: { inicio?: string; fim?: string; disciplinaId?: string }, signal?: AbortSignal) {
    return (await api.get<Dashboard>('/instituicao/dashboard', { params: limpar(f), signal })).data;
  },
  async detalheKpi(kpi: string, f: { inicio?: string; fim?: string; disciplinaId?: string }, signal?: AbortSignal) {
    return (await api.get<DetalheKpi>('/instituicao/dashboard/detalhe', { params: limpar({ kpi, ...f }), signal })).data;
  },
  async comparativo(f: { por: Comparar; ids?: string[]; inicio?: string; fim?: string }, signal?: AbortSignal) {
    return (await api.get<Comparativo>('/instituicao/relatorios/comparativo', {
      params: { por: f.por, inicio: f.inicio || undefined, fim: f.fim || undefined, ...(f.ids && f.ids.length ? { ids: f.ids } : {}) },
      paramsSerializer: { indexes: null }, signal,
    })).data;
  },
  async exportarComparativo(f: { por: Comparar; ids?: string[]; inicio?: string; fim?: string }, formato: 'csv' | 'pdf') {
    const res = await api.get<Blob>('/instituicao/relatorios/comparativo/exportar', {
      params: { por: f.por, inicio: f.inicio, fim: f.fim, formato, ...(f.ids && f.ids.length ? { ids: f.ids } : {}) },
      paramsSerializer: { indexes: null }, responseType: 'blob',
    });
    salvarBlob(res.data, `comparativo-${f.por.toLowerCase()}.${formato}`);
  },

  // períodos e turmas (FE-304)
  async periodos(signal?: AbortSignal) { return (await api.get<PeriodoLetivo[]>('/instituicao/periodos', { signal })).data; },
  async criarPeriodo(p: { nome: string; inicio: string; fim: string }) { return (await api.post<PeriodoLetivo>('/instituicao/periodos', p)).data; },
  async editarPeriodo(id: string, p: { nome: string; inicio: string; fim: string }) { return (await api.put<PeriodoLetivo>(`/instituicao/periodos/${enc(id)}`, p)).data; },
  async turmas(periodoId?: string, signal?: AbortSignal) { return (await api.get<Turma[]>('/instituicao/turmas', { params: limpar({ periodoId }), signal })).data; },
  async criarTurma(t: { nome: string; periodoId: string; alunoIds: string[]; disciplinaIds: string[] }) { return (await api.post<Turma>('/instituicao/turmas', t)).data; },
  async editarTurma(id: string, t: { nome: string; periodoId?: string; alunoIds: string[]; disciplinaIds: string[] }) { return (await api.put<Turma>(`/instituicao/turmas/${enc(id)}`, t)).data; },
  async rematricular(r: { turmaIds: string[]; periodoDestinoId: string; sufixoNome?: string; excluirAlunoIds?: string[] }) {
    return (await api.post<Rematricula>('/instituicao/turmas/rematricula', r)).data;
  },
  async disciplinasGestao(signal?: AbortSignal) { return (await api.get<DisciplinaGestao[]>('/instituicao/disciplinas-gestao', { signal })).data; },
  async arquivarDisciplina(id: string, arquivada: boolean) {
    return (await api.patch<DisciplinaGestao>(`/instituicao/disciplinas/${enc(id)}/arquivar`, { arquivada })).data;
  },
  async alunos(signal?: AbortSignal) { return (await api.get<AlunoRef[]>('/instituicao/alunos', { signal })).data; },

  // boletim e relatórios externos (FE-308)
  boletimTurma: (turmaId: string) => baixar(`/instituicao/boletim/turma/${enc(turmaId)}`, {}, 'boletins.pdf'),
  boletimAluno: (alunoId: string, periodoId: string) => baixar(`/instituicao/boletim/aluno/${enc(alunoId)}`, { periodoId }, 'boletim.pdf'),
  riscoEvasao: (turmaId: string, formato: 'pdf' | 'csv') => baixar('/instituicao/relatorios/risco-evasao', { turmaId, formato }, `risco-evasao.${formato}`),

  // configurações (FE-309)
  async config(signal?: AbortSignal) { return (await api.get<ConfigInstituicao>('/instituicao/configuracoes', { signal })).data; },
  async salvarConfig(c: { corPrincipal: string | null; tentativasPadrao: number | null; tempoLimitePadraoMinutos: number | null; gabaritoLiberadoPadrao: boolean }) {
    return (await api.put<ConfigInstituicao>('/instituicao/configuracoes', c)).data;
  },
  async enviarLogo(arquivo: File) {
    const form = new FormData();
    form.append('logo', arquivo);
    return (await api.post<ConfigInstituicao>('/instituicao/configuracoes/logo', form)).data;
  },
  async removerLogo() { return (await api.delete<ConfigInstituicao>('/instituicao/configuracoes/logo')).data; },
  async minhaBranding(signal?: AbortSignal) { return (await api.get<Branding>('/branding/minha', { signal })).data; },
};

export { mensagemErro } from '../../professor/professorService';
