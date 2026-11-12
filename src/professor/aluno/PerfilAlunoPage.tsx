import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, DataTable, EmptyState, KpiCard } from '../../ui';
import type { Column } from '../../ui';
import { EvolucaoConteudo } from '../../estudante/evolucao/EvolucaoPage';
import { AvisarAlunosModal } from '../acoes/AcoesModais';
import { mensagemErro, professorService } from '../professorService';
import { STATUS_ENTREGA, formatData, formatDataHora, formatNota } from '../professorLogic';
import type { HistoricoLista, PerfilAluno } from '../types';
import styles from '../Professor.module.css';

const classeStatus = (s: HistoricoLista['status']) =>
  s === 'ENTREGUE' ? styles.badgeOk : s === 'ATRASADA' ? styles.badgeDanger : styles.badgeWarn;

const colunas: Column<HistoricoLista>[] = [
  { key: 'titulo', header: 'Lista', sortable: true },
  { key: 'disciplinaNome', header: 'Disciplina', accessor: (r) => r.disciplinaNome ?? '—' },
  { key: 'prazo', header: 'Prazo', sortable: true, accessor: (r) => r.prazo ?? '', render: (r) => formatData(r.prazo) },
  { key: 'status', header: 'Situação', render: (r) => <span className={`${styles.badge} ${classeStatus(r.status)}`}>{STATUS_ENTREGA[r.status]}</span> },
  { key: 'nota', header: 'Nota', align: 'right', sortable: true, accessor: (r) => r.nota, render: (r) => formatNota(r.nota) },
  { key: 'tentativas', header: 'Tentativas', align: 'right', accessor: (r) => r.tentativas },
];

/** FE-207 · Perfil do aluno: dados, histórico de entregas, desempenho por assunto e últimos acessos. */
const PerfilAlunoPage: React.FC = () => {
  const { estudanteId = '' } = useParams();
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const [avisando, setAvisando] = useState(false);

  useEffect(() => {
    const c = new AbortController();
    setCarregando(true);
    setErro(null);
    professorService.perfilAluno(estudanteId, c.signal)
      .then((p) => { if (!c.signal.aborted) setPerfil(p); })
      .catch((e) => {
        if (c.signal.aborted) return;
        const status = e?.response?.status;
        setErro(status === 403 ? 'Este aluno não está em nenhuma das suas disciplinas.'
          : status === 404 ? 'Aluno não encontrado.'
          : mensagemErro(e, 'Não foi possível carregar o perfil do aluno.'));
      })
      .finally(() => { if (!c.signal.aborted) setCarregando(false); });
    return () => c.abort();
  }, [estudanteId, tentativa]);

  return (
    <main className={styles.page} aria-labelledby="perfil-titulo" aria-busy={carregando || undefined}>
      <p><Link to="/alunos-em-risco" className={styles.link}>← Voltar para alunos em risco</Link></p>

      {carregando && <p role="status" className={styles.muted}>Carregando perfil…</p>}

      {!carregando && erro && (
        <div role="alert" className={styles.error}>
          <p>{erro}</p>
          <Button variant="secondary" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</Button>
        </div>
      )}

      {!carregando && !erro && perfil && (
        <div className={styles.stack}>
          <div className={styles.rowBetween}>
            <div>
              <h1 id="perfil-titulo" className={styles.title}>{perfil.nome}</h1>
              <p className={styles.muted}>{perfil.email}{perfil.instituicao ? ` · ${perfil.instituicao}` : ''}</p>
            </div>
            <Button onClick={() => setAvisando(true)}>Avisar aluno</Button>
          </div>

          <section aria-labelledby="perfil-disc" className={styles.card}>
            <h2 id="perfil-disc" className={styles.h2}>Disciplinas</h2>
            {perfil.disciplinas.length === 0
              ? <p className={styles.muted}>Nenhuma disciplina sua com este aluno.</p>
              : <div className={styles.tagList}>{perfil.disciplinas.map((d) => <span key={d.id} className={styles.tag}>{d.nome}</span>)}</div>}
          </section>

          <section aria-label="Resumo" className={styles.grid2} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <KpiCard label="Média das listas entregues" value={formatNota(perfil.resumo.media)} />
            <KpiCard label="Entregues" value={String(perfil.resumo.entregues)} />
            <KpiCard label="Atrasadas" value={String(perfil.resumo.atrasadas)} />
            <KpiCard label="Não feitas" value={String(perfil.resumo.naoFeitas)} />
          </section>

          <section aria-labelledby="perfil-hist" className={styles.card}>
            <h2 id="perfil-hist" className={styles.h2}>Histórico de listas</h2>
            <p className={styles.muted} style={{ marginBottom: 8 }}>
              "Atrasada" = prazo vencido sem entrega. "Não feita" = ainda não entregue, mas dentro do prazo (ou sem prazo).
            </p>
            <DataTable
              caption="Listas do aluno, com prazo, situação e nota"
              columns={colunas} rows={perfil.historico} rowKey={(r) => r.listaId}
              emptyTitle="Nenhuma lista atribuída" emptyDescription="Quando uma lista for publicada para este aluno, ela aparece aqui."
            />
          </section>

          <section aria-labelledby="perfil-desemp">
            <h2 id="perfil-desemp" className={styles.h2}>Desempenho</h2>
            <EvolucaoConteudo
              data={perfil.evolucao}
              semLinks
              vazio={<EmptyState title="Ainda sem desempenho" description="Os gráficos aparecem depois que o aluno entregar a primeira lista." compact />}
            />
          </section>

          <section aria-labelledby="perfil-acessos" className={styles.card}>
            <h2 id="perfil-acessos" className={styles.h2}>Últimos acessos ao app</h2>
            {perfil.acessos.length === 0
              ? <p className={styles.muted}>Nenhum acesso registrado ainda.</p>
              : <ul className={styles.summary}>{perfil.acessos.map((a) => <li key={a}>{formatDataHora(a)}</li>)}</ul>}
          </section>
        </div>
      )}

      {perfil && (
        <AvisarAlunosModal open={avisando} alunos={[{ id: perfil.id, nome: perfil.nome }]} onClose={() => setAvisando(false)} />
      )}
    </main>
  );
};

export default PerfilAlunoPage;
