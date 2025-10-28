import React from 'react';
import { SearchSectionProps } from '../../model/QuestionList.types';
import './QuestionList.css';

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  className = '',
}) => {
  const [query, setQuery] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch({ query: value, sortBy: 'recent' });
  };

  return (
    <div className={`search-section ${className}`}>
      <h3 className="search-section__title">Busca rápida:</h3>
      <input
        type="text"
        className="search-section__input"
        placeholder="Digite aqui a disciplina, nome do(a) professor(a), título da atividade"
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SearchSection;