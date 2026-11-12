import api, { API_BASE } from '../services/apiClient';
import type {
  Aviso, AssuntoFraco, BuscaBanco, ColunaExportacao, ConfigListaInput, DetalheCorrecao, DisciplinaProfessor,
  DuplicarInput, Exportacao, ExportarInput, FilaCorrecao, FiltrosBanco, ListaConfig, PaginaBanco, PainelRisco,
  PerfilAluno, QuestaoBanco, ReabrirResultado, ReforcoInput, ReforcoResultado, ResultadoCorrecao, ResultadoLote,
} from './types';

/** Contrato: docs/professor-api.md. Todas as rotas exigem PROFESSOR (ou INSTITUICAO). */
const enc = encodeURIComponent;

/** Remove chaves vazias para não enviar `?q=&tag=` à API. */
const limpar = (p: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const professorService = {
  // ---- FE-201
  async fila(
    filtros: { listaId?: string; disciplinaId?: string; busca?: string },
    signal?: AbortSignal
  ): Promise<FilaCorrecao> {
    const { data } = await api.get<FilaCorrecao>('/correcao/pendentes', { params: limpar(filtros), signal });
    return data;
  },
  async detalheResposta(respostaId: number, signal?: AbortSignal): Promise<DetalheCorrecao> {
    const { data } = await api.get<DetalheCorrecao>(`/correcao/respostas/${respostaId}`, { signal });
    return data;
  },
  async corrigir(respostaId: number, nota: number, feedback: string): Promise<ResultadoCorrecao> {
    const { data } = await api.put<ResultadoCorrecao>(`/correcao/respostas/${respostaId}`, { nota, feedback });
    return data;
  },

  // ---- FE-202
  async buscarBanco(busca: BuscaBanco, signal?: AbortSignal): Promise<PaginaBanco> {
    const { data } = await api.get<PaginaBanco>('/banco-questoes', { params: limpar({ ...busca }), signal });
    return data;
  },
  async filtrosBanco(signal?: AbortSignal): Promise<FiltrosBanco> {
    const { data } = await api.get<FiltrosBanco>('/banco-questoes/filtros', { signal });
    return data;
  },
  async detalheQuestao(id: number, signal?: AbortSignal): Promise<QuestaoBanco> {
    const { data } = await api.get<QuestaoBanco>(`/banco-questoes/${id}`, { signal });
    return data;
  },
  async classificarQuestao(
    id: number,
    campos: { tags?: string[]; dificuldade?: string | null; assunto?: string | null }
  ): Promise<QuestaoBanco> {
    const { data } = await api.patch<QuestaoBanco>(`/banco-questoes/${id}`, campos);
    return data;
  },
  async adicionarALista(listaId: string, questaoIds: number[]): Promise<ResultadoLote> {
    const { data } = await api.post<ResultadoLote>('/banco-questoes/adicionar-a-lista', { listaId, questaoIds });
    return data;
  },

  async criarQuestao(
    listaId: string,
    q: {
      tipo: 'OBJETIVA' | 'ABERTA'; cabecalho?: string; enunciado: string; alternativas?: string[]; gabarito?: number;
      rubrica?: string; assunto?: string; dificuldade?: string; tags?: string[];
    }
  ): Promise<void> {
    await api.post(`/listas/${enc(listaId)}/questoes`, q);
  },

  // ---- listas
  async listasDoProfessor(professorId: string, signal?: AbortSignal): Promise<ListaConfig[]> {
    const { data } = await api.get<ListaConfig[]>(`/listas/professor/${enc(professorId)}`, { signal });
    return data;
  },
  async disciplinasDoProfessor(professorId: string, signal?: AbortSignal): Promise<DisciplinaProfessor[]> {
    const { data } = await api.get<DisciplinaProfessor[]>(`/listas/professor/${enc(professorId)}/disciplinas`, { signal });
    return data;
  },
  async configuracao(listaId: string, signal?: AbortSignal): Promise<ListaConfig> {
    const { data } = await api.get<ListaConfig>(`/listas/${enc(listaId)}/configuracao`, { signal });
    return data;
  },
  async salvarConfiguracao(listaId: string, cfg: ConfigListaInput): Promise<ListaConfig> {
    const { data } = await api.put<ListaConfig>(`/listas/${enc(listaId)}/configuracao`, cfg);
    return data;
  },
  async publicar(listaId: string): Promise<ListaConfig> {
    const { data } = await api.post<ListaConfig>(`/listas/${enc(listaId)}/publicar`);
    return data;
  },
  async duplicar(listaId: string, input: DuplicarInput): Promise<ListaConfig> {
    const { data } = await api.post<ListaConfig>(`/listas/${enc(listaId)}/duplicar`, input);
    return data;
  },
  async reabrir(listaId: string, fechaEm: string, permitirNovaTentativa: boolean): Promise<ReabrirResultado> {
    const { data } = await api.post<ReabrirResultado>(`/listas/${enc(listaId)}/reabrir`, { fechaEm, permitirNovaTentativa });
    return data;
  },
  async assuntosFracos(disciplinaId: string, limite = 5, signal?: AbortSignal): Promise<AssuntoFraco[]> {
    const { data } = await api.get<AssuntoFraco[]>(`/disciplinas/${enc(disciplinaId)}/assuntos-fracos`, {
      params: { limite }, signal,
    });
    return data;
  },
  async criarReforco(input: ReforcoInput): Promise<ReforcoResultado> {
    const { data } = await api.post<ReforcoResultado>('/listas/reforco', input);
    return data;
  },

  // ---- avisar alunos / risco / perfil
  async avisarAlunos(estudanteIds: string[], mensagem: string, titulo?: string): Promise<number> {
    const { data } = await api.post<{ enviados: number }>('/professor/avisar-alunos', { estudanteIds, mensagem, titulo });
    return data.enviados;
  },
  async alunosEmRisco(
    filtros: { disciplinaId?: string; todos?: boolean },
    signal?: AbortSignal
  ): Promise<PainelRisco> {
    const { data } = await api.get<PainelRisco>('/professor/alunos-em-risco', { params: limpar(filtros), signal });
    return data;
  },
  async perfilAluno(estudanteId: string, signal?: AbortSignal): Promise<PerfilAluno> {
    const { data } = await api.get<PerfilAluno>(`/professor/alunos/${enc(estudanteId)}/perfil`, { signal });
    return data;
  },

  // ---- FE-208
  async colunasExportacao(signal?: AbortSignal): Promise<ColunaExportacao[]> {
    const { data } = await api.get<ColunaExportacao[]>('/exportacoes/colunas', { signal });
    return data;
  },
  async exportar(input: ExportarInput): Promise<Exportacao> {
    const { data } = await api.post<Exportacao>('/exportacoes', input);
    return data;
  },
  async exportacoes(signal?: AbortSignal): Promise<Exportacao[]> {
    const { data } = await api.get<Exportacao[]>('/exportacoes', { signal });
    return data;
  },
  async baixarExportacao(e: Pick<Exportacao, 'id' | 'nomeArquivo'>): Promise<void> {
    const { data } = await api.get<Blob>(`/exportacoes/${enc(e.id)}/arquivo`, { responseType: 'blob' });
    salvarBlob(data, e.nomeArquivo || 'notas');
  },

  // ---- FE-209
  async avisos(disciplinaId: string, signal?: AbortSignal): Promise<Aviso[]> {
    const { data } = await api.get<Aviso[]>(`/disciplinas/${enc(disciplinaId)}/avisos`, { signal });
    return data;
  },
  async publicarAviso(
    disciplinaId: string,
    aviso: { titulo: string; texto: string; fixado: boolean; anexo?: File | null }
  ): Promise<Aviso> {
    const form = new FormData();
    form.append('titulo', aviso.titulo);
    form.append('texto', aviso.texto);
    form.append('fixado', String(aviso.fixado));
    if (aviso.anexo) form.append('anexo', aviso.anexo);
    const { data } = await api.post<Aviso>(`/disciplinas/${enc(disciplinaId)}/avisos`, form);
    return data;
  },
  async fixarAviso(id: string, fixado: boolean): Promise<Aviso> {
    const { data } = await api.patch<Aviso>(`/avisos/${enc(id)}/fixar`, { fixado });
    return data;
  },
  async excluirAviso(id: string): Promise<void> {
    await api.delete(`/avisos/${enc(id)}`);
  },
  async baixarAnexo(aviso: Pick<Aviso, 'id' | 'anexo'>): Promise<void> {
    const { data } = await api.get<Blob>(`/avisos/${enc(aviso.id)}/anexo`, { responseType: 'blob' });
    salvarBlob(data, aviso.anexo?.nome || 'anexo');
  },
};

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

/** Mensagem de erro amigável a partir da resposta da API (ResponseStatusException ou texto puro). */
export function mensagemErro(e: any, padrao: string): string {
  const d = e?.response?.data;
  if (typeof d === 'string' && d.trim()) return d;
  return d?.message || d?.error || e?.message || padrao;
}

/** Imagens de questão vêm como caminho relativo da API (ex.: /api/imagens/questao/x.png). */
export const urlImagem = (raw: string | null | undefined): string =>
  !raw ? '' : raw.startsWith('/') ? `${API_BASE}${raw}` : raw;
