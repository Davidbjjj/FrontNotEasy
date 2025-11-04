import React from 'react';
import { SortSectionProps } from '../../model/QuestionList.types';
import './QuestionList.css';

export const SortSection: React.FC<SortSectionProps> = ({
  onSortChange,
  onDateFilterChange,
  onEvolutionFilterChange,
  className = '',
}) => {
  const [selectedSort, setSelectedSort] = React.useState<'recent' | 'deadline' | 'progress'>('recent');

  const handleSortChange = (sortBy: 'recent' | 'deadline' | 'progress') => {
    setSelectedSort(sortBy);
    onSortChange(sortBy);
  };

  return (
    <div className={`sort-section ${className}`}>
      <h3 className="sort-section__title">Ordenar por</h3>
      
      <div className="sort-section__options">
        <label className="sort-section__option">
          <input
            type="radio"
            className="sort-section__radio"
            checked={selectedSort === 'recent'}
            onChange={() => handleSortChange('recent')}
          />
          <span className="sort-section__label">mais recente</span>
        </label>
        
        <label className="sort-section__option">
          <input
            type="radio"
            className="sort-section__radio"
            checked={selectedSort === 'deadline'}
            onChange={() => handleSortChange('deadline')}
          />
          <span className="sort-section__label">prazo</span>
        </label>
        
        <label className="sort-section__option">
          <input
            type="radio"
            className="sort-section__radio"
            checked={selectedSort === 'progress'}
            onChange={() => handleSortChange('progress')}
          />
          <span className="sort-section__label">progresso</span>
        </label>
      </div>

      <div className="sort-section__filters">
        <div className="sort-section__filter">
          <span>Filtro por data:</span>
          <select className="sort-section__select">
            <option>selecionar</option>
            <option>Última semana</option>
            <option>Último mês</option>
            <option>Últimos 3 meses</option>
          </select>
        </div>
        
        <div className="sort-section__filter">
          <span>Filtro por evolução:</span>
          <select className="sort-section__select">
            <option>selecionar</option>
            <option>Não iniciadas</option>
            <option>Em andamento</option>
            <option>Concluídas</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SortSection;