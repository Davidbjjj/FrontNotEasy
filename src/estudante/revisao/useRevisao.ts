import { useCallback, useEffect, useState } from 'react';
import { revisaoService } from './revisaoService';
import type { RevisaoLista } from './types';

export function useRevisao(listaId: string | undefined, estudanteId: string) {
  const [data, setData] = useState<RevisaoLista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!listaId || !estudanteId) {
      setLoading(false);
      setError('Não foi possível identificar a lista ou o aluno. Entre novamente.');
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    revisaoService
      .get(listaId, estudanteId, controller.signal)
      .then((d) => { if (!controller.signal.aborted) setData(d); })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e?.response?.data?.message || e?.message || 'Não foi possível carregar a revisão.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [listaId, estudanteId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, loading, error, retry };
}
