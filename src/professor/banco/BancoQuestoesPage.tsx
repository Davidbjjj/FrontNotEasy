import React, { useCallback, useEffect, useState } from 'react';
import { Button, EmptyState, FilterBar, Modal, useToast } from '../../ui';
import { mensagemErro, professorService, urlImagem } from '../professorService';
import { DIFICULDADES, parseTags, resumoEnunciado, rotuloDificuldade } from '../professorLogic';
import type { FiltrosBanco, ListaConfig, PaginaBanco, QuestaoBanco } from '../types';
import styles from '../Professor.module.css';

const FILTROS_VAZIOS = { q: '', assunto: '', dificuldade: '', tag: '', disciplinaId: '', tipo: '' };
const TAMANHO = 10;

const classeDificuldade = (d: string | null) =>
  d === 'FACIL' ? styles.badgeOk : d === 'DIFICIL' ? styles.badgeDanger : d === 'MEDIA' ? styles.badgeWarn : '';

/** Pré-visualização completa da questão, sem sair da listagem. */
const Previa: React.FC<{ questao: QuestaoBanco }> = ({ questao }) => {
  const [full, setFull] = useState<QuestaoBanco | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    const c = new AbortController();
    professorService.detalheQuestao(questao.id, c.signal)
      .then(setFull)
      .catch((e) => { if (!c.signal.aborted) setErro(mensagemErro(e, 'Não foi possível abrir a pré-visualização.')); });
    return () => c.abort();
  }, [questao.id]);
  const q = full ?? questao;
  return (
    <div className={`${styles.cardAlt} ${styles.stack}`} aria-label={`Pré-visualização da questão ${questao.id}`}>
      {q.cabecalho && <p className={styles.muted}>{q.cabecalho}</p>}
      <p className={styles.pre}>{q.enunciado}</p>
      {full?.imagens?.map((img, k) => (
        <img key={k} src={urlImagem(img.urlPublica)} alt={img.nomeArquivo || `Imagem ${k + 1}`} style={{ maxWidth: 360, maxHeight: 220, width: 'auto', height: 'auto', objectFit: 'contain', border: '1px solid var(--border)', borderRadius: 8 }} />
      ))}
      {q.tipo === 'OBJETIVA' && q.alternativas.length > 0 && (
        <ol className={styles.alts} type="A">
          {q.alternativas.map((a, i) => (
            <li key={i} className={i === q.gabarito ? styles.altCorreta : undefined}>
              {a}{i === q.gabarito && <span> (gabarito)</span>}
            </li>
          ))}
        </ol>
      )}
      {q.tipo === 'ABERTA' && (
        <p className={styles.muted}><strong>Rubrica:</strong> {q.rubrica || 'não cadastrada'}</p>
      )}
      {q.explicacao && <p className={styles.muted}><strong>Explicação:</strong> {q.explicacao}</p>}
      {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
    </div>
  );
};

/** Edita tags, dificuldade e assunto direto na listagem. */
const EditorClassificacao: React.FC<{
  questao: QuestaoBanco; onSalvo: (q: QuestaoBanco) => void; onCancelar: () => void;
}> = ({ questao, onSalvo, onCancelar }) => {
  const toast = useToast();
  const [tags, setTags] = useState(questao.tags.join(', '));
  const [dificuldade, setDificuldade] = useState<string>(questao.dificuldade ?? '');
  const [assunto, setAssunto] = useState(questao.assunto ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const nova = await professorService.classificarQuestao(questao.id, {
        tags: parseTags(tags), dificuldade: dificuldade || null, assunto: assunto.trim() || null,
      });
      toast.show({ variant: 'success', message: 'Classificação da questão atualizada.' });
      onSalvo(nova);
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível salvar.'));
    } finally {
      setSalvando(false);
    }
  };

  const id = `cls-${questao.id}`;
  return (
    <form className={`${styles.cardAlt} ${styles.stack}`} onSubmit={salvar} aria-label={`Editar classificação da questão ${questao.id}`}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label htmlFor={`${id}-assunto`} className={styles.label}>Assunto</label>
          <input id={`${id}-assunto`} className={styles.input} value={assunto} maxLength={255} onChange={(e) => setAssunto(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-dif`} className={styles.label}>Dificuldade</label>
          <select id={`${id}-dif`} className={styles.select} value={dificuldade} onChange={(e) => setDificuldade(e.target.value)}>
            <option value="">Sem classificação</option>
            {DIFICULDADES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor={`${id}-tags`} className={styles.label}>Tags</label>
        <input id={`${id}-tags`} className={styles.input} value={tags} onChange={(e) => setTags(e.target.value)} />
        <span className={styles.hint}>Separe por vírgula. Até 20 tags.</span>
      </div>
      {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
      <div className={styles.row}>
        <Button type="submit" loading={salvando}>Salvar</Button>
        <Button variant="ghost" onClick={onCancelar} disabled={salvando}>Cancelar</Button>
      </div>
    </form>
  );
};

const BancoQuestoesPage: React.FC = () => {
  const toast = useToast();
  const [filtros, setFiltros] = useState<Record<string, string>>(FILTROS_VAZIOS);
  const [pagina, setPagina] = useState(0);
  const [dados, setDados] = useState<PaginaBanco | null>(null);
  const [opcoes, setOpcoes] = useState<FiltrosBanco | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  const [aberta, setAberta] = useState<Record<number, 'previa' | 'editar' | undefined>>({});
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [modalAberto, setModalAberto] = useState(false);
  const [listas, setListas] = useState<ListaConfig[]>([]);
  const [listaDestino, setListaDestino] = useState('');
  const [erroModal, setErroModal] = useState<string | null>(null);
  const [adicionando, setAdicionando] = useState(false);

  const professorId = localStorage.getItem('userId') || '';

  useEffect(() => {
    const c = new AbortController();
    professorService.filtrosBanco(c.signal).then(setOpcoes).catch(() => { /* filtros são opcionais */ });
    return () => c.abort();
  }, [tentativa]);

  useEffect(() => {
    const c = new AbortController();
    setCarregando(true);
    setErro(null);
    const t = window.setTimeout(() => {
      professorService.buscarBanco({ ...filtros, page: pagina, size: TAMANHO }, c.signal)
        .then((d) => { if (!c.signal.aborted) setDados(d); })
        .catch((e) => { if (!c.signal.aborted) setErro(mensagemErro(e, 'Não foi possível carregar o banco de questões.')); })
        .finally(() => { if (!c.signal.aborted) setCarregando(false); });
    }, filtros.q ? 300 : 0);
    return () => { window.clearTimeout(t); c.abort(); };
  }, [filtros, pagina, tentativa]);

  const mudarFiltro = (name: string, value: string) => { setPagina(0); setFiltros((f) => ({ ...f, [name]: value })); };

  const alternar = (id: number) => setSelecionadas((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const abrirModal = async () => {
    setModalAberto(true);
    setErroModal(null);
    try {
      const l = await professorService.listasDoProfessor(professorId);
      setListas(l);
      if (!listaDestino && l.length > 0) setListaDestino(l[0].id);
    } catch (e: any) {
      setErroModal(mensagemErro(e, 'Não foi possível carregar suas listas.'));
    }
  };

  const adicionar = async () => {
    if (!listaDestino) { setErroModal('Escolha a lista de destino.'); return; }
    setAdicionando(true);
    setErroModal(null);
    try {
      const r = await professorService.adicionarALista(listaDestino, Array.from(selecionadas));
      const nome = listas.find((l) => l.id === listaDestino)?.titulo ?? 'a lista';
      toast.show({
        variant: 'success',
        message: `${r.adicionadas} ${r.adicionadas === 1 ? 'questão adicionada' : 'questões adicionadas'} a "${nome}"`
          + (r.ignoradas > 0 ? ` (${r.ignoradas} já estavam lá).` : '.'),
      });
      setSelecionadas(new Set());
      setModalAberto(false);
    } catch (e: any) {
      setErroModal(mensagemErro(e, 'Não foi possível adicionar as questões.'));
    } finally {
      setAdicionando(false);
    }
  };

  const atualizarItem = useCallback((q: QuestaoBanco) => {
    setDados((d) => (d ? { ...d, items: d.items.map((i) => (i.id === q.id ? q : i)) } : d));
    setAberta((a) => ({ ...a, [q.id]: undefined }));
    professorService.filtrosBanco().then(setOpcoes).catch(() => undefined);
  }, []);

  return (
    <main className={styles.page} aria-labelledby="banco-titulo">
      <h1 id="banco-titulo" className={styles.title}>Banco de questões</h1>
      <p className={styles.subtitle}>
        Todas as questões que você já criou, num só lugar. Busque, classifique e reutilize em outras listas.
      </p>

      <FilterBar
        fields={[
          { type: 'search', name: 'q', label: 'Buscar', placeholder: 'Texto, assunto ou tag' },
          { type: 'select', name: 'assunto', label: 'Assunto', allLabel: 'Todos', options: (opcoes?.assuntos ?? []).map((a) => ({ value: a, label: a })) },
          { type: 'select', name: 'dificuldade', label: 'Dificuldade', allLabel: 'Todas', options: DIFICULDADES.map((d) => ({ value: d.value, label: d.label })) },
          { type: 'select', name: 'tag', label: 'Tag', allLabel: 'Todas', options: (opcoes?.tags ?? []).map((t) => ({ value: t, label: t })) },
          { type: 'select', name: 'disciplinaId', label: 'Disciplina', allLabel: 'Todas', options: (opcoes?.disciplinas ?? []).map((d) => ({ value: d.id, label: d.nome })) },
          { type: 'select', name: 'tipo', label: 'Tipo', allLabel: 'Todos', options: [{ value: 'OBJETIVA', label: 'Objetiva' }, { value: 'ABERTA', label: 'Aberta' }] },
        ]}
        values={filtros}
        onChange={mudarFiltro}
        onClear={() => { setPagina(0); setFiltros(FILTROS_VAZIOS); }}
      />

      {erro && (
        <div role="alert" className={styles.error} style={{ marginTop: 12 }}>
          <p>{erro}</p>
          <Button variant="secondary" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</Button>
        </div>
      )}

      {!erro && carregando && !dados && <p role="status" className={styles.muted}>Carregando questões…</p>}

      {!erro && dados && (
        <>
          <p className={styles.muted} role="status" aria-live="polite" style={{ margin: '12px 0' }}>
            {dados.totalElements} {dados.totalElements === 1 ? 'questão encontrada' : 'questões encontradas'}
          </p>

          {dados.items.length === 0 ? (
            <EmptyState
              icon={<span aria-hidden="true">🗂️</span>}
              title="Nenhuma questão encontrada"
              description={Object.values(filtros).some(Boolean)
                ? 'Tente remover algum filtro ou buscar por outro termo.'
                : 'As questões que você criar nas listas aparecem aqui automaticamente.'}
            />
          ) : (
            <ul className={styles.stack} style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-busy={carregando || undefined}>
              {dados.items.map((q) => (
                <li key={q.id} className={`${styles.card} ${styles.qCard}`}>
                  <div className={styles.qHead}>
                    <input
                      type="checkbox"
                      checked={selecionadas.has(q.id)}
                      onChange={() => alternar(q.id)}
                      aria-label={`Selecionar questão ${q.id}: ${resumoEnunciado(q.enunciado, 60)}`}
                    />
                    <div className={styles.qBody}>
                      <p className={styles.qText}>{resumoEnunciado(q.enunciado, 220)}</p>
                      <div className={styles.row}>
                        <span className={styles.badge}>{q.tipo === 'ABERTA' ? 'Aberta' : 'Objetiva'}</span>
                        <span className={`${styles.badge} ${classeDificuldade(q.dificuldade)}`}>{rotuloDificuldade(q.dificuldade)}</span>
                        {q.assunto && <span className={`${styles.badge} ${styles.badgeInfo}`}>{q.assunto}</span>}
                        {q.disciplinaNome && <span className={styles.badge}>{q.disciplinaNome}</span>}
                        <span className={styles.muted}>Lista: {q.listaTitulo}</span>
                      </div>
                      {q.tags.length > 0 && (
                        <div className={styles.tagList} style={{ marginTop: 6 }} aria-label="Tags">
                          {q.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                        </div>
                      )}
                    </div>
                    <div className={styles.row}>
                      <Button variant="ghost" aria-expanded={aberta[q.id] === 'previa'}
                        onClick={() => setAberta((a) => ({ ...a, [q.id]: a[q.id] === 'previa' ? undefined : 'previa' }))}>
                        {aberta[q.id] === 'previa' ? 'Ocultar' : 'Pré-visualizar'}
                      </Button>
                      <Button variant="ghost" aria-expanded={aberta[q.id] === 'editar'}
                        onClick={() => setAberta((a) => ({ ...a, [q.id]: a[q.id] === 'editar' ? undefined : 'editar' }))}>
                        Classificar
                      </Button>
                    </div>
                  </div>
                  {aberta[q.id] === 'previa' && <Previa questao={q} />}
                  {aberta[q.id] === 'editar' && (
                    <EditorClassificacao questao={q} onSalvo={atualizarItem}
                      onCancelar={() => setAberta((a) => ({ ...a, [q.id]: undefined }))} />
                  )}
                </li>
              ))}
            </ul>
          )}

          {dados.totalPages > 1 && (
            <nav className={styles.pager} aria-label="Paginação">
              <Button variant="secondary" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>Anterior</Button>
              <span aria-live="polite">Página {pagina + 1} de {dados.totalPages}</span>
              <Button variant="secondary" disabled={pagina + 1 >= dados.totalPages} onClick={() => setPagina((p) => p + 1)}>Próxima</Button>
            </nav>
          )}
        </>
      )}

      {selecionadas.size > 0 && (
        <div className={styles.selectionBar} role="region" aria-label="Ações para as questões selecionadas">
          <span role="status">{selecionadas.size} {selecionadas.size === 1 ? 'selecionada' : 'selecionadas'}</span>
          <div className={styles.row}>
            <Button variant="ghost" onClick={() => setSelecionadas(new Set())}>Limpar seleção</Button>
            <Button onClick={() => void abrirModal()}>Adicionar a uma lista</Button>
          </div>
        </div>
      )}

      <Modal
        open={modalAberto}
        title="Adicionar questões a uma lista"
        onClose={() => !adicionando && setModalAberto(false)}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setModalAberto(false)} disabled={adicionando}>Cancelar</Button>
            <Button onClick={() => void adicionar()} loading={adicionando} disabled={!listaDestino}>
              Adicionar {selecionadas.size} {selecionadas.size === 1 ? 'questão' : 'questões'}
            </Button>
          </>
        )}
      >
        <div className={styles.stack}>
          <p className={styles.muted}>
            As questões são <strong>copiadas</strong> para a lista escolhida; editar a cópia não muda a original.
          </p>
          <div className={styles.field}>
            <label htmlFor="banco-lista-destino" className={styles.label}>Lista de destino</label>
            <select id="banco-lista-destino" className={styles.select} value={listaDestino} onChange={(e) => setListaDestino(e.target.value)}>
              {listas.length === 0 && <option value="">Nenhuma lista encontrada</option>}
              {listas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.titulo}{l.disciplinaNome ? ` — ${l.disciplinaNome}` : ''}{l.status === 'RASCUNHO' ? ' (rascunho)' : ''}
                </option>
              ))}
            </select>
          </div>
          {erroModal && <p role="alert" className={styles.errorText}>{erroModal}</p>}
        </div>
      </Modal>
    </main>
  );
};

export default BancoQuestoesPage;
