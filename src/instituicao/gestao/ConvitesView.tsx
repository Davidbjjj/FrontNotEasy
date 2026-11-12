import React, { useState } from 'react';
import { Button, EmptyState, useToast } from '../../ui';
import { formatDataHora } from '../../professor/professorLogic';
import { mensagemErro } from '../../professor/professorService';
import { podeCancelar, podeReenviar, ROTULO_PAPEL, ROTULO_STATUS_CONVITE } from './gestaoLogic';
import { gestaoService } from './gestaoService';
import type { Convite, PapelConvite } from './gestaoService';
import { useCarga } from './useCarga';
import styles from '../../professor/Professor.module.css';

const classeStatus = (s: Convite['status']) =>
  s === 'ACEITO' ? styles.badgeOk : s === 'PENDENTE' ? styles.badgeInfo : s === 'EXPIRADO' ? styles.badgeWarn : styles.badgeDanger;

/** FE-302 · Convidar por e-mail (papel + disciplinas), acompanhar o status, reenviar e cancelar. */
const ConvitesView: React.FC = () => {
  const toast = useToast();
  const convites = useCarga((s) => gestaoService.convites(s), [], 'Não foi possível carregar os convites.');
  const disciplinas = useCarga((s) => gestaoService.disciplinasGestao(s), [], 'Não foi possível carregar as disciplinas.');
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [papel, setPapel] = useState<PapelConvite>('PROFESSOR');
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [linkAtual, setLinkAtual] = useState<{ email: string; link: string } | null>(null);

  const ativas = (disciplinas.dados ?? []).filter((d) => !d.arquivada);

  const alternar = (id: string) => setMarcadas((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const convidar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErro('Informe um e-mail válido.'); return; }
    setErro(null);
    setEnviando(true);
    try {
      const c = await gestaoService.convidar({ email: email.trim(), nome: nome.trim() || undefined, papel, disciplinaIds: Array.from(marcadas) });
      toast.show({ variant: 'success', message: `Convite enviado para ${c.email}.` });
      if (c.link) setLinkAtual({ email: c.email, link: c.link });
      setEmail(''); setNome(''); setMarcadas(new Set());
      convites.recarregar();
    } catch (err: any) {
      setErro(mensagemErro(err, 'Não foi possível enviar o convite.'));
    } finally {
      setEnviando(false);
    }
  };

  const reenviar = async (c: Convite) => {
    setOcupado(c.id);
    try {
      const r = await gestaoService.reenviarConvite(c.id);
      toast.show({ variant: 'success', message: `Convite reenviado para ${c.email}. O link anterior deixou de valer.` });
      if (r.link) setLinkAtual({ email: c.email, link: r.link });
      convites.recarregar();
    } catch (err: any) {
      toast.show({ variant: 'error', message: mensagemErro(err, 'Não foi possível reenviar.') });
    } finally { setOcupado(null); }
  };

  const cancelar = async (c: Convite) => {
    if (!window.confirm(`Cancelar o convite de ${c.email}? O link deixa de funcionar.`)) return;
    setOcupado(c.id);
    try {
      await gestaoService.cancelarConvite(c.id);
      toast.show({ variant: 'success', message: 'Convite cancelado.' });
      convites.recarregar();
    } catch (err: any) {
      toast.show({ variant: 'error', message: mensagemErro(err, 'Não foi possível cancelar.') });
    } finally { setOcupado(null); }
  };

  const copiar = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.show({ variant: 'success', message: 'Link copiado.' });
    } catch {
      toast.show({ variant: 'info', message: 'Selecione o link e copie manualmente.' });
    }
  };

  return (
    <section className={styles.stack} aria-labelledby="conv-titulo">
      <h2 id="conv-titulo" className={styles.h2}>Convites</h2>

      <form className={`${styles.card} ${styles.stack}`} onSubmit={convidar} noValidate aria-label="Novo convite">
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="conv-email" className={styles.label}>E-mail</label>
            <input id="conv-email" type="email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="conv-nome" className={styles.label}>Nome (opcional)</label>
            <input id="conv-nome" className={styles.input} value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="conv-papel" className={styles.label}>Papel</label>
            <select id="conv-papel" className={styles.select} value={papel} onChange={(e) => setPapel(e.target.value as PapelConvite)}>
              <option value="PROFESSOR">Professor</option>
              <option value="COORDENADOR">Coordenador</option>
              <option value="ALUNO">Aluno</option>
            </select>
          </div>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className={styles.label}>
            Disciplinas {papel === 'ALUNO' ? '(o aluno é matriculado)' : '(a pessoa passa a ser o professor)'}
          </legend>
          {disciplinas.carregando && <p className={styles.muted} role="status">Carregando disciplinas…</p>}
          {!disciplinas.carregando && ativas.length === 0 && <p className={styles.muted}>Nenhuma disciplina ativa. Você pode convidar sem vincular.</p>}
          <div className={styles.row}>
            {ativas.map((d) => (
              <label key={d.id} className={styles.check} style={{ minWidth: 200 }}>
                <input type="checkbox" checked={marcadas.has(d.id)} onChange={() => alternar(d.id)} /> {d.nome}
              </label>
            ))}
          </div>
        </fieldset>
        {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
        <div><Button type="submit" loading={enviando}>Enviar convite</Button></div>
      </form>

      {linkAtual && (
        <div className={`${styles.cardAlt} ${styles.stack}`} role="status">
          <p style={{ margin: 0 }}>
            Convite para <strong>{linkAtual.email}</strong>. Se o e-mail não chegar, envie este link (vale 7 dias):
          </p>
          <input className={styles.input} readOnly value={linkAtual.link} onFocus={(e) => e.currentTarget.select()} aria-label="Link do convite" />
          <div className={styles.row}>
            <Button variant="secondary" onClick={() => void copiar(linkAtual.link)}>Copiar link</Button>
            <Button variant="ghost" onClick={() => setLinkAtual(null)}>Fechar</Button>
          </div>
        </div>
      )}

      {convites.erro && (
        <div role="alert" className={styles.error}><p>{convites.erro}</p><Button variant="secondary" onClick={convites.recarregar}>Tentar novamente</Button></div>
      )}
      {convites.carregando && !convites.dados && <p role="status" className={styles.muted}>Carregando convites…</p>}
      {convites.dados && convites.dados.length === 0 && (
        <EmptyState compact icon={<span aria-hidden="true">✉️</span>} title="Nenhum convite enviado" description="Os convites que você enviar aparecem aqui, com o status de cada um." />
      )}
      {convites.dados && convites.dados.length > 0 && (
        <div className={styles.tableWrap} tabIndex={0}>
          <table className={styles.table}>
            <caption className="sr-only">Convites enviados, com papel, disciplinas e situação</caption>
            <thead>
              <tr><th scope="col">Convidado</th><th scope="col">Papel</th><th scope="col">Disciplinas</th><th scope="col">Enviado em</th><th scope="col">Situação</th><th scope="col"><span className="sr-only">Ações</span></th></tr>
            </thead>
            <tbody>
              {convites.dados.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome ? <strong>{c.nome}</strong> : null}<div className={styles.muted}>{c.email}</div></td>
                  <td>{ROTULO_PAPEL[c.papel] ?? c.papel}</td>
                  <td>{c.disciplinas.length ? c.disciplinas.map((d) => d.nome).join(', ') : '—'}</td>
                  <td>{formatDataHora(c.criadoEm)}<div className={styles.muted}>vence {formatDataHora(c.expiraEm)}</div></td>
                  <td><span className={`${styles.badge} ${classeStatus(c.status)}`}>{ROTULO_STATUS_CONVITE[c.status]}</span></td>
                  <td>
                    <div className={styles.row}>
                      {podeReenviar(c.status) && (
                        <Button variant="secondary" loading={ocupado === c.id} onClick={() => void reenviar(c)} aria-label={`Reenviar convite para ${c.email}`}>Reenviar</Button>
                      )}
                      {podeCancelar(c.status) && (
                        <Button variant="ghost" disabled={ocupado === c.id} onClick={() => void cancelar(c)} aria-label={`Cancelar convite de ${c.email}`}>Cancelar</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ConvitesView;
