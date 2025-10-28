export interface Professor {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  color?: string;
}

export interface QuestionList {
  id: string;
  title: string;
  subject: Subject;
  professor: Professor;
  questionsCompleted: number;
  totalQuestions: number;
  deadline?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  query: string;
  subjectId?: string;
  professorId?: string;
  sortBy: 'recent' | 'deadline' | 'progress';
  dateFilter?: Date;
  evolutionFilter?: string;
}

export interface QuestionListProps {
  initialLists?: QuestionList[];
  onListClick?: (list: QuestionList) => void;
  className?: string;
}

export interface SearchSectionProps {
  onSearch: (filters: SearchFilters) => void;
  className?: string;
}

export interface SortSectionProps {
  onSortChange: (sortBy: SearchFilters['sortBy']) => void;
  onDateFilterChange?: (date: Date) => void;
  onEvolutionFilterChange?: (evolution: string) => void;
  className?: string;
}

export interface ListsViewProps {
  lists: QuestionList[];
  viewMode: 'grid' | 'list';
  onListClick: (list: QuestionList) => void;
  className?: string;
}

export interface QuestionListViewModel {
  lists: QuestionList[];
  filteredLists: QuestionList[];
  viewMode: 'grid' | 'list';
  searchFilters: SearchFilters;
  isLoading: boolean;
  handleSearch: (filters: SearchFilters) => void;
  handleSortChange: (sortBy: SearchFilters['sortBy']) => void;
  handleViewModeChange: (mode: 'grid' | 'list') => void;
  handleListClick: (list: QuestionList) => void;
}