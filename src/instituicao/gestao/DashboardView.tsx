import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, DataTable, EmptyState, KpiCard } from '../../ui';
import type { Column } from '../../ui';
import { detalheKpiPath, formatarKpi, presetPeriodo, textoVariacao } from './gestaoLogic';
import { gestaoService } from './gestaoService';
import type { LinhaDetalhe } from './gestaoService';
import { useCarga } from './useCarga';
import styles from '../../professor/Professor.module.css';

const fmtData = (iso: string) => iso.split('-').reverse().join('/');

/** Filtros (período e disciplina) guardados na URL, para o link do KPI levar o mesmo recorte ao detalhe. */
function useFiltros() {
  const [params, setParams] = useSearchParams();
  const padrao = presetPeriodo(30);
  const filtros = {
    inicio: params.get('inicio') || padrao.inicio,
    fim: params.get('fim') || padrao.fim,
    disciplinaId: params.get('disciplinaId') || '',
  };
  const mudar = (novo: Partial<typeof filtros>) => {
    const n = new URLSearchParams(params);
    Object.entries({ ...filtros, ...novo }).forEach(([k, v]) => { if (v) n.set(k, v); else n.delete(k); });
    setParams(n, { replace: true });
  };
  return { filtros, mudar };
}

/** FE-303 · Dashboard executivo: KPIs com variação, filtros e link para o relatório detalhado. */
export const DashboardView: React.FC = () => {
  const { filtros, mudar } = useFiltros();
  const [rascunho, setRascunho] = useState({ inicio: filtros.inicio, fim: filtros.fim });
  const dash = useCarga((s) => gestaoService.dashboard(filtros, s), [filtros.inicio, filtros.fim, filtros.disciplinaId],
    'Não foi possível carregar o dashboard.');

  const aplicar = (e: React.FormEvent) => { e.preventDefault(); mudar(rascunho); };
  const preset = (dias: number) => { const p = presetPeriodo(dias); setRascunho(p); mudar(p); };
  const invalido = rascunho.inicio > rascunho.fim;

  return (
    <section className={styles.stack} aria-labelledby="dash-titulo">
      <h2 id="dash-titulo" className={styles.h2}>Dashboard executivo</h2>

      <form className={`${styles.card} ${styles.stack}`} onSubmit={aplicar} aria-label="Filtros do dashboard">
        <div className={styles.row} style={{ alignItems: 'flex-end' }}>
          <div className={styles.field}>
            <label htmlFor="dash-ini" className={styles.label}>De</label>
            <input id="dash-ini" type="date" className={styles.input} value={rascunho.inicio} onChange={(e) => setRascunho((r) => ({ ...r, inicio: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label htmlFor="dash-fim" className={styles.label}>Até</label>
            <input id="dash-fim" type="date" className={styles.input} value={rascunho.fim} onChange={(e) => setRascunho((r) => ({ ...r, fim: e.target.value }))} />
          </div>
          <div className={styles.field} style={{ minWidth: 220 }}>
            <label htmlFor="dash-disc" className={styles.label}>Disciplina</label>
            <select id="dash-disc" className={styles.select} value={filtros.disciplinaId} onChange={(e) => mudar({ disciplinaId: e.target.value })}>
              <option value="">Todas as disciplinas</option>
              {(dash.dados?.disciplinas ?? []).map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
          <Button type="submit" disabled={invalido}>Aplicar período</Button>
        </div>
        <div className={styles.row}>
          <span className={styles.muted}>Atalhos:</span>
          <Button variant="ghost" onClick={() => preset(30)}>Últimos 30 dias</Button>
          <Button variant="ghost" onClick={() => preset(90)}>Últimos 90 dias</Button>
          <Button variant="ghost" onClick={() => preset(365)}>Último ano</Button>
        </div>
        {invalido && <p role="alert" className={styles.errorText}>O início precisa ser antes do fim.</p>}
      </form>

      {dash.erro && (
        <div role="alert" className={styles.error}><p>{dash.erro}</p><Button variant="secondary" onClick={dash.recarregar}>Tentar novamente</Button></div>
      )}
      {dash.carregando && !dash.dados && <p role="status" className={styles.muted}>Carregando indicadores…</p>}

      {dash.dados && (
        <>
          <p className={styles.muted} role="status" aria-live="polite">
            Período: {fmtData(dash.dados.periodo.inicio)} a {fmtData(dash.dados.periodo.fim)} · comparado com {fmtData(dash.dados.periodo.inicioAnterior)} a {fmtData(dash.dados.periodo.fimAnterior)}
          </p>
          <ul className={styles.grid2} style={{ listStyle: 'none', padding: 0, margin: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {dash.dados.kpis.map((k) => (
              <li key={k.chave}>
                <Link to={detalheKpiPath(k.chave, filtros)} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  aria-label={`${k.titulo}: ${formatarKpi(k)}. ${textoVariacao(k.variacaoPct)}. Abrir relatório detalhado`}>
                  <KpiCard label={k.titulo} value={formatarKpi(k)} delta={k.variacaoPct ?? undefined} deltaLabel="vs. período anterior" />
                  <p className={styles.muted} style={{ margin: '4px 4px 0' }}>{textoVariacao(k.variacaoPct)}</p>
                  <p className={styles.link} style={{ margin: '4px 4px 0' }}>Ver detalhes →</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

const colunas: Column<LinhaDetalhe>[] = [
  { key: 'nome', header: 'Disciplina', sortable: true },
  { key: 'professor', header: 'Professor', accessor: (r) => r.professor ?? '—' },
  { key: 'alunos', header: 'Alunos', align: 'right', sortable: true },
  { key: 'alunosAtivos', header: 'Alunos ativos', align: 'right', sortable: true },
  { key: 'mediaGeral', header: 'Média geral', align: 'right', sortable: true, accessor: (r) => r.mediaGeral, render: (r) => formatarKpi({ chave: 'MEDIA_GERAL', valor: r.mediaGeral }) },
  { key: 'entregas', header: 'Entregas', align: 'right', sortable: true },
  { key: 'pctNoPrazo', header: 'No prazo', align: 'right', sortable: true, accessor: (r) => r.pctNoPrazo, render: (r) => formatarKpi({ chave: 'ENTREGAS_NO_PRAZO', valor: r.pctNoPrazo }) },
];

/** Relatório detalhado de um KPI (uma linha por disciplina), no mesmo período e filtro do dashboard. */
export const DetalheKpiView: React.FC<{ kpi: string }> = ({ kpi }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const f = { inicio: params.get('inicio') || undefined, fim: params.get('fim') || undefined, disciplinaId: params.get('disciplinaId') || undefined };
  const det = useCarga((s) => gestaoService.detalheKpi(kpi, f, s), [kpi, f.inicio, f.fim, f.disciplinaId], 'Não foi possível carregar o relatório.');
  const voltar = `/instituicao/dashboard${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <section className={styles.stack} aria-labelledby="det-titulo">
      <p><Link to={voltar} className={styles.link}>← Voltar ao dashboard</Link></p>
      {det.erro && (
        <div role="alert" className={styles.error}>
          <p>{det.erro}</p>
          <div className={styles.row}><Button variant="secondary" onClick={det.recarregar}>Tentar novamente</Button><Button variant="ghost" onClick={() => navigate(voltar)}>Voltar</Button></div>
        </div>
      )}
      {det.carregando && !det.dados && <p role="status" className={styles.muted}>Carregando relatório…</p>}
      {det.dados && (
        <>
          <h2 id="det-titulo" className={styles.h2}>{det.dados.titulo}</h2>
          <p className={styles.muted}>Período: {fmtData(det.dados.periodo.inicio)} a {fmtData(det.dados.periodo.fim)}</p>
          <DataTable
            caption={`${det.dados.titulo}, ordenado pelo indicador`} columns={colunas} rows={det.dados.linhas} rowKey={(r) => r.id}
            emptyTitle="Sem dados no período" emptyDescription="Nenhuma disciplina tem atividade neste período."
          />
        </>
      )}
      {!det.carregando && !det.erro && !det.dados && <EmptyState title="Sem dados" />}
    </section>
  );
};

export default DashboardView;
