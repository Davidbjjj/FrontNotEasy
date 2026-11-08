import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../auth/auth';
import { Button, EmptyState } from '../../ui';
import { useStudentDashboard } from './useStudentDashboard';
import { deadlineStatus, describeDeadline, formatNota, sortByDeadline } from './dashboardLogic';
import type { StudentDashboard } from './types';
import styles from './StudentDashboard.module.css';

const STATUS_LABEL = { atrasada: 'Atrasada', urgente: 'Vence em até 48 h', normal: '', 'sem-prazo': '' } as const;
const ROW_CLASS = { atrasada: styles.atrasada, urgente: styles.urgente, normal: '', 'sem-prazo': '' } as const;

/** Lista em andamento/pendente: abre a lista para responder. */
const listaPath = (listaId: string) => `/listas/${listaId}/questoes`;
/** Revisão questão a questão com gabarito (FE-102). */
const revisaoPath = (listaId: string) => `/listas/${listaId}/revisao`;

const pct = (done: number, total: number) => (total > 0 ? Math.round((done / total) * 100) : 0);

const Progress: React.FC<{ done: number; total: number }> = ({ done, total }) => (
  <div className={styles.progress}>
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label="Progresso na lista"
    >
      <span style={{ width: `${pct(done, total)}%` }} />
    </div>
    <span className={styles.progressText}>{done}/{total} questões</span>
  </div>
);

const ContinueCard: React.FC<{ item: NonNullable<StudentDashboard['emAndamento']> }> = ({ item }) => (
  <section className={`${styles.card} ${styles.continue}`} aria-labelledby="continuar-titulo">
    <h2 id="continuar-titulo" className={styles.cardTitle}>Continuar de onde parou</h2>
    <p className={styles.itemTitle}>{item.titulo}</p>
    <p className={styles.muted}>{item.disciplina}</p>
    <Progress done={item.respondidas} total={item.total} />
    <Link className={styles.cta} to={listaPath(item.listaId)}>
      Continuar<span className="sr-only">: {item.titulo}</span>
    </Link>
  </section>
);

const Streak: React.FC<{ s: StudentDashboard['sequencia'] }> = ({ s }) => {
  const dias = (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`;
  let hint: string;
  if (s.atual === 0) hint = 'Responda uma questão hoje para começar sua sequência.';
  else if (!s.ativoHoje) hint = 'Estude hoje para não perder sua sequência!';
  else hint = 'Sequência garantida por hoje. Continue assim!';
  return (
    <section className={styles.card} aria-labelledby="sequencia-titulo">
      <h2 id="sequencia-titulo" className={styles.cardTitle}>Sequência de estudo</h2>
      <p className={styles.streakValue}>
        <span aria-hidden="true">🔥 </span>
        {dias(s.atual)}
        <span className="sr-only"> seguidos</span>
      </p>
      <p className={styles.muted}>{hint}</p>
      <p className={styles.muted}>Recorde: {dias(Math.max(s.recorde, s.atual))}</p>
    </section>
  );
};

const NextLists: React.FC<{ listas: StudentDashboard['proximasListas'] }> = ({ listas }) => {
  const now = new Date();
  const sorted = sortByDeadline(listas);
  return (
    <section className={styles.card} aria-labelledby="proximas-titulo">
      <h2 id="proximas-titulo" className={styles.cardTitle}>Próximas listas</h2>
      {sorted.length === 0 ? (
        <p className={styles.muted}>Nenhuma lista pendente. Aproveite para revisar suas notas!</p>
      ) : (
        <ul className={styles.list}>
          {sorted.map((l) => {
            const status = deadlineStatus(l.prazo, now);
            return (
              <li key={l.id} className={`${styles.row} ${ROW_CLASS[status]}`}>
                <div className={styles.rowMain}>
                  <Link to={listaPath(l.id)} className={styles.itemLink}>{l.titulo}</Link>
                  <span className={styles.muted}>{l.disciplina}</span>
                </div>
                <div className={styles.rowSide}>
                  {STATUS_LABEL[status] && (
                    <span className={`${styles.badge} ${status === 'atrasada' ? styles.badgeAtrasada : styles.badgeUrgente}`}>
                      {status === 'atrasada' ? 'Atrasada' : 'Urgente'}
                    </span>
                  )}
                  <span className={styles.deadline}>{describeDeadline(l.prazo, now)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

const LatestGrades: React.FC<{ notas: StudentDashboard['ultimasNotas'] }> = ({ notas }) => (
  <section className={styles.card} aria-labelledby="notas-titulo">
    <h2 id="notas-titulo" className={styles.cardTitle}>Últimas notas</h2>
    {notas.length === 0 ? (
      <p className={styles.muted}>Você ainda não tem notas. Elas aparecem aqui assim que forem lançadas.</p>
    ) : (
      <ul className={styles.list}>
        {notas.map((n) => (
          <li key={n.listaId} className={styles.row}>
            <div className={styles.rowMain}>
              <span className={styles.itemTitle}>{n.titulo}</span>
              <span className={styles.muted}>{n.disciplina}</span>
            </div>
            <div className={styles.rowSide}>
              <strong>{formatNota(n.nota, n.notaMaxima)}</strong>
              <Link to={revisaoPath(n.listaId)} className={styles.itemLink}>
                Revisar<span className="sr-only"> {n.titulo}</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

const StudentDashboardPage: React.FC = () => {
  const user = getCurrentUser();
  const estudanteId = (user?.userId as string) || localStorage.getItem('userId') || '';
  const { data, loading, error, retry } = useStudentDashboard(estudanteId);

  return (
    <main className={styles.page} aria-labelledby="inicio-titulo" aria-busy={loading || undefined}>
      <h1 id="inicio-titulo" className={styles.title}>Início</h1>

      {loading && <p role="status" className={styles.muted}>Carregando seu painel…</p>}

      {!loading && error && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={retry}>Tentar novamente</Button>
        </div>
      )}

      {!loading && !error && data && data.totalDisciplinas === 0 && (
        <EmptyState
          icon={<span aria-hidden="true">📚</span>}
          title="Você ainda não está em nenhuma disciplina"
          description="Peça ao seu professor ou à sua instituição para adicionar você a uma disciplina. Assim que isso acontecer, suas listas e notas aparecem aqui."
          action={<Link className={styles.cta} to="/disciplinas">Ver minhas disciplinas</Link>}
        />
      )}

      {!loading && !error && data && data.totalDisciplinas > 0 && (
        <div className={styles.grid}>
          {data.emAndamento && <ContinueCard item={data.emAndamento} />}
          <Streak s={data.sequencia} />
          <NextLists listas={data.proximasListas} />
          <LatestGrades notas={data.ultimasNotas} />
        </div>
      )}
    </main>
  );
};

export default StudentDashboardPage;
