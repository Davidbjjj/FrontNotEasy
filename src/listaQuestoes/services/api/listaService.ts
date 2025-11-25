import type { CreateListRequest, ListaResponseDTO } from '../../model/AddListButton.types';
import { getCurrentUser } from '../../../auth/auth';

const API_BASE_URL = 'http://localhost:8080';

export type EventoDTO = {
  id: string;
  title: string;
  deadline: string | null;
  disciplina: string;
  maxGrade: number | null;
};

export const listaService = {
  async criarListaComDisciplina(request: CreateListRequest): Promise<ListaResponseDTO> {
    const { titulo, professorId, disciplinaId } = request;
    
    const queryParams = new URLSearchParams({
      titulo: titulo, // Não precisa encodeURIComponent aqui, o URLSearchParams faz automaticamente
      professorId: professorId
    }).toString();

    const response = await fetch(`${API_BASE_URL}/listas/disciplina/${disciplinaId}?${queryParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao criar lista');
    }

    return response.json();
  },
  async getListsByProfessor(professorId: string): Promise<ListaResponseDTO[]> {
    // If the current logged role is INSTITUICAO, request institution lists instead
    // Prefer the centralized auth helper so token-decoding logic is consistent
    const current = getCurrentUser();
    const rawRole = (current?.role || localStorage.getItem('role') || '').toUpperCase();
    // If the logged role is INSTITUICAO, always use the instituicao id from the token (current.userId)
    // to avoid callers passing a professorId and accidentally requesting the professor endpoint.
    const effectiveUserId = rawRole === 'INSTITUICAO'
      ? ((current?.userId as string) || localStorage.getItem('userId') || '')
      : (professorId || (current?.userId as string) || localStorage.getItem('userId') || '');
    // Use the same role-aware logic as getEventos but for listas endpoints
    let endpoint = `${API_BASE_URL}/listas`;
    if (rawRole === 'PROFESSOR') {
      endpoint = `${API_BASE_URL}/listas/professor/${effectiveUserId}`;
    } else if (rawRole === 'INSTITUICAO') {
      endpoint = `${API_BASE_URL}/listas/instituicao/${effectiveUserId}`;
    }
    // Debug: log chosen endpoint for troubleshooting role-based routing
    try { console.debug('[listaService.getListsByProfessor] role=', rawRole, 'userId=', effectiveUserId, 'endpoint=', endpoint); } catch (e) {}

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('Erro ao carregar listas do professor');
    }
    return response.json();
  }
  ,
  /**
   * Busca eventos (atividades) do backend e normaliza o formato.
   * Endpoint: GET /eventos
   */
  async getEventos(): Promise<EventoDTO[]> {
    // Decide endpoint based on logged user role (professor/instituicao/estudante)
    const current = getCurrentUser();
    const rawRole = ((current?.role as string) || localStorage.getItem('role') || '').toUpperCase();
    const userId = (current?.userId as string) || localStorage.getItem('userId') || '';

    let endpoint = `${API_BASE_URL}/eventos`;
    if (rawRole === 'PROFESSOR' || rawRole === 'TEACHER') {
      endpoint = `${API_BASE_URL}/eventos/professor/${userId}`;
    } else if (rawRole === 'INSTITUICAO') {
      endpoint = `${API_BASE_URL}/eventos/instituicao/${userId}`;
    } else if (rawRole === 'ALUNO' || rawRole === 'ALUNO') {
      endpoint = `${API_BASE_URL}/eventos/estudante/${userId}`;
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao carregar eventos');
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((e: any) => ({
      id: e.idEvento ?? e.id ?? '',
      title: e.nomeEvento ?? e.nome ?? '',
      deadline: e.prazo ?? e.dataEntrega ?? null,
      disciplina: e.nomeDisciplina ?? (e.disciplina?.nome ?? ''),
      maxGrade: e.notaMaxima ?? e.nota_maxima ?? null,
    }));
  }
  ,
  async getNotasPorLista(listaId: string): Promise<Array<{ nomeEstudante: string; nota: number }>> {
    const response = await fetch(`${API_BASE_URL}/listas/${listaId}/notas`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao carregar notas da lista');
    }
    return response.json();
  }
};