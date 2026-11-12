import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, ChartWrapper, DataTable, EmptyState, useToast } from '../../ui';
import type { Column } from '../../ui';
import { mensagemErro } from '../../professor/professorService';
import { formatarKpi, presetPeriodo, seriesComparativo } from './gestaoLogic';
import { gestaoService } from './gestaoService';
import type { Comparar, LinhaDetalhe } from './gestaoService';
import { useCarga } from './useCarga';
import styles from '../../professor/Professor.module.css';

const ROTULO: Record<Comparar, string> = { TURMA: 'Turmas', DISCIPLINA: 'Disciplinas', PROFESSOR: 'Professores' };
// Mesmos valores de --chart-1/2/3 (atributos SVG não resolvem var()).
const CORES = { media: '#2563eb', noPrazo: '#00b3a4', ativos: '#a16207' };

const colunas: Column<LinhaDetalhe>[] = [
  { key: 'nome', header: 'Nome', sortable: true },
  { key: 'alunos', header: 'Alunos', align: 'right', sortable: true },
  { key: 'alunosAtivos', header: 'Alunos ativos', align: 'right', sortable: true },
  { key: 'mediaGeral', header: 'Média geral', align: 'right', sortable: true, accessor: (r) => r.mediaGeral, render: (r) => formatarKpi({ chave: 'MEDIA_GERAL', valor: r.mediaGeral }) },
  { key: 'entregas', header: 'Entregas', align: 'right', sortable: true },
  { key: 'pctNoPrazo', header: 'Entregas no prazo', align: 'right', sortable: true, accessor: (r) => r.pctNoPrazo, render: (r) => formatarKpi({ chave: 'ENTREGAS_NO_PRAZO', valor: r.pctNoPrazo }) },
];

/** FE-305 · Comparar turmas, disciplinas ou professores: barras agrupadas, tabela com os mesmos dados e exportação. */
const ComparativosView: React.FC = () => {
  const toast = useToast();
  const [por, setPor] = useState<Comparar>('DISCIPLINA');
  const inicial = presetPeriodo(90);
  const [periodo, setPeriodo] = useState(inicial);
  const [aplicado, setAplicado] = useState(inicial);
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set());
  const [exportando, setExportando] = useState<string | null>(null);

  const dados = useCarga((s) => gestaoService.comparativo({ por, ...aplicado }, s), [por, aplicado.inicio, aplicado.fim],
    'Não foi possível carregar o comparativo.');
  useEffect(() => { setExcluidos(new Set()); }, [por, aplicado]);

  const linhas = useMemo(() => (dados.dados?.linhas ?? []).filter((l) => !excluidos.has(l.id)), [dados.dados, excluidos]);
  const barras = useMemo(() => linhas.map(seriesComparativo), [linhas]);
  const invalido = periodo.inicio > periodo.fim;

  const alternar = (id: string) => setExcluidos((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const exportar = async (formato: 'csv' | 'pdf') => {
    setExportando(formato);
    try {
      await gestaoService.exportarComparativo({ por, ...aplicado, ids: linhas.map((l) => l.id) }, formato);
      toast.show({ variant: 'success', message: `Arquivo ${formato.toUpperCase()} gerado.` });
    } catch (e: any) {
      toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível exportar.') });
    } finally { setExportando(null); }
  };

  const resumo = barras.length === 0 ? 'Sem dados para comparar.'
    : `Comparando ${barras.length} ${ROTULO[por].toLowerCase()}. ` + barras.map((b) => `${b.nome}: média ${b.media / 10}, no prazo ${b.noPrazo}%, ativos ${b.ativos}%`).join('; ') + '.';

  return (
    <section className={styles.stack} aria-labelledby="comp-titulo">
      <h2 id="comp-titulo" className={styles.h2}>Relatórios comparativos</h2>

      <form className={`${styles.card} ${styles.row}`} style={{ alignItems: 'flex-end' }} onSubmit={(e) => { e.preventDefault(); if (!invalido) setAplicado(periodo); }}>
        <div className={styles.field}>
          <label htmlFor="comp-por" className={styles.label}>Comparar</label>
          <select id="comp-por" className={styles.select} value={por} onChange={(e) => setPor(e.target.value as Comparar)}>
            <option value="DISCIPLINA">Disciplinas</option>
            <option value="TURMA">Turmas</option>
            <option value="PROFESSOR">Professores</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="comp-ini" className={styles.label}>De</label>
          <input id="comp-ini" type="date" className={styles.input} value={periodo.inicio} onChange={(e) => setPeriodo((p) => ({ ...p, inicio: e.target.value }))} />
        </div>
        <div className={styles.field}>
          <label htmlFor="comp-fim" className={styles.label}>Até</label>
          <input id="comp-fim" type="date" className={styles.input} value={periodo.fim} onChange={(e) => setPeriodo((p) => ({ ...p, fim: e.target.value }))} />
        </div>
        <Button type="submit" disabled={invalido}>Aplicar</Button>
        {invalido && <p role="alert" className={styles.errorText}>O início precisa ser antes do fim.</p>}
      </form>

      {dados.erro && (
        <div role="alert" className={styles.error}><p>{dados.erro}</p><Button variant="secondary" onClick={dados.recarregar}>Tentar novamente</Button></div>
      )}
      {dados.carregando && !dados.dados && <p role="status" className={styles.muted}>Carregando comparativo…</p>}

      {dados.dados && dados.dados.linhas.length === 0 && (
        <EmptyState compact icon={<span aria-hidden="true">📊</span>} title={`Nenhuma ${ROTULO[por].toLowerCase().slice(0, -1)} para comparar`} description="Cadastre turmas, disciplinas ou professores para ver o comparativo." />
      )}

      {dados.dados && dados.dados.linhas.length > 0 && (
        <>
          <fieldset className={styles.card} style={{ margin: 0 }}>
            <legend className={styles.label}>O que entra na comparação</legend>
            <div className={styles.row}>
              {dados.dados.linhas.map((l) => (
                <label key={l.id} className={styles.check} style={{ minWidth: 180 }}>
                  <input type="checkbox" checked={!excluidos.has(l.id)} onChange={() => alternar(l.id)} /> {l.nome}
                </label>
              ))}
            </div>
          </fieldset>

          <ChartWrapper
            title={`${ROTULO[por]}: média, entregas no prazo e alunos ativos`}
            description={resumo}
            height={Math.max(280, 90 + barras.length * 10)}
            empty={barras.length === 0}
            emptyMessage="Marque ao menos um item para comparar."
          >
            <BarChart data={barras} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={70} />
              <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}`} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="media" name="Média (nota × 10)" fill={CORES.media} isAnimationActive={false} />
              <Bar dataKey="noPrazo" name="Entregas no prazo (%)" fill={CORES.noPrazo} isAnimationActive={false} />
              <Bar dataKey="ativos" name="Alunos ativos (%)" fill={CORES.ativos} isAnimationActive={false} />
            </BarChart>
          </ChartWrapper>
          <p className={styles.hint}>Todas as séries estão numa escala de 0 a 100: a média é a nota de 0 a 10 multiplicada por 10.</p>

          <DataTable caption={`Comparativo de ${ROTULO[por].toLowerCase()} no período`} columns={colunas} rows={linhas} rowKey={(r) => r.id} />

          <div className={styles.row}>
            <Button variant="secondary" loading={exportando === 'csv'} onClick={() => void exportar('csv')} disabled={linhas.length === 0}>Exportar CSV</Button>
            <Button variant="secondary" loading={exportando === 'pdf'} onClick={() => void exportar('pdf')} disabled={linhas.length === 0}>Exportar PDF</Button>
          </div>
        </>
      )}
    </section>
  );
};

export default ComparativosView;
