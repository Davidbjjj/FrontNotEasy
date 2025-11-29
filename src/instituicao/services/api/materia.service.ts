import api from '../../../services/apiClient';

export interface Materia {
  id: string;
  nome: string;
}

const materiaService = {
  /**
   * Fetch all matérias (subjects) available for the institution
   */
  async getMaterias(instituicaoId: string): Promise<Materia[]> {
    try {
      const response = await api.get<Materia[]>(`/disciplinas/instituicao/${instituicaoId}`);
      return response.data || [];
    } catch (error: any) {
      console.error('Erro ao buscar matérias:', error);
      throw new Error(error?.response?.data?.message || error.message || 'Erro ao buscar matérias');
    }
  },
};

export default materiaService;
