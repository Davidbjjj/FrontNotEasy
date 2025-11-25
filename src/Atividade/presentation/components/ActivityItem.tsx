// components/ActivityItem.tsx
import React from 'react';
import { Activity } from '../../model/Activity';
import { formatDateTime } from '../../../utils/date';

interface ActivityItemProps {
  activity: Activity;
  onToggle?: (id: string, completed: boolean) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  onToggle 
}) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onToggle) {
      onToggle(activity.id, event.target.checked);
    }
  };

  return (
    <div className="activity-item">
      <h3 className="activity-title">{activity.title}</h3>
      <div className="activity-details">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={activity.completed}
            onChange={handleCheckboxChange}
            className="activity-checkbox"
          />
          <span className="checkmark"></span>
          {activity.subject} {activity.class}
        </label>
        <div className={`deadline ${activity.completed ? 'completed' : ''}`}>
          {activity.completed && '✓ '}{formatDateTime(activity.deadline)}
        </div>
      </div>
    </div>
  );
};