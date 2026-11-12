import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Question, QuestionNavigation, QuizResult, RespostaEstudanteQuestaoDTO } from '../model/Question.types';
import { respostaService } from '../service/api/respostaService'; // Importação correta
import { loadAttempt, saveAttempt, lastAnsweredIndex, AttemptState } from '../storage/attemptStorage';
import type { SaveState } from '../presentation/components/SaveStatus';

const isNetworkError = (e: any) => !e?.response;

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
  saveState: SaveState;
  savedAt: number | null;
  pendingCount: number;
  retrySync: () => void;
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
  // FE-104: respostas ainda não confirmadas pelo servidor + rascunhos, guardados no aparelho
  const [attempt, setAttempt] = useState<AttemptState>(() => loadAttempt(estudanteId, listaId));
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const attemptRef = useRef(attempt);
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const syncing = useRef(false);
  const userMoved = useRef(false);
  const resumed = useRef(false);

  const updateAttempt = useCallback(
    (fn: (a: AttemptState) => AttemptState) => {
      const next = fn(attemptRef.current);
      attemptRef.current = next;
      saveAttempt(estudanteId, listaId, next);
      setAttempt(next);
    },
    [estudanteId, listaId]
  );

  const answers = useMemo(
    () => ({ ...(initialAnswers || {}), ...attempt.pending, ...sessionAnswers }),
    [initialAnswers, attempt.pending, sessionAnswers]
  );
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
    setSelectedAnswer(letter ?? attemptRef.current.drafts[qid] ?? null);
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

  // Ao reabrir, volta para a última questão respondida (uma vez, se o aluno ainda não navegou)
  useEffect(() => {
    if (resumed.current || userMoved.current || questions.length === 0) return;
    if (answeredIds.size === 0) return;
    resumed.current = true;
    const idx = lastAnsweredIndex(questions.map((q) => q.id), answeredIds);
    if (idx > 0) setCurrentQuestionIndex(idx);
  }, [questions, answeredIds]);

  const pendingCount = Object.keys(attempt.pending).length;

  // Envia ao servidor o que ficou guardado localmente (offline / falha de rede)
  const syncPending = useCallback(async () => {
    if (syncing.current) return;
    const entries = Object.entries(attemptRef.current.pending);
    if (entries.length === 0) return;
    if (!navigator.onLine) { setSaveState('offline'); return; }
    syncing.current = true;
    setSaveState('saving');
    try {
      for (const [qid, letter] of entries) {
        const aberta = questionsRef.current.find((q) => q.id === qid)?.tipo === 'ABERTA';
        const alternativa = aberta ? -1 : respostaService.converterLetraParaIndice(letter);
        try {
          await respostaService.enviarResposta(aberta
            ? { estudanteId, questaoId: parseInt(qid), listaId, textoResposta: letter }
            : { estudanteId, questaoId: parseInt(qid), alternativa, listaId });
        } catch (e) {
          setSaveState(isNetworkError(e) ? 'offline' : 'error');
          return;
        }
        updateAttempt((a) => {
          const pending = { ...a.pending };
          delete pending[qid];
          return { ...a, pending };
        });
        setSessionAnswers((prev) => ({ ...prev, [qid]: letter }));
        onAnswerSelect?.(qid, letter, alternativa);
      }
      setSavedAt(Date.now());
      setSaveState('saved');
    } finally {
      syncing.current = false;
    }
  }, [estudanteId, listaId, onAnswerSelect, updateAttempt]);

  // Sincroniza ao abrir (sobras de outra sessão) e ao reconectar
  useEffect(() => {
    void syncPending();
    const onOnline = () => void syncPending();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aviso ao fechar/recarregar com respostas não confirmadas ou alternativa marcada e não enviada
  const unsaved = pendingCount > 0 || (Boolean(selectedAnswer) && !isAnswered);
  useEffect(() => {
    if (!unsaved) return undefined;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unsaved]);

  const navigation: QuestionNavigation = {
    current: currentQuestionIndex + 1,
    total: questions.length,
    hasPrevious: currentQuestionIndex > 0,
    hasNext: currentQuestionIndex < questions.length - 1,
  };

  // Select an answer locally; submission happens when the student clicks "Enviar resposta"
  const handleAnswerSelect = useCallback((answerId: string) => {
    setSelectedAnswer(answerId);
    const q = questions[currentQuestionIndex];
    const qid = q?.id;
    // Questão aberta: editar o texto depois de enviado volta a exigir um novo envio
    if (q?.tipo === 'ABERTA' && qid) setIsAnswered(answers[qid] === answerId);
    if (qid) updateAttempt((a) => ({ ...a, drafts: { ...a.drafts, [qid]: answerId } }));
  }, [questions, currentQuestionIndex, updateAttempt, answers]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedAnswer) return;

    setIsSubmitting(true);
    setSaveState('saving');
    const qid = currentQuestion.id;
    const letter = selectedAnswer;
    const aberta = currentQuestion.tipo === 'ABERTA';
    const alternativaIndex = aberta ? -1 : respostaService.converterLetraParaIndice(letter);
    const withoutDraft = (a: AttemptState) => {
      const drafts = { ...a.drafts };
      delete drafts[qid];
      return drafts;
    };
    try {
      await respostaService.enviarResposta(aberta
        ? { estudanteId, questaoId: parseInt(qid), listaId, textoResposta: letter }
        : { estudanteId, questaoId: parseInt(qid), alternativa: alternativaIndex, listaId });

      setIsAnswered(true);
      setSessionAnswers((prev) => ({ ...prev, [qid]: letter }));
      updateAttempt((a) => ({ ...a, drafts: withoutDraft(a) }));
      setSavedAt(Date.now());
      setSaveState('saved');

      if (onAnswerSelect) {
        onAnswerSelect(qid, letter, alternativaIndex);
      }
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      if (isNetworkError(error)) {
        // Sem rede: guarda no aparelho, conta como respondida e sincroniza ao reconectar
        updateAttempt((a) => ({ pending: { ...a.pending, [qid]: letter }, drafts: withoutDraft(a) }));
        setIsAnswered(true);
        setSaveState('offline');
      } else {
        // erro do servidor: mantém a seleção para o aluno tentar de novo
        setSaveState('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAnswer, estudanteId, listaId, currentQuestion.id, currentQuestion.tipo, onAnswerSelect, updateAttempt]);

  const handleNavigate = useCallback((direction: 'previous' | 'next') => {
    userMoved.current = true;
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
    userMoved.current = true;
    setCurrentQuestionIndex(index);
  }, [questions.length]);

  const handleFinish = useCallback(async () => {
    try {
      console.log('Finalizando questionário...');
      await syncPending(); // não finaliza sem enviar o que ficou guardado

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
  }, [onFinish, listaId, estudanteId, syncPending]);

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
    saveState,
    savedAt,
    pendingCount,
    retrySync: () => void syncPending(),
  };
};