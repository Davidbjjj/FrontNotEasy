import type { DisciplinaProfessorResponseDTO } from '../../model/AddListButton.types';

const API_BASE_URL = 'https://backnoteasy-production.up.railway.app';

export const professorService = {
  async getDisciplinasByProfessor(professorId: string): Promise<DisciplinaProfessorResponseDTO[]> {
    const response = await fetch(`${API_BASE_URL}/listas/professor/${professorId}/disciplinas`);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar disciplinas');
    }

    return response.json();
  },
};