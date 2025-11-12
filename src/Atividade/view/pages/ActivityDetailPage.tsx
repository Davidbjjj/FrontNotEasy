import React from 'react';
import { useHistory } from 'react-router-dom';
import '../../presentation/components/ActivityDetail.css';
import { useActivity } from '../../viewmodels/useActivityDetail';
import { EventDetailCard, StudentView, EventNotasContainer } from '../../presentation/components/EventComponents';

interface ActivityDetailPageProps {
  isProfessor?: boolean;
}

/**
 * Página de detalhes de atividade
 * Responsável por:
 * - Carregar dados da atividade
 * - Renderizar view diferente para professor/aluno
 * - Delegação de lógica para componentes especializados
 */
const ActivityDetailPage: React.FC<ActivityDetailPageProps> = ({ isProfessor }) => {
  const history = useHistory();
  const activity = useActivity();
  
  // Detecta role se não for passado via prop
  const isUserProfessor = isProfessor ?? localStorage.getItem('role') === 'PROFESSOR';

  return (
    <div className="activity-detail-page">
      {isUserProfessor ? (
        <ProfessorView activity={activity} />
      ) : (
        <StudentView activity={activity} />
      )}

      <button
        className="ad-back"
        onClick={() => history.goBack()}
        aria-label="Voltar para página anterior"
      >
        Voltar
      </button>
    </div>
  );
};

/**
 * Componente separado para view do professor
 * Exibe detalhes do evento + lista de notas
 */
interface ProfessorViewProps {
  activity: any;
}

const ProfessorView: React.FC<ProfessorViewProps> = ({ activity }) => {
  return (
    <div className="activity-detail-professor">
      <EventDetailCard activity={activity} />

      <div className="activity-detail-notes">
        <h3>Alunos e Notas</h3>
        {activity?.id ? (
          <EventNotasContainer
            eventoId={activity.id}
            disciplinaName={
              activity?.list?.title ?? activity?.disciplina?.nome ?? ''
            }
          />
        ) : (
          <div className="empty-state">
            Evento não vinculado a uma lista — nenhuma nota disponível.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityDetailPage;