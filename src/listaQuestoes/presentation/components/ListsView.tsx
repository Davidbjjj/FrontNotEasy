import React from 'react';
import { ListsViewProps, QuestionList } from '../../model/QuestionList.types';
import AddQuestionsButton from './AddQuestionsButton/AddQuestionsButton';
import AddListButton from './AddListButton/AddListButton';
import { ArrowRight, Clock, Book, FileText } from 'lucide-react';
import './QuestionList.css';

const getPreferredTeacherName = (fallbackName?: string) => {
  try {
    const raw = localStorage.getItem('teacher');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) return parsed.name;
    }
  } catch (err) {
    // ignore
  }
  return fallbackName || '';
};

interface ListCardProps {
  list: QuestionList;
  onClick: (list: QuestionList) => void;
  viewMode: 'grid' | 'list';
  onQuestionsAdded?: () => void;
  isLoading?: boolean;
}

const ListCard: React.FC<ListCardProps> = ({ list, onClick, viewMode, onQuestionsAdded, isLoading }) => {
  const progress = list.totalQuestions ? Math.round((list.questionsCompleted / list.totalQuestions) * 100) : 0;

  const handleAddQuestionsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique propague para o card
  };

  const progressColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="list-card" onClick={() => onClick(list)}>
      {isLoading && (
        <div className="list-card__loading-overlay" aria-hidden>
          <div className="list-card__spinner" />
        </div>
      )}
      <div className="list-card__inner">
        <div className="list-card__thumb">
          {/* Se houver subject color, mostrar um bloco com ícone */}
          <div className="list-card__thumb-image" style={{ backgroundColor: list.subject?.color || '#eef2ff' }}>
            <Book color="#ffffff" />
          </div>
        </div>

        <div className="list-card__main">
          <div className="list-card__top-row">
            <div>
              <h3 className="list-card__subject">{list.title}</h3>
              <p className="list-card__professor">{list.subject?.name} · {getPreferredTeacherName(list.professor.name)}</p>
            </div>
            <div className="list-card__actions" onClick={handleAddQuestionsClick}>
              <AddQuestionsButton 
                listaId={list.id}
                onQuestionsAdded={onQuestionsAdded}
              />
            </div>
          </div>

          <div className="list-card__progress">
            <p className="list-card__progress-text">Alunos que entregaram a lista {list.questionsCompleted} de {list.totalQuestions}</p>
            <div className="list-card__progress-bar">
              <div
                className="list-card__progress-fill"
                style={{ width: `${progress}%`, background: progressColor }}
              />
            </div>
            <div className="list-card__progress-percent" style={{ color: progressColor }}>{progress}%</div>
          </div>

          <div className="list-card__bottom-row">
            <div className="list-card__tags">
              {list.tags?.slice(0,3).map((tag, idx) => (
                <span key={idx} className="list-card__tag">{tag}</span>
              ))}
            </div>
            <div className="list-card__deadline">
              <Clock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {list.deadline ? `Prazo entrega em ${list.deadline}` : 'Prazo entrega em --'}
            </div>
          </div>
        </div>

        <div className="list-card__nav">
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  );
};

export const ListsView: React.FC<
  ListsViewProps & { onQuestionsAdded?: () => void; loadingListId?: string | null }
> = ({
  lists,
  viewMode,
  onListClick,
  onQuestionsAdded,
  loadingListId = null,
  className = '',
}) => {

  if (lists.length === 0) {
    return (
      <div className="question-list__empty">
        <FileText size={64} className="question-list__empty-icon" />
        <h3 className="question-list__empty-title">Nenhuma lista encontrada</h3>
        <p className="question-list__empty-desc">Parece que ainda não há listas de questões. Crie sua primeira lista para começar a organizar as avaliações.</p>
        <div className="question-list__empty-actions">
          {/* Usamos o AddListButton para abrir o modal de criação de lista */}
          <AddListButton className="add-list-button--empty" professorId={localStorage.getItem('userId') || ''} />
        </div>
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
            isLoading={Boolean(loadingListId && loadingListId === list.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ListsView;