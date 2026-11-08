export interface ProximaLista {
  id: string;
  titulo: string;
  disciplina: string;
  /** ISO 8601; listas sem prazo vão para o fim */
  prazo: string | null;
  respondidas: number;
  total: number;
}

export interface UltimaNota {
  listaId: string;
  titulo: string;
  disciplina: string;
  nota: number;
  notaMaxima: number;
  /** ISO 8601 */
  corrigidaEm: string;
}

export interface ListaEmAndamento {
  listaId: string;
  titulo: string;
  disciplina: string;
  respondidas: number;
  total: number;
}

export interface SequenciaEstudo {
  /** Dias seguidos com atividade, contando até hoje (ou até ontem, se hoje ainda não teve) */
  atual: number;
  recorde: number;
  /** Já houve atividade hoje? Se não, a sequência está "em risco" */
  ativoHoje: boolean;
}

export interface StudentDashboard {
  totalDisciplinas: number;
  proximasListas: ProximaLista[];
  ultimasNotas: UltimaNota[];
  sequencia: SequenciaEstudo;
  emAndamento: ListaEmAndamento | null;
}
