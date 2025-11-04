import React from 'react';
import { useQuestionViewModel } from '../../viewmodels/Question.viewmodel';
import { QuestionProps } from '../../model/Question.types';
import QuestionHeader from './QuestionHeader';
import QuestionContent from './QuestionContent';
import QuestionNavigation from './QuestionNavigation';
import './Question.css';

export const Question: React.FC<QuestionProps> = ({
  question,
  questions,
  onAnswerSelect,
  onNavigate,
  onFinish,
  className = '',
}) => {
  const questionsArray = questions || [question];
  const {
    currentQuestion,
    selectedAnswer,
    isAnswered,
    navigation,
    handleAnswerSelect,
    handleNavigate,
    handleFinish,
  } = useQuestionViewModel(questionsArray, onAnswerSelect, onNavigate, onFinish);

  return (
    <div className={`question-page ${className}`}>
      {/* Header com título e progresso */}
      <QuestionHeader
        title={currentQuestion.title}
        subject={currentQuestion.subject}
        progress={currentQuestion.progress}
      />

      {/* Separador */}
      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

      {/* Número da questão */}
      <div className="question-content__number">
        QUESTÃO {currentQuestion.currentQuestion}
      </div>

      {/* Conteúdo da questão e opções */}
      <QuestionContent
        content={currentQuestion.content}
        options={currentQuestion.options}
        selectedAnswer={selectedAnswer || undefined}
        onAnswerSelect={handleAnswerSelect}
      />

      {/* Tags */}
      <div className="question-tags">
        {currentQuestion.tags.map((tag, index) => (
          <span key={index} className="question-tag">
            {tag}
          </span>
        ))}
      </div>

      {/* Explicação (aparece após responder) */}
      {isAnswered && (
        <div className="question-explanation">
          <h4 className="question-explanation__title">Explicação:</h4>
          <p className="question-explanation__text">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Navegação */}
      <QuestionNavigation
        navigation={navigation}
        onNavigate={handleNavigate}
        onFinish={handleFinish}
      />
    </div>
  );
};

export default Question;