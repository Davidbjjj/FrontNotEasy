import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../auth/auth';
import { Button, EmptyState } from '../../ui';
import { deadlineStatus } from '../dashboard/dashboardLogic';
import { studentDashboardService } from '../dashboard/dashboardService';
import { useStudentResource } from '../evolucao/useStudentResource';
import {
  DIAS_SEMANA, addDias, addMeses, agruparPorDia, chaveDia, contarListas, corPorDisciplina, diasDaSemana,
  horaPrazo, atividadePath, mesmoDia, rotuloDia, semanasDoMes, tituloMes, tituloSemana,
} from './calendarioLogic';
import type { EntregaCalendario, ListaNoCalendario, Visao } from './calendarioLogic';
import type { StudentDashboard } from '../dashboard/types';
import styles from './Calendario.module.css';

type Cores = Map<string, string>;

const Etiqueta: React.FC<{ nome: string; cor: string }> = ({ nome, cor }) => (
  <span className={styles.disc}>
    <span className={styles.swatch} style={{ background: cor }} aria-hidden="true" />
    {nome}
  </span>
);

const Legenda: React.FC<{ cores: Cores }> = ({ cores }) => (
  <section aria-label="Legenda de disciplinas">
    <ul className={styles.legenda}>
      {Array.from(cores).map(([nome, cor]) => (
        <li key={nome}><Etiqueta nome={nome} cor={cor} /></li>
      ))}
    </ul>
  </section>
);

const Item: React.FC<{ l: ListaNoCalendario | EntregaCalendario; cores: Cores; agora: Date }> = ({ l, cores, agora }) => {
  const atrasada = deadlineStatus(l.prazo, agora) === 'atrasada';
  const data = 'data' in l ? l.data : null;
  return (
    <li className={`${styles.item} ${atrasada ? styles.atrasada : ''}`} style={{ borderLeftColor: cores.get(l.disciplina) }}>
      <Link to={atividadePath(l.id)} className={styles.itemLink}>{l.titulo}</Link>
      <Etiqueta nome={l.disciplina} cor={cores.get(l.disciplina) ?? 'currentColor'} />
      <span className={styles.muted}>
        {data && <>{horaPrazo(data)} · </>}
        {atrasada && <strong className={styles.tagAtrasada}> · Atrasada</strong>}
      </span>
    </li>
  );
};

const ListaDoDia: React.FC<{ itens: ListaNoCalendario[]; cores: Cores; agora: Date }> = ({ itens, cores, agora }) =>
  itens.length === 0 ? (
    <p className={styles.muted}>Nenhuma entrega com prazo neste dia.</p>
  ) : (
    <ul className={styles.items}>
      {itens.map((l) => <Item key={l.id} l={l} cores={cores} agora={agora} />)}
    </ul>
  );

const VisaoMes: React.FC<{
  ref0: Date; sel: Date; onSel: (d: Date) => void;
  porDia: Map<string, ListaNoCalendario[]>; cores: Cores; agora: Date;
}> = ({ ref0, sel, onSel, porDia, cores, agora }) => {
  const semanas = semanasDoMes(ref0);
  return (
    <>
      <div className={styles.mes} role="group" aria-label={`Dias de ${tituloMes(ref0)}`}>
        {DIAS_SEMANA.map((d) => <span key={d} className={styles.cabDia} aria-hidden="true">{d}</span>)}
        {semanas.flat().map((d) => {
          const itens = porDia.get(chaveDia(d)) ?? [];
          const fora = d.getMonth() !== ref0.getMonth();
          const ativo = mesmoDia(d, sel);
          return (
            <button
              key={chaveDia(d)}
              type="button"
              className={`${styles.celula} ${fora ? styles.fora : ''} ${ativo ? styles.sel : ''} ${mesmoDia(d, agora) ? styles.hoje : ''}`}
              aria-pressed={ativo}
              aria-label={`${rotuloDia(d)}, ${itens.length ? contarListas(itens.length) : 'sem entregas'}`}
              onClick={() => onSel(d)}
            >
              <span className={styles.num}>{d.getDate()}</span>
              <span className={styles.pontos} aria-hidden="true">
                {itens.slice(0, 4).map((l) => (
                  <span key={l.id} className={styles.ponto} style={{ background: cores.get(l.disciplina) }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <section aria-labelledby="dia-sel" className={styles.diaSel}>
        <h2 id="dia-sel" className={styles.h2}>{rotuloDia(sel)}</h2>
        <ListaDoDia itens={porDia.get(chaveDia(sel)) ?? []} cores={cores} agora={agora} />
      </section>
    </>
  );
};

const VisaoSemana: React.FC<{
  ref0: Date; porDia: Map<string, ListaNoCalendario[]>; cores: Cores; agora: Date;
}> = ({ ref0, porDia, cores, agora }) => (
  <ol className={styles.semana}>
    {diasDaSemana(ref0).map((d) => (
      <li key={chaveDia(d)} className={`${styles.dia} ${mesmoDia(d, agora) ? styles.hoje : ''}`}>
        <h2 className={styles.h2}>
          {rotuloDia(d)}{mesmoDia(d, agora) && <span className={styles.muted}> (hoje)</span>}
        </h2>
        <ListaDoDia itens={porDia.get(chaveDia(d)) ?? []} cores={cores} agora={agora} />
      </li>
    ))}
  </ol>
);

export const Calendario: React.FC<{ listas: EntregaCalendario[]; hoje?: Date }> = ({ listas, hoje }) => {
  const agora = useMemo(() => hoje ?? new Date(), [hoje]);
  const [visao, setVisao] = useState<Visao>('mes');
  const [ref0, setRef0] = useState<Date>(agora);
  const [sel, setSel] = useState<Date>(agora);

  const { porDia, semPrazo } = useMemo(() => agruparPorDia(listas), [listas]);
  const cores = useMemo(() => corPorDisciplina(listas), [listas]);

  const mover = (n: number) => {
    const novo = visao === 'mes' ? addMeses(ref0, n) : addDias(ref0, 7 * n);
    setRef0(novo);
    if (visao === 'mes') setSel(novo);
  };
  const irHoje = () => { setRef0(agora); setSel(agora); };
  const titulo = visao === 'mes' ? tituloMes(ref0) : tituloSemana(ref0);

  return (
    <>
      <div className={styles.barra}>
        <div className={styles.grupo} role="group" aria-label="Tipo de visão">
          <Button variant={visao === 'mes' ? 'primary' : 'secondary'} aria-pressed={visao === 'mes'} onClick={() => setVisao('mes')}>Mês</Button>
          <Button variant={visao === 'semana' ? 'primary' : 'secondary'} aria-pressed={visao === 'semana'} onClick={() => setVisao('semana')}>Semana</Button>
        </div>
        <div className={styles.grupo}>
          <Button variant="secondary" onClick={() => mover(-1)} aria-label={visao === 'mes' ? 'Mês anterior' : 'Semana anterior'}>‹</Button>
          <Button variant="secondary" onClick={irHoje}>Hoje</Button>
          <Button variant="secondary" onClick={() => mover(1)} aria-label={visao === 'mes' ? 'Próximo mês' : 'Próxima semana'}>›</Button>
        </div>
      </div>
      <p className={styles.periodo} role="status" aria-live="polite">{titulo}</p>

      {visao === 'mes'
        ? <VisaoMes ref0={ref0} sel={sel} onSel={setSel} porDia={porDia} cores={cores} agora={agora} />
        : <VisaoSemana ref0={ref0} porDia={porDia} cores={cores} agora={agora} />}

      {cores.size > 0 && <Legenda cores={cores} />}

      {semPrazo.length > 0 && (
        <section aria-labelledby="sem-prazo" className={styles.diaSel}>
          <h2 id="sem-prazo" className={styles.h2}>Sem prazo</h2>
          <ul className={styles.items}>
            {semPrazo.map((l) => <Item key={l.id} l={l} cores={cores} agora={agora} />)}
          </ul>
        </section>
      )}
    </>
  );
};

const paraCalendario = (entregas: StudentDashboard['proximasEntregas']): EntregaCalendario[] =>
  entregas.map((e) => ({
    id: e.eventoId,
    titulo: e.titulo,
    disciplina: e.disciplinaNome ?? 'Sem disciplina',
    prazo: e.prazo,
  }));

const CalendarioPage: React.FC = () => {
  const user = getCurrentUser();
  const estudanteId = (user?.userId as string) || localStorage.getItem('userId') || '';
  const { data, loading, error, retry } = useStudentResource(
    (signal) => studentDashboardService.get(estudanteId, signal),
    [estudanteId],
    !!estudanteId,
    'Não foi possível carregar seu calendário.'
  );

  return (
    <main className={styles.page} aria-labelledby="calendario-titulo" aria-busy={loading || undefined}>
      <h1 id="calendario-titulo" className={styles.title}>Calendário de prazos</h1>
      {loading && <p role="status" className={styles.muted}>Carregando seu calendário…</p>}
      {!loading && error && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={retry}>Tentar novamente</Button>
        </div>
      )}
      {!loading && !error && data && (data.proximasEntregas ?? []).length === 0 && (
        <EmptyState
          icon={<span aria-hidden="true">📅</span>}
          title="Nenhuma entrega pendente"
          description="Quando houver entregas com prazo, elas aparecem aqui."
          action={<Link className={styles.link} to="/inicio">Voltar ao início</Link>}
        />
      )}
      {!loading && !error && data && (data.proximasEntregas ?? []).length > 0 && <Calendario listas={paraCalendario(data.proximasEntregas)} />}
    </main>
  );
};

export default CalendarioPage;
