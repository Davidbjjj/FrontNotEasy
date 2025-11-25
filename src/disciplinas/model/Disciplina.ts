/**
 * Tipos para o domínio de Disciplinas
 */

export interface Disciplina {
  id: string;
  nome: string;
  nomeProfessor: string;
  nomeEscola: string;
  alunos?: string[];
  quantidadeAlunos?: number;
}

export type DisciplinaDTO = Disciplina;
