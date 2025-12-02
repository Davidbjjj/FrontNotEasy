// components/ActivityList.tsx
import React, { useState, useMemo } from 'react';
import { ActivityListProps, Activity } from '../../model/Activity';
import { formatDateTime } from '../../../utils/date';
import './ActivityList.css';
import CreateActivityModal from './CreateActivityModal';
import { useNavigate } from 'react-router-dom';
import { eventoService } from '../../services/api/eventoService';
import { message, Popconfirm, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';


export const ActivityList: React.FC<ActivityListProps> = ({ activities, onToggleActivity, onCreateActivity }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'overdue' | 'upcoming'>('all');
  const [query, setQuery] = useState<string>('');
  const navigate = useNavigate();

  const handleDeleteEvento = async (eventoId: string) => {
    try {
      await eventoService.deleteEvento(eventoId);
      message.success('Evento deletado com sucesso!');
      // Recarregar a página ou atualizar a lista
      window.location.reload();
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao deletar evento';
      message.error(errorMessage);
    }
  };

  const userRole = (localStorage.getItem('role') || '').toUpperCase();
  const canDelete = userRole === 'PROFESSOR' || userRole === 'TEACHER' || userRole === 'INSTITUICAO';
  // NOTE: helper functions moved inside useMemo to satisfy react-hooks/exhaustive-deps

  // apply search + filter, then sort by due date ascending (nearest first)
  const filtered = useMemo(() => {
    const toDate = (val: any) => (val ? new Date(val) : null);

    const isOverdue = (a: Activity) => {
      const d = toDate(a.deadline);
      if (!d) return false;
      return d.getTime() < Date.now();
    };

    const isUrgent = (a: Activity) => {
      const d = toDate(a.deadline);
      if (!d) return false;
      const diffTime = d.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2; // 2 days or less
    };

    if (!activities) return [] as Activity[];
    const q = (query || '').trim().toLowerCase();
    return activities
      .filter((a) => {
        if (q) {
          const hay = `${a.title || ''} ${a.subject || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (filter === 'urgent') return isUrgent(a);
        if (filter === 'overdue') return isOverdue(a);
        if (filter === 'upcoming') return !isOverdue(a);
        return true;
      })
      .slice()
      .sort((x, y) => {
        const dx = toDate(x.deadline)?.getTime() ?? Infinity;
        const dy = toDate(y.deadline)?.getTime() ?? Infinity;
        return dx - dy;
      });
  }, [activities, filter, query]);

  // group by formatted dueDate for display
  const groups = useMemo(() => {
    const toDate = (val: any) => (val ? new Date(val) : null);
    return filtered.reduce<Record<string, Activity[]>>((acc, activity) => {
      const d = toDate(activity.deadline) || new Date();
      const groupKey = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(activity);
      return acc;
    }, {} as Record<string, Activity[]>);
  }, [filtered]);

  return (
    <div className="activity-list-outer">
      <div className="activities-header">
        <h1 className="activities-page-title">Atividades</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            placeholder="Pesquisar título ou disciplina"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Pesquisar atividades"
            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} aria-label="Filtrar atividades">
            <option value="all">Todos</option>
            <option value="urgent">Urgentes (≤2 dias)</option>
            <option value="overdue">Vencidas</option>
            <option value="upcoming">Futuras</option>
          </select>
          <button className="activities-add-btn" onClick={() => setIsCreateOpen(true)}>Adicionar Atividade</button>
        </div>
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
                        <h3 className="activity-card-title">{activity.title || 'Sem título'}</h3>
                        {
                          (() => {
                            const parts = [activity.subject, activity.class].filter(Boolean);
                            if (parts.length === 0) return null;
                            return <p className="activity-card-sub">{parts.join(' · ')}</p>;
                          })()
                        }
                      </div>
                        <div className="activity-meta">
                        <div className="deadline">{formatDateTime(activity.deadline)}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {canDelete && (
                            <Popconfirm
                              title="Deletar Evento"
                              description="Tem certeza que deseja deletar este evento?"
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                handleDeleteEvento(activity.id);
                              }}
                              onCancel={(e) => e?.stopPropagation()}
                              okText="Sim"
                              cancelText="Não"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Popconfirm>
                          )}
                          <div className="activity-card-action">›</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <CreateActivityModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={async (data) => {
          try {
            const rawRole = localStorage.getItem('role') || '';
            const normalizedRole = String(rawRole).toUpperCase();
            const isProfessor = normalizedRole === 'PROFESSOR' || normalizedRole === 'TEACHER' || normalizedRole === 'INSTITUICAO';
            if (isProfessor) {
              localStorage.getItem('userId');
              const payload = {
                titulo: data.name,
                descricao: data.description,
                notaMaxima: typeof data.maxGrade === 'number' ? data.maxGrade : (Number(data.maxGrade) || 10),
                data: data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString(),
                disciplinaId: data.discipline,
                arquivos: [],
              };

              const evento = await eventoService.criarEvento(payload);
              const eventoId = evento?.idEvento || (evento as any)?.id;
              if (eventoId && data.associatedList) {
                try {
                  await eventoService.associarLista(eventoId, data.associatedList);
                } catch (err) {
                  console.warn('Falha ao associar lista ao evento:', err);
                }
              }

              const newActivity: Activity = {
                id: String(eventoId || Date.now()),
                title: payload.titulo,
                subject: data.discipline || '',
                class: '',
                completed: false,
                deadline: data.dueDate || ''
              };

              if (onCreateActivity) onCreateActivity(newActivity);
            } else {
              // non-professor: create local activity
              const newActivity: Activity = {
                id: String(Date.now()),
                title: data.name,
                subject: data.discipline || '',
                class: '',
                completed: false,
                deadline: data.dueDate || ''
              };
              if (onCreateActivity) onCreateActivity(newActivity);
            }
          } catch (err) {
            console.error('Erro ao criar atividade:', err);
          } finally {
            setIsCreateOpen(false);
          }
        }}
      />
    </div>
  );
};