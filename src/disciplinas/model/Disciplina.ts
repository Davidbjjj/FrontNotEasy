/**
 * Tipos para o domínio de Disciplinas
 */

export interface Disciplina {
  id: string;
  nome: string;
  nomeProfessor: string;
  nomeEscola: string;
  alunos: string[];
}

export type DisciplinaDTO = Disciplina;
