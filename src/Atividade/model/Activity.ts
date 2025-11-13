/**
 * Models da feature Atividade seguindo padrão MVVM
 * Consolidação única de tipos para toda a aplicação
 */

// ===== ENTIDADES DE DOMÍNIO =====

export interface Activity {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  status?: string;
  completed?: boolean;
  // Campos legados (manter compatibilidade)
  subject?: string;
  class?: string;
  // Relacionamentos
  list?: ActivityList;
  disciplina?: Disciplina;
  professor?: Professor;
  notas?: StudentGrade[];
  // Variantes de API
  nomeEvento?: string;
  descricao?: string;
  prazo?: string;
  listas?: ActivityList[];
  lista?: ActivityList;
  listaId?: string | number;
  idLista?: string | number;
}

export interface ActivityList {
  id?: string | number;
  idLista?: string | number;
  title?: string;
  titulo?: string;
  nome?: string;
  grade?: string;
  valor?: number;
}

export interface Disciplina {
  id?: string;
  nome: string;
}

export interface Professor {
  id?: string;
  nome: string;
}

export interface Student {
  id?: string;
  nomeEstudante?: string;
  nome?: string;
  nomeAluno?: string;
  estudanteId?: string | null;
  alunoId?: string;
  aluno?: StudentDetails;
}

export interface StudentDetails {
  id?: string;
  nome?: string;
  cpf?: string;
  email?: string;
}

export interface StudentGrade extends Student {
  nota?: number;
  valor?: number;
}

export interface Response {
  questaoId?: string;
  resposta?: string;
  correta?: boolean;
  acertou?: boolean;
}

export interface StudentResponses {
  tituloLista?: string;
  listaId?: string;
  notaLista?: number;
  nota?: number;
  porcentagemAcertos?: number;
  totalQuestoes?: number;
  questõesRespondidas?: number;
  questoesRespondidas?: number;
  respondidas?: number;
  questõesCorretas?: number;
  questoesCorretas?: number;
  corretas?: number;
  respostas?: Response[];
}

// ===== DTOs e Props =====

export interface ActivityListProps {
  activities: Activity[];
  onToggleActivity?: (id: string, completed: boolean) => void;
  onCreateActivity?: (activity: Activity) => void;
}

export interface ActivityDetailPageProps {
  isProfessor: boolean;
}