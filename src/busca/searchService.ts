import api from '../services/apiClient';
import { SearchGroup, SearchItem, SearchResponse, SearchType } from './types';
import { SEARCH_TYPE_ORDER } from './searchScope';

/**
 * Contrato com o back-end: ver docs/search-api.md.
 * Enquanto o endpoint não existe, o mock abaixo responde no lugar dele.
 * Para usar a API real: REACT_APP_SEARCH_MOCK=false
 */
const USE_MOCK = process.env.REACT_APP_SEARCH_MOCK !== 'false';

export interface SearchParams {
  q: string;
  /** Tipos permitidos ao papel do usuário */
  types: SearchType[];
  /** Itens por grupo */
  limit: number;
}

export interface SearchService {
  search(params: SearchParams, signal?: AbortSignal): Promise<SearchResponse>;
}

const httpService: SearchService = {
  async search({ q, types, limit }, signal) {
    const { data } = await api.get<SearchResponse>('/busca', {
      params: { q, tipos: types.join(','), limite: limit },
      signal,
    });
    return data;
  },
};

// ---------- Mock ----------
const CATALOG: SearchItem[] = [
  { id: '1', type: 'LISTA', title: 'Lista 1 — Funções', subtitle: 'Matemática', link: '/listas' },
  { id: '2', type: 'LISTA', title: 'Lista 2 — Geometria plana', subtitle: 'Matemática', link: '/listas' },
  { id: '3', type: 'LISTA', title: 'Lista 3 — Cinemática', subtitle: 'Física', link: '/listas' },
  { id: '4', type: 'LISTA', title: 'Lista 4 — Leis de Newton', subtitle: 'Física', link: '/listas' },
  { id: '5', type: 'LISTA', title: 'Lista 5 — Termologia', subtitle: 'Física', link: '/listas' },
  { id: '6', type: 'LISTA', title: 'Lista 6 — Estequiometria', subtitle: 'Química', link: '/listas' },
  { id: '7', type: 'LISTA', title: 'Lista 7 — Interpretação de texto', subtitle: 'Português', link: '/listas' },
  { id: '1', type: 'QUESTAO', title: 'Calcule a derivada de f(x) = x²', subtitle: 'Matemática', link: '/questoes' },
  { id: '2', type: 'QUESTAO', title: 'Qual a aceleração de um corpo em queda livre?', subtitle: 'Física', link: '/questoes' },
  { id: '3', type: 'QUESTAO', title: 'Balanceie a equação da combustão do metano', subtitle: 'Química', link: '/questoes' },
  { id: '1', type: 'DISCIPLINA', title: 'Matemática', subtitle: 'Turma A', link: '/disciplinas/1' },
  { id: '2', type: 'DISCIPLINA', title: 'Física', subtitle: 'Turma A', link: '/disciplinas/2' },
  { id: '3', type: 'DISCIPLINA', title: 'Química', subtitle: 'Turma B', link: '/disciplinas/3' },
  { id: '1', type: 'ALUNO', title: 'Ana Souza', subtitle: 'ana.souza@escola.com', link: '/disciplinas' },
  { id: '2', type: 'ALUNO', title: 'Bruno Lima', subtitle: 'bruno.lima@escola.com', link: '/disciplinas' },
  { id: '3', type: 'ALUNO', title: 'Carla Mendes', subtitle: 'carla.mendes@escola.com', link: '/disciplinas' },
];

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const mockService: SearchService = {
  async search({ q, types, limit }) {
    const needle = norm(q);
    const groups: SearchGroup[] = [];
    for (const type of SEARCH_TYPE_ORDER) {
      if (!types.includes(type)) continue;
      const hits = CATALOG.filter(
        (i) => i.type === type && norm(`${i.title} ${i.subtitle ?? ''}`).includes(needle)
      );
      if (hits.length) groups.push({ type, items: hits.slice(0, limit), total: hits.length });
    }
    return new Promise((r) => setTimeout(() => r({ groups }), 200));
  },
};

export const searchService: SearchService = USE_MOCK ? mockService : httpService;
