// components/ActivityList.tsx
import React from 'react';
import { ActivityListProps } from '../../model/Activity';
import { ActivityItem } from './ActivityItem';
import './ActivityList.css';

export const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  onToggleActivity 
}) => {
  return (
    <div className="activity-list">
      <h2 className="list-title">Adicionar Nova Atividade</h2>
      {activities.map((activity, index) => (
        <div key={activity.id}>
          <ActivityItem 
            activity={activity} 
            onToggle={onToggleActivity}
          />
          {index < activities.length - 1 && <hr className="divider" />}
        </div>
      ))}
    </div>
  );
};