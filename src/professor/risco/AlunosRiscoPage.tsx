import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState } from '../../ui';
import { AvisarAlunosModal, ReforcoModal } from '../acoes/AcoesModais';
import { mensagemErro, professorService } from '../professorService';
import { MOTIVOS, NIVEIS, alternarSelecao, formatNota, textoUltimoAcesso } from '../professorLogic';
import type { AlunoRisco, PainelRisco } from '../types';
import styles from '../Professor.module.css';

const classeNivel = (n: AlunoRisco['nivel']) =>
  n === 'ALTO' ? styles.badgeDanger : n === 'MEDIO' ? styles.badgeWarn : styles.badgeOk;

export const perfilAlunoPath = (id: string) => `/alunos/${encodeURIComponent(id)}`;

/** FE-204 · Painel de alunos em risco, com critérios visíveis e ações em lote (avisar / reforço). */
const AlunosRiscoPage: React.FC = () => {
  const [disciplinaId, setDisciplinaId] = useState('');
  const [todos, setTodos] = useState(false);
  const [painel, setPainel] = useState<PainelRisco | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<'avisar' | 'reforco' | null>(null);

  useEffect(() => {
    const c = new AbortController();
    setCarregando(true);
    setErro(null);
    professorService.alunosEmRisco({ disciplinaId, todos }, c.signal)
      .then((p) => { if (!c.signal.aborted) { setPainel(p); setSel(new Set()); } })
      .catch((e) => { if (!c.signal.aborted) setErro(mensagemErro(e, 'Não foi possível carregar os alunos em risco.')); })
      .finally(() => { if (!c.signal.aborted) setCarregando(false); });
    return () => c.abort();
  }, [disciplinaId, todos, tentativa]);

  const itens = useMemo(() => painel?.items ?? [], [painel]);
  const escolhidos = useMemo(() => itens.filter((a) => sel.has(a.estudanteId)), [itens, sel]);
  const todosMarcados = itens.length > 0 && escolhidos.length === itens.length;

  // Reforço precisa de uma disciplina: a filtrada, ou a única que o professor tem.
  const disciplinaReforco = disciplinaId || (painel && painel.disciplinas.length === 1 ? painel.disciplinas[0].id : '');
  const nomeDisciplinaReforco = painel?.disciplinas.find((d) => d.id === disciplinaReforco)?.nome;

  return (
    <main className={styles.page} aria-labelledby="risco-titulo">
      <h1 id="risco-titulo" className={styles.title}>Alunos em risco</h1>
      <p className={styles.subtitle}>Quem precisa de atenção agora, com os critérios à vista. Selecione vários alunos para agir de uma vez.</p>

      {painel && (
        <section className={`${styles.cardAlt} ${styles.stack}`} aria-labelledby="risco-criterios" style={{ marginBottom: 16 }}>
          <h2 id="risco-criterios" className={styles.h2}>Critérios de risco</h2>
          <ul className={styles.summary}>
            <li>Média abaixo de <strong>{formatNota(painel.criterios.mediaMinima)}</strong> (0 a 10).</li>
            <li>Sem acessar o app há <strong>{painel.criterios.diasSemAcesso} dias</strong> ou mais (ou nunca acessou).</li>
            <li><strong>{painel.criterios.listasAtrasadas}</strong> ou mais lista(s) com prazo vencido e sem entrega.</li>
          </ul>
          <p className={styles.muted}>Com dois ou mais critérios o risco é alto; com um, médio.</p>
        </section>
      )}

      <div className={styles.row} style={{ marginBottom: 12 }}>
        <div className={styles.field} style={{ minWidth: 220 }}>
          <label htmlFor="risco-disc" className={styles.label}>Disciplina</label>
          <select id="risco-disc" className={styles.select} value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
            <option value="">Todas as disciplinas</option>
            {(painel?.disciplinas ?? []).map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </div>
        <label className={styles.check} style={{ alignSelf: 'flex-end' }}>
          <input type="checkbox" checked={todos} onChange={(e) => setTodos(e.target.checked)} />
          Mostrar também alunos sem risco
        </label>
      </div>

      {erro && (
        <div role="alert" className={styles.error}>
          <p>{erro}</p>
          <Button variant="secondary" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</Button>
        </div>
      )}
      {!erro && carregando && <p role="status" className={styles.muted}>Carregando alunos…</p>}

      {!erro && !carregando && painel && itens.length === 0 && (
        <EmptyState
          icon={<span aria-hidden="true">🎉</span>}
          title={todos ? 'Nenhum aluno encontrado' : 'Nenhum aluno em risco agora'}
          description={`Analisamos ${painel.totalAlunos} ${painel.totalAlunos === 1 ? 'aluno' : 'alunos'} com os critérios acima.`}
        />
      )}

      {!erro && !carregando && itens.length > 0 && (
        <div className={styles.tableWrap} tabIndex={0}>
          <table className={styles.table}>
            <caption className="sr-only">Alunos em risco, com média, último acesso e listas atrasadas</caption>
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox" checked={todosMarcados} aria-label="Selecionar todos os alunos"
                    onChange={() => setSel(todosMarcados ? new Set() : new Set(itens.map((a) => a.estudanteId)))}
                  />
                </th>
                <th scope="col">Aluno</th>
                <th scope="col">Média</th>
                <th scope="col">Último acesso</th>
                <th scope="col">Listas atrasadas</th>
                <th scope="col">Motivos</th>
                <th scope="col">Situação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((a) => (
                <tr key={a.estudanteId}>
                  <td>
                    <input
                      type="checkbox" checked={sel.has(a.estudanteId)} aria-label={`Selecionar ${a.nome}`}
                      onChange={() => setSel((s) => alternarSelecao(s, a.estudanteId))}
                    />
                  </td>
                  <td>
                    <Link to={perfilAlunoPath(a.estudanteId)} className={styles.link}>
                      {a.nome}<span className="sr-only">: abrir perfil</span>
                    </Link>
                    <div className={styles.muted}>{a.email}</div>
                  </td>
                  <td>{formatNota(a.media)}</td>
                  <td>{textoUltimoAcesso(a)}</td>
                  <td>{a.listasAtrasadas}{a.listasPendentes > a.listasAtrasadas && <span className={styles.muted}> ({a.listasPendentes} pendentes)</span>}</td>
                  <td>
                    <div className={styles.tagList}>
                      {a.motivos.length === 0 ? '—' : a.motivos.map((m) => <span key={m} className={styles.tag}>{MOTIVOS[m]}</span>)}
                    </div>
                  </td>
                  <td><span className={`${styles.badge} ${classeNivel(a.nivel)}`}>{NIVEIS[a.nivel]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {escolhidos.length > 0 && (
        <div className={styles.selectionBar} role="region" aria-label="Ações em lote">
          <span role="status">{escolhidos.length} {escolhidos.length === 1 ? 'aluno selecionado' : 'alunos selecionados'}</span>
          <div className={styles.row}>
            <Button variant="ghost" onClick={() => setSel(new Set())}>Limpar seleção</Button>
            <Button variant="secondary" onClick={() => setModal('avisar')}>Avisar</Button>
            <Button onClick={() => setModal('reforco')} disabled={!disciplinaReforco}
              title={!disciplinaReforco ? 'Escolha uma disciplina no filtro para atribuir a lista' : undefined}>
              Atribuir lista de reforço
            </Button>
          </div>
          {!disciplinaReforco && <p className={styles.hint} style={{ width: '100%' }}>Para atribuir um reforço, escolha uma disciplina no filtro acima.</p>}
        </div>
      )}

      <AvisarAlunosModal
        open={modal === 'avisar'} alunos={escolhidos.map((a) => ({ id: a.estudanteId, nome: a.nome }))}
        onClose={() => setModal(null)} onDone={() => setSel(new Set())}
      />
      {disciplinaReforco && (
        <ReforcoModal
          open={modal === 'reforco'} disciplinaId={disciplinaReforco} disciplinaNome={nomeDisciplinaReforco}
          alunos={escolhidos.map((a) => ({ id: a.estudanteId, nome: a.nome }))}
          onClose={() => setModal(null)} onDone={() => setSel(new Set())}
        />
      )}
    </main>
  );
};

export default AlunosRiscoPage;
