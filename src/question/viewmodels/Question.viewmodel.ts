import { useState, useCallback } from 'react';
import { Question, QuestionNavigation, QuestionViewModel } from '../model/Question.types';

export const useQuestionViewModel = (
  questions: Question[],
  onAnswerSelect?: (questionId: string, answerId: string) => void,
  onNavigate?: (direction: 'previous' | 'next') => void,
  onFinish?: () => void
): QuestionViewModel => {
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