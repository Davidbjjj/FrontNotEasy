import type { CreateListRequest, ListaResponseDTO } from '../../model/AddListButton.types';

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
    const response = await fetch(`${API_BASE_URL}/listas/professor/${professorId}`);
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
    const response = await fetch(`${API_BASE_URL}/eventos`);
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