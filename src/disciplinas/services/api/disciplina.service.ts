/**
 * Serviço de API para Disciplinas
 * Gerencia requisições de disciplinas com endpoints role-aware
 */

import api from '../../../services/apiClient';
import type { Disciplina } from '../../model/Disciplina';

class DisciplinaService {
  private baseURL = '/disciplinas';

  /**
   * Busca disciplinas baseado na role do usuário
   * Professores: GET /disciplinas/professor/{professorId}
   * Estudantes: GET /disciplinas/estudante/{estudanteId}
   */
  async getDisciplinas(userId: string, role: string): Promise<Disciplina[]> {
    if (!userId) {
      throw new Error('UserId é obrigatório');
    }

    const normalizedRole = (role || '').toUpperCase();
    
    let endpoint: string;
    if (normalizedRole === 'PROFESSOR') {
      endpoint = `${this.baseURL}/professor/${userId}`;
    } else if (normalizedRole === 'ESTUDANTE') {
      endpoint = `${this.baseURL}/estudante/${userId}`;
    } else {
      throw new Error('Role inválida. Use PROFESSOR ou ESTUDANTE');
    }

    try {
      const response = await api.get<Disciplina[]>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error(`Erro ao buscar disciplinas (${normalizedRole}):`, error);
      throw error;
    }
  }
}

export const disciplinaService = new DisciplinaService();
