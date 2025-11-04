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
  progress: number; // 0-100
  currentQuestion: number;
  totalQuestions: number;
  listaId?: string; // Adicione o ID da lista
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

export interface QuestionProps {
  question?: Question; // Torna opcional
  questions: Question[];
  listaId: string; // Adicione listaId como prop obrigatória
  estudanteId: string; // Adicione estudanteId como prop obrigatória
  onAnswerSelect?: (questionId: string, answerId: string, alternativaIndex: number) => void;
  onNavigate?: (direction: 'previous' | 'next') => void;
  onFinish?: () => void;
  className?: string;
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
  className?: string;
}

export interface QuestionNavigationProps {
  navigation: QuestionNavigation;
  onNavigate: (direction: 'previous' | 'next') => void;
  onFinish: () => void;
  className?: string;
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