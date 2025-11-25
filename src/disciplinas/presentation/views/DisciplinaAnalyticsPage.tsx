import React from 'react';
import { useParams } from 'react-router-dom';
import useDisciplinaAnalyticsViewModel from '../../viewmodels/useDisciplinaAnalyticsViewModel';
import styles from '../components/Disciplinas.module.css';
import layoutStyles from './DisciplinaAnalytics.module.css';
import AdicionarAlunoModal from '../components/AdicionarAlunoModal';
import Toast from '../../../components/Toast';
import { RefreshCw, UserPlus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DisciplinaAnalyticsPage: React.FC = () => {
  const { disciplinaId } = useParams();
  const currentRole = (localStorage.getItem('role') || '').toUpperCase();
  const professorId = localStorage.getItem('userId') || '';

  const { medias, listas, atividades, atividadesList, disciplina, isLoading, error, reload } = useDisciplinaAnalyticsViewModel(disciplinaId, professorId);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleAlunoAdded = (updated: any) => {
    reload();
    setToastMessage('Aluno adicionado com sucesso');
  };

  if (!disciplinaId) return <div className={styles.container}><p>Disciplina inválida</p></div>;

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.header}>
        <div>
          <h1 className={layoutStyles.title}>{disciplina?.nome || 'Analytics da Disciplina'}</h1>
          <div className={layoutStyles.smallMuted}>
            {currentRole === 'INSTITUICAO' ? (disciplina?.nomeEscola || '') : (disciplina?.professor?.nome || '')}
          </div>
        </div>
        <div className={layoutStyles.actions}>
          <button className={`${layoutStyles.btn} ${layoutStyles.btnGhost} iconBtn`} onClick={() => reload()}><RefreshCw size={16}/> Recarregar</button>
          {(currentRole === 'PROFESSOR' || currentRole === 'INSTITUICAO' || currentRole === 'TEACHER') && (
            <button className={`${layoutStyles.btn} ${layoutStyles.btnPrimary} iconBtn`} onClick={() => setShowAddModal(true)}><UserPlus size={16}/> Adicionar Aluno</button>
          )}
        </div>
      </div>

      {showAddModal && disciplinaId && (currentRole === 'PROFESSOR' || currentRole === 'INSTITUICAO' || currentRole === 'TEACHER') && (
        <AdicionarAlunoModal disciplinaId={disciplinaId} onClose={() => setShowAddModal(false)} onSuccess={handleAlunoAdded} />
      )}

      {isLoading ? (
        <p>Carregando métricas...</p>
      ) : error ? (
        <p>Erro: {error}</p>
      ) : (
        <div className={layoutStyles.layout}>
          <aside className={`${layoutStyles.panel}`}>
            <h3>Alunos ({(disciplina?.estudantes?.length ?? disciplina?.alunos?.length) || 0})</h3>
            <div className={layoutStyles.smallMuted} style={{ marginBottom: 8 }}>Lista de estudantes matriculados</div>
            <div className={layoutStyles.studentsList}>
              { (disciplina?.estudantes || disciplina?.alunos || []).map((s: any, idx: number) => (
                <div key={s?.id ?? idx} className={layoutStyles.studentRow}>
                  <div className={layoutStyles.studentInfo}>
                    <div className={layoutStyles.studentAvatar}>{(s?.nome || 'U').split(' ').map((p: string)=>p[0]).slice(0,2).join('').toUpperCase()}</div>
                    <div>
                      <div className={layoutStyles.studentName}>{s?.nome || s}</div>
                      <div className={layoutStyles.studentEmail}>{s?.email || ''}</div>
                    </div>
                  </div>
                </div>
              )) }
              { ((disciplina?.estudantes || disciplina?.alunos || []).length === 0) && (
                <div className={layoutStyles.smallMuted}>Nenhum estudante matriculado.</div>
              ) }
            </div>
          </aside>

          <main className={`${layoutStyles.panel}`}>
            <div className={layoutStyles.metrics}>
              <div>
                <h3>Médias dos Alunos</h3>
                {medias.length === 0 ? (
                  <div className={layoutStyles.smallMuted}>Nenhum dado encontrado</div>
                ) : (
                  <div className={layoutStyles.studentMetricList}>
                    {medias
                      .slice()
                      .sort((a,b) => b.media - a.media)
                      .map((m) => {
                        const pct = Number(m.media || 0);
                        const pctClass = pct >= 70 ? layoutStyles.percentHigh : pct >= 40 ? layoutStyles.percentMedium : layoutStyles.percentLow;
                        const fillWidth = Math.max(0, Math.min(100, pct));
                        return (
                          <div key={m.estudanteId} className={layoutStyles.studentMetricCard}>
                            <div className={layoutStyles.studentAvatar}>{(m.estudanteNome||'U').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}</div>
                            <div className={layoutStyles.studentMetricInfo}>
                              <div className={layoutStyles.studentMetricName}>{m.estudanteNome}</div>
                              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                <div>
                                  <div className={layoutStyles.progressBar} aria-hidden>
                                    <div className={layoutStyles.progressFill} style={{ width: `${fillWidth}%` }} />
                                  </div>
                                  <div className={layoutStyles.studentMetricEmail}>{m.respostasCount} respostas</div>
                                </div>
                              </div>
                            </div>
                            <div className={layoutStyles.studentMetricRight}>
                              <div className={`${layoutStyles.percentBadge} ${pctClass}`}>{pct.toFixed(0)}%</div>
                              <div className={layoutStyles.responsesCount}>{m.respostasCount} respostas</div>
                            </div>
                          </div>
                        );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ marginTop: 12 }}>Listas com Menores Médias</h3>
                {listas.length === 0 ? (
                  <div className={layoutStyles.smallMuted}>Nenhuma lista encontrada</div>
                ) : (
                  <div className={layoutStyles.listCards}>
                    {listas.map((l, idx) => {
                      const pct = Number(l.media || 0);
                      const fill = Math.max(0, Math.min(100, pct));
                      return (
                        <div className={layoutStyles.listCard} key={l.listaId}>
                          <div>
                            <div className={layoutStyles.listTitle}>{idx + 1}. {l.listaTitulo}</div>
                            <div className={layoutStyles.listMeta}>{l.respostasCount} respostas</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className={layoutStyles.difficultyBar} aria-hidden>
                              <div className={layoutStyles.difficultyFill} style={{ width: `${100 - fill}%` }} />
                            </div>
                            <div className={layoutStyles.smallMuted}>{pct.toFixed(2)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ marginTop: 12 }}>Atividades Concluídas por Aluno</h3>
                {atividades.length === 0 ? (
                  <div className={layoutStyles.smallMuted}>Nenhum registro encontrado</div>
                ) : (
                  <div className={layoutStyles.completedList}>
                    {atividades.map((a) => {
                      const totalAtiv = atividadesList.length || 0;
                      const pct = totalAtiv > 0 ? Math.round((a.atividadesConcluidas / totalAtiv) * 100) : 0;
                      return (
                        <div key={a.estudanteId} className={layoutStyles.completedItem}>
                          <div className={layoutStyles.studentInfo}>
                            <div className={layoutStyles.studentAvatar}>{(a.estudanteNome||'U').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()}</div>
                            <div>
                              <div className={layoutStyles.completedLabel}>{a.estudanteNome}</div>
                              <div className={layoutStyles.smallMuted}>{a.atividadesConcluidas} atividades concluídas</div>
                            </div>
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                            <div className={layoutStyles.completedCount}>{a.atividadesConcluidas} / {totalAtiv}</div>
                            <div className={layoutStyles.progressBar} style={{ width: 140 }} aria-hidden>
                              <div className={layoutStyles.progressFill} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>

          <aside className={`${layoutStyles.panel}`}>
            <h3>Atividades ({atividadesList.length})</h3>
            <div className={layoutStyles.smallMuted} style={{ marginBottom: 8 }}>Atividades recentemente postadas</div>
            <div className={layoutStyles.activitiesList}>
                {atividadesList.map((at: any) => {
                const activityId = at.eventoId ?? at.listaId ?? at.id;
                return (
                <div
                  key={activityId ?? JSON.stringify(at)}
                  className={`${layoutStyles.activityCard} ${layoutStyles.activityCardClickable}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => activityId && navigate(`/atividades/${activityId}`)}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && activityId) navigate(`/atividades/${activityId}`); }}
                >
                  <BookOpen size={20} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className={layoutStyles.activityTitle}>{at.titulo}</div>
                    <div className={layoutStyles.activityMeta}>{at.totalQuestoes ?? ''} questões</div>
                  </div>
                </div>
              )})}
              {atividadesList.length === 0 && <div className={layoutStyles.smallMuted}>Nenhuma atividade encontrada</div>}
            </div>
          </aside>
        </div>
      )}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default DisciplinaAnalyticsPage;
