import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import eventoService from '../services/api/eventoService';

export interface Student {
  id?: string;
  nomeEstudante?: string;
  nota?: number;
  estudanteId?: string | null;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
  list?: {
    title: string;
    grade: string;
  };
  disciplina?: {
    nome: string;
  };
  professor?: {
    nome: string;
  };
  notas?: Student[];
}

/**
 * Hook customizado para gerenciar estado da atividade
 */
export const useActivity = () => {
  const { id } = useParams();
  const location = useLocation();
  const [activity, setActivity] = useState<Activity>(() => ({
    id: id ?? '',
    title: '',
    description: '',
    deadline: '',
    status: '',
    list: undefined,
  }));

  useEffect(() => {
    let mounted = true;

    const applyStateActivity = (stateObj: any) => {
      try {
        if (!stateObj || typeof stateObj !== 'object') return false;
        if (stateObj.activity && typeof stateObj.activity === 'object') {
          setActivity((prev) => ({ ...prev, ...stateObj.activity }));
          return true;
        }
        if (stateObj.id || stateObj.title) {
          setActivity((prev) => ({ ...prev, ...stateObj }));
          return true;
        }
      } catch (e) {
        // ignore
      }
      return false;
    };

    const state = (location as any)?.state;
    if (applyStateActivity(state)) return;

    // If no state, try fetching from API when id is available
    (async () => {
      if (!id) return;
      try {
        const ev: any = await eventoService.getEvento(id);
        if (!mounted) return;
        // Map API response to Activity shape (best-effort)
        const mapped: Activity = {
          id: ev.id ?? ev.idEvento ?? String(id),
          title: ev.titulo ?? ev.nomeEvento ?? ev.title ?? '',
          description: ev.descricao ?? ev.description ?? ev.descricaoEvento ?? '',
          deadline: ev.prazo ?? ev.data ?? ev.deadline ?? '',
          status: ev.status ?? '',
          list: ev.lista ? { title: ev.lista.titulo || ev.lista.title || '', grade: ev.lista.grade || '' } : undefined,
          disciplina: ev.nomeDisciplina ? { nome: ev.nomeDisciplina } : ev.disciplina ?? undefined,
          professor: ev.professor ?? undefined,
        };
        setActivity(mapped);
      } catch (err) {
        // On error, keep empty fields (no mock text)
        console.warn('Erro ao buscar atividade pelo id:', err);
      }
    })();

    return () => { mounted = false; };
  }, [id, location]);

  return activity;
};
