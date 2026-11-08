import React, { useEffect, useState } from 'react';
import { formatSavedAgo } from '../../storage/attemptStorage';

export type SaveState = 'idle' | 'saving' | 'saved' | 'offline' | 'error';

interface Props {
  state: SaveState;
  savedAt: number | null;
  pendingCount: number;
  onRetry?: () => void;
}

/** Indicador de salvamento: "Salvo há 12 s", "Salvando…", "Sem conexão…". */
const SaveStatus: React.FC<Props> = ({ state, savedAt, pendingCount, onRetry }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!savedAt) return undefined;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [savedAt]);

  let text = '';
  let mod: string = state;
  if (state === 'saving') text = 'Salvando…';
  else if (state === 'offline')
    text = `Sem conexão: ${pendingCount} resposta${pendingCount === 1 ? '' : 's'} guardada${pendingCount === 1 ? '' : 's'} neste aparelho. Envio automático ao reconectar.`;
  else if (state === 'error') text = `Não foi possível salvar${pendingCount ? ` (${pendingCount} pendente${pendingCount === 1 ? '' : 's'})` : ''}.`;
  else if (savedAt) {
    text = `Salvo ${formatSavedAgo(Math.max(0, Math.floor((now - savedAt) / 1000)))}`;
    mod = 'saved';
  } else return null;

  return (
    <div className={`save-status save-status--${mod}`} role="status" aria-live="polite">
      <span>{text}</span>
      {state === 'error' && onRetry && (
        <button type="button" className="save-status__retry" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  );
};

export default SaveStatus;
