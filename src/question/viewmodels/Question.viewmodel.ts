import { useState, useCallback, useEffect } from 'react';
import { Question, QuestionNavigation, QuizResult, RespostaEstudanteQuestaoDTO } from '../model/Question.types';
import { respostaService } from '../service/api/respostaService'; // Importação correta

interface UseQuestionViewModelReturn {
  currentQuestion: Question;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isSubmitting: boolean;
  navigation: QuestionNavigation;
  showResults: boolean;
  quizResult: QuizResult | null;
  handleAnswerSelect: (answerId: string) => void;
  handleSubmitAnswer: () => Promise<void>;
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
  , initialAnswers?: Record<string, string>
): UseQuestionViewModelReturn => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // If the parent provided initialAnswers (from visao/buscarRespostas), initialize selection when question changes
  useEffect(() => {
    try {
      const qid = currentQuestion?.id;
      if (!qid) return;
      if (initialAnswers && Object.prototype.hasOwnProperty.call(initialAnswers, qid)) {
        const letter = initialAnswers[qid];
        setSelectedAnswer(letter ?? null);
        setIsAnswered(Boolean(letter));
      } else {
        // clear selection when no initial answer exists
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    } catch (e) {
      // ignore
    }
  }, [currentQuestionIndex, currentQuestion?.id, initialAnswers]);

  const navigation: QuestionNavigation = {
    current: currentQuestionIndex + 1,
    total: questions.length,
    hasPrevious: currentQuestionIndex > 0,
    hasNext: currentQuestionIndex < questions.length - 1,
  };

  // Select an answer locally; submission happens when the student clicks "Enviar resposta"
  const handleAnswerSelect = useCallback((answerId: string) => {
    setSelectedAnswer(answerId);
  }, []);

  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedAnswer) return;

    setIsSubmitting(true);
    try {
      const alternativaIndex = respostaService.converterLetraParaIndice(selectedAnswer);

      await respostaService.enviarResposta({
        estudanteId: estudanteId,
        questaoId: parseInt(currentQuestion.id),
        alternativa: alternativaIndex,
        listaId: listaId,
      });

      setIsAnswered(true);

      if (onAnswerSelect) {
        onAnswerSelect(currentQuestion.id, selectedAnswer, alternativaIndex);
      }

      console.log(`Resposta ${selectedAnswer} enviada para questão ${currentQuestion.id}`);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      // keep selection so student can retry; do not clear selectedAnswer
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAnswer, estudanteId, listaId, currentQuestion.id, onAnswerSelect]);

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

      // Ensure backend marks the lista as finalized for this estudante
      try {
        const estudante = estudanteId || localStorage.getItem('userId') || '';
        await respostaService.finalizarLista(listaId, estudante);
      } catch (finErr) {
        // If finalize fails, continue to try to calculate result anyway
        console.warn('Falha ao finalizar lista antes de calcular resultado:', finErr);
      }

      // Buscar o resultado final
      const resultado = await respostaService.calcularResultadoFinal(listaId, estudanteId);

      // also fetch the student view (visao) for this lista to show summary
      try {
        const estudante = estudanteId || localStorage.getItem('userId') || '';
        const visData = await respostaService.fetchVisao(listaId, estudante);
        if (visData) (resultado as any).visao = visData;
      } catch (e) {
        // ignore visao fetch errors
      }

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

      try {
        const estudante = estudanteId || localStorage.getItem('userId') || '';
        const visData = await respostaService.fetchVisao(listaId, estudante);
        if (visData) (resultado as any).visao = visData;
      } catch (e) {
        // ignore
      }

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
    isSubmitting,
    navigation,
    showResults,
    quizResult,
    handleAnswerSelect,
    handleSubmitAnswer,
    handleNavigate,
    handleFinish,
    handleShowResults,
  };
};