// src/model/Questoes.types.ts

export interface QuestaoEstudante {
  id: number;
  cabecalho: string;
  enunciado: string;
  alternativas: string[];
  gabarito: number;
  listaId?: string;
  listaTitulo?: string;
  respondida?: boolean;
  correta?: boolean;
  respostaEstudante?: number;
}

export interface QuestaoLandingViewModel {
  questoes: QuestaoEstudante[];
  loading: boolean;
  error: string | null;
  handleQuestaoSelect: (questaoId: number) => void;
  handleRefresh: () => void;
}

export interface QuestoesLandingProps {
  estudanteId: string;
  onQuestaoSelect?: (questaoId: number) => void;
  className?: string;
}