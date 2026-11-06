import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCurrentUser } from '../../auth/auth';
import { Button } from '../../ui';
import { formatNota } from '../dashboard/dashboardLogic';
import { useRevisao } from './useRevisao';
import { contarErradas, errou, evolucaoPath, filtrarQuestoes, letra, mensagemBloqueio } from './revisaoLogic';
import type { QuestaoRevisao, RevisaoLista } from './types';
import styles from './RevisaoPage.module.css';

const Assunto: React.FC<{ assunto: QuestaoRevisao['assunto'] }> = ({ assunto }) => {
  if (!assunto) return null;
  const to = evolucaoPath(assunto.id);
  return to ? (
    <Link to={to} className={styles.badge}>Assunto: {assunto.nome}</Link>
  ) : (
    <span className={styles.badge}>Assunto: {assunto.nome}</span>
  );
};

const Questao: React.FC<{ q: QuestaoRevisao }> = ({ q }) => {
  const wrong = errou(q);
  const titleId = `questao-${q.questaoId}`;
  return (
    <li className={`${styles.card} ${wrong ? styles.errada : ''}`} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.num}>Questão {q.numero}</h2>
        <div className={styles.badges}>
          {q.tipo === 'OBJETIVA' && (
            wrong
              ? <span className={`${styles.badge} ${styles.badgeErro}`}>✗ Errou</span>
              : <span className={`${styles.badge} ${styles.badgeAcerto}`}>✓ Acertou</span>
          )}
          <Assunto assunto={q.assunto} />
        </div>
      </div>
      <p className={styles.enunciado}>{q.enunciado}</p>

      {q.tipo === 'OBJETIVA' ? (
        <>
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
        </>
      ) : (
        <dl className={styles.answers}>
          <dt>Minha resposta</dt>
          <dd>{q.minhaResposta || 'Em branco'}</dd>
          <dt>Nota</dt>
          <dd>{q.nota === null ? 'Aguardando correção do professor' : formatNota(q.nota, q.notaMaxima)}</dd>
          {q.feedback && (
            <>
              <dt>Feedback do professor</dt>
              <dd>{q.feedback}</dd>
            </>
          )}
        </dl>
      )}
    </li>
  );
};

const Review: React.FC<{ data: RevisaoLista }> = ({ data }) => {
  const [soErradas, setSoErradas] = useState(false);
  const erradas = contarErradas(data.questoes);
  const visiveis = filtrarQuestoes(data.questoes, soErradas);

  return (
    <>
      <div className={styles.summary}>
        {data.nota !== null && <strong>Nota: {formatNota(data.nota, data.notaMaxima)}</strong>}
        <span>{erradas === 0 ? 'Nenhuma questão errada 🎉' : `${erradas} ${erradas === 1 ? 'questão errada' : 'questões erradas'}`}</span>
        <label className={styles.toggle}>
          <input type="checkbox" checked={soErradas} onChange={(e) => setSoErradas(e.target.checked)} />
          Só as que errei
        </label>
      </div>
      {visiveis.length === 0 ? (
        <p className={styles.muted} role="status">Você não errou nenhuma questão desta lista.</p>
      ) : (
        <ol className={styles.list}>
          {visiveis.map((q) => <Questao key={q.questaoId} q={q} />)}
        </ol>
      )}
    </>
  );
};

const RevisaoPage: React.FC = () => {
  const { listaId } = useParams<{ listaId: string }>();
  const user = getCurrentUser();
  const estudanteId = (user?.userId as string) || localStorage.getItem('userId') || '';
  const { data, loading, error, retry } = useRevisao(listaId, estudanteId);

  return (
    <main className={styles.page} aria-labelledby="revisao-titulo" aria-busy={loading || undefined}>
      <h1 id="revisao-titulo" className={styles.title}>Revisão{data ? `: ${data.titulo}` : ''}</h1>
      {data && <p className={styles.muted}>{data.disciplina}</p>}

      {loading && <p role="status" className={styles.muted}>Carregando sua revisão…</p>}

      {!loading && error && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={retry}>Tentar novamente</Button>
        </div>
      )}

      {!loading && !error && data && !data.gabaritoLiberado && (
        <div role="status" className={styles.locked}>
          <p>{mensagemBloqueio(data.regraGabarito, data.liberadoEm)}</p>
          <Link to="/inicio" className={styles.badge}>Voltar ao início</Link>
        </div>
      )}

      {!loading && !error && data && data.gabaritoLiberado && <Review data={data} />}
    </main>
  );
};

export default RevisaoPage;
