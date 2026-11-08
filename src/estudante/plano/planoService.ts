import api from '../../services/apiClient';
import type { PlanoRevisao } from './types';

/**
 * Contrato com o back-end: ver docs/review-plan-api.md.
 * Enquanto os endpoints não existem, o mock responde. API real: REACT_APP_REVIEW_PLAN_MOCK=false
 */
const USE_MOCK = process.env.REACT_APP_REVIEW_PLAN_MOCK !== 'false';

export interface PlanoService {
  get(estudanteId: string, signal?: AbortSignal): Promise<PlanoRevisao>;
  marcarRevisado(estudanteId: string, assuntoId: string, revisado: boolean): Promise<{ revisadoEm: string | null }>;
}

const base = (estudanteId: string) => `/estudante/${encodeURIComponent(estudanteId)}/plano-revisao`;

const httpService: PlanoService = {
  async get(estudanteId, signal) {
    const { data } = await api.get<PlanoRevisao>(base(estudanteId), { signal });
    return data;
  },
  async marcarRevisado(estudanteId, assuntoId, revisado) {
    const { data } = await api.put<{ revisadoEm: string | null }>(
      `${base(estudanteId)}/assuntos/${encodeURIComponent(assuntoId)}/revisado`,
      { revisado }
    );
    return data;
  },
};

function delay<T>(v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), 250));
}

// O mock guarda o "revisado" em memória para a demonstração funcionar de ponta a ponta.
const mockRevisados = new Map<string, string>();

const mockService: PlanoService = {
  async get() {
    const itens = [
      { assuntoId: 'a2', nome: 'Função quadrática', disciplina: 'Matemática', motivo: '5 erros nas últimas 2 listas. Você confundiu soma e produto das raízes.', erros: 5, listas: 2 },
      { assuntoId: 'a5', nome: 'Cinemática', disciplina: 'Física', motivo: '4 erros nas últimas 2 listas, a maioria em movimento uniformemente variado.', erros: 4, listas: 2 },
      { assuntoId: 'a3', nome: 'Geometria plana', disciplina: 'Matemática', motivo: '3 erros na última lista, em cálculo de áreas.', erros: 3, listas: 1 },
    ];
    return delay<PlanoRevisao>({
      geradoEm: new Date().toISOString(),
      assuntos: itens.map((a) => ({
        ...a,
        revisado: mockRevisados.has(a.assuntoId),
        revisadoEm: mockRevisados.get(a.assuntoId) ?? null,
      })),
    });
  },
  async marcarRevisado(_estudanteId, assuntoId, revisado) {
    const revisadoEm = revisado ? new Date().toISOString() : null;
    if (revisadoEm) mockRevisados.set(assuntoId, revisadoEm);
    else mockRevisados.delete(assuntoId);
    return delay({ revisadoEm });
  },
};

export const planoService: PlanoService = USE_MOCK ? mockService : httpService;
