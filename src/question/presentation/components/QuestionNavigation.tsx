import React from 'react';
import { QuestionNavigationProps } from '../../model/Question.types';
import './Question.css';

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  navigation,
  onNavigate,
  onFinish,
  className = '',
}) => {
  return (
    <div className={`question-navigation ${className}`}>
      <div className="question-navigation__counter">
        {navigation.current} de {navigation.total}
      </div>

      <div className="question-navigation__controls">
        <button
          className="question-navigation__btn question-navigation__btn--previous"
          onClick={() => onNavigate('previous')}
          disabled={!navigation.hasPrevious}
          type="button"
        >
          ANTERIOR
        </button>

        {navigation.hasNext ? (
          <button
            className="question-navigation__btn"
            onClick={() => onNavigate('next')}
            type="button"
          >
            PRÓXIMA
          </button>
        ) : (
          <button
            className="question-navigation__btn question-navigation__btn--primary"
            onClick={onFinish}
            type="button"
          >
            FINALIZAR
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionNavigation;