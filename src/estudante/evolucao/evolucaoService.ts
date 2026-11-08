import api from '../../services/apiClient';
import type { ErradasAssunto, Evolucao } from './types';

/**
 * Contrato com o back-end: ver docs/evolution-api.md.
 * Enquanto os endpoints não existem, o mock responde. API real: REACT_APP_EVOLUTION_MOCK=false
 */
const USE_MOCK = process.env.REACT_APP_EVOLUTION_MOCK !== 'false';

export interface EvolucaoService {
  get(estudanteId: string, signal?: AbortSignal): Promise<Evolucao>;
  erradas(estudanteId: string, assuntoId: string, signal?: AbortSignal): Promise<ErradasAssunto>;
}

const httpService: EvolucaoService = {
  async get(estudanteId, signal) {
    const { data } = await api.get<Evolucao>(`/estudante/${encodeURIComponent(estudanteId)}/evolucao`, { signal });
    return data;
  },
  async erradas(estudanteId, assuntoId, signal) {
    const { data } = await api.get<ErradasAssunto>(
      `/estudante/${encodeURIComponent(estudanteId)}/assuntos/${encodeURIComponent(assuntoId)}/erradas`,
      { signal }
    );
    return data;
  },
};

const DAY = 86_400_000;
function delay<T>(v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), 250));
}

const mockService: EvolucaoService = {
  async get() {
    const now = Date.now();
    const iso = (d: number) => new Date(now - d * DAY).toISOString();
    return delay<Evolucao>({
      disciplinas: [
        { id: 'd1', nome: 'Matemática' },
        { id: 'd2', nome: 'Física' },
        { id: 'd3', nome: 'Português' },
      ],
      notas: [
        { listaId: 'l-a', titulo: 'Lista 0 — Revisão', disciplinaId: 'd1', data: iso(60), nota: 5, notaMaxima: 10 },
        { listaId: 'l-b', titulo: 'Lista 1 — Funções', disciplinaId: 'd1', data: iso(45), nota: 6.5, notaMaxima: 10 },
        { listaId: 'l-c', titulo: 'Lista 8 — Leitura', disciplinaId: 'd3', data: iso(40), nota: 9, notaMaxima: 10 },
        { listaId: 'l-d', titulo: 'Lista 9 — Ótica', disciplinaId: 'd2', data: iso(30), nota: 12, notaMaxima: 20 },
        { listaId: 'l-e', titulo: 'Lista 2 — Geometria', disciplinaId: 'd1', data: iso(18), nota: 7.5, notaMaxima: 10 },
        { listaId: 'l-f', titulo: 'Lista 10 — Dinâmica', disciplinaId: 'd2', data: iso(9), nota: 7, notaMaxima: 10 },
        { listaId: 'l-g', titulo: 'Lista 3 — Trigonometria', disciplinaId: 'd1', data: iso(2), nota: 8.5, notaMaxima: 10 },
      ],
      assuntos: [
        { id: 'a1', nome: 'Função afim', disciplinaId: 'd1', acertos: 9, total: 10 },
        { id: 'a2', nome: 'Função quadrática', disciplinaId: 'd1', acertos: 3, total: 8 },
        { id: 'a3', nome: 'Geometria plana', disciplinaId: 'd1', acertos: 5, total: 8 },
        { id: 'a4', nome: 'Ótica', disciplinaId: 'd2', acertos: 4, total: 6 },
        { id: 'a5', nome: 'Cinemática', disciplinaId: 'd2', acertos: 2, total: 6 },
        { id: 'a6', nome: 'Interpretação de texto', disciplinaId: 'd3', acertos: 7, total: 8 },
      ],
    });
  },
  async erradas(_estudanteId, assuntoId) {
    return delay<ErradasAssunto>({
      assunto: { id: assuntoId, nome: 'Função quadrática' },
      disciplina: 'Matemática',
      questoes: [
        {
          questaoId: 'q2', listaId: 'l1', listaTitulo: 'Lista 1 — Funções', numero: 2,
          enunciado: 'Quais são as raízes de x² − 5x + 6 = 0?',
          alternativas: ['1 e 6', '2 e 3', '−2 e −3', '5 e 6'], minhaResposta: 0, respostaCerta: 1,
          explicacao: 'Soma = 5 e produto = 6, logo as raízes são 2 e 3.',
        },
        {
          questaoId: 'q3', listaId: 'l1', listaTitulo: 'Lista 1 — Funções', numero: 3,
          enunciado: 'Qual é a coordenada x do vértice de y = x² − 4x + 1?',
          alternativas: ['−2', '2', '4', '1'], minhaResposta: null, respostaCerta: 1,
          explicacao: null,
        },
      ],
    });
  },
};

export const evolucaoService: EvolucaoService = USE_MOCK ? mockService : httpService;
