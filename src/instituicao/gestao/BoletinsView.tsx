import React, { useEffect, useState } from 'react';
import { Button, EmptyState, useToast } from '../../ui';
import { mensagemErro } from '../../professor/professorService';
import { gestaoService } from './gestaoService';
import { useCarga } from './useCarga';
import styles from '../../professor/Professor.module.css';

/** FE-308 · Boletim por aluno e em lote por turma (PDF com o logo da instituição) e relatório de risco e evasão. */
const BoletinsView: React.FC = () => {
  const toast = useToast();
  const periodos = useCarga((s) => gestaoService.periodos(s), [], 'Não foi possível carregar os períodos.');
  const [periodoId, setPeriodoId] = useState('');
  const turmas = useCarga((s) => gestaoService.turmas(periodoId || undefined, s), [periodoId], 'Não foi possível carregar as turmas.');
  const [turmaId, setTurmaId] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [gerando, setGerando] = useState<string | null>(null);

  useEffect(() => { setTurmaId(''); setAlunoId(''); }, [periodoId]);
  useEffect(() => { setAlunoId(''); }, [turmaId]);

  const turma = turmas.dados?.find((t) => t.id === turmaId) ?? null;

  const gerar = async (chave: string, fn: () => Promise<void>, ok: string) => {
    setGerando(chave);
    try {
      await fn();
      toast.show({ variant: 'success', message: ok });
    } catch (e: any) {
      toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível gerar o documento.') });
    } finally { setGerando(null); }
  };

  return (
    <section className={styles.stack} aria-labelledby="bol-titulo">
      <h2 id="bol-titulo" className={styles.h2}>Boletins e relatórios externos</h2>
      <p className={styles.muted}>Documentos em PDF, prontos para imprimir, com o logo da instituição no cabeçalho. A média considera as listas entregues dentro do período.</p>

      <div className={`${styles.card} ${styles.grid2}`}>
        <div className={styles.field}>
          <label htmlFor="bol-per" className={styles.label}>Período</label>
          <select id="bol-per" className={styles.select} value={periodoId} onChange={(e) => setPeriodoId(e.target.value)}>
            <option value="">Todos os períodos</option>
            {(periodos.dados ?? []).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="bol-turma" className={styles.label}>Turma</label>
          <select id="bol-turma" className={styles.select} value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
            <option value="">Escolha a turma…</option>
            {(turmas.dados ?? []).map((t) => <option key={t.id} value={t.id}>{t.nome} ({t.periodoNome})</option>)}
          </select>
        </div>
      </div>

      {(periodos.erro || turmas.erro) && <div role="alert" className={styles.error}><p>{periodos.erro ?? turmas.erro}</p></div>}
      {turmas.dados && turmas.dados.length === 0 && (
        <EmptyState compact title="Nenhuma turma encontrada" description="Crie turmas em “Períodos e turmas” para emitir boletins." />
      )}

      {turma && (
        <div className={`${styles.card} ${styles.stack}`}>
          <h3 className={styles.h2}>{turma.nome} · {turma.periodoNome}</h3>
          <p className={styles.muted}>{turma.alunos.length} {turma.alunos.length === 1 ? 'aluno' : 'alunos'} · {turma.disciplinas.length} {turma.disciplinas.length === 1 ? 'disciplina' : 'disciplinas'}</p>

          <div className={styles.row}>
            <Button loading={gerando === 'lote'} disabled={turma.alunos.length === 0}
              onClick={() => void gerar('lote', () => gestaoService.boletimTurma(turma.id), `Boletins de ${turma.nome} gerados (uma página por aluno).`)}>
              Gerar boletins da turma inteira (PDF)
            </Button>
            <Button variant="secondary" loading={gerando === 'risco-pdf'}
              onClick={() => void gerar('risco-pdf', () => gestaoService.riscoEvasao(turma.id, 'pdf'), 'Relatório de risco e evasão gerado.')}>
              Risco e evasão (PDF)
            </Button>
            <Button variant="secondary" loading={gerando === 'risco-csv'}
              onClick={() => void gerar('risco-csv', () => gestaoService.riscoEvasao(turma.id, 'csv'), 'Relatório de risco e evasão gerado.')}>
              Risco e evasão (CSV)
            </Button>
          </div>

          <div className={styles.row} style={{ alignItems: 'flex-end' }}>
            <div className={styles.field} style={{ minWidth: 260 }}>
              <label htmlFor="bol-aluno" className={styles.label}>Boletim de um aluno</label>
              <select id="bol-aluno" className={styles.select} value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
                <option value="">Escolha o aluno…</option>
                {turma.alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </div>
            <Button variant="secondary" disabled={!alunoId} loading={gerando === 'aluno'}
              onClick={() => void gerar('aluno', () => gestaoService.boletimAluno(alunoId, turma.periodoId), 'Boletim gerado.')}>
              Gerar boletim (PDF)
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BoletinsView;
