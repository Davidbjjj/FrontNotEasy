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
  onAnswerSelect?: (questionId: string, answerId: string, alternativaIndex: number) => void;
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
  selectedAnswer?: string;
  onAnswerSelect: (answerId: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface QuestionNavigationProps {
  navigation: QuestionNavigation;
  onNavigate: (direction: 'previous' | 'next') => void;
  onFinish: () => void;
  disabled?: boolean;
  className?: string;
}