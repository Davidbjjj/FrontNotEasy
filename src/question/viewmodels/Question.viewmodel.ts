import { useState, useCallback, useEffect, useMemo } from 'react';
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
  handleGoTo: (index: number) => void;
  /** ids das questões já respondidas (servidor + enviadas nesta sessão) */
  answeredIds: Set<string>;
  currentIndex: number;
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
  // respostas enviadas nesta sessão (questionId -> letra); evita perder o estado ao navegar
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, string>>({});

  const answers = useMemo(() => ({ ...(initialAnswers || {}), ...sessionAnswers }), [initialAnswers, sessionAnswers]);
  const answeredIds = useMemo(
    () => new Set(Object.keys(answers).filter((k) => Boolean(answers[k]))),
    [answers]
  );

  const currentQuestion = questions[currentQuestionIndex];

  // Ao trocar de questão, restaura a resposta já enviada (servidor ou sessão)
  useEffect(() => {
    const qid = currentQuestion?.id;
    if (!qid) return;
    const letter = answers[qid];
    setSelectedAnswer(letter ?? null);
    setIsAnswered(Boolean(letter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, currentQuestion?.id]);

  // Respostas do servidor que chegam depois do primeiro render
  useEffect(() => {
    const qid = currentQuestion?.id;
    if (!qid || !initialAnswers || !initialAnswers[qid]) return;
    setSelectedAnswer((prev) => prev ?? initialAnswers[qid]);
    setIsAnswered(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAnswers]);

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
      setSessionAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedAnswer }));

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
    } else if (direction === 'next' && navigation.hasNext) {
      setCurrentQuestionIndex(prev => prev + 1);
    }

    if (onNavigate) {
      onNavigate(direction);
    }
  }, [navigation.hasPrevious, navigation.hasNext, onNavigate]);

  const handleGoTo = useCallback((index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentQuestionIndex(index);
  }, [questions.length]);

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
    handleGoTo,
    answeredIds,
    currentIndex: currentQuestionIndex,
    handleFinish,
    handleShowResults,
  };
};