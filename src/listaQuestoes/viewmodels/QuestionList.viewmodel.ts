import { useState, useCallback, useEffect } from 'react';
import { QuestionList, SearchFilters, QuestionListViewModel } from '../model/QuestionList.types';
import { questionListService } from '../services/api/questionList.service';

export const useQuestionListViewModel = (
  initialLists?: QuestionList[],
  onListClick?: (list: QuestionList) => void
): QuestionListViewModel => {
  const [lists, setLists] = useState<QuestionList[]>(initialLists || []);
  const [filteredLists, setFilteredLists] = useState<QuestionList[]>(initialLists || []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'recent',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados da API
  const loadQuestionLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await questionListService.getAllQuestionLists();
      setLists(data);
      setFilteredLists(data);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      // Você pode querer manter os dados mockados como fallback
      setLists([]);
      setFilteredLists([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Expose a reload function so parent components can trigger a fresh load
  const reload = useCallback(() => {
    loadQuestionLists();
  }, [loadQuestionLists]);

  useEffect(() => {
    if (!initialLists) {
      loadQuestionLists();
    }
  }, [initialLists, loadQuestionLists]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
    setIsLoading(true);

    // Usar setTimeout para simular delay de busca (opcional)
    setTimeout(() => {
      let filtered = lists;

      // Filtro por texto
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filtered = filtered.filter(list =>
          list.title.toLowerCase().includes(query) ||
          list.professor.name.toLowerCase().includes(query) ||
          list.subject.name.toLowerCase().includes(query)
        );
      }

      // Ordenação
      switch (filters.sortBy) {
        case 'recent':
          filtered = [...filtered].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'deadline':
          // Ordenar por deadline (ajuste conforme seus dados reais)
          filtered = [...filtered].sort((a, b) => 
            parseInt(a.deadline || '0') - parseInt(b.deadline || '0')
          );
          break;
        case 'progress':
          filtered = [...filtered].sort((a, b) => 
            (b.questionsCompleted / b.totalQuestions) - (a.questionsCompleted / a.totalQuestions)
          );
          break;
      }

      setFilteredLists(filtered);
      setIsLoading(false);
    }, 300);
  }, [lists]);

  const handleSortChange = useCallback((sortBy: SearchFilters['sortBy']) => {
    handleSearch({ ...searchFilters, sortBy });
  }, [handleSearch, searchFilters]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleListClick = useCallback((list: QuestionList) => {
  if (onListClick) {
    onListClick(list);
  }
}, [onListClick]);

  return {
    lists,
    filteredLists,
    viewMode,
    searchFilters,
    isLoading,
    handleSearch,
    handleSortChange,
    handleViewModeChange,
    handleListClick,
    reload,
  };
};