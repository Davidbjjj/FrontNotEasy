import { useCallback, useEffect, useState } from 'react';
import analyticsService, { MediasAlunoDTO, ListaMenorMediaDTO, AtividadesConcluidasDTO } from '../services/api/analytics.service';
import { disciplinaService } from '../services/api/disciplina.service';

type DisciplinaAtividade = { id: string; titulo: string; totalQuestoes?: number };
type DisciplinaDetail = any;

export const useDisciplinaAnalyticsViewModel = (disciplinaId?: string, professorId?: string) => {
  const [medias, setMedias] = useState<MediasAlunoDTO[]>([]);
  const [listas, setListas] = useState<ListaMenorMediaDTO[]>([]);
  const [atividades, setAtividades] = useState<AtividadesConcluidasDTO[]>([]);
  const [atividadesList, setAtividadesList] = useState<DisciplinaAtividade[]>([]);
  const [disciplina, setDisciplina] = useState<DisciplinaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!disciplinaId || !professorId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [m, l, a, d, ativ] = await Promise.all([
        analyticsService.getMediasAlunos(disciplinaId, professorId),
        analyticsService.getListasMenorMedia(disciplinaId, professorId),
        analyticsService.getAtividadesConcluidas(disciplinaId, professorId),
        disciplinaService.getDisciplina(disciplinaId),
        disciplinaService.getAtividades(disciplinaId),
      ]);
      setMedias(m || []);
      setListas(l || []);
      setAtividades(a || []);
      setDisciplina(d || null);
      setAtividadesList(ativ || []);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar analytics');
      console.error('Analytics error', err);
    } finally {
      setIsLoading(false);
    }
  }, [disciplinaId, professorId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    medias,
    listas,
    atividades,
    atividadesList,
    disciplina,
    isLoading,
    error,
    reload: loadAll,
  } as const;
};

export default useDisciplinaAnalyticsViewModel;
