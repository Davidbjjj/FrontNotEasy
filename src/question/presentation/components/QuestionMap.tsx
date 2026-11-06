import React from 'react';
import './Question.css';

interface QuestionMapProps {
  total: number;
  currentIndex: number;
  /** índices (0-based) das questões respondidas */
  answeredIndexes: Set<number>;
  onSelect: (index: number) => void;
}

export const QuestionMap: React.FC<QuestionMapProps> = ({ total, currentIndex, answeredIndexes, onSelect }) => {
  const answered = answeredIndexes.size;
  return (
    <nav className="question-map" aria-label="Mapa de questões">
      <p className="question-map__summary">
        {answered} de {total} respondidas
      </p>
      <ol className="question-map__grid">
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === currentIndex;
          const isAnswered = answeredIndexes.has(i);
          const state = isAnswered ? 'respondida' : 'não respondida';
          return (
            <li key={i}>
              <button
                type="button"
                className={`question-map__item${isAnswered ? ' question-map__item--answered' : ''}${isCurrent ? ' question-map__item--current' : ''}`}
                onClick={() => onSelect(i)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Questão ${i + 1}, ${state}${isCurrent ? ', atual' : ''}`}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default QuestionMap;
