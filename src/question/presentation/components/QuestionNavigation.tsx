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
    <div className={`question-navigation ${className}`} role="group" aria-label="Navegação entre questões">
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
          ← Anterior
        </button>

        {navigation.hasNext ? (
          <button
            className="question-navigation__btn"
            onClick={() => onNavigate('next')}
            type="button"
          >
            Próxima →
          </button>
        ) : (
          <button
            className="question-navigation__btn question-navigation__btn--primary"
            onClick={onFinish}
            type="button"
          >
            Finalizar
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionNavigation;