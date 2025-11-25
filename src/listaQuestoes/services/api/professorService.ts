import type { DisciplinaProfessorResponseDTO } from '../../model/AddListButton.types';
import { getCurrentUser } from '../../../auth/auth';

const API_BASE_URL = 'http://localhost:8080';

export const professorService = {
  async getDisciplinasByProfessor(professorId: string): Promise<DisciplinaProfessorResponseDTO[]> {
    const current = getCurrentUser();
    const rawRole = (current?.role || localStorage.getItem('role') || '').toUpperCase();
    const effectiveUserId = rawRole === 'INSTITUICAO'
      ? ((current?.userId as string) || localStorage.getItem('userId') || '')
      : (professorId || (current?.userId as string) || localStorage.getItem('userId') || '');
    const endpoint = rawRole === 'INSTITUICAO'
      ? `${API_BASE_URL}/listas/instituicao/${effectiveUserId}/disciplinas`
      : `${API_BASE_URL}/listas/professor/${effectiveUserId}/disciplinas`;

    try { console.debug('[professorService.getDisciplinasByProfessor] role=', rawRole, 'userId=', effectiveUserId, 'endpoint=', endpoint); } catch (e) {}

    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar disciplinas');
    }

    return response.json();
  },
};