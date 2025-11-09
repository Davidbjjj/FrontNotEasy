// components/ActivityList.tsx
import React from 'react';
import { ActivityListProps } from '../../model/Activity';
import './ActivityList.css';
import CreateActivityModal from './CreateActivityModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatGroupDate(index: number) {
  const d = new Date();
  d.setDate(d.getDate() + index);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
}

export const ActivityList: React.FC<ActivityListProps> = ({ activities, onToggleActivity }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();
  // group activities by a computed display date (for demo/mock data)
  const groups = activities.reduce<Record<string, typeof activities>>((acc, activity, idx) => {
    const groupKey = formatGroupDate(idx % 3); // rotate some dates for visual grouping
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(activity);
    return acc;
  }, {});

  return (
    <div className="activity-list-outer">
      <div className="activities-header">
        <h1 className="activities-page-title">Atividades</h1>
        <button className="activities-add-btn" onClick={() => setIsCreateOpen(true)}>Adicionar Atividade</button>
      </div>

      <div className="activities-groups">
        {Object.entries(groups).map(([groupDate, items]) => (
          <section key={groupDate} className="activity-group">
            <div className="activity-group-date">{groupDate}</div>
            <div className="activity-group-panel">
              {items.map((activity) => (
                <article key={activity.id} className="activity-card-row">
                  <div
                    className="activity-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/atividades/${activity.id}`, { state: { activity } })}
                    onKeyPress={(e) => { if (e.key === 'Enter') navigate(`/atividades/${activity.id}`, { state: { activity } }); }}
                  >
                    <div className="activity-thumb" aria-hidden>
                      {/* optional image placeholder – keep as background color for now */}
                    </div>
                    <div className="activity-body">
                      <div>
                        <h3 className="activity-card-title">{activity.title}</h3>
                        <p className="activity-card-sub">{activity.subject} · {activity.class}</p>
                      </div>
                      <div className="activity-meta">
                        <div className="deadline">{activity.deadline}</div>
                        <div className="activity-card-action">›</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <CreateActivityModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={(data) => { console.log('create', data); }} />
    </div>
  );
};