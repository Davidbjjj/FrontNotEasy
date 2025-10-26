import { useState, useCallback, useEffect } from 'react';
import { QuestionList, SearchFilters, QuestionListViewModel } from '../model/QuestionList.types';

// Mock data - substituir por chamada API real
const mockQuestionLists: QuestionList[] = [
  {
    id: '1',
    title: 'Língua Portuguesa',
    subject: { id: 'portugues', name: 'Português', color: '#3B82F6' },
    professor: { id: '1', name: 'Carlos Lacerdá M.' },
    questionsCompleted: 0,
    totalQuestions: 12,
    deadline: '15 dias',
    tags: ['Concedência Nominal', 'Concedência Verbal'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Língua Inglesa',
    subject: { id: 'ingles', name: 'Inglês', color: '#EF4444' },
    professor: { id: '2', name: 'Fulano da Silva' },
    questionsCompleted: 9,
    totalQuestions: 12,
    deadline: '3 dias',
    tags: ['Concedência Verbal'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    title: 'Matemática',
    subject: { id: 'matematica', name: 'Matemática', color: '#10B981' },
    professor: { id: '3', name: 'Ada Lovelace N. S.' },
    questionsCompleted: 10,
    totalQuestions: 20,
    deadline: '15 dias',
    tags: ['Concedência Verbal'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
];

export const useQuestionListViewModel = (
  initialLists?: QuestionList[],
  onListClick?: (list: QuestionList) => void
): QuestionListViewModel => {
  const [lists, setLists] = useState<QuestionList[]>(initialLists || mockQuestionLists);
  const [filteredLists, setFilteredLists] = useState<QuestionList[]>(initialLists || mockQuestionLists);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'recent',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Simular carregamento de dados
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simular chamada API
      setTimeout(() => {
        setLists(mockQuestionLists);
        setFilteredLists(mockQuestionLists);
        setIsLoading(false);
      }, 500);
    };

    if (!initialLists) {
      loadData();
    }
  }, [initialLists]);

  const handleSearch = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
    setIsLoading(true);

    // Simular filtragem
    setTimeout(() => {
      let filtered = mockQuestionLists;

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
          // Ordenar por deadline (simplificado)
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
  }, []);

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
  };
};