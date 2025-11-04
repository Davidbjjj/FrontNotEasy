import { useState, useCallback } from 'react';
import { Question, QuestionNavigation, QuizResult, RespostaEstudanteQuestaoDTO } from '../model/Question.types';
import { respostaService } from '../service/api/respostaService'; // Importação correta

interface UseQuestionViewModelReturn {
  currentQuestion: Question;
  selectedAnswer: string | null;
  isAnswered: boolean;
  navigation: QuestionNavigation;
  showResults: boolean;
  quizResult: QuizResult | null;
  handleAnswerSelect: (answerId: string) => void;
  handleNavigate: (direction: 'previous' | 'next') => void;
  handleFinish: () => void;
  handleShowResults: () => void;
}

export const useQuestionViewModel = (
  questions: Question[],
  listaId: string,
  estudanteId: string,
  onAnswerSelect?: (questionId: string, answerId: string, alternativaIndex: number) => void,
  onNavigate?: (direction: 'previous' | 'next') => void,
  onFinish?: (respostas: RespostaEstudanteQuestaoDTO[]) => void
): UseQuestionViewModelReturn => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
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
        listaId: listaId
      });

      setRespostasEnviadas(prev => new Set(prev).add(currentQuestion.id));

      if (onAnswerSelect) {
        onAnswerSelect(currentQuestion.id, answerId, alternativaIndex);
      }

      console.log(`Resposta ${answerId} enviada para questão ${currentQuestion.id}`);
      
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

  const handleFinish = useCallback(async () => {
    try {
      console.log('Finalizando questionário...');
      
      // Buscar o resultado final
      const resultado = await respostaService.calcularResultadoFinal(listaId, estudanteId);
      setQuizResult(resultado);
      setShowResults(true);
      
      if (onFinish) {
        onFinish(resultado.respostas);
      }
      
      console.log('Resultado calculado:', resultado);
    } catch (error) {
      console.error('Erro ao calcular resultado:', error);
      // Mesmo com erro, mostra que finalizou
      setShowResults(true);
    }
  }, [onFinish, listaId, estudanteId]);

  const handleShowResults = useCallback(async () => {
    try {
      const resultado = await respostaService.calcularResultadoFinal(listaId, estudanteId);
      setQuizResult(resultado);
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao mostrar resultados:', error);
    }
  }, [listaId, estudanteId]);

  return {
    currentQuestion,
    selectedAnswer,
    isAnswered,
    navigation,
    showResults,
    quizResult,
    handleAnswerSelect,
    handleNavigate,
    handleFinish,
    handleShowResults,
  };
};