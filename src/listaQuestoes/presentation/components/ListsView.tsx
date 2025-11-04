import React from 'react';
import { ListsViewProps, QuestionList } from '../../model/QuestionList.types';
import AddQuestionsButton from './AddQuestionsButton/AddQuestionsButton';
import './QuestionList.css';

interface ListCardProps {
  list: QuestionList;
  onClick: (list: QuestionList) => void;
  viewMode: 'grid' | 'list';
  onQuestionsAdded?: () => void;
}

const ListCard: React.FC<ListCardProps> = ({ list, onClick, viewMode, onQuestionsAdded }) => {
  const progress = (list.questionsCompleted / list.totalQuestions) * 100;

  const handleAddQuestionsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique propague para o card
  };

  return (
    <div className="list-card" onClick={() => onClick(list)}>
      <div className="list-card__header">
        <div>
          <h3 className="list-card__subject">{list.title}</h3>
          <p className="list-card__professor">{list.professor.name}</p>
        </div>
        <div className="list-card__actions" onClick={handleAddQuestionsClick}>
          <AddQuestionsButton 
            listaId={list.id}
            onQuestionsAdded={onQuestionsAdded}
          />
        </div>
      </div>

      {/* ... resto do conteúdo do card ... */}
    </div>
  );
};

export const ListsView: React.FC<ListsViewProps & { onQuestionsAdded?: () => void }> = ({
  lists,
  viewMode,
  onListClick,
  onQuestionsAdded,
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
            onQuestionsAdded={onQuestionsAdded}
          />
        ))}
      </div>
    </div>
  );
};

export default ListsView;