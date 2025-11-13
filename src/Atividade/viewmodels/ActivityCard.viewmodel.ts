import { useState } from 'react';
import { Activity } from './../model/ActivityCard.types';

export const useActivityCardViewModel = (initialActivities: Activity[]) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const updateStatus = (id: number, status: 'pendente' | 'concluído') => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, status } : activity
      )
    );
  };

  const markAsCompleted = (id: number) => {
    updateStatus(id, 'concluído');
  };

  return {
    activities,
    markAsCompleted,
  };
};
