import React, { useState } from 'react';
import { StudentNotasList } from './StudentsList';
import { LoadingState, ErrorState, EmptyState } from './StateComponents';
import { useEvento } from '../../viewmodels/useActivityNotasViewModel';
import { Activity, Student } from '../../model/Activity';
import './styles/EventComponents.css';

interface StudentViewProps {
  activity: Activity;
}

/**
 * Componente para visualização do estudante
 * Exibe a atividade e campo para anexar arquivo/link
 */
export const StudentView: React.FC<StudentViewProps> = ({ activity }) => {
  const [attachment, setAttachment] = useState('');

  return (
    <div className="activity-detail-card">
      <h1 className="ad-title">{activity.title}</h1>
      {activity.description && <p className="ad-desc">{activity.description}</p>}
      {activity.deadline && (
        <p className="ad-deadline">Data de entrega: {activity.deadline}</p>
      )}

      {activity.status && <div className="ad-status">{activity.status}</div>}

      <hr aria-hidden="true" />

      <div className="ad-section">
        <h2 className="ad-section-title">Lista de exercícios</h2>
        <div className="ad-list-item">
          <div className="ad-list-left">{activity.list?.title}</div>
          <div className="ad-list-right">{activity.list?.grade}</div>
        </div>
      </div>

      <div className="ad-section">
        <label htmlFor="attachment-input" className="ad-section-label">
          Anexar arquivo ou link
        </label>
        <textarea
          id="attachment-input"
          className="ad-textarea"
          placeholder="Cole link ou anexe arquivo..."
          value={attachment}
          onChange={(e) => setAttachment(e.target.value)}
          aria-describedby="attachment-help"
        />
        <div id="attachment-help" className="sr-only">
          Cole o link do seu trabalho ou descreva o arquivo que será anexado
        </div>
      </div>

      <button className="ad-submit" aria-label="Entregar atividade">
        Entregar
      </button>
    </div>
  );
};

interface EventDetailCardProps {
  activity: Activity;
}

/**
 * Card de detalhes do evento para professores
 * Exibe informações da atividade com cálculo de média de notas
 */
export const EventDetailCard: React.FC<EventDetailCardProps> = ({ activity }) => {
  const title =
    activity?.nomeEvento || activity?.title || 'Atividade';
  const description =
    activity?.descricao || activity?.description || '';
  const prazo = activity?.prazo || activity?.deadline || '';
  const disciplina =
    activity?.disciplina?.nome || activity?.list?.title || '';
  const professor = activity?.professor?.nome || '';
  const lista = activity?.listas?.[0] || activity?.lista || null;

  // Calcula média das notas se existirem
  let gradeLabel: string | null = null;
  if (Array.isArray(activity?.notas) && activity.notas.length > 0) {
    const avg =
      activity.notas.reduce((s: number, it: any) => s + (Number(it.nota) || 0), 0) /
      activity.notas.length;
    gradeLabel = avg ? String(Number(avg.toFixed(1))) : null;
  }

  return (
    <div className="activity-detail-card event-card">
      <h1 className="ad-title">{title}</h1>

      {description && <p className="ad-desc">{description}</p>}

      <p className="ad-deadline">Data de entrega: {prazo}</p>

      <div className="ad-meta">
        <div className="ad-meta-left">{disciplina}</div>
        <div className="ad-meta-right">{professor}</div>
      </div>

      <hr aria-hidden="true" />

      {lista && (
        <div className="ad-section ad-list-box">
          <span className="ad-section-label">Lista de exercícios</span>
          <div className="ad-list-box-inner">
            <div className="ad-list-box-title">
              {lista.titulo || lista.title || lista.nome || 'Lista'}
            </div>
            {gradeLabel && (
              <div className="ad-list-box-grade">{gradeLabel}</div>
            )}
          </div>
        </div>
      )}

      <div className="ad-section">
        <label htmlFor="professor-notes" className="ad-section-label">
          Observações para alunos
        </label>
        <textarea
          id="professor-notes"
          className="ad-textarea"
          placeholder="Adicione observações ou instruções adicionais..."
          aria-describedby="notes-help"
        />
        <div id="notes-help" className="sr-only">
          Campo opcional para adicionar observações sobre a atividade
        </div>
      </div>
    </div>
  );
};

interface EventNotasContainerProps {
  eventoId: string;
  disciplinaName?: string;
}

/**
 * Container principal de notas para professores
 * Responsável por:
 * - Carregar dados do evento
 * - Normalizar lista associada
 * - Renderizar lista de notas
 */
export const EventNotasContainer: React.FC<EventNotasContainerProps> = ({
  eventoId,
  disciplinaName,
}) => {
  const { evento, listaId, loading, error } = useEvento(eventoId);

  if (loading) {
    return <LoadingState message="Carregando detalhes do evento..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!listaId) {
    return <EmptyState message="Evento sem lista associada." />;
  }

  // Renderiza lista de notas consolidada
  return (
    <StudentNotasList
      listaId={listaId}
      evento={evento}
      eventoId={eventoId}
      disciplinaName={
        evento?.disciplina?.nome || disciplinaName
      }
    />
  );
};
