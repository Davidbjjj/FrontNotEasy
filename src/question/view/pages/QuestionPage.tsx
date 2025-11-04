import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Question from '../../presentation/components/Question';
import { Question as QuestionType } from '../../model/Question.types';
import { questionService } from '../../service/api/question.service';

interface RespostaQuestaoDTO {
  questaoId: number;
  alternativa: number;
}

interface EnviarMultiplasRespostasDTO {
  estudanteId: string;
  listaId: string;
  respostas: RespostaQuestaoDTO[];
}

const QuestionPage: React.FC = () => {
  const { listaId } = useParams<{ listaId: string }>();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [respostas, setRespostas] = useState<RespostaQuestaoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const estudanteId = "9223f4f2-4b0a-46e3-91a8-9f6a767e3d1f"; // ou do localStorage / contexto

  // Carregar questões
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

  // Quando o usuário seleciona uma resposta
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    const questaoId = Number(questionId);
    const alternativa = answerId.charCodeAt(0) - 65; // converte A->0, B->1, etc.

    setRespostas((prev) => {
      const existente = prev.find((r) => r.questaoId === questaoId);
      if (existente) {
        return prev.map((r) =>
          r.questaoId === questaoId ? { ...r, alternativa } : r
        );
      } else {
        return [...prev, { questaoId, alternativa }];
      }
    });
  };

  // Navegação
  const handleNavigate = (direction: 'previous' | 'next') => {
    if (direction === 'previous' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Envia todas as respostas no final
  const handleFinish = async () => {
    if (!listaId || !estudanteId) return;

    const payload: EnviarMultiplasRespostasDTO = {
      estudanteId,
      listaId,
      respostas,
    };

    console.log("Enviando respostas ao backend:", payload);

    try {
      const response = await fetch("http://localhost:8080/respostas/multiplas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const message = await response.text();
        alert("Lista finalizada! " + message);

        // opcional: buscar resultados de acertos/erros
        // const result = await fetch(`http://localhost:8080/listas/${listaId}/respostas`);
        // const data = await result.json();
        // console.log("Resultados:", data);
      } else {
        alert("Erro ao salvar respostas!");
      }
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      alert("Falha na comunicação com o servidor.");
    }
  };

  if (isLoading) return <p>Carregando questões...</p>;
  if (error) return <p>{error}</p>;
  if (questions.length === 0) return <p>Nenhuma questão encontrada.</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Question
      question={currentQuestion}
      questions={questions}
      onAnswerSelect={handleAnswerSelect}
      onNavigate={handleNavigate}
      onFinish={handleFinish}
    />
  );
};

export default QuestionPage;
