// src/model/Question.types.ts

export interface Question {
  id: string;
  title: string;
  content: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
  listaId?: string;
  imagens?: Array<any>;
  /** FE-201: "ABERTA" = resposta escrita, corrigida pelo professor. Ausente = objetiva. */
  tipo?: 'OBJETIVA' | 'ABERTA';
  /** Só o professor recebe: critérios de correção de questão aberta. */
  rubrica?: string;
  assunto?: string;
  dificuldade?: 'FACIL' | 'MEDIA' | 'DIFICIL' | null;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  text: string;
}

export interface QuestionNavigation {
  current: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface QuestionViewModel {
  currentQuestion: Question;
  selectedAnswer: string | null;
  isAnswered: boolean;
  navigation: QuestionNavigation;
  handleAnswerSelect: (answerId: string) => void;
  handleNavigate: (direction: 'previous' | 'next') => void;
  handleFinish: () => void;
}

export interface QuestionProps {
  question?: Question;
  questions: Question[];
  listaId: string;
  estudanteId: string;
  /** Map of questionId -> selected answer letter (e.g. { '12': 'A' }) */
  initialAnswers?: Record<string, string>;
  /** Instante final (epoch ms) quando a lista tem tempo limite (FE-205). */
  deadline?: number;
  onAnswerSelect?: (questionId: string, answerId: string, alternativaIndex: number) => void;
  onOptionSelect?: (questionId: string, answerId: string, alternativaIndex: number) => void;
  onNavigate?: (direction: 'previous' | 'next') => void;
  onFinish?: (respostas: RespostaEstudanteQuestaoDTO[]) => void;
  className?: string;
}

// Tipos para as respostas do backend
export interface RespostaEstudanteQuestaoDTO {
  respostaId: number;
  questaoId: number;
  estudanteId: string;
  nomeEstudante: string;
  alternativa: number;
  correta: boolean;
}

export interface RespostasListaDTO {
  listaId: string;
  tituloLista: string;
  respostas: RespostaEstudanteQuestaoDTO[];
}

// Resultado final
export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  respostas: RespostaEstudanteQuestaoDTO[];
  // visão do estudante para a lista (quando disponível)
  visao?: {
    porcentagemAcertos?: number;
    totalQuestoes?: number;
    respondida?: boolean;
    nota?: number;
    questoesRespondidas?: number;
    questoesCorretas?: number;
  };
}

export interface QuestionHeaderProps {
  title: string;
  subject: string;
  progress: number;
  className?: string;
}

export interface QuestionContentProps {
  content: string;
  options: QuestionOption[];
  imagens?: Array<any>;
  questionId?: string;
  selectedAnswer?: string;
  onAnswerSelect: (answerId: string) => void;
  onSubmitAnswer?: () => Promise<void> | void;
  isSubmitting?: boolean;
  isAnswered?: boolean;
  onOptionSelect?: (questionId: string, answerId: string, alternativaIndex: number) => void;
  disabled?: boolean;
  className?: string;
  /** "ABERTA": mostra uma caixa de texto no lugar das alternativas; o texto vive em `selectedAnswer`. */
  tipo?: 'OBJETIVA' | 'ABERTA';
}

export interface QuestionNavigationProps {
  navigation: QuestionNavigation;
  onNavigate: (direction: 'previous' | 'next') => void;
  onFinish: () => void;
  disabled?: boolean;
  className?: string;
}