import type { DisciplinaProfessorResponseDTO } from '../../model/AddListButton.types';

const API_BASE_URL = 'http://localhost:8080';

export const professorService = {
  async getDisciplinasByProfessor(professorId: string): Promise<DisciplinaProfessorResponseDTO[]> {
    const response = await fetch(`${API_BASE_URL}/listas/professor/${professorId}/disciplinas`);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar disciplinas');
    }

    return response.json();
  },
};