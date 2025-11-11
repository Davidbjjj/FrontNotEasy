/**
 * Hook para gerenciar lógica de notas e estudantes
 * Consolidação de lógica que estava duplicada em StudentsList e EventComponents
 */

import { useState, useCallback, useEffect } from 'react';
import { Student, StudentResponses, Activity } from '../model/Activity';
import { listaService } from '../../listaQuestoes/services/api/listaService';
import { eventoService } from '../services/api/eventoService';
import { normalizeStudentIdentifier } from '../utils/StudentIdExtractor';

interface UseStudentNotasReturn {
  notas: Student[] | null;
  loading: boolean;
  error: string | null;
  fetchNotas: (listaId: string) => Promise<void>;
}

/**
 * Hook para carregar notas de uma lista
 */
export const useStudentNotas = (): UseStudentNotasReturn => {
  const [notas, setNotas] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotas = useCallback(async (listaId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await listaService.getNotasPorLista(listaId);

      const normalized: Student[] = (result || []).map((it: any) => ({
        nomeEstudante:
          it.nomeAluno || it.nomeEstudante || it.nome || it.aluno?.nome || '',
        nota: it.nota ?? it.valor ?? null,
        estudanteId:
          it.estudanteId || it.aluno?.id || it.idAluno || it.id || null,
      }));

      setNotas(normalized);
    } catch (err) {
      console.error('Erro ao buscar notas da lista:', err);
      setError('Erro ao carregar notas da lista');
    } finally {
      setLoading(false);
    }
  }, []);

  return { notas, loading, error, fetchNotas };
};

interface UseEventoReturn {
  evento: Activity | null;
  listaId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para carregar dados do evento
 */
export const useEvento = (eventoId: string): UseEventoReturn => {
  const [evento, setEvento] = useState<Activity | null>(null);
  const [listaId, setListaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchEvento = async () => {
      setLoading(true);
      setError(null);

      try {
        const ev = await eventoService.getEvento(eventoId);
        if (!mounted) return;

        setEvento(ev || null);

        // Extrai listaId de várias possíveis estruturas
        const foundListaId =
          ev?.listas?.[0]?.idLista ||
          ev?.lista?.idLista ||
          ev?.lista?.id ||
          ev?.listaId ||
          ev?.idLista ||
          null;

        setListaId(foundListaId ? String(foundListaId) : null);
      } catch (err) {
        console.error('Erro ao buscar detalhes do evento:', err);
        if (!mounted) return;
        setError('Erro ao carregar detalhes do evento');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEvento();
    return () => {
      mounted = false;
    };
  }, [eventoId]);

  return { evento, listaId, loading, error };
};

interface UseStudentResponsesReturn {
  data: StudentResponses | null;
  loading: boolean;
  error: string | null;
  fetchStudentResponses: (
    eventoId: string,
    listaId: string,
    estudanteId: string
  ) => Promise<void>;
}

/**
 * Hook para carregar respostas de um estudante
 */
export const useStudentResponses = (): UseStudentResponsesReturn => {
  const [data, setData] = useState<StudentResponses | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentResponses = useCallback(
    async (eventoId: string, listaId: string, estudanteId: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await eventoService.getRespostasComNota(
          eventoId,
          listaId,
          estudanteId
        );
        setData(result);
      } catch (err: any) {
        console.error('Erro ao carregar respostas:', err);
        setError(err?.message || 'Erro ao buscar respostas do estudante');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, fetchStudentResponses };
};

interface UseStudentClickReturn {
  loading: boolean;
  error: string | null;
  data: StudentResponses | null;
  handleStudentClick: (
    studentIdentifier: string,
    eventoId: string,
    listaId: string,
    evento: Activity | null | undefined
  ) => Promise<void>;
}

/**
 * Hook consolidado para gerenciar click em estudante e carregar respostas
 */
export const useStudentClick = (): UseStudentClickReturn => {
  const { data, loading, error, fetchStudentResponses } =
    useStudentResponses();

  const handleStudentClick = useCallback(
    async (
      studentIdentifier: string,
      eventoId: string,
      listaId: string,
      evento: Activity | null | undefined
    ) => {
      if (!eventoId || !listaId) {
        throw new Error('Evento ou lista não disponíveis para buscar respostas.');
      }

      const estudanteId = normalizeStudentIdentifier(
        studentIdentifier,
        evento
      );

      if (!estudanteId) {
        throw new Error('Não foi possível localizar o ID do estudante.');
      }

      await fetchStudentResponses(eventoId, listaId, estudanteId);
    },
    [fetchStudentResponses]
  );

  return { loading, error, data, handleStudentClick };
};
