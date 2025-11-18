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

  /**
   * Buscar estudantes disponíveis para adicionar à disciplina
   * GET /disciplinas/{disciplinaId}/estudantes
   */
  async getAvailableStudents(disciplinaId: string): Promise<any[]> {
    if (!disciplinaId) throw new Error('disciplinaId é obrigatório');
    try {
      const resp = await api.get(`${this.baseURL}/${disciplinaId}/estudantes`);
      return resp.data || [];
    } catch (err) {
      console.error('Erro ao buscar estudantes disponíveis:', err);
      throw err;
    }
  }

  /**
   * Adiciona um estudante à disciplina
   * POST /disciplinas/{disciplinaId}/adicionar-estudante/{estudanteId}
   */
  async addStudentToDisciplina(disciplinaId: string, estudanteId: string): Promise<any> {
    if (!disciplinaId || !estudanteId) throw new Error('disciplinaId e estudanteId são obrigatórios');
    try {
      const resp = await api.post(`${this.baseURL}/${disciplinaId}/adicionar-estudante/${estudanteId}`);
      return resp.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Erro ao adicionar estudante';
      console.error('Erro ao adicionar estudante:', message);
      throw new Error(message);
    }
  }

  /**
   * Busca informações completas da disciplina
   * GET /disciplinas/{disciplinaId}
   */
  async getDisciplina(disciplinaId: string): Promise<any> {
    if (!disciplinaId) throw new Error('disciplinaId é obrigatório');
    try {
      const resp = await api.get(`${this.baseURL}/${disciplinaId}`);
      return resp.data;
    } catch (err) {
      console.error('Erro ao buscar disciplina:', err);
      throw err;
    }
  }

  /**
   * Lista atividades da disciplina
   * GET /disciplinas/{disciplinaId}/atividades
   */
  async getAtividades(disciplinaId: string): Promise<any[]> {
    if (!disciplinaId) throw new Error('disciplinaId é obrigatório');
    try {
      const resp = await api.get(`${this.baseURL}/${disciplinaId}/atividades`);
      return resp.data || [];
    } catch (err) {
      console.error('Erro ao buscar atividades da disciplina:', err);
      throw err;
    }
  }
}

export const disciplinaService = new DisciplinaService();
