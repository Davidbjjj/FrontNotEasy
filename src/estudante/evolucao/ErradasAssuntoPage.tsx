import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCurrentUser } from '../../auth/auth';
import { Button } from '../../ui';
import { letra } from '../revisao/revisaoLogic';
import { evolucaoService } from './evolucaoService';
import { useStudentResource } from './useStudentResource';
import { evolucaoPath } from './evolucaoLogic';
import type { ErradasAssunto, QuestaoErrada } from './types';
import styles from './Evolucao.module.css';

const Questao: React.FC<{ q: QuestaoErrada }> = ({ q }) => {
  const titleId = `erro-${q.listaId}-${q.questaoId}`;
  return (
    <li className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId}>Questão {q.numero} · {q.listaTitulo}</h2>
      <p className={styles.enunciado}>{q.enunciado}</p>
      <dl className={styles.answers}>
        <dt>Minha resposta</dt>
        <dd>
          {q.minhaResposta === null
            ? 'Em branco'
            : `${letra(q.minhaResposta)}) ${q.alternativas[q.minhaResposta] ?? ''}`}
        </dd>
        <dt>Resposta certa</dt>
        <dd>{letra(q.respostaCerta)}) {q.alternativas[q.respostaCerta] ?? ''}</dd>
      </dl>
      <div className={styles.explicacao}>
        <p>
          <strong>Explicação: </strong>
          {q.explicacao || 'O professor ainda não cadastrou uma explicação para esta questão.'}
        </p>
      </div>
      <p className={styles.muted}>
        <Link to={`/listas/${q.listaId}/revisao`} className={styles.link}>
          Abrir a revisão completa<span className="sr-only"> de {q.listaTitulo}</span>
        </Link>
      </p>
    </li>
  );
};

const Conteudo: React.FC<{ data: ErradasAssunto }> = ({ data }) =>
  data.questoes.length === 0 ? (
    <p role="status" className={styles.muted}>Você não errou nenhuma questão deste assunto. 🎉</p>
  ) : (
    <>
      <p className={styles.muted} role="status">
        {data.questoes.length} {data.questoes.length === 1 ? 'questão errada' : 'questões erradas'} (em branco conta como errada)
      </p>
      <ol className={styles.list}>
        {data.questoes.map((q) => <Questao key={`${q.listaId}-${q.questaoId}`} q={q} />)}
      </ol>
    </>
  );

const ErradasAssuntoPage: React.FC = () => {
  const { assuntoId } = useParams<{ assuntoId: string }>();
  const user = getCurrentUser();
  const estudanteId = (user?.userId as string) || localStorage.getItem('userId') || '';
  const { data, loading, error, retry } = useStudentResource(
    (signal) => evolucaoService.erradas(estudanteId, assuntoId as string, signal),
    [estudanteId, assuntoId],
    !!estudanteId && !!assuntoId,
    'Não foi possível carregar as questões erradas.'
  );

  return (
    <main className={styles.page} aria-labelledby="erradas-titulo" aria-busy={loading || undefined}>
      <Link to={evolucaoPath} className={`${styles.link} ${styles.back}`}>← Voltar para evolução</Link>
      <h1 id="erradas-titulo" className={styles.title}>Questões erradas{data ? `: ${data.assunto.nome}` : ''}</h1>
      {data && <p className={styles.muted}>{data.disciplina}</p>}

      {loading && <p role="status" className={styles.muted}>Carregando suas questões…</p>}

      {!loading && error && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={retry}>Tentar novamente</Button>
        </div>
      )}

      {!loading && !error && data && <Conteudo data={data} />}
    </main>
  );
};

export default ErradasAssuntoPage;
