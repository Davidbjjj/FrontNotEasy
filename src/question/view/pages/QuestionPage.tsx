import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Question from '../../presentation/components/Question';
import { Question as QuestionType } from '../../model/Question.types';
import { questionService } from '../../service/api/question.service';

const QuestionPage: React.FC = () => {
  const { listaId } = useParams<{ listaId: string }>();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar questões da lista
  useEffect(() => {
    const loadQuestions = async () => {
      if (!listaId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await questionService.getQuestionsByListId(listaId);
        setQuestions(data);
      } catch (err) {
        setError('Erro ao carregar questões da lista.');
        console.error('Erro:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [listaId]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    console.log(`Questão ${questionId}: resposta ${answerId}`);
    // Aqui você pode salvar a resposta no estado ou enviar para o backend
  };

  const handleNavigate = (direction: 'previous' | 'next') => {
    if (direction === 'previous' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    console.log('Finalizar lista de questões');
    // Navegar para página de resultados ou voltar para listas
    // history.push('/listas'); // se estiver usando history
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando questões...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="empty-container">
        <h2>Nenhuma questão encontrada</h2>
        <p>Esta lista não contém questões disponíveis.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Question
      question={currentQuestion}
      onAnswerSelect={handleAnswerSelect}
      onNavigate={handleNavigate}
      onFinish={handleFinish}
    />
  );
};

export default QuestionPage;