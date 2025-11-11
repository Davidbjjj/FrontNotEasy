import { useParams, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

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
  
  const mockActivity: Activity = {
    id: id || 'exemplo-123',
    title: 'Atividade: Matemática',
    description: 'A descrição da atividade vai aqui',
    deadline: '20 de abril',
    status: 'Pendentes',
    list: { title: 'Lista de exercícios 1', grade: '8,5' }
  };

  const getActivityFromState = useCallback((): Activity => {
    try {
      const state = (location as any)?.state;
      if (!state || typeof state !== 'object') return mockActivity;
      
      if (state.activity && typeof state.activity === 'object') {
        return { ...mockActivity, ...state.activity };
      } else if (state.id || state.title) {
        return { ...mockActivity, ...state };
      }
    } catch (err) {
      console.warn('Erro ao processar estado da atividade:', err);
    }
    
    return mockActivity;
  }, [location, mockActivity]);

  return getActivityFromState();
};
