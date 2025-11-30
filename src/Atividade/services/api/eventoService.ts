const API_BASE_URL = 'https://backnoteasy-production.up.railway.app';

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

export interface EntregaPayload {
  statusEntrega: 'ENTREGUE' | 'PENDENTE' | string;
  comentarioEntrega?: string;
  arquivosEntrega?: string[];
}

export interface EventoResumoRaw {
  idEvento?: number | string;
  nomeEvento?: string;
  prazo?: string; // expected YYYY-MM-DD
  'descrição'?: string;
  nomeDisciplina?: string;
  ['nota do aluno']?: string; // can be empty string
  status?: 'pendente' | 'entregue' | string;
}

export interface EventoResumo {
  idEvento: number | string;
  nomeEvento: string;
  prazo: string; // keep original string
  prazoDate?: Date; // parsed Date
  descricao?: string;
  nomeDisciplina?: string;
  notaAluno?: string; // normalized key
  status: 'pendente' | 'entregue' | string;
}

export class ApiError extends Error {
  status?: number;
  body?: any;
  constructor(message: string, status?: number, body?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function normalizeResumo(raw: EventoResumoRaw): EventoResumo {
  const idEvento = raw.idEvento ?? (raw as any)['id_evento'] ?? '';
  const nomeEvento = raw.nomeEvento ?? (raw as any)['nomeEvento'] ?? '';
  const prazo = raw.prazo ?? (raw as any)['prazo'] ?? '';
  const descricao = raw['descrição'] ?? (raw as any)['descricao'] ?? (raw as any)['descricaoEvento'] ?? '';
  const nomeDisciplina = raw.nomeDisciplina ?? (raw as any)['nome_disciplina'] ?? '';
  const notaAluno = raw['nota do aluno'] ?? (raw as any)['notaAluno'] ?? '';
  const status = raw.status ?? 'pendente';

  let prazoDate: Date | undefined = undefined;
  if (prazo) {
    const d = new Date(prazo);
    if (!isNaN(d.getTime())) prazoDate = d;
  }

  return {
    idEvento,
    nomeEvento,
    prazo,
    prazoDate,
    descricao,
    nomeDisciplina,
    notaAluno,
    status,
  };
}

export const eventoService = {
  async criarEvento(payload: CriarEventoPayload): Promise<EventoResponse> {
    // Get token from localStorage (saved during login)
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const response = await fetch(`${API_BASE_URL}/eventos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
  ,

  /**
   * Entrega um evento/atividade para um estudante.
   * POST /eventos/{eventoId}/alunos/{estudanteId}/entrega
   * payload example:
   * { statusEntrega: 'ENTREGUE', comentarioEntrega: 'Entregue via app', arquivosEntrega?: ['https://...'] }
   */
  async entregarEvento(
    eventoId: string | number,
    estudanteId: string | number,
    payload: EntregaPayload
  ): Promise<any> {
    const url = `${API_BASE_URL}/eventos/${eventoId}/alunos/${estudanteId}/entregar`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(text || 'Erro ao enviar entrega', response.status);
    }

    return response.json();
  },

  /**
   * Busca o resumo do evento para um estudante e normaliza os campos.
   * - Trata 404 lançando ApiError com status 404
   * - Em caso de 5xx faz retry exponencial com jitter
   */
  async getResumoEventoParaAluno(
    eventoId: string | number,
    estudanteId: string | number,
    options?: { maxRetries?: number; retryDelayMs?: number }
  ): Promise<EventoResumo> {
    const maxRetries = options?.maxRetries ?? 3;
    const baseDelay = options?.retryDelayMs ?? 300; // ms

    const url = `${API_BASE_URL}/eventos/${eventoId}/alunos/${estudanteId}/resumo`;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, { method: 'GET' });

        if (response.status === 404) {
          const text = await response.text();
          throw new ApiError(text || 'Resumo não encontrado', 404);
        }

        if (response.status >= 500 && response.status < 600) {
          const text = await response.text();
          // throw to trigger retry
          throw new ApiError(text || 'Erro no servidor', response.status);
        }

        if (!response.ok) {
          const text = await response.text();
          throw new ApiError(text || 'Erro ao buscar resumo do evento', response.status);
        }

        const raw: EventoResumoRaw = await response.json();
        return normalizeResumo(raw);
      } catch (err: any) {
        // If it's a 404, don't retry
        if (err instanceof ApiError && err.status === 404) {
          throw err;
        }

        const isServerError = err instanceof ApiError && err.status && err.status >= 500 && err.status < 600;

        if (attempt < maxRetries && (isServerError || err.name === 'TypeError')) {
          const jitter = Math.floor(Math.random() * 100);
          const delay = Math.pow(2, attempt) * baseDelay + jitter;
          await new Promise((res) => setTimeout(res, delay));
          continue; // retry
        }

        // give up
        if (err instanceof ApiError) throw err;
        throw new ApiError(err?.message || 'Erro desconhecido ao buscar resumo', undefined, err);
      }
    }
    throw new ApiError('Máximo de tentativas excedido ao buscar resumo do evento');
  }
};

export default eventoService;
