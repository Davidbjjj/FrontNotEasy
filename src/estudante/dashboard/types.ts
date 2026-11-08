/**
 * Resposta de GET /estudantes/{id}/dashboard (DashboardAlunoDTO no back-end).
 * Todos os instantes são ISO 8601 com offset, no fuso do aluno.
 */
export interface ListaEmAndamento {
  listaId: string;
  titulo: string;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  questoesRespondidas: number;
  totalQuestoes: number;
  ultimaAtividadeEm: string | null;
}

export interface ProximaEntrega {
  /** Id do evento/atividade (abre em /atividades/:id) */
  eventoId: string;
  titulo: string;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  prazo: string;
}

export interface UltimaNota {
  listaId: string;
  titulo: string;
  disciplinaId: string | null;
  disciplinaNome: string | null;
  nota: number;
  notaMaxima: number;
  /** Última resposta da lista (ISO 8601) */
  corrigidaEm: string | null;
}

export interface SequenciaEstudo {
  /** Dias seguidos com resposta, contando até hoje (ou até ontem, se hoje ainda não teve) */
  diasConsecutivos: number;
  ultimaAtividadeEm: string | null;
}

export interface StudentDashboard {
  estudanteId: string;
  nome: string;
  /** Fuso IANA usado nos cálculos, ex.: America/Sao_Paulo */
  fusoHorario: string;
  totalDisciplinas: number;
  sequencia: SequenciaEstudo;
  /** Mais recente primeiro (até 10) */
  emAndamento: ListaEmAndamento[];
  /** Pendentes, mais próximas primeiro (até 5) */
  proximasEntregas: ProximaEntrega[];
  /** Listas finalizadas, mais recente primeiro (até 5) */
  ultimasNotas: UltimaNota[];
}
