import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../auth/auth';
import { Button, EmptyState } from '../../ui';
import { erradasPath } from '../evolucao/evolucaoLogic';
import { useStudentResource } from '../evolucao/useStudentResource';
import { planoService } from './planoService';
import { descricaoErros, formatGeradoEm, ordenarPlano, resumoPlano } from './planoLogic';
import type { AssuntoRecomendado, PlanoRevisao } from './types';
import styles from './Plano.module.css';

const AvisoIA: React.FC<{ geradoEm: string }> = ({ geradoEm }) => {
  const quando = formatGeradoEm(geradoEm);
  return (
    <aside className={styles.aviso} aria-label="Aviso sobre inteligência artificial">
      <p>
        <strong>Recomendação gerada por inteligência artificial.</strong> Ela analisa seus erros, mas pode se
        enganar. Use como ponto de partida e, se tiver dúvida, converse com seu professor.
        {quando && <> Gerada em {quando}.</>}
      </p>
    </aside>
  );
};

const Item: React.FC<{
  a: AssuntoRecomendado;
  salvando: boolean;
  erro: string | null;
  onToggle: (a: AssuntoRecomendado) => void;
}> = ({ a, salvando, erro, onToggle }) => {
  const titleId = `plano-${a.assuntoId}`;
  return (
    <li className={`${styles.card} ${a.revisado ? styles.done : ''}`} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.assunto}>{a.nome}</h2>
        {a.revisado && <span className={styles.badge}>Revisado</span>}
      </div>
      <p className={styles.muted}>{a.disciplina} · {descricaoErros(a)}</p>
      <p className={styles.motivo}><strong>Por que estudar: </strong>{a.motivo}</p>
      <div className={styles.actions}>
        <Link to={erradasPath(a.assuntoId)} className={styles.link}>
          Ver questões erradas<span className="sr-only"> de {a.nome}</span>
        </Link>
        <Button
          variant={a.revisado ? 'secondary' : 'primary'}
          disabled={salvando}
          aria-pressed={a.revisado}
          onClick={() => onToggle(a)}
        >
          Marcar como revisado<span className="sr-only">: {a.nome}</span>
        </Button>
      </div>
      {erro && <p role="alert" className={styles.itemError}>{erro}</p>}
    </li>
  );
};

const Conteudo: React.FC<{ plano: PlanoRevisao; estudanteId: string }> = ({ plano, estudanteId }) => {
  // Alterações do aluno por cima do plano vindo da API (otimistas até o servidor confirmar).
  const [overrides, setOverrides] = useState<Record<string, Partial<AssuntoRecomendado>>>({});
  const [salvando, setSalvando] = useState<Set<string>>(new Set());
  const [erros, setErros] = useState<Record<string, string>>({});
  const [anuncio, setAnuncio] = useState('');

  const assuntos = useMemo(
    () => plano.assuntos.map((x) => ({ ...x, ...overrides[x.assuntoId] })),
    [plano, overrides]
  );

  const set = (id: string, patch: Partial<AssuntoRecomendado>) =>
    setOverrides((o) => ({ ...o, [id]: { ...o[id], ...patch } }));

  const alternar = async (a: AssuntoRecomendado) => {
    const novo = !a.revisado;
    setErros((r) => { const n = { ...r }; delete n[a.assuntoId]; return n; });
    setSalvando((s) => new Set(s).add(a.assuntoId));
    set(a.assuntoId, { revisado: novo }); // otimista; volta se falhar
    try {
      const { revisadoEm } = await planoService.marcarRevisado(estudanteId, a.assuntoId, novo);
      set(a.assuntoId, { revisadoEm });
      setAnuncio(novo ? `${a.nome} marcado como revisado.` : `${a.nome} desmarcado.`);
    } catch {
      set(a.assuntoId, { revisado: a.revisado, revisadoEm: a.revisadoEm });
      setErros((r) => ({ ...r, [a.assuntoId]: 'Não foi possível salvar. Tente novamente.' }));
    } finally {
      setSalvando((s) => { const n = new Set(s); n.delete(a.assuntoId); return n; });
    }
  };

  return (
    <>
      <AvisoIA geradoEm={plano.geradoEm} />
      {assuntos.length === 0 ? (
        <EmptyState
          icon={<span aria-hidden="true">🎉</span>}
          title="Nada para revisar por enquanto"
          description="Quando você errar questões em uma lista, os assuntos para estudar aparecem aqui."
          action={<Link className={styles.link} to="/evolucao">Ver minha evolução</Link>}
        />
      ) : (
        <>
          <p className={styles.muted}>{resumoPlano(assuntos)}</p>
          <p className="sr-only" role="status">{anuncio}</p>
          <ol className={styles.list}>
            {ordenarPlano(assuntos).map((a) => (
              <Item
                key={a.assuntoId}
                a={a}
                salvando={salvando.has(a.assuntoId)}
                erro={erros[a.assuntoId] ?? null}
                onToggle={alternar}
              />
            ))}
          </ol>
        </>
      )}
    </>
  );
};

const PlanoRevisaoPage: React.FC = () => {
  const user = getCurrentUser();
  const estudanteId = (user?.userId as string) || localStorage.getItem('userId') || '';
  const { data, loading, error, retry } = useStudentResource(
    (signal) => planoService.get(estudanteId, signal),
    [estudanteId],
    !!estudanteId,
    'Não foi possível carregar seu plano de revisão.'
  );

  return (
    <main className={styles.page} aria-labelledby="plano-titulo" aria-busy={loading || undefined}>
      <h1 id="plano-titulo" className={styles.title}>Plano de revisão</h1>
      <p className={styles.muted}>O que estudar agora, com base nos seus erros.</p>

      {loading && <p role="status" className={styles.muted}>Preparando seu plano…</p>}

      {!loading && error && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={retry}>Tentar novamente</Button>
        </div>
      )}

      {!loading && !error && data && <Conteudo plano={data} estudanteId={estudanteId} />}
    </main>
  );
};

export default PlanoRevisaoPage;
