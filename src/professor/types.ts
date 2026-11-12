// Tipos do contrato descrito em docs/professor-api.md (FE-201 a FE-209).

export interface Opcao {
  id: string;
  nome: string;
}

// ---------------------------------------------------------------- FE-201 correção

export interface PendenteCorrecao {
  respostaId: number;
  listaId: string;
  listaTitulo: string;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  questaoId: number;
  enunciado: string;
  estudanteId: string;
  estudanteNome: string;
  enviadaEm: string | null;
}

export interface FilaCorrecao {
  total: number;
  items: PendenteCorrecao[];
  listas: Opcao[];
  disciplinas: Opcao[];
}

export interface ImagemQuestao {
  urlPublica: string;
  nomeArquivo?: string;
}

export interface DetalheCorrecao {
  respostaId: number;
  listaId: string;
  listaTitulo: string;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  questaoId: number;
  cabecalho: string | null;
  enunciado: string;
  imagens: ImagemQuestao[];
  assunto: string | null;
  rubrica: string | null;
  estudanteId: string;
  estudanteNome: string;
  textoResposta: string;
  notaQuestao: number | null;
  feedback: string | null;
  corrigida: boolean;
  enviadaEm: string | null;
  restantes: number;
}

export interface ResultadoCorrecao {
  respostaId: number;
  restantes: number;
  notaLancada: boolean;
}

// ---------------------------------------------------------------- FE-202 banco de questões

export type Dificuldade = 'FACIL' | 'MEDIA' | 'DIFICIL';

export interface QuestaoBanco {
  id: number;
  tipo: 'OBJETIVA' | 'ABERTA';
  cabecalho: string | null;
  enunciado: string;
  alternativas: string[];
  gabarito: number | null;
  assunto: string | null;
  explicacao: string | null;
  rubrica: string | null;
  dificuldade: Dificuldade | null;
  tags: string[];
  listaId: string;
  listaTitulo: string;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  imagens: ImagemQuestao[];
}

export interface PaginaBanco {
  items: QuestaoBanco[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FiltrosBanco {
  assuntos: string[];
  tags: string[];
  disciplinas: Opcao[];
}

export interface BuscaBanco {
  q?: string;
  assunto?: string;
  dificuldade?: string;
  tag?: string;
  disciplinaId?: string;
  tipo?: string;
  page?: number;
  size?: number;
}

export interface ResultadoLote {
  adicionadas: number;
  ignoradas: number;
  listaId: string;
}

// ---------------------------------------------------------------- listas (FE-203, 205, 206)

export type RegraNota = 'MAIOR' | 'ULTIMA';

export interface ListaConfig {
  id: string;
  titulo: string;
  professor: string | null;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  status: 'RASCUNHO' | 'PUBLICADA';
  abreEm: string | null;
  fechaEm: string | null;
  maxTentativas: number | null;
  regraNota: RegraNota;
  tempoLimiteMinutos: number | null;
  embaralharQuestoes: boolean;
  embaralharAlternativas: boolean;
}

export interface ConfigListaInput {
  abreEm: string | null;
  fechaEm: string | null;
  maxTentativas: number | null;
  regraNota: RegraNota;
  tempoLimiteMinutos: number | null;
  embaralharQuestoes: boolean;
  embaralharAlternativas: boolean;
}

export interface DuplicarInput {
  disciplinaId: string;
  titulo: string;
  abreEm: string | null;
  fechaEm: string | null;
}

export interface ReabrirResultado {
  lista: ListaConfig;
  notificados: number;
}

export interface AssuntoFraco {
  assunto: string;
  taxaAcerto: number;
  respostas: number;
  questoes: number;
}

export interface ReforcoInput {
  disciplinaId: string;
  titulo: string;
  assuntos: string[];
  estudanteIds: string[];
  quantidadePorAssunto?: number;
  publicar: boolean;
  fechaEm?: string | null;
}

export interface ReforcoResultado {
  lista: ListaConfig;
  questoes: number;
  alunos: number;
}

export interface DisciplinaProfessor {
  id: string;
  nome: string;
}

// ---------------------------------------------------------------- FE-204 alunos em risco / FE-207 perfil

export type MotivoRisco = 'MEDIA_BAIXA' | 'SEM_ACESSO' | 'LISTAS_ATRASADAS';

export interface CriteriosRisco {
  mediaMinima: number;
  diasSemAcesso: number;
  listasAtrasadas: number;
  regra: string;
}

export interface AlunoRisco {
  estudanteId: string;
  nome: string;
  email: string;
  media: number | null;
  ultimoAcesso: string | null;
  diasSemAcesso: number | null;
  listasAtrasadas: number;
  listasPendentes: number;
  motivos: MotivoRisco[];
  nivel: 'ALTO' | 'MEDIO' | 'BAIXO';
}

export interface PainelRisco {
  criterios: CriteriosRisco;
  items: AlunoRisco[];
  totalAlunos: number;
  disciplinas: Opcao[];
}

export type StatusEntrega = 'ENTREGUE' | 'ATRASADA' | 'NAO_FEITA';

export interface HistoricoLista {
  listaId: string;
  titulo: string;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  nota: number | null;
  status: StatusEntrega;
  prazo: string | null;
  entregueEm: string | null;
  tentativas: number;
}

export interface PerfilAluno {
  id: string;
  nome: string;
  email: string;
  instituicao: string | null;
  disciplinas: Opcao[];
  resumo: { media: number | null; entregues: number; atrasadas: number; naoFeitas: number };
  historico: HistoricoLista[];
  /** Mesmo formato do GET /estudante/{id}/evolucao (FE-105). */
  evolucao: import('../estudante/evolucao/types').Evolucao;
  acessos: string[];
}

// ---------------------------------------------------------------- FE-208 exportação

export interface ColunaExportacao {
  chave: string;
  titulo: string;
}

export interface ExportarInput {
  escopo: 'LISTA' | 'DISCIPLINA';
  alvoId: string;
  formato: 'CSV' | 'PDF';
  colunas: string[];
}

export interface Exportacao {
  id: string;
  escopo: 'LISTA' | 'DISCIPLINA';
  alvoNome: string;
  formato: 'CSV' | 'PDF';
  status: 'PROCESSANDO' | 'PRONTA' | 'ERRO';
  nomeArquivo: string | null;
  erro: string | null;
  criadaEm: string;
  concluidaEm: string | null;
}

// ---------------------------------------------------------------- FE-209 mural

export interface Aviso {
  id: string;
  disciplinaId: string;
  titulo: string;
  texto: string;
  fixado: boolean;
  criadoEm: string;
  autor: string | null;
  anexo: { nome: string; tipo: string; url: string } | null;
}
