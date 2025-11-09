import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import '../../presentation/components/ActivityDetail.css';

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Always provide a mocked activity object so the UI never crashes during design preview.
  const mockActivity = {
    id: id || 'exemplo-123',
    title: 'Atividade: Matemática',
    description: 'A descrição da atividade vai aqui',
    deadline: '20 de abril',
    status: 'Pendentes',
    list: { title: 'Lista de exercícios 1', grade: '8,5' }
  };

  let activity = mockActivity;
  try {
    const s = (location as any)?.state;
    if (s && typeof s === 'object' && s.activity && typeof s.activity === 'object') {
      activity = s.activity;
    }
  } catch (err) {
    // ignore and keep mockActivity
  }

  return (
    <div className="activity-detail-page">
      <div className="activity-detail-card">
        <h2 className="ad-title">{activity.title}</h2>
        <p className="ad-desc">{activity.description}</p>
        <p className="ad-deadline">Data de entrega: {activity.deadline}</p>

        <div className="ad-status">{activity.status}</div>

        <hr />

        <div className="ad-section">
          <h4 className="ad-section-title">Lista de exercícios</h4>
          <div className="ad-list-item">
            <div className="ad-list-left">{activity.list.title}</div>
            <div className="ad-list-right">{activity.list.grade}</div>
          </div>
        </div>

        <div className="ad-section">
          <h4 className="ad-section-title">Anexar arquivo ou link</h4>
          <textarea className="ad-textarea" placeholder="Cole link ou anexe arquivo..." />
        </div>

        <button className="ad-submit">Entregar</button>
      </div>
      <button className="ad-back" onClick={() => navigate(-1)}>Voltar</button>
    </div>
  );
};

export default ActivityDetailPage;
