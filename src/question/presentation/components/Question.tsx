import React from 'react';
import { useQuestionViewModel } from '../../viewmodels/Question.viewmodel';
import { QuestionProps } from '../../model/Question.types';
import QuestionHeader from './QuestionHeader';
import QuestionContent from './QuestionContent';
import QuestionNavigation from './QuestionNavigation';
import QuestionResults from './QuestionResults';
import './Question.css';

export const Question: React.FC<QuestionProps> = (props) => {
  const {
    questions,
    listaId,
    estudanteId,
    onAnswerSelect,
    onNavigate,
    onFinish,
    onOptionSelect,
    initialAnswers,
    className = '',
  } = props;
  const {
      currentQuestion,
    selectedAnswer,
    navigation,
    showResults,
    quizResult,
    handleAnswerSelect,
    handleSubmitAnswer,
    isSubmitting,
    isAnswered,
    handleNavigate,
    handleFinish,
  } = useQuestionViewModel(questions, listaId, estudanteId, onAnswerSelect, onNavigate, onFinish, initialAnswers);

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
        imagens={currentQuestion.imagens}
        questionId={currentQuestion.id}
        options={currentQuestion.options}
        selectedAnswer={selectedAnswer || undefined}
        onAnswerSelect={handleAnswerSelect}
        onSubmitAnswer={handleSubmitAnswer}
        isSubmitting={isSubmitting}
        isAnswered={isAnswered}
        onOptionSelect={(questionId, answerId, alternativaIndex) => {
          if (onOptionSelect && typeof onOptionSelect === 'function') {
            onOptionSelect(questionId, answerId, alternativaIndex);
          }
        }}
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
    </div>
  );
};

export default Question;