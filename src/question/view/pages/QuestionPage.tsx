import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Question } from '../../presentation/components/Question';
import { questionService } from '../../service/api/question.service';


export const QuestionPage: React.FC = () => {
  const { listaId } = useParams<{ listaId: string }>();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Em um app real, você pegaria o estudanteId do contexto/auth
  const estudanteId = 'efee86b1-6f12-4a10-ad33-0b0233e1a461'; // Exemplo - substitua pela forma real

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
        <div className="loading-spinner"></div>
        <p>Carregando questões...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="question-page-error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => window.history.back()}>
          Voltar
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="question-page-empty">
        <h2>Nenhuma questão encontrada</h2>
        <p>Esta lista não possui questões ou ocorreu um erro ao carregar.</p>
        <button onClick={() => window.history.back()}>
          Voltar para listas
        </button>
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