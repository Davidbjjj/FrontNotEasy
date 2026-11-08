import { SearchType } from './types';

export const SEARCH_TYPE_ORDER: SearchType[] = ['LISTA', 'QUESTAO', 'DISCIPLINA', 'ALUNO'];

export const SEARCH_TYPE_LABEL: Record<SearchType, string> = {
  LISTA: 'Listas',
  QUESTAO: 'Questões',
  DISCIPLINA: 'Disciplinas',
  ALUNO: 'Alunos',
};

/**
 * O que cada papel pode ver na busca. O back-end deve aplicar a mesma regra
 * (ver docs/search-api.md); aqui evitamos pedir e exibir o que o papel não vê.
 * Aluno não vê outros alunos nem o banco de questões; instituição não gerencia
 * listas/questões.
 */
const SCOPE: Record<string, SearchType[]> = {
  ALUNO: ['LISTA', 'DISCIPLINA'],
  PROFESSOR: ['LISTA', 'QUESTAO', 'DISCIPLINA', 'ALUNO'],
  INSTITUICAO: ['DISCIPLINA', 'ALUNO'],
};

export function searchTypesForRole(role?: string | null): SearchType[] {
  return SCOPE[String(role ?? '').toUpperCase()] ?? [];
}
