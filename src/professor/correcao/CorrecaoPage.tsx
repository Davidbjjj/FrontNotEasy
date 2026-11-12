import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, EmptyState, FilterBar, useToast } from '../../ui';
import { mensagemErro, professorService, urlImagem } from '../professorService';
import { formatDataHora, formatNota, parseNota } from '../professorLogic';
import type { DetalheCorrecao, FilaCorrecao } from '../types';
import styles from '../Professor.module.css';

/**
 * FE-201 · Fila de correção. Lista as respostas abertas pendentes, mostra a resposta do aluno ao lado da
 * rubrica e permite lançar nota e feedback, com "salvar e próxima" e contador de pendentes.
 * Contrato: docs/professor-api.md.
 */
const CorrecaoPage: React.FC = () => {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [filtros, setFiltros] = useState<Record<string, string>>({ busca: '', listaId: '', disciplinaId: '' });
  const [fila, setFila] = useState<FilaCorrecao | null>(null);
  const [erroFila, setErroFila] = useState<string | null>(null);
  const [carregandoFila, setCarregandoFila] = useState(true);

  const selecionadaId = params.get('resposta') ? Number(params.get('resposta')) : null;
  const [detalhe, setDetalhe] = useState<DetalheCorrecao | null>(null);
  const [erroDetalhe, setErroDetalhe] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [feedback, setFeedback] = useState('');
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const notaRef = useRef<HTMLInputElement>(null);
  const detalheRef = useRef<HTMLElement>(null);

  const carregarFila = useCallback(async (f: Record<string, string>, signal?: AbortSignal) => {
    setErroFila(null);
    try {
      const data = await professorService.fila(f, signal);
      if (!signal?.aborted) setFila(data);
      return data;
    } catch (e: any) {
      if (signal?.aborted) return null;
      setErroFila(mensagemErro(e, 'Não foi possível carregar a fila de correção.'));
      return null;
    } finally {
      if (!signal?.aborted) setCarregandoFila(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    setCarregandoFila(true);
    const t = window.setTimeout(() => void carregarFila(filtros, c.signal), filtros.busca ? 250 : 0);
    return () => { window.clearTimeout(t); c.abort(); };
  }, [filtros, carregarFila]);

  const selecionar = useCallback((id: number | null) => {
    const next = new URLSearchParams(params);
    if (id == null) next.delete('resposta');
    else next.set('resposta', String(id));
    setParams(next, { replace: true });
  }, [params, setParams]);

  // Abre a primeira pendente quando nada está selecionado
  useEffect(() => {
    if (fila && fila.items.length > 0 && (selecionadaId == null || !fila.items.some((i) => i.respostaId === selecionadaId))) {
      if (selecionadaId == null) selecionar(fila.items[0].respostaId);
    }
  }, [fila, selecionadaId, selecionar]);

  useEffect(() => {
    if (selecionadaId == null) { setDetalhe(null); return undefined; }
    const c = new AbortController();
    setErroDetalhe(null);
    setErroForm(null);
    professorService.detalheResposta(selecionadaId, c.signal)
      .then((d) => {
        setDetalhe(d);
        setNota(d.notaQuestao == null ? '' : String(d.notaQuestao).replace('.', ','));
        setFeedback(d.feedback ?? '');
        window.setTimeout(() => {
          // celular: a fila e a correção ficam empilhadas, então traz a resposta escolhida para a tela
          if (window.innerWidth < 960) detalheRef.current?.scrollIntoView({ block: 'start' });
          notaRef.current?.focus({ preventScroll: window.innerWidth < 960 });
        }, 0);
      })
      .catch((e) => { if (!c.signal.aborted) { setDetalhe(null); setErroDetalhe(mensagemErro(e, 'Não foi possível abrir esta resposta.')); } });
    return () => c.abort();
  }, [selecionadaId]);

  const salvar = async (proxima: boolean) => {
    if (!detalhe) return;
    const n = parseNota(nota);
    if (n == null) { setErroForm('Informe uma nota de 0 a 10 (ex.: 7,5).'); notaRef.current?.focus(); return; }
    setErroForm(null);
    setSalvando(true);
    try {
      const idx = fila?.items.findIndex((i) => i.respostaId === detalhe.respostaId) ?? -1;
      const r = await professorService.corrigir(detalhe.respostaId, n, feedback);
      toast.show({
        variant: 'success',
        message: r.notaLancada
          ? `Nota salva. ${detalhe.estudanteNome} foi avisado(a) de que a nota saiu.`
          : 'Correção salva.',
      });
      const nova = await carregarFila(filtros);
      if (proxima && nova) {
        const prox = nova.items[Math.min(Math.max(idx, 0), nova.items.length - 1)];
        selecionar(prox ? prox.respostaId : null);
      } else if (!proxima) {
        // permanece na resposta; recarrega para refletir "corrigida"
        const d = await professorService.detalheResposta(detalhe.respostaId);
        setDetalhe(d);
      }
    } catch (e: any) {
      setErroForm(mensagemErro(e, 'Não foi possível salvar a correção.'));
    } finally {
      setSalvando(false);
    }
  };

  const total = fila?.total ?? 0;
  const restantesGeral = detalhe?.restantes ?? total;

  return (
    <main className={styles.page} aria-labelledby="correcao-titulo">
      <div className={styles.rowBetween}>
        <h1 id="correcao-titulo" className={styles.title}>Fila de correção</h1>
        <p className={styles.counter} role="status" aria-live="polite">
          {restantesGeral} {restantesGeral === 1 ? 'pendente' : 'pendentes'}
        </p>
      </div>
      <p className={styles.subtitle}>Respostas abertas que esperam nota. Corrija em sequência com "Salvar e próxima".</p>

      <FilterBar
        fields={[
          { type: 'search', name: 'busca', label: 'Aluno', placeholder: 'Buscar por nome' },
          { type: 'select', name: 'listaId', label: 'Lista', allLabel: 'Todas as listas',
            options: (fila?.listas ?? []).map((l) => ({ value: l.id, label: l.nome })) },
          { type: 'select', name: 'disciplinaId', label: 'Disciplina / turma', allLabel: 'Todas',
            options: (fila?.disciplinas ?? []).map((d) => ({ value: d.id, label: d.nome })) },
        ]}
        values={filtros}
        onChange={(name, value) => setFiltros((f) => ({ ...f, [name]: value }))}
        onClear={() => setFiltros({ busca: '', listaId: '', disciplinaId: '' })}
      />

      {erroFila && (
        <div role="alert" className={styles.error}>
          <p>{erroFila}</p>
          <Button variant="secondary" onClick={() => void carregarFila(filtros)}>Tentar novamente</Button>
        </div>
      )}

      {!erroFila && carregandoFila && !fila && <p role="status" className={styles.muted}>Carregando a fila…</p>}

      {!erroFila && fila && fila.items.length === 0 && (
        <EmptyState
          icon={<span aria-hidden="true">✅</span>}
          title={Object.values(filtros).some(Boolean) ? 'Nada pendente com esses filtros' : 'Nenhuma resposta aguardando correção'}
          description="Quando um aluno finalizar uma lista com questões abertas, a resposta aparece aqui."
        />
      )}

      {fila && fila.items.length > 0 && (
        <div className={styles.split}>
          <nav aria-label="Respostas pendentes">
            <ul className={styles.queue}>
              {fila.items.map((i) => (
                <li key={i.respostaId}>
                  <button
                    type="button"
                    className={`${styles.queueItem} ${i.respostaId === selecionadaId ? styles.queueItemActive : ''}`}
                    aria-current={i.respostaId === selecionadaId ? 'true' : undefined}
                    onClick={() => selecionar(i.respostaId)}
                  >
                    <span className={styles.queueName}>{i.estudanteNome}</span>
                    <span className={styles.muted}>{i.listaTitulo}{i.disciplinaNome ? ` · ${i.disciplinaNome}` : ''}</span>
                    <span className={styles.muted}>{formatDataHora(i.enviadaEm)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <section ref={detalheRef} aria-label="Correção" className={`${styles.card} ${styles.stack}`}>
            {erroDetalhe && <p role="alert" className={styles.errorText}>{erroDetalhe}</p>}
            {!detalhe && !erroDetalhe && <p className={styles.muted} role="status">Abrindo resposta…</p>}
            {detalhe && (
              <>
                <div>
                  <h2 className={styles.h2}>{detalhe.estudanteNome}</h2>
                  <p className={styles.muted}>
                    {detalhe.listaTitulo}{detalhe.disciplinaNome ? ` · ${detalhe.disciplinaNome}` : ''}
                    {detalhe.assunto ? ` · ${detalhe.assunto}` : ''}
                    {detalhe.corrigida && <> · <span className={`${styles.badge} ${styles.badgeOk}`}>Já corrigida (nota {formatNota(detalhe.notaQuestao)})</span></>}
                  </p>
                </div>

                <div className={styles.quote}>
                  <p className={styles.quoteLabel}>Enunciado</p>
                  <p className={styles.pre}>{detalhe.enunciado}</p>
                  {detalhe.imagens?.map((img, k) => (
                    <img key={k} src={urlImagem(img.urlPublica)} alt={img.nomeArquivo || `Imagem ${k + 1} do enunciado`}
                      style={{ maxWidth: 480, maxHeight: 300, width: 'auto', height: 'auto', objectFit: 'contain', marginTop: 8 }} />
                  ))}
                </div>

                <div className={styles.grid2}>
                  <div className={styles.quote} style={{ borderLeftColor: 'var(--accent)' }}>
                    <p className={styles.quoteLabel}>Resposta do aluno</p>
                    <p className={styles.pre}>{detalhe.textoResposta}</p>
                  </div>
                  <div className={styles.quote} style={{ borderLeftColor: 'var(--color-warning)' }}>
                    <p className={styles.quoteLabel}>Rubrica</p>
                    {detalhe.rubrica
                      ? <p className={styles.pre}>{detalhe.rubrica}</p>
                      : <p className={styles.muted}>Esta questão não tem rubrica cadastrada.</p>}
                  </div>
                </div>

                <form
                  className={styles.stack}
                  onSubmit={(e) => { e.preventDefault(); void salvar(true); }}
                  noValidate
                >
                  <div className={styles.field} style={{ maxWidth: 220 }}>
                    <label htmlFor="correcao-nota" className={styles.label}>Nota (0 a 10)</label>
                    <input
                      id="correcao-nota" ref={notaRef} className={styles.input} inputMode="decimal"
                      value={nota} onChange={(e) => setNota(e.target.value)}
                      aria-invalid={erroForm ? true : undefined} aria-describedby={erroForm ? 'correcao-erro' : undefined}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="correcao-feedback" className={styles.label}>Feedback escrito (opcional)</label>
                    <textarea id="correcao-feedback" className={styles.textarea} value={feedback}
                      maxLength={2000} onChange={(e) => setFeedback(e.target.value)} />
                    <span className={styles.hint}>{feedback.length}/2000 · o aluno vê este texto na revisão.</span>
                  </div>
                  {erroForm && <p id="correcao-erro" role="alert" className={styles.errorText}>{erroForm}</p>}
                  <div className={styles.row}>
                    <Button type="submit" loading={salvando}>Salvar e próxima</Button>
                    <Button variant="secondary" loading={salvando} onClick={() => void salvar(false)}>Salvar</Button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default CorrecaoPage;
