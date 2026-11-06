import React, { useEffect, useState } from 'react';

interface Props {
  /** Instante final (epoch ms). Sem ele, nada é exibido. */
  deadline?: number;
  onExpire?: () => void;
}

export const formatRemaining = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/** Contador regressivo para listas com tempo limite (a fonte do limite vem do FE-205). */
const CountdownTimer: React.FC<Props> = ({ deadline, onExpire }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return undefined;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [deadline]);

  const remaining = deadline ? deadline - now : 0;
  const expired = Boolean(deadline) && remaining <= 0;

  useEffect(() => {
    if (expired && onExpire) onExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  if (!deadline) return null;
  return (
    <div className={`countdown${remaining <= 60000 ? ' countdown--urgent' : ''}`}>
      <span aria-hidden>⏱</span>{' '}
      <span role="timer" aria-label={expired ? 'Tempo esgotado' : `Tempo restante ${formatRemaining(remaining)}`}>
        {expired ? 'Tempo esgotado' : formatRemaining(remaining)}
      </span>
    </div>
  );
};

export default CountdownTimer;
