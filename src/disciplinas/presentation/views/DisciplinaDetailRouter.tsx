import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import DisciplinaAnalyticsPage from './DisciplinaAnalyticsPage';
import QuestoesPage from '../views/QuestoesPage';

const DisciplinaDetailRouter: React.FC = () => {
  const { disciplinaId } = useParams();
  const role = localStorage.getItem('role') || 'ESTUDANTE';

  // If professor, show analytics. Otherwise, show questions page.
  if (!disciplinaId) return <Navigate to="/disciplinas" />;

  if (role === 'PROFESSOR') {
    return <DisciplinaAnalyticsPage />;
  }

  return <QuestoesPage />;
};

export default DisciplinaDetailRouter;
