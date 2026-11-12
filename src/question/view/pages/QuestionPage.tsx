import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Question } from '../../presentation/components/Question';
import { questionService } from '../../service/api/question.service';
import { respostaService } from '../../service/api/respostaService';
import { emptyAttempt, saveAttempt } from '../../storage/attemptStorage';
import AddQuestionsButton from '../../../listaQuestoes/presentation/components/AddQuestionsButton/AddQuestionsButton';
import { FileText } from 'lucide-react';
import './QuestionPage.css';
import { EmptyState } from '../../../ui/EmptyState/EmptyState';


const QuestionPage: React.FC = () => {
  const { listaId } = useParams<{ listaId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visao, setVisao] = useState<any | null>(null);
  const [isRespondida, setIsRespondida] = useState<boolean>(false);
  const [, setPendingAnswers] = useState<Record<string, number>>({});
  const [initialAnswers, setInitialAnswers] = useState<Record<string, string>>({});

  // Em um app real, você pegaria o estudanteId do contexto/auth.
  // Usar userId salvo no localStorage em vez de id mocado
  const estudanteId = localStorage.getItem('userId') || '';
  const role = (localStorage.getItem('role') || '').toUpperCase();
  const isProfessor = role === 'PROFESSOR' || role === 'INSTITUICAO';

  useEffect(() => {
    const loadView = async () => {
      if (!listaId) {
        setError('ID da lista não encontrado na URL');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const estudante = estudanteId || localStorage.getItem('userId') || '';
        // use respostaService to fetch student view (includes Authorization via api client)
        const data = await respostaService.fetchVisao(listaId, estudante);
        if (!data) {
          // fallback to loading raw questões endpoint
          const questionsData = await questionService.getQuestionsByListId(listaId);
          setQuestions(questionsData);
          setVisao(null);
          setIsRespondida(false);
          setError(null);
        } else {
          setVisao(data);
          const responded = Boolean(data.respondida || data.responded || data.resposta === true);
          setIsRespondida(responded);
          if (!responded) {
            if (data.lista && Array.isArray(data.lista.questoes)) {
              const questionsData = data.lista.questoes.map((dto: any, idx: number) => questionService['transformDTOToQuestion'] ? (questionService as any).transformDTOToQuestion(dto, idx, data.lista.questoes.length) : dto);
              setQuestions(questionsData);
              // try to fetch already-sent respostas for this estudante so UI shows selected alternatives
              try {
                const respostas = await respostaService.buscarRespostasPorLista(listaId, estudante);
                const map: Record<string, string> = {};
                respostas.forEach((r: any) => {
                  try {
                    const letter = respostaService.converterIndiceParaLetra(r.alternativa ?? 0);
                    map[String(r.questaoId)] = letter;
                  } catch (e) {
                    // ignore malformed
                  }
                });
                setInitialAnswers(map);
              } catch (err) {
                // ignore fetch respostas error
              }
            } else {
              const questionsData = await questionService.getQuestionsByListId(listaId);
              setQuestions(questionsData);
            }
          } else {
            setQuestions([]);
          }
          setError(null);
        }
      } catch (err) {
        console.error('Erro ao carregar visão/questões:', err);
        // fallback to questions-only when visao is not available
        try {
          const questionsData = await questionService.getQuestionsByListId(listaId);
          setQuestions(questionsData);
          setVisao(null);
          setIsRespondida(false);
          setError(null);
        } catch (qerr) {
          setError('Erro ao carregar as questões. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadView();
  }, [listaId, estudanteId]);

  const handleAnswerSelect = (questionId: string, answerId: string, alternativaIndex: number) => {
    console.log(`Resposta selecionada: questão ${questionId}, alternativa ${answerId} (índice ${alternativaIndex})`);
    // record pending selection for bulk submit
    setPendingAnswers(prev => ({ ...prev, [questionId]: alternativaIndex }));
    // when viewmodel calls this callback after a successful single-question submit, refetch the student view to update nota/estado
    (async () => {
      try {
        const estudante = estudanteId || localStorage.getItem('userId') || '';
        const data = await respostaService.fetchVisao(listaId!, estudante);
        if (data) {
          setVisao(data);
          const responded = Boolean(data.respondida || data.responded || data.resposta === true);
          setIsRespondida(responded);

          // If backend hasn't marked the lista as finalizada/respondida but
          // the visao indicates all questões were answered, call finalizar endpoint
          const total = data.totalQuestoes ?? data.lista?.questoes?.length ?? questions.length;
          const respondedCount = data.questoesRespondidas ?? data.questoesRespondidas ?? 0;
          if (!responded && total && respondedCount >= total) {
            try {
              await respostaService.finalizarLista(listaId!, estudante);
              const refreshed = await respostaService.fetchVisao(listaId!, estudante);
              if (refreshed) {
                setVisao(refreshed);
                setIsRespondida(Boolean(refreshed.respondida || refreshed.responded || refreshed.resposta === true));
                if (refreshed.respondida) setQuestions([]);
              }
            } catch (err) {
              console.error('Erro ao finalizar lista após respostas individuais:', err);
            }
          } else {
            if (responded) setQuestions([]);
          }
        }
      } catch (err) {
        // ignore
      }
    })();
  };

  // FE-205: regras da lista (janela, tempo limite, tentativas) devolvidas junto com a visão do aluno
  const config = visao?.config as {
    aberta?: boolean; abreEm?: string | null; fechaEm?: string | null; prazoFinal?: number | null;
    maxTentativas?: number; tentativasUsadas?: number; regraNota?: string; podeNovaTentativa?: boolean;
    pendenteCorrecao?: number; tempoLimiteMinutos?: number | null;
  } | undefined;
  const [novaTentativaErro, setNovaTentativaErro] = useState<string | null>(null);
  const [iniciandoTentativa, setIniciandoTentativa] = useState(false);

  const handleNovaTentativa = async () => {
    if (!listaId) return;
    setIniciandoTentativa(true);
    setNovaTentativaErro(null);
    try {
      const estudante = estudanteId || localStorage.getItem('userId') || '';
      await respostaService.novaTentativa(listaId, estudante);
      saveAttempt(estudante, listaId, emptyAttempt()); // descarta rascunhos da tentativa anterior
      window.location.reload();
    } catch (err: any) {
      const d = err?.response?.data;
      setNovaTentativaErro(typeof d === 'string' && d ? d : 'Não foi possível iniciar uma nova tentativa.');
      setIniciandoTentativa(false);
    }
  };

  const handleNavigate = (direction: 'previous' | 'next') => {
    console.log(`Navegando para: ${direction}`);
  };

  const handleFinish = () => {
    console.log('Questionário finalizado!');
    // Aqui você pode navegar para uma página de resultados
    // ou mostrar um resumo das respostas
    alert('Questionário finalizado com sucesso!');
  };

  if (loading) {
    return (
      <div className="question-page-loading">
        <div className="loading-spinner" aria-hidden />
        <p>Carregando questões...</p>
        <div className="question-skeletons" aria-hidden>
          <div className="question-skeleton" />
          <div className="question-skeleton" />
          <div className="question-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="question-page-error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    );
  }


  // Lista ainda não abriu ou já fechou (e o aluno não tem entrega para ver)
  if (!isProfessor && !isRespondida && config && config.aberta === false) {
    const antes = config.abreEm && new Date(config.abreEm) > new Date();
    const quando = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '');
    return (
      <div className="question-page-empty-wrap">
        <EmptyState
          icon={<FileText size={48} />}
          title={antes ? 'Esta lista ainda não abriu' : 'O prazo desta lista encerrou'}
          description={antes ? `Ela abre em ${quando(config.abreEm)}.` : `O prazo terminou em ${quando(config.fechaEm)}. Fale com o professor se precisar de mais tempo.`}
          action={<button className="btn btn-secondary" onClick={() => navigate('/listas')}>Voltar para listas</button>}
        />
      </div>
    );
  }

  // If there are no questions to display, show the empty card -- but
  // if we have a student `visao` and it's responded/finalized, render that instead.
  if (questions.length === 0 && !(isRespondida && visao)) {
    return (
      <div className="question-page-empty-wrap">
        <EmptyState
          icon={<FileText size={48} />}
          title="Nenhuma questão encontrada"
          description={isProfessor
            ? 'Esta lista ainda não possui questões. Você pode adicionar questões via PDF ou criar manualmente.'
            : 'Esta lista ainda não possui questões. Volte mais tarde ou fale com o professor.'}
          action={
            <>
              {isProfessor && <AddQuestionsButton listaId={listaId ?? ''} />}
              <button className="btn btn-secondary" onClick={() => navigate('/listas')}>Voltar para listas</button>
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="question-page-container">
      {isRespondida && visao ? (
        <div className="student-view-card">
          <h2>Visão da lista (Finalizada)</h2>
          {!isProfessor && (
            <Link to={`/listas/${listaId}/revisao`} className="btn btn-secondary">
              Ver gabarito e explicações
            </Link>
          )}

          <div className="result-metrics">
            <div className="metric">
              <div className="label">Nota</div>
              <div className="value">{visao.nota ?? visao.score ?? '—'}</div>
            </div>
            <div className="metric">
              <div className="label">Porcentagem de acertos</div>
              <div className="value">{visao.porcentagemAcertos ?? visao.porcentagem ?? '—'}%</div>
              <div className="progress-wrap">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, Number(visao.porcentagemAcertos ?? visao.porcentagem ?? 0))}%` }} /></div>
              </div>
            </div>
            <div className="metric">
              <div className="label">Questões respondidas</div>
              <div className="value">{visao.questoesRespondidas ?? visao.respondidas ?? '—'} / {visao.totalQuestoes ?? visao.lista?.questoes?.length ?? '—'}</div>
            </div>
            <div className="metric">
              <div className="label">Questões corretas</div>
              <div className="value">{visao.questoesCorretas ?? visao.corretas ?? '—'}</div>
            </div>
          </div>

          {!isProfessor && Number(config?.pendenteCorrecao ?? visao.pendenteCorrecao ?? 0) > 0 && (
            <p role="status" className="student-view-note">
              {Number(config?.pendenteCorrecao ?? visao.pendenteCorrecao)} {Number(config?.pendenteCorrecao ?? visao.pendenteCorrecao) === 1 ? 'questão aberta aguarda' : 'questões abertas aguardam'} correção do professor.
              A nota atual é parcial e será atualizada quando ele corrigir.
            </p>
          )}

          {!isProfessor && config && (config.maxTentativas ?? 1) > 1 && (
            <p className="student-view-note">
              Tentativa {config.tentativasUsadas ?? 1} de {config.maxTentativas}.{' '}
              {config.regraNota === 'ULTIMA' ? 'Vale a nota da última tentativa.' : 'Vale a maior nota entre as tentativas.'}
            </p>
          )}
          {!isProfessor && config?.podeNovaTentativa && (
            <div>
              <button className="btn btn-primary" onClick={handleNovaTentativa} disabled={iniciandoTentativa}>
                {iniciandoTentativa ? 'Preparando…' : 'Fazer nova tentativa'}
              </button>
              {novaTentativaErro && <p role="alert" style={{ color: '#b91c1c' }}>{novaTentativaErro}</p>}
            </div>
          )}
        </div>
      ) : (
        <>
          <Question
            questions={questions}
            listaId={listaId!}
            estudanteId={estudanteId}
            initialAnswers={initialAnswers}
            deadline={config?.prazoFinal ?? undefined}
            onAnswerSelect={handleAnswerSelect}
            onNavigate={handleNavigate}
            onFinish={handleFinish}
            onOptionSelect={(questionId, answerId, alternativaIndex) => {
              setPendingAnswers(prev => ({ ...prev, [questionId]: alternativaIndex }));
            }}
          />

          {/* Botão de envio em lote removido conforme solicitado */}
        </>
      )}
    </div>
  );
};

export default QuestionPage;