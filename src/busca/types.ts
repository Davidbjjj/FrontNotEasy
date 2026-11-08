export type SearchType = 'LISTA' | 'QUESTAO' | 'ALUNO' | 'DISCIPLINA';

export interface SearchItem {
  id: string;
  type: SearchType;
  title: string;
  subtitle?: string | null;
  /** Rota do front do item (começa com `/`) */
  link: string;
}

export interface SearchGroup {
  type: SearchType;
  items: SearchItem[];
  /** Total de correspondências no servidor (pode ser maior que items.length) */
  total: number;
}

export interface SearchResponse {
  groups: SearchGroup[];
}
