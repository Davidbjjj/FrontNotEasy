import React from 'react';
import { useActivityCardViewModel } from '../../viewmodels/ActivityCard.viewmodel';
import { ActivityCardProps } from '../../model/ActivityCard.types';
import './ActivityCard.css';

export const ActivityCard: React.FC<ActivityCardProps> = ({ activities }) => {
  const { markAsCompleted } = useActivityCardViewModel(activities);

  return (
    <div className="activity-page">
      <button className="add-activity-btn">Adicionar Nova Atividade</button>

      <div className="activity-card-container">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <img
              src="/assets/classroom.jpg"
              alt="Imagem da atividade"
              className="activity-image"
            />

            <div className="activity-info">
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-description">{activity.description}</p>
              <p className="activity-due-date">Prazo de Entrega: {activity.dueDate}</p>
            </div>

            <button
              className="activity-arrow"
              onClick={() => markAsCompleted(activity.id)}
              title="Ver Detalhes"
            >
              {/* SVG seta direita (sem react-icons) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M1 8a.5.5 0 0 1 .5-.5h11.793L9.146 4.354a.5.5 0 1 1 .708-.708l4.5 4.5a.498.498 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
