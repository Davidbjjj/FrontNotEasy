import { useState, useCallback } from 'react';
import { Question, QuestionNavigation, QuestionViewModel } from '../model/Question.types';
import { respostaService } from '../service/api/respostaService';

export const useQuestionViewModel = (
  questions: Question[],
  listaId: string,
  estudanteId: string,
  onAnswerSelect?: (questionId: string, answerId: string, alternativaIndex: number) => void,
  onNavigate?: (direction: 'previous' | 'next') => void,
  onFinish?: () => void
): QuestionViewModel => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [respostasEnviadas, setRespostasEnviadas] = useState<Set<string>>(new Set());

  const currentQuestion = questions[currentQuestionIndex];

  const navigation: QuestionNavigation = {
    current: currentQuestionIndex + 1,
    total: questions.length,
    hasPrevious: currentQuestionIndex > 0,
    hasNext: currentQuestionIndex < questions.length - 1,
  };

  const handleAnswerSelect = useCallback(async (answerId: string) => {
  try {
    setSelectedAnswer(answerId);
    setIsAnswered(true);
    
    const alternativaIndex = respostaService.converterLetraParaIndice(answerId);
    
    await respostaService.enviarResposta({
      estudanteId: estudanteId,
      questaoId: parseInt(currentQuestion.id),
      alternativa: alternativaIndex,
      listaId: listaId // Adicionar listaId
    });

    setRespostasEnviadas(prev => new Set(prev).add(currentQuestion.id));

    if (onAnswerSelect) {
      onAnswerSelect(currentQuestion.id, answerId, alternativaIndex);
    }

    console.log(`Resposta ${answerId} enviada para questão ${currentQuestion.id} na lista ${listaId}`);
    
  } catch (error) {
    console.error('Erro ao enviar resposta:', error);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }
}, [currentQuestion.id, estudanteId, listaId, onAnswerSelect]);

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
    // Verificar se todas as questões foram respondidas
    const totalRespondidas = respostasEnviadas.size;
    console.log(`Total de questões respondidas: ${totalRespondidas}/${questions.length}`);
    
    if (onFinish) {
      onFinish();
    }
  }, [onFinish, respostasEnviadas, questions.length]);

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