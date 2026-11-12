import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, EmptyState, useToast } from '../ui';
import { mensagemErro, professorService } from '../professor/professorService';
import { aplicarFormato, formatDataHora, parseTexto, validarAnexo } from '../professor/professorLogic';
import type { Inline } from '../professor/professorLogic';
import type { Aviso } from '../professor/types';
import styles from '../professor/Professor.module.css';

const InlineView: React.FC<{ itens: Inline[] }> = ({ itens }) => (
  <>
    {itens.map((i, k) => {
      if (i.t === 'negrito') return <strong key={k}>{i.v}</strong>;
      if (i.t === 'italico') return <em key={k}>{i.v}</em>;
      if (i.t === 'link') return <a key={k} href={i.href} target="_blank" rel="noopener noreferrer" className={styles.link}>{i.v}</a>;
      return <React.Fragment key={k}>{i.v}</React.Fragment>;
    })}
  </>
);

/** Renderiza o texto formatado do aviso sem usar HTML (sem risco de script injetado). */
export const TextoFormatado: React.FC<{ texto: string }> = ({ texto }) => (
  <div>
    {parseTexto(texto).map((b, k) => (b.t === 'ul' ? (
      <ul key={k} style={{ margin: '0 0 8px', paddingLeft: 20 }}>
        {b.itens.map((it, j) => <li key={j}><InlineView itens={it} /></li>)}
      </ul>
    ) : (
      <p key={k} className={styles.pre} style={{ margin: '0 0 8px' }}><InlineView itens={b.inline} /></p>
    )))}
  </div>
);

const Compositor: React.FC<{ disciplinaId: string; onPublicado: (a: Aviso) => void }> = ({ disciplinaId, onPublicado }) => {
  const toast = useToast();
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [fixado, setFixado] = useState(false);
  const [anexo, setAnexo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  const formatar = (tipo: 'negrito' | 'italico' | 'lista') => {
    const el = areaRef.current;
    if (!el) return;
    const r = aplicarFormato(texto, el.selectionStart, el.selectionEnd, tipo);
    setTexto(r.texto);
    window.setTimeout(() => { el.focus(); el.setSelectionRange(r.ini, r.fim); }, 0);
  };

  const escolherArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      const problema = validarAnexo(f);
      if (problema) { setErro(problema); e.target.value = ''; return; }
    }
    setErro(null);
    setAnexo(f);
  };

  const publicar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!titulo.trim()) { setErro('Escreva o título do aviso.'); return; }
    if (!texto.trim()) { setErro('Escreva o texto do aviso.'); return; }
    setErro(null);
    setEnviando(true);
    try {
      const novo = await professorService.publicarAviso(disciplinaId, { titulo: titulo.trim(), texto: texto.trim(), fixado, anexo });
      toast.show({ variant: 'success', message: 'Aviso publicado. Os alunos foram notificados.' });
      onPublicado(novo);
      setTitulo(''); setTexto(''); setFixado(false); setAnexo(null);
      if (arquivoRef.current) arquivoRef.current.value = '';
    } catch (e: any) {
      setErro(mensagemErro(e, 'Não foi possível publicar o aviso.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className={`${styles.card} ${styles.stack}`} onSubmit={publicar} noValidate aria-label="Novo aviso">
      <div className={styles.field}>
        <label htmlFor="aviso-titulo" className={styles.label}>Título</label>
        <input id="aviso-titulo" className={styles.input} value={titulo} maxLength={150} onChange={(e) => setTitulo(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label htmlFor="aviso-texto" className={styles.label}>Texto</label>
        <div className={styles.toolbar} role="toolbar" aria-label="Formatação do texto">
          <Button variant="secondary" onClick={() => formatar('negrito')} aria-label="Negrito"><strong>N</strong></Button>
          <Button variant="secondary" onClick={() => formatar('italico')} aria-label="Itálico"><em>I</em></Button>
          <Button variant="secondary" onClick={() => formatar('lista')} aria-label="Lista com marcadores">• Lista</Button>
        </div>
        <textarea id="aviso-texto" ref={areaRef} className={styles.textarea} value={texto} maxLength={5000} onChange={(e) => setTexto(e.target.value)} />
        <span className={styles.hint}>Use **negrito**, _itálico_, "- " para listas e [texto](https://link) para links.</span>
      </div>
      <div className={styles.field}>
        <label htmlFor="aviso-anexo" className={styles.label}>Anexo (opcional)</label>
        <input id="aviso-anexo" ref={arquivoRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={escolherArquivo} />
        <span className={styles.hint}>PDF, PNG, JPG ou TXT, até 5 MB.</span>
      </div>
      <label className={styles.check}>
        <input type="checkbox" checked={fixado} onChange={(e) => setFixado(e.target.checked)} /> Fixar no topo do mural
      </label>
      {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
      <div><Button type="submit" loading={enviando}>Publicar aviso</Button></div>
    </form>
  );
};

/**
 * FE-209 · Mural de avisos da disciplina. O professor publica, fixa e exclui; o aluno só lê.
 * Contrato: docs/professor-api.md.
 */
export const MuralAvisos: React.FC<{ disciplinaId: string; podeEditar: boolean }> = ({ disciplinaId, podeEditar }) => {
  const toast = useToast();
  const [avisos, setAvisos] = useState<Aviso[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => {
    const c = new AbortController();
    setErro(null);
    professorService.avisos(disciplinaId, c.signal)
      .then((a) => { if (!c.signal.aborted) setAvisos(a); })
      .catch((e) => { if (!c.signal.aborted) setErro(mensagemErro(e, 'Não foi possível carregar o mural.')); });
    return () => c.abort();
  }, [disciplinaId, tentativa]);

  const ordenar = (lista: Aviso[]) =>
    [...lista].sort((a, b) => Number(b.fixado) - Number(a.fixado) || b.criadoEm.localeCompare(a.criadoEm));

  const fixar = useCallback(async (a: Aviso) => {
    setOcupado(a.id);
    try {
      const novo = await professorService.fixarAviso(a.id, !a.fixado);
      setAvisos((l) => (l ? ordenar(l.map((x) => (x.id === a.id ? novo : x))) : l));
      toast.show({ variant: 'success', message: novo.fixado ? 'Aviso fixado no topo.' : 'Aviso desafixado.' });
    } catch (e: any) {
      toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível fixar o aviso.') });
    } finally { setOcupado(null); }
  }, [toast]);

  const excluir = async (a: Aviso) => {
    if (!window.confirm(`Excluir o aviso "${a.titulo}"? Os alunos deixam de vê-lo.`)) return;
    setOcupado(a.id);
    try {
      await professorService.excluirAviso(a.id);
      setAvisos((l) => (l ? l.filter((x) => x.id !== a.id) : l));
      toast.show({ variant: 'success', message: 'Aviso excluído.' });
    } catch (e: any) {
      toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível excluir o aviso.') });
    } finally { setOcupado(null); }
  };

  const baixarAnexo = async (a: Aviso) => {
    try { await professorService.baixarAnexo(a); }
    catch (e: any) { toast.show({ variant: 'error', message: mensagemErro(e, 'Não foi possível baixar o anexo.') }); }
  };

  return (
    <section aria-labelledby="mural-titulo" className={styles.stack}>
      <h2 id="mural-titulo" className={styles.h2}>Mural de avisos</h2>

      {podeEditar && <Compositor disciplinaId={disciplinaId} onPublicado={(a) => setAvisos((l) => ordenar([a, ...(l ?? [])]))} />}

      {erro && (
        <div role="alert" className={styles.error}>
          <p>{erro}</p>
          <Button variant="secondary" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</Button>
        </div>
      )}
      {!erro && avisos === null && <p role="status" className={styles.muted}>Carregando avisos…</p>}
      {!erro && avisos && avisos.length === 0 && (
        <EmptyState compact icon={<span aria-hidden="true">📌</span>} title="Nenhum aviso por aqui"
          description={podeEditar ? 'Publique o primeiro aviso para a turma.' : 'Quando o professor publicar um aviso, ele aparece aqui.'} />
      )}
      {!erro && avisos && avisos.length > 0 && (
        <ul className={styles.stack} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {avisos.map((a) => (
            <li key={a.id} className={`${styles.card} ${a.fixado ? styles.avisoPinned : ''}`}>
              <article aria-labelledby={`aviso-${a.id}`}>
                <div className={styles.rowBetween}>
                  <h3 id={`aviso-${a.id}`} className={styles.avisoTitle}>
                    {a.fixado && <span aria-hidden="true">📌 </span>}{a.titulo}
                    {a.fixado && <span className="sr-only"> (fixado)</span>}
                  </h3>
                  <span className={styles.muted}>{a.autor ? `${a.autor} · ` : ''}{formatDataHora(a.criadoEm)}</span>
                </div>
                <TextoFormatado texto={a.texto} />
                {a.anexo && (
                  <p style={{ margin: '4px 0 0' }}>
                    <button type="button" className={styles.link} onClick={() => void baixarAnexo(a)}>📎 {a.anexo.nome}</button>
                  </p>
                )}
                {podeEditar && (
                  <div className={styles.row} style={{ marginTop: 8 }}>
                    <Button variant="secondary" loading={ocupado === a.id} onClick={() => void fixar(a)}>{a.fixado ? 'Desafixar' : 'Fixar no topo'}</Button>
                    <Button variant="ghost" disabled={ocupado === a.id} onClick={() => void excluir(a)}>Excluir</Button>
                  </div>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MuralAvisos;
