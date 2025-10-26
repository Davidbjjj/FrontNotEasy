import React from 'react';
import Question from '../../presentation/components/Question';


// Mock data para a questão
const mockQuestion = {
  id: '1',
  title: 'Matemática | Desafio I: funções do 2° grau e geometria',
  content: 'O lucro mensal L(x), em milhares de reais, de uma empresa depende do preço x, em reais, do produto que pode ser descrito pela função L(x) = -2x² + 16x - 20.\nQual deve ser o preço do produto para se obter o maior lucro possível?',
  options: [
    { id: 'A', label: 'A', value: 'A', text: '2 reais' },
    { id: 'B', label: 'B', value: 'B', text: '4 reais' },
    { id: 'C', label: 'C', value: 'C', text: '6 reais' },
    { id: 'D', label: 'D', value: 'D', text: '8 reais' },
  ],
  correctAnswer: 'B',
  explanation: 'Para encontrar o preço que maximiza o lucro, precisamos encontrar o vértice da parábola. O x do vértice é dado por x = -b/(2a). Neste caso, a = -2, b = 16, então x = -16/(2*(-2)) = 4.',
  subject: 'Matemática',
  tags: ['Função de segundo grau'],
  difficulty: 'medium' as 'medium',
  progress: 100,
  currentQuestion: 20,
  totalQuestions: 20,
};

const QuestionPage: React.FC = () => {
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    console.log(`Questão ${questionId}: resposta ${answerId}`);
  };

  const handleNavigate = (direction: 'previous' | 'next') => {
    console.log(`Navegar para ${direction}`);
  };

  const handleFinish = () => {
    console.log('Finalizar questão');
    // Navegar para página de resultados
  };

  return (
    <Question
      question={mockQuestion}
      onAnswerSelect={handleAnswerSelect}
      onNavigate={handleNavigate}
      onFinish={handleFinish}
    />
  );
};

export default QuestionPage;