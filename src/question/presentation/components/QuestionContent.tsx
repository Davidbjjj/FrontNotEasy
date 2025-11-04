import React from 'react';
import { QuestionContentProps } from '../../model/Question.types';
import './Question.css';

export const QuestionContent: React.FC<QuestionContentProps> = ({
  content,
  options,
  selectedAnswer,
  onAnswerSelect,
  className = '',
}) => {
  return (
    <div className={`question-content ${className}`}>
      <div className="question-content__text">
        {content}
      </div>

      <div className="question-options">
        {options.map((option) => (
          <div
            key={option.id}
            className={`question-option ${
              selectedAnswer === option.id ? 'question-option--selected' : ''
            }`}
            onClick={() => onAnswerSelect(option.id)}
          >
            <span className="question-option__label">{option.label}</span>
            <span className="question-option__text">{option.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionContent;