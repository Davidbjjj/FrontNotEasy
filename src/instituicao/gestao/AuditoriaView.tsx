import React, { useState } from 'react';
import { Button, EmptyState } from '../../ui';
import { formatDataHora } from '../../professor/professorLogic';
import { formatarValorAuditoria, rotuloAcao } from './gestaoLogic';
import { gestaoService } from './gestaoService';
import type { EventoAuditoria } from './gestaoService';
import { useCarga } from './useCarga';
import styles from '../../professor/Professor.module.css';

const VAZIOS = { usuarioId: '', acao: '', inicio: '', fim: '' };

/** FE-307 · Log de auditoria: filtros, tabela e detalhe com valor anterior e novo. Só o admin chega aqui. */
const AuditoriaView: React.FC = () => {
  const [filtros, setFiltros] = useState(VAZIOS);
  const [aplicados, setAplicados] = useState(VAZIOS);
  const [pagina, setPagina] = useState(0);
  const [aberto, setAberto] = useState<string | null>(null);
  const dados = useCarga((s) => gestaoService.auditoria({ ...aplicados, page: pagina }, s), [aplicados, pagina],
    'Não foi possível carregar o log de auditoria.');

  const invalido = Boolean(filtros.inicio && filtros.fim && filtros.inicio > filtros.fim);
  const aplicar = (e: React.FormEvent) => { e.preventDefault(); if (!invalido) { setPagina(0); setAplicados(filtros); } };
  const limpar = () => { setFiltros(VAZIOS); setPagina(0); setAplicados(VAZIOS); };

  const detalhe = (e: EventoAuditoria) => (
    <div className={`${styles.cardAlt} ${styles.stack}`} id={`aud-${e.id}`}>
      <p style={{ margin: 0 }}>{e.descricao || '—'}</p>
      <dl className={styles.grid2} style={{ margin: 0 }}>
        <div><dt className={styles.label}>Valor anterior</dt><dd style={{ margin: 0 }}>{formatarValorAuditoria(e.valorAnterior)}</dd></div>
        <div><dt className={styles.label}>Valor novo</dt><dd style={{ margin: 0 }}>{formatarValorAuditoria(e.valorNovo)}</dd></div>
      </dl>
      <p className={styles.muted} style={{ margin: 0 }}>{e.entidade ?? '—'}{e.entidadeId ? ` · ${e.entidadeId}` : ''}</p>
    </div>
  );

  return (
    <section className={styles.stack} aria-labelledby="aud-titulo">
      <h2 id="aud-titulo" className={styles.h2}>Log de auditoria</h2>
      <p className={styles.muted}>Quem alterou o quê e quando. Útil para resolver contestações de nota.</p>

      <form className={`${styles.card} ${styles.row}`} style={{ alignItems: 'flex-end' }} onSubmit={aplicar} aria-label="Filtros do log">
        <div className={styles.field} style={{ minWidth: 200 }}>
          <label htmlFor="aud-usuario" className={styles.label}>Usuário</label>
          <select id="aud-usuario" className={styles.select} value={filtros.usuarioId} onChange={(e) => setFiltros((f) => ({ ...f, usuarioId: e.target.value }))}>
            <option value="">Todos</option>
            {(dados.dados?.usuarios ?? []).map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>
        <div className={styles.field} style={{ minWidth: 220 }}>
          <label htmlFor="aud-acao" className={styles.label}>Tipo de ação</label>
          <select id="aud-acao" className={styles.select} value={filtros.acao} onChange={(e) => setFiltros((f) => ({ ...f, acao: e.target.value }))}>
            <option value="">Todas</option>
            {(dados.dados?.acoes ?? []).map((a) => <option key={a} value={a}>{rotuloAcao(a)}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="aud-ini" className={styles.label}>De</label>
          <input id="aud-ini" type="date" className={styles.input} value={filtros.inicio} onChange={(e) => setFiltros((f) => ({ ...f, inicio: e.target.value }))} />
        </div>
        <div className={styles.field}>
          <label htmlFor="aud-fim" className={styles.label}>Até</label>
          <input id="aud-fim" type="date" className={styles.input} value={filtros.fim} onChange={(e) => setFiltros((f) => ({ ...f, fim: e.target.value }))} />
        </div>
        <Button type="submit" disabled={invalido}>Filtrar</Button>
        <Button variant="ghost" onClick={limpar}>Limpar</Button>
        {invalido && <p role="alert" className={styles.errorText}>O início precisa ser antes do fim.</p>}
      </form>

      {dados.erro && (
        <div role="alert" className={styles.error}><p>{dados.erro}</p><Button variant="secondary" onClick={dados.recarregar}>Tentar novamente</Button></div>
      )}
      {dados.carregando && !dados.dados && <p role="status" className={styles.muted}>Carregando eventos…</p>}

      {dados.dados && dados.dados.items.length === 0 && (
        <EmptyState compact icon={<span aria-hidden="true">🧾</span>} title="Nenhum evento encontrado" description="Ajuste os filtros ou aguarde novas alterações." />
      )}
      {dados.dados && dados.dados.items.length > 0 && (
        <>
          <p className={styles.muted} role="status" aria-live="polite">{dados.dados.totalElements} {dados.dados.totalElements === 1 ? 'evento' : 'eventos'}</p>
          <div className={styles.tableWrap} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">Eventos de auditoria, do mais recente para o mais antigo</caption>
              <thead>
                <tr><th scope="col">Data</th><th scope="col">Usuário</th><th scope="col">Ação</th><th scope="col">Item afetado</th><th scope="col">Mudança</th></tr>
              </thead>
              <tbody>
                {dados.dados.items.map((e) => (
                  <React.Fragment key={e.id}>
                    <tr>
                      <td>{formatDataHora(e.criadoEm)}</td>
                      <td>{e.usuarioNome ?? '—'}</td>
                      <td>{rotuloAcao(e.acao)}</td>
                      <td>{e.descricao ?? e.entidade ?? '—'}</td>
                      <td>
                        {e.valorAnterior != null || e.valorNovo != null
                          ? <span>{formatarValorAuditoria(e.valorAnterior)} → {formatarValorAuditoria(e.valorNovo)}</span> : '—'}
                        {' '}
                        <button type="button" className={styles.link} aria-expanded={aberto === e.id} aria-controls={`aud-${e.id}`}
                          onClick={() => setAberto(aberto === e.id ? null : e.id)}>
                          {aberto === e.id ? 'Ocultar' : 'Detalhe'}<span className="sr-only"> do evento {rotuloAcao(e.acao)}</span>
                        </button>
                      </td>
                    </tr>
                    {aberto === e.id && <tr><td colSpan={5}>{detalhe(e)}</td></tr>}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {dados.dados.totalPages > 1 && (
            <nav className={styles.pager} aria-label="Paginação do log">
              <Button variant="secondary" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>Anterior</Button>
              <span aria-live="polite">Página {pagina + 1} de {dados.dados.totalPages}</span>
              <Button variant="secondary" disabled={pagina + 1 >= dados.dados.totalPages} onClick={() => setPagina((p) => p + 1)}>Próxima</Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default AuditoriaView;
