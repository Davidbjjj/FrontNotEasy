import React from 'react';
import { Grid, List } from 'lucide-react';
import { useQuestionListViewModel } from '../../viewmodels/QuestionList.viewmodel';
import type { QuestionList as QuestionListType, QuestionListProps } from '../../model/QuestionList.types';
import { useNavigate } from 'react-router-dom';
import SearchSection from './SearchSection';
import SortSection from './SortSection';
import ListsView from './ListsView';
import './QuestionList.css';
import AddListButton from './AddListButton/AddListButton';

export const QuestionList: React.FC<QuestionListProps> = ({
  initialLists,
  onListClick,
  className = '',
}) => {
  const navigate = useNavigate();
  
  const {
    filteredLists,
    viewMode,
    searchFilters,
    isLoading,
    handleSearch,
    handleSortChange,
    handleViewModeChange,
    handleListClick,
  } = useQuestionListViewModel(initialLists, onListClick);

  const [clickedListId, setClickedListId] = React.useState<string | null>(null);

  // Função para lidar com clique na lista
  const handleListClickWithNavigation = (list: QuestionListType) => {
    // Chama a callback original se existir
    if (onListClick) {
      onListClick(list);
    }
    
    // feedback imediato: marca o card como clicado (mostra spinner)
    setClickedListId(list.id);

    // Navega para a página de questões da lista após pequeno delay para renderizar o feedback
    setTimeout(() => {
      navigate(`/listas/${list.id}/questoes`);
    }, 120);
  };
  return (
    <div className={`question-list-page ${className}`}>
      {/* Header com controles de visualização */}
      <div className="question-list__header">
        <h1 className="question-list__title">Listas de Questões</h1>
        
          <div className="question-list__view-controls">
          
          <button
            className={`question-list__view-btn ${
              viewMode === 'list' ? 'question-list__view-btn--active' : ''
            }`}
            onClick={() => handleViewModeChange('list')}
            type="button"
          >
            <List size={18} />
          </button>
          <button
            className={`question-list__view-btn ${
              viewMode === 'grid' ? 'question-list__view-btn--active' : ''
            }`}
            onClick={() => handleViewModeChange('grid')}
            type="button"
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* Seção de busca */}
      <SearchSection onSearch={handleSearch} />

      {/* Seção de ordenação */}
      <SortSection onSortChange={handleSortChange} />
<div className="question-list__header-actions">
          <AddListButton professorId={'9f8053db-aec7-40c6-9d06-f25ac308d268'} />
          </div>
      {/* Lista de questões */}
      {isLoading ? (
        <div className="question-list__loading">
          Carregando listas...
        </div>
      ) : (
        <ListsView
          lists={filteredLists}
          viewMode={viewMode}
          onListClick={handleListClickWithNavigation}
          loadingListId={clickedListId}
        />
      )}
    </div>
  );
};

export default QuestionList;