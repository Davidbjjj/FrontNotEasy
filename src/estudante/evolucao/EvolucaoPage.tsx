import React, { useId, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Tooltip, XAxis, YAxis,
} from 'recharts';
import { getCurrentUser } from '../../auth/auth';
import { Button, ChartWrapper, DataTable, EmptyState } from '../../ui';
import type { Column } from '../../ui';
import { evolucaoService } from './evolucaoService';
import { useStudentResource } from './useStudentResource';
import {
  erradasPath, filtrarNotas, formatData, formatNotaEscala, notaNormalizada,
  ordenarAssuntos, percentual, resumoAssuntos, resumoNotas,
} from './evolucaoLogic';
import { planoPath } from '../plano/planoLogic';
import type { DesempenhoAssunto, Evolucao, NotaPonto } from './types';
import styles from './Evolucao.module.css';

// Mesmos valores dos tokens --chart-1 / --color-* (atributos SVG não resolvem var()).
const COR_LINHA = '#2563eb';
const COR_FRACO = '#b91c1c';
const COR_MEDIO = '#a16207';
const COR_FORTE = '#15803d';
const corAssunto = (pct: number) => (pct < 50 ? COR_FRACO : pct < 70 ? COR_MEDIO : COR_FORTE);
const nivel = (pct: number) => (pct < 50 ? 'Precisa melhorar' : pct < 70 ? 'Regular' : 'Bom');

const notaColumns = (nomeDisciplina: (id: string) => string): Column<NotaPonto>[] => [
  { key: 'data', header: 'Data', accessor: (r) => formatData(r.data) },
  { key: 'titulo', header: 'Lista' },
  { key: 'disciplina', header: 'Disciplina', accessor: (r) => nomeDisciplina(r.disciplinaId) },
  { key: 'nota', header: 'Nota (0–10)', align: 'right', accessor: (r) => formatNotaEscala(notaNormalizada(r)) },
];

const assuntoColumns: Column<DesempenhoAssunto>[] = [
  {
    key: 'nome', header: 'Assunto',
    render: (r) => (
      <Link to={erradasPath(r.id)} className={styles.link}>
        {r.nome}<span className="sr-only">: ver questões erradas</span>
      </Link>
    ),
  },
  { key: 'pct', header: 'Acertos', align: 'right', accessor: (r) => `${percentual(r)}% (${r.acertos} de ${r.total})` },
  { key: 'nivel', header: 'Situação', accessor: (r) => nivel(percentual(r)) },
];

const Conteudo: React.FC<{ data: Evolucao }> = ({ data }) => {
  const navigate = useNavigate();
  const filtroId = useId();
  const [disciplinaId, setDisciplinaId] = useState('');

  const nomeDisciplina = (id: string) => data.disciplinas.find((d) => d.id === id)?.nome ?? '—';
  const notas = useMemo(() => filtrarNotas(data.notas, disciplinaId), [data.notas, disciplinaId]);
  const assuntos = useMemo(() => ordenarAssuntos(data.assuntos, disciplinaId), [data.assuntos, disciplinaId]);
  const pontos = useMemo(
    () => notas.map((n) => ({ rotulo: formatData(n.data), titulo: n.titulo, nota: notaNormalizada(n) })),
    [notas]
  );
  const barras = useMemo(
    () => assuntos.map((a) => ({ id: a.id, nome: a.nome, pct: percentual(a), acertos: a.acertos, total: a.total })),
    [assuntos]
  );

  if (data.notas.length === 0 && data.assuntos.length === 0) {
    return (
      <EmptyState
        icon={<span aria-hidden="true">📈</span>}
        title="Sua evolução aparece aqui"
        description="Assim que você finalizar e receber a nota de uma lista, mostramos como sua nota evolui e em quais assuntos você pode melhorar."
        action={<Link className={styles.link} to="/inicio">Ver o que fazer agora</Link>}
      />
    );
  }

  return (
    <>
      <div className={styles.filter}>
        <label htmlFor={filtroId}>Disciplina</label>
        <select id={filtroId} value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
          <option value="">Todas as disciplinas</option>
          {data.disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      </div>

      <section className={styles.section} aria-labelledby="evolucao-nota">
        <h2 id="evolucao-nota" className={styles.sectionTitle}>Nota ao longo do tempo</h2>
        <ChartWrapper
          title="Sua nota em cada lista (0 a 10)"
          description={resumoNotas(notas)}
          empty={pontos.length === 0}
          emptyMessage="Você ainda não tem notas nesta disciplina."
        >
          <LineChart data={pontos} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="rotulo" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => [formatNotaEscala(Number(v)), 'Nota']} labelFormatter={(_l: any, p: any) => p?.[0]?.payload?.titulo ?? ''} />
            <Line type="monotone" dataKey="nota" stroke={COR_LINHA} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
          </LineChart>
        </ChartWrapper>
        {pontos.length > 0 && (
          <details className={styles.details}>
            <summary>Ver como tabela</summary>
            <div>
              <DataTable
                caption="Notas por lista, da mais antiga para a mais recente"
                columns={notaColumns(nomeDisciplina)}
                rows={notas}
                rowKey={(r) => r.listaId}
              />
            </div>
          </details>
        )}
      </section>

      <section className={styles.section} aria-labelledby="evolucao-assunto">
        <h2 id="evolucao-assunto" className={styles.sectionTitle}>Desempenho por assunto</h2>
        <p className={styles.muted}>Do mais fraco ao mais forte. Clique em um assunto para ver as questões que você errou.</p>
        <ChartWrapper
          title="Percentual de acertos por assunto"
          description={resumoAssuntos(assuntos)}
          height={Math.max(160, barras.length * 44 + 40)}
          empty={barras.length === 0}
          emptyMessage="Ainda não há questões respondidas nesta disciplina."
        >
          <BarChart data={barras} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="nome" width={110} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any, _n: any, item: any) => [`${v}% (${item.payload.acertos} de ${item.payload.total})`, 'Acertos']} />
            <Bar
              dataKey="pct"
              isAnimationActive={false}
              cursor="pointer"
              label={{ position: 'right', fontSize: 12, formatter: (v: any) => `${v}%` }}
              onClick={(d: any) => d?.id && navigate(erradasPath(d.id))}
            >
              {barras.map((b) => <Cell key={b.id} fill={corAssunto(b.pct)} />)}
            </Bar>
          </BarChart>
        </ChartWrapper>
        {barras.length > 0 && (
          <details className={styles.details}>
            <summary>Ver como tabela</summary>
            <div>
              <DataTable
                caption="Desempenho por assunto, do mais fraco ao mais forte"
                columns={assuntoColumns}
                rows={assuntos}
                rowKey={(r) => r.id}
              />
            </div>
          </details>
        )}
      </section>
    </>
  );
};

const EvolucaoPage: React.FC = () => {
  const user = getCurrentUser();
  const estudanteId = (user?.userId as string) || localStorage.getItem('userId') || '';
  const { data, loading, error, retry } = useStudentResource(
    (signal) => evolucaoService.get(estudanteId, signal),
    [estudanteId],
    !!estudanteId,
    'Não foi possível carregar sua evolução.'
  );

  return (
    <main className={styles.page} aria-labelledby="evolucao-titulo" aria-busy={loading || undefined}>
      <h1 id="evolucao-titulo" className={styles.title}>Evolução e desempenho</h1>
      <p className={styles.muted}>Veja como sua nota evolui e em quais assuntos você mais precisa estudar.{' '}
        <Link to={planoPath} className={styles.link}>Ver plano de revisão</Link>
      </p>

      {loading && <p role="status" className={styles.muted}>Carregando sua evolução…</p>}

      {!loading && error && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={retry}>Tentar novamente</Button>
        </div>
      )}

      {!loading && !error && data && <Conteudo data={data} />}
    </main>
  );
};

export default EvolucaoPage;
