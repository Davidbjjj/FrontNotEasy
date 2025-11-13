import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question } from '../../presentation/components/Question';
import { questionService } from '../../service/api/question.service';
import AddQuestionsButton from '../../../listaQuestoes/presentation/components/AddQuestionsButton/AddQuestionsButton';
import { FileText } from 'lucide-react';
import './QuestionPage.css';


const QuestionPage: React.FC = () => {
  const { listaId } = useParams<{ listaId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Em um app real, você pegaria o estudanteId do contexto/auth.
  // Usar userId salvo no localStorage em vez de id mocado
  const estudanteId = localStorage.getItem('userId') || '';

  useEffect(() => {
    const loadQuestions = async () => {
      if (!listaId) {
        setError('ID da lista não encontrado na URL');
        setLoading(false);
        return;
      }

      try {
        console.log(`Carregando questões para lista: ${listaId}`);
        const questionsData = await questionService.getQuestionsByListId(listaId);
        setQuestions(questionsData);
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar questões:', error);
        setError('Erro ao carregar as questões. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [listaId]);

  const handleAnswerSelect = (questionId: string, answerId: string, alternativaIndex: number) => {
    console.log(`Resposta selecionada: questão ${questionId}, alternativa ${answerId} (índice ${alternativaIndex})`);
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


  if (questions.length === 0) {
    return (
      <div className="question-page-empty-wrap">
        <div className="question-page-empty-card">
          <div className="question-page-empty-illustration">
            <FileText size={48} />
          </div>
          <h2 className="question-page-empty-title">Nenhuma questão encontrada</h2>
          <p className="question-page-empty-text">Esta lista ainda não possui questões. Você pode adicionar questões via PDF ou criar manualmente.</p>
          <div className="question-page-empty-actions">
            <AddQuestionsButton listaId={listaId ?? ''} />
            <button className="btn btn-secondary" onClick={() => navigate('/listas')}>Voltar para listas</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-page-container">
      <Question
        questions={questions}
        listaId={listaId!}
        estudanteId={estudanteId}
        onAnswerSelect={handleAnswerSelect}
        onNavigate={handleNavigate}
        onFinish={handleFinish}
      />
    </div>
  );
};

export default QuestionPage;