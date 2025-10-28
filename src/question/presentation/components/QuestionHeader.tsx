import React from 'react';
import { QuestionHeaderProps } from '../../model/Question.types';
import './Question.css';

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  title,
  subject,
  progress,
  className = '',
}) => {
  return (
    <div className={`question-header ${className}`}>
      <h1 className="question-header__title">{title}</h1>
      <p className="question-header__subject">{subject}</p>
      
      <div className="question-header__progress">
        <div className="question-header__progress-bar">
          <div 
            className="question-header__progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="question-header__progress-text">{progress}%</p>
      </div>
    </div>
  );
};

export default QuestionHeader;