import React from 'react';
import { useActivityCardViewModel } from '../../viewmodels/ActivityCard.viewmodel';
import { ActivityCardProps } from '../../model/ActivityCard.types';
import './ActivityCard.css';

export const ActivityCard: React.FC<ActivityCardProps> = ({ activities }) => {
  const { markAsCompleted } = useActivityCardViewModel(activities);

  // Função para determinar se a atividade é urgente
  const isActivityUrgent = (dueDate: string | number | Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2; // Urgente se faltar 2 dias ou menos
  };

  // Função para formatar a data
  const formatDueDate = (dueDate: string | number | Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dueDate).toLocaleDateString('pt-BR', options);
  };

  // Estado vazio
  if (!activities || activities.length === 0) {
    return (
      <div className="activity-page">
        <button className="add-activity-button">
          Adicionar Nova Atividade
        </button>
        
        <div className="activity-empty-state">
          <div className="activity-empty-icon">📚</div>
          <h2 className="activity-empty-title">Nenhuma atividade encontrada</h2>
          <p>Comece adicionando sua primeira atividade!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-page">
      <button 
        className="add-activity-button"
        aria-label="Adicionar nova atividade"
      >
        Adicionar Nova Atividade
      </button>

      <div className="activity-list" role="list" aria-label="Lista de atividades">
        {activities.map((activity, index) => {
          const isUrgent = isActivityUrgent(activity.dueDate);
          const isCompleted = activity.status === 'concluído';
          const cardClassNames = [
            'activity-card-item',
            isUrgent ? 'activity-card-item--urgent' : '',
            isCompleted ? 'activity-card-item--completed' : ''
          ].filter(Boolean).join(' ');

          return (
            <div 
              key={activity.id}
              className={cardClassNames}
              role="listitem"
              tabIndex={0}
              aria-label={`Atividade: ${activity.title}. Prazo: ${formatDueDate(activity.dueDate)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  markAsCompleted(activity.id);
                }
              }}
            >
              <img
                src={"/assets/classroom.jpg"}
                alt={`Imagem representativa da atividade: ${activity.title}`}
                className="activity-image"
                loading="lazy"
              />

              <div className="activity-info">
                <h3 className="activity-title">{activity.title}</h3>
                
                {activity.description && (
                  <p className="activity-description">{activity.description}</p>
                )}
                
                <div className="activity-deadline-row">
                  <span className="activity-clock">⏰</span>
                  <span className="activity-due-date">
                    Prazo: {formatDueDate(activity.dueDate)}
                  </span>
                </div>

                {/* Status badge */}
                <div className={`activity-status ${
                  isCompleted
                    ? 'activity-status--completed' 
                    : isUrgent 
                    ? 'activity-status--urgent' 
                    : 'activity-status--pending'
                }`}>
                  {isCompleted ? 'Concluída' : isUrgent ? 'Urgente' : 'Pendente'}
                </div>
              </div>

              <button
                className="activity-arrow"
                onClick={() => markAsCompleted(activity.id)}
                title={`Marcar "${activity.title}" como concluída`}
                aria-label={`Ver detalhes e marcar a atividade "${activity.title}" como concluída`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M1 8a.5.5 0 0 1 .5-.5h11.793L9.146 4.354a.5.5 0 1 1 .708-.708l4.5 4.5a.498.498 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};