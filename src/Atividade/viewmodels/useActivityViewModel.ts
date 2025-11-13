// viewmodels/useActivityViewModel.ts
/**
 * ARQUIVO LEGADO - DESCONTINUADO
 * Use ao invés:
 * - useActivityNotasViewModel.ts para gerenciar notas e respostas
 * - useActivityDetail.ts para carregar dados iniciais da atividade
 */

import { useState, useCallback } from 'react';
import { Activity } from '../model/Activity';

export const useActivityViewModel = (initialActivities: Activity[] = []) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const toggleActivity = useCallback((id: string, completed: boolean) => {
    setActivities(prevActivities =>
      prevActivities.map(activity =>
        activity.id === id ? { ...activity, completed } : activity
      )
    );
  }, []);

  return {
    activities,
    toggleActivity,
    addActivity: (activity: Activity) => setActivities(prev => [activity, ...prev]),
    // Replace the current activities list with a fetched/loaded list
    loadActivities: (items: Activity[]) => setActivities(items),
  };
};

// Dados mock para exemplo
export const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Atividade de Português',
    completed: false,
  },
  {
    id: '2',
    title: 'Atividade de Português',
    completed: false,
  },
  {
    id: '3',
    title: 'Atividade de Português',
    completed: false,
  }
];