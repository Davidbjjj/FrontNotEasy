import { useState, useCallback } from 'react';
import { Question, QuestionNavigation, QuestionViewModel } from '../model/Question.types';

// Mock data - substituir por chamada API real
const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'Desafio I: funções do 2° grau e geometria',
    content: 'O lucro mensal L(x), em milhares de reais, de uma empresa depende do preço x, em reais, do produto que pode ser descrito pela função L(x) = -2x² + 16x - 20. Qual deve ser o preço do produto para se obter o maior lucro possível?',
    options: [
      { id: 'A', label: 'A', value: 'A', text: '2 reais' },
      { id: 'B', label: 'B', value: 'B', text: '4 reais' },
      { id: 'C', label: 'C', value: 'C', text: '6 reais' },
      { id: 'D', label: 'D', value: 'D', text: '8 reais' },
    ],
    correctAnswer: 'B',
    explanation: 'Para encontrar o preço que maximiza o lucro, precisamos encontrar o vértice da parábola. O x do vértice é dado por x = -b/(2a). Neste caso, a = -2, b = 16, então x = -16/(2*(-2)) = 4.',
    subject: 'Matemática',
    tags: ['Função de segundo grau'],
    difficulty: 'medium',
    progress: 100,
    currentQuestion: 20,
    totalQuestions: 20,
  },
  // Adicionar mais questões mock aqui
];

export const useQuestionViewModel = (
  initialQuestions?: Question[],
  onAnswerSelect?: (questionId: string, answerId: string) => void,
  onNavigate?: (direction: 'previous' | 'next') => void,
  onFinish?: () => void
): QuestionViewModel => {
  const [questions] = useState<Question[]>(initialQuestions || mockQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const navigation: QuestionNavigation = {
    current: currentQuestionIndex + 1,
    total: questions.length,
    hasPrevious: currentQuestionIndex > 0,
    hasNext: currentQuestionIndex < questions.length - 1,
  };

  const handleAnswerSelect = useCallback((answerId: string) => {
    setSelectedAnswer(answerId);
    setIsAnswered(true);
    
    if (onAnswerSelect) {
      onAnswerSelect(currentQuestion.id, answerId);
    }
  }, [currentQuestion.id, onAnswerSelect]);

  const handleNavigate = useCallback((direction: 'previous' | 'next') => {
    if (direction === 'previous' && navigation.hasPrevious) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else if (direction === 'next' && navigation.hasNext) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
    
    if (onNavigate) {
      onNavigate(direction);
    }
  }, [navigation.hasPrevious, navigation.hasNext, onNavigate]);

  const handleFinish = useCallback(() => {
    if (onFinish) {
      onFinish();
    }
  }, [onFinish]);

  return {
    currentQuestion,
    selectedAnswer,
    isAnswered,
    navigation,
    handleAnswerSelect,
    handleNavigate,
    handleFinish,
  };
};