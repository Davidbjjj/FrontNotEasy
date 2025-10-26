import React from 'react';
import { Grid, List } from 'lucide-react';
import { useQuestionListViewModel } from '../../viewmodels/QuestionList.viewmodel';
import { QuestionListProps } from '../../model/QuestionList.types';
import SearchSection from './SearchSection';
import SortSection from './SortSection';
import ListsView from './ListsView';
import './QuestionList.css';

export const QuestionList: React.FC<QuestionListProps> = ({
  initialLists,
  onListClick,
  className = '',
}) => {
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

      {/* Lista de questões */}
      {isLoading ? (
        <div className="question-list__loading">
          Carregando listas...
        </div>
      ) : (
        <ListsView
          lists={filteredLists}
          viewMode={viewMode}
          onListClick={handleListClick}
        />
      )}
    </div>
  );
};

export default QuestionList;