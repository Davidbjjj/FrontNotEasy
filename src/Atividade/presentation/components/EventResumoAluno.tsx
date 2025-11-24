import React, { useEffect, useState, useCallback } from 'react';
import eventoService, { EventoResumo, ApiError } from '../../services/api/eventoService';
import './styles/EventResumoAluno.css';

type Props = {
  eventoId: string | number;
  estudanteId: string | number;
  refreshKey?: any; // change this prop to force refetch
};

export default function EventResumoAluno({ eventoId, estudanteId, refreshKey }: Props) {
  const [resumo, setResumo] = useState<EventoResumo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDescricao, setShowDescricao] = useState(false);

  const fetchResumo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await eventoService.getResumoEventoParaAluno(eventoId, estudanteId);
      setResumo(r);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        setError('Resumo não encontrado para este estudante.');
        setResumo(null);
      } else {
        setError('Erro ao buscar resumo. Tentar novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [eventoId, estudanteId]);

  useEffect(() => {
    fetchResumo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchResumo, refreshKey]);

  if (loading) return <div className="resumo-status" role="status" aria-live="polite">Carregando resumo...</div>;
  if (error) return (
    <div className="resumo-error" role="alert" aria-live="assertive">
      <p>{error}</p>
      <div className="resumo-actions">
        <button onClick={fetchResumo} aria-label="Tentar novamente" className="btn btn-secondary">Tentar novamente</button>
      </div>
    </div>
  );
  if (!resumo) return null;

  const nota = resumo.notaAluno && resumo.notaAluno.trim() !== '' ? resumo.notaAluno : '—';
  const status = resumo.status ?? 'pendente';

  const statusClass = status === 'entregue' ? 'status-entregue' : (status === 'pendente' ? 'status-pendente' : 'status-default');

  return (
    <article className="resumo-card" aria-labelledby={`resumo-evento-${resumo.idEvento}`}>
      <header className="resumo-header">
        <h2 id={`resumo-evento-${resumo.idEvento}`} className="resumo-title">{resumo.nomeEvento}</h2>
        <div className={`resumo-badge ${statusClass}`} role="status" aria-label={`Status: ${status}`}>
          {status}
        </div>
      </header>

      <dl className="resumo-grid">
        <div>
          <dt>Prazo</dt>
          <dd><time dateTime={resumo.prazo}>{resumo.prazoDate ? resumo.prazoDate.toLocaleDateString() : resumo.prazo}</time></dd>
        </div>

        <div>
          <dt>Disciplina</dt>
          <dd>{resumo.nomeDisciplina || '—'}</dd>
        </div>

        <div>
          <dt>Nota</dt>
          <dd aria-label={resumo.notaAluno ? `Nota do aluno: ${resumo.notaAluno}` : 'Sem nota'}>{nota}</dd>
        </div>
      </dl>

      {resumo.descricao ? (
        <div className="resumo-descricao">
          <button
            className="descricao-toggle"
            aria-expanded={showDescricao}
            aria-controls={`descricao-${resumo.idEvento}`}
            onClick={() => setShowDescricao(s => !s)}
          >
            {showDescricao ? 'Esconder observação' : 'Mostrar observação'}
          </button>
          <div id={`descricao-${resumo.idEvento}`} className={`descricao-content ${showDescricao ? 'open' : ''}`} role="region" aria-hidden={!showDescricao}>
            {resumo.descricao}
          </div>
        </div>
      ) : null}

      <footer className="resumo-footer">
        <div className="resumo-actions">
          <button onClick={fetchResumo} aria-label="Atualizar resumo" className="btn btn-primary">Atualizar</button>
        </div>
      </footer>
    </article>
  );
}
