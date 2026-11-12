import React, { useEffect, useMemo, useState } from 'react';
import { Button, EmptyState, Modal, useToast } from '../../ui';
import { formatData, formatDataHora } from '../../professor/professorLogic';
import { mensagemErro } from '../../professor/professorService';
import { gestaoService } from './gestaoService';
import type { PeriodoLetivo, Turma } from './gestaoService';
import { useCarga } from './useCarga';
import styles from '../../professor/Professor.module.css';

const ldate = (iso: string) => formatData(`${iso}T12:00:00`);

// ---------------------------------------------------------------- períodos

const PeriodoForm: React.FC<{ periodo: PeriodoLetivo | null; onSalvo: () => void; onCancelar: () => void }> = ({ periodo, onSalvo, onCancelar }) => {
  const toast = useToast();
  const [nome, setNome] = useState(periodo?.nome ?? '');
  const [inicio, setInicio] = useState(periodo?.inicio ?? '');
  const [fim, setFim] = useState(periodo?.fim ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { setErro('Informe o nome do período (ex.: 2026/1).'); return; }
    if (!inicio || !fim) { setErro('Informe as datas de início e fim.'); return; }
    if (fim < inicio) { setErro('O fim precisa ser depois do início.'); return; }
    setErro(null);
    setSalvando(true);
    try {
      if (periodo) await gestaoService.editarPeriodo(periodo.id, { nome: nome.trim(), inicio, fim });
      else await gestaoService.criarPeriodo({ nome: nome.trim(), inicio, fim });
      toast.show({ variant: 'success', message: periodo ? 'Período atualizado.' : 'Período criado.' });
      onSalvo();
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível salvar o período.'));
    } finally { setSalvando(false); }
  };

  return (
    <form className={`${styles.cardAlt} ${styles.stack}`} onSubmit={salvar} noValidate aria-label={periodo ? 'Editar período' : 'Novo período'}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor="per-nome" className={styles.label}>Nome</label>
          <input id="per-nome" className={styles.input} value={nome} maxLength={80} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div />
        <div className={styles.field}>
          <label htmlFor="per-ini" className={styles.label}>Início</label>
          <input id="per-ini" type="date" className={styles.input} value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="per-fim" className={styles.label}>Fim</label>
          <input id="per-fim" type="date" className={styles.input} value={fim} onChange={(e) => setFim(e.target.value)} />
        </div>
      </div>
      {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
      <div className={styles.row}>
        <Button type="submit" loading={salvando}>{periodo ? 'Salvar período' : 'Criar período'}</Button>
        <Button variant="ghost" onClick={onCancelar} disabled={salvando}>Cancelar</Button>
      </div>
    </form>
  );
};

// ---------------------------------------------------------------- turmas

const TurmaModal: React.FC<{
  turma: Turma | null; periodos: PeriodoLetivo[]; periodoPadrao: string; onClose: () => void; onSalvo: () => void;
}> = ({ turma, periodos, periodoPadrao, onClose, onSalvo }) => {
  const toast = useToast();
  const alunos = useCarga((s) => gestaoService.alunos(s), [], 'Não foi possível carregar os alunos.');
  const disciplinas = useCarga((s) => gestaoService.disciplinasGestao(s), [], 'Não foi possível carregar as disciplinas.');
  const [nome, setNome] = useState(turma?.nome ?? '');
  const [periodoId, setPeriodoId] = useState(turma?.periodoId ?? periodoPadrao);
  const [selAlunos, setSelAlunos] = useState<Set<string>>(new Set(turma?.alunos.map((a) => a.id) ?? []));
  const [selDisc, setSelDisc] = useState<Set<string>>(new Set(turma?.disciplinas.map((d) => d.id) ?? []));
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const alt = (set: Set<string>, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); return n; };
  const filtrados = (alunos.dados ?? []).filter((a) => !busca || `${a.nome} ${a.email}`.toLowerCase().includes(busca.toLowerCase()));
  const disponiveis = (disciplinas.dados ?? []).filter((d) => !d.arquivada || selDisc.has(d.id));

  const salvar = async () => {
    if (!nome.trim()) { setErro('Informe o nome da turma.'); return; }
    if (!periodoId) { setErro('Escolha o período.'); return; }
    setErro(null);
    setSalvando(true);
    try {
      const corpo = { nome: nome.trim(), periodoId, alunoIds: Array.from(selAlunos), disciplinaIds: Array.from(selDisc) };
      if (turma) await gestaoService.editarTurma(turma.id, corpo);
      else await gestaoService.criarTurma(corpo);
      toast.show({ variant: 'success', message: `${turma ? 'Turma atualizada' : 'Turma criada'}. Os alunos foram matriculados nas disciplinas.` });
      onSalvo();
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível salvar a turma.'));
    } finally { setSalvando(false); }
  };

  return (
    <Modal open title={turma ? 'Editar turma' : 'Nova turma'} size="lg" onClose={() => !salvando && onClose()}
      footer={<><Button variant="ghost" onClick={onClose} disabled={salvando}>Cancelar</Button><Button onClick={() => void salvar()} loading={salvando}>Salvar turma</Button></>}>
      <div className={styles.stack}>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="tur-nome" className={styles.label}>Nome da turma</label>
            <input id="tur-nome" className={styles.input} value={nome} maxLength={80} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="tur-per" className={styles.label}>Período</label>
            <select id="tur-per" className={styles.select} value={periodoId} onChange={(e) => setPeriodoId(e.target.value)}>
              <option value="">Escolha…</option>
              {periodos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
        </div>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>Disciplinas da turma</legend>
          {disciplinas.carregando && <p className={styles.muted} role="status">Carregando…</p>}
          <div className={styles.row}>
            {disponiveis.map((d) => (
              <label key={d.id} className={styles.check} style={{ minWidth: 200 }}>
                <input type="checkbox" checked={selDisc.has(d.id)} onChange={() => setSelDisc((s) => alt(s, d.id))} /> {d.nome}{d.arquivada ? ' (arquivada)' : ''}
              </label>
            ))}
            {!disciplinas.carregando && disponiveis.length === 0 && <span className={styles.muted}>Nenhuma disciplina ativa.</span>}
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>Alunos ({selAlunos.size} selecionados)</legend>
          <div className={styles.field}>
            <label htmlFor="tur-busca" className="sr-only">Buscar aluno</label>
            <input id="tur-busca" type="search" className={styles.input} placeholder="Buscar por nome ou e-mail" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          {alunos.carregando && <p className={styles.muted} role="status">Carregando alunos…</p>}
          {alunos.erro && <p role="alert" className={styles.errorText}>{alunos.erro}</p>}
          <div className={styles.row} style={{ margin: '8px 0' }}>
            <Button variant="ghost" onClick={() => setSelAlunos(new Set([...Array.from(selAlunos), ...filtrados.map((a) => a.id)]))}>Marcar os exibidos</Button>
            <Button variant="ghost" onClick={() => setSelAlunos(new Set())}>Limpar seleção</Button>
          </div>
          <div style={{ maxHeight: 220, overflow: 'auto' }} className={styles.stack}>
            {filtrados.map((a) => (
              <label key={a.id} className={styles.check}>
                <input type="checkbox" checked={selAlunos.has(a.id)} onChange={() => setSelAlunos((s) => alt(s, a.id))} /> {a.nome} <span className={styles.muted}>{a.email}</span>
              </label>
            ))}
            {!alunos.carregando && filtrados.length === 0 && <span className={styles.muted}>Nenhum aluno encontrado. Importe ou convide alunos primeiro.</span>}
          </div>
        </fieldset>
        {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
      </div>
    </Modal>
  );
};

// ---------------------------------------------------------------- tela

/** FE-304 · Períodos letivos, turmas, rematrícula em lote e arquivamento de disciplinas. */
const PeriodosTurmasView: React.FC = () => {
  const toast = useToast();
  const periodos = useCarga((s) => gestaoService.periodos(s), [], 'Não foi possível carregar os períodos.');
  const disciplinas = useCarga((s) => gestaoService.disciplinasGestao(s), [], 'Não foi possível carregar as disciplinas.');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const turmas = useCarga((s) => gestaoService.turmas(filtroPeriodo || undefined, s), [filtroPeriodo], 'Não foi possível carregar as turmas.');
  const [formPeriodo, setFormPeriodo] = useState<PeriodoLetivo | 'novo' | null>(null);
  const [modalTurma, setModalTurma] = useState<Turma | 'nova' | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [destino, setDestino] = useState('');
  const [sufixo, setSufixo] = useState('');
  const [rematriculando, setRematriculando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => { setSel(new Set()); }, [filtroPeriodo]);
  const nomePeriodoDestino = useMemo(() => periodos.dados?.find((p) => p.id === destino)?.nome ?? '', [periodos.dados, destino]);

  const rematricular = async () => {
    setRematriculando(true);
    try {
      const r = await gestaoService.rematricular({ turmaIds: Array.from(sel), periodoDestinoId: destino, sufixoNome: sufixo.trim() || undefined });
      toast.show({
        variant: r.criadas.length ? 'success' : 'info',
        message: `${r.criadas.length} turma(s) criada(s) em ${nomePeriodoDestino} com ${r.alunosMatriculados} aluno(s).`
          + (r.ignoradas.length ? ` Ignoradas: ${r.ignoradas.join('; ')}.` : ''),
        duration: 9000,
      });
      setSel(new Set()); setConfirmando(false);
      turmas.recarregar(); periodos.recarregar();
    } catch (e: any) {
      toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível rematricular.') });
      setConfirmando(false);
    } finally { setRematriculando(false); }
  };

  const arquivar = async (id: string, nome: string, arquivada: boolean) => {
    if (arquivada && !window.confirm(`Arquivar "${nome}"? O histórico continua visível, mas ninguém mais pode responder, corrigir ou publicar nela.`)) return;
    setOcupado(id);
    try {
      await gestaoService.arquivarDisciplina(id, arquivada);
      toast.show({ variant: 'success', message: arquivada ? `"${nome}" arquivada (somente leitura).` : `"${nome}" reativada.` });
      disciplinas.recarregar();
    } catch (e: any) {
      toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível alterar a disciplina.') });
    } finally { setOcupado(null); }
  };

  const alternarSel = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className={styles.stack}>
      {/* ---- períodos ---- */}
      <section className={styles.stack} aria-labelledby="per-titulo">
        <div className={styles.rowBetween}>
          <h2 id="per-titulo" className={styles.h2}>Períodos letivos</h2>
          {formPeriodo === null && <Button onClick={() => setFormPeriodo('novo')}>Novo período</Button>}
        </div>
        {formPeriodo !== null && (
          <PeriodoForm periodo={formPeriodo === 'novo' ? null : formPeriodo} onCancelar={() => setFormPeriodo(null)}
            onSalvo={() => { setFormPeriodo(null); periodos.recarregar(); }} />
        )}
        {periodos.erro && <div role="alert" className={styles.error}><p>{periodos.erro}</p><Button variant="secondary" onClick={periodos.recarregar}>Tentar novamente</Button></div>}
        {periodos.dados && periodos.dados.length === 0 && <EmptyState compact title="Nenhum período criado" description="Crie o primeiro semestre para organizar turmas e rematrículas." />}
        {periodos.dados && periodos.dados.length > 0 && (
          <div className={styles.tableWrap} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">Períodos letivos</caption>
              <thead><tr><th scope="col">Período</th><th scope="col">Início</th><th scope="col">Fim</th><th scope="col">Turmas</th><th scope="col"><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>
                {periodos.dados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome} {p.vigente && <span className={`${styles.badge} ${styles.badgeOk}`}>Vigente</span>}</td>
                    <td>{ldate(p.inicio)}</td><td>{ldate(p.fim)}</td><td>{p.turmas}</td>
                    <td><Button variant="ghost" onClick={() => setFormPeriodo(p)} aria-label={`Editar período ${p.nome}`}>Editar</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---- turmas ---- */}
      <section className={styles.stack} aria-labelledby="tur-titulo">
        <div className={styles.rowBetween}>
          <h2 id="tur-titulo" className={styles.h2}>Turmas</h2>
          <Button onClick={() => setModalTurma('nova')} disabled={!periodos.dados?.length}>Nova turma</Button>
        </div>
        <div className={styles.field} style={{ maxWidth: 260 }}>
          <label htmlFor="tur-filtro" className={styles.label}>Período</label>
          <select id="tur-filtro" className={styles.select} value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
            <option value="">Todos os períodos</option>
            {(periodos.dados ?? []).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        {turmas.erro && <div role="alert" className={styles.error}><p>{turmas.erro}</p><Button variant="secondary" onClick={turmas.recarregar}>Tentar novamente</Button></div>}
        {turmas.dados && turmas.dados.length === 0 && <EmptyState compact title="Nenhuma turma" description="Crie uma turma, escolha os alunos e as disciplinas." />}
        {turmas.dados && turmas.dados.length > 0 && (
          <div className={styles.tableWrap} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">Turmas, com período, alunos e disciplinas</caption>
              <thead><tr><th scope="col"><span className="sr-only">Selecionar</span></th><th scope="col">Turma</th><th scope="col">Período</th><th scope="col">Alunos</th><th scope="col">Disciplinas</th><th scope="col"><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>
                {turmas.dados.map((t) => (
                  <tr key={t.id}>
                    <td><input type="checkbox" checked={sel.has(t.id)} onChange={() => alternarSel(t.id)} aria-label={`Selecionar turma ${t.nome} para rematrícula`} /></td>
                    <td>{t.nome}</td><td>{t.periodoNome}</td><td>{t.alunos.length}</td>
                    <td>{t.disciplinas.map((d) => d.nome).join(', ') || '—'}</td>
                    <td><Button variant="ghost" onClick={() => setModalTurma(t)} aria-label={`Editar turma ${t.nome}`}>Editar</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sel.size > 0 && (
          <div className={`${styles.cardAlt} ${styles.stack}`} role="region" aria-label="Rematrícula em lote">
            <strong>Rematrícula em lote — {sel.size} {sel.size === 1 ? 'turma' : 'turmas'}</strong>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label htmlFor="rem-destino" className={styles.label}>Período de destino</label>
                <select id="rem-destino" className={styles.select} value={destino} onChange={(e) => setDestino(e.target.value)}>
                  <option value="">Escolha…</option>
                  {(periodos.dados ?? []).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="rem-sufixo" className={styles.label}>Complemento do nome (opcional)</label>
                <input id="rem-sufixo" className={styles.input} value={sufixo} placeholder="ex.: (2026/2)" onChange={(e) => setSufixo(e.target.value)} />
              </div>
            </div>
            <p className={styles.hint}>Cada turma escolhida é copiada para o período de destino, com os mesmos alunos e disciplinas. As turmas de origem ficam como estão (histórico).</p>
            <div className={styles.row}>
              <Button onClick={() => setConfirmando(true)} disabled={!destino}>Rematricular</Button>
              <Button variant="ghost" onClick={() => setSel(new Set())}>Limpar seleção</Button>
            </div>
          </div>
        )}
      </section>

      {/* ---- disciplinas / arquivamento ---- */}
      <section className={styles.stack} aria-labelledby="dis-titulo">
        <h2 id="dis-titulo" className={styles.h2}>Disciplinas e arquivamento</h2>
        <p className={styles.muted}>Disciplina arquivada mantém todo o histórico visível, só para leitura: ninguém responde, corrige ou publica nela.</p>
        {disciplinas.erro && <div role="alert" className={styles.error}><p>{disciplinas.erro}</p><Button variant="secondary" onClick={disciplinas.recarregar}>Tentar novamente</Button></div>}
        {disciplinas.dados && disciplinas.dados.length === 0 && <EmptyState compact title="Nenhuma disciplina" />}
        {disciplinas.dados && disciplinas.dados.length > 0 && (
          <div className={styles.tableWrap} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">Disciplinas da instituição</caption>
              <thead><tr><th scope="col">Disciplina</th><th scope="col">Professor</th><th scope="col">Alunos</th><th scope="col">Situação</th><th scope="col"><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>
                {disciplinas.dados.map((d) => (
                  <tr key={d.id}>
                    <td>{d.nome}</td><td>{d.professor ?? '—'}</td><td>{d.alunos}</td>
                    <td><span className={`${styles.badge} ${d.arquivada ? styles.badgeWarn : styles.badgeOk}`}>{d.arquivada ? 'Arquivada (só leitura)' : 'Ativa'}</span></td>
                    <td>
                      <Button variant="secondary" loading={ocupado === d.id} onClick={() => void arquivar(d.id, d.nome, !d.arquivada)}
                        aria-label={`${d.arquivada ? 'Reativar' : 'Arquivar'} ${d.nome}`}>
                        {d.arquivada ? 'Reativar' : 'Arquivar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalTurma !== null && periodos.dados && (
        <TurmaModal turma={modalTurma === 'nova' ? null : modalTurma} periodos={periodos.dados} periodoPadrao={filtroPeriodo}
          onClose={() => setModalTurma(null)} onSalvo={() => { setModalTurma(null); turmas.recarregar(); periodos.recarregar(); disciplinas.recarregar(); }} />
      )}

      <Modal open={confirmando} title="Confirmar rematrícula" onClose={() => !rematriculando && setConfirmando(false)}
        footer={<><Button variant="ghost" onClick={() => setConfirmando(false)} disabled={rematriculando}>Voltar</Button><Button onClick={() => void rematricular()} loading={rematriculando}>Confirmar rematrícula</Button></>}>
        <p>
          Vamos criar {sel.size} {sel.size === 1 ? 'turma nova' : 'turmas novas'} em <strong>{nomePeriodoDestino}</strong> com os mesmos alunos e disciplinas
          {sufixo.trim() ? <>, acrescentando <strong>{sufixo.trim()}</strong> ao nome</> : null}. Turmas que já existem no destino com o mesmo nome são ignoradas.
        </p>
        <p className={styles.muted}>Hoje é {formatDataHora(new Date().toISOString())}.</p>
      </Modal>
    </div>
  );
};

export default PeriodosTurmasView;
