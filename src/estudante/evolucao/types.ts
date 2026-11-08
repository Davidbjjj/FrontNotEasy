export interface DisciplinaRef {
  id: string;
  nome: string;
}

export interface NotaPonto {
  listaId: string;
  titulo: string;
  disciplinaId: string;
  /** ISO 8601 da correção/entrega */
  data: string;
  nota: number;
  notaMaxima: number;
}

export interface DesempenhoAssunto {
  id: string;
  nome: string;
  disciplinaId: string;
  /** Questões objetivas respondidas corretamente */
  acertos: number;
  /** Questões objetivas respondidas (em branco conta como errada) */
  total: number;
}

export interface Evolucao {
  disciplinas: DisciplinaRef[];
  notas: NotaPonto[];
  assuntos: DesempenhoAssunto[];
}

export interface QuestaoErrada {
  questaoId: string;
  listaId: string;
  listaTitulo: string;
  numero: number;
  enunciado: string;
  alternativas: string[];
  minhaResposta: number | null;
  respostaCerta: number;
  explicacao: string | null;
}

export interface ErradasAssunto {
  assunto: { id: string; nome: string };
  disciplina: string;
  questoes: QuestaoErrada[];
}
