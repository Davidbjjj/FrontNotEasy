// viewmodels/useActivityViewModel.ts
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
  };
};

// Dados mock para exemplo
export const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Atividade de Português',
    subject: 'Português',
    class: '1° C',
    completed: false,
    deadline: 'Prazo de Entrega em 15 dias'
  },
  {
    id: '2',
    title: 'Atividade de Português',
    subject: 'Português',
    class: '1° C',
    completed: false,
    deadline: 'Prazo de Entrega em 15 dias'
  },
  {
    id: '3',
    title: 'Atividade de Português',
    subject: 'Português',
    class: '1° C',
    completed: false,
    deadline: 'Prazo de Entrega em 15 dias'
  }
];