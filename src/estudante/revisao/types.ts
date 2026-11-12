/** MANUAL: o professor libera o gabarito da lista (PUT /listas/{id}/gabarito-liberado). */
export type RegraGabarito = 'APOS_ENTREGA' | 'APOS_PRAZO' | 'MANUAL';

export interface AssuntoRef {
  id: string;
  nome: string;
}

export interface QuestaoRevisaoBase {
  questaoId: string;
  numero: number;
  enunciado: string;
  assunto: AssuntoRef | null;
}

export interface QuestaoObjetivaRevisao extends QuestaoRevisaoBase {
  tipo: 'OBJETIVA';
  alternativas: string[];
  /** Índice (0 = A) da alternativa marcada; null se o aluno deixou em branco */
  minhaResposta: number | null;
  respostaCerta: number;
  explicacao: string | null;
}

export interface QuestaoAbertaRevisao extends QuestaoRevisaoBase {
  tipo: 'ABERTA';
  minhaResposta: string | null;
  /** null enquanto o professor não corrigiu */
  nota: number | null;
  notaMaxima: number;
  feedback: string | null;
}

export type QuestaoRevisao = QuestaoObjetivaRevisao | QuestaoAbertaRevisao;

export interface RevisaoLista {
  listaId: string;
  titulo: string;
  disciplina: string;
  regraGabarito: RegraGabarito;
  /** false: o back-end NÃO envia gabarito/explicações (a regra ainda não liberou) */
  gabaritoLiberado: boolean;
  /** ISO 8601; quando o gabarito será liberado (regra APOS_PRAZO) */
  liberadoEm: string | null;
  nota: number | null;
  notaMaxima: number;
  questoes: QuestaoRevisao[];
}
