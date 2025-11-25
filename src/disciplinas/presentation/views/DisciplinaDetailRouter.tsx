import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import DisciplinaAnalyticsPage from './DisciplinaAnalyticsPage';
import QuestoesPage from '../views/QuestoesPage';
import StudentDisciplinaMetrics from './StudentDisciplinaMetrics';

const DisciplinaDetailRouter: React.FC = () => {
  const { disciplinaId } = useParams();
  const rawRole = localStorage.getItem('role') || 'ESTUDANTE';
  const role = String(rawRole).toUpperCase();

  // If professor (or institution), show analytics. Otherwise, show questions page.
  if (!disciplinaId) return <Navigate to="/disciplinas" />;

  if (role === 'PROFESSOR' || role === 'INSTITUICAO' || role === 'TEACHER') {
    return <DisciplinaAnalyticsPage />;
  }

  // For students, show the disciplina metrics dashboard as requested
  if (role === 'ESTUDANTE' || role === 'ALUNO') {
    return <StudentDisciplinaMetrics />;
  }

  return <QuestoesPage />;
};

export default DisciplinaDetailRouter;
