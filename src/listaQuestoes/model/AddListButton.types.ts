export interface AddListButtonProps {
  className?: string;
  professorId: string; // UUID do professor logado
}

export interface CreateListRequest {
  titulo: string;
  professorId: string;
  disciplinaId: string;
}

export interface ListaResponseDTO {
  id: string;
  titulo: string;
  professorNome: string;
}

export interface DisciplinaProfessorResponseDTO {
  id: string;
  nome: string;
  professorNome: string;
  instituicaoNome: string;
}