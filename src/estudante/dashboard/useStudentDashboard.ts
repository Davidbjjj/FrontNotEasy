import { useCallback, useEffect, useState } from 'react';
import { studentDashboardService } from './dashboardService';
import type { StudentDashboard } from './types';

export function useStudentDashboard(estudanteId: string) {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!estudanteId) {
      setLoading(false);
      setError('Não foi possível identificar o aluno. Entre novamente.');
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    studentDashboardService
      .get(estudanteId, controller.signal)
      .then((d) => {
        if (!controller.signal.aborted) setData(d);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e?.response?.data?.message || e?.message || 'Não foi possível carregar seu painel.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [estudanteId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, loading, error, retry };
}
