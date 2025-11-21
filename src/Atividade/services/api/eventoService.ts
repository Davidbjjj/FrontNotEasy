const API_BASE_URL = 'http://localhost:8080';

export interface CriarEventoPayload {
  titulo: string;
  descricao: string;
  notaMaxima: number;
  data: string;
  disciplinaId: string;
  arquivos?: string[];
}

export interface EventoResponse {
  idEvento: number | string;
  nomeEvento?: string;
  data?: string;
  disciplina?: string;
  professor?: any;
}

export interface NotaResponseDTO {
  id: number;
  nota: number;
  nomeEstudante?: string;
  aluno?: {
    cpf?: string;
    nome?: string;
    email?: string;
  };
  evento?: any;
}

export const eventoService = {
  async criarEvento(payload: CriarEventoPayload): Promise<EventoResponse> {
    const response = await fetch(`${API_BASE_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao criar evento');
    }
    return response.json();
  },

  async associarLista(eventoId: string | number, listaId: string | number) {
    // API expects payload: { listaId, eventoId }
    const payload = {
      listaId: String(listaId),
      eventoId: String(eventoId),
    };

    const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}/listas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao associar lista ao evento');
    }
    return response.json();
  },

  async getNotasEvento(eventoId: string | number): Promise<NotaResponseDTO[]> {
    const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}/notas`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao buscar notas do evento');
    }
    return response.json();
  },

  async getRespostasComNota(eventoId: string | number, listaId: string | number, estudanteId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/eventos/eventos/${eventoId}/listas/${listaId}/estudantes/${estudanteId}/respostas`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao buscar respostas com nota');
    }
    return response.json();
  },

  async getEvento(eventoId: string | number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao buscar detalhes do evento');
    }
    return response.json();
  }
};

export default eventoService;
