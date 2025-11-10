import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import '../../presentation/components/ActivityDetail.css';
import { eventoService, NotaResponseDTO } from '../../services/api/eventoService';
import { listaService } from '../../../listaQuestoes/services/api/listaService';

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

  let activity: any = mockActivity;
  try {
    const s = (location as any)?.state;
    // support two shapes: { activity: { ... } } or the activity object directly
    if (s && typeof s === 'object') {
      if (s.activity && typeof s.activity === 'object') {
        activity = s.activity;
      } else if (s.id || s.title) {
        activity = s;
      }
    }
  } catch (err) {
    // ignore and keep mockActivity
  }

  return (
    <div className="activity-detail-page">
      {/* Professor view: mostra painel de atividade e lista de notas */}
      {localStorage.getItem('role') === 'PROFESSOR' ? (
        <div className="activity-detail-professor">
          {/* Event details card - improved layout */}
          <EventDetailCard activity={activity} />

          <div className="activity-detail-notes">
            <h3>Alunos e Notas</h3>
            {activity?.id ? (
              <EventNotasContainer eventoId={activity.id} disciplinaName={activity?.list?.title ?? activity?.disciplina?.nome ?? ''} />
            ) : (
              <p>Evento não vinculado a uma lista — nenhuma nota disponível.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="activity-detail-card">
          <h2 className="ad-title">{activity?.title ?? mockActivity.title}</h2>
          <p className="ad-desc">{activity?.description ?? mockActivity.description}</p>
          <p className="ad-deadline">Data de entrega: {activity?.deadline ?? mockActivity.deadline}</p>

          <div className="ad-status">{activity?.status ?? mockActivity.status}</div>

          <hr />

          <div className="ad-section">
            <h4 className="ad-section-title">Lista de exercícios</h4>
            <div className="ad-list-item">
              <div className="ad-list-left">{activity?.list?.title ?? mockActivity.list.title}</div>
              <div className="ad-list-right">{activity?.list?.grade ?? mockActivity.list.grade}</div>
            </div>
          </div>

          <div className="ad-section">
            <h4 className="ad-section-title">Anexar arquivo ou link</h4>
            <textarea className="ad-textarea" placeholder="Cole link ou anexe arquivo..." />
          </div>

          <button className="ad-submit">Entregar</button>
        </div>
      )}

      <button className="ad-back" onClick={() => navigate(-1)}>Voltar</button>
    </div>
  );
};

const EventNotasContainer: React.FC<{ eventoId: string; disciplinaName?: string }> = ({ eventoId, disciplinaName }) => {
  const [listaId, setListaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evento, setEvento] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchEvento = async () => {
      setLoading(true);
      setError(null);
      try {
        const ev = await eventoService.getEvento(eventoId);
        if (!mounted) return;
        setEvento(ev || null);
        // try several possible shapes to extract listaId (prefer listas[0].idLista)
        const listaIdFound = ev?.listas?.[0]?.idLista || ev?.lista?.idLista || ev?.lista?.id || ev?.listaId || ev?.idLista || null;
        setListaId(listaIdFound ? String(listaIdFound) : null);
      } catch (err) {
        console.error('Erro ao buscar detalhes do evento:', err);
        if (!mounted) return;
        setError('Erro ao carregar detalhes do evento');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvento();
    return () => { mounted = false; };
  }, [eventoId]);

  if (loading) return <p>Carregando detalhes do evento...</p>;
  if (error) return <p>{error}</p>;
  if (!listaId) return <p>Evento sem lista associada.</p>;

  // if the event already contains notas array, pass them to render directly
  if (evento && Array.isArray(evento.notas) && evento.notas.length > 0) {
    const notasFromEvento = evento.notas.map((n: any, idx: number) => ({ nomeEstudante: n.nomeAluno || n.nomeEstudante || n.nome || `Aluno ${idx+1}`, nota: n.nota }));
    return <ProfessorNotasListInline notas={notasFromEvento} disciplinaName={evento?.disciplina?.nome || disciplinaName} evento={evento} />;
  }

  return <ProfessorNotasListByLista listaId={listaId} />;
};

const ProfessorNotasListByLista: React.FC<{ listaId: string }> = ({ listaId }) => {
  const [notas, setNotas] = useState<Array<{ nomeEstudante?: string; nota?: number }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchNotas = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listaService.getNotasPorLista(listaId);
        if (!mounted) return;
        setNotas(result || []);
      } catch (err) {
        console.error('Erro ao buscar notas da lista:', err);
        if (!mounted) return;
        setError('Erro ao carregar notas da lista');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchNotas();
    return () => { mounted = false; };
  }, [listaId]);

  if (loading) return <p>Carregando notas...</p>;
  if (error) return <p>{error}</p>;
  if (!notas || notas.length === 0) return <p>Nenhuma nota registrada ainda.</p>;

  return (
    <div className="professor-notas-list">
      {notas.map((n, idx) => (
        <div key={idx} className="professor-nota-row">
          <div className="student-card">
            <div className="student-card-left" aria-hidden />
            <div className="student-card-body">
              <div className="student-name">{n.nomeEstudante ?? '—'}</div>
              <div className="student-sub">{/* disciplina name could go here if available */}</div>
            </div>
            <div className="student-grade">{n.nota ?? '—'}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ProfessorNotasListInline: React.FC<{ notas: Array<{ nomeEstudante?: string; nota?: number }>; disciplinaName?: string; evento?: any }> = ({ notas, disciplinaName, evento }) => {
  return (
    <div className="professor-notas-list">
      {notas.map((n, idx) => (
        <div key={idx} className="student-card">
          <div className="student-card-left" aria-hidden />
          <div className="student-card-body">
            <div className="student-name">{n.nomeEstudante ?? '—'}</div>
            <div className="student-sub">{disciplinaName ?? evento?.disciplina?.nome ?? ''}</div>
          </div>
          <div className="student-grade">{n.nota ?? '—'}</div>
        </div>
      ))}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button className="report-button">Relatório</button>
      </div>
    </div>
  );
};

const EventDetailCard: React.FC<{ activity: any }> = ({ activity }) => {
  const title = activity?.nomeEvento || activity?.title || activity?.name || 'Atividade';
  const description = activity?.descricao || activity?.description || '';
  const prazo = activity?.prazo || activity?.deadline || '';
  const disciplina = activity?.disciplina?.nome || activity?.list?.title || '';
  const professor = activity?.professor?.nome || '';
  const lista = activity?.listas?.[0] || activity?.lista || null;
  // compute an example grade (average) if notas exist
  let gradeLabel: string | null = null;
  if (Array.isArray(activity?.notas) && activity.notas.length > 0) {
    const avg = activity.notas.reduce((s: number, it: any) => s + (Number(it.nota) || 0), 0) / activity.notas.length;
    gradeLabel = avg ? String(Number(avg.toFixed(1))) : null;
  }

  return (
    <div className="activity-detail-card event-card">
      <h2 className="ad-title">{title}</h2>
      {description && <p className="ad-desc">{description}</p>}
      <p className="ad-deadline">Data de entrega: {prazo}</p>
      <div className="ad-meta">
        <div className="ad-meta-left">{disciplina}</div>
        <div className="ad-meta-right">{professor}</div>
      </div>

      <hr />

      {lista ? (
        <div className="ad-section ad-list-box">
          <label className="ad-section-label">Lista de exercícios</label>
          <div className="ad-list-box-inner">
            <div className="ad-list-box-title">{lista.titulo || lista.title || lista.nome || 'Lista'}</div>
            <div className="ad-list-box-grade">{gradeLabel ?? (lista.grade ?? '')}</div>
          </div>
        </div>
      ) : null}

      <div className="ad-section">
        <label className="ad-section-label">Anexar arquivo ou link</label>
        <textarea className="ad-textarea" placeholder="Cole link ou anexe arquivo..." />
      </div>
    </div>
  );
};

export default ActivityDetailPage;
