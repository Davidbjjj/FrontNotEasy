import React from 'react';
import { useQuestionViewModel } from '../../viewmodels/Question.viewmodel';
import { QuestionProps } from '../../model/Question.types';
import QuestionHeader from './QuestionHeader';
import QuestionContent from './QuestionContent';
import QuestionNavigation from './QuestionNavigation';
import QuestionResults from './QuestionResults';
import './Question.css';

export const Question: React.FC<QuestionProps> = ({
  questions,
  listaId,
  estudanteId,
  onAnswerSelect,
  onNavigate,
  onFinish,
  className = '',
}) => {
  const {
    currentQuestion,
    selectedAnswer,
    navigation,
    showResults,
    quizResult,
    handleAnswerSelect,
    handleNavigate,
    handleFinish,
    handleShowResults,
  } = useQuestionViewModel(questions, listaId, estudanteId, onAnswerSelect, onNavigate, onFinish);

  // Se estiver mostrando resultados, exibe o componente de resultados
  if (showResults && quizResult) {
    return (
      <QuestionResults
        result={quizResult}
        questions={questions}
        onClose={() => window.history.back()} // Voltar para a página anterior
      />
    );
  }

  // Componente normal das questões
  return (
    <div className={`question-page ${className}`}>
      <QuestionHeader
        title={currentQuestion.title}
        subject={currentQuestion.subject}
        progress={currentQuestion.progress}
      />

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

      <div className="question-content__number">
        QUESTÃO {currentQuestion.currentQuestion}
      </div>

      <QuestionContent
        content={currentQuestion.content}
        options={currentQuestion.options}
        selectedAnswer={selectedAnswer || undefined}
        onAnswerSelect={handleAnswerSelect}
      />

      <div className="question-tags">
        {currentQuestion.tags.map((tag, index) => (
          <span key={index} className="question-tag">
            {tag}
          </span>
        ))}
      </div>

      {/* NÃO MOSTRA EXPLICAÇÃO DURANTE A RESPOSTA - só no final */}

      <QuestionNavigation
        navigation={navigation}
        onNavigate={handleNavigate}
        onFinish={handleFinish}
      />

      {/* Botão para ver resultados (opcional - pode remover) */}
      {navigation.current === navigation.total && (
        <div className="quick-results-button">
          <button onClick={handleShowResults} className="btn-show-results">
            Ver Resultados
          </button>
        </div>
      )}
    </div>
  );
};

export default Question;