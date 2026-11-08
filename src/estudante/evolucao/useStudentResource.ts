import { useCallback, useEffect, useState } from 'react';

/** Carrega um recurso do aluno com loading/erro/retry e cancelamento. */
export function useStudentResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: ReadonlyArray<unknown>,
  ready: boolean,
  fallbackError: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      setError('Não foi possível identificar o aluno. Entre novamente.');
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    load(controller.signal)
      .then((d) => { if (!controller.signal.aborted) setData(d); })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e?.response?.data?.message || e?.message || fallbackError);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, loading, error, retry };
}
