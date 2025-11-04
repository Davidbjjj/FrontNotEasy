import React from 'react';
import { ListsViewProps, QuestionList } from '../../model/QuestionList.types';
import './QuestionList.css';

interface ListCardProps {
  list: QuestionList;
  onClick: (list: QuestionList) => void;
  viewMode: 'grid' | 'list';
}

const ListCard: React.FC<ListCardProps> = ({ list, onClick, viewMode }) => {
  const progress = (list.questionsCompleted / list.totalQuestions) * 100;

  return (
    <div className="list-card" onClick={() => onClick(list)}>
      <div className="list-card__header">
        <div>
          <h3 className="list-card__subject">{list.title}</h3>
          <p className="list-card__professor">{list.professor.name}</p>
        </div>
      </div>

      <div className="list-card__progress">
        <p className="list-card__progress-text">
          Questões realizadas: {list.questionsCompleted} de {list.totalQuestions}
        </p>
        <div className="list-card__progress-bar">
          <div 
            className="list-card__progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {list.deadline && (
        <p className="list-card__deadline">
          Prazo entrega em {list.deadline}
        </p>
      )}

      <div className="list-card__tags">
        {list.tags.map((tag, index) => (
          <span key={index} className="list-card__tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export const ListsView: React.FC<ListsViewProps> = ({
  lists,
  viewMode,
  onListClick,
  className = '',
}) => {
  if (lists.length === 0) {
    return (
      <div className="question-list__empty">
        Nenhuma lista de questões encontrada.
      </div>
    );
  }

  return (
    <div className={`lists-view ${className}`}>
      <div className={viewMode === 'grid' ? 'lists-view__grid' : 'lists-view__list'}>
        {lists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            onClick={onListClick}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};

export default ListsView;