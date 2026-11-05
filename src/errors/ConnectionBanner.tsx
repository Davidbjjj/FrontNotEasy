import React, { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE, NETWORK_ERROR_EVENT } from '../services/apiClient';
import styles from './ConnectionBanner.module.css';

const RETRY_SECONDS = 8;

type Status = 'online' | 'offline' | 'restored';

/** Responde com qualquer resposta HTTP (mesmo opaca) = servidor alcançável. */
async function isReachable(): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 5000);
    await fetch(API_BASE, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: ctrl.signal });
    window.clearTimeout(t);
    return true;
  } catch {
    return false;
  }
}

/** Aviso de "sem conexão" com nova tentativa automática. */
const ConnectionBanner: React.FC = () => {
  const [status, setStatus] = useState<Status>(navigator.onLine ? 'online' : 'offline');
  const [secondsLeft, setSecondsLeft] = useState(RETRY_SECONDS);
  const [checking, setChecking] = useState(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  const check = useCallback(async () => {
    setChecking(true);
    const ok = await isReachable();
    setChecking(false);
    if (ok) {
      setStatus('restored');
      window.setTimeout(() => setStatus((s) => (s === 'restored' ? 'online' : s)), 3000);
    } else {
      setSecondsLeft(RETRY_SECONDS);
    }
  }, []);

  useEffect(() => {
    const goOffline = () => {
      if (statusRef.current !== 'offline') {
        setSecondsLeft(RETRY_SECONDS);
        setStatus('offline');
      }
    };
    const goOnline = () => {
      if (statusRef.current === 'offline') void check();
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    window.addEventListener(NETWORK_ERROR_EVENT, goOffline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      window.removeEventListener(NETWORK_ERROR_EVENT, goOffline);
    };
  }, [check]);

  // Contagem regressiva; ao zerar tenta de novo
  useEffect(() => {
    if (status !== 'offline' || checking) return undefined;
    if (secondsLeft <= 0) {
      void check();
      return undefined;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [status, secondsLeft, checking, check]);

  if (status === 'online') return null;

  if (status === 'restored') {
    return (
      <div className={`${styles.banner} ${styles.restored}`} role="status">
        Conexão restabelecida.
      </div>
    );
  }

  return (
    <div className={`${styles.banner} ${styles.offline}`} role="alert">
      <span>
        Sem conexão com o servidor. {checking ? 'Tentando reconectar…' : `Nova tentativa em ${secondsLeft}s.`}
      </span>
      <button type="button" className={styles.retry} onClick={() => void check()} disabled={checking}>
        Tentar agora
      </button>
    </div>
  );
};

export default ConnectionBanner;
